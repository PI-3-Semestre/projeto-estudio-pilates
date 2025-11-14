import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useDashboardStudioViewModel from '../viewmodels/useDashboardStudioViewModel';
import Header from '../components/Header';
import Icon from '../components/Icon';

const DashboardStudioView = () => {
    const { studioId } = useParams();
    const { data, loading, error } = useDashboardStudioViewModel(studioId);

    const studioName = data?.studio?.nome || 'Dashboard'; 

    const navItems = [
        { icon: 'calendar_month', label: 'Agenda Geral', path: `/studios/${studioId}/agenda` },
        { icon: 'payments', label: 'Financeiro', path: `/studios/${studioId}/financeiro` },
        { icon: 'groups', label: 'Gestão de Alunos', path: `/studios/${studioId}/alunos` },
        { icon: 'badge', label: 'Colaboradores', path: `/studios/${studioId}/colaboradores` },
        { icon: 'assessment', label: 'Avaliações', path: `/studios/${studioId}/avaliacoes` },
        { icon: 'settings', label: 'Configurações', path: `/studios/${studioId}/configuracoes` },
    ];

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header title="Carregando..." showBackButton />
                <div className="text-center p-8">Carregando dados do estúdio...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header title="Erro" showBackButton />
                <div className="text-center p-8 text-red-500">Erro ao carregar o dashboard: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title={studioName} showBackButton showNotifications />
            
            <div className="bg-blue-600/10 px-4 py-3 dark:bg-blue-500/20">
                <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Você está gerenciando: <span className="font-bold">{studioName}</span></p>
                    <Link className="whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-primary shadow-sm hover:bg-gray-50 dark:bg-zinc-800 dark:text-primary dark:hover:bg-zinc-700/80" to="/studios">
                      Trocar Estúdio
                    </Link>
                </div>
            </div>

            <main className="flex-grow p-4">
                <div className="max-w-7xl mx-auto space-y-4">
                    
                    {/* Resumo e Alertas */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-1 flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resumo Geral</h2>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-base text-gray-600 dark:text-gray-300">Total de Matrículas:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{data?.dashboard?.financeiro?.total_matriculas ?? 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-base text-gray-600 dark:text-gray-300">Total de Vendas:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{data?.dashboard?.financeiro?.total_vendas ?? 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-base text-gray-600 dark:text-gray-300">Total de Avaliações:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{data?.dashboard?.avaliacoes?.total_avaliacoes ?? 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 flex flex-col rounded-xl border border-yellow-500/30 bg-yellow-400/10 p-4 dark:bg-yellow-500/20">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Alertas e Pendências</h2>
                            <div className="mt-3 flex flex-col gap-2">
                                <p className="text-base font-normal text-gray-700 dark:text-gray-200">
                                    <span className="font-bold">{data?.dashboard?.financeiro?.total_pagamentos_pendentes ?? 0}</span> pagamentos pendentes.
                                </p>
                                <p className="text-base font-normal text-gray-700 dark:text-gray-200">
                                    <span className="font-bold">{data?.dashboard?.financeiro?.total_pagamentos_atrasados ?? 0}</span> pagamentos atrasados.
                                </p>
                                <p className="text-base font-normal text-gray-700 dark:text-gray-200">
                                    <span className="font-bold">{data?.dashboard?.agendamentos?.total_agendamentos_pendentes ?? 0}</span> agendamentos com presença a confirmar.
                                </p>
                            </div>
                            <div className="mt-auto pt-3">
                                <a className="text-sm font-medium text-primary underline-offset-4 hover:underline dark:text-primary" href="#">
                                    Ver todas as pendências
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Navegação */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {navItems.map((item) => (
                            <Link key={item.label} to={item.path} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-zinc-800 dark:hover:bg-white/10">
                                <Icon name={item.icon} className="text-2xl text-primary" />
                                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</h3>
                            </Link>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default DashboardStudioView;