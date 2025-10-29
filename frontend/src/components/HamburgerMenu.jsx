import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HamburgerMenu = ({ toggleMenu }) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        // The redirection will be handled by the AppRoutes component
    };

    return (
        <aside className={'fixed inset-y-0 left-0 z-40 w-72 transform border-r border-gray-200 bg-card-light p-6 transition-transform duration-300 lg:relative lg:w-80 lg:translate-x-0'}>
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between pb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-action-primary">
                            <span className="material-symbols-outlined text-white">shield_person</span>
                        </div>
                        <h1 className="text-xl font-bold text-text-dark">Admin Master</h1>
                    </div>
                    <button onClick={toggleMenu} className="text-text-dark">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="flex flex-1 flex-col justify-between">
                    <ul className="flex flex-col gap-2">
                        <li>
                            <Link to="/dashboard" className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                                <span className="material-symbols-outlined text-text-subtle-light">home</span>
                                <p className="text-base font-semibold text-text-dark">Início</p>
                            </Link>
                        </li>
                        <li>
                            <a className="flex h-12 items-center gap-4 rounded-lg bg-action-secondary px-4 font-semibold text-action-primary transition-colors" href="#">
                                <span className="material-symbols-outlined text-action-primary">school</span>
                                <p className="text-base">Alunos</p>
                            </a>
                        </li>
                        <li>
                            <a className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary" href="#">
                                <span className="material-symbols-outlined text-text-subtle-light">groups</span>
                                <p className="text-base font-semibold text-text-dark">Colaboradores</p>
                            </a>
                        </li>
                        <li>
                            <a className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary" href="#">
                                <span className="material-symbols-outlined text-text-subtle-light">storefront</span>
                                <p className="text-base font-semibold text-text-dark">Studios</p>
                            </a>
                        </li>
                        <li>
                            <a className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary" href="#">
                                <span className="material-symbols-outlined text-text-subtle-light">assessment</span>
                                <p className="text-base font-semibold text-text-dark">Avaliações</p>
                            </a>
                        </li>
                        <li>
                            <a className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary" href="#">
                                <span className="material-symbols-outlined text-text-subtle-light">payments</span>
                                <p className="text-base font-semibold text-text-dark">Financeiro</p>
                            </a>
                        </li>
                        <li>
                            <a className="flex h-12 items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary" href="#">
                                <span className="material-symbols-outlined text-text-subtle-light">settings</span>
                                <p className="text-base font-semibold text-text-dark">Configurações</p>
                            </a>
                        </li>
                    </ul>
                    <div className="border-t border-gray-200 pt-4">
                        <button onClick={handleLogout} className="group flex h-12 w-full items-center gap-4 rounded-lg px-4 transition-colors hover:bg-action-secondary hover:text-action-primary">
                            <span className="material-symbols-outlined text-text-subtle-light group-hover:text-action-primary">logout</span>
                            <p className="text-base font-semibold text-text-dark group-hover:text-action-primary">Logout</p>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default HamburgerMenu;
