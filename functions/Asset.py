
import numpy as np
import pandas as pd
import logging
from currency import CurrencyConverter
from yahoo import MetricsManager
from MarketDataManager import MarketDataManager

EXCHANGE_MAP = {
    "_":"USA",

    "TO":"Canada",
    "NE":"Canada",
    "V":"Canada",

    "T":"Japan",
    "S":"Japan",

    "SS":"China",
    "SZ":"China",

    "HK":"Hong Kong",
    "KS":"Korea",
    "KQ":"Korea",
    "TW":"Taiwan", 
    "TWO":"Taiwan", 
    "BK":"Thailand",
    "JK":"Indonesia",
    "KL":"Malaysia",
    "VN":"Vietnam",
    "NS":"India",
    "BO":"India",
    "SI":"Singapore",

    "ST":"Sweden",
    "OL": "Norway",
    "L":"United Kingdom", 
    "IS": "Turkia",
    "IL":"United Kingdom", 
    "XC":"United Kingdom",
    "SW":"Switzerland", 
    "AS":"Netherlands",
    "WA":"Poland",
    "MI":"Italy", 
    "BR":"Belgium", 
    "CO":"Denmark",
    "DE":"Germany", 
    "F":"Germany",
    "HE":"Helsinki", 
    "IC":"Iceland", 
    "MC":"Spain", 
    "PA":"France", 
    "SG":"Germany", 
    "AT":"Greece", 
    "IR":"Ireland", 
    "VS":"Lithuania",
    "VI":"Austria",
    "RG":"Latvia",
    "PR":"Czech",
    "TL":"Estonia",
    "LS":"Portugal",
    "BD":"Hungary",

    "BA":"Argentina",
    "SR":"Saudi Arabia",
    "QA":"Qatar",
    "KW":"Kuwait",
    "AE":"UAE",
    
    "CR":"Venuzuela",


    "MX":"Mexico",
    "NZ":"New Zealand",
    "SA":"Brazil",
    "SN":"Chile",
    "JO":"South Africa",
    "TA":"Israel",
    "AX":"Australia",
    "XA":"Australia"
}


class Asset:
    def __init__(self, ticker, type, m_data):
        self.is_equity = type==0
        self.type = type
        self.ticker = ticker.upper()
        
        self.rfr = m_data.get("rfr", 0.04)
        self.market_returns = pd.Series(m_data["market_returns"])
        self.metrics = None
    
    def update_metrics(self):
        manager = MetricsManager()
        if self.is_equity:
            try:
                prices, info, dividend = manager.get(self.ticker, ['prices','safe_info', 'div'])
            except TypeError as e:
                return None
        else:
            try:
                prices, info, dividend = manager.get(self.ticker, ['prices','info', 'div'])
            except TypeError as e:
                return None
        if info is None:
            return None
        if self.is_equity:
            self.metrics = get_advanced_metrics(
                tick=self.ticker,
                info=info, 
                div=dividend, 
                prices=prices, 
                rfr=self.rfr, 
                market_returns=self.market_returns)
        else:
            self.metrics = get_fund_metrics(
                tick=self.ticker,
                info=info,
                prices=prices, 
                div=dividend,
                rfr=self.rfr, 
                type=self.type,
                market_returns=self.market_returns)
        if self.metrics:
            self.metrics['type'] = self.type
        return self.metrics
    

    
    
def realign(returns, market_returns):
    try:
        n = len(returns)
        m = len(market_returns)
        if n < m:
            if n > m // 2:
                # Align by indices if DatetimeIndex, otherwise use integer indexing with truncation
                try:
                    if isinstance(returns.index, pd.DatetimeIndex) and isinstance(market_returns.index, pd.DatetimeIndex):
                        
                        returns.index = returns.index.tz_localize(None)
                        market_returns.index = market_returns.index.tz_localize(None)
                        market_returns = market_returns.loc[returns.index]
                    else:
                        # Align by integer index, truncate extra indices
                        market_returns = market_returns.iloc[:n].reset_index(drop=True)
                        returns = returns.reset_index(drop=True)
                except:
                    market_returns = market_returns.iloc[:n].reset_index(drop=True)
                    returns = returns.reset_index(drop=True)
            else:
                logging.info(f"Invalid -- Length mismatch {n} {m}")
                return None

        elif n > m:
            if m > n // 2:
                try:
                    # Align by indices if DatetimeIndex, otherwise use integer indexing with truncation
                    if isinstance(returns.index, pd.DatetimeIndex) and isinstance(market_returns.index, pd.DatetimeIndex):
                        returns.index = returns.index.tz_localize(None)
                        market_returns.index = market_returns.index.tz_localize(None)
                        returns = returns.loc[market_returns.index]
                    else:
                        # Align by integer index, truncate extra indices
                        returns = returns.iloc[:m].reset_index(drop=True)
                        market_returns = market_returns.reset_index(drop=True)
                except:
                    returns = returns.iloc[:m].reset_index(drop=True)
                    market_returns = market_returns.reset_index(drop=True)
            else:
                logging.info(f"Invalid -- Length mismatch {n} {m}")
                return None
        return returns, market_returns

    except TypeError:
        logging.info("Invalid -- No returns")
        return None
    
    



def get_basic_metrics(tick, prices, info, rfr, div, market_returns):
    vol = MetricsManager().get(tick, ["volume"])[0]
    try:
        returns=prices.pct_change().dropna()
    except AttributeError:
        return None
    stock_return = returns.mean()
    market_return = market_returns.mean()
    market_std = market_returns.std()

    result = realign(returns, market_returns)
    if result is None:
        return None
    returns, market_returns = result

    
    rfr_adj = (1 + rfr) ** (1 / 12) - 1

    
    
    # Growth
    change = prices.iloc[-1] / prices.iloc[0]

    cagr = (change) ** (1 / 5) - 1 
    yoy = (prices.iloc[-1] / prices.iloc[-12] - 1)   
    three_year = (prices.iloc[-1] / prices.iloc[-36]) ** (1 / 3) - 1 
    six_month = (prices.iloc[-1] / prices.iloc[-6])  ** 2 - 1  


    #Risk               
    rolling_max = prices.cummax()
    drawdown =  1 - prices / rolling_max
    downside_deviation = np.sqrt(np.mean(np.minimum(0, returns - rfr_adj) ** 2))

    max_drawdown = drawdown.max()
    avg_drawdown = drawdown.mean()
    std_dev = returns.std()
    
    
    # Risk - BETA
    covariance = np.cov(returns, market_returns)[0][1]
    market_variance = market_returns.var()
    correlation = returns.corr(market_returns)  # Calculate correlation
    w1, w2 = 0.6 + 0.4 * correlation, 1 - (0.6 + 0.4 * correlation)  # Adjust weights dynamically
    beta_adj = w1 * abs(covariance / market_variance) + w2 * (std_dev / market_std)**0.4
    beta = covariance / market_variance

    var10 = -np.percentile(returns, 10)
    var5 = -np.percentile(returns, 5)
    var1 = -np.percentile(returns, 1)

    #Performance
    alpha = stock_return - (rfr_adj + beta * (market_return - rfr_adj))
    alpha_adj = stock_return - (rfr_adj + beta_adj * (market_return - rfr_adj))

    sharpe_ratio = (stock_return - rfr_adj) / std_dev if std_dev != 0 else np.inf
    sortino_ratio = (stock_return - rfr_adj) / downside_deviation if downside_deviation!=0 else np.inf
    s_mean = (sharpe_ratio + sortino_ratio) / 2
    
    m_squared = sharpe_ratio * market_std + rfr_adj
    m_squared_adj = s_mean * market_std + rfr_adj

    
    gains = returns.where(returns > 0, 0)
    losses = -returns.where(returns < 0, 0)

    omega_ratio = gains.sum() / losses.sum() if losses.sum() != 0 else None
    calmar_ratio = cagr / abs(max_drawdown) if max_drawdown != 0 else None
    ui = np.sqrt((drawdown*drawdown).mean())
    martin_ratio = ((1+stock_return)**12 - 1) / ui if ui != 0 else None
    
    spl = tick.split(".")
    suff = spl[-1] if len(spl) > 1 else "_"
    region = EXCHANGE_MAP.get(suff, "Unknown")
    metrics_dict = {
        'ticker': tick,
        'exchange': info.get('exchange'),
        'currency': info.get('currency', info.get('financialCurrency',None)),
        'name': info.get("longName", info.get("shortName")),
        'yield': div.get("yield", info.get('dividendYield', 0)),
        'region': region,
        'volume':vol,
        'market-corr': correlation,


        'cagr': cagr,
        'yoy': yoy,
        '3y':three_year,
        '6mo': six_month,
        'div-g': div.get("gr", None),

        'beta': beta,
        'beta-adj': beta_adj,
        'std-dev': std_dev,
        'max-d': max_drawdown,
        'avg-d': avg_drawdown,
        'var1': var1,
        'var5': var5,
        'var10': var10,

        
        'alpha': alpha,
        'alpha-adj': alpha_adj,
        'sharpe': sharpe_ratio,
        'sortino': sortino_ratio,
        's-adj': s_mean,
        'ms-adj': m_squared_adj,
        'm-squared': m_squared,
        'omega': omega_ratio,
        'calmar': calmar_ratio,
        'martin': martin_ratio,

    }
    return metrics_dict
        

