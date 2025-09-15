import time
import os
import tempfile
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

URLS = {
    'etfs': "https://ca.finance.yahoo.com/research-hub/screener/c42e3d17-5c20-4eee-a51f-b8dbda91786c/?count=100&start=",
    'equities': "https://ca.finance.yahoo.com/research-hub/screener/7d72f790-7c84-474b-adb3-9546abdd3e2e/?count=100&start="
}

COOKIES_FILE = "./tickers/scrape/yahoo_cookies.json"

def load_cookies(driver, json_path=COOKIES_FILE):
    """Load cookies into Selenium from JSON file"""
    if not os.path.exists(json_path):
        return False
    with open(json_path, "r", encoding="utf-8") as f:
        cookies = json.load(f)
    for c in cookies:
        cookie_dict = {
            'name': c['name'],
            'value': c['value'],
            'domain': c.get('domain'),
            'path': c.get('path', '/'),
            'secure': c.get('secure', False),
            'httpOnly': c.get('httpOnly', False)
        }
        try:
            driver.add_cookie(cookie_dict)
        except Exception:
            pass
    return True

def login_and_scrape_symbols(email=None, password=None, headless=False, wait_time=5):
    options = webdriver.ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--remote-debugging-port=0")

    temp_profile = os.path.join(tempfile.gettempdir(), "selenium_profile")
    os.makedirs(temp_profile, exist_ok=True)
    options.add_argument(f"--user-data-dir={temp_profile}")

    chrome_binary = "/usr/bin/google-chrome"
    if os.path.exists(chrome_binary):
        options.binary_location = chrome_binary

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    wait = WebDriverWait(driver, wait_time)

    try:
        # Navigate to Yahoo first to set domain for cookies
        driver.get("https://finance.yahoo.com/")

        # Try loading cookies if available
        if os.path.exists(COOKIES_FILE):
            print("Loading cookies from file...")
            load_cookies(driver)
            driver.refresh()
        else:
            # Perform login if cookies do not exist
            if email is None or password is None:
                raise RuntimeError("No cookies found and no credentials provided.")
            driver.get("https://login.yahoo.com/")
            username_input = wait.until(EC.presence_of_element_located((By.ID, "login-username")))
            username_input.clear()
            username_input.send_keys(email)
            driver.find_element(By.ID, "login-signin").click()
            password_input = wait.until(EC.presence_of_element_located((By.ID, "login-passwd")))
            time.sleep(0.5)
            password_input.clear()
            password_input.send_keys(password)
            driver.find_element(By.ID, "login-signin").click()

            # Wait until login completes
            def login_complete(d):
                url = d.current_url
                return "login.yahoo" not in url and "/mssignin" not in url
            wait.until(login_complete)

            # Save cookies for future use
            cookies = driver.get_cookies()
            with open(COOKIES_FILE, "w", encoding="utf-8") as f:
                json.dump(cookies, f, indent=2)
            print(f"Cookies saved to {COOKIES_FILE}")

        # Scrape symbols
        results = {}
        for key, base_url in URLS.items():
            print(f"Scraping {key}...")
            offset = 5600
            symbols = []

            while True:
                url = base_url + str(offset)
                driver.get(url)

                try:
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "span.ticker-wrapper span.symbol")))
                    spans = driver.find_elements(By.CSS_SELECTOR, "span.ticker-wrapper span.symbol")
                    page_symbols = [s.text for s in spans if s.text.strip()]
                    if len(symbols) > 1 and symbols[-1] == page_symbols[-1]:
                        print(f"No more symbols at offset {offset}")
                    
                        break
                    elif len(page_symbols) < 100:
                        print(f"No more symbols at offset {offset}")
                        symbols.extend(page_symbols)
                        break
                    symbols.extend(page_symbols)
                    print(f"Offset {offset} fetched, {len(page_symbols)} symbols")
                    offset += 100
                    time.sleep(1)
                except Exception as e:
                    print(f"{e} at offset {offset}, stopping")
                    break


            results[key] = symbols
            print(f"Total {len(symbols)} {key} symbols collected\n")

        with open("yahoo_symbols2.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        print("All symbols saved to yahoo_symbols.json")

    finally:
        driver.quit()


if __name__ == "__main__":
    login_and_scrape_symbols(
        email="amcarthur@myyahoo.com",
        password="Pluto4Greens!",
        headless=False
    )
