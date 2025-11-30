import React from 'react';
import useAdminCadastroViewModel from '../viewmodels/useAdminCadastroViewModel';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import Header from '../components/Header'; // Importando o Header

const AdminCadastroView = () => {
  const {
    formData,
    loading,
    error,
    isModalOpen,
    setIsModalOpen,
    handleChange,
    handleSubmit,
    handleConfirmCreation,
    userType, // Importar userType do ViewModel
  } = useAdminCadastroViewModel();

  const pageTitle = userType === 'aluno' ? 'Criar Conta de Aluno (Fase 1)' : 'Criar Conta de Colaborador (Fase 1)';
  const formDescription = userType === 'aluno' ? 'Insira os dados de acesso do novo aluno.' : 'Insira os dados de acesso do novo colaborador.';


  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCreation}
        title="Confirmar Criação de Usuário"
        message="Você está prestes a criar um novo usuário. Deseja continuar?"
        isLoading={loading}
      />
      <div
        className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8fcfb] justify-start group/design-root overflow-x-hidden"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <Header title={pageTitle} showBackButton={true} />
        
        <div className="p-4">
          <h2 className="text-[#0d1b1a] text-lg font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-2 pt-4">
            {formDescription}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="flex max-w-[480px] mx-auto flex-col gap-4 py-3">
              <label className="flex flex-col w-full">
                <input
                  placeholder="Nome de usuário"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d1b1a] focus:outline-0 focus:ring-0 border-none bg-[#e7f3f2] focus:border-none h-14 placeholder:text-[#4c9a92] p-4 text-base font-normal leading-normal"
                />
              </label>
              <label className="flex flex-col w-full">
                <input
                  placeholder="Nome Completo"
                  name="definir_nome_completo"
                  value={formData.definir_nome_completo}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d1b1a] focus:outline-0 focus:ring-0 border-none bg-[#e7f3f2] focus:border-none h-14 placeholder:text-[#4c9a92] p-4 text-base font-normal leading-normal"
                />
              </label>
              <label className="flex flex-col w-full">
                <input
                  placeholder="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d1b1a] focus:outline-0 focus:ring-0 border-none bg-[#e7f3f2] focus:border-none h-14 placeholder:text-[#4c9a92] p-4 text-base font-normal leading-normal"
                />
              </label>
              <label className="flex flex-col w-full">
                <input
                  placeholder="CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d1b1a] focus:outline-0 focus:ring-0 border-none bg-[#e7f3f2] focus:border-none h-14 placeholder:text-[#4c9a92] p-4 text-base font-normal leading-normal"
                />
              </label>
              <label className="flex flex-col w-full">
                <input
                  placeholder="Senha"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d1b1a] focus:outline-0 focus:ring-0 border-none bg-[#e7f3f2] focus:border-none h-14 placeholder:text-[#4c9a92] p-4 text-base font-normal leading-normal"
                />
              </label>
              <label className="flex flex-col w-full">
                <input
                  placeholder="Confirmar Senha"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d1b1a] focus:outline-0 focus:ring-0 border-none bg-[#e7f3f2] focus:border-none h-14 placeholder:text-[#4c9a92] p-4 text-base font-normal leading-normal"
                />
              </label>
            </div>
            {error && <p role="alert" className="text-red-500 text-sm text-center px-4 py-2">{error}</p>}
            <div className="flex px-4 py-3 max-w-[480px] mx-auto">
              <button
                type="submit"
                disabled={loading}
                className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-[#0fbdac] text-[#0d1b1a] text-base font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">{loading ? 'Aguarde...' : 'Ir para Fase 2'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminCadastroView;
