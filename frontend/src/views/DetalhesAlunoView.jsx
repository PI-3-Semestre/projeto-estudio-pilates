import React from 'react';
import { Link } from 'react-router-dom';
import useDetalhesAlunoViewModel from '../viewmodels/useDetalhesAlunoViewModel';
import { format } from 'date-fns';

const DetalhesAlunoView = () => {
  const { aluno, studioNames, loading, error } = useDetalhesAlunoViewModel();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro ao carregar os detalhes do aluno.</div>;
  }

  if (!aluno) {
    return <div>Aluno não encontrado.</div>;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen">
      <div className="relative flex flex-col w-full p-4 pt-0">
        <div className="flex items-center bg-background-light dark:bg-background-dark py-4 sticky top-0 z-10">
          <Link to="/gerenciar-alunos" className="flex size-10 shrink-0 items-center justify-center text-gray-800 dark:text-white">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </Link>
          <h1 className="flex-1 text-lg font-bold text-center text-gray-900 dark:text-gray-100 mr-10">
            Detalhes do Aluno
          </h1>
        </div>
        <div className="relative w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center mt-4">
          <div className="flex w-full flex-col gap-4 items-center -mt-20">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-28 w-28 border-4 border-white dark:border-gray-800 shadow-lg"
              style={{ backgroundImage: `url(${aluno.foto || 'https://via.placeholder.com/150'})` }}
            ></div>
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-gray-900 dark:text-white text-xl font-bold leading-tight">{aluno.nome}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{aluno.email}</p>
            </div>
          </div>
          <div className="w-full border-t border-gray-200 dark:border-gray-700 my-6"></div>
          <div className="w-full">
            <div className="flex justify-between gap-x-4 py-2.5">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Nome Completo</p>
              <p className="text-gray-800 dark:text-gray-200 text-sm font-medium text-right">{aluno.nome}</p>
            </div>
            <div className="flex justify-between gap-x-4 py-2.5">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">CPF</p>
              <p className="text-gray-800 dark:text-gray-200 text-sm font-medium text-right">{aluno.cpf}</p>
            </div>
            <div className="flex justify-between gap-x-4 py-2.5">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Data de Nascimento</p>
              <p className="text-gray-800 dark:text-gray-200 text-sm font-medium text-right">
                {format(new Date(aluno.dataNascimento), 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="flex justify-between gap-x-4 py-2.5">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Telefone</p>
              <p className="text-gray-800 darktext-gray-200 text-sm font-medium text-right">{aluno.contato}</p>
            </div>
            <div className="flex justify-between gap-x-4 py-2.5">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Profissão</p>
              <p className="text-gray-800 dark:text-gray-200 text-sm font-medium text-right">{aluno.profissao}</p>
            </div>
            <div className="flex justify-between gap-x-4 py-2.5">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Unidades</p>
              <p className="text-gray-800 dark:text-gray-200 text-sm font-medium text-right">{studioNames.join(', ')}</p>
            </div>
          </div>
          <div className="w-full border-t border-gray-200 dark:border-gray-700 my-6"></div>
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-base font-medium">Status</p>
            </div>
            <div className="shrink-0">
              <div
                className={`flex items-center justify-center rounded-full px-3 py-1 ${
                  aluno.is_active
                    ? 'bg-green-100 dark:bg-green-900/50'
                    : 'bg-red-100 dark:bg-red-900/50'
                }`}
              >
                <div className={`size-2 rounded-full mr-2 ${aluno.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span
                  className={`text-sm font-medium ${
                    aluno.is_active ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {aluno.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-lg mx-auto mt-6 space-y-3">
          <button className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
            <span className="truncate">Editar Perfil</span>
          </button>
          <button className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-red-600 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors">
            <span className="truncate">Deletar Aluno</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalhesAlunoView;