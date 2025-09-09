import requests
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import numpy as np
import time


API_KEY = "3b9e34af15234c0839b7e6b7a181ca94"
BASE_URL = 'https://api.stlouisfed.org/fred/'
INDICATORS = {
    'gdp_growth': 'A191RL1Q225SBEA', 
    'unemployment_rate': 'UNRATE',
    'inflation_rate': 'CPIAUCSL',
    'interest_rate': 'FEDFUNDS',
    'consumer_confidence': 'CSCICP03USM665S',
    'yield_curve': 'T10Y2Y',
}
WEIGHTS = {
    'gdp_growth': 0.2,
    'unemployment_rate': 0.1,
    'inflation_rate': 0.1,
    'interest_rate': 0.1,
    'consumer_confidence': 0.3,
    'yield_curve': 0.05,
    'spx': 0.1,
    'dji': 0.1,
}
THRESHOLDS = {
    'gdp_growth': 2,
    'unemployment_rate': 0,
    'inflation_rate': -0.003,
    'interest_rate': -0.05,
    'consumer_confidence': 98,
    'yield_curve': 0.25,
    'spx': -0.01,
    'dji': -0.01
}

MS_PATH = './macro.json'



class MacroRisk:
    def __init__(self, years_back=20): 
        self.update_data()

    def get_indicator_data(self, series_id, years_back=20):
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years_back * 365) 
        url = f"{BASE_URL}series/observations"
        params = {
            'series_id': series_id,
            'api_key': API_KEY,
            'file_type': 'json',
            'observation_start': start_date.strftime('%Y-%m-%d'),
            'observation_end': end_date.strftime('%Y-%m-%d')
        }
        response = requests.get(url, params=params)
        if response:
            data = response.json()['observations']
        else:
            raise IndexError("Request failed.")
        
        dates = [d['date'] for d in data]
        values = [float(d['value']+'0') for d in data]
        series = pd.Series(values, index=pd.to_datetime(dates))

        # Adjust the series based on the specific indicator
        if series_id == 'UNRATE':
            result = -series.rolling(2).mean() + series.ewm(15).mean()
        elif series_id == 'CPIAUCSL':
            result = -series.diff().ewm(8).mean() / series
        elif series_id == 'FEDFUNDS':
            result = series.diff().ewm(8).mean()
        elif series_id == 'T10Y2Y':
            der = series.ewm(50).mean()
            turning_points = (der < 0.5) & (der.pct_change() > 0.0005)
            turning_points_series = pd.Series(1, index=series.index)  # Initialize with NaN
            turning_points_series[turning_points] = -1
            result = turning_points_series.rolling(200).mean()
        else:
            result = series
        return result

    def get_market_data(self, years_back=20):
        start_time = time.time()  # Start timing
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years_back * 365)

        # Define the tickers for major U.S. indices
        tickers = {
            'spx': '^GSPC',  # S&P 500 Index
            'dji': '^DJI',  # NASDAQ Composite Index
        }
        
        # Create a DataFrame to store market data
        market_data = pd.DataFrame()
        
        market_data['REFERENCE'] = yf.download('^GSPC', start=start_date, end=end_date)['Close']
        for name, ticker in tickers.items():
            data = yf.download(ticker, start=start_date, end=end_date)
            ser = data['Close']
            macd = ser.rolling(120).mean() - ser.rolling(260).mean()
            market_data[name] = (macd - macd.rolling(90).mean()) / ser.rolling(90).mean()
        
        return market_data

    def get_df(self, years_back=20):
        
        data = self.get_market_data(years_back)
        data.index = data.index.tz_localize(None)
        for indicator, series_id in INDICATORS.items():
            series = self.get_indicator_data(series_id, years_back=years_back)
            data[indicator]=series
        data = data.ffill()
        self.df = data
        self.df['REF'] = np.where(self.df['REFERENCE'].rolling(90).mean() - self.df['REFERENCE'].rolling(150).mean() > 0, 0.5, 2)

    def plot(self, sum_only=True):
        self.get_df()

        self.df["SUM"] = 0
        
        for col in self.df.columns:
            if col == "REFERENCE":
                continue  # Skip the reference column itself

            if col != 'SUM' and col!="REF":
                below_threshold = self.df[col] < THRESHOLDS[col]
                self.df["SUM"] += np.where(below_threshold, WEIGHTS[col], 0)

            # Plot the reference column on the first y-axis
            
            if col== 'SUM' or not sum_only:
                

                # Add threshold lines
                if col=='SUM' or col=='REF':
                    mean = self.df['SUM'].rolling(600).mean()
                    std = self.df['SUM'].rolling(600).std()
                    self.df['SUM'] = 0.5 * (self.df['SUM'] - mean) / std + 0.5
                    self.df['SUM'] = self.df['SUM'] * self.df['REF']
                    self.df['SUM'] = (self.df['SUM'].ewm(20).mean().clip(lower=-0.2, upper=1.8) + 0.2) / 2
                    self.sum = self.df["SUM"]

                

    def update_data(self):
        self.plot()
        sum_data = self.sum.copy() 
        sum_data.dropna(inplace=True)          

        return sum_data
    
    
