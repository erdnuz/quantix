import logging
from typing import Optional, Dict
import pandas as pd
from yahoo.currency import CurrencyConverter
from yahoo import MetricsManager
from asset.technical import get_technical_metrics
import math

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


def get_company_metrics(
    tick: str,
    info: Dict,
    rfr: float,
    div: Dict,
    prices: pd.Series,
    market_returns: pd.Series
) -> Optional[Dict]:

    currency = info.get("financialCurrency")
    converter = CurrencyConverter(currency=currency)

    manager = MetricsManager()
    metrics_dict = get_technical_metrics(tick, prices, info, rfr, div, market_returns)
    if not metrics_dict:
        logger.warning(f"No technical metrics returned for {tick}")
        return None

    financials, balance_sheet, growth, next_earnings, = manager.get(
        tick, ['financials', 'balance_sheet', 'growth', 'next_earnings']
    )

    sector = info.get('sector')

    # Profile
    try:
        shares_outstanding: Optional[float] = balance_sheet.loc['Ordinary Shares Number'].iloc[0]
    except KeyError:
        
        shares_outstanding = info.get("sharesOutstanding")
        if not shares_outstanding:
            return None
    try:
        market_cap: Optional[float] = info.get('marketCap')
        if market_cap is None:
            market_cap = shares_outstanding * prices.iloc[-1] / 1000
    except KeyError:
        return None
        
    except Exception as e:
        logger.warning(f"Error calculating market cap for {tick}: {e}")
        market_cap = None

    # Valuation
    try:
        total_liabilities = converter.convert(balance_sheet.loc['Total Liabilities Net Minority Interest'].iloc[0])
    except KeyError:
        total_liabilities = None

    try:
        total_assets = converter.convert(balance_sheet.loc['Total Assets'].iloc[0])
    except KeyError:
        total_assets = None

    try:
        total_debt = converter.convert(balance_sheet.loc['Total Debt'].iloc[0])
    except KeyError: 
        total_debt = None

    total_equity: Optional[float] = total_assets - total_liabilities if total_assets and total_liabilities else None
    if not total_equity:
        try:
            total_equity = converter.convert(balance_sheet.loc['Stockholder Equity'].iloc[0])
        except KeyError:
            total_equity=None
    if total_equity and total_equity <= 0:
        logger.warning(f"Total equity is non-positive for {tick}")
        total_equity = None

    pb_ratio = info.get('priceToBook')
    if not pb_ratio and market_cap and total_equity:
        pb_ratio = market_cap / total_equity

    try:
        pe_ratio: Optional[float] = float(info.get('forwardPE') or info.get('trailingPE'))
    except:
        logger.warning(f"PE info missing for {tick}")
        return None
    

    try:
        sales: Optional[float] = converter.convert(financials.loc['Total Revenue'].iloc[0])
    except KeyError:
        sales = None
    ps_ratio = market_cap / sales if sales and market_cap else None
    

    gr = growth.get("avg")
    peg_ratio = pe_ratio / (gr * 100) if gr and gr > 0 and pe_ratio and pe_ratio > 0 else None

    # Profitability
    try:
        net_income = converter.convert(financials.loc['Net Income'].iloc[0])
    except KeyError:
        net_income = None

    

    wacc = __calculate_wacc(info, financials, metrics_dict.get('beta', None), rfr, market_returns.mean(), market_cap, total_debt)
    profit_margin = info.get('profitMargins')
    roe = net_income / total_equity if total_equity and net_income else None
    roa = net_income / total_assets if total_assets and net_income else None

    earnings_growth = growth.get("earnings")
    revenue_growth = growth.get("revenue")

    # Leverage
    debt_to_equity = total_debt / total_equity if total_debt and total_equity else None
    debt_to_assets = total_debt / total_assets if total_debt and total_assets else None

    try:
        ebitda = converter.convert(financials.loc["EBITDA"].iloc[0])
    except KeyError:
        try:
            ebitda = converter.convert(financials.loc["EBIT"].iloc[0])
        except KeyError:
            ebitda = None
    debt_to_ebitda = total_debt / ebitda if ebitda and total_debt else None

    try:
        current_assets = converter.convert(balance_sheet.loc['Current Assets'].iloc[0])
        current_liabilities = converter.convert(balance_sheet.loc['Current Liabilities'].iloc[0])
        assets_to_liabilities = current_assets / current_liabilities if current_assets and current_liabilities else None
    except KeyError:
        current_assets = current_liabilities = None
        assets_to_liabilities = total_assets / total_liabilities if total_assets and total_liabilities else None

    try:
        retained_earnings = converter.convert(balance_sheet.loc["Retained Earnings"].iloc[0])
    except KeyError:
        retained_earnings = None 

    try:
        ebit = converter.convert(financials.loc["EBIT"].iloc[0])
    except KeyError:
        ebit = ebitda or 0

    # Altman Z-score
    working_capital = current_assets - current_liabilities if current_assets and current_liabilities else 0
    x1 = 1.2 * working_capital / total_assets if total_assets else 0
    x2 = 1.4 * retained_earnings / total_assets if total_assets and retained_earnings else 0
    x3 = 3.3 * ebit / total_assets if total_assets else 0
    x4 = 0.6 * market_cap / total_liabilities if total_liabilities else 0
    x5 = sales / total_assets if sales and total_assets else 0
    z_score = x1 + x2 + x3 + x4 + x5


    # Analyst metrics
    num_an = info.get('numberOfAnalystOpinions')
    an_rec = info.get("recommendationMean")
    an_min = info.get("targetLowPrice")
    an_max = info.get("targetHighPrice")
    an_mean = info.get("targetMeanPrice")



    return metrics_dict | {
        'sector': sector,
        'market-cap': market_cap,
        'asset-class': 'Equity',
        'earnings-date': next_earnings,

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


def __calculate_wacc(info, financials, beta, rfr, average_monthly_return, market_cap, total_debt):
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
    
def ddm(income: float, income_growth_rate: float, wacc: float) -> Optional[float]:
    """Dividend Discount Model (DDM) valuation per share."""
    try:
        payout_ratio = 0.3
        dividend = income * (1 + income_growth_rate) * payout_ratio
        result = dividend / max(0.01, wacc - income_growth_rate)
        logger.debug(f"DDM: income={income}, growth={income_growth_rate}, wacc={wacc}, result={result}")
        return result
    except Exception as e:
        logger.warning(f"Failed to calculate DDM: {e}")
        return None


def graham_number(income: float, total_equity: float) -> Optional[float]:
    """Graham number valuation."""
    try:
        result = math.sqrt(22.5 * income * total_equity)
        logger.debug(f"Graham Number: income={income}, equity={total_equity}, result={result}")
        return result
    except Exception as e:
        logger.warning(f"Failed to calculate Graham number: {e}")
        return None


def peg_fair(income: float, growth_rate: float) -> Optional[float]:
    """PEG-based fair value estimate."""
    try:
        result = income * growth_rate * 100
        logger.debug(f"PEG Fair: income={income}, growth={growth_rate}, result={result}")
        return result
    except Exception as e:
        logger.warning(f"Failed to calculate PEG fair value: {e}")
        return None


def dcf(fcf: float, fcf_cagr: float, wacc: float, debt: float) -> Optional[float]:
    """Discounted Cash Flow (DCF) valuation."""
    try:
        terminal_g = 0.03
        years = 5
        fcf_growth_years = [(years - i) / years * fcf_cagr + i / years * terminal_g for i in range(years)]
        
        projected_fcfs = []
        current_fcf = fcf
        for growth in fcf_growth_years:
            current_fcf *= (1 + growth)
            projected_fcfs.append(current_fcf)
        
        discounted_fcfs = [cf / ((1 + wacc) ** (i + 1)) for i, cf in enumerate(projected_fcfs)]
        
        terminal_value = projected_fcfs[-1] * (1 + terminal_g) / (wacc - terminal_g)
        discounted_terminal_value = terminal_value / ((1 + wacc) ** years)
        
        enterprise_value = sum(discounted_fcfs) + discounted_terminal_value
        result = enterprise_value - debt if debt else enterprise_value
        
        logger.debug(f"DCF: fcf={fcf}, fcf_cagr={fcf_cagr}, wacc={wacc}, debt={debt}, result={result}")
        return result
    except Exception as e:
        logger.warning(f"Failed to calculate DCF: {e}")
        return None
