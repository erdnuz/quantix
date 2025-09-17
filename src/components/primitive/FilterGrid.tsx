import React from 'react';

interface FilterGridProps {
  rows: string[];
  cols: string[];
  selected: number[];
  setSelected: (selected: number[]) => void;
}

export const FilterGrid: React.FC<FilterGridProps> = ({
  rows,
  cols,
  selected,
  setSelected
}) => {
  const handleCellClick = (i: number, j: number) => {
    const index = i * cols.length + j;
    if (selected.includes(index)) {
      setSelected(selected.filter((idx) => idx !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-fit">
      {/* Top labels */}
      <div className="flex gap-1 justify-end">
        <div className="flex-[0.4]"></div> {/* Empty top-left cell */}
        {cols.map((col, j) => (
          <div
            key={`col-${j}`}
            className="w-16 text-center flex items-end font-sans text-sm"
          >
            {col}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      {rows.map((row, i) => (
        <div key={`row-${i}`} className="flex gap-1 justify-end">
          {/* Left label */}
          <div className="flex-[0.4] flex items-center justify-end mr-1 font-sans text-sm">
            {row}
          </div>
          {/* Grid cells */}
          {cols.map((_, j) => {
            const index = i * cols.length + j;
            const isSelected = selected.includes(index);
            return (
              <div
                key={`cell-${i}-${j}`}
                className={`
                  h-15 w-15 rounded-md border cursor-pointer
                  ${isSelected
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-blue-400 border-blue-400 hover:bg-blue-500'}
                `}
                onClick={() => handleCellClick(i, j)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
