"use client"
import { Table, SelectGroup } from '../../components/composition';
import {useState, useEffect} from 'react';
import {  TagGroup, FilterGroup } from '../../components/primitive';
import { getPortfolioTableData } from '../../services/firebase/db';
import styles from './portfolioscreener.module.css';

const tagItems = [
    // Investment Strategies
    "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",

    // Market Focus
    "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", "Global",

    // Time Horizon
    "Short-term", "Long-term",
];

const header = ['Name', 'Asset Class', 'YoY Return', '3mo Return', 'CAGR', 'Sharpe', 'Alpha', 'Max Drawdown']
const columnDets = {
    public: ['title', 'primary_class', '1y', '3m', 'cagr', 'sharpe', 'alpha', 'max_drawdown', ],
    percent: ['1y', '3m', 'cagr', 'sharpe', 'alpha'], 
    percentNeutral: ['max_drawdown'], 
    large: ['shares'],
    price: ['price','avg-buy']
  }



const optionData = [
    ['cagr', 'CAGR (%)', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.1, null], ['> 20%', 0.2, null], ['> 40%', 0.40, null]]], 
    
    ['1y', '1y Return', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 40%', 0.40, null]] ],  
    ['alpha', 'Alpha', [['Any'], ['> 0%', 0, null], ['> 1%', 0.01, null], ['> 2%', 0.02, null], ['> 4%', 0.04, null]]],
    ['sharpe', 'Sharpe', [['Any'], ['> 10%', 0.1, null], ['> 20%', 0.2, null], ['> 30%', 0.3, null], ['> 40%', 0.4, null]]],
    ['max_drawdown', 'Max. DD', [['Any'], ['< 10%', null, 0.10], ['< 25%', null, 0.25], ['< 50%', null, 0.50], ['< 80%', null, 0.80]]],
    ['yield', 'Yield (%)', [['Any'], ['> 0.5%', 0.005, null], ['> 1%', 0.01, null], ['> 2%', 0.02, null], ['> 4%', 0.04, null]]], 
    ['primary_class', 'Asset Class', [['Any'], ['Equity', 'Equity', 'Equity'], ['ETF', 'ETF', 'ETF'], ['Mutual Fund', 'Mutual Fund', 'Mutual Fund'], ['Diversified', 'Diversified', 'Diversified']]], 
]
  

export const PortfolioScreener = () => {
    const [selectedIndices, setSelectedIndices] = useState([])
    const [ tableData, setTableData ] = useState([])
    const [filters, setFilters] = useState([])
    const [selectStates, setSelectStates] = useState([0, 0, 0, 0, 0, 0, 0])

    

    function addIndiceFilter(selected) {
        const s = selected(selectedIndices)
        const newFilter = {
          id: 'tags',
          fit: s.length>0?(asset) => asset.tags.some((tag) => s.includes(tag)):()=>{return true}
        };
      
        setFilters((prev) => [
          ...prev.filter((filter) => filter.id !== newFilter.id),  // Remove the old 'tags' filter if it exists
          newFilter                                               // Add the new filter
        ]);
      
        setSelectedIndices(selected);  // Update the selected indices state
      }
      

    useEffect(()=>{
        getPortfolioTableData().then(setTableData)
    }, [])

    const handleSelectChange = (index, value) => {
        if (value === 0) {
            removeFilter(index);
        } else {
            addFilter(index, value);
        }
    
        setSelectStates((prev) => {
            prev[index] = value;
            return prev;
        });
    };

    const removeF = ({ id }) => {
        setFilters((prev) => {
            return prev.filter((filter) => filter.id !== id); // Use filter to exclude the filter with the matching display
        });
    };

    const addFilter = (index, value) => {
        const [col, disp, options] = optionData[index]
        const [lab, n1, n2] = options[value]
        const newFilter = {
            display: disp,
            id: disp,
            fit: (asset) => {
                if (asset[col] === null) return false
                if (n1===n2) return (asset[col] === n1)
                console.log(asset[col])
                return (!n1 || asset[col] >= n1) && (!n2 || asset[col] < n2);
            },
            label: lab,
            onRemove: () => {
                delFilter({groupIndex: index})
                removeF({id: disp})
            }
        };

        
    
        setFilters((prev) => {
            // Check if a filter with the same name already exists
            const exists = prev.some((filter) =>
                        filter.display === newFilter.display);
                

            if (exists) {
                return prev.map((filter) =>
                    filter.display === newFilter.display ? newFilter : filter
                );
            } else {
                // Add the new filter
                return [...prev, newFilter];
            }
        });
    };
    

    const removeFilter = (index) => {
        const disp = optionData[index][1];
        setFilters((prev) => {
            return prev.filter((filter) => filter.id !== disp);
        });
    };    

    const delFilter = ({ groupIndex}) => {
        setSelectStates((prev) => {
            prev[groupIndex] = 0;
            return prev;
        });
    };

    return (
    
    <div className={styles.container}>

        <div className={styles.flexRow}>
        <div style={{flex:1}}>
            <SelectGroup
                                        optionData={optionData}
                                        selected={selectStates}
                                        setSelected={(index, value) =>
                                            handleSelectChange(index, value)
                                        }
                                    />
        </div>
        <div style={{flex:1}}>
        <TagGroup 
                    items={tagItems} 
                    iconType="hash"
                    size={1} 
                    selectedIndices={selectedIndices} 
                    setSelectedIndices={addIndiceFilter}
                    
                />
        </div>
        </div>
        <FilterGroup items={filters} removeItem={delFilter} />
        <Table 
        error="No portfolios found..."
        header={header }
        data={tableData}
        filters={filters}
        isIndexed={true}
        hints={true}
        rowsPerPage={50}
        columnDetails={columnDets}
        defSort={'favourites'}
        />
    </div> 
    
);
}


