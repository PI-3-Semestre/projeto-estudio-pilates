import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HamburgerMenu = ({ toggleMenu }) => {
    const { logout } = useAuth();
    const [menuView, setMenuView] = useState('main'); // 'main' or 'settings'

    const handleLogout = () => {
        logout();
        // The redirection will be handled by the AppRoutes component
    };

    const MainMenu = (
        <div className="p-6 flex h-full w-full flex-col">
            <div className="flex items-center justify-between pb-8">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-action-primary">
                        <span className="material-symbols-outlined text-white">shield_person</span>
                    </div>
                    <h1 className="text-xl font-bold text-text-light dark:text-text-dark">Admin Master</h1>
                </div>
                <button onClick={toggleMenu} className="text-text-light dark:text-text-dark">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="flex flex-1 flex-col justify-between">
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/dashboard" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">home</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Início</p>
                        </Link>
                    </li>
                    <li>
                        <Link to="/agenda" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">calendar_month</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Agenda</p>
                        </Link>
                    </li>
                    <li>
                        <Link to="/alunos" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">school</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Alunos</p>
                        </Link>
                    </li>
                    <li>
                        <Link to="/colaboradores" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">groups</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Colaboradores</p>
                        </Link>
                    </li>
                    <li>
                        <Link to="/usuarios" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">manage_accounts</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Usuarios</p>
                        </Link>
                    </li>
                    <li>
                        <a className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary" href="#">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">storefront</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Studios</p>
                        </a>
                    </li>
                    <li>
                        <a className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary" href="#">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">assessment</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Avaliações</p>
                        </a>
                    </li>
                    <li>
                        <a className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary" href="#">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">payments</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Financeiro</p>
                        </a>
                    </li>
                    <li>
                        <button onClick={() => setMenuView('settings')} className="flex h-12 w-full items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">settings</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Configurações</p>
                        </button>
                    </li>
                </ul>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button onClick={handleLogout} className="group flex h-12 w-full items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                        <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark group-hover:text-action-primary">logout</span>
                        <p className="text-base font-semibold text-text-light dark:text-text-dark group-hover:text-action-primary">Logout</p>
                    </button>
                </div>
            </div>
        </div>
    );

    const SettingsMenu = (
        <div className="flex h-full w-full flex-col">
            <header
                className="sticky top-0 z-10 flex h-16 items-center border-b border-border-light dark:border-border-dark bg-[#f8fcfb] dark:bg-background-dark px-4">
                <button onClick={() => setMenuView('main')} aria-label="Back" className="flex size-10 shrink-0 items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h1 className="flex-1 text-center text-lg font-bold pr-10 text-[#0d1b1a]">Configurações</h1>
            </header>
            <main className="flex-1 p-4">
                <div className="flex flex-col rounded-lg bg-white shadow-md overflow-hidden">
                    <a className="flex items-center gap-4 p-4 min-h-[56px] justify-between active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150"
                        href="#">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">schedule</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Horários de Funcionamento</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </a>
                    <a className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150"
                        href="#">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">event_busy</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Bloqueios da Agenda (Feriados)
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </a>
                    <Link to="/modalidades" className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">category</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Modalidades de Aula</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </Link>
                    <a className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150"
                        href="#">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">workspace_premium</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Planos de Assinatura</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </a>
                    <a className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150"
                        href="#">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">group</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Gestão de Usuários</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </a>
                    <a className="flex items-center gap-4 p-4 min-h-[56px] justify-between border-t border-gray-200 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-150"
                        href="#">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-2xl text-[#0fbdac]">notifications</span>
                            <p className="flex-1 truncate text-base font-normal text-[#0d1b1a]">Notificações</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-[#4c9a92]">chevron_right</span>
                    </a>
                </div>
            </main>
        </div>
    );

    return (
        <aside className={'fixed inset-y-0 left-0 z-40 w-72 transform border-r border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-transform duration-300 lg:fixed lg:w-80 lg:translate-x-0'}>
            {menuView === 'main' ? MainMenu : SettingsMenu}
        </aside>
    );
};

export default HamburgerMenu;

