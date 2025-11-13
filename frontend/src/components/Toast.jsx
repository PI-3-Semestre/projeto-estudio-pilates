import React, { useEffect, useState } from 'react';
import Icon from './Icon';

const toastTypes = {
  success: {
    icon: 'check_circle',
    iconClass: 'text-green-500',
  },
  error: {
    icon: 'error',
    iconClass: 'text-red-500',
  },
  info: {
    icon: 'info',
    iconClass: 'text-blue-500',
  },
};

const Toast = ({ message, type = 'info', onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { icon, iconClass } = toastTypes[type] || toastTypes.info;

  useEffect(() => {
    // Animação de entrada
    const enterTimeout = setTimeout(() => setIsVisible(true), 50);

    // Animação de saída e remoção
    const exitTimeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Espera a transição de saída terminar
    }, 3000); // Tempo que o toast fica visível

    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(exitTimeout);
    };
  }, [onDismiss]);

  return (
    <div
      className={`flex w-full max-w-sm items-center gap-4 rounded-lg bg-card-light dark:bg-card-dark p-4 shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[calc(100%+2rem)]'
      }`}
      role="alert"
    >
      <Icon name={icon} className={iconClass} />
      <p className="text-sm font-medium text-text-light dark:text-text-dark">{message}</p>
    </div>
  );
};

export default Toast;
