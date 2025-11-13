import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const DashboardAdminMasterView = () => {
    return (
        <div className="relative flex min-h-screen w-full flex-col font-display group/design-root overflow-x-hidden bg-background-page dark:bg-background-dark">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Quick Actions Card */}
                    <div className="md:col-span-2 lg:col-span-1 bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 flex flex-col">
                        <h2 className="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">Atalhos de Gerenciamento</h2>
                        <div className="flex flex-1 flex-col items-stretch gap-3">
                            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-action-primary text-text-light text-base font-bold leading-normal tracking-[0.015em] w-full">
                                <span className="truncate">Gerenciar Agenda</span>
                            </button>
                            <Link to="/alunos" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-action-primary text-text-light text-base font-bold leading-normal tracking-[0.015em] w-full">
                                <span className="truncate">Gerenciar Alunos</span>
                            </Link>
                            <Link to="/colaboradores" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-action-primary text-text-light text-base font-bold leading-normal tracking-[0.015em] w-full">
                                <span className="truncate">Gerenciar Colaboradores</span>
                            </Link>
                            <Link to="/studios" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-action-secondary text-text-light dark:text-text-dark text-base font-bold leading-normal tracking-[0.015em] w-full">
                                <span className="truncate">Gerenciar Studios</span>
                            </Link>
                            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-action-secondary text-text-light dark:text-text-dark text-base font-bold leading-normal tracking-[0.015em] w-full">
                                <span className="truncate">Gerenciar Modalidades</span>
                            </button>
                        </div>
                    </div>
                    {/* Recent Activity Card */}
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 flex flex-col">
                        <h2 className="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">Atividade Recente do Sistema</h2>
                        <div className="flex flex-col gap-2 -mx-2">
                            <div className="flex items-center gap-4 bg-card-light dark:bg-card-dark px-2 min-h-[72px] py-2 justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-text-light dark:text-text-dark flex items-center justify-center rounded-lg bg-action-secondary shrink-0 size-12">
                                        <span className="material-symbols-outlined">person_add</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal line-clamp-1">Novo aluno registrado</p>
                                        <p className="text-text-light/70 dark:text-text-dark/70 text-sm font-normal leading-normal line-clamp-2">João Silva foi adicionado.</p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <p className="text-text-light/70 dark:text-text-dark/70 text-sm font-normal leading-normal">2 min</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-card-light dark:bg-card-dark px-2 min-h-[72px] py-2 justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-text-light dark:text-text-dark flex items-center justify-center rounded-lg bg-action-secondary shrink-0 size-12">
                                        <span className="material-symbols-outlined">edit_note</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal line-clamp-1">Perfil atualizado</p>
                                        <p className="text-text-light/70 dark:text-text-dark/70 text-sm font-normal leading-normal line-clamp-2">Ana Souza atualizou seu perfil.</p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <p className="text-text-light/70 dark:text-text-dark/70 text-sm font-normal leading-normal">15 min</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-card-light dark:bg-card-dark px-2 min-h-[72px] py-2 justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-text-light dark:text-text-dark flex items-center justify-center rounded-lg bg-action-secondary shrink-0 size-12">
                                        <span className="material-symbols-outlined">event_busy</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal line-clamp-1">Aula cancelada</p>
                                        <p className="text-text-light/70 dark:text-text-dark/70 text-sm font-normal leading-normal line-clamp-2">Aula de Yoga às 18h foi cancelada.</p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <p className="text-text-light/70 dark:text-text-dark/70 text-sm font-normal leading-normal">1 hora</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-card-light dark:bg-card-dark px-2 min-h-[72px] py-2 justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-text-light dark:text-text-dark flex items-center justify-center rounded-lg bg-action-secondary shrink-0 size-12">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal line-clamp-1">
                                            Pagamento recebido</p>
                                        <p className="text-text-light/70 dark:text-text-dark/70 text-sm font-normal leading-normal line-clamp-2">
                                            Mensalidade de Maria Costa.</p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <p className="text-text-light/70 dark:text-text-dark/70 text-sm font-normal leading-normal">3 horas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Global Metrics Card (Placeholder) */}
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 flex flex-col">
                        <h2 className="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">Métricas Globais</h2>
                        <div className="flex flex-col items-center justify-center flex-grow text-center bg-action-secondary/50 rounded-lg p-4">
                            <span className="material-symbols-outlined text-text-light/60 dark:text-text-dark/60 text-5xl mb-4">query_stats</span>
                            <p className="text-text-light/80 dark:text-text-dark/80 text-base font-medium">Indicadores de desempenho chave serão exibidos aqui em breve.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardAdminMasterView;