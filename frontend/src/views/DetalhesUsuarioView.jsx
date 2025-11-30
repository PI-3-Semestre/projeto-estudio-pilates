import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useDetalhesUsuarioViewModel from "../viewmodels/useDetalhesUsuarioViewModel";

const DetalhesUsuarioView = () => {
  const { cpf } = useParams();
  const { usuario, loading, error, handleDelete } = useDetalhesUsuarioViewModel(cpf);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const confirmDelete = () => {
    handleDelete(usuario.id);
    closeModal();
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro ao carregar os detalhes do usuário.</div>;
  }

  if (!usuario) {
    return <div>Usuário não encontrado.</div>;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen">
      <div className="relative flex flex-col w-full p-4">
        <div className="flex items-center bg-background-light dark:bg-background-dark py-4 sticky top-0 z-10">
          <button
            onClick={() => navigate("/usuarios")}
            className="flex size-10 shrink-0 items-center justify-center text-text-light dark:text-text-dark"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <h1 className="flex-1 text-lg font-bold text-center text-text-light dark:text-text-dark">
            Detalhes do Usuário
          </h1>
        </div>
        <div className="relative w-full max-w-lg mx-auto bg-card-light dark:bg-card-dark rounded-xl shadow-md p-6 flex flex-col items-center mt-20"> {/* Changed mt-8 to mt-20 */}
          <div className="flex w-full flex-col gap-4 items-center -mt-20">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-28 w-28 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-6xl"
              // You can add logic here to display an actual user photo if available
              // style={{ backgroundImage: `url(${usuario.foto || ''})` }}
            >
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-text-light dark:text-text-dark text-xl font-bold leading-tight">
                {usuario.nome_completo}
              </p>
              <p className="text-text-subtle-light dark:text-text-subtle-dark text-sm">
                {usuario.email}
              </p>
            </div>
          </div>
          <div className="w-full border-t border-gray-200 dark:border-gray-700 my-6"></div>
          <div className="w-full">
            {/* Removed Nome Completo and E-mail as they are now above */}
            <div className="flex justify-between gap-x-4 py-2.5">
              <p className="text-text-subtle-light dark:text-text-subtle-dark text-sm font-normal">
                Username
              </p>
              <p className="text-text-light dark:text-text-dark text-sm font-medium text-right">
                {usuario.username}
              </p>
            </div>
            <div className="flex justify-between gap-x-4 py-2.5">
              <p className="text-text-subtle-light dark:text-text-subtle-dark text-sm font-normal">
                CPF
              </p>
              <p className="text-text-light dark:text-text-dark text-sm font-medium text-right">
                {usuario.cpf}
              </p>
            </div>
            <div className="flex justify-between gap-x-4 py-2.5">
              <p className="text-text-subtle-light dark:text-text-subtle-dark text-sm font-normal">
                Tipo de Usuário
              </p>
              <p className="text-text-light dark:text-text-dark text-sm font-medium text-right">
                {usuario.tipo_usuario}
              </p>
            </div>
          </div>
          <div className="w-full border-t border-gray-200 dark:border-gray-700 my-6"></div>
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <p className="text-text-light dark:text-text-dark text-base font-medium">
                Status
              </p>
            </div>
            <div className="shrink-0">
              <div
                className={`flex items-center justify-center rounded-full px-3 py-1 ${
                  usuario.is_active
                    ? "bg-green-100 dark:bg-green-900/50"
                    : "bg-red-100 dark:bg-red-900/50"
                }`}
              >
                <div
                  className={`size-2 rounded-full mr-2 ${
                    usuario.is_active ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    usuario.is_active
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {usuario.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto mt-6 space-y-3">
          <Link
            to={`/usuarios/editar/${usuario.id}`}
            className="flex w-full items-center justify-center rounded-xl h-12 px-5 bg-action-primary text-white text-base font-bold shadow-sm transition-colors hover:bg-action-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
          >
            <span className="truncate">Editar Usuário</span>
          </Link>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center rounded-xl h-12 px-5 bg-red-600 text-white text-base font-bold shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
          >
            <span className="truncate">Deletar Usuário</span>
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
              <h3 className="mt-5 text-xl font-bold text-text-light dark:text-text-dark">
                Confirmar Exclusão
              </h3>
              <p className="mt-2 text-base text-text-subtle-light dark:text-text-subtle-dark">
                Tem certeza de que deseja deletar o usuário{" "}
                <span className="font-bold">{usuario.nome_completo}</span>? Esta ação não
                pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 bg-background-light dark:bg-background-dark p-4 rounded-b-xl">
              <button
                onClick={closeModal}
                type="button"
                className="w-full inline-flex justify-center rounded-lg px-4 py-2.5 text-base font-medium bg-input-background-light dark:bg-input-background-dark text-text-light dark:text-text-dark hover:bg-input-background-light/80 dark:hover:bg-input-background-dark/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                type="button"
                className="w-full inline-flex justify-center rounded-lg bg-red-600 px-4 py-2.5 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
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

export default DetalhesUsuarioView;
