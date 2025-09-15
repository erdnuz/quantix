import json
import yfinance as yf
from datetime import datetime, timedelta

class CurrencyConverter:
    def __init__(self, currency, json_file='./yahoo/currency/currency_rates.json'):
        self.json_file = json_file
        self.exchange_rates = {}  # Dictionary to store exchange rates
        self.last_updated = None  # Tracks the last update time
        self.currency = currency
        self.__load_rates()  # Load data from the JSON file

    def __load_rates(self):
        """Loads exchange rates and last update time from a JSON file."""
        try:
            with open(self.json_file, 'r') as file:
                data = json.load(file)
                self.exchange_rates = data.get('rates', {})
                last_updated_str = data.get('last_updated', None)
                self.last_updated = datetime.strptime(last_updated_str, '%Y-%m-%d') if last_updated_str else None
        except (FileNotFoundError, json.JSONDecodeError):
            self.exchange_rates = {}
            self.last_updated = None

    def __save_rates(self):
        """Saves exchange rates and last update time to a JSON file."""
        with open(self.json_file, 'w') as file:
            data = {
                'rates': self.exchange_rates,
                'last_updated': self.last_updated.strftime('%Y-%m-%d') if self.last_updated else None
            }
            json.dump(data, file, indent=4)

    def __update_rates(self):
        """Updates exchange rates if more than 30 days have passed since the last update."""
        if self.last_updated is None or (datetime.now() - self.last_updated) > timedelta(days=30):
            print("Updating currency rates...")
            self.exchange_rates = {
                'USD': 1.0
            }
            self.last_updated = datetime.now()
            self.__save_rates()

    def __get_exchange_rate(self):
        """Fetches the exchange rate for a currency, if not cached."""
        if self.currency not in self.exchange_rates:
            try:
                # Fetch live exchange rate and add it to the dictionary
                print(f'{self.currency}=X')
                rate = yf.Ticker(f'{self.currency}=X').fast_info["lastPrice"]
                self.exchange_rates[self.currency] = rate
                print(f"Fetched and cached exchange rate for {self.currency}: {rate}")
                self.__save_rates()  # Save the updated rate to the JSON file
            except IndexError as e:
                print(f"Error fetching conversion rate for {self.currency}: {e}")
                return None
        return self.exchange_rates[self.currency]

    def convert(self, amount):
        """Converts the amount from the given currency to USD."""
        if self.currency=="USD":
            return amount
        self.__update_rates()  # Ensure rates are updated monthly
        exchange_rate = self.__get_exchange_rate()
        if exchange_rate is None:
            return None
        return amount / exchange_rate if amount and exchange_rate and exchange_rate > 0 else None

if __name__=="__main__":
    print(CurrencyConverter("THB").convert(1))