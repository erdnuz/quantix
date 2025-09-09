import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from MarketDataManager import MarketDataManager
import numpy as np
from currency import CurrencyConverter
import time


def get_pnl(actions, prices: pd.Series):
    actions_list = []
    prices.index = pd.to_datetime(prices.index).strftime('%Y-%m-%d')
    prices = prices.groupby(prices.index).last() 

    # Convert actions dictionary keys to the same format
    actions = {pd.to_datetime(k).strftime('%Y-%m-%d'): v for k, v in actions.items()}
    complete_date_range = pd.date_range(start=prices.index.min(), end=pd.Timestamp.now()).strftime('%Y-%m-%d')
    prices = prices.reindex(complete_date_range, method=None).ffill()  # This will create missing values for weekends

    avg_buy = (0, 0)
    df = pd.DataFrame({'price': prices, 'num_shares': 0, 'cash_diffs': 0.0}, index=prices.index).dropna()  # Set initial cash_diffs to 0.0
    for day in actions:
        
        shares = int(actions[day])
        price = df.loc[day, 'price']
        cost = shares * df.loc[day, 'price']
        df.loc[day:, 'num_shares'] += shares  # Update holdings
        df.loc[day:, 'cash_diffs'] -= cost 
        if shares > 0:
            
            avg_buy = (avg_buy[0] + shares, (avg_buy[0] *avg_buy[1] + cost) / (avg_buy[0] + shares))
        else:
            avg_buy = (avg_buy[0] + shares,avg_buy[1])
        actions_list.append({
            'shares': abs(shares),
            'date': day,
            'action': 1 if shares > 0 else 0,
            'price':price,
        })
        
    value = df['num_shares'] * df['price']
    return  (value + df['cash_diffs'], value.iloc[-1], df['cash_diffs'].iloc[-1], actions_list, df['num_shares'].iloc[-1], df['price'].iloc[-1], avg_buy[1] )

def get_df(tickers, db):
    doc_refs = [db.collection("assets").document(ticker.replace('.', '%@')) for ticker in tickers]
    docs = db.get_all(doc_refs)

    data = []
    for doc in docs:
        if doc.exists:
            doc_data = doc.to_dict()
            doc_data['ticker'] = doc.id.replace('%@', '.') # Use the document id as ticker
            data.append(doc_data)

    if not data:
        return pd.DataFrame()
    data = pd.DataFrame(data)
    data.set_index('ticker', inplace=True)
    
    return data



