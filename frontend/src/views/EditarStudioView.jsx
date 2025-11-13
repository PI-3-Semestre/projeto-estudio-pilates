import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import useEditarStudioViewModel from '../viewmodels/useEditarStudioViewModel';

const EditarStudioView = () => {
  const { id } = useParams();
  const {
    nome,
    endereco,
    loading,
    saving,
    handleNomeChange,
    handleEnderecoChange,
    handleSubmit,
  } = useEditarStudioViewModel();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando dados para edição...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark">
      <Header />
      
      <main className="relative flex flex-1 flex-col items-center justify-center p-4">
        <div className="flex w-full max-w-lg flex-col rounded-xl bg-card-light dark:bg-card-dark shadow-lg">
          {/* Form Header */}
          <div className="flex items-center p-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <Link to={`/studios/${id}`} className="text-text-light dark:text-text-dark flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
            <h2 className="flex-1 text-center text-lg font-bold tracking-tight text-text-light dark:text-text-dark -ml-12">
              Editar Studio
            </h2>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
            {/* Studio Name Input */}
            <label className="flex flex-col">
              <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">
                Nome do Studio
              </p>
              <input
                className="form-input h-14 w-full rounded-xl border-none bg-input-background-light dark:bg-input-background-dark p-4 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-action-primary"
                value={nome}
                onChange={handleNomeChange}
                disabled={saving}
              />
            </label>

            {/* Full Address Input */}
            <label className="flex flex-col">
              <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">
                Endereço Completo
              </p>
              <textarea
                className="form-input min-h-36 w-full rounded-xl border-none bg-input-background-light dark:bg-input-background-dark p-4 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-action-primary"
                value={endereco}
                onChange={handleEnderecoChange}
                disabled={saving}
              />
            </label>

            {/* Save Button */}
            <div className="flex pt-2">
              <button
                type="submit"
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-action-primary px-5 text-white font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                <span className="truncate">{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditarStudioView;
