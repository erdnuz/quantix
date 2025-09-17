import { Portfolio, SuccessCallback, ErrorCallback } from "../../types";


/**
 * Fetch portfolio data by ID.
 * Currently returns a placeholder object; will be implemented later.
 */
export async function getPortfolioData({ id }: { id: string }): Promise<Portfolio> {
  // Placeholder: return a minimal portfolio structure
  return {
    id,
    title: 'Sample Portfolio',
    userId: 'user123',
    date: new Date().toISOString(),
    favourites: 0,
    description: 'This is a placeholder portfolio.',
    tags: [],
    actions: {},
    df: {},
    hist: [],
    cash: 0,
    initialCash: 0,
    shares: {},
  } as Portfolio;
}

// Fetch compare data for multiple tickers (prices + correlation + plot)
export async function getCompareData({tickers} : {tickers: string[]}): Promise<{
  plot: Record<string, Record<string, number>>;
  corr: Record<string, Record<string, number>>;
  prices: Record<string, number>;
} | null> {
  try {
    const plot: Record<string, Record<string, number>> = {};
    const prices: Record<string, number> = {};
    const corr: Record<string, Record<string, number>> = {};

    
    return { plot, corr, prices };
  } catch (err) {
    console.error('Error fetching compare data:', err);
    return null;
  }
}


export async function getFastData({
  ticker,
  onSuccess,
  onError,
}: {
  ticker: string;
  onSuccess: SuccessCallback;
  onError?: ErrorCallback;
}): Promise<void> {
  try {
    onSuccess({
      price: 157.69,
      change: 4.09,
    });
  } catch (err) {
    onError?.("Error fetching price data.");
  }
}