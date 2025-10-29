import React from 'react';
import useAdminCadastroViewModel from '../viewmodels/useAdminCadastroViewModel';
import { Link } from 'react-router-dom';

const AdminCadastroView = () => {
  const {
    formData,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
  } = useAdminCadastroViewModel();

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8fcfb] justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div>
        <div className="flex items-center bg-[#f8fcfb] p-4 pb-2 justify-end">
          <div className="flex w-12 items-center justify-end">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent text-[#0d1b1a] gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
              <div className="text-[#0d1b1a]" data-icon="Question" data-size="24px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>
        <h1 className="text-[#0d1b1a] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-3 pt-5">Criar conta</h1>
        <h2 className="text-[#0d1b1a] text-lg font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-2 pt-4">Crie sua conta para acessar o Define Pilates</h2>
        <form onSubmit={handleSubmit}>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <input
                  placeholder="Nome de usuário"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d1b1a] focus:outline-0 focus:ring-0 border-none bg-[#e7f3f2] focus:border-none h-14 placeholder:text-[#4c9a92] p-4 text-base font-normal leading-normal"
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <input
                  placeholder="Nome Completo"
                  name="definir_nome_completo"
                  value={formData.definir_nome_completo}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d1b1a] focus:outline-0 focus:ring-0 border-none bg-[#e7f3f2] focus:border-none h-14 placeholder:text-[#4c9a92] p-4 text-base font-normal leading-normal"
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
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
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <input
                  placeholder="CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d1b1a] focus:outline-0 focus:ring-0 border-none bg-[#e7f3f2] focus:border-none h-14 placeholder:text-[#4c9a92] p-4 text-base font-normal leading-normal"
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
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
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
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
            {success && <p className="text-green-500 text-sm text-center px-4 py-2">{success}</p>}
            {error && <p role="alert" className="text-red-500 text-sm text-center px-4 py-2">{error}</p>}
            <div className="flex px-4 py-3">
              <button
                type="submit"
                disabled={loading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-[#0fbdac] text-[#0d1b1a] text-base font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">{loading ? 'Criando...' : 'Criar conta'}</span>
              </button>
            </div>
            <p className="text-[#4c9a92] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline">
                <Link to="/login">Já tem uma conta? Faça login</Link>
            </p>
        </form>
      </div>
      <div>
        <div className="h-5 bg-[#f8fcfb]"></div>
      </div>
    </div>
  );
};

export default AdminCadastroView;
