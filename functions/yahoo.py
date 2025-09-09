import json
import time
import requests_cache
from requests import Session
from multiprocessing import Manager, Lock
import requests
from yfHelper import yfHelper

CACHE_EXPIRATION_DAYS = 10
MAX_REQUESTS_PER_HOUR = 3600

class CachedSession(Session):
    def __init__(self, cache_file="yfinance"):
        """Initialize session with caching and manual rate limiting."""
        super().__init__()

        requests_cache.install_cache(cache_file, expire_after=CACHE_EXPIRATION_DAYS*24*3600) 

        self.max_requests_per_second = MAX_REQUESTS_PER_HOUR / 3600
        self.last_request_time = None  

        self.headers['User-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        self.headers['Accept'] = 'application/json, text/javascript, */*; q=0.01'
        self.headers['Accept-Language'] = 'en-US,en;q=0.9'
        self.headers['Connection'] = 'keep-alive'
        self.headers['Upgrade-Insecure-Requests'] = '1'
        self.headers['Cache-Control'] = 'max-age=0'
        self.attempts = 0

    def rate_limit_request(self):
        """Ensure that the rate limit is respected (sleep between requests)."""
        if self.last_request_time:
            time_diff = time.time() - self.last_request_time
            # Sleep if the rate limit is exceeded
            if time_diff < (1 / self.max_requests_per_second):
                sleep_time = (1 / self.max_requests_per_second) - time_diff
                time.sleep(sleep_time)
        self.last_request_time = time.time()

    def get_data(self, ticker: str, data_types: list[str]):
        """Fetch data for the given ticker and data type with rate limiting and error handling."""
        helper = yfHelper(ticker, session=self)
        results = []

        try:
            for data_type in data_types:
                try:
                    if data_type == "safe_info":
                        self.rate_limit_request()
                        info = helper.get_info()
                        if not info.get("currency") or not info.get("financialCurrency"):
                            return None
                        if info.get("currency").lower().replace('zac', 'zar').replace('ila', 'ils').replace('kwf', 'kwd') == info.get("financialCurrency").lower():
                            results.append(helper.get_info())
                        else:
                            print("INVALID: CURRENCY MISMATCH")
                            return [None] * len(data_types)
                        
                    elif data_type == "info":
                        self.rate_limit_request()
                        info = helper.get_info()
                        results.append(helper.get_info())

                    elif data_type == "balance_sheet":
                        self.rate_limit_request()
                        results.append(helper.get_balance_sheet())

                    elif data_type == "cashflow":
                        self.rate_limit_request()
                        results.append(helper.get_cashflow())

                    elif data_type == "financials":
                        self.rate_limit_request()
                        results.append(helper.get_financials())

                    elif data_type == "growth":
                        results.append(helper.get_equity_growth(limiter=self.rate_limit_request))

                    elif data_type == "fund":
                        self.rate_limit_request()
                        results.append(helper.get_fund_info())

                    elif data_type == "prices":
                        results.append(helper.price_monthly_short())

                    elif data_type == "volume":
                        results.append(helper.get_volume())                      

                    elif data_type == "div":
                        results.append(helper.get_dividend_info())

                    elif data_type == "weekly_prices":
                        results.append(helper.price_weekly_short())

                    elif data_type == "weekly_prices_long":
                        results.append(helper.price_weekly_long())

                    else:
                        print(f"Invalid data_type: {data_type}.")
                        results.append({})
                
                except json.decoder.JSONDecodeError:
                    raise RuntimeError("JSON error in yahoo.py - likely rate limiter")
                except requests.exceptions.ConnectionError:
                    raise RuntimeError("Request exception in yahoo.py - likely rate limiter")
                except IndexError as e:
                    print(f"Attribute error in yahoo.py:", e )
                    return results.append({})
            self.attempts = 0
            return results
        
        except RuntimeError as e:
            self.attempts += 1
            if self.attempts == 5:
                self.max_requests_per_second = self.max_requests_per_second / 2
                time.sleep(360)
            time.sleep(90)
            print(f"Rate limit exceeded. Attempts: {self.attempts}. Sleeping for 90 seconds.")
            if self.attempts>10:
                raise e
            return self.get_data(ticker, data_types)
        
    
class MetricsManager:
    _instance = None
    _instance_lock = Lock()  # Lock for the singleton instantiation
    def __new__(cls):
        with cls._instance_lock:
            if cls._instance is None:
                cls._instance = super(MetricsManager, cls).__new__(cls)
                manager = Manager()
                cls._instance._session_lock = Lock()  
                cls._instance.session = CachedSession(cache_file='yfinance')
        return cls._instance
    
    def get(self, ticker, data_types):
        with self._session_lock:
            return self.session.get_data(ticker, data_types=data_types)




