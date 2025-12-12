import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useGestaoAvaliacoesViewModel from '../viewmodels/useGestaoAvaliacoesViewModel';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import AvaliacaoCard from '../components/AvaliacaoCard';
import FilterBottomSheet from '../components/FilterBottomSheet';

const GestaoAvaliacoesView = () => {
    const navigate = useNavigate();
    const {
        avaliacoes,
        studios, // Lista de estúdios vinda do ViewModel
        loading,
        error,
        handleDelete,
        searchText,
        setSearchText,
        dateFilter,
        setDateFilter,
        studioFilter, // Estado do filtro de estúdio
        setStudioFilter, // Função para atualizar o filtro
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        isFilterSheetOpen,
        openFilterSheet,
        closeFilterSheet,
        clearFilters,
    } = useGestaoAvaliacoesViewModel();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [avaliacaoToDelete, setAvaliacaoToDelete] = useState(null);

    const openDeleteModal = (avaliacao) => {
        setAvaliacaoToDelete(avaliacao);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (avaliacaoToDelete) {
            try {
                await handleDelete(avaliacaoToDelete.id);
            } catch (err) {
                alert("Falha ao excluir a avaliação. Tente novamente.");
            }
        }
        setIsModalOpen(false);
        setAvaliacaoToDelete(null);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Gestão de Avaliações" showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-4 mb-4 justify-between items-center">
                        <button
                            onClick={() => navigate('/avaliacoes/nova')}
                            className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-action-primary text-white gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
                        >
                            <div className="text-white">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <span className="truncate">Criar Nova Avaliação</span>
                        </button>

                        <button
                            onClick={openFilterSheet}
                            className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-input-background-light dark:bg-input-background-dark text-text-light dark:text-text-dark gap-2 text-base font-bold leading-normal tracking-[0.015em]"
                        >
                            <span className="material-symbols-outlined">filter_list</span>
                            <span className="truncate">Filtros e Ordenação</span>
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="flex flex-col min-w-40 h-12 w-full">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                                <div className="text-text-subtle-light dark:text-text-subtle-dark flex border-none bg-input-background-light dark:bg-input-background-dark items-center justify-center pl-4 rounded-l-xl border-r-0">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-none bg-input-background-light dark:bg-input-background-dark focus:border-none h-full placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                    placeholder="Buscar por nome de aluno ou instrutor..."
                                />
                            </div>
                        </label>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Todas as Avaliações</h2>
                        {loading && <p>Carregando dados...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        
                        {!loading && !error && (
                            avaliacoes.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {avaliacoes.map((avaliacao) => (
                                        <AvaliacaoCard
                                            key={avaliacao.id}
                                            avaliacao={avaliacao}
                                            onDelete={openDeleteModal}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhuma avaliação encontrada.</p>
                            )
                        )}
                    </div>
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message={`Você tem certeza que deseja excluir a avaliação de ${avaliacaoToDelete?.aluno_nome}? Esta ação não pode ser desfeita.`}
            />

            <FilterBottomSheet
                isOpen={isFilterSheetOpen}
                onClose={closeFilterSheet}
                onClearFilters={clearFilters}
            >
                <div className="flex flex-col gap-4 p-4">
                    <h3 className="text-lg font-bold">Filtros e Ordenação</h3>
                    
                    {/* **NOVO FILTRO DE ESTÚDIO** */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Filtrar por Estúdio</span>
                        <select
                            value={studioFilter}
                            onChange={(e) => setStudioFilter(e.target.value)}
                            className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                        >
                            <option value="">Todos os Estúdios</option>
                            {studios.map(studio => (
                                <option key={studio.id} value={studio.id}>
                                    {studio.nome}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Filtrar por Data</span>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                        />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Ordenar por</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                        >
                            <option value="data_avaliacao">Data da Avaliação</option>
                            <option value="aluno_nome">Nome do Aluno</option>
                            <option value="instrutor_nome">Nome do Instrutor</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Ordem</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                        >
                            <option value="desc">Decrescente</option>
                            <option value="asc">Crescente</option>
                        </select>
                    </label>
                </div>
            </FilterBottomSheet>
        </div>
    );
};

export default GestaoAvaliacoesView;
