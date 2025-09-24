'use client'

import { Table, SelectGroup } from '.';
import { useState, useEffect } from 'react';
import { TagGroup, FilterGroup } from '../primitive';
import { getPortfolios } from '../../../services/firebase/db';
import { Filter, Portfolio, PortfolioTag, SelectOption } from '../../../types';

const tagItems: PortfolioTag[] = [
  "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",
  "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", 
  "Short-term", "Long-term",
];

const header = ['Name', 'Asset Class', 'YoY Return', '3mo Return', 'CAGR', 'Sharpe', 'Alpha', 'Max Drawdown'];

const columnDets: Record<'public' | 'percent' | 'neutral', (keyof Portfolio)[]> = {
  public: ['title', 'primaryAssetClass', 'oneYearGrowth', 'threeMonthGrowth', 'cagr', 'sharpe', 'alpha', 'maxDrawdown'],
  percent: ['oneYearGrowth', 'threeMonthGrowth', 'cagr', 'sharpe', 'alpha', 'maxDrawdown'], 
  neutral: ['maxDrawdown'], 
};

const optionData: SelectOption[] = [ { column:'cagr', label:'CAGR (%)', options:[ {label:'Any'}, {label:'> 5%', lowerBound: 0.05}, {label:'> 10%', lowerBound:0.1}, {label:'> 20%', lowerBound:0.2}, {label:'> 40%',lowerBound: 0.40} ] }, { column:'oneYearGrowth', label:'YoY Growth', options:[ {label:'Any'}, {label:'> 5%', lowerBound: 0.05}, {label:'> 10%', lowerBound:0.1}, {label:'> 20%', lowerBound:0.2}, {label:'> 40%',lowerBound: 0.40} ] }, { column:'alpha', label:'Alpha', options:[ {label:'Any'}, {label:'> 0%', lowerBound: 0.0001}, {label:'> 0.5%', lowerBound:0.005}, {label:'> 1%', lowerBound:0.01}, {label:'> 2%',lowerBound: 0.02} ] }, { column:'sharpe', label:'Sharpe', options:[ {label:'Any'}, {label:'> 10%', lowerBound: 0.1}, {label:'> 20%', lowerBound:0.2}, {label:'> 30%', lowerBound:0.3}, {label:'> 40%',lowerBound: 0.40} ] }, { column:'maxDrawdown', label:'Max. DD', options:[ {label:'Any'}, {label:'< 5%', upperBound: 0.05}, {label:'< 10%', upperBound:0.1}, {label:'< 20%', upperBound:0.2}, {label:'< 40%', upperBound: 0.40} ] }, { column:'yield', label:'Yield (%)', options:[ {label:'Any'}, {label:'> 0.5%', lowerBound:0.005}, {label:'> 1%', lowerBound:0.01}, {label:'> 2%', lowerBound:0.02}, {label:'> 4%', lowerBound:0.04} ] }, { column:'primaryAssetClass', label:'Asset Class', options:[ {label:'Any'}, {label:'Equity', eq:'Equity'}, {label:'ETF', eq:'ETF'}, {label:'Mixed', eq:'Mixed'} ] } ];

export const PortfolioScreener = () => {
  const [selectedTagIndices, setSelectedTagIndices] = useState<number[]>([]);
  const [tableData, setTableData] = useState<Portfolio[]>([]);
  const [filters, setFilters] = useState<Filter<Portfolio>[]>([]);
  const [selectStates, setSelectStates] = useState<number[]>(Array(optionData.length).fill(0));

  useEffect(() => {
    getPortfolios().then(setTableData);
  }, []);

  const addTagFilter = (selectedIndices: number[]) => {
    setSelectedTagIndices(selectedIndices);
    if (!selectedIndices.length) {
      setFilters(prev => prev.filter(f => f.id !== 'tags'));
      return;
    }
    const newFilter: Filter<Portfolio> = {
      id: 'tags',
      display: 'Tags',
      label: selectedIndices.map((i) => tagItems[i]).join(' or '),
      fit: (asset: Portfolio) => {
        return asset.tags?.some((tag: PortfolioTag) => selectedIndices.includes(tagItems.indexOf(tag))) ?? false;
      },
      onRemove: () => {
        setSelectedTagIndices([]);
        removeFilterInternal('tags');
      }
    };
    setFilters(prev => [...prev.filter(f => f.id !== newFilter.id), newFilter]);
  };

  const addSelectFilter = ({ index, value }: { index:number, value:number }) => {
    const option = optionData[index];
    if (value === 0) {
      removeFilterInternal(option.column);
      setSelectStates(prev => { const copy = [...prev]; copy[index] = 0; return copy; });
      return;
    }
    const lowerBound = option.options[value].lowerBound;
    const upperBound = option.options[value].upperBound;
    const eq = option.options[value].eq;

    const filter: Filter<Portfolio> = {
      display: option.label,
      label: option.options[value].label,
      id: option.column,
      fit: (asset: Portfolio) => {
        const cell = asset[option.column as keyof Portfolio];
        return (
          cell != null &&
          (lowerBound == null || (cell as number) >= lowerBound) &&
          (upperBound == null || (cell as number) < upperBound) &&
          (eq == null || cell === eq)
        );
      },
      onRemove: () => {
        removeFilterInternal(option.column);
        setSelectStates(prev => { const copy = [...prev]; copy[index] = 0; return copy; });
      }
    };
    setSelectStates(prev => { const copy = [...prev]; copy[index] = value; return copy; });
    addFilterInternal(filter);
  };

  const addFilterInternal = (newFilter: Filter<Portfolio>) => {
    setFilters(prev => prev.some(f => f.id === newFilter.id) ? prev.map(f => f.id === newFilter.id ? newFilter : f) : [...prev, newFilter]);
  };

  const removeFilterInternal = (id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  };

  const handleSelectChange = (index: number, value: number) => {
    addSelectFilter({ index, value });
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 md:p-12">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-wrap">
        <div className="flex-1 justify-center">
          <SelectGroup
            optionData={optionData}
            selected={selectStates}
            setSelected={handleSelectChange}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <h3 className="text-base sm:text-lg mb-2">Portfolio Tags:</h3>
          <TagGroup
            items={tagItems}
            iconType="hash"
            selectedIndices={selectedTagIndices}
            setSelectedIndices={addTagFilter}
          />
        </div>
      </div>

      {/* Active Filters */}
      <FilterGroup<Portfolio> items={filters} />

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <Table<Portfolio>
          error="No portfolios found..."
          header={header}
          data={tableData}
          filters={filters}
          isIndexed
          hints
          rowsPerPage={50}
          columnDetails={columnDets}
          defSort="cagr"
        />
      </div>
    </div>
  );
};
