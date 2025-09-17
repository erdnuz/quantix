"use client";

import React, { useEffect, useState } from "react";
import { Table, SelectGroup } from ".";
import { PillGroup, TabGroup, TagGroup, FilterGroup, FilterGrid, Loading } from "../primitive";
import { getTableData } from "../../../services/firebase/db";
import { Filter } from "../../../types";



export const Screener: React.FC = () => {
  const [currentPill, setCurrentPill] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
  const [gridSelected, setGridSelected] = useState<number[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [data, setData] = useState<any[][]>([[]]);
  const [cache, setCache] = useState<Record<number, any>>({});
  const [lightCache, setLightCache] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectStates, setSelectStates] = useState<number[][]>([
    [0, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ]);

  const sectorsBase = [
    "Technology", "Financial Services", "Consumer Cyclical", "Healthcare", "Communication Services",
    "Energy", "Utilities", "Industrials", "Consumer Defensive", "Real Estate", "Basic Materials",
  ];
  const sectors = currentPill === 0 ? sectorsBase : [...sectorsBase, "Diversified"];

  const fetchData = async ({ equity, onSuccess, filtered }: { equity: boolean; onSuccess: (data: any) => void; filtered: boolean }) => {
    setLoading(true);
    getTableData({equity, filtered, onSuccess:(data)=>{
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

    if (currentPill === 0) {
      sizeOptions = [[50e9, null], [400e6, 50e9], [null, 400e6]];
      valuationOptions = [[null, 15], [15, 30], [30, null]];
    } else {
      sizeOptions = [[50e6, null], [20e6, 50e6], [null, 20e6]];
      valuationOptions = [[null, 13], [13, 24], [24, null]];
    } 

    if (indices.length > 0) {
      addFilterInternal({
        display:"Grid Filter",
        label: "Large",
        id: "grid",
        fit: (row: any) =>
          indices.some((index) => {
            const i = Math.floor(index / 3);
            const j = index % 3;
            const size = row["market-cap"] ?? row["assets"];
            const isSizeInRange = (sizeOptions[i][0] === null || size >= sizeOptions[i][0]) && (sizeOptions[i][1] === null || size < sizeOptions[i][1]);
            const isValuationInRange = (valuationOptions[j][0] === null || row["p-earnings"] >= valuationOptions[j][0]) && (valuationOptions[j][1] === null || row["p-earnings"] < valuationOptions[j][1]);
            return isSizeInRange && isValuationInRange;
          }),
      } as Filter);
    } else {
      removeFilterInternal("grid");
    }

    setGridSelected(indices);
  };

  const addFilterInternal = (newFilter: Filter) => {
    setFilters((prev) => {
      const exists = prev.some((f) => f.id === newFilter.id);
      return exists ? prev.map((f) => (f.id === newFilter.id ? newFilter : f)) : [...prev, newFilter];
    });
  };

  const removeFilterInternal = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const loadFull = () => {
    if (cache[currentPill]) {
      setData(cache[currentPill]);
      return;
    }
    fetchData({
      equity: currentPill==0,
      filtered: false,
      onSuccess: (data) => {
        setCache((prev) => ({ ...prev, [currentPill]: data }));
        setData(data);
      },
    });
  };

  useEffect(() => {
    setSectors([]);
    selectGrid([]);
    setFilters([]);
    if (cache[currentPill]) {
      setData(cache[currentPill]);
      return;
    }
    if (lightCache[currentPill]) {
      setData(lightCache[currentPill]);
      return;
    }
    fetchData({
      equity: currentPill==0,
      filtered: true,
      onSuccess: (data) => {
        setLightCache((prev) => ({ ...prev, [currentPill]: data }));
        setData(data);
      },
    });
  }, [currentPill]);

  const tabOptions = currentPill === 0
    ? ["Profile", "Q-Score", "Growth", "Performance", "Risk", "Valuation", "Profitability", "Leverage"]
    : ["Profile", "Q-Score", "Growth", "Performance", "Risk"];

  return (
    <div className="p-16 flex flex-col gap-4">
      <PillGroup currentPill={currentPill} onSelect={(i) => { setCurrentPill(i); setCurrentTab(0); }} options={["Equities", "ETFs"]} />
      <TabGroup currentTab={currentTab} onSelect={setCurrentTab} options={tabOptions} />

      <div className="flex flex-col gap-4">
        {currentTab === 0 && (
          <div className="flex flex-row justify-between gap-2 flex-wrap md:flex-nowrap">
            <div className="flex flex-col flex-1 max-w-[60%] gap-2">
              <label className="text-sm text-gray-500">Sector</label>
              <TagGroup items={sectors} selectedIndices={selectedSectors} setSelectedIndices={setSectors} />
            </div>

            <div className="flex flex-col gap-2 justify-end">
              <FilterGrid
                rows={["Large", "Mid", "Small"]}
                selected={gridSelected}
                cols={["Value", currentPill === 0 ? "Core" : "Blend", "Growth"]}
                setSelected={selectGrid}
              />
            </div>
          </div>
        )}
      </div>

      <SelectGroup optionData={[]} selected={[]} setSelected={()=>{}} />
      <FilterGroup items={filters} />

      {loading ? <Loading /> : <Table 
      header={["Ticker", "Name", "Sector", currentPill?"Net Assets":"Market Cap", "Volume", "Q-Score"]} 
      data={data} 
      filters={filters} 
      isIndexed={false} 
      hints={true} 
      rowsPerPage={25} 
      columnDetails={{
        public:["ticker", "name", "sector", currentPill?"assets":"market-cap", "volume", "OVERALL"]}} 
      defSort="market-cap" />}
    </div>
  );
};
