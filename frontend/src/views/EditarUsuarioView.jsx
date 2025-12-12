import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useEditarUsuarioViewModel from '../viewmodels/useEditarUsuarioViewModel';

const EditarUsuarioView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { formData, loading, error, handleChange, handleSubmit } = useEditarUsuarioViewModel(id);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (e) => {
        e.preventDefault(); // Impede o submit padrão do formulário
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    const confirmSubmit = (e) => {
        handleSubmit(e);
        closeModal();
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
            <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 md:px-6">
                <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center text-text-light dark:text-text-dark">
                    <span className="material-symbols-outlined text-3xl">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold flex-1 text-center pr-10 text-text-light dark:text-text-dark">Editar Usuário</h1>
            </header>
            <main className="flex flex-1 flex-col items-center p-4 md:p-6">
                <div className="w-full max-w-lg bg-card-light dark:bg-card-dark shadow-md rounded-xl p-6 md:p-8">
                    <h2 className="text-2xl font-bold leading-tight tracking-tight text-left pb-6 text-text-light dark:text-text-dark">Dados do Usuário</h2>

                    <form className="flex flex-col gap-4" onSubmit={openModal}>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">Nome Completo</p>
                            <input
                                name="definir_nome_completo"
                                value={formData.definir_nome_completo}
                                onChange={handleChange}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-light dark:text-text-dark"
                                placeholder="Digite o nome completo" type="text" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">E-mail</p>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-light dark:text-text-dark"
                                placeholder="exemplo@email.com" type="email" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">Nome de Usuário (Username)</p>
                            <input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-light dark:text-text-dark"
                                placeholder="Nome de usuário" type="text" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">CPF</p>
                            <input
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleChange}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-light dark:text-text-dark"
                                placeholder="000.000.000-00" type="text" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-base font-medium leading-normal pb-2">Nova Senha (opcional)</p>
                            <input
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-background-light dark:bg-input-background-dark h-14 p-4 text-base font-normal leading-normal placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark focus:ring-2 focus:ring-primary/50 text-text-light dark:text-text-dark"
                                placeholder="Deixe em branco para não alterar" type="password" />
                        </label>
                        <div className="flex items-center gap-4">
                            <p className="text-base font-medium leading-normal text-text-light dark:text-text-dark">Status</p>
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="sr-only peer" />
                                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ms-3 text-sm font-medium text-text-light dark:text-text-dark">{formData.is_active ? 'Ativo' : 'Inativo'}</span>
                            </label>
                        </div>
                        {error && <p className="text-red-500">{JSON.stringify(error)}</p>}
                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center rounded-lg bg-action-primary h-14 px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-action-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark">
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg w-full max-w-md transform transition-all">
                        <div className="p-6 text-center">
                            <h3 className="mt-5 text-xl font-bold text-text-light dark:text-text-dark">
                                Confirmar Alterações
                            </h3>
                            <p className="mt-2 text-base text-text-subtle-light dark:text-text-subtle-dark">
                                Tem certeza de que deseja salvar as alterações neste usuário?
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
                                onClick={confirmSubmit}
                                type="button"
                                className="w-full inline-flex justify-center rounded-lg bg-action-primary px-4 py-2.5 text-base font-medium text-white shadow-sm hover:bg-action-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditarUsuarioView;
