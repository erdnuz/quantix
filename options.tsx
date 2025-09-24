
import { RankingOption } from "@/components/composition/RankingTable";
import type { AssetClass, AssetTab, FullETF, FullStock, SelectOption } from "./types"

export const selectOptions: (currentPill: AssetClass) => Record<AssetTab, SelectOption[]> =
  (currentPill) => {
    return {
  
  'Profile':[
    {
      column:'size',
      label:currentPill=='Equity'?'Market Cap':'Net Assets',
      options: currentPill=='Equity'?[
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: 'Small', lowerBound: null, upperBound: 1e9 },
              { label: 'Mid', lowerBound: 1e9, upperBound: 100e9 },
              { label: 'Large', lowerBound: 100e9, upperBound: 500e9 },
              { label: 'Mega', lowerBound: 500e9, upperBound: null },
            ]:
            [
              
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: 'Small', lowerBound: null, upperBound: 200e6 },
              { label: 'Mid', lowerBound:200e6, upperBound: 1e9 },
              { label: 'Large', lowerBound: 1e9, upperBound: 50e9 },
              { label: 'Mega', lowerBound: 50e9, upperBound: null },
            ]
    },
    {
      column:'volume',
      label:'Daily Volume',
      options: currentPill=='Equity'?[
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: 'Low', lowerBound: null, upperBound: 200e3 },
              { label: 'Med', lowerBound: 200e3, upperBound: 1e6 },
              { label: 'High', lowerBound: 1e6, upperBound: 20e6 },
              { label: 'Peak', lowerBound: 20e6, upperBound: null },
            ]:
            [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: 'Low', lowerBound: null, upperBound: 10e3 },
              { label: 'Med', lowerBound: 10e3, upperBound: 100e3 },
              { label: 'High', lowerBound: 100e3, upperBound: 10e6 },
              { label: 'Peak', lowerBound: 10e6, upperBound: null },
            ]
    },
    {
      column:'dividendYield',
      label:'Div. Yield',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '> 0.5%', lowerBound: 0.005, upperBound: null },
              { label: '> 1%', lowerBound: 0.01, upperBound: null },
              { label: '> 2%', lowerBound: 0.02, upperBound: null },
              { label: '> 4%', lowerBound: 0.04, upperBound: null },
            ]
    }, 
  ...(currentPill == 'ETF' ?[
    {
      column:'holdingsDiversity',
      label:'Holding Diversity',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: 'Low', lowerBound: null, upperBound: 0.78 },
              { label: 'Moderate', lowerBound: 0.78, upperBound: 0.8 },
              { label: 'High', lowerBound: 0.8, upperBound: null },
            ]
    },
    {
      column:'sectorDiversity',
      label:'Sector Diversity',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: 'Low', lowerBound: null, upperBound: 0.6 },
              { label: 'Moderate', lowerBound: 0.6, upperBound: 0.72 },
              { label: 'High', lowerBound: 0.72, upperBound: null },
            ]
    },
    {
      column:'expenses',
      label:'Expense Ratio',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '< 0.05%', lowerBound: null, upperBound: 0.0005 },
              { label: '< 0.1%', lowerBound: null, upperBound: 0.001 },
              { label: '< 0.2%', lowerBound: null, upperBound: 0.002 },
              { label: '< 0.5%', lowerBound: null, upperBound: 0.005 }
            ]
    },
    {
      column:'turnover',
      label:'Turnover Ratio',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: 'Low', lowerBound: null, upperBound: 0.2 },
              { label: 'Moderate', lowerBound: 0.2, upperBound: 0.4 },
              { label: 'High', lowerBound: 0.4, upperBound: null },
            ]
    }]:[])
    

  ],
  'Growth':[
    {
      column:'sixMonthGrowth',
      label:'6mo CAGR',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '> 5%', lowerBound: 0.05, upperBound: null },
              { label: '> 10%', lowerBound: 0.1, upperBound: null },
              { label: '> 20%', lowerBound: 0.2, upperBound: null },
              { label: '> 40%', lowerBound: 0.4, upperBound: null },
            ]
    },
    {
      column:'oneYearGrowth',
      label:'YoY Growth',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '> 5%', lowerBound: 0.05, upperBound: null },
              { label: '> 10%', lowerBound: 0.1, upperBound: null },
              { label: '> 20%', lowerBound: 0.2, upperBound: null },
              { label: '> 40%', lowerBound: 0.4, upperBound: null },
            ]
    },
    {
      column:'threeYearGrowth',
      label:'3y CAGR',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '> 5%', lowerBound: 0.05, upperBound: null },
              { label: '> 10%', lowerBound: 0.1, upperBound: null },
              { label: '> 20%', lowerBound: 0.2, upperBound: null },
              { label: '> 40%', lowerBound: 0.4, upperBound: null },
            ]
    },
    {
      column:'cagr',
      label:'5y CAGR',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '> 5%', lowerBound: 0.05, upperBound: null },
              { label: '> 10%', lowerBound: 0.1, upperBound: null },
              { label: '> 20%', lowerBound: 0.2, upperBound: null },
              { label: '> 40%', lowerBound: 0.4, upperBound: null },
            ]
    }
  ],
  'Risk':[
    {
      column:'avgDrawdown',
      label:'Avg. Drawdown',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '< 3%', lowerBound: null, upperBound: 0.03 },
              { label: '< 5%', lowerBound: null, upperBound: 0.05 },
              { label: '< 10%', lowerBound: null, upperBound: 0.1 },
              { label: '< 15%', lowerBound: null, upperBound: 0.15 },
            ]
    },
    {
      column:'maxDrawdown',
      label:'Max. Drawdown',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '< 10%', lowerBound: null, upperBound: 0.1 },
              { label: '< 20%', lowerBound: null, upperBound: 0.2 },
              { label: '< 35%', lowerBound: null, upperBound: 0.35 },
              { label: '< 50%', lowerBound: null, upperBound: 0.5 },
            ]
    },
    {
      column:'beta',
      label:'Beta',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: 'Negative', lowerBound: null, upperBound: 0.001 },
              { label: 'Weak', lowerBound: 0.001, upperBound: 0.8 },
              { label: 'Average', lowerBound: 0.8, upperBound: 1.4 },
              { label: 'High', lowerBound: 1.4, upperBound: null },
            ]
    },
    {
      column:'standardDeviationReturns',
      label:'Std. Returns',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '< 5%', lowerBound: null, upperBound: 0.05 },
              { label: '< 8%', lowerBound: null, upperBound: 0.08 },
              { label: '< 12%', lowerBound: null, upperBound: 0.12 },
              { label: '< 20%', lowerBound: null, upperBound: 0.2 },
            ]
    },
    {
      column:'var1',
      label:'VaR 1%',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '< 5%', lowerBound: null, upperBound: 0.05 },
              { label: '< 10%', lowerBound: null, upperBound: 0.10 },
              { label: '< 15%', lowerBound: null, upperBound: 0.15 },
              { label: '< 25%', lowerBound: null, upperBound: 0.25 },
            ]
    },
    {
      column:'var5',
      label:'VaR 5%',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '< 3%', lowerBound: null, upperBound: 0.03 },
              { label: '< 8%', lowerBound: null, upperBound: 0.08 },
              { label: '< 12%', lowerBound: null, upperBound: 0.12 },
              { label: '< 20%', lowerBound: null, upperBound: 0.2 },
            ]
    },
    {
      column:'var10',
      label:'VaR 10%',
      options: [
              { label: 'Any', lowerBound: null, upperBound: null },
              { label: '< 3%', lowerBound: null, upperBound: 0.03 },
              { label: '< 8%', lowerBound: null, upperBound: 0.08 },
              { label: '< 12%', lowerBound: null, upperBound: 0.12 },
              { label: '< 20%', lowerBound: null, upperBound: 0.2 },
            ]
    }
  ],
  'Performance':
  [
  {
    column: 'alpha',
    label: 'Alpha',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '> -0.5%', lowerBound: -0.005, upperBound: null },
      { label: '> 0.5%', lowerBound: 0.005, upperBound: null },
      { label: '> 1%', lowerBound: 0.01, upperBound: null },
      { label: '> 2%', lowerBound: 0.02, upperBound: null }
    ]
  },
  {
    column: 'sharpe',
    label: 'Sharpe',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.05, upperBound: null },
      { label: 'Good', lowerBound: 0.12, upperBound: null },
      { label: 'Great', lowerBound: 0.2, upperBound: null },
      { label: 'Excellent', lowerBound: 0.3, upperBound: null }
    ]
  },
  {
    column: 'sortino',
    label: 'Sortino',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.1, upperBound: null },
      { label: 'Good', lowerBound: 0.2, upperBound: null },
      { label: 'Great', lowerBound: 0.35, upperBound: null },
      { label: 'Excellent', lowerBound: 0.5, upperBound: null }
    ]
  },
  {
    column: 'mSquared',
    label: 'M Squared',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.005, upperBound: null },
      { label: 'Good', lowerBound: 0.008, upperBound: null },
      { label: 'Great', lowerBound: 0.012, upperBound: null },
      { label: 'Excellent', lowerBound: 0.015, upperBound: null }
    ]
  },
  {
    column: 'calmar',
    label: 'Calmar',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.1, upperBound: null },
      { label: 'Good', lowerBound: 0.3, upperBound: null },
      { label: 'Great', lowerBound: 0.5, upperBound: null },
      { label: 'Excellent', lowerBound: 1, upperBound: null }
    ]
  },
  {
    column: 'martin',
    label: 'Martin',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 1, upperBound: null },
      { label: 'Good', lowerBound: 1.5, upperBound: null },
      { label: 'Great', lowerBound: 2, upperBound: null },
      { label: 'Excellent', lowerBound: 3, upperBound: null }
    ]
  },
  {
    column: 'omega',
    label: 'Omega',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 1.2, upperBound: null },
      { label: 'Good', lowerBound: 1.6, upperBound: null },
      { label: 'Great', lowerBound: 2, upperBound: null },
      { label: 'Excellent', lowerBound: 2.4, upperBound: null }
    ]
  }
]

,
  'Profitability': [
    {
    column: 'dividendGrowth',
    label: 'Div. Growth',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '> 3%', lowerBound: 0.03, upperBound: null },
      { label: '> 5%', lowerBound: 0.05, upperBound: null },
      { label: '> 10%', lowerBound: 0.1, upperBound: null },
      { label: '> 15%', lowerBound: 0.15, upperBound: null }
    ]
  },
  {
    column: 'earningsGrowth',
    label: 'Earnings Growth',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '> 5%', lowerBound: 0.05, upperBound: null },
      { label: '> 10%', lowerBound: 0.1, upperBound: null },
      { label: '> 30%', lowerBound: 0.3, upperBound: null },
      { label: '> 60%', lowerBound: 0.6, upperBound: null }
    ]
  },
  {
    column: 'revenueGrowth',
    label: 'Sales Growth',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '> 5%', lowerBound: 0.05, upperBound: null },
      { label: '> 10%', lowerBound: 0.1, upperBound: null },
      { label: '> 15%', lowerBound: 0.15, upperBound: null },
      { label: '> 25%', lowerBound: 0.25, upperBound: null }
    ]
  },
  {
    column: 'profitMargin',
    label: 'Profit Margin',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '> 5%', lowerBound: 0.05, upperBound: null },
      { label: '> 10%', lowerBound: 0.1, upperBound: null },
      { label: '> 15%', lowerBound: 0.15, upperBound: null },
      { label: '> 25%', lowerBound: 0.25, upperBound: null }
    ]
  },
  {
    column: 'returnOnEquity',
    label: 'RoE',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '> 5%', lowerBound: 0.05, upperBound: null },
      { label: '> 10%', lowerBound: 0.1, upperBound: null },
      { label: '> 15%', lowerBound: 0.15, upperBound: null },

      { label: '> 25%', lowerBound: 0.25, upperBound: null }
    ]
  },
  {
    column: 'returnOnAssets',
    label: 'RoA',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '> 3%', lowerBound: 0.03, upperBound: null },
      { label: '> 5%', lowerBound: 0.05, upperBound: null },
      { label: '> 10%', lowerBound: 0.1, upperBound: null },
      { label: '> 15%', lowerBound: 0.15, upperBound: null }
    ]
  }
  ],
  'Leverage': [
    {
    column: 'wacc',
    label: 'WACC',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: null, upperBound: 0.2 },
      { label: 'Good', lowerBound: null, upperBound: 0.15 },
      { label: 'Great', lowerBound: null, upperBound: 0.1 },
      { label: 'Excellent', lowerBound: null, upperBound: 0.05 },
    ]
  },
  {
    column: 'altmanZ',
    label: 'Altman-Z',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 2, upperBound: null},
      { label: 'Good', lowerBound: 3, upperBound: null },
      { label: 'Great', lowerBound: 5, upperBound: null },
      { label: 'Excellent', lowerBound: 8, upperBound: null },
    ]
  },
  {
    column: 'assetsToLiabilities',
    label: 'Assets / Liabilities',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 1, upperBound: null },
      { label: 'Good', lowerBound: 2, upperBound: null },
      { label: 'Great', lowerBound: 3, upperBound: null },
      { label: 'Excellent', lowerBound: 4, upperBound: null },
    ]
  },
  {
    column: 'debtToAssets',
    label: 'Debt / Assets',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: null, upperBound: 0.2 },
      { label: 'Good', lowerBound: null, upperBound: 0.1 },
      { label: 'Great', lowerBound: null, upperBound: 0.05 },
      { label: 'Excellent', lowerBound: null, upperBound: 0.01 },
    ]
  },
  {
    column: 'debtToEquity',
    label: 'Debt / Equity',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: null, upperBound: 0.3 },
      { label: 'Good', lowerBound: null, upperBound: 0.15 },
      { label: 'Great', lowerBound: null, upperBound: 0.05 },
      { label: 'Excellent', lowerBound: null, upperBound: 0.01 },
    ]
  }

  ],
  'Valuation': [
    {
    column: 'priceToEarnings',
    label: 'Price / Earnings',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '< 5', lowerBound: null, upperBound: 5 },
      { label: '< 10', lowerBound: null, upperBound: 10 },
      { label: '< 15', lowerBound: null, upperBound: 15 },
      { label: '< 20', lowerBound: null, upperBound: 20 },
    ]
  },
  {
    column: 'priceToSales',
    label: 'Price / Sales',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '< 0.3', lowerBound: null, upperBound: 0.3 },
      { label: '< 0.8', lowerBound: null, upperBound: 0.8 },
      { label: '< 1.5', lowerBound: null, upperBound: 1.5 },
      { label: '< 3', lowerBound: null, upperBound: 3 },
    ]
  },
  {
    column: 'priceToBook',
    label: 'Price / Book',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '< 0.3', lowerBound: null, upperBound: 0.3 },
      { label: '< 0.8', lowerBound: null, upperBound: 0.8 },
      { label: '< 1.5', lowerBound: null, upperBound: 1.5 },
      { label: '< 3', lowerBound: null, upperBound: 3 },
    ]
  },
  {
    column: 'priceToEarningsToGrowth',
    label: 'PEG',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: '< 0.5', lowerBound: null, upperBound: 0.5 },
      { label: '< 0.8', lowerBound: null, upperBound: 0.8 },
      { label: '< 1.2', lowerBound: null, upperBound: 1.2 },
      { label: '< 2', lowerBound: null, upperBound: 2 },
    ]
  }
  ],
  'Q-Scores':[
  {
    column: 'qOverall',
    label: 'Overall',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.4, upperBound: null },
      { label: 'Good', lowerBound: 0.6, upperBound: null },
      { label: 'Great', lowerBound: 0.75, upperBound: null },
      { label: 'Excellent', lowerBound: 0.9, upperBound: null },
    ]
  },
  {
    column: 'qLeverage',
    label: 'Leverage',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.4, upperBound: null },
      { label: 'Good', lowerBound: 0.6, upperBound: null },
      { label: 'Great', lowerBound: 0.75, upperBound: null },
      { label: 'Excellent', lowerBound: 0.9, upperBound: null },
    ]
  },
  {
    column: 'qValuation',
    label: 'Valuation',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.4, upperBound: null },
      { label: 'Good', lowerBound: 0.6, upperBound: null },
      { label: 'Great', lowerBound: 0.75, upperBound: null },
      { label: 'Excellent', lowerBound: 0.9, upperBound: null },
    ]
  },
  {
    column: 'qProfitability',
    label: 'Profitability',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.4, upperBound: null },
      { label: 'Good', lowerBound: 0.6, upperBound: null },
      { label: 'Great', lowerBound: 0.75, upperBound: null },
      { label: 'Excellent', lowerBound: 0.9, upperBound: null },
    ]
  },
  {
    column: 'qGrowth',
    label: 'Growth',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.4, upperBound: null },
      { label: 'Good', lowerBound: 0.6, upperBound: null },
      { label: 'Great', lowerBound: 0.75, upperBound: null },
      { label: 'Excellent', lowerBound: 0.9, upperBound: null },
    ]
  },
  {
    column: 'qRisk',
    label: 'Risk',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.4, upperBound: null },
      { label: 'Good', lowerBound: 0.6, upperBound: null },
      { label: 'Great', lowerBound: 0.75, upperBound: null },
      { label: 'Excellent', lowerBound: 0.9, upperBound: null },
    ]
  },
  {
    column: 'qPerformance',
    label: 'Performance',
    options: [
      { label: 'Any', lowerBound: null, upperBound: null },
      { label: 'Fair', lowerBound: 0.4, upperBound: null },
      { label: 'Good', lowerBound: 0.6, upperBound: null },
      { label: 'Great', lowerBound: 0.75, upperBound: null },
      { label: 'Excellent', lowerBound: 0.9, upperBound: null },
    ]
  }

  ]
  
}}


export const STOCK_METRICS: Partial<Record<AssetTab, RankingOption<FullStock>[]>> = {
  'Profile': [
    { display: 'Market Correlation', column: 'marketCorrelation', percent: true, goodBad: false },
    { display: 'Market Cap', column: 'size', percent: false, goodBad: false },
    { display: 'Dividend Yield', column: 'dividendYield', percent: true, goodBad: false },

    { display: 'Volume', column: 'volume', percent: false, goodBad: false },
  ],
  'Growth': [
    { display: '5y CAGR', column: 'cagr', percent: true, goodBad: true },
    { display: '3y CAGR', column: 'threeYearGrowth', percent: true, goodBad: true },
    { display: '1y Return', column: 'oneYearGrowth', percent: true, goodBad: true },
    { display: '6mo CAGR', column: 'sixMonthGrowth', percent: true, goodBad: true },
    { display: 'Dividend Growth', column: 'dividendGrowth', percent: true, goodBad: true },
  ],
  'Performance': [
    { display: 'Alpha', column: 'alpha', percent: true, goodBad: true },
    { display: 'Sharpe', column: 'sharpe', percent: false, goodBad: true },
    { display: 'Sortino', column: 'sortino', percent: false, goodBad: true },
    { display: 'M-Squared', column: 'mSquared', percent: false, goodBad: true },
    { display: 'Omega', column: 'omega', percent: false, goodBad: true },
    { display: 'Calmar', column: 'calmar', percent: false, goodBad: true },
    { display: 'Martin', column: 'martin', percent: false, goodBad: true },
  ],
  'Risk': [
    { display: 'Beta', column: 'beta', percent: false, goodBad: false },
    { display: 'Std. Returns', column: 'standardDeviationReturns', percent: true, goodBad: true },
    { display: 'Max Drawdown', column: 'maxDrawdown', percent: true, goodBad: true },
    { display: 'Avg Drawdown', column: 'avgDrawdown', percent: true, goodBad: true },
    { display: 'VaR 1%', column: 'var1', percent: true, goodBad: true },
    { display: 'VaR 5%', column: 'var5', percent: true, goodBad: true },
    { display: 'VaR 10%', column: 'var10', percent: true, goodBad: true },
  ],
  'Valuation': [
    { display: 'WACC', column: 'wacc', percent: false, goodBad: true },
    { display: 'Price to Earnings', column: 'priceToEarnings', percent: false, goodBad: true },
    { display: 'Price to Book', column: 'priceToBook', percent: false, goodBad: true },
    { display: 'Price to Sales', column: 'priceToSales', percent: false, goodBad: true },
    { display: 'PE to Growth', column: 'priceToEarningsToGrowth', percent: false, goodBad: true },
  ],
  'Profitability': [
    { display: 'Profit Margin', column: 'profitMargin', percent: true, goodBad: true },
    { display: 'ROE', column: 'returnOnEquity', percent: true, goodBad: true },
    { display: 'ROA', column: 'returnOnAssets', percent: true, goodBad: true },
    { display: 'Earnings Growth', column: 'earningsGrowth', percent: true, goodBad: true },
    { display: 'Revenue Growth', column: 'revenueGrowth', percent: true, goodBad: true },
  ],
  'Leverage': [
    { display: 'Debt to Equity', column: 'debtToEquity', percent: false, goodBad: true },
    { display: 'Debt to Assets', column: 'debtToAssets', percent: false, goodBad: true },
    { display: 'Debt to EBITDA', column: 'debtToEBIT', percent: false, goodBad: true },
    { display: 'Current Ratio', column: 'assetsToLiabilities', percent: false, goodBad: true },
    { display: 'Altman Z-Score', column: 'altmanZ', percent: false, goodBad: true },
  ],
};

export const ETF_METRICS: Partial<Record<AssetTab, RankingOption<FullETF>[]>> = {
  'Profile': [
    { display: 'Market Correlation', column: 'marketCorrelation', percent: true, goodBad: false },
    { display: 'Net Assets', column: 'size', percent: false, goodBad: false },
    { display: 'Dividend Yield', column: 'dividendYield', percent: true, goodBad: false },
    { display: 'Expense Ratio', column: 'expenses', percent: true, goodBad: false },
    { display: 'Turnover Ratio', column: 'turnover', percent: true, goodBad: false },
    { display: 'Holding Diversity', column: 'holdingsDiversity', percent: true, goodBad: false },
    { display: 'Sector Diversity', column: 'sectorDiversity', percent: true, goodBad: false },
    { display: 'Volume', column: 'volume', percent: false, goodBad: false },
  ],
  'Growth': [
    { display: '5y CAGR', column: 'cagr', percent: true, goodBad: true },
    { display: '3y CAGR', column: 'threeYearGrowth', percent: true, goodBad: true },
    { display: '1y Return', column: 'oneYearGrowth', percent: true, goodBad: true },
    { display: '6mo CAGR', column: 'sixMonthGrowth', percent: true, goodBad: true },
    { display: 'Dividend Growth', column: 'dividendGrowth', percent: true, goodBad: true },
  ],
  'Performance': [
    { display: 'Alpha', column: 'alpha', percent: true, goodBad: true },
    { display: 'Sharpe', column: 'sharpe', percent: false, goodBad: true },
    { display: 'Sortino', column: 'sortino', percent: false, goodBad: true },
    { display: 'M-Squared', column: 'mSquared', percent: false, goodBad: true },
    { display: 'Omega', column: 'omega', percent: false, goodBad: true },
    { display: 'Calmar', column: 'calmar', percent: false, goodBad: true },
    { display: 'Martin', column: 'martin', percent: false, goodBad: true },
  ],
  'Risk': [
    { display: 'Beta', column: 'beta', percent: false, goodBad: false },
    { display: 'Std. Returns', column: 'standardDeviationReturns', percent: true, goodBad: true },
    { display: 'Max Drawdown', column: 'maxDrawdown', percent: true, goodBad: true },
    { display: 'Avg Drawdown', column: 'avgDrawdown', percent: true, goodBad: true },
    { display: 'VaR 1%', column: 'var1', percent: true, goodBad: true },
    { display: 'VaR 5%', column: 'var5', percent: true, goodBad: true },
    { display: 'VaR 10%', column: 'var10', percent: true, goodBad: true },
  ],
  
};

export const Q_STOCK : Record<'Q-Scores', RankingOption<FullStock>[]> = {
  'Q-Scores': [
  {
    display: 'Overall',
    column: 'qOverall',
    percent: true, 
    goodBad: true
  },
  {
    display: 'Growth',
    column: 'qGrowth',
    percent: true, 
    goodBad: true
  },
  {
    display: 'Risk',
    column: 'qRisk',
    percent: true,
    goodBad: true
  },
  {
    display: 'Performance',
    column: 'qPerformance',
    percent: false,
    goodBad: true
  },
  {
    display: 'Valuation',
    column: 'qValuation',
    percent: false,
    goodBad: true
  },
  {
    display: 'Profitability',
    column: 'qProfitability',
    percent: false,
    goodBad: true
  },
  {
    display: 'Leverage',
    column: 'qLeverage',
    percent: false,
    goodBad: true
  }
]

};

export const Q_ETF : Record<'Q-Scores', RankingOption<FullETF>[]> = {
  'Q-Scores': [
  {
    display: 'Overall',
    column: 'qOverall',
    percent: true, 
    goodBad: true
  },
  {
    display: 'Growth',
    column: 'qGrowth',
    percent: true, 
    goodBad: true
  },
  {
    display: 'Risk',
    column: 'qRisk',
    percent: true,
    goodBad: true
  },
  {
    display: 'Performance',
    column: 'qPerformance',
    percent: false,
    goodBad: true
  }
]

};



export const tabOptions = (currentPill: AssetClass) => {return (currentPill === 'Equity'
    ? ["Profile", "Q-Scores", "Growth", "Performance", "Risk", "Valuation", "Profitability", "Leverage"]
    : ["Profile", "Q-Scores", "Growth", "Performance", "Risk"]) as AssetTab[]};
