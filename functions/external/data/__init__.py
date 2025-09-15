import pandas as pd
import numpy as np
import os
from asset import Asset
from market_data import MarketDataManager
from typing import Tuple, List
from tqdm import tqdm


# -----------------------
# Constants
# -----------------------
NO_RANK = {
    "ticker", "asset-class", "name", "next-earnings",
    "market-cap", "num-an", "an-rec", "an-min", "an-max", "an-avg",
    "plot-sectors", "plot-holdings", "assets", "category", "sector",
}

MINIMIZE_SET = {
    'expenses', 'max-d', 'avg-d', 'std-dev', 'var1', 'var5', 'var10',
    'p-earnings', 'p-book', 'p-sales', 'peg',
    'wacc', 'debt-e', 'debt-a', 'debt-ebit',
}

LIGHT_COLS = ["name", "market-cap", "assets", "asset-class" "sector", "category"]

TABLE_COLS = [
    "name", "market-cap", "assets", "asset-class", "sector", "volume", "category", "turnover",
    "expenses", "yield", "holding-diversity", "sector-diversity",
    "OVERALL", "G", "R", "PE", "V", "PR", "L",
    "cagr", "3y", "6mo", "yoy", "div-g",
    "alpha", "sortino", "sharpe", "m-squared", "calmar", "martin", "omega",
    "max-d", "avg-d", "std-dev", "beta", "var1", "var5", "var10",
    "p-earnings", "p-book", "p-sales", "peg",
    "profit-m", "roe", "roa", "earnings-g", "revenue-g",
    "wacc", "debt-e", "debt-a", "debt-ebit", "assets-l", "altman-z",
]


# -----------------------
# Ranking Functions
# -----------------------
def rank(df: pd.DataFrame, min_set: set, is_equity: bool) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    df_ranked = df.copy()
    if 'volume' in df_ranked.columns:
        df_ranked['volume'] = pd.to_numeric(df_ranked['volume'], errors='coerce')

    # Minimize columns in min_set
    for col in df_ranked.select_dtypes(include=np.number):
        df_ranked[col] *= -1 if col in min_set else 1

    numeric_cols = [col for col in df_ranked.columns
                    if pd.api.types.is_numeric_dtype(df_ranked[col].dropna()) and col not in NO_RANK]

    # Sector / category rank
    sector_ranked = df_ranked.copy()
    group_col = 'sector' if is_equity else 'category'
    for col in numeric_cols:
        sector_ranked[col] = sector_ranked.groupby(group_col)[col] \
            .transform(lambda x: x.dropna().rank(pct=True, method='min', ascending=True))

    # Overall rank
    overall_ranked = df_ranked.copy()
    for col in numeric_cols:
        overall_ranked[col] = overall_ranked[col].dropna().rank(pct=True, method='min', ascending=True)

    # Sector percentile rank
    sector_percentile_ranked = df_ranked.copy()
    for col in numeric_cols:
        sector_percentile_ranked[col] = sector_ranked[col].dropna().rank(pct=True, method='min', ascending=True)

    # Averaged rank
    averaged_rank = sector_percentile_ranked.copy()
    for col in numeric_cols:
        sector_rank = sector_percentile_ranked[col].fillna(-1)
        overall_rank = overall_ranked[col]
        averaged_rank[col] = np.where(
            sector_rank < 0,
            0.35*sector_rank + 0.65*overall_rank,
            overall_rank
        )
        averaged_rank[col] = pd.Series(averaged_rank[col]).dropna().rank(pct=True, method='min', ascending=True)

    return sector_ranked, overall_ranked, averaged_rank


# -----------------------
# Q-Score Calculation
# -----------------------
def q_score(df: pd.DataFrame, is_equity: bool) -> pd.DataFrame:
    df = df.fillna(0)
    simple = pd.DataFrame()

    # Growth
    simple['G'] = (
        0.2*df['cagr'] + 0.2*df['yoy'] + 0.2*df['6mo'] + 0.2*df['3y'] + 0.2*df['div-g']
    )
    missing_div_g_weight = df['div-g'].isna() * 0.2
    simple['G'] += missing_div_g_weight * df['3y']
    simple['G'] = simple['G'].rank(pct=True, method='min', ascending=True)

    # Risk
    simple['R'] = (
        0.3*df['max-d'] + 0.2*df['avg-d'] + 0.1*df['std-dev'] +
        0.2*df['var10'] + 0.1*df['var5'] + 0.1*df['var1']
    ).rank(pct=True, method='min', ascending=True)

    # Performance
    simple['PE'] = (
        df['alpha-adj'] + df['s-adj'] + df['ms-adj'] + df['omega'] +
        0.5*df['calmar'] + 0.5*df['martin']
    ).rank(pct=True, method='min', ascending=True)

    if not is_equity:
        simple['OVERALL'] = (0.3*simple['G'] + 0.3*simple['R'] + 0.4*simple['PE']) \
            .rank(pct=True, method='min', ascending=True)
        return simple

    # Valuation
    simple['V'] = (
        0.2*df['p-earnings'] + 0.1*df['p-book'] + 0.1*df['p-sales'] +
        0.3*df['peg'] + 0.2*df['growth'] + 0.1*df['wacc']
    ).rank(pct=True, method='min', ascending=True)

    # Profitability
    simple['PR'] = (
        0.3*df['profit-m'] + 0.3*df['growth'] + 0.2*df['roe'] + 0.2*df['roa']
    ).rank(pct=True, method='min', ascending=True)

    # Leverage
    simple['L'] = (
        0.2*df['debt-e'] + 0.2*df['debt-a'] + 0.1*df['debt-ebit'] +
        0.3*df['assets-l'] + 0.2*df['altman-z']
    ).rank(pct=True, method='min', ascending=True)

    # Overall Q-score
    simple['OVERALL'] = (
        0.2*simple['G'] + 0.1*simple['R'] + 0.1*simple['PE'] +
        0.2*simple['V'] + 0.3*simple['PR'] + 0.1*simple['L']
    ).rank(pct=True, method='min', ascending=True)

    return simple


