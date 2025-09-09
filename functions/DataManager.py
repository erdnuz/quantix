import pandas as pd
from Asset import Asset
from MarketDataManager import MarketDataManager
import numpy as np
import os

def rank(df, min_set, is_equity):
    df_ranked = df.copy()
    if 'volume' in df_ranked.columns:
        df_ranked['volume'] = pd.to_numeric(df_ranked['volume'], errors='coerce')

    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col].dropna()):
            df_ranked[col] = df[col] * (-1 if col in min_set else 1)
    numeric_cols = [col for col in df_ranked.columns if pd.api.types.is_numeric_dtype(df_ranked[col].dropna()) and col not in NO_RANK]
    sector_ranked = df_ranked.copy()
    for col in numeric_cols:
        sector_ranked[col] = (
            sector_ranked.groupby('sector' if is_equity else 'category')[col]
            .transform(lambda x: x.dropna().rank(pct=True, method='min', ascending=True))
        )

    overall_ranked = df_ranked.copy()
    for col in numeric_cols:
        overall_ranked[col] = overall_ranked[col].dropna().rank(pct=True, method='min', ascending=True)

    sector_percentile_ranked = df_ranked.copy()
    for col in numeric_cols:
        sector_percentile_ranked[col] = sector_ranked[col].dropna().rank(pct=True, method='min', ascending=True)
        
    averaged_rank = sector_percentile_ranked.copy()
    for col in numeric_cols:
        sector_rank = sector_percentile_ranked[col].fillna(-1)
        overall_rank = overall_ranked[col]

        averaged_rank[col] = np.where(
            sector_rank < 0, 
            0.35*sector_rank + 0.65*overall_rank,  # Average if sector rank is non-zero
            overall_rank  # Use overall rank if sector rank is zero
        )
        averaged_rank[col] = pd.Series(averaged_rank[col]).dropna().rank(pct=True, method='min', ascending=True)

    return sector_ranked, overall_ranked, averaged_rank

def q_score(df, is_equity):
    simple = pd.DataFrame()
    #Growth
    simple['G'] = (
        0.2 * df['cagr'] +
        0.2 * df['yoy'] +
        0.2 * df['6mo'] +
        0.2 * df['3y'] +
        df['div-g'].fillna(0) * 0.2
    )
    missing_div_g_weight = df['div-g'].isna() * 0.2
    simple['G'] += missing_div_g_weight * df['3y']
    simple['G'] = simple['G'].rank(pct=True, method='min', ascending=True)

    df.fillna(0, inplace=True)

    #Risk
    simple['R'] = (
        0.3*df['max-d'] +
        0.2*df['avg-d'] +
        0.1*df['std-dev'] +
        0.2*df['var10'] +
        0.1*df['var5'] +
        0.1*df['var1']
    ).rank(pct=True, method='min', ascending=True)

    #Performance
    simple["PE"] = (
        df['alpha-adj'] +
        df['s-adj'] +
        df['ms-adj'] +
        df['omega'] +
        0.5*df['calmar'] +
        0.5*df['martin']
    ).rank(pct=True, method='min', ascending=True)

    if not is_equity:
        simple['OVERALL'] = (
            0.3*simple['G']+
            0.3*simple['R']+
            0.4*simple['PE']

        ).rank(pct=True, method='min', ascending=True)
        return simple
    
    #Valuation
    simple["V"] = (
        0.2*df['p-earnings'] +
        0.1*df['p-book'] +
        0.1*df['p-sales'] +
        0.3*df['peg'] +
        0.2*df['growth'] +
        0.1*df['wacc']
    ).rank(pct=True, method='min', ascending=True)

    #Profitability
    simple["PR"] = (
        0.3*df['profit-m'] +
        0.3*df['growth'] +
        0.2*df['roe'] +
        0.2*df['roa']
    ).rank(pct=True, method='min', ascending=True)

    #Leverage
    simple["L"] = (
        0.2*df['debt-e']+
        0.2*df['debt-a']+
        0.1*df['debt-ebit']+
        0.3*df['assets-l']+
        0.2*df['altman-z']
    ).rank(pct=True, method='min', ascending=True)

    simple['OVERALL'] = (
        0.2*simple['G']+
        0.1*simple['R']+
        0.1*simple['PE']+

        0.2*simple['V']+
        0.3*simple['PR']+
        0.1*simple['L']
    ).rank(pct=True, method='min', ascending=True)
    return simple
    
NO_RANK = {
    "ticker",
    "region",
    "market-cap",
    "num-an",
    "an-rec",
    "an-min",
    "an-max",
    "an-avg",
    "plot-sectors",
    "plot-holdings",
    "assets",
    "family",
    "category",
    "sector",
    "type"
}


MINIMIZE_SET = {
    'expenses',
    'max-d',
    'avg-d',
    'std-dev',
    'var1',
    'var5',
    'var10',

    'p-earnings',
    'p-book',
    'p-sales',
    'peg',

    'wacc',
    'debt-e',
    'debt-a',
    'debt-ebit',
}

LIGHT_COLS = [
    "name",
    "region",
    "market-cap-usd",
    "assets-usd",
    "sector", 
    "category",
    "type"
]

