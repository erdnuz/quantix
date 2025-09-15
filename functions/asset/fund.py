import logging
from typing import Optional, Dict
import pandas as pd
from yahoo.currency import CurrencyConverter
from yahoo import MetricsManager
from asset.technical import get_technical_metrics

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


def get_etf_metrics(
    tick: str,
    info: Dict,
    rfr: float,
    div: Dict,
    prices: pd.Series,
    market_returns: pd.Series
) -> Optional[Dict]:

    manager = MetricsManager()
    fund_info: Dict = manager.get(tick, ["fund"])[0]
    if not fund_info:
        logger.warning(f"No fund info found for {tick}")
        return None

    fund_info["p-earnings"] = info.get("trailingPE")
    

    currency = info.get("financialCurrency")
    converter = CurrencyConverter(currency)

    metrics = get_technical_metrics(tick, prices, info, rfr, div, market_returns)
    if not metrics:
        logger.warning(f"No technical metrics returned for {tick}")
        return None

    assets = info.get("totalAssets", fund_info.get("assets"))
    fund_info["assets"] = converter.convert(assets) / 1000 if assets else None

    # Size classification
    size_options = [20e6, 50e6]
    if fund_info["assets"] < size_options[0]:
        size = "Small"
    elif fund_info["assets"] < size_options[1]:
        size = "Mid"
    else:
        size = "Large"

    # Valuation classification
    valuation_options = [13, 24]

    pe = fund_info["p-earnings"]
    if not pe:
        logger.warning(f"P/E data missing for {tick}")
        valuation = "Blend"
    elif pe < valuation_options[0]:
        valuation = "Value"
    elif pe < valuation_options[1]:
        valuation = "Blend"
    else:
        valuation = "Growth"

    fund_info["category"] = f"{size} {valuation}"
    fund_info["asset-class"] = "ETF"

    return metrics | fund_info
