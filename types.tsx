import { ReactNode } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  favourites?: string[]
}

export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  description?: string;
  tags?: number[];
  favourites: number;
  cash: number;
  initialCash: number;
  primaryClass?: 'Equity' | 'ETF';
  '3m'?: number;
  all?: number;
  '1y'?:number;
  shares: Record<string, number>;
  actions: Record<string, Record<string, number>>;
  date?: string | null;
  cagr?: number;
  df?: Record<string, Record<string, number>>;
  holdings?: Record<string, number>[];
  hist?: Record<string, number>[];

}

export interface ProxyAsset {
    ticker: string;
    name: string;
    size: number;
    assetClass: "Equity" | "ETF";
    category: string;
}

export interface TableStock {
    ticker: string;
    name: string;
    size: number;
    assetClass: "Equity" | "ETF";
    category: string;
}

export interface TableETF {
    ticker: string;
    name: string;
    size: number;
    assetClass: "Equity" | "ETF";
    category: string;
}

export interface FullStock {
    ticker: string;
    name: string;
    size: number;
    assetClass: "Equity" | "ETF";
    category: string;
    numAn: number;
}

export interface FullETF {
    ticker: string;
    name: string;
    size: number;
    assetClass: "Equity" | "ETF";
    category: string;
}


// Callback types
export type SuccessCallback<T = any> = (result: T) => void;
export type ErrorCallback = (error: string) => void;

