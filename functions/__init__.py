from firebase_functions import https_fn, options
import firebase_admin
from firebase_admin import credentials, firestore
from yahoo.yfHelper import yfHelper
import pandas as pd
import json
import time
from portfolio import Portfolio

cred = credentials.Certificate("./quant-algo-4430a-firebase-adminsdk-l8bgg-1b126ee4ee.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Cache expiry time (10 minutes)
CACHE_EXPIRY = 600

_fast_cache = {"data":[{},{}], "timestamp": 0}
def get_fast_cache():
    if time.time() - _fast_cache["timestamp"] > CACHE_EXPIRY:
        return [{},{}]
    return _fast_cache["data"]
def update_fast_cache(data):
    _fast_cache.update({"data":data, "timestamp": time.time()})

_cache = {"returns": {}, "corr": {}, "plot": {}, "prices":{}, "timestamp": 0}
def get_cached_data():
    """Retrieve cached returns, correlation matrix, and plots, ensuring cache expiry."""
    if time.time() - _cache["timestamp"] > CACHE_EXPIRY:
        return {}, {}, {}, {} # Expired cache, return empty
    return _cache["returns"], _cache["corr"], _cache["plot"], _cache["prices"]
def update_cached_data(returns, corr, plot, prices):
    """Update the cache with new data and reset timestamp."""
    _cache.update({"returns": returns, "corr": corr, "plot": plot, "prices":prices, "timestamp": time.time()})



@https_fn.on_request( 
        cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["get", "post", "options"],
    )
)
def get_fast_data(req: https_fn.Request) -> https_fn.Response:
    ticker = req.args.get('t')
    convert = req.args.get('convert') is not None
    if not ticker:
        return https_fn.Response("Ticker parameter is required", status=400)
    data = get_fast_cache()
    result = data[int(convert)].get(ticker)
    if result is None:
        result = yfHelper(ticker).price_and_change(convert)
        data[int(convert)][ticker] = result
        update_fast_cache(data)
    if result:
        return https_fn.Response(json.dumps(result), status=200, content_type="application/json")
    return https_fn.Response({'message':"Metrics not foun.d"}, status=404)

@https_fn.on_request(cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["get", "post", "options"],))
def get_compare_info(req: https_fn.Request) -> https_fn.Response:
    try:
        tickers = req.args.getlist('t')  # Extract tickers from query params
        if not tickers:
            return https_fn.Response("Tickers parameter is required", status=400)

        # Ensure S&P 500 is always included for calculations but not in the response
        tickers_set = set(tickers + ["^GSPC"])

        # Fetch cached data
        cached_returns, cached_corr, cached_plot, cached_prices = get_cached_data()

        # If cache contains extra tickers, reset it
        if cached_returns.keys() - tickers_set:
            update_cached_data({}, {}, {}, {})
            cached_returns, cached_corr, cached_plot, cached_prices = {}, {}, {}, {}

        # Identify new tickers that are not in the cache
        new_tickers = tickers_set - cached_returns.keys()

        if not new_tickers:
            # Filter cached results to only return requested tickers
            filtered_corr = {t: {k: v for k, v in cached_corr[t].items() if k in tickers_set} for t in tickers_set if t in cached_corr}
            filtered_plot = {t: cached_plot[t] for t in tickers if t in cached_plot}
            filtered_prices = {t: cached_prices[t] for t in tickers if t in cached_prices}
            return https_fn.Response(json.dumps({'corr': filtered_corr, 'plot': filtered_plot, 'prices':filtered_prices}), status=200, content_type="application/json")

        # Compute returns for new tickers
        new_returns, new_plot, new_prices = {}, {}, {}
        for ticker in new_tickers:
            price = yfHelper(ticker).price_weekly_long().dropna()
            price.index = price.index.strftime('%Y-%m-%d')
            new_returns[ticker] = price.pct_change().dropna()
            if ticker != "^GSPC":
                new_plot[ticker] = price.to_dict()
                new_prices[ticker] = price.iloc[-1]


        # Merge with cache
        cached_returns.update(new_returns)
        cached_plot.update(new_plot)
        cached_prices.update(new_prices)

        # Compute correlation matrix
        returns_df = pd.DataFrame(cached_returns).ffill().dropna()
        cached_corr = returns_df.corr().to_dict()

        # Update cache
        update_cached_data(cached_returns, cached_corr, cached_plot, cached_prices)

        # Return only requested tickers
        filtered_corr = {t: {k: v for k, v in cached_corr[t].items() if k in tickers_set} for t in tickers_set if t in cached_corr}
        filtered_plot = {t: cached_plot[t] for t in tickers if t in cached_plot}
        filtered_prices = {t: cached_prices[t] for t in tickers if t in cached_prices}
        return https_fn.Response(json.dumps({'corr': filtered_corr, 'plot': filtered_plot, 'prices':filtered_prices}), status=200, content_type="application/json")

    except Exception as e:
        return https_fn.Response(f"Error processing request: {str(e)}", status=500)

@https_fn.on_request(cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["get", "post", "options"],))
def get_portfolio_data(req: https_fn.Request) -> https_fn.Response:
    portfolio_id = req.args.get('t')  # Fetch portfolio ID
    if not portfolio_id:
        return https_fn.Response(json.dumps({"error": "Portfolio ID is required"}), status=400, content_type="application/json")

    try:
        # Fetch portfolio document from Firestore
        portfolio_ref = db.collection("portfolios").document(portfolio_id)
        portfolio_doc = portfolio_ref.get()

        if not portfolio_doc.exists:
            print("Empty")
            return https_fn.Response(json.dumps({"error": "Portfolio not found"}), status=404, content_type="application/json")

        # Extract attributes
        portfolio_data = portfolio_doc.to_dict()
        initial_cash = portfolio_data.get("initialCash", 0)
        actions = portfolio_data.get("actions", {})

        # Process portfolio
        p = Portfolio(tickers=actions, initial_cash=initial_cash, db=db)
        basic, adv = p.get_info()

        portfolio_ref.update(basic)
        if basic:
            return https_fn.Response(json.dumps(basic | adv), status=200, content_type="application/json")
        return https_fn.Response(json.dumps({"message": "Metrics not found"}), status=404, content_type="application/json")

    except IndexError as e:
        print(e)
        return https_fn.Response(json.dumps({"error": f"Error fetching stock data: {str(e)}"}), status=500, content_type="application/json")
    
if __name__=="__main__":
    tickers = {
        "AAPL": {
            "2022-05-01": 5,
            "2023-05-01": -5
        },
        "TSLA": {
            "2023-06-01": 5,
            "2024-06-01": -5

        },
        "MSFT": {
            "2024-07-01": 5,
            "2025-07-01": -5

        }
    }
    p = Portfolio(tickers, initial_cash=10000, db=db)
    print(p.get_info())