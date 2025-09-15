import logging
from typing import Optional, Tuple, Dict
import pandas as pd
import numpy as np
from yahoo import MetricsManager

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


def get_technical_metrics(
    tick: str,
    prices: pd.Series,
    info: Dict,
    rfr: float,
    div: Dict,
    market_returns: pd.Series
) -> Optional[Dict]:
    
    vol = MetricsManager().get(tick, ["volume"])[0]

    try:
        returns = prices.pct_change().dropna()
    except AttributeError:
        logger.warning(f"Price series invalid for {tick}")
        return None

    stock_return = returns.mean()
    market_return = market_returns.mean()
    market_std = market_returns.std()

    result = __realign(returns, market_returns)
    if result is None:
        logger.warning(f"Could not realign returns for {tick}")
        return None
    returns, market_returns = result

    rfr_adj = (1 + rfr) ** (1 / 12) - 1

    # Growth
    try:
        change = prices.iloc[-1] / prices.iloc[0]
        cagr = change ** (1 / 5) - 1
        
        yoy = prices.iloc[-1] / prices.iloc[-12] - 1
        three_year = (prices.iloc[-1] / prices.iloc[-36]) ** (1 / 3) - 1
        six_month = (prices.iloc[-1] / prices.iloc[-6]) ** 2 - 1
    except IndexError:
        return None

    # Risk metrics
    rolling_max = prices.cummax()
    drawdown = 1 - prices / rolling_max
    downside_deviation = np.sqrt(np.mean(np.minimum(0, returns - rfr_adj) ** 2))
    max_drawdown = drawdown.max()
    avg_drawdown = drawdown.mean()
    std_dev = returns.std()

    # Beta
    covariance = np.cov(returns, market_returns)[0][1]
    market_variance = market_returns.var()
    correlation = returns.corr(market_returns)
    w1, w2 = 0.6 + 0.4 * correlation, 1 - (0.6 + 0.4 * correlation)
    beta_adj = w1 * abs(covariance / market_variance) + w2 * (std_dev / market_std) ** 0.4
    beta = covariance / market_variance

    var10 = -np.percentile(returns, 10)
    var5 = -np.percentile(returns, 5)
    var1 = -np.percentile(returns, 1)

    # Performance
    alpha = stock_return - (rfr_adj + beta * (market_return - rfr_adj))
    alpha_adj = stock_return - (rfr_adj + beta_adj * (market_return - rfr_adj))
    sharpe_ratio = (stock_return - rfr_adj) / std_dev if std_dev != 0 else np.inf
    sortino_ratio = (stock_return - rfr_adj) / downside_deviation if downside_deviation != 0 else np.inf
    s_mean = (sharpe_ratio + sortino_ratio) / 2

    m_squared = sharpe_ratio * market_std + rfr_adj
    m_squared_adj = s_mean * market_std + rfr_adj

    # Additional ratios
    gains = returns.where(returns > 0, 0)
    losses = -returns.where(returns < 0, 0)
    omega_ratio = gains.sum() / losses.sum() if losses.sum() != 0 else None
    calmar_ratio = cagr / abs(max_drawdown) if max_drawdown != 0 else None
    ui = np.sqrt((drawdown * drawdown).mean())
    martin_ratio = ((1 + stock_return) ** 12 - 1) / ui if ui != 0 else None

    metrics_dict = {
        'ticker': tick,
        'name': info.get("longName", info.get("shortName")),
        'yield': div.get("yield", info.get('dividendYield', 0)),
        'volume': vol,
        'market-corr': correlation,

        'cagr': cagr,
        'yoy': yoy,
        '3y': three_year,
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


def __realign(
    returns: pd.Series, 
    market_returns: pd.Series
) -> Optional[Tuple[pd.Series, pd.Series]]:
    try:
        n, m = len(returns), len(market_returns)
        if n < m:
            if n > m // 2:
                if isinstance(returns.index, pd.DatetimeIndex) and isinstance(market_returns.index, pd.DatetimeIndex):
                    returns.index = returns.index.tz_localize(None)
                    market_returns.index = market_returns.index.tz_localize(None)
                    market_returns = market_returns.loc[returns.index]
                else:
                    market_returns = market_returns.iloc[:n].reset_index(drop=True)
                    returns = returns.reset_index(drop=True)
            else:
                logger.warning(f"Invalid -- Length mismatch {n} vs {m}")
                return None
        elif n > m:
            if m > n // 2:
                if isinstance(returns.index, pd.DatetimeIndex) and isinstance(market_returns.index, pd.DatetimeIndex):
                    returns.index = returns.index.tz_localize(None)
                    market_returns.index = market_returns.index.tz_localize(None)
                    returns = returns.loc[market_returns.index]
                else:
                    returns = returns.iloc[:m].reset_index(drop=True)
                    market_returns = market_returns.reset_index(drop=True)
            else:
                logger.warning(f"Invalid -- Length mismatch {n} vs {m}")
                return None
        return returns, market_returns
    except TypeError:
        logger.warning("Invalid -- returns or market_returns not valid")
        return None
