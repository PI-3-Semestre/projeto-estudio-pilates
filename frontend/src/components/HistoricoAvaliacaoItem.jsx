import React from 'react';
import { format } from 'date-fns';

const HistoricoAvaliacaoItem = ({ avaliacao, onClick, isActive }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    const date = new Date(dateString);
    date.setUTCDate(date.getUTCDate() + 1);
    return format(date, 'dd/MM/yyyy');
  };

  const baseClasses = "block w-full text-left p-3 rounded-md transition-colors duration-150";
  const activeClasses = "bg-blue-100 text-blue-800 font-semibold";
  const inactiveClasses = "hover:bg-gray-100 text-gray-700";

  return (
    <li>
      <button
        onClick={() => onClick(avaliacao)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      >
        <p className="font-medium">
          Avaliação de {formatDate(avaliacao.data_avaliacao)}
        </p>
        <p className="text-sm">
          Por: {avaliacao.instrutor_nome}
        </p>
      </button>
    </li>
  );
};

export default HistoricoAvaliacaoItem;
