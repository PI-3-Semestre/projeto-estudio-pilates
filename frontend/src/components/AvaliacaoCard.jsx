import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const AvaliacaoCard = ({ avaliacao, onDelete }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    date.setUTCDate(date.getUTCDate() + 1); // Ajuste de fuso horário
    return format(date, 'dd/MM/yyyy');
  };

  // Impede a propagação do evento de clique para o link pai
  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  const handleCardClick = () => {
    navigate(`/avaliacoes/${avaliacao.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:cursor-pointer"
    >
      <div>
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Aluno</p>
          <p className="font-bold text-lg text-gray-900 dark:text-white truncate">{avaliacao.aluno_nome}</p>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Instrutor</p>
          <p className="text-md text-gray-800 dark:text-gray-200 truncate">{avaliacao.instrutor_nome}</p>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Data da Avaliação</p>
          <p className="text-md text-gray-800 dark:text-gray-200">{formatDate(avaliacao.data_avaliacao)}</p>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end space-x-3">
        <button
          onClick={(e) => {
            handleActionClick(e);
            onDelete(avaliacao);
          }}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Excluir
        </button>
        <Link
          to={`/alunos/${avaliacao.aluno}/avaliacoes`}
          onClick={handleActionClick}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Gerenciar Aluno
        </Link>
      </div>
    </div>
  );
};

export default AvaliacaoCard;
