import { ReactNode } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface Favourite {
  id: string;
  fromUser: string;
  toPortfolio: string;
}

export type PortfolioTag = "Growth" | "Value" | "Dividend" | "Balanced" | "Aggressive" | "Conservative" |
  "Emerging Markets" | "Emerging Tech" | "Small Cap" | "Large Cap" | "Diversified" | 
  "Short-term"|"Long-term"


export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: PortfolioTag[];

  

  cash: number;
  initialCash: number;

  created: string;

  shares: Record<string, number>;
  actions: Record<string, Record<string, number>>;

  primaryAssetClass?: AssetClass | 'Mixed';
  dividendYield?: number;

  threeMonthGrowth?: number;
  oneYearGrowth?:number;
  allTimeGrowth?: number;
  sixMonthGrowth?: number;
  cagr?: number;

  

    assetWeight: Record<string, number>;
    sectorWeight : Record<string, number>;
   assetContrib: Record<string, number>;
  sectorContrib: Record<string, number>;

  maxDrawdown?: number;
  avgDrawdown?: number;

  sharpe?: number;
  alpha?: number;

  holdingsDict?: Record<string, any>[];
  actionsDict?: Record<string, any>[];
  historicalReturns?: Record<string, number>[];

}
export type AssetClass = "Equity" | "ETF"

export interface ProxyAsset {
    ticker: string;
    name: string;
    size: number;
    assetClass: AssetClass;
    sector: string;
    category?: string;
}

export interface TableStock extends ProxyAsset {
        volume:number;
        marketCorrelation:number;
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

        wacc:number;
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
        marketCorrelation:number;
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
    anAvg:number;
    anMax:number;
} & TableStock & WithPSPO<Omit<TableStock, "ticker" | "name" | "category" | "assetClass" | "sector">>;

export type FullETF = {
    plotSectors: Record<string, number>;
    plotHoldings: Record<string, number>;

} & TableETF & WithPSPO<Omit<TableETF, "ticker" | "name" | "category" | "assetClass" | "sector">>;


export type Filter = {
  display: string;
  id: string;
  fit: (asset: Record<string, any>) => boolean;
  label?: string;
  onRemove?: () => void;
};

export type AssetTab = 'Profile' | 'Growth' | 'Risk' | 'Performance' | 'Profitability' | 'Leverage' | 'Valuation' | 'Q-Scores'

export type SelectOption = {
    column:string;
    label:string;
    options: {label:string, lowerBound?:number|null, upperBound?:number|null, eq?:any}[];
}

// Callback types
export type SuccessCallback<T = any> = (result: T) => void;
export type ErrorCallback = (error: string) => void;

