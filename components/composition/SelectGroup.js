import React from 'react';
import styles from './selects.module.css'; // Assuming TradingViewWidget is in the same directory
import { Select } from '../primitive';

export function SelectGroup({ optionData, selected, setSelected }) {
  return (
    <div className={styles['select-group']}>
      {optionData.map((group, index) => (
        <div key={index} className={styles["select-input"]}>
          <label>{group[1]}</label>
          <Select
            selected={selected[index]}
            setSelected={(value) => setSelected(index, value)}
            options={group[2]}
          />
        </div>
      ))}
    </div>
  );
}
