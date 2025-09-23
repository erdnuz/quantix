import yfinance as yf
import pandas as pd
import numpy as np
from datetime import timedelta
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

        # per-ticker state
        self.market_value = {}    # current market value per ticker
        self.contrib = {}         # cumulative pnl per ticker
        self.num = {}             # shares per ticker
        self.price = {}           # last price per ticker
        self.avg_buy = {}         # avg buy per ticker
        self.value = self.initial_cash
        self.tickers = tickers

        print(f"[DEBUG] Initializing Portfolio with tickers: {tickers}, initial_cash: {initial_cash}")
        self._process_tickers(tickers)

    # -----------------------------
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

    # -----------------------------
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

            pnl, total_value, cash_diff, action_list, num_shares, last_price, avg_buy = get_pnl(actions_series, price_series)
            print(f"[DEBUG] {ticker} -> shares: {num_shares}, last_price: {last_price}, cash_diff: {cash_diff}")

            # Cash after trade effects
            self.cash += float(cash_diff)

            # Holdings time series
            self.holdings[ticker] = pnl.astype(float)

            # Save per-ticker state
            current_market_val = float(num_shares * last_price)
            self.market_value[ticker] = current_market_val   # ✅ actual market value
            self.contrib[ticker] = float(pnl.iloc[-1])
            self.num[ticker] = float(num_shares)
            self.price[ticker] = float(last_price)
            self.avg_buy[ticker] = float(avg_buy)
            self.actions += [{**a, 'ticker': ticker} for a in action_list]

        # Total portfolio value over time (cash + positions)
        if not self.holdings.empty:
            total_positions = self.holdings.sum(axis=1)
            # Add starting cash to get total portfolio value
            total_value = total_positions + self.initial_cash
            self.holdings['portfolio'] = total_value / self.initial_cash
            # Latest portfolio value:
            self.value = float(self.cash + sum(self.market_value.values()))
            print(f"[DEBUG] Portfolio value updated: {self.value}, cash: {self.cash}")

    # -----------------------------
    def _compute_returns(self):
        if 'portfolio' not in self.holdings or self.holdings.empty:
            return {}, {}

        portfolio_series = self.holdings['portfolio'].astype(float)
        if len(portfolio_series) < 2:
            # Not enough data to compute anything meaningful
            return {
                'allTimeGrowth': float(portfolio_series.iloc[-1] - 1)
            }, {}

        curr_val = float(portfolio_series.iloc[-1])
        total_days = (portfolio_series.index[-1] - portfolio_series.index[0]).days

        def safe_period_return(days):
            if total_days < days:
                return None
            end_date = portfolio_series.index[-1]
            start_date = end_date - timedelta(days=days)
            subset = portfolio_series[portfolio_series.index >= start_date]
            if subset.empty:
                return None
            start_val = float(subset.iloc[0])
            return float((curr_val / start_val) ** (365 / days) - 1)

        returns = {'allTimeGrowth': float(curr_val - 1)}
        for d, k in [(365, 'oneYearGrowth'), (182, 'sixMonthGrowth'), (91, 'threeMonthGrowth'), (30, 'oneMonthGrowth')]:
            val = safe_period_return(d)
            if val is not None:
                returns[k] = val

        # CAGR & risk metrics
        if total_days >= 30:
            years = max(total_days / 365, 1e-6)
            start_value = float(portfolio_series.iloc[0])
            returns['cagr'] = float((curr_val / start_value) ** (1 / years) - 1)

            rolling_max = portfolio_series.cummax()
            drawdown = 1 - portfolio_series / rolling_max
            returns['maxDrawdown'] = float(drawdown.max())
            returns['avgDrawdown'] = float(drawdown.mean())

        alpha = beta = sharpe = None
        marketRet = {}
        if self.m_data and total_days >= 180:
            market_returns = pd.Series(self.m_data.get("market_returns")).astype(float)
            rfr = float(self.m_data.get("rfr"))
            rfr_adj = (1 + rfr) ** (1 / 12) - 1

            portfolio_ret = portfolio_series.pct_change().dropna()
            market_returns.index = pd.to_datetime(market_returns.index)
            portfolio_ret = portfolio_ret[portfolio_ret.index.isin(market_returns.index)]
            market_ret_aligned = market_returns.loc[portfolio_ret.index]

            portfolio_monthly = (1 + portfolio_ret).resample('ME').prod() - 1
            market_monthly = (1 + market_ret_aligned).resample('ME').prod() - 1

            if market_monthly.var() != 0 and len(portfolio_monthly) >= 6:
                cov_matrix = np.cov(portfolio_monthly, market_monthly)
                beta = float(cov_matrix[0, 1] / market_monthly.var())
                alpha = float(portfolio_monthly.mean() - (rfr_adj + beta * (market_monthly.mean() - rfr_adj)))
                sharpe = float((portfolio_monthly.mean() - rfr_adj) / portfolio_monthly.std())

                market_prices = (market_ret_aligned + 1).cumprod() - 1
                marketRet = {k.strftime('%Y-%m-%d'): float(v) for k, v in market_prices.items()}

        returns['alpha'] = alpha
        returns['beta'] = beta
        returns['sharpe'] = sharpe
        history = {k.strftime('%Y-%m-%d'): float(v) for k, v in portfolio_series.sub(1).items()}
        return returns, {'historicalReturns': history, 'marketReturns': marketRet}

    # -----------------------------
    def get_info(self):
        if not self.tickers or self.holdings.empty:
            return {}, {}

        basic, adv = self._compute_returns()

        # total value = cash + positions
        total_val = max(self.cash + sum(self.market_value.values()), 1e-9)
        invested_val = max(sum(self.market_value.values()), 1e-9)

        # Weights based on market value
        weights = {k: float(v / total_val) for k, v in self.market_value.items()}
        contrib = {k: float(v / invested_val) for k, v in self.contrib.items()}

        df = get_df(self.tickers.keys(), self.db)
        df['weight'] = df.index.map(weights).fillna(0).astype(float)
        df['contrib'] = df.index.map(contrib).fillna(0).astype(float)
        df['shares'] = df.index.map(self.num).fillna(0).astype(float)
        df['price'] = df.index.map(self.price).fillna(0).astype(float)
        df['avg_buy'] = df.index.map(self.avg_buy).fillna(0).astype(float)
        df['open_pnl'] = ((df['price'] / df['avg_buy']) - 1).replace([np.inf, -np.inf], 0).fillna(0).astype(float)

        # Asset weights
        asset_weight = {k: float(v) for k, v in df.groupby('asset-class')['weight'].sum().items()}
        asset_weight['Cash'] = float(self.cash / total_val)

        non_cash_assets = {k: v for k, v in asset_weight.items() if k.lower() != 'cash'}
        primary_asset = (
            max(non_cash_assets, key=non_cash_assets.get)
            if non_cash_assets and max(non_cash_assets.values()) > 0.75 * sum(non_cash_assets.values())
            else 'Mixed'
        )

        # Sector weights & contributions
        sector_weight = {k: float(v) for k, v in df.groupby('sector')['weight'].sum().items()}
        asset_contrib = {k: float(v) for k, v in df.groupby('asset-class')['contrib'].sum().items()}
        sector_contrib = {k: float(v) for k, v in df.groupby('sector')['contrib'].sum().items()}

        # Dividend yield
        div_yield = float((df['yield'] * df['weight']).sum()) if 'yield' in df else 0.0

        # Holdings dict
        holdings_columns = [
            'ticker','name','asset-class','sector','shares',
            'avg_buy','price','open_pnl','weight','yield','cagr'
        ]
        holdings = df[[c for c in holdings_columns if c in df.columns]].loc[df['shares'] != 0]
        holdings_dict = [
            {'ticker': k} | {
                c: (float(v) if isinstance(v, (np.floating, np.integer, np.int64, np.float64)) else v)
                for c, v in row.items()
            }
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
