import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import useGerenciarColaboradoresViewModel from '../viewmodels/useGerenciarColaboradoresViewModel';

const GerenciarColaboradoresView = () => {
    const { colaboradores, loading, error } = useGerenciarColaboradoresViewModel();

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-page group/design-root overflow-x-hidden">
            <Header />
            <main className="flex flex-col flex-1 p-4">
                <div className="bg-card-light dark:bg-card-dark shadow-md rounded-xl w-full max-w-7xl mx-auto p-4 sm:p-6">
                    <div className="flex flex-col gap-4 mb-6">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <h1 className="text-xl font-bold">Gerenciar Colaboradores</h1>
                            <Link to="/alunos/cadastrar-usuario" state={{ userType: 'colaborador' }} className="flex items-center justify-center rounded-xl h-12 px-5 bg-action-primary text-text-light gap-2 text-base font-bold">
                                <span className="material-symbols-outlined">add</span>
                                <span className="truncate">Cadastrar Colaborador</span>
                            </Link>
                        </div>
                    </div>
                    
                    {loading && <p>Carregando colaboradores...</p>}
                    {error && <p className="text-red-500">Erro ao carregar colaboradores.</p>}

                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-subtle-light">
                            <thead className="text-xs text-text-dark uppercase bg-action-secondary/60">
                                <tr>
                                    <th className="px-6 py-3 rounded-l-lg">Nome</th>
                                    <th className="px-6 py-3">Perfis</th>
                                    <th className="px-6 py-3">Unidades</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 rounded-r-lg text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {colaboradores.map(colaborador => (
                                    <tr key={colaborador.usuario} className="bg-card-light border-b">
                                        <td className="px-6 py-4 font-medium text-text-dark whitespace-nowrap">
                                            {colaborador.nome_completo}
                                        </td>
                                        <td className="px-6 py-4">
                                            {colaborador.perfis.join(', ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {colaborador.unidades.map(u => u.studio_nome).join(', ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold inline-flex px-2.5 py-0.5 rounded-full ${colaborador.status === 'ATIVO' ? 'bg-action-primary/20 text-text-dark' : 'bg-action-secondary text-text-dark'}`}>
                                                {colaborador.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-text-dark hover:bg-action-secondary rounded-full p-1.5">
                                                <span className="material-symbols-outlined">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile view */}
                    <div className="lg:hidden space-y-4">
                        {colaboradores.map(colaborador => (
                            <div key={colaborador.usuario} className="bg-background-page dark:bg-background-dark rounded-lg p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {/* You might want to add a photo to the collaborator model/serializer */}
                                        <div className="flex flex-col">
                                            <p className="text-text-dark dark:text-text-light text-base font-bold leading-normal">
                                                {colaborador.nome_completo}
                                            </p>
                                            <span className={`inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${colaborador.status === 'ATIVO' ? 'bg-action-primary/20 text-text-dark' : 'bg-action-secondary text-text-dark'} mt-1 w-fit`}>
                                                {colaborador.status}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-text-dark dark:text-text-light">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div>
                                        <p className="text-text-subtle-light dark:text-text-subtle-dark text-xs font-semibold uppercase tracking-wider">
                                            Perfis
                                        </p>
                                        <p className="text-text-dark dark:text-text-light text-sm font-medium">
                                            {colaborador.perfis.join(', ')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-subtle-light dark:text-text-subtle-dark text-xs font-semibold uppercase tracking-wider">
                                            Unidades
                                        </p>
                                        <p className="text-text-dark dark:text-text-light text-sm font-medium">
                                            {colaborador.unidades.map(u => u.studio_nome).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GerenciarColaboradoresView;
