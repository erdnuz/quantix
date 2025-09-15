import logging
from typing import Optional, Union, Dict
import pandas as pd
from yahoo import MetricsManager
from asset.company import get_company_metrics
from asset.fund import get_etf_metrics

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Change to INFO to reduce verbosity
ch = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


class Asset:
    def __init__(self, ticker: str, is_equity: bool, m_data: Dict[str, Union[float, pd.Series]]) -> None:
        """
        Initialize an Asset object.

        :param ticker: Ticker symbol of the asset
        :param is_equity: True if the asset is an equity, False for ETF/fund
        :param m_data: Market data dictionary, must contain 'market_returns' and optional 'rfr'
        """
        self.is_equity: bool = is_equity
        self.ticker: str = ticker.upper()
        self.rfr: float = m_data.get("rfr", 0.04)
        self.market_returns: pd.Series = pd.Series(m_data["market_returns"])
        self.metrics: Optional[Dict] = None

    def get_metrics(self) -> Optional[Dict]:
        """
        Fetch and compute metrics for the asset.

        :return: Dictionary of metrics or None if data is unavailable
        """
        manager = MetricsManager()

        try:
            if self.is_equity:
                prices, info, dividend = manager.get(self.ticker, ['prices', 'safe_info', 'div'])
            else:
                prices, info, dividend = manager.get(self.ticker, ['prices', 'info', 'div'])
        except TypeError as e:
            logger.error(f"Failed to fetch data for {self.ticker}: {e}")
            return None

        if info is None:
            logger.warning(f"No info returned for {self.ticker}")
            return None

        if self.is_equity:
            self.metrics = get_company_metrics(
                tick=self.ticker,
                info=info,
                div=dividend,
                prices=prices,
                rfr=self.rfr,
                market_returns=self.market_returns
            )
        else:
            self.metrics = get_etf_metrics(
                tick=self.ticker,
                info=info,
                prices=prices,
                div=dividend,
                rfr=self.rfr,
                market_returns=self.market_returns
            )

        if self.metrics is None:
            logger.warning(f"Metrics computation failed for {self.ticker}")
            return None
        return self.metrics