class Portfolio:
    def __init__(self, tickers, initial_cash, db, m_data=None):

        self.tickers = tickers
        self.holdings = pd.DataFrame()
        self.db = db
        self.m_data = m_data
        self.weights = {}
        self.contrib = {}
        self.num = {}
        self.price = {}
        self.avg_buy = {}
        self.initial = initial_cash
        self.cash = initial_cash
        self.actions = []
        
        all_dates = set()

        tickers = {t:v for t, v in tickers.items() if len(v.keys()) > 0}
        if len(tickers)==0: 
            return None
        for ticker, actions in tickers.items():
            all_dates.update(pd.to_datetime(date).strftime('%Y-%m-%d') for date in actions)
        
        min_date = (datetime.strptime(min(all_dates), '%Y-%m-%d') - timedelta(weeks=1)).strftime('%Y-%m-%d')

        prices = yf.download(list(tickers.keys()), start=min_date, interval='1d')['Close'].ffill()

        for ticker, actions in tickers.items():
            if actions:
                actions_dict = {pd.to_datetime(date).strftime('%Y-%m-%d'): change for date, change in actions.items()}

                if '.' in ticker:
                    t = yf.Ticker(ticker)
                    currency = t.info.get("currency", t.info.get("financialCurrency", "USD")).upper().replace('ZAC', "ZAR").replace('ILA', 'ILS')
                    rate = CurrencyConverter(currency).convert(1) if currency != "USD" else 1
                else:
                    rate = 1

                p = prices[ticker] * rate
                
                if len(p.dropna()) < 1:
                    p = rate*yf.Ticker(ticker).history(period='max', interval='1h')['Close'].ffill()
                
                if len(p.dropna()) >0:
                    pnl, value, cash, lst, num, price, avg_buy = get_pnl(actions_dict, p)

                    self.cash += cash
                    self.holdings[ticker] = pnl
                    self.contrib[ticker] = pnl.iloc[-1]
                    self.weights[ticker] = value
                    self.avg_buy[ticker] = avg_buy
                    self.num[ticker] = num
                    self.price[ticker]= price
                    self.actions += [a | {'ticker':ticker} for a in lst]

        value = (self.holdings.sum(axis=1) + initial_cash)
        self.holdings['portfolio'] = value / initial_cash
        self.value = value.iloc[-1] if len(value)>0 else 0
     


    def get_returns(self):
        value = self.holdings['portfolio']
        if len(value)>1:
            curr = value.iloc[-1]

            all_time = value.iloc[-1] - 1
            one_year = (curr / value.iloc[-366]) - 1 if len(value) >= 366 else all_time  # Approx. 252 trading days in a year
            six_month = (curr / value.iloc[-184]) - 1 if len(value) >= 184 else all_time   # Approx. 126 trading days in 6 months
            three_month = (curr / value.iloc[-91]) - 1 if len(value) >= 91 else all_time  # Approx. 63 trading days in 3 months
            one_month = (curr / value.iloc[-31]) - 1 if len(value) >= 31 else all_time   # Approx. 21 trading days in 1 month

            total_days = len(value)  # Number of available data points
            years = min(5, total_days / 366)  # Adjust years based on available data (max 5 years)

            if total_days < 366:  # If less than a year of data, CAGR is undefined
                cagr = (all_time   + 1) ** (366/total_days) - 1
            else:
                start_index = max(0, total_days - int(years * 366))  # Ensure we don't go negative
                start_value = value.iloc[start_index]

                cagr = (curr / start_value) ** (1 / years) - 1 
            
            if total_days > 93:
                if not self.m_data:
                    self.m_data = MarketDataManager().get_data()
                market_returns = pd.Series(self.m_data.get("market_returns"))
                rfr= self.m_data.get("rfr")

                rfr_adj = (1+rfr) ** (1/12) -1
                
                returns = value.copy()


                returns.index = pd.to_datetime(returns.index)
                market_returns.index = pd.to_datetime(market_returns.index)
                returns = returns[[t for t in returns.index if t in market_returns.index]].pct_change().dropna()
                
                if len(returns) > len(market_returns):
                    returns = returns.iloc[-len(market_returns):]
                else:
                    market_returns = market_returns.shift(1).dropna().iloc[-len(returns):]
                
                covariance = np.cov(returns, market_returns)[0][1]
                market_variance = market_returns.var()
                beta = covariance / market_variance
                alpha = returns.mean() - (rfr_adj + beta * (market_returns.mean() - rfr_adj))

                sharpe = (returns.mean() - rfr_adj) / returns.std()
            else:
                alpha = beta = sharpe = None
        
            rolling_max = value.cummax()
            drawdown =  1 - value / rolling_max
            max_drawdown = drawdown.max()

            result = {
                "all": all_time,
                "1y": one_year,
                "6m": six_month,
                "3m": three_month,
                "1m": one_month,
                "cagr": cagr,
                "sharpe":sharpe,
                "alpha":alpha,
                "max_drawdown":max_drawdown
                
            }
           
            return result, {'hist':value.sub(1).to_dict()}
        else:
            return {}, {}
        
    def get_info(self):
        if len(self.tickers)==0: return {}, {}
        basic, adv = self.get_returns() or ({}, {})

        self.weights = {k: v / (self.value) for k, v in self.weights.items()}
        self.contrib = {k: v / (self.value-self.initial) for k, v in self.contrib.items()}
        # Get data from Firestore
        df = get_df(self.tickers.keys(), self.db)
        # Ensure the correct column name
        df['weight'] = df.index.map(self.weights).fillna(0)  # Match weights to tickers safely
        df['contrib'] = df.index.map(self.contrib).fillna(0)
        df['shares'] = df.index.map(self.num).fillna(0)
        df['price'] = df.index.map(self.price).fillna(0)
        df['avg-buy'] = df.index.map(self.avg_buy).fillna(0)
        df['open-pnl'] = df['price'] / df['avg-buy'] -1
        
        asset_weight = df.groupby('type')['weight'].sum()
        primary_asset = asset_weight.idxmax()  # Get the type with the highest weight
        if asset_weight[primary_asset] < 0.5 * df['weight'].sum():
            primary_asset = 'Diversified'
        else:
            primary_asset = ['Equity', 'ETF', 'Mutual Fund'][primary_asset]


        asset_weight['3'] = self.cash / self.value
        sector_weight = df.groupby('sector')['weight'].sum().to_dict()
        region_weight = df.groupby('region')['weight'].sum().to_dict()

        asset_contrib = df.groupby('type')['contrib'].sum().to_dict()
        sector_contrib = df.groupby('sector')['contrib'].sum().to_dict()
        region_contrib = df.groupby('region')['contrib'].sum().to_dict()

        div_yield = (df['yield'] * df['weight']).sum()
        

        holdings_columns = {
            'ticker',
            'name',
            'type',
            'sector',
            'region',
            'shares',
            'avg-buy',
            'price',
            'open-pnl',
            'weight',
            'yield',
            'cagr'
        }

        holdings = df[
            [col for col in df.columns if col in holdings_columns]
        ].loc[df["shares"] != 0]
        result = basic | {
            'primary_class' :str(primary_asset),
            'yield': div_yield,
        }

        return result, adv| {'asset_weight': asset_weight.to_dict(),
            'sector_weight': sector_weight,
            'region_weight': region_weight,
            'asset_contrib': asset_contrib,
            'sector_contrib': sector_contrib,
            'region_contrib': region_contrib,
            'actions':self.actions,
            'df': holdings.T.to_dict()}
    
if __name__ == "__main__":
    data = yf.Ticker('6758.T').history(period='1y', interval='1h')
    print(data)