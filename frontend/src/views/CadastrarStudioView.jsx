import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import useCadastrarStudioViewModel from '../viewmodels/useCadastrarStudioViewModel';

const CadastrarStudioView = () => {
  const {
    nome,
    endereco,
    isLoading,
    handleNomeChange,
    handleEnderecoChange,
    handleSubmit,
  } = useCadastrarStudioViewModel();

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display group/design-root overflow-x-hidden bg-background-page dark:bg-background-dark">
      <Header />
      
      <main className="relative flex flex-1 flex-col items-center justify-center p-4">
        <div className="flex w-full max-w-lg flex-col rounded-xl bg-card-light dark:bg-card-dark shadow-lg">
          {/* Form Header */}
          <div className="flex items-center p-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <Link to="/studios" className="text-text-light dark:text-text-dark flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
            <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-text-light dark:text-text-dark -ml-10">
              Cadastrar Novo Studio
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
                className="form-input h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-input-background-light dark:bg-input-background-dark p-4 text-base font-normal leading-normal text-text-light dark:text-text-dark placeholder:text-placeholder-light dark:placeholder:text-placeholder-dark focus:outline-none focus:ring-2 focus:ring-action-primary"
                placeholder="Ex: Studio Pilates Centro"
                value={nome}
                onChange={handleNomeChange}
                disabled={isLoading}
              />
            </label>

            {/* Full Address Input */}
            <label className="flex flex-col">
              <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">
                Endereço Completo
              </p>
              <textarea
                className="form-input min-h-36 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-input-background-light dark:bg-input-background-dark p-4 text-base font-normal leading-normal text-text-light dark:text-text-dark placeholder:text-placeholder-light dark:placeholder:text-placeholder-dark focus:outline-none focus:ring-2 focus:ring-action-primary"
                placeholder="Rua das Flores, 123, Bairro, Cidade - Estado, CEP"
                value={endereco}
                onChange={handleEnderecoChange}
                disabled={isLoading}
              />
            </label>

            {/* Save Button */}
            <div className="flex pt-2">
              <button
                type="submit"
                className="flex h-12 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-action-primary px-5 text-base font-bold leading-normal tracking-[0.015em] text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <span className="truncate">{isLoading ? 'Salvando...' : 'Salvar Studio'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CadastrarStudioView;
