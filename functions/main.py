from firebase_functions import https_fn, options
import firebase_admin
from firebase_admin import credentials, firestore
import yfinance as yf
import pandas as pd
import json
import time
from portfolio import Portfolio
import datetime

cred = credentials.Certificate("./quant-algo-4430a-firebase-adminsdk-l8bgg-1b126ee4ee.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@https_fn.on_request( 
        cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["get", "post", "options"],
    )
)
def get_fast_data(req: https_fn.Request) -> https_fn.Response:
    ticker = req.args.get('t')
    if not ticker:
        return https_fn.Response("Ticker parameter is required", status=400)
    data = get_fast_cache()
    result = data.get(ticker)
    if result is None:
        result = price_and_change(ticker)
        data[ticker] = result
        update_fast_cache(data)
    if result:
        return https_fn.Response(json.dumps(result), status=200, content_type="application/json")
    return https_fn.Response({'message':"Metrics not foun.d"}, status=404)




@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["get", "post", "options"],
    )
)
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
            price = price_weekly_long(ticker)
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



@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["get", "post", "options"],
    )
)
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
    

@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["get", "post", "options"],
    )
)
def portfolio_action(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    try:
        body = req.get_json()
        portfolio_id = body.get("portfolioId")
        ticker = body.get("ticker")
        shares_delta = body.get("shares")

        if not portfolio_id or not ticker or shares_delta is None:
            return https_fn.Response(
                json.dumps({"error": "portfolioId, ticker, and shares are required"}),
                status=400,
                content_type="application/json"
            )

        portfolio_ref = db.collection("portfolios").document(portfolio_id)
        snapshot = portfolio_ref.get()
        if not snapshot.exists:
            return https_fn.Response(
                json.dumps({"error": "Portfolio not found"}),
                status=404,
                content_type="application/json"
            )

        data = snapshot.to_dict()

        # Fetch price
        price_info = yf.Ticker(ticker).fast_info
        price = price_info.get('lastPrice')
        if price is None or price <= 0:
            return https_fn.Response(
                json.dumps({"error": "Error fetching price"}),
                status=400,
                content_type="application/json"
            )

        # Update shares and cash
        current_shares = data.get("shares", {}).get(ticker, 0)
        new_shares = current_shares + shares_delta

        current_cash = data.get("cash", 0)
        new_cash = current_cash - shares_delta * price
        if new_cash < 0:
            return https_fn.Response(
                json.dumps({"error": "Insufficient cash"}),
                status=400,
                content_type="application/json"
            )

        # Update actions
        current_actions = data.get("actions", {}).get(ticker, {})
        timestamp = datetime.datetime.now().isoformat()
        new_actions = {**current_actions, timestamp: shares_delta}

        # Update Firestore document
        portfolio_ref.update({
            f"shares.{ticker}": new_shares,
            f"actions.{ticker}": new_actions,
            "cash": new_cash,
        })

        return https_fn.Response(
            json.dumps({"message": "Portfolio updated successfully"}),
            status=200,
            content_type="application/json"
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            content_type="application/json"
        )

    
# Cache expiry time (10 minutes)
CACHE_EXPIRY = 600

_fast_cache = {"data":{}, "timestamp": 0}
def get_fast_cache():
    if time.time() - _fast_cache["timestamp"] > CACHE_EXPIRY:
        return {}
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




def price_and_change(ticker):  ##
        dat = yf.Ticker(ticker).fast_info
        max = round(dat['yearHigh'], 2)
        min = round(dat['yearLow'], 2)

        current_price = dat["lastPrice"]
        open = dat["previousClose"]
        return {
            "price": current_price,
            "change": (current_price / open) - 1,
            "range": f'{min} - {max}'
        }

def price_weekly_long(ticker):
        his = yf.Ticker(ticker).history(start='2005-01-01', interval='5d')['Close']
        his.index = his.index.tz_localize(None)
        return his.ffill().dropna()