import json
import os
from datetime import datetime
from yahoo.yfHelper import yfHelper
import pandas as pd

class MarketDataManager:
    def __init__(self, json_file="./market_data/market_data.json"):
        self.json_file = json_file
        self.data = self._load_data()

    def _load_data(self):
        """Load data from the JSON file or create a new file if it doesn't exist."""
        if os.path.exists(self.json_file):
            with open(self.json_file, "r") as file:
                data = json.load(file)
                market_returns_dict = {pd.to_datetime(k): v for k, v in data["market_returns"].items()}
                
                # Create a pandas Series from the dictionary
                data["market_returns"] = pd.Series(market_returns_dict)
                return data
        else:
            return {"market_returns": None, "rfr": None, "last_update": None}

    def _write_data(self):
        """Write updated data to the JSON file."""
        data = self.data
        data["market_returns"].index = data["market_returns"].index.to_series().apply(lambda x: x.isoformat())
        data["market_returns"] = data["market_returns"].to_dict()
        with open(self.json_file, "w") as file:
            json.dump(data, file, indent=4)

    def _fetch_market_data(self):
        """
        Simulate fetching market returns and RFR from an external source.
        Replace this function with real API calls to get the data.
        """
        market_returns = yfHelper("^GSPC").price_monthly_short().pct_change().dropna()
        rfr = yfHelper("^TNX").price_and_change()["price"] / 100
        
        return market_returns, rfr

    def _is_update_needed(self):
        """Check if the data needs to be updated (daily update)."""
        last_update_str = self.data.get("last_update")
        if last_update_str:
            last_update = datetime.strptime(last_update_str, "%Y-%m-%d")
            return datetime.now().date() > last_update.date()
        return True

    def update_data(self):
        """Update the market returns and RFR if needed."""
        if self._is_update_needed():
            market_returns, rfr = self._fetch_market_data()
            self.data["market_returns"] = market_returns
            self.data["rfr"] = rfr
            self.data["last_update"] = datetime.now().strftime("%Y-%m-%d")
            self._write_data()
            print("Market data updated.")
        else:
            print("Data is already up-to-date.")

    def get_data(self):
        self.update_data()
        return {
            "market_returns": self.data.get("market_returns"),
            "rfr": self.data.get("rfr"),
            "last_update": self.data.get("last_update"),
        }