def get_advanced_metrics(tick, info, rfr, div, prices, market_returns):
    currency = info.get("currency", info.get("financialCurrency", "USD"))
    converter = CurrencyConverter(currency = currency)

    manager = MetricsManager()
    metrics_dict = get_basic_metrics(tick, prices, info, rfr, div, market_returns)
    
    if not metrics_dict:
        print(tick)
        return None
    
    financials, balance_sheet, growth = manager.get(tick, ['financials', 'balance_sheet', 'growth'])
    # Retrieve necessary metricsina
    sector = info.get('sector', None)

    #Profile
    try:
        market_cap = info.get('marketCap', None)
    except:
        market_cap = balance_sheet.loc['Ordinary Shares Number'].iloc[0] * prices.iloc[-1] / 1000
    market_cap_usd = converter.convert(market_cap)
        
    
    #Valuation
    try:
        total_liabilities = balance_sheet.loc['Total Liabilities Net Minority Interest'].iloc[0]
    except:
        total_liabilities = None
    try:
        total_assets = balance_sheet.loc['Total Assets'].iloc[0]
    except:
        total_assets = None
    try:
        total_debt = balance_sheet.loc['Total Debt'].iloc[0]
    except:
        total_debt = None

    pb_ratio = info.get('priceToBook')
    total_equity = total_assets-total_liabilities if total_liabilities and total_assets else None
    if not total_equity:
        try:
            total_equity = balance_sheet.loc['Stockholder Equity'].iloc[0]
        except:
            total_equity=None
    if total_equity and total_equity <= 0:
        total_equity = None

    if not pb_ratio:
        try:
            pb_ratio = market_cap/total_equity
        except:
            pb_ratio = None
    

    try:
        pe_ratio = float(info.get('forwardPE') or info.get('trailingPE'))
    except:
        pe_ratio = None

    
    try:
        sales = financials.loc['Total Revenue'].iloc[0]
        ps_ratio = market_cap / sales if sales and sales > 0 else None
    except:
        sales = None
        ps_ratio = None
    gr = growth.get("avg", None)
    peg_ratio = pe_ratio / (gr * 100) if gr and gr > 0 and pe_ratio and pe_ratio> 0 else None


    
    

    # Profitabilty
    try:
        net_income = financials.loc['Net Income'].iloc[0]
    except:
        net_income = None

    wacc = calculate_wacc(info, financials, metrics_dict.get('beta', None), rfr, market_returns.mean(), market_cap, total_debt)
    profit_margin = info.get('profitMargins', None)
    roe = net_income / total_equity if total_equity and net_income and total_equity > 0 else None
    roa = net_income / total_assets if total_assets and net_income and total_assets > 0 else None
    
    earnings_growth = growth.get("earnings")
    revenue_growth = growth.get("revenue")
    

    # Leverage
    debt_to_equity = (total_debt / total_equity) if total_equity and total_debt and total_equity != 0 else None
    debt_to_assets = (total_debt / total_assets) if total_assets and total_debt and total_assets != 0 else None
    
    try:
        debt_to_ebitda = total_debt / financials.loc['EBITDA'].iloc[0] if financials.loc['EBITDA'].iloc[0] > 0 else None
    except:
        debt_to_ebitda= None
    
    try:
        current_assets = balance_sheet.loc['Current Assets'].iloc[0]
    except:
        current_assets = None
    try:
        current_liabilities = balance_sheet.loc['Current Liabilities'].iloc[0]
    except:
        current_liabilities = None

    assets_to_liabilities = current_assets / current_liabilities if current_assets and current_liabilities and current_liabilities > 0 else None
    
    try:
        retained_earnings = balance_sheet.loc["Retained Earnings"].iloc[0]
    except:
        retained_earnings = None
    
    try:
        ebit = financials.loc["EBIT"].iloc[0]
    except:
        ebit = None
    
    # Calculate ratios
    working_capital = current_assets - current_liabilities if current_assets and current_liabilities else None
    x1 = 1.2 * working_capital / total_assets if working_capital and total_assets else 0
    x2 = 1.4 * retained_earnings / total_assets if retained_earnings and total_assets else 0
    x3 = 3.3 * ebit / total_assets if ebit and total_liabilities else 0
    x4 =  0.6 * market_cap / total_liabilities if market_cap and total_liabilities else 0
    x5 = sales / total_assets if sales and total_assets else 0
    z_score = x1 + x2 +  x3 + x4 + x5




    

    
    
    
    
    #Analysis
    num_an = info.get('numberOfAnalystOpinions',None)
    an_rec = info.get("recommendationMean", None)
    an_min = info.get("targetLowPrice", None)
    an_max = info.get("targetHighPrice", None)
    an_mean = info.get("targetMeanPrice", None)
    

    

    metrics_dict = metrics_dict | {
        'sector': sector,
        'market-cap':   market_cap,
        'market-cap-usd': market_cap_usd,

        'num-an': num_an,
        'an-rec': an_rec,
        'an-min': an_min,
        'an-max': an_max,
        'an-avg': an_mean,


        'wacc': wacc,
        'p-earnings': pe_ratio,
        'p-book': pb_ratio,
        'p-sales': ps_ratio,
        'peg': peg_ratio,

        'growth': gr,
        'profit-m': profit_margin, 
        'roe': roe,
        'roa': roa,
        'earnings-g': earnings_growth,
        'revenue-g': revenue_growth,

        'debt-e': debt_to_equity,
        'debt-a': debt_to_assets,
        'debt-ebit': debt_to_ebitda,
        'assets-l': assets_to_liabilities,
        'altman-z': z_score,

        
    }
    return metrics_dict
    

def get_fund_metrics(tick, info, rfr, div, prices, market_returns, type):
    
    fund_info = MetricsManager().get(tick, ["fund"])[0]
    if not fund_info:
        return None
    fund_info["p-earnings"] = info.get("trailingPE")
    if not fund_info['p-earnings']:
        return None
    
    converter = CurrencyConverter(info.get("currency"))
    metrics = get_basic_metrics(tick, prices, info, rfr, div, market_returns)
    if not metrics:
        print(tick)
        return None
    
    assets = info.get("totalAssets", fund_info.get("assets"))
    fund_info["assets"] = assets
    fund_info["assets-usd"] = converter.convert(assets) / 1000 if assets else None
    fund_info["p-earnings"] = info.get("trailingPE")

    

    if type == 1:
        sizeOptions =  [20e6, 50e6]
        valuationOptions = [13, 24]
    else:
        sizeOptions = [50e6, 200e6]
        valuationOptions = [23, 26]

    if fund_info["assets-usd"] < sizeOptions[0]:
        size = 'Small'
    elif fund_info["assets-usd"] < sizeOptions[1]:
        size = 'Mid'
    else:
        size = 'Large'
    if fund_info['p-earnings'] < valuationOptions[0]:
        valuation = 'Value'
    elif fund_info['p-earnings'] < valuationOptions[1]:
        valuation = 'Blend'
    else:
        valuation = 'Growth'
    fund_info['category'] = size + ' ' + valuation
    return metrics | fund_info




def calculate_wacc(info, financials, beta, rfr, average_monthly_return, market_cap, total_debt):
    try:
        if market_cap is None or total_debt is None:
            return None
        try:
            interest_expense = financials.loc['Interest Expense'].sum()
            cost_of_debt = (interest_expense / total_debt) if total_debt else None
        except KeyError:
            return None
        
        market_return = (1 + average_monthly_return) ** 12 - 1

        tax_rate = info.get('taxRate', 0.21)

        

        total_value = market_cap + total_debt
        equity_weight = market_cap / total_value if market_cap and total_value else None
        debt_weight = total_debt / total_value if total_debt and total_value else None

        cost_of_equity = rfr + beta * (market_return - rfr)

        wacc = (equity_weight * cost_of_equity) + (debt_weight * cost_of_debt * (1 - tax_rate))
        return wacc
        

    except (KeyError, TypeError):
        return None
	

if __name__=="__main__":
    ret = MetricsManager().get("^GSPC",["prices"])[0].pct_change().dropna()
    
    print(Asset('vfaix', type=2, m_data={'rfr':0.04, 'market_returns':ret}).update_metrics()['category'])
