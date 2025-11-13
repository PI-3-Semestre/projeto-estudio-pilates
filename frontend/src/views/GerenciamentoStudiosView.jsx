import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useGerenciamentoStudiosViewModel from '../viewmodels/useGerenciamentoStudiosViewModel';
import Header from '../components/Header';
import Icon from '../components/Icon';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const GerenciamentoStudiosView = () => {
    const { studios, loading, removerStudio } = useGerenciamentoStudiosViewModel();
    const [searchTerm, setSearchTerm] = useState('');
    const [studioToDelete, setStudioToDelete] = useState(null);

    const filteredStudios = studios.filter(studio =>
        studio.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleConfirmDelete = async () => {
        if (studioToDelete) {
            await removerStudio(studioToDelete.id);
            setStudioToDelete(null);
        }
    };

    return (
        <>
            <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden p-4 sm:p-6 lg:p-8">
                <Header title="Gerenciamento de Unidades" showBackButton />

                <main className="w-full max-w-7xl mx-auto bg-white dark:bg-[#1a2c2a] rounded-xl shadow-md p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                        <div className="w-full sm:max-w-xs">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Icon name="search" className="text-[#4c9a92] dark:text-primary" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar por nome..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input w-full rounded-lg text-[#0d1b1a] dark:text-background-light bg-[#e7f3f2] dark:bg-background-dark h-12 pl-10 pr-4 border-none focus:ring-primary"
                                />
                            </div>
                        </div>
                        <Link to="/studios/cadastrar" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white dark:text-[#0d1b1a] gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                            <Icon name="add" />
                            <span className="truncate">Adicionar Novo Studio</span>
                        </Link>
                    </div>

                    {loading && <p className="text-center text-gray-500">Carregando...</p>}
                    
                    {!loading && (
                        <div>
                            {/* Tabela para Desktop */}
                            <div className="hidden md:block">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th className="p-4 text-sm font-semibold text-[#4c9a92] dark:text-primary/80 uppercase">Nome do Studio</th>
                                                <th className="p-4 text-sm font-semibold text-[#4c9a92] dark:text-primary/80 uppercase">Endereço</th>
                                                <th className="p-4 text-sm font-semibold text-[#4c9a92] dark:text-primary/80 uppercase text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudios.map(studio => (
                                                <tr key={studio.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5">
                                                    <td className="p-4 align-middle text-[#0d1b1a] dark:text-background-light">{studio.nome}</td>
                                                    <td className="p-4 align-middle text-[#4c9a92] dark:text-primary/90">{studio.endereco}</td>
                                                    <td className="p-4 align-middle text-right">
                                                        <Link to={`/studios/${studio.id}`} className="text-[#0d1b1a] dark:text-background-light p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 inline-block">
                                                            <Icon name="visibility" />
                                                        </Link>
                                                        <button onClick={() => setStudioToDelete(studio)} className="text-red-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 ml-2">
                                                            <Icon name="delete" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Cards para Mobile */}
                            <div className="md:hidden space-y-3">
                                {filteredStudios.map(studio => (
                                    <div key={studio.id} className="bg-background-light dark:bg-background-dark p-4 rounded-lg shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/30 shrink-0 size-12">
                                                    <Icon name="home_work" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[#0d1b1a] dark:text-background-light font-medium truncate">{studio.nome}</p>
                                                    <p className="text-[#4c9a92] dark:text-primary/90 text-sm truncate">{studio.endereco}</p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0">
                                                <Link to={`/studios/${studio.id}`} className="text-[#0d1b1a] dark:text-background-light p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10">
                                                    <Icon name="visibility" />
                                                </Link>
                                                <button onClick={() => setStudioToDelete(studio)} className="text-red-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 ml-1">
                                                    <Icon name="delete" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <ConfirmDeleteModal 
                isOpen={studioToDelete !== null}
                onClose={() => setStudioToDelete(null)}
                onConfirm={handleConfirmDelete}
                itemName={studioToDelete?.nome}
                itemType="Studio"
            />
        </>
    );
};

export default GerenciamentoStudiosView;
