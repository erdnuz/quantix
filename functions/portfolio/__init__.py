import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from market_data import MarketDataManager
from portfolio.helpers import get_pnl, get_df


class Portfolio:
    def __init__(self, tickers: dict, initial_cash: float, db):
        self.db = db
        self.m_data = MarketDataManager().get_data()
        self.initial_cash = float(initial_cash)
        self.cash = self.initial_cash
        self.actions = []
        self.holdings = pd.DataFrame()
        self.weights = {}
        self.contrib = {}
        self.num = {}
        self.price = {}
        self.avg_buy = {}
        self.value = self.initial_cash
        self.tickers = tickers

        print(f"[DEBUG] Initializing Portfolio with tickers: {tickers}, initial_cash: {initial_cash}")
        self._process_tickers(tickers)

    # --- Internal helpers ---
    def _prepare_prices(self, tickers: dict):
        print("[DEBUG] Preparing prices...")
        all_dates = {pd.to_datetime(d).tz_localize(None) for t in tickers for d in tickers[t].keys()}
        min_date = min(all_dates) - timedelta(weeks=1)
        tick_list = list(tickers.keys())
        print(f"[DEBUG] Downloading data for tickers: {tick_list} starting from {min_date}")

        prices = yf.download(
            tick_list,
            start=min_date.strftime('%Y-%m-%d'),
            interval='1d'
        )['Close'].ffill()

        print(f"[DEBUG] Prices fetched, head:\n{prices.head()}")
        return prices

    def _process_tickers(self, tickers: dict):
        tickers = {t: a for t, a in tickers.items() if a}
        if not tickers:
            print("[DEBUG] No valid tickers with actions.")
            return

        prices = self._prepare_prices(tickers)

        for ticker, actions in tickers.items():
            print(f"[DEBUG] Processing {ticker} with actions: {actions}")
            actions_series = pd.Series({pd.to_datetime(d): float(qty) for d, qty in actions.items()})

            price_series = prices[ticker].dropna()
            if price_series.empty:
                print(f"[DEBUG] No daily prices found for {ticker}, fetching hourly history.")
                price_series = yf.Ticker(ticker).history(period='max', interval='1h')['Close'].ffill()

            if price_series.empty:
                print(f"[WARNING] No price data available for {ticker}, skipping.")
                continue

            pnl, val, cash_diff, action_list, num_shares, last_price, avg_buy = get_pnl(actions_series, price_series)
            print(f"[DEBUG] {ticker} -> last_price: {last_price}, cash_diff: {cash_diff}")

            self.cash += float(cash_diff)
            self.holdings[ticker] = pnl.astype(float)
            self.contrib[ticker] = float(pnl.iloc[-1])
            self.weights[ticker] = float(val)
            self.num[ticker] = float(num_shares)
            self.price[ticker] = float(last_price)
            self.avg_buy[ticker] = float(avg_buy)
            self.actions += [{**a, 'ticker': ticker} for a in action_list]

        if not self.holdings.empty:
            total_value = self.holdings.sum(axis=1) + self.initial_cash
            self.holdings['portfolio'] = total_value / self.initial_cash
            self.value = float(total_value.iloc[-1])
            print(f"[DEBUG] Portfolio value updated: {self.value}")

    # --- Returns & performance metrics ---
    def _compute_returns(self):
        if 'portfolio' not in self.holdings or self.holdings.empty:
            return {}, {}

        portfolio_series = self.holdings['portfolio'].astype(float)
        curr_val = float(portfolio_series.iloc[-1])

        def period_return(days):
            end_date = portfolio_series.index[-1]
            start_date = end_date - timedelta(days=days)
            start_val = portfolio_series.loc[portfolio_series.index >= start_date].iloc[0]
            return float((curr_val / start_val)**(365/days) - 1)

        returns = {
            'allTimeGrowth': float(curr_val - 1),
            'oneYearGrowth': period_return(days=365),
            'sixMonthGrowth': period_return(days=182),
            'threeMonthGrowth': period_return(days=91),
            'oneMonthGrowth': period_return(days=30)
        }

        # CAGR
        total_days = (portfolio_series.index[-1] - portfolio_series.index[0]).days
        years = max(total_days / 365, 1e-6)
        start_value = float(portfolio_series.iloc[0])
        returns['cagr'] = float((curr_val / start_value) ** (1 / years) - 1)

        # Risk metrics
        rolling_max = portfolio_series.cummax()
        drawdown = 1 - portfolio_series / rolling_max
        returns['maxDrawdown'] = float(drawdown.max())
        returns['avgDrawdown'] = float(drawdown.mean())

        # Alpha & Sharpe
        alpha = beta = sharpe = None
        if self.m_data and len(portfolio_series) > 93:
            market_returns = pd.Series(self.m_data.get("market_returns")).astype(float)
            rfr = float(self.m_data.get("rfr"))
            rfr_adj = (1 + rfr) ** (1 / 12) - 1

            portfolio_ret = portfolio_series.pct_change().dropna()
            market_returns.index = pd.to_datetime(market_returns.index)
            portfolio_ret = portfolio_ret[portfolio_ret.index.isin(market_returns.index)]
            market_ret_aligned = market_returns.loc[portfolio_ret.index]

            beta = float(np.cov(portfolio_ret, market_ret_aligned)[0, 1] / market_ret_aligned.var())
            alpha = float(portfolio_ret.mean() - (rfr_adj + beta * (market_ret_aligned.mean() - rfr_adj)))
            sharpe = float((portfolio_ret.mean() - rfr_adj) / portfolio_ret.std())

        returns['alpha'] = alpha
        returns['beta'] = beta
        returns['sharpe'] = sharpe

        history = {k.strftime('%Y-%m-%d'): float(v) for k, v in portfolio_series.sub(1).items()}
        return returns, {'historicalReturns': history}

    def get_info(self):
        if not self.tickers or self.holdings.empty:
            return {}, {}

        basic, adv = self._compute_returns()

        total_val = float(self.value)
        weights = {k: float(v / total_val) for k, v in self.weights.items()}
        contrib = {k: float(v / (total_val - self.initial_cash)) for k, v in self.contrib.items()}

        df = get_df(self.tickers.keys(), self.db)
        df['weight'] = df.index.map(weights).fillna(0).astype(float)
        df['contrib'] = df.index.map(contrib).fillna(0).astype(float)
        df['shares'] = df.index.map(self.num).fillna(0).astype(float)
        df['price'] = df.index.map(self.price).fillna(0).astype(float)
        df['avg_buy'] = df.index.map(self.avg_buy).fillna(0).astype(float)
        df['open_pnl'] = (df['price'] / df['avg_buy'] - 1).fillna(0).astype(float)

        asset_weight = {k: float(v) for k, v in df.groupby('asset-class')['weight'].sum().items()}
        asset_weight['Cash'] = 1 - sum([k for k in asset_weight.values()])
        
        primary_asset = max(asset_weight, key=asset_weight.get) if asset_weight and max(asset_weight.values()) >= 0.5 * sum(asset_weight.values()) else 'Mixed'
        sector_weight = {k: float(v) for k, v in df.groupby('sector')['weight'].sum().items()}
        asset_contrib = {k: float(v) for k, v in df.groupby('asset-class')['contrib'].sum().items()}
        sector_contrib = {k: float(v) for k, v in df.groupby('sector')['contrib'].sum().items()}
        div_yield = float((df['yield'] * df['weight']).sum())

        holdings_columns = ['ticker','name','asset-class','sector','shares','avg_buy','price','open_pnl','weight','yield','cagr']
        holdings = df[[c for c in holdings_columns if c in df.columns]].loc[df['shares'] != 0]
        holdings_dict = [
            {'ticker':k} | {c: (float(v) if isinstance(v, (np.floating, np.integer, np.int64, np.float64)) else v)
                     for c, v in row.items()}
            for k, row in holdings.T.to_dict().items()
        ]

        return {
            **basic,
            'primaryAssetClass': str(primary_asset),
            'dividendYield': div_yield
        }, {
            **adv,
            'assetWeight': asset_weight,
            'sectorWeight': sector_weight,
            'assetContrib': asset_contrib,
            'sectorContrib': sector_contrib,
            'actionsDict': self.actions,
            'holdingsDict': holdings_dict
        }
