import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HamburgerMenu = ({ toggleMenu }) => {
    const { logout, user, userType } = useAuth();

    const handleLogout = () => {
        logout();
        // O redirecionamento será tratado pelo AppRoutes
    };

    // Menu para Alunos
    const StudentMenu = (
        <div className="p-6 flex h-full w-full flex-col">
            <div className="flex items-center justify-between pb-8">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-action-primary">
                        <span className="material-symbols-outlined text-white">account_circle</span>
                    </div>
                    <h1 className="text-xl font-bold text-text-light dark:text-text-dark">{user?.nome || 'Aluno'}</h1>
                </div>
                <button onClick={toggleMenu} className="text-text-light dark:text-text-dark">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="flex flex-1 flex-col justify-between">
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/aluno/dashboard" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">home</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Início</p>
                        </Link>
                    </li>
                    <li>
                        <Link to="/aluno/meus-agendamentos" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">calendar_month</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Meus Agendamentos</p>
                        </Link>
                    </li>
                    <li>
                        <Link to="/aluno/marcar-aula" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">add_circle</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Marcar Aula</p>
                        </Link>
                    </li>
                    <li>
                        <Link to="/configuracoes" className="flex h-12 w-full items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">settings</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Configurações</p>
                        </Link>
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

    // Menu para Administradores
    const AdminMenu = (
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
                    <>
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
                            <Link to="/studios" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                                <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">storefront</span>
                                <p className="text-base font-semibold text-text-light dark:text-text-dark">Studios</p>
                            </Link>
                        </li>
                        <li>
                            <a className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary" href="#">
                                <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">assessment</span>
                                <p className="text-base font-semibold text-text-light dark:text-text-dark">Avaliações</p>
                            </a>
                        </li>
                        <li>
                            <Link to="/financeiro" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                                <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">payments</span>
                                <p className="text-base font-semibold text-text-light dark:text-text-dark">Financeiro</p>
                            </Link>
                        </li>
                        <li>
                            <Link to="/relatorios" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                                <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">bar_chart</span>
                                <p className="text-base font-semibold text-text-light dark:text-text-dark">Relatórios</p>
                            </Link>
                        </li>
                    </>
                    <li>
                        <Link to="/configuracoes" className="flex h-12 w-full items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light dark:text-text-subtle-dark">settings</span>
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">Configurações</p>
                        </Link>
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

    return (
        <aside className={'fixed inset-y-0 left-0 z-40 w-72 transform border-r border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-transform duration-300 lg:fixed lg:w-80 lg:translate-x-0'}>
            {userType === 'aluno' ? StudentMenu : AdminMenu}
        </aside>
    );
};

export default HamburgerMenu;
