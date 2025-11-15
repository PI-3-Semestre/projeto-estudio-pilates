import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import useDetalhesAlunoViewModel from '../viewmodels/useDetalhesAlunoViewModel';
import { format } from 'date-fns';

const DetalhesAlunoView = () => {
  const { aluno, studioNames, loading, error, handleDelete } = useDetalhesAlunoViewModel();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const navigate = useNavigate();

  const confirmDelete = () => {
    handleDelete();
    closeModal();
  };

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
        <button 
          onClick={() => navigate(-1)} 
          className="flex size-10 shrink-0 items-center justify-center text-gray-800 dark:text-white"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
            <h1 className="flex-1 text-lg font-bold text-center text-gray-900 dark:text-gray-100 mr-10">
              Detalhes do Aluno 
            </h1>
        </div>
        <div className="relative w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center mt-4">
          <div className="flex w-full flex-col gap-4 items-center -mt-20">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-28 w-28 border-4 border-white dark:border-gray-800 shadow-lg"
              style={{ backgroundImage: `url(${aluno.foto || ''})` }}
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
              <p className="text-gray-800 dark:text-gray-200 text-sm font-medium text-right">{aluno.contato}</p>
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
          <button
            onClick={openModal}
            className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-red-600 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors"
          >
            <span className="truncate">Deletar Aluno</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg w-full max-w-md transform transition-all">
            <div className="p-6 text-center">
                <div className="flex justify-center">
                    <div className="flex items-center justify-center size-16 rounded-full bg-red-100 dark:bg-red-900/50">
                        <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-300">
                            warning
                        </span>
                    </div>
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-gray-100">
                    Confirmar Exclusão
                </h3>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    Tem certeza de que deseja deletar o perfil de <span className="font-bold">{aluno.nome}</span>? Esta ação não pode ser desfeita.
                </p>
            </div>
            <div className="flex gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-b-xl">
                <button
                    onClick={closeModal}
                    type="button"
                    className="w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-base font-medium text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
                >
                    Cancelar
                </button>
                <button
                    onClick={confirmDelete}
                    type="button"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2.5 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                >
                    Deletar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalhesAlunoView;