import React from 'react';

const Icon = ({ name, className }) => {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
};

export default Icon;