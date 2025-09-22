import { Portfolio, SuccessCallback, ErrorCallback } from "../../types";

/**
 * Fetch portfolio data by ID.
 */
export async function getPortfolioData({ id }: { id: string }): Promise<Portfolio | null> {
  try {
    const response = await fetch(`http://127.0.0.1:5001/quant-algo-4430a/us-central1/get_portfolio_data?t=${encodeURIComponent(id)}`);
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
export async function getCompareData({
  tickers,
}: {
  tickers: string[];
}): Promise<{
  plot: Record<string, Record<string, number>>;
  corr: Record<string, Record<string, number>>;
  prices: Record<string, number>;
} | null> {
  try {
    const params = tickers.map((t) => `t=${encodeURIComponent(t)}`).join("&");
    const response = await fetch(`http://127.0.0.1:5001/quant-algo-4430a/us-central1/get_compare_info?${params}`);
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
  onError
}: {
  ticker: string;
  onSuccess: SuccessCallback;
  onError?: ErrorCallback;
}): Promise<void> {
  try {
    const url = `http://127.0.0.1:5001/quant-algo-4430a/us-central1/get_fast_data?t=${encodeURIComponent(ticker)}`;
    const response = await fetch(url);
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
  onError?: (err: any) => void;
}) => {
  try {
    const url = `http://127.0.0.1:5001/quant-algo-4430a/us-central1/portfolio_action`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        portfolioId,
        ticker,
        shares,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (onError) onError(`Error performing portfolio action: ${errText}`);
      return;
    }

    onSuccess();
  } catch (err) {
    if (onError) onError(err);
  }
};
