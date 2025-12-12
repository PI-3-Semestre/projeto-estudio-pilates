import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon'; // Assumindo que você tem um componente Icon

const QuickActionButton = ({ iconName, label, to }) => {
  return (
    <Link
      to={to}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200"
    >
      <Icon name={iconName} style={{ fontSize: '40px' }} className="text-primary dark:text-primary-light mb-2" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
    </Link>
  );
};

export default QuickActionButton;