TABLE_COLS = [
    "name",
    "region",
    "market-cap-usd",
    "assets-usd",
    "sector", 
    "volume",
    "category",
    "turnover",
    "expenses",
    "yield",
    "holding-diversity",
    "sector-diversity",

    "OVERALL",
    "G",
    "R",
    "PE",
    "V",
    "PR",
    "L",

    "cagr",
    "3y",
    "6mo",
    "yoy",
    "div-g",

    "alpha",
    "sortino",
    "sharpe"
    "m-squared"
    "calmar",
    "martin",
    "omega",

    "max-d",
    "avg-d",
    "std-dev",
    "beta",
    "var1",
    "var5",
    "var10",

    "p-earnings",
    "p-book",
    "p-sales",
    "peg",

    "profit-m",
    "roe",
    "roa",
    "earnings-g",
    "revenue-g",

    "wacc",
    "debt-e",
    "debt-a",
    "debt-ebit",
    "assets-l",
    "altman-z",
]
def split_df(df):
    light_df = df.copy().drop(columns=[col for col in df.columns if col not in LIGHT_COLS])
    table_df = df.copy().drop(columns=[col for col in df.columns if col not in TABLE_COLS])
    return light_df, table_df, df



class DataManager:


    def build_df(self, fp, type=0):
        m_data = MarketDataManager().get_data()

        cache_file = "./cache/" + fp.split('/')[-1].replace('.txt', '_cache.pkl')

        if os.path.exists(cache_file):
            cached_metrics = pd.read_pickle(cache_file)
            print("Loaded cached metrics.")
        else:
            cached_metrics = pd.DataFrame()

        
        
        t_set = set(self._read_tickers(fp))
        tickers =  list(t_set)

        data = []
        for i, asset in enumerate(tickers):
            if asset in cached_metrics.index:  # Use cached metrics if available
                print(f"Using cached metrics for {asset}.")
                metrics = cached_metrics.loc[asset].to_dict()
            else:
                
                metrics = self.get_metrics(asset, type, m_data)
                if metrics:
                    print(f"Successfully fetched {asset}.")
                    data.append(metrics)
                else:
                    print(f"Failed to fetch {asset}.")

            # Save cache every 10 new assets processed
            if (i + 1) % 10 == 0 and data:
                temp_df = pd.DataFrame(data)
                temp_df.set_index('ticker', inplace=True)
                cached_metrics = pd.concat([cached_metrics, temp_df])
                cached_metrics.to_pickle(cache_file)
                print(f"Cache saved after processing {i + 1} assets.")
                data = []  # Clear the temporary data list to avoid duplicate entries

        # Final save for remaining metrics
        if data:
            temp_df = pd.DataFrame(data)
            temp_df.set_index('ticker', inplace=True)
            cached_metrics = pd.concat([cached_metrics, temp_df])
            cached_metrics.to_pickle(cache_file)
            print("Final cache saved.")

        drop = [t for t in cached_metrics.index if t not in t_set]
        print(f"Dropping {len(drop)} rows. Eg.", drop[:5])
        df = cached_metrics.copy().drop(index=drop)
        ranked_sector, ranked_overall, ranked_avg = rank(df, MINIMIZE_SET, type==0)
        print(ranked_sector.columns)
        if type == 0:
            q_scores = q_score(ranked_avg, type==0)
        else:
            q_scores = q_score(ranked_overall, type==0)
        q_scores["sector"] = ranked_sector["sector"]
        if type>0:
            q_scores["category"] = ranked_sector["category"]

        q_ranked, _, _ = rank(q_scores, MINIMIZE_SET, type==0)
        new_columns = {col+"_SECT": q_ranked[col] for col in q_ranked.columns if pd.api.types.is_numeric_dtype(q_scores[col]) and col not in NO_RANK}

        new_columns.update({col + "_SECT": ranked_sector[col] for col in ranked_sector.columns if col == 'volume' or pd.api.types.is_numeric_dtype(df[col]) and col not in NO_RANK})
        new_columns.update({col + "_OVER": ranked_overall[col] for col in ranked_overall.columns if col == 'volume' or pd.api.types.is_numeric_dtype(df[col]) and col not in NO_RANK})

        # Concatenate the new columns with the original DataFrame
        df = pd.concat([df, pd.DataFrame(new_columns, index=df.index), q_scores], axis=1)

        df = df.drop(columns=[col for col in df.columns if "-adj" in col])


        numeric_lowercase_cols = [
        col for col in df.columns 
        if col.islower() and pd.api.types.is_numeric_dtype(df[col])
        ]
        filtered_df = df[numeric_lowercase_cols]
        
        # Compute descriptive statistics
        stats = filtered_df.describe(percentiles=[0.25, 0.5, 0.75]).T  # Transpose for readability
        
        # Save the statistics to a CSV file
        stats.to_csv("./tables/" + fp.split('/')[-1].replace('.txt','.csv'), index=True)
        return split_df(df)

    def get_metrics(self, ticker, type, m_data) -> dict:
        print(ticker)
        asset = Asset(ticker, type=type, m_data=m_data)
        return asset.update_metrics()

    def _read_tickers(self, filepath: str) -> list:
        tickers = []
        try:
            with open(filepath, "r") as file:
                for line in file:
                    ticker = line.strip()
                    tickers.append(ticker)
        except FileNotFoundError:
            print(f"File not found: {filepath}")
        return tickers
    