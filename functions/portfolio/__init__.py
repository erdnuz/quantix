import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from market_data import MarketDataManager
from portfolio.helpers import get_pnl, get_df

class Portfolio:
    def __init__(self, tickers: dict, initial_cash: float, db):
        """
        tickers: dict of ticker -> {date: shares_change}
        """
        self.db = db
        self.m_data = MarketDataManager().get_data()
        self.initial_cash = initial_cash
        self.cash = initial_cash
        self.actions = []
        self.holdings = pd.DataFrame()
        self.weights = {}
        self.contrib = {}
        self.num = {}
        self.price = {}
        self.avg_buy = {}
        self.value = initial_cash
        self.tickers = tickers

        self._process_tickers(tickers)

    # --- Internal helpers ---
    def _prepare_prices(self, tickers: dict):
        all_dates = {pd.to_datetime(d) for t in tickers for d in tickers[t].keys()}
        min_date = min(all_dates) - timedelta(weeks=1)
        tick_list = list(tickers.keys())
        prices = yf.download(tick_list, start=min_date.strftime('%Y-%m-%d'), interval='1d')['Close'].ffill()
        return prices

    def _process_tickers(self, tickers: dict):
        tickers = {t: a for t, a in tickers.items() if a}  # remove empty actions
        if not tickers:
            return

        prices = self._prepare_prices(tickers)

        for ticker, actions in tickers.items():
            actions_std = {pd.to_datetime(d): qty for d, qty in actions.items()}
            price_series = prices[ticker].dropna()
            if price_series.empty:
                price_series = yf.Ticker(ticker).history(period='max', interval='1h')['Close'].ffill()

            if not price_series.empty:
                pnl, val, cash_diff, action_list, num_shares, last_price, avg_buy = get_pnl(actions_std, price_series)

                self.cash += cash_diff
                self.holdings[ticker] = pnl
                self.contrib[ticker] = pnl.iloc[-1]
                self.weights[ticker] = val
                self.num[ticker] = num_shares
                self.price[ticker] = last_price
                self.avg_buy[ticker] = avg_buy
                self.actions += [{**a, 'ticker': ticker} for a in action_list]

        if not self.holdings.empty:
            total_value = self.holdings.sum(axis=1) + self.initial_cash
            self.holdings['portfolio'] = total_value / self.initial_cash
            self.value = total_value.iloc[-1]

    # --- Returns & performance metrics ---
    def _compute_returns(self):
        if 'portfolio' not in self.holdings or self.holdings.empty:
            return {}, {}

        portfolio_series = self.holdings['portfolio']
        curr_val = portfolio_series.iloc[-1]
        all_time = curr_val - 1

        # Approximate returns
        def period_return(days):
            if len(portfolio_series) >= days:
                return curr_val / portfolio_series.iloc[-days] - 1
            return all_time

        returns = {
            'all': all_time,
            '1y': period_return(252),
            '6m': period_return(126),
            '3m': period_return(63),
            '1m': period_return(21)
        }

        # CAGR
        total_days = len(portfolio_series)
        years = min(5, total_days / 252)
        start_value = portfolio_series.iloc[max(0, total_days - int(years * 252))]
        returns['cagr'] = (curr_val / start_value) ** (1 / years) - 1

        # Risk metrics
        rolling_max = portfolio_series.cummax()
        drawdown = 1 - portfolio_series / rolling_max
        returns['max_drawdown'] = drawdown.max()

        # Alpha & Sharpe
        if self.m_data and len(portfolio_series) > 93:
            market_returns = pd.Series(self.m_data.get("market_returns"))
            rfr = self.m_data.get("rfr")
            rfr_adj = (1 + rfr) ** (1/12) - 1

            portfolio_ret = portfolio_series.pct_change().dropna()
            market_returns.index = pd.to_datetime(market_returns.index)
            portfolio_ret = portfolio_ret[portfolio_ret.index.isin(market_returns.index)]
            market_ret_aligned = market_returns.loc[portfolio_ret.index]

            beta = np.cov(portfolio_ret, market_ret_aligned)[0, 1] / market_ret_aligned.var()
            alpha = portfolio_ret.mean() - (rfr_adj + beta * (market_ret_aligned.mean() - rfr_adj))
            sharpe = (portfolio_ret.mean() - rfr_adj) / portfolio_ret.std()
        else:
            alpha = beta = sharpe = None

        returns['alpha'] = alpha
        returns['beta'] = beta
        returns['sharpe'] = sharpe

        return returns, {'hist': portfolio_series.sub(1).to_dict()}

    def get_info(self):
        if not self.tickers or not self.holdings.any().any():
            return {}, {}

        basic, adv = self._compute_returns()

        # Normalize weights & contributions
        total_val = self.value
        weights = {k: v / total_val for k, v in self.weights.items()}
        contrib = {k: v / (total_val - self.initial_cash) for k, v in self.contrib.items()}

        df = get_df(self.tickers.keys(), self.db)
        df['weight'] = df.index.map(weights).fillna(0)
        df['contrib'] = df.index.map(contrib).fillna(0)
        df['shares'] = df.index.map(self.num).fillna(0)
        df['price'] = df.index.map(self.price).fillna(0)
        df['avg_buy'] = df.index.map(self.avg_buy).fillna(0)
        df['open_pnl'] = df['price'] / df['avg_buy'] - 1

        # Asset/sector/region breakdown
        asset_weight = df.groupby('asset-class')['weight'].sum()
        primary_asset = asset_weight.idxmax() if asset_weight.max() >= 0.5 * asset_weight.sum() else 'Diversified'
        sector_weight = df.groupby('sector')['weight'].sum().to_dict()
        asset_contrib = df.groupby('asset-class')['contrib'].sum().to_dict()
        sector_contrib = df.groupby('sector')['contrib'].sum().to_dict()
        div_yield = (df['yield'] * df['weight']).sum()

        holdings_columns = ['ticker','name','asset-class','sector','shares','avg_buy','price','open_pnl','weight','yield','cagr']
        holdings = df[[c for c in holdings_columns if c in df.columns]].loc[df['shares'] != 0]

        result = {
            **basic,
            'primary_class': str(primary_asset),
            'yield': div_yield
        }

        return result, {
            **adv,
            'asset_weight': asset_weight.to_dict(),
            'sector_weight': sector_weight,
            'asset_contrib': asset_contrib,
            'sector_contrib': sector_contrib,
            'actions': self.actions,
            'df': holdings.T.to_dict()
        }
