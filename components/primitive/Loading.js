import React from 'react';
import {
  BounceLoader,
} from 'react-spinners';

export const Loading = () => {
  return (
    <div style={{width:'100%', padding:'32px', display:'flex', justifyContent:'center'}}>
      <BounceLoader color="var(--sds-color-text-default-default)" size={100} speedMultiplier={1.2} />
    </div>
  );
};



