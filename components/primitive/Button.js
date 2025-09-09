// Button.js
import React from 'react';
// import './Button.css';
import { IconTrash } from '../icons';

export function Button({ type = 'primary', label, className, disabled = false, onClick, icon='none' }) {
  

  return (
    <button
    className={`btn ${type} ${disabled ? 'disabled' : ''} ${className || ''} ${icon==='trash'? 'warning': ''}`}
    style= {{display:'flex', gap:'4px', alignItems:'center'}}
      onClick={onClick}
      disabled={disabled}
    >
      <div>
      {icon==='trash'&&<IconTrash size='18'/>}
      </div>
     
      <p className='btn-text'>
      {label}
      </p>
      
    </button>
  );
};


