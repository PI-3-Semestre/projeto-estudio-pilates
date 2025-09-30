import React from 'react';
import Icon from './Icon';

const FormInput = ({ id, name, label, placeholder, type = 'text', value, onChange, iconName }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-text-light dark:text-text-dark" htmlFor={id}>
        {label}
      </label>
      <div className="mt-1 relative rounded-xl shadow-sm">
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="block w-full pl-4 pr-10 py-3 text-text-light dark:text-text-dark bg-input-bg-light dark:bg-input-bg-dark border-transparent focus:border-primary focus:ring-primary rounded-xl placeholder-input-placeholder-light dark:placeholder-input-placeholder-dark"
        />
        {iconName && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon name={iconName} className="text-input-icon-light dark:text-input-icon-dark" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormInput;