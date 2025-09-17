import numpy as np
import pandas as pd

def clean_df(df: pd.DataFrame) -> pd.DataFrame:
    # Keep only numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns

    # Replace infinite values with NaN
    df[numeric_cols] = df[numeric_cols].replace([np.inf, -np.inf], np.nan)

    if 'pe' in df.columns and 'peg' in df.columns:
        df['peg'] = df.apply(lambda x: x['peg'] if x['pe'] > 0 else np.nan, axis=1)


    # Enforce positive values for selected columns if they exist
    for col in ['roe', 'roa', 'altman-z', 'p-earnings', 'p-sales', 'p-book', 'profit-m', 'debt-e', 'debt-a']:
        if col in numeric_cols:
            df[col] = df[col].apply(lambda x: x if x > 0 else np.nan)

    # Remove extreme outliers using 1.5*IQR rule
    for col in numeric_cols:
        if col in ['market-cap', 'volume', 'assets', 'num-an', 'an-rec', 'an-min', 'an-max', 'an-avg']:
            continue
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        df[col] = df[col].apply(lambda x: x if lower <= x <= upper else np.nan)

    return df
