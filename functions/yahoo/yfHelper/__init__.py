import pandas as pd
from yahoo.currency import CurrencyConverter
import numpy as np
import yfinance as yf

class yfHelper:
    def __init__(self, ticker):
        self.ticker : yf.Ticker = yf.Ticker(ticker)
        self.symbol = ticker
        self.history = None
        self.funds_data = None
    
    def __history(self):
        if self.history is None:
            his = self.ticker.history(period='5y', interval='1mo')
            his.index = pd.to_datetime(his.index).tz_localize(None)
            self.history = his.ffill().dropna()

    def price_monthly_short(self):
        self.__history()
        return self.history['Close']
    
    def price_weekly_long(self):
        his = self.ticker.history(start='2005-01-01', interval='5d')['Close']
        his.index = his.index.tz_localize(None)
        return his.ffill().dropna()

    def price_weekly_short(self):
        his = self.ticker.history(period='5y', interval='5d')['Close']
        his.index = his.index.tz_localize(None)
        return his.ffill().dropna()

    def get_dividend_info(self):
        self.__history()
        his = normalize_to_quarterly(self.history['Dividends'][self.history['Dividends'] > 0])
        if his is not None and len(his) > 0:
            div_growth_rate = his.pct_change().replace([np.inf, -np.inf], np.nan).dropna()

            avg_div_growth = div_growth_rate.mean()
            price = self.history['Close'].iloc[-1]
            recent_dividends = his.iloc[-1] * 4
            dividend_yield = recent_dividends / price
            return {"gr":avg_div_growth, "yield":dividend_yield}
        else:
            return {"gr":None, "yield":0}
    
    def price_and_change(self, convert=False):  ##
        dat = self.ticker.fast_info
        max = round(dat['yearHigh'], 2)
        min = round(dat['yearLow'], 2)

        current_price = dat["lastPrice"]
        open = dat["previousClose"]
        if convert:
            currency = dat['currency']
            current_price = CurrencyConverter(currency).convert(current_price)
        return {
            "price": current_price,
            "change": (current_price / open) - 1,
            "range": f'{min} - {max}'
        }
    
    def get_earnings_date(self):
        dates = self.ticker.calendar.get('Earnings Date', None)
        
        if dates:
            return dates[0] 
        


        
    def get_volume(self):   ##
        return self.ticker.fast_info.get('threeMonthAverageVolume', None)
    
    def get_equity_growth(self, limiter=None):  ##
        
        
        if limiter is not None:
            limiter()
            g = self.ticker.growth_estimates
            limiter()
            e = self.ticker.earnings_estimate
            limiter()
            r = self.ticker.revenue_estimate
        else:
            g = self.ticker.growth_estimates
            e = self.ticker.earnings_estimate
            r = self.ticker.revenue_estimate

        data = pd.DataFrame({
            'g': g.get('stock', pd.Series(dtype=float)),
            'e': e.get('growth', pd.Series(dtype=float)),
            'r': r.get('growth', pd.Series(dtype=float))
        })

        data = data.reindex(['0q', '0y', '+1q', '+1y'])
        current_mean = data.loc[['0q', '0y']].mean(skipna=True)
        forecast_mean = data.loc[['+1q', '+1y']].mean(skipna=True)
        mean_values = pd.concat([current_mean, forecast_mean], axis=1).mean(axis=1)

        growth = mean_values.mean(skipna=True)
        revenue_growth = mean_values['r']
        earnings_growth = mean_values['e']

        
        return {"avg":growth, "revenue":revenue_growth, "earnings":earnings_growth}

    

    def get_fund_info(self):    ##
        
        if self.funds_data == None:
            self.funds_data = self.ticker.get_funds_data()
        try:
            weights = self.funds_data.sector_weightings
        except Exception as e:
            print(f"Error in get_fund_info: {e}")
            return None
        std = sorted(weights.items(), key=lambda x: x[1], reverse=True)
        if len(std) == 0:
            return None
        primary_sector = std[0][0].replace("_", " ").title() if std[0][1] > 0.4 else "Diversified"
        plot = {}
        for sec, w in std[:5]:
            plot[sec.replace("_", " ").title()] = w
            
        total_weight = sum(weights.values())
        if total_weight == 0:
            return None
        normalized_weights = [weight / total_weight for weight in weights.values()]
        hhi = sum(weight ** 2 for weight in normalized_weights)
        sector_diversity = (1 - hhi) ** 2

        
        holdings = self.funds_data.top_holdings
        h = holdings.iloc[:, 0].values
        p = holdings["Holding Percent"].values
        plot_holdings = {h[i]: p[i] for i in range(min(len(h), 5))}
        holdings["Normalized Percent"] = holdings["Holding Percent"] / holdings["Holding Percent"].sum()
        holdings["Squared Percent"] = holdings["Normalized Percent"] ** 2
        hhi = holdings["Squared Percent"].sum()

        holding_diversity = (1 - hhi) ** 2

        expense_ratio, turnover, net_assets = self.funds_data.fund_operations.iloc[:, 0].values
        return {
            "plot-sectors":plot, 
            "sector":primary_sector, 
            "plot-holdings":plot_holdings, 
            "holding-diversity":holding_diversity, 
            "sector-diversity":sector_diversity, 
            "expenses":expense_ratio,
            "turnover":turnover,
            "assets":net_assets,
    }
    
    def get_info(self):
        return self.ticker.info
        
    def get_balance_sheet(self):
        return self.ticker.balance_sheet

    def get_cashflow(self):
        return self.ticker.cashflow

    def get_financials(self):
        return self.ticker.financials
    



def normalize_to_quarterly(dividends):
    dividends = dividends.sort_index().fillna(0)
    annual_dividends = dividends.groupby(dividends.index.year).sum()
    try:
        quarterly_index = pd.date_range(start=dividends.index.min(), 
                                        end=dividends.index.max(), 
                                        freq='QE')
    except ValueError:
        return None
    quarterly_dividends = pd.Series(0, index=quarterly_index, dtype=float)
    for year, total_dividend in annual_dividends.items():
        quarters_in_year = quarterly_index[quarterly_index.year == year]
        quarterly_dividends[quarters_in_year] = total_dividend / len(quarters_in_year) if len(quarters_in_year) != 0 else None
    return quarterly_dividends

if __name__ == "__main__":
    dat = yfHelper("SPY").get_fund_info()
    print(dat)
