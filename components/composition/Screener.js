"use client"
import {  Table, SelectGroup } from '.';
import { PillGroup, TabGroup, TagGroup, FilterGroup, FilterGrid, Loading } from '../primitive';
import React, { useEffect, useState } from 'react';
import { getTableData } from '../../services/firebase/db';
import styles from './screener.module.css'

const ASIAN_COUNTRIES = [
    "Hong Kong",
    "Korea",
    "Taiwan", 
    "Thailand",
    "Indonesia",
    "Malaysia",
    "Vietnam",
    "India",
    "Singapore",
] 
const EUROPEAN_COUNTRIES = [
    "Sweden",
    "Norway",
    "United Kingdom", 
    "Turkey",
    "Switzerland", 
    "Netherlands",
    "Poland",
    "Italy", 
    "Belgium", 
    "Denmark",
    "Germany", 
    "Helsinki", 
    "Iceland", 
    "Spain", 
    "France", 
    "Greece", 
    "Ireland", 
    "Lithuania",
    "Austria",
    "Latvia",
    "Czech",
    "Estonia",
    "Portugal",
    "Hungary"
]

const fetchData = async ({ type, onSuccess, filtered, setLoading}) => {
    setLoading(true);
    getTableData(type, filtered).then((data) => {onSuccess(data); setLoading(false)})
}; 



const regions = ['USA', 'Canada', 'Asia', 'Europe', 'Japan', 'Germany', 'United Kingdom', 'India']


