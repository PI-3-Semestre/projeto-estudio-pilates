import React from 'react';
import Icon from './Icon'; // Assumindo que você tem um componente Icon

const StatCard = ({ title, value, iconName, isLoading, bgColorClass = 'bg-primary/20', textColorClass = 'text-primary' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center justify-between transition-colors duration-300`}>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {isLoading ? (
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse mt-1"></div>
        ) : (
          <p className={`text-2xl font-bold ${textColorClass} dark:text-primary-light`}>{value}</p>
        )}
      </div>
      {iconName && (
        <div className={`p-2 rounded-full ${bgColorClass} dark:bg-primary-dark/30`}>
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          ) : (
            <Icon name={iconName} style={{ fontSize: '28px' }} className={`${textColorClass} dark:text-primary-light`} />
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
