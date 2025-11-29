import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

const AlunoCard = ({ aluno, formatPhotoUrl }) => {
  const { nome, email, is_active, foto, cpf } = aluno;

  const getStatusClass = () => {
    return is_active
      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col justify-between transition-transform hover:scale-105">
      <div>
        <div className="flex justify-between items-start mb-3">
          <Avatar
            imageUrl={formatPhotoUrl(foto)}
            alt={`Foto de ${nome}`}
            className="h-16 w-16 shrink-0"
          />
          <Link
            to={`/alunos/detalhes/${cpf}`}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 -mr-1 -mt-1"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </Link>
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{nome}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{email}</p>
      </div>
      <div className="flex justify-start mt-4">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass()}`}>
          {is_active ? 'Ativo' : 'Inativo'}
        </span>
      </div>
    </div>
  );
};

export default AlunoCard;
