import React from 'react';
import { Link } from 'react-router-dom';
import useCadastrarUsuarioViewModel from '../viewmodels/useCadastrarUsuarioViewModel';

const CadastrarUsuarioView = () => {
    const { formData, loading, error, handleChange, handleSubmit } = useCadastrarUsuarioViewModel();

    return (
        <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-text-dark dark:text-text-light">
            <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 md:px-6">
                <Link to="/alunos" className="flex size-10 items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">arrow_back</span>
                </Link>
                <h1 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Criar Novo Usuário - Fase 1</h1>
            </header>
            <main className="flex flex-1 flex-col items-center p-4 md:p-6">
                <div className="w-full max-w-lg bg-card-light dark:bg-card-dark shadow-md rounded-xl p-6 md:p-8">
                    <h2 className="text-2xl font-bold leading-tight tracking-tight text-left pb-6">Dados de Acesso e Identificação</h2>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">Nome Completo *</p>
                            <input
                                name="nome_completo"
                                value={formData.nome_completo}
                                onChange={handleChange}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-dark dark:text-text-light"
                                placeholder="Digite o nome completo do aluno" type="text" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">E-mail *</p>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-dark dark:text-text-light"
                                placeholder="exemplo@email.com" type="email" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">Nome de Usuário (Username) *</p>
                            <input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-dark dark:text-text-light"
                                placeholder="crie um nome de usuário" type="text" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">CPF *</p>
                            <input
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleChange}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-dark dark:text-text-light"
                                placeholder="000.000.000-00" type="text" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">Senha de Acesso *</p>
                            <div className="relative flex w-full items-center">
                                <input
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 pr-12 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-dark dark:text-text-light"
                                    placeholder="Crie uma senha forte" type="password" />
                                <button
                                    className="absolute right-0 flex h-14 w-12 items-center justify-center text-text-subtle-light dark:text-text-subtle-dark"
                                    type="button">
                                    <span className="material-symbols-outlined">visibility_off</span>
                                </button>
                            </div>
                        </label>
                        {error && <p className="text-red-500">{JSON.stringify(error)}</p>}
                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center rounded-lg bg-action-primary h-14 px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-action-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark">
                                {loading ? 'Criando...' : 'Criar Usuário e Continuar'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CadastrarUsuarioView;