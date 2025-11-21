import React from 'react';
import Icon from './Icon';

const FormInput = ({ id, name, label, placeholder, type = 'text', value, onChange, error, required, prefix, step }) => {
  const hasPrefix = !!prefix;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-text-light dark:text-text-dark" htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative rounded-xl shadow-sm">
        {hasPrefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          id={id}
          name={name || id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          step={step}
          min={type === 'number' ? '0' : undefined}
          className={`block w-full pr-10 py-3 text-text-light dark:text-text-dark bg-input-background-light dark:bg-input-background-dark border-transparent focus:border-primary focus:ring-primary rounded-xl placeholder-input-placeholder-light dark:placeholder-input-placeholder-dark ${hasPrefix ? 'pl-10' : 'pl-4'}`}
          required={required}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default FormInput;
