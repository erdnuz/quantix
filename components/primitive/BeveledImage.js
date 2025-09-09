import React from 'react';

export const BeveledImage = ({ theme, image }) => {
  const imagePath = `/images/${image}-${theme}.png`;

  return (
    <div style={styles.container}>
      <img src={imagePath} alt={`${image} ${theme}`} style={styles.image} />
    </div>
  );
};


const styles = {
  container: {
    overflow: 'hidden',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'inline-block',
  },
  image: {
    display: 'block',
    width: '100%',
    height: 'auto',
  },
};

