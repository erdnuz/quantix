import pandas as pd
import numpy as np

def get_pnl(actions: dict, prices: pd.Series):
    """
    Vectorized PnL calculation.
    actions: dict of date -> shares bought/sold (+/-)
    prices: pd.Series of prices indexed by date
    Returns:
        total_value_series, last_value, last_cash, actions_list, num_shares, last_price, avg_buy_price
    """
    prices = prices.copy()
    prices.index = pd.to_datetime(prices.index)
    prices = prices.groupby(prices.index).last().ffill()

    # Standardize actions
    actions_df = pd.DataFrame([
        {'date': pd.to_datetime(d), 'shares': qty, 'price': prices.get(pd.to_datetime(d), np.nan)}
        for d, qty in actions.items()
    ]).dropna(subset=['price']).set_index('date').sort_index()

    # Create a full date index
    full_index = pd.date_range(prices.index.min(), prices.index.max())
    actions_full = actions_df.reindex(full_index, fill_value=0)

    # Cumulative shares
    cum_shares = actions_full['shares'].cumsum()
    # Cash effects
    cash_diffs = -(actions_full['shares'] * actions_full['price']).cumsum()
    # Portfolio value
    total_value = cum_shares * prices.reindex(full_index).ffill() + cash_diffs

    # Average buy price
    buys = actions_full['shares'].clip(lower=0)
    cum_buy_shares = buys.cumsum()
    cum_buy_cost = (buys * actions_full['price']).cumsum()
    avg_buy_price = cum_buy_cost.iloc[-1] / cum_buy_shares.iloc[-1] if cum_buy_shares.iloc[-1] > 0 else 0

    # Actions list
    actions_list = [
        {'date': d.strftime('%Y-%m-%d'), 'shares': abs(row['shares']), 'action': int(row['shares'] > 0), 'price': row['price']}
        for d, row in actions_full.iterrows() if row['shares'] != 0
    ]

    last_price = prices.reindex(full_index).ffill().iloc[-1]
    num_shares = cum_shares.iloc[-1]
    last_cash = cash_diffs.iloc[-1]
    last_value = total_value.iloc[-1]

    return total_value, last_value, last_cash, actions_list, num_shares, last_price, avg_buy_price

def get_df(tickers, db):
    """
    Fetch asset information from Firestore for a list of tickers.

    tickers: list of ticker symbols
    db: Firestore database object

    Returns:
        pd.DataFrame with asset data, indexed by ticker
    """
    # Construct document references in Firestore
    doc_refs = [db.collection("assets").document(ticker) for ticker in tickers]
    docs = db.get_all(doc_refs)

    data = []
    for doc in docs:
        if doc.exists:
            doc_data = doc.to_dict()
            doc_data['ticker'] = doc.id
            data.append(doc_data)

    if not data:
        return pd.DataFrame()

    df = pd.DataFrame(data)
    df.set_index('ticker', inplace=True)
    return df
