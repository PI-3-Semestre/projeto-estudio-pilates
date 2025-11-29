import React from 'react';
import { Link } from 'react-router-dom';

const ColaboradorCard = ({ colaborador, getCPF }) => {
  const { nome_completo, perfis, status, usuario, unidades, telefone } = colaborador;

  // Determina a cor do badge de status
  const getStatusClass = () => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'INATIVO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'FERIAS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const perfilPrincipal = perfis && perfis.length > 0 ? perfis[0].nome : 'Sem perfil';
  const studioPrincipal = unidades && unidades.length > 0 ? unidades[0].studio_nome : 'Sem estúdio';
  const cpf = getCPF(usuario);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col justify-between transition-transform hover:scale-105">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{nome_completo}</h3>
          <Link
            to={`/colaboradores/${cpf}`}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </Link>
        </div>
        <p className="text-sm text-primary dark:text-primary/80 font-medium">{perfilPrincipal.replace('_', ' ')}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{studioPrincipal}</p>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass()}`}>
          {status}
        </span>
        {telefone && (
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm">call</span>
            <span>{telefone}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColaboradorCard;
