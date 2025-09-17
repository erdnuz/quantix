'use client'

import { Table, SelectGroup } from '.';
import { useState, useEffect } from 'react';
import { TagGroup, FilterGroup } from '../primitive';
import { getPortfolios } from '../../../services/firebase/db';
import { Portfolio } from '../../../types';

const tagItems = [
  "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",
  "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", "Global",
  "Short-term", "Long-term",
];

const header = ['Name', 'Asset Class', 'YoY Return', '3mo Return', 'CAGR', 'Sharpe', 'Alpha', 'Max Drawdown'];
const columnDets = {
  public: ['title', 'primary_class', '1y', '3m', 'cagr', 'sharpe', 'alpha', 'max_drawdown'],
  percent: ['1y', '3m', 'cagr', 'sharpe', 'alpha'], 
  percentNeutral: ['max_drawdown'], 
  large: ['shares'],
  price: ['price','avg-buy']
};

const optionData: [string, string, any[]][] = [
  ['cagr', 'CAGR (%)', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.1, null], ['> 20%', 0.2, null], ['> 40%', 0.40, null]]], 
  ['1y', '1y Return', [['Any'], ['> 5%', 0.05, null], ['> 10%', 0.10, null], ['> 25%', 0.25, null], ['> 40%', 0.40, null]]],  
  ['alpha', 'Alpha', [['Any'], ['> 0%', 0, null], ['> 1%', 0.01, null], ['> 2%', 0.02, null], ['> 4%', 0.04, null]]],
  ['sharpe', 'Sharpe', [['Any'], ['> 10%', 0.1, null], ['> 20%', 0.2, null], ['> 30%', 0.3, null], ['> 40%', 0.4, null]]],
  ['max_drawdown', 'Max. DD', [['Any'], ['< 10%', null, 0.10], ['< 25%', null, 0.25], ['< 50%', null, 0.50], ['< 80%', null, 0.80]]],
  ['yield', 'Yield (%)', [['Any'], ['> 0.5%', 0.005, null], ['> 1%', 0.01, null], ['> 2%', 0.02, null], ['> 4%', 0.04, null]]], 
  ['primary_class', 'Asset Class', [['Any'], ['Equity', 'Equity', 'Equity'], ['ETF', 'ETF', 'ETF'], ['Mutual Fund', 'Mutual Fund', 'Mutual Fund'], ['Diversified', 'Diversified', 'Diversified']]],
];

export const PortfolioScreener = () => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [tableData, setTableData] = useState<Portfolio[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [selectStates, setSelectStates] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  function addIndiceFilter(selected: number[]) {
    const s = selected;
    const newFilter = {
      id: 'tags',
      fit: s.length > 0 ? (asset: any) => asset.tags.some((tag: number) => s.includes(tag)) : () => true
    };
    setFilters(prev => [
      ...prev.filter(f => f.id !== newFilter.id),
      newFilter
    ]);
    setSelectedIndices(selected);
  }

  useEffect(() => {
    getPortfolios().then(setTableData);
  }, []);

  const handleSelectChange = (index: number, value: number) => {
    if (value === 0) removeFilter(index);
    else addFilter(index, value);

    setSelectStates(prev => {
      const newStates = [...prev];
      newStates[index] = value;
      return newStates;
    });
  };

  const removeF = ({ id }: { id: string }) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  };

  const addFilter = (index: number, value: number) => {
    const [col, disp, options] = optionData[index];
    const [lab, n1, n2] = options[value];
    const newFilter = {
      display: disp,
      id: disp,
      fit: (asset: any) => {
        if (asset[col as string] === null) return false;
        if (n1 === n2) return asset[col as string] === n1;
        return (!n1 || asset[col as string] >= n1) && (!n2 || asset[col as string] < n2);
      },
      label: lab,
      onRemove: () => { delFilter({ groupIndex: index }); removeF({ id: disp as string }); }
    };

    setFilters(prev => {
      const exists = prev.some(f => f.display === newFilter.display);
      if (exists) return prev.map(f => f.display === newFilter.display ? newFilter : f);
      return [...prev, newFilter];
    });
  };

  const removeFilter = (index: number) => {
    const disp = optionData[index][1];
    setFilters(prev => prev.filter(f => f.id !== disp));
  };

  const delFilter = ({ groupIndex }: { groupIndex: number }) => {
    setSelectStates(prev => {
      const newStates = [...prev];
      newStates[groupIndex] = 0;
      return newStates;
    });
  };

  return (
    <div className="flex flex-col gap-4 p-16 md:p-6">
      <div className="flex flex-row gap-4 flex-wrap md:flex-col">
        <div className="flex-1">
          <SelectGroup
            optionData={optionData}
            selected={selectStates}
            setSelected={handleSelectChange}
          />
        </div>
        <div className="flex-1">
          <TagGroup
            items={tagItems}
            iconType="hash"
            size={1}
            selectedIndices={selectedIndices}
            setSelectedIndices={addIndiceFilter}
          />
        </div>
      </div>

      <FilterGroup items={filters} />

      <Table
        error="No portfolios found..."
        header={header}
        data={tableData}
        filters={filters}
        isIndexed={true}
        hints={true}
        rowsPerPage={50}
        columnDetails={columnDets}
        defSort="favourites"
      />
    </div>
  );
};
