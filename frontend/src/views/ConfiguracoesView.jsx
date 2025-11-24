import React from 'react';
import { Link } from 'react-router-dom';

const ConfiguracoesView = () => {
    return (
        <div className="flex h-full w-full flex-col">
            <header
                className="sticky top-0 z-10 flex h-16 items-center border-b border-border-light dark:border-border-dark bg-[#f8fcfb] dark:bg-background-dark px-4">
                <Link to="/dashboard" aria-label="Back" className="flex size-10 shrink-0 items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </Link>
                <h1 className="flex-1 text-center text-lg font-bold pr-10 text-[#0d1b1a]">Configurações</h1>
            </header>
            <main className="flex-1 p-4">
                <div className="flex flex-col rounded-lg bg-white shadow-md overflow-hidden">
                    <Link to="/horarios" className="flex items-center gap-4 p-4 min-h-[56px] justify-between active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">schedule</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Horários de Funcionamento</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </Link>
                    <Link to="/bloqueios" className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">event_busy</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Bloqueios da Agenda (Feriados)
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </Link>
                    <Link to="/modalidades" className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">category</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Modalidades de Aula</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </Link>
                    <Link to="/planos" className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">workspace_premium</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Planos de Assinatura</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </Link>
                    <Link to="/gestao-usuarios" className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">group</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Gestão de Usuários</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </Link>
                    <Link to="/notificacoes" className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">notifications</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Notificações</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default ConfiguracoesView;
