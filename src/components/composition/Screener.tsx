"use client";

import React, { useEffect, useState } from "react";
import { Table, SelectGroup } from ".";
import { PillGroup, TabGroup, TagGroup, FilterGroup, FilterGrid, Loading } from "../primitive";
import { getTableData } from "../../../services/firebase/db";
import { AssetClass, AssetTab, Filter,  TableETF, TableStock } from "../../../types";
import { selectOptions, tabOptions } from "../../../options";




export const Screener: React.FC = () => {
  const [currentPill, setCurrentPill] = useState<AssetClass>('Equity');
  const [currentTab, setCurrentTab] = useState<AssetTab>('Profile');
  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
  const [gridSelected, setGridSelected] = useState<number[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [data, setData] = useState<(TableStock | TableETF)[]>([]);
  const [cache, setCache] = useState<Record<AssetClass, (TableStock | TableETF)[]>>({
    Equity: [],
    ETF: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectStates, setSelectStates] = useState<Record<AssetTab, number[]>>({
    'Profile':[0, 0, 0, 0, 0, 0, 0, 0],
    'Q-Scores':[0, 0, 0, 0, 0, 0, 0],
    'Growth':[0, 0, 0, 0, 0],
    'Performance':[0, 0, 0, 0, 0, 0, 0],
    'Risk':[0, 0, 0, 0, 0, 0, 0],
    'Valuation':[0, 0, 0, 0],
    'Profitability':[0, 0, 0, 0, 0, 0],
    'Leverage':[0, 0, 0, 0, 0, 0],
});

  const sectorsBase = [
    "Technology", "Financial Services", "Consumer Cyclical", "Healthcare", "Communication Services",
    "Energy", "Utilities", "Industrials", "Consumer Defensive", "Basic Materials",
  ];
  const sectors = currentPill === 'Equity' ? [...sectorsBase, "Real Estate"] : [...sectorsBase, "Diversified"];

  const fetchData = async ({ equity, onSuccess }: { equity: boolean; onSuccess: (data: any) => void;}) => {
    setLoading(true);
    getTableData({equity, onSuccess:(data)=>{
        onSuccess(data);
        setLoading(false);
    }});
  };

  const setSectors = (indices: number[]) => {
    const options = sectors.filter((_, idx) => indices.includes(idx));
    if (options.length > 0) {
      addFilterInternal({
        id: "sector",
        fit: (row: any) => options.includes(row.sector),
      } as Filter);
    } else {
      removeFilterInternal("sector");
    }
    setSelectedSectors(indices);
  };

  const selectGrid = (indices: number[]) => {
    let sizeOptions: [number | null, number | null][];
    let valuationOptions: [number | null, number | null][];

    if (currentPill === 'Equity') {
      sizeOptions = [[100e9, null], [1e9, 100e9], [null, 1e9]];
      valuationOptions = [[null, 15], [15, 30], [30, null]];
    } else {
      sizeOptions = [[1e9, null], [200e6, 1e9], [null, 200e6]];
      valuationOptions = [[null, 15], [15, 24], [24, null]];
    } 

    if (indices.length > 0 && indices.length < 9) {




      addFilterInternal({
        display:"Category:",
        label: `${buildGridLabel(indices, ["Large", "Mid", "Small"], [
            "Value",
            currentPill === "Equity" ? "Core" : "Blend",
            "Growth",
          ])}`,
        id: "grid",
        onRemove:()=> {
            removeFilterInternal("grid")
            setGridSelected([])
          },
        fit: (row: any) =>
          indices.some((index) => {
            const i = Math.floor(index / 3);
            const j = index % 3;
            const isSizeInRange = (sizeOptions[i][0] === null || row['size'] >= sizeOptions[i][0]) && (sizeOptions[i][1] === null || row['size'] < sizeOptions[i][1]);
            const isValuationInRange = (valuationOptions[j][0] === null || row["priceToEarnings"] >= valuationOptions[j][0]) && (valuationOptions[j][1] === null || row["priceToEarnings"] < valuationOptions[j][1]);
            return isSizeInRange && isValuationInRange;
          }),
          
      } as Filter)
      
      setGridSelected(indices);;
    } else {
      setGridSelected([])
      removeFilterInternal("grid");
    }

  };

  const addSelectFilter = ({tab, index, value} : {tab:AssetTab, index:number, value:number}) => {
    const option = selectOptions(currentPill)[tab][index]

    if (value == 0) {
      removeFilterInternal(option.column)
      return
    }
    
    const lowerBound = option.options[value].lowerBound;
    const upperBound = option.options[value].upperBound
    const filter = {
      display: option.label,
      label: option.options[value].label,
      id: option.column,
      fit: (asset) => {return (!lowerBound || asset[option.column] >= lowerBound) && (!upperBound || asset[option.column] < upperBound)},
      onRemove: () => {
        setSelectStates((prev) => {
          // copy the array for the current tab
          const updatedTab = [...prev[currentTab]];
          // reset the specific index to 0
          updatedTab[index] = 0;

          // return new state with the updated tab
          return {
            ...prev,
            [currentTab]: updatedTab,
          };
        });
        removeFilterInternal(option.column)
      }


    } as Filter
    addFilterInternal(filter);
  }

  const addFilterInternal = (newFilter: Filter) => {
    setFilters((prev) => {
      const exists = prev.some((f) => f.id === newFilter.id);
      return exists ? prev.map((f) => (f.id === newFilter.id ? newFilter : f)) : [...prev, newFilter];
    });
  };

  const removeFilterInternal = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  useEffect(() => {
    setSectors([]);
    selectGrid([]);
    setFilters([]);
    setSelectStates({
    'Profile':[0, 0, 0, 0, 0, 0, 0, 0],
    'Q-Scores':[0, 0, 0, 0, 0, 0, 0],
    'Growth':[0, 0, 0, 0, 0],
    'Performance':[0, 0, 0, 0, 0, 0, 0],
    'Risk':[0, 0, 0, 0, 0, 0, 0],
    'Valuation':[0, 0, 0, 0],
    'Profitability':[0, 0, 0, 0, 0, 0],
    'Leverage':[0, 0, 0, 0, 0, 0],
})
    if (cache[currentPill].length > 0) {
      setData(cache[currentPill]);
      return;
    }
    fetchData({
      equity: currentPill=='Equity',
      onSuccess: (data) => {
        setCache((prev) => ({ ...prev, [currentPill]: data }));
        setData(data);
      },
    });
  }, [currentPill]);

  
  return (
    <div className="p-16 flex flex-col gap-4">
      <PillGroup<AssetClass> currentPill={currentPill} onSelect={(i) => { setCurrentPill(i); setCurrentTab('Profile'); }} options={["Equity", "ETF"]} />
      <TabGroup<AssetTab> currentTab={currentTab} onSelect={setCurrentTab} options={tabOptions(currentPill)} />

      <div className="flex flex-col gap-4">
        {currentTab === 'Profile' && (
          <div className="flex flex-row justify-between gap-2 flex-wrap md:flex-nowrap">
            <div className="flex flex-col flex-1 max-w-[60%] gap-2">
              <label className="text-sm text-gray-500">Sector</label>
              <TagGroup items={sectors} selectedIndices={selectedSectors} setSelectedIndices={setSectors} />
            </div>

            <div className="flex flex-col gap-2 justify-end">
              <FilterGrid
                rows={["Large", "Mid", "Small"]}
                selected={gridSelected}
                cols={["Value", currentPill === 'Equity' ? "Core" : "Blend", "Growth"]}
                setSelected={selectGrid}
              />
            </div>
          </div>
        )}
      </div>

      <SelectGroup 
      optionData={
        selectOptions(currentPill)[currentTab]

      } 
      selected={selectStates[currentTab]} 
      setSelected={(index, value) => {
        addSelectFilter({tab:currentTab, index, value })
        setSelectStates((prev) => {
          const newState = { ...prev, [currentTab]: [...prev[currentTab]] };
          newState[currentTab][index] = value;
          return newState;
        });

      }} />
      <FilterGroup items={filters} />

      {loading ? <Loading /> : <Table 
      header={["Ticker", "Name", "Sector", currentPill==="ETF"?"Net Assets":"Market Cap", "Volume", "Q-Score"]} 
      data={data} 
      filters={filters} 
      isIndexed={false} 
      hints={true} 
      rowsPerPage={25} 
      columnDetails={{
        public:["ticker", "name", "sector", "size", "volume", "qOverall"],
        
      }} 
      defSort="size" />}
    </div>
  );
};

const buildGridLabel = (
  selectedIndices: number[],
  rows: string[],
  cols: string[]
): string => {
  if (!selectedIndices || selectedIndices.length === 0) return "None";

  const numRows = rows.length;
  const numCols = cols.length;

  // Track selection by row and column
  const rowSelections: number[][] = Array.from({ length: numRows }, () => []);
  const colSelections: number[][] = Array.from({ length: numCols }, () => []);

  selectedIndices.forEach((index) => {
    const i = Math.floor(index / numCols);
    const j = index % numCols;
    rowSelections[i].push(j);
    colSelections[j].push(i);
  });

  const labels: string[] = [];

  // Check for full rows first
  rowSelections.forEach((colsSelected, i) => {
    if (colsSelected.length === numCols) {
      // Entire row selected → add row label
      labels.push(rows[i]);
    }
  });

  // Check for full columns
  colSelections.forEach((rowsSelected, j) => {
    if (rowsSelected.length === numRows) {
      // Entire column selected → add column label
      labels.push(cols[j]);
    }
  });

  // Add individual cells not covered by a full row/col
  selectedIndices.forEach((index) => {
    const i = Math.floor(index / numCols);
    const j = index % numCols;
    const fullRow = rowSelections[i].length === numCols;
    const fullCol = colSelections[j].length === numRows;

    // Skip cells already covered by a full row or full col
    if (!fullRow && !fullCol) {
      labels.push(`${rows[i]} – ${cols[j]}`);
    }
  });

  // Deduplicate labels
  return Array.from(new Set(labels)).join(" or ");
};

