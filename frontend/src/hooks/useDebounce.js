import { useState, useEffect } from 'react';

/**
 * Hook customizado para "atrasar" a atualização de um valor.
 * Útil para evitar chamadas de API a cada tecla digitada em um campo de busca.
 * @param {any} value - O valor a ser "atrasado".
 * @param {number} delay - O tempo de atraso em milissegundos.
 * @returns {any} O valor após o atraso.
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura um timer para atualizar o valor "atrasado" após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor mudar (ex: usuário continua digitando)
    // ou se o componente for desmontado.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
