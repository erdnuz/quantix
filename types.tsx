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

export interface TableStock extends ProxyAsset {
        volume:number;
        dividendYield:number;

        threeYearGrowth:number;
        sixMonthGrowth:number;
        cagr:number;
        oneYearGrowth: number;

        dividendGrowth:number;
        earningsGrowth:number;
        revenueGrowth:number;
        profitMargin:number;
        returnOnEquity:number;
        returnOnAssets:number;

        wacc:number;
        priceToEarnings:number;
        priceToSales:number;
        priceToBook:number;
        priceToEarningsToGrowth:number;

        avgDrawdown:number;
        maxDrawdown:number;
        beta:number;
        standardDeviationReturns:number;
        var1:number;
        var5:number;
        var10:number;
        

        calmar:number;
        alpha:number;
        sharpe:number;
        sortino:number;
        mSquared:number;
        martin:number;
        omega:number;

        altmanZ:number;
        assetsToLiabilities:number;
        debtToAssets:number;
        debtToEquity:number;
        debtToEBIT:number;

        qOverall:number;
        qGrowth:number;
        qRisk:number;
        qPerformance:number;
        qLeverage:number;
        qValuation:number;
        qProfitability:number;

} 

export interface TableETF extends ProxyAsset {
        volume:number;
        dividendYield:number;
        expenses:number;
        turnover:number;
        sectorDiversity:number;
        holdingsDiversity:number;

        threeYearGrowth:number;
        sixMonthGrowth:number;
        cagr:number;
        oneYearGrowth: number;

        dividendGrowth:number;

        priceToEarnings:number;


        avgDrawdown:number;
        maxDrawdown:number;
        beta:number;
        standardDeviationReturns:number;
        var1:number;
        var5:number;
        var10:number;
        

        calmar:number;
        alpha:number;
        sharpe:number;
        sortino:number;
        mSquared:number;
        martin:number;
        omega:number;

        qOverall:number;
        qGrowth:number;
        qRisk:number;
        qPerformance:number;
} 

// Utility type to append PS and PO
type WithPSPO<T> = {
  [K in keyof T as K extends string ? `${K}PS` | `${K}PO` : never]: T[K];
};

export type FullStock = {
    numAn:number;
    anRec:number;
    anMin:number;
    anMean:number;
    anMax:number;
} & TableStock & WithPSPO<Omit<TableStock, "ticker" | "name" | "category" | "assetClass">>;

export type FullETF = {
    plotSectors: Record<string, number>;
    plotHoldings: Record<string, number>;

} & TableETF & WithPSPO<Omit<TableETF, "ticker" | "name" | "category" | "assetClass">>;


export type Filter = {
  display: string;
  id: string;
  fit: (asset: Record<string, any>) => boolean;
  label?: string;
  onRemove?: () => void;
};

// Callback types
export type SuccessCallback<T = any> = (result: T) => void;
export type ErrorCallback = (error: string) => void;

