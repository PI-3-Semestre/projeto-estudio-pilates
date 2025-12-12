import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Icon from './Icon';

const AvaliacaoAlunoCard = ({ avaliacao }) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    const date = new Date(dateString);
    date.setUTCDate(date.getUTCDate() + 1); // Ajuste de fuso horário
    return format(date, 'dd/MM/yyyy');
  };

  return (
    // **CORREÇÃO APLICADA AQUI**
    // Passa o objeto completo da avaliação através do estado da rota.
    <Link 
      to={`/avaliacoes/${avaliacao.id}`}
      state={{ avaliacao: avaliacao }}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-all duration-200 hover:shadow-lg hover:cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <Icon name="assessment" className="text-blue-600 dark:text-blue-300" style={{ fontSize: '28px' }} />
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              Avaliação de {formatDate(avaliacao.data_avaliacao)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Realizada por: {avaliacao.instrutor_nome}
            </p>
          </div>
        </div>
        <Icon name="chevron_right" className="text-gray-400" />
      </div>
    </Link>
  );
};

export default AvaliacaoAlunoCard;
