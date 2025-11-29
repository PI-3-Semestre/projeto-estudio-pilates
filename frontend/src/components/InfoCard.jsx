import React from 'react';

const InfoCard = ({ title, children, isLoading, onClick }) => { // Adicionado onClick prop
  const cardClasses = `bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-2 transition-colors duration-300
    ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`; // Adiciona classes de interatividade se onClick existir

  return (
    <div className={cardClasses} onClick={onClick}> {/* Adicionado onClick handler */}
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">
        {isLoading ? (
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        ) : (
          title
        )}
      </h2>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
      ) : (
        <div className="text-gray-700 dark:text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
};

export default InfoCard;
