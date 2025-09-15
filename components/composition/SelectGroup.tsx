import React from "react";
import { Select } from "../primitive";

interface SelectGroupProps {
  optionData: [string, string, any[]][];
  selected: number[];
  setSelected: (index: number, value: number) => void;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({ optionData, selected, setSelected }) => {
  return (
    <div className="flex flex-row flex-wrap gap-4 md:gap-6">
      {optionData.map((group, index) => (
        <div key={index} className="flex flex-col gap-1">
          <label className="ml-1 text-sm text-gray-700">{group[1]}</label>
          <Select
            selected={selected[index]}
            setSelected={(value) => setSelected(index, value)}
            options={group[2]}
          />
        </div>
      ))}
    </div>
  );
};
