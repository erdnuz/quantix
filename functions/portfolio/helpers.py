import pandas as pd
import numpy as np

def get_pnl(actions, prices):
    """
    Vectorized PnL calculation.
    
    Parameters:
        actions: dict of date -> shares bought/sold (+/-)
        prices: pd.Series of prices indexed by date
        
    Returns:
        total_value_series (pd.Series), last_value (float), last_cash (float), 
        actions_list (list), num_shares (float), last_price (float), avg_buy_price (float)
    """
    # Standardize prices
    prices = prices.copy()
    prices.index = pd.to_datetime(prices.index)
    prices = prices.groupby(prices.index).last().sort_index().ffill()

    if prices.empty:
        return pd.Series(dtype=float), 0.0, 0.0, [], 0.0, 0.0, 0.0

    # Standardize actions
    actions_series = pd.Series(actions).astype(float)
    actions_series.index = pd.to_datetime(actions_series.index)

    # Unified date index
    full_index = prices.index.union(actions_series.index)
    actions_aligned = actions_series.reindex(full_index, fill_value=0).values
    prices_aligned = prices.reindex(full_index).ffill().values

    # Cumulative shares and cash impact
    cum_shares = np.cumsum(actions_aligned)
    cash_diffs = -np.cumsum(actions_aligned * prices_aligned)
    total_value = cum_shares * prices_aligned + cash_diffs

    # Average buy price
    buys = np.clip(actions_aligned, 0, None)
    cum_buy_shares = np.cumsum(buys)
    cum_buy_cost = np.cumsum(buys * prices_aligned)
    avg_buy_price = float(cum_buy_cost[-1] / cum_buy_shares[-1]) if cum_buy_shares[-1] > 0 else 0.0

    # Actions list
    mask = actions_aligned != 0
    actions_list = [
        {
            'date': d.strftime('%Y-%m-%d'),
            'shares': float(abs(shares)),
            'action': int(shares > 0),
            'price': float(price)
        }
        for d, shares, price in zip(full_index[mask], actions_aligned[mask], prices_aligned[mask])
    ]

    # Last values
    last_price = float(prices_aligned[-1])
    num_shares = float(cum_shares[-1])
    last_cash = float(cash_diffs[-1])
    last_value = float(total_value[-1])

    # Convert to pd.Series
    total_value_series = pd.Series(total_value, index=full_index, dtype=float)

    return total_value_series, last_value, last_cash, actions_list, num_shares, last_price, avg_buy_price


def get_df(tickers, db):
    """
    Fetch asset information from Firestore for a list of tickers.
    
    Parameters:
        tickers: list of ticker symbols
        db: Firestore database object
        
    Returns:
        pd.DataFrame indexed by ticker, with JSON-safe values
    """
    if not tickers:
        return pd.DataFrame()

    doc_refs = [db.collection("assets").document(ticker) for ticker in tickers]
    docs = db.get_all(doc_refs)

    data = []
    for doc in docs:
        if doc.exists:
            doc_data = doc.to_dict()
            doc_data['ticker'] = doc.id
            # Ensure numeric values are float
            for k, v in doc_data.items():
                if isinstance(v, (np.integer, np.int64, int, np.floating, np.float64)):
                    doc_data[k] = float(v)
            data.append(doc_data)

    if not data:
        return pd.DataFrame()

    df = pd.DataFrame(data)
    df.set_index('ticker', inplace=True)
    return df