# -----------------------
# DataManager
# -----------------------
class DataManager:

    def build_df(self, tickers, is_equity: bool) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        m_data = MarketDataManager().get_data()
        cached_metrics = self._load_cache(is_equity)

        cached_metrics = self._fetch_metrics(tickers, cached_metrics, m_data, is_equity)
        

        # Filter only requested tickers
        df = cached_metrics.loc[tickers].copy()

        # Rankings
        ranked_sector, ranked_overall, ranked_avg = rank(df, MINIMIZE_SET, is_equity)
        q_scores = q_score(ranked_avg if is_equity else ranked_overall, is_equity)
        q_scores["sector"] = ranked_sector["sector"]
        if not is_equity:
            q_scores["category"] = ranked_sector["category"]

        # Merge all rankings
        q_ranked, _, _ = rank(q_scores, MINIMIZE_SET, is_equity)
        new_cols = {
            f"{col}_SECT": q_ranked[col] for col in q_ranked.columns
            if pd.api.types.is_numeric_dtype(q_scores[col]) and col not in NO_RANK
        }
        new_cols.update({
            f"{col}_SECT": ranked_sector[col] for col in ranked_sector.columns
            if col == 'volume' or pd.api.types.is_numeric_dtype(df[col]) and col not in NO_RANK
        })
        new_cols.update({
            f"{col}_OVER": ranked_overall[col] for col in ranked_overall.columns
            if col == 'volume' or pd.api.types.is_numeric_dtype(df[col]) and col not in NO_RANK
        })

        df = pd.concat([df, pd.DataFrame(new_cols, index=df.index), q_scores], axis=1)
        df = df.drop(columns=[col for col in df.columns if "-adj" in col])
        df = df.loc[:, ~df.columns.duplicated()]  # Drop duplicate columns


        # Save descriptive stats
        numeric_lowercase_cols = [col for col in df.columns if col.islower() and pd.api.types.is_numeric_dtype(df[col])]
        df[numeric_lowercase_cols].describe(percentiles=[0.25,0.5,0.75]).T.to_csv(
            f"./tables/{ 'equities' if is_equity else 'etfs'}", index=True
        )

        return split_df(df)

    def get_metrics(self, ticker: str, is_equity: bool, m_data) -> dict:
        asset = Asset(ticker, is_equity, m_data=m_data)
        return asset.get_metrics()

    def _load_cache(self, is_equity) -> pd.DataFrame:
        cache_file = f"./cache/{ 'equities' if is_equity else 'etfs'}_cache.pkl"
        return pd.read_pickle(cache_file) if os.path.exists(cache_file) else pd.DataFrame()

    def _save_cache(self, df: pd.DataFrame, is_equity):
        cache_file = f"./cache/{ 'equities' if is_equity else 'etfs'}_cache.pkl"
        df.to_pickle(cache_file)

    def _fetch_metrics(
        self,
        tickers: List[str],
        cached_metrics: pd.DataFrame,
        m_data,
        is_equity: bool,
        batch_size: int = 20
    ) -> pd.DataFrame:
        """
        Fetch metrics for tickers not already in cached_metrics, saving cache every `batch_size`.
        Checks for extra columns in cached_metrics vs new batch and asks user whether to delete them.
        """
        new_metrics = []

        for ticker in tqdm(tickers, desc="Fetching metrics"):
            if ticker in cached_metrics.index:
                continue

            metrics = self.get_metrics(ticker, is_equity, m_data)
            if metrics:
                new_metrics.append(metrics)

                # Save every `batch_size` metrics
                if len(new_metrics) % batch_size == 0:
                    batch_df = pd.DataFrame(new_metrics).set_index('ticker')

                    # Check for extra columns in cached_metrics
                    extra_cols = set(cached_metrics.columns) - set(batch_df.columns)
                    if extra_cols:
                        print(f"Extra columns in cached metrics not in new batch: {extra_cols}")
                        answer = input("Do you want to delete these columns? [y/N]: ").strip().lower()
                        if answer == 'y':
                            cached_metrics = cached_metrics.drop(columns=list(extra_cols))

                    # Concatenate and save
                    cached_metrics = pd.concat([cached_metrics, batch_df], axis=0, join='outer')
                    self._save_cache(cached_metrics, is_equity)
                    new_metrics.clear()  # reset batch

        # Save any remaining metrics
        if new_metrics:
            batch_df = pd.DataFrame(new_metrics).set_index('ticker')

            # Check for extra columns in cached_metrics
            extra_cols = set(cached_metrics.columns) - set(batch_df.columns)
            if extra_cols:
                print(f"Extra columns in cached metrics not in final batch: {extra_cols}")
                answer = input("Do you want to delete these columns? [y/N]: ").strip().lower()
                if answer == 'y':
                    cached_metrics = cached_metrics.drop(columns=list(extra_cols))

            cached_metrics = pd.concat([cached_metrics, batch_df], axis=0, join='outer')
            self._save_cache(cached_metrics, is_equity)

        return cached_metrics





# -----------------------
# Split DF
# -----------------------
def split_df(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    light_df = df[[col for col in df.columns if col in LIGHT_COLS]].copy()
    table_df = df[[col for col in df.columns if col in TABLE_COLS]].copy()
    for column in df.columns:
        print(column)
    return light_df, table_df, df

