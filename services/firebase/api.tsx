import { Portfolio, SuccessCallback, ErrorCallback } from "../../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:5001/quant-algo-4430a/us-central1";

// For each function, use full URL if defined, otherwise fallback to BASE_URL + function name
const PORTFOLIO_DATA_URL = process.env.NEXT_PUBLIC_GET_PORTFOLIO_DATA || `${BASE_URL}/get_portfolio_data`;
const FAST_DATA_URL = process.env.NEXT_PUBLIC_GET_FAST_DATA || `${BASE_URL}/get_fast_data`;
const COMPARE_INFO_URL = process.env.NEXT_PUBLIC_GET_COMPARE_INFO || `${BASE_URL}/get_compare_info`;
const PORTFOLIO_ACTION_URL = process.env.NEXT_PUBLIC_PORTFOLIO_ACTION || `${BASE_URL}/portfolio_action`;


/**
 * Fetch portfolio data by ID.
 */
export async function getPortfolioData({ id }: { id: string }): Promise<Portfolio | null> {
  try {
    const response = await fetch(`${PORTFOLIO_DATA_URL}?t=${encodeURIComponent(id)}`);
    if (!response.ok) {
      console.error("Error fetching portfolio data:", response.statusText);
      return null;
    }
    const data = await response.json();
    return data as Portfolio;
  } catch (err) {
    console.error("Error fetching portfolio data:", err);
    return null;
  }
}

/**
 * Fetch compare data for multiple tickers (prices + correlation + plot)
 */
export async function getCompareData({ tickers }: { tickers: string[] }) {
  try {
    const params = tickers.map(t => `t=${encodeURIComponent(t)}`).join("&");
    const response = await fetch(`${COMPARE_INFO_URL}?${params}`);
    if (!response.ok) {
      console.error("Error fetching compare data:", response.statusText);
      return null;
    }
    const data = await response.json();
    return {
      plot: data.plot || {},
      corr: data.corr || {},
      prices: data.prices || {},
    };
  } catch (err) {
    console.error("Error fetching compare data:", err);
    return null;
  }
}

/**
 * Fetch fast data for a single ticker
 */
export async function getFastData({
  ticker,
  onSuccess,
  onError,
}: {
  ticker: string;
  onSuccess: SuccessCallback<{price:number, change:number, range:string}>;
  onError?: ErrorCallback;
}): Promise<void> {
  try {
    const response = await fetch(`${FAST_DATA_URL}?t=${encodeURIComponent(ticker)}`);
    if (!response.ok) {
      const errText = await response.text();
      onError?.(`Error fetching fast data: ${errText}`);
      return;
    }
    const data = await response.json();
    onSuccess(data);
  } catch (err) {
    onError?.(`Error fetching fast data: ${(err as Error).message}`);
  }
}

/**
 * Perform portfolio action
 */
export const portfolioAction = async ({
  portfolioId,
  ticker,
  shares,
  onSuccess,
  onError,
}: {
  portfolioId: string;
  ticker: string;
  shares: number;
  onSuccess: () => void;
  onError?: (err: string) => void;
}) => {
  try {
    const response = await fetch(PORTFOLIO_ACTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioId, ticker, shares }),
    });

    if (!response.ok) {
      const errText = await response.text();
      onError?.(`Error performing portfolio action: ${errText}`);
      return;
    }

    onSuccess();
  } catch (err) {
    onError?.("Error fetching the action endpoint.");
  }
};