export const Screener=() =>{
    
    const [currentPill, setCurrentPill] = useState(0);
    const [currentTab, setCurrentTab] = useState(0);

    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [gridSelected, gridSelect] = useState([])
    
    const [filters, setFilters] = useState([]);
    const [data, setData] = useState([[]]);
    const [cache, setCache] = useState({});
    const [lightCache, setLightCache] = useState({});
    const [loading, setLoading] = useState(true)

    let sectors = [
        'Technology', 'Financial Services', 'Consumer Cyclical', 'Healthcare', 'Communication Services',
        'Energy', 'Utilities', 'Industrials', 'Consumer Defensive', 'Real Estate', 'Basic Materials'
    ]
    sectors = currentPill === 0 ? sectors : [...sectors, 'Diversified'];

    
    // Define initial state for select group based on tab options
    const initialSelectStates = [
        [0, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];

    const [selectStates, setSelectStates] = useState(initialSelectStates);


    const setRegions = (l) => {
        let options = regions.filter((value, index) => l(selectedRegions).includes(index))
        if (options.includes("Asia")) {
            options = options.concat(ASIAN_COUNTRIES);
        }
        if (options.includes("Europe")) {
            options = options.concat(EUROPEAN_COUNTRIES);
        }
        
        if (options.length > 0) {
            if (options.some((o)=>o!=="USA")) {
                loadFull()
            }
            addF({
                id: "region",
                fit: (row) => options.includes(row.region)
            })
        } else {
            removeF({id: "region"})
            loadFull()
        }
        setSelectedRegions(l);
        
    }

    const setSectors = (l) => {
        const options = sectors.filter((value, index) => l(selectedSectors).includes(index))
        if (options.length > 0) {
            addF({
                id: "sector",
                fit: (row) => options.includes(row.sector)
            })
        } else {
            removeF({id: "sector"})
        }
        setSelectedSectors(l);
    }

    const selectGrid = (l) => {
        let sizeOptions;
        let valuationOptions;

        if (currentPill ===0) { 
            sizeOptions =[
            [50e9, null],
            [400e6, 50e9],
            [null, 400e6]
            ]
            valuationOptions = [
                [null, 15],
                [15, 30],
                [30, null]
            ]
        } else if (currentPill===1) {
            sizeOptions = [
            [50e6, null],
            [20e6, 50e6],
            [null, 20e6]
            ]
            valuationOptions = [
                [null, 13],
                [13, 24],
                [24, null]
            ]
        }
        else {
            sizeOptions = [
            [200e6, null],
            [50e6, 200e6],
            [null, 50e6]
            ]
            valuationOptions = [
                [null, 23],
                [23, 26],
                [26, null]
            ]
        }

        const newSelect = l(gridSelected);

        if (newSelect.length > 0) {
            addF({
                id: "grid",
                fit: (row) => {
                    
                    return newSelect.some((index) => {
                        
                        const i = Math.floor(index / 3);
                        const j = index % 3;

                      
                        // Check if the lower or upper bound is null and treat them as no bound
                        const isSizeInRange = (sizeOptions[i][0] === null || (row['market-cap-usd']||row['assets-usd']) >= sizeOptions[i][0]) &&
                                              (sizeOptions[i][1] === null || (row['market-cap-usd']||row['assets-usd']) < sizeOptions[i][1]);
                      
                        const isValuationInRange = (valuationOptions[j][0] === null || row['p-earnings'] >= valuationOptions[j][0]) &&
                                                   (valuationOptions[j][1] === null || row['p-earnings'] < valuationOptions[j][1]);
                      
                        return isSizeInRange && isValuationInRange;
                      });
                      
                }
            });
        } else {
            removeF({id: "grid"});
        }
        gridSelect(l);
    };
    

    const addF = (newFilter) => {
        setFilters((prev) => {
            // Check if a filter with the same name already exists
            const exists = prev.some((filter) =>
                        filter.id === newFilter.id);
                
            
            if (exists) {
                return prev.map((filter) =>
                    filter.id === newFilter.id ? newFilter : filter
                );
            } else {
                return [...prev, newFilter];
            }
        });
    }

    const removeF = ({ id }) => {
        
        setFilters((prev) => {
            return prev.filter((filter) => filter.id !== id); // Use filter to exclude the filter with the matching display
        });
    };
    
    

    const tabOptions =
        currentPill === 0
            ? ['Profile', 'Q-Score', 'Growth', 'Performance', 'Risk', 'Valuation', 'Profitability', 'Leverage']
            : ['Profile', 'Q-Score', 'Growth', 'Performance', 'Risk'];

    
    const headers = currentPill!==2?["Ticker", "Name", "Sector", currentPill===0?"Market Cap":"Net Assets", "Volume", "5y CAGR (%)", "Q-Score"]:["Ticker", "Name", "Sector","Net Assets", "5y CAGR (%)", "Q-Score"];

    const columnDet = {
        public: currentPill!==2?['ticker', 'name', 'sector', currentPill===0?'market-cap-usd':'assets-usd', 'volume', 'cagr', 'OVERALL']:['ticker', 'name', 'sector', 'assets-usd',  'cagr', 'OVERALL'],
        percent: ['cagr'], 
        large: ['market-cap-usd','assets-usd','volume'],
    }

    const loadFull = () => {
        if (cache[currentPill])
        {
            setData(cache[currentPill])
            return;
        }
        fetchData({
            type: currentPill,
            onSuccess: (data) => {
              
              setCache((prev) => ({ ...prev, [currentPill]: data }));
              setData(data);
            },
            filtered: false,
            setLoading
        });
    }


    useEffect(() => {
        setSectors(() => [])
        gridSelect([])
        if (cache[currentPill]) {
          setFilters([])
          setSelectedRegions([])
          setSelectStates([
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ]);
          setData(cache[currentPill]);
          return;  // Exit early if data is already cached
        }
        setSelectStates(initialSelectStates)
        
        setFilters([
            {
                display: currentPill==0?'Market Cap':'Net Assets',
                id: currentPill===0?'market-cap-usd':'assets-usd',
                fit: (asset) => {
                    const lowerBound = [50e9, 50e6, 200e6][currentPill];
                
                    return asset[currentPill==0?'market-cap-usd':'assets-usd'] >= lowerBound;
                },
                label: 'Large',
                onRemove: () => {
                    delFilter({tabIndex: 0, groupIndex: 1})
                    removeF({id: currentPill==0?'market-cap-usd':'assets-usd'})
                    loadFull();
                }
            }
        ])
        setRegions((prev)=>{return [0]}) // USA

        if (lightCache[currentPill]) {
            
            setData(lightCache[currentPill]);
            return;  // Exit early if data is already cached
          }
        
        fetchData({
          type: currentPill,
          onSuccess: (data) => {
            
            setLightCache((prev) => ({ ...prev, [currentPill]: data }));
            setData(data);
          },
          filtered: true,
          setLoading
        });
      }, [currentPill]);
      

    const optionData = [
        currentPill!==0? currentPill!==2?[ //Profile
            
        ['yield', 'Yield (%)', [['Any'], ['> 0.5%', 0.005, null], ['> 1%', 0.01, null], ['> 2%', 0.02, null], ['> 4%', 0.04, null]]], 
        ['assets-usd', 'Net Assets', [['Any'], ['Small', null, 20e6], ['Med', 20e6, 50e6], ['Large', 50e6, null]]],
        ['holding-diversity', 'Holding Diversity', [['Any'], ['Low', null, 0.65], ['Med', 0.65, 0.75], ['High', 0.75, null]] ], //Expense Ratio (ETF / fund)
        ['sector-diversity', 'Sector Diversity', [['Any'], ['Low', null, 0.67], ['Med', 0.67, 0.74], ['High', 0.74, null]]], //Dividend Yield
        ['turnover', 'Turnover Ratio', [['Any'], ['Low', 0, 0.20], ['Med', 0.20, 0.80], ['High', 0.80, null]]], //Turnover Ratio (ETF / fund)
        ['expenses', 'Expense Ratio', [['Any'], ['< 0.05%', null, 0.0005], ['< 0.1%', null, 0.001], ['< 0.2%', null, 0.002], ['< 0.5%', null, 0.005]] ], //Expense Ratio (ETF / fund)
        ['volume', 'Daily Volume', [['Any'], ['Low', null, 400e3], ['Med', 400e3, 5e6], ['High', 5e6, null]] ],  //Daily Volume
        ]: [
        ['yield', 'Yield (%)', [['Any'], ['> 0.5%', 0.005, null], ['> 1%', 0.01, null], ['> 2%', 0.02, null], ['> 4%', 0.04, null]]], 
        ['assets-usd', 'Net Assets', [['Any'], ['Small', null, 50e6], ['Med', 50e6, 200e6], ['Large', 200e6, null]]], //Net Assets (ETF / fund)
        ['holding-diversity', 'Holding Diversity', [['Any'], ['Low', null, 0.65], ['Med', 0.65, 0.75], ['High', 0.75, null]] ], //Expense Ratio (ETF / fund)
        ['sector-diversity', 'Sector Diversity', [['Any'], ['Low', null, 0.67], ['Med', 0.67, 0.74], ['High', 0.74, null]]], //Dividend Yield
        ['expenses', 'Expense Ratio', [['Any'], ['< 0.05%', null, 0.0005], ['< 0.1%', null, 0.001], ['< 0.2%', null, 0.002], ['< 0.5%', null, 0.005]] ], //Expense Ratio (ETF / f
        ] :
        [
        ['yield', 'Yield (%)', [['Any'], ['> 0.5%', 0.005, null], ['> 1%', 0.01, null], ['> 2%', 0.02, null], ['> 4%', 0.04, null]]],  //Dividend Yield
        ['market-cap-usd', 'Market Cap', [['Any'], ['Small', null, 400e6], ['Medium', 400e6, 50e9], ['Large', 50e9, null]] ],  //Market Cap (Equity)
        ['volume', 'Daily Volume', [['Any'], ['Low', null, 500e3], ['Med', 500e3, 20e6], ['High', 20e6, null]] ],  //Daily Volume
        ],
        currentPill==0?[ //Q-Scores

            ['OVERALL', 'Overall', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
            ['G', 'Growth', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
            ['R', 'Risk', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
            ['PE', 'Performance', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
            ['V', 'Valuation', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
            ['PR', 'Profitability', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
            ['L', 'Leverage', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
        ]:
        [ //Q-Scores

            ['OVERALL', 'Overall', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
            ['G', 'Growth', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
            ['R', 'Risk', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
            ['PE', 'Performance', [['Any'], ['Fair', 0.5, null], ['Good', 0.7, null], ['Great', 0.8, null], ['Exceptional', 0.9, null]]],
        ],
            
        
        currentPill===0?[ //Growth
            
        ['cagr', '5y CAGR', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 40%', 0.40, null]]],
        ['3y', '3y CAGR', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 40%', 0.40, null]] ],
        ['yoy', '1y Return', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 40%', 0.40, null]] ],
        ['6mo', '6mo CAGR', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 40%', 0.40, null]] ],  //Expense Ratio (ETF / fund)
        ['div-g', 'Dividend Growth', [['Any'], ['> 3%', 0.03, null], ['> 5%', 0.05, null], ['> 10%', 0.1, null], ['> 20%', 0.20, null]] ],  
        ]:[ 
            
            ['cagr', '5y CAGR', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 15%', 0.15, null], ['> 25%', 0.25, null]]],
            ['3y', '3y CAGR', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 15%', 0.25, null], ['> 25%', 0.40, null]] ],
            ['yoy', '1y Return', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 15%', 0.25, null], ['> 25%', 0.40, null]] ],
            ['6mo', '6mo CAGR', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 15%', 0.25, null], ['> 25%', 0.40, null]] ],  //Expense Ratio (ETF / fund)
            ['div-g', 'Dividend Growth', [['Any'], ['> 3%', 0.03, null], ['> 5%', 0.05, null], ['> 8%', 0.08, null],] ],  
            ],
        currentPill===0?[ //Performance
            
        ['alpha', 'Alpha', [['Any'], ['> 0%', 0, null], ['> 1%', 0.01, null], ['> 2%', 0.02, null], ['> 4%', 0.04, null]]],
        ['sortino', 'Sortino', [['Any'], ['> 10%', 0.1, null], ['> 25%', 0.25, null], ['> 50%', 0.5, null], ['> 75%', 0.75, null]]],
        ['sharpe', 'Sharpe', [['Any'], ['> 10%', 0.1, null], ['> 20%', 0.2, null], ['> 30%', 0.3, null], ['> 40%', 0.4, null]]],
        ['m-squared', 'M-Squared', [['Any'], ['> 0.5%', 0.005, null], ['> 1%', 0.01, null], ['> 1.5%', 0.015, null], ['> 2%', 0.02, null]]],
        ['omega', 'Omega', [['Any'], ['> 1', 1, null], ['> 1.5', 1.5, null], ['> 2', 2, null], ['> 3', 3, null]]],
        ['calmar', 'Calmar', [['Any'], ['> 0.25', 0.25, null], ['> 0.5', 0.5, null], ['> 0.8', 0.8, null], ['> 1.2', 1.2, null]]],
        ['martin', 'Martin', [['Any'], ['> 0.5', 0.5, null], ['> 1', 1, null], ['> 2', 2, null], ['> 3', 3, null]]],
        ]:[ //Performance
            
            ['alpha', 'Alpha', [['Any'], ['> 0%', 0, null], ['> 0.2%', 0.002, null], ['> 0.5%', 0.005, null], ['> 1%', 0.01, null]]],
            ['sortino', 'Sortino', [['Any'], ['> 10%', 0.1, null], ['> 25%', 0.25, null], ['> 0.50%', 0.5, null]]],
            ['sharpe', 'Sharpe', [['Any'], ['> 10%', 0.1, null], ['> 20%', 0.2, null], ['> 30%', 0.3, null]]],
            ['m-squared', 'M-Squared', [['Any'], ['> 0.5%', 0.005, null], ['> 1%', 0.01, null], ['> 1.5%', 0.015, null], ['> 2%', 0.02, null]]],
            ['omega', 'Omega', [['Any'], ['> 1', 1, null], ['> 1.5', 1.5, null], ['> 2', 2, null], ['> 3', 3, null]]],
            ['calmar', 'Calmar', [['Any'], ['> 0.25', 0.25, null], ['> 0.5', 0.5, null], ['> 0.8', 0.8, null], ['> 1.2', 1.2, null]]],
            ['martin', 'Martin', [['Any'], ['> 0.5', 0.5, null], ['> 1', 1, null], ['> 2', 2, null], ['> 3', 3, null]]],
            ],
        currentPill===0?[ //Risk
            
            ['max-d', 'Max. Drawdown', [['Any'], ['< 10%', null, 0.10], ['< 25%', null, 0.25], ['< 50%', null, 0.50], ['< 80%', null, 0.80]]],
            ['avg-d', 'Avg. Drawdown', [['Any'], ['< 5%', null, 0.05], ['< 10%', null, 0.10], ['< 25%', null, 0.25]]],
            ['std-dev', 'Std. Deviation', [['Any'], ['< 5%', null, 0.05], ['< 10%', null, 0.1], ['< 20%', null, 0.2]]],
            ['beta', 'Beta', [['Any'], ['Negative', null, 0], ['Low', 0, 0.8], ['Mid', 0.8, 1.2], ['High', 1.2, null]] ], 
            ['var1', 'VaR 1%', [['Any'], ['< 5%', null, 0.05], ['< 10%', null, 0.10], ['< 15%', null, 0.15], ['< 25%', null, 0.25]]],
            ['var5', 'VaR 5%', [['Any'], ['< 5%', null, 0.05], ['< 10%', null, 0.10], ['< 15%', null, 0.15], ['< 25%', null, 0.25]]],
            ['var10', 'VaR 10%', [['Any'], ['< 2%', null, 0.02], ['< 5%', null, 0.05], ['< 10%', null, 0.10], ['< 15%', null, 0.15]]]
        ]:[ //Risk
            
            ['max-d', 'Max. Drawdown', [['Any'], ['< 10%', null, 0.10], ['< 20%', null, 0.20], ['< 30%', null, 0.30]]],
            ['avg-d', 'Avg. Drawdown', [['Any'], ['< 3%', null, 0.03], ['< 5%', null, 0.05], ['< 10%', null, 0.1]]],
            ['std-dev', 'Std. Deviation', [['Any'], ['< 3%', null, 0.03], ['< 4%', null, 0.04], ['< 5%', null, 0.05]]],
            ['beta', 'Beta', [['Any'], ['Negative', null, 0], ['Low', 0, 0.6], ['Mid', 0.6, 1], ['High', 1, null]] ], 
            ['var1', 'VaR 1%', [['Any'], ['< 5%', null, 0.05], ['< 8%', null, 0.08], ['< 10%', null, 0.1]]],
            ['var5', 'VaR 5%', [['Any'], ['< 4%', null, 0.04], ['< 6%', null, 0.6], ['< 10%', null, 0.1]]],
            ['var10', 'VaR 10%', [['Any'], ['< 2%', null, 0.02], ['< 4%', null, 0.04], ['< 8%', null, 0.08]]]
        ],
        [ //Valuation
            
            ['p-earnings', 'Price to Earnings', [['Any'], ['< 10', null, 10], ['< 15', null, 15], ['< 25', null, 25], ['< 40', null, 40]]],
            ['p-book', 'Price to Book', [['Any'], ['< 5', null, 5], ['< 10', null, 10], ['< 15', null, 15], ['< 25', null, 25]]],
            ['p-sales', 'Price to Sales', [['Any'], ['< 2', null, 2], ['< 5', null, 5], ['< 10', null, 10], ['< 15', null, 15]]],
            ['peg', 'PE to Growth', [['Any'], ['< 0.5', null, 0.5], ['< 1', null, 1], ['< 2', null, 2], ['< 3', null, 3]]],
        ],
        [ //Profitability
        
            ['profit-m', 'Profit Margin', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 50%', 0.50, null]]],
            ['roe', 'ROE', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 50%', 0.50, null]]],
            ['roa', 'ROA', [['Any'], ['> 3%', 0.03, null], ['> 8%', 0.08, null], ['> 15%', 0.15, null], ['> 30%', 0.30, null]]],
            ['earnings-g', 'Earnings Growth', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 50%', 0.50, null]]],
            ['revenue-g', 'Revenue Growth', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 50%', 0.50, null]]],
        ],
        [
            ['wacc', 'WACC', [['Any'], ['< 5%', null, 0.05], ['< 10%', null, 0.1], ['< 15%', null, 0.15], ['< 20%', null, 0.20]]],
            ['debt-e', 'Debt to Equity', [['Any'], ['< 0.2', null, 0.2], ['< 0.5', null, 0.5], ['< 1', null, 1], ['< 2', null, 2]]],
            ['debt-a', 'Debt to Assets', [['Any'], ['< 0.1', null, 0.1], ['< 0.2', null, 0.2], ['< 0.5', null, 0.5]]],
            ['debt-ebit', 'Debt to EBITDA', [['Any'], ['< 0.5', null, 0.5], ['< 1', null, 1], ['< 2', null, 2]]],
            ['assets-l', 'Assets to Liabilities', [['Any'], ['> 1', 1, null], ['> 1.5', 1.5, null], ['> 2', 2, null], ['> 4', 4, null]]],
            ['altman-z', 'Altman Z-Score', [['Any'], ['Fair', 1.8, null], ['Good', 3, null], ['Excellent', 6, null]]]
        ]
    ];



    const addFilter = (index, value) => {
        const [col, disp, options] = optionData[currentTab][index]
        const [lab, n1, n2] = options[value]
        const newFilter = {
            display: disp,
            id: col,
            fit: (asset) => {
                const lowerBound = n1 === null ? -Infinity : n1;
                const upperBound = n2 === null ? Infinity : n2;
            
                return asset[col] >= lowerBound && asset[col] < upperBound;
            },
            label: lab,
            onRemove: () => {
                delFilter({tabIndex: currentTab, groupIndex: index})
                removeF({id: col})
            }
        };
    
        setFilters((prev) => {
            // Check if a filter with the same name already exists
            const exists = prev.some((filter) =>
                        filter.id === newFilter.id);
                

            if (exists) {
                return prev.map((filter) =>
                    filter.id === newFilter.id ? newFilter : filter
                );
            } else {
                // Add the new filter
                return [...prev, newFilter];
            }
        });
    };
    

    const removeFilter = (index) => {
        const disp = optionData[currentTab][index][0];
        if (disp === (currentPill===0?'market-cap-usd':'assets-usd')) {
            loadFull()
        }
        setFilters((prev) => {
            return prev.filter((filter) => filter.id !== disp);
        });
    };    

    const delFilter = ({tabIndex, groupIndex}) => {
        setSelectStates((prev) => {
            const updatedStates = {...prev};
            updatedStates[tabIndex] = [...updatedStates[tabIndex]];
            updatedStates[tabIndex][groupIndex] = 0;
            return updatedStates;
        });
    };

    const handleSelectChange = (tabIndex, index, value) => {
        if (value === 0) {
            removeFilter(index);
        } else {
            addFilter(index, value);
        }
    
        setSelectStates((prev) => {
            const updatedState = { ...prev };
            updatedState[tabIndex][index] = value;
            return updatedState;
        });
    };
    

    return (
        
            <div className={styles.container}>
                <PillGroup
                    currentPill={currentPill}
                    onSelect={(index) => {
                        setCurrentPill(index);
                        setCurrentTab(0); // Reset tab to the first option when switching filters
                    }}
                    options={['Equities', 'ETFs','Mutual Funds']}
                />
                
                <TabGroup
                    currentTab={currentTab}
                    onSelect={setCurrentTab}
                    options={tabOptions}
                />
                
                {optionData.map((group, groupIndex) => (
                        currentTab === groupIndex ? 
                        <div> 
                            { currentTab === 0 ? (
                            <div className={styles.profileRow}> 
                                <div className={styles.profileTag}>
                                    <label className="subhead subtle">Region</label>
                                    <TagGroup
                                        items={regions}
                                        selectedIndices={selectedRegions}
                                        setSelectedIndices={setRegions}
                                    />
                                    <label className="subhead subtle">Sector</label>
                                    <TagGroup
                                        items={sectors}
                                        selectedIndices={selectedSectors}
                                        setSelectedIndices={setSectors}
                                    />
                                </div>
                                <div className={styles.grid}>
                                
                                    <FilterGrid rows={['Large','Mid','Small']} selected={gridSelected} cols={['Value', currentPill===0?'Core':'Blend','Growth']} setSelected={selectGrid} />
                                    
                                </div>
                            </div>
                        ): null }
                        
                        <SelectGroup
                            key={`${currentTab}-${groupIndex}`}
                            optionData={group}
                            selected={selectStates[currentTab]}
                            setSelected={(index, value) =>
                                handleSelectChange(currentTab, index, value)
                            }
                        />
                        
                    </div> : null
                        
                ))}

                <FilterGroup items={filters} removeItem={delFilter} />
                {loading?<Loading />:
                <Table header={headers} data={data} filters={filters} isIndexed={true} hints={true} rowsPerPage={25} columnDetails={columnDet} defSort={'market-cap-usd'}/>}
            </div>
        
    );
}

