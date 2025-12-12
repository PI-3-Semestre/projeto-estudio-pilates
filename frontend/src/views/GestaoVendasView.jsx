import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useGestaoVendasViewModel from '../viewmodels/useGestaoVendasViewModel';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SaleCard from '../components/SaleCard';
import FilterBottomSheet from '../components/FilterBottomSheet';

const GestaoVendasView = () => {
    const navigate = useNavigate();
    const {
        vendas,
        loading,
        handleDeleteVenda,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        allStudios,
        studioFilter,
        setStudioFilter,
        searchText,        // Importa o estado de busca
        setSearchText,     // Importa o setter da busca
        isFilterSheetOpen,
        openFilterSheet,
        closeFilterSheet,
        clearFilters,
    } = useGestaoVendasViewModel();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vendaToDelete, setVendaToDelete] = useState(null);

    const openDeleteModal = (venda) => {
        setVendaToDelete(venda);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        if (vendaToDelete) {
            handleDeleteVenda(vendaToDelete.id);
        }
        setIsModalOpen(false);
        setVendaToDelete(null);
    };

    const formatPrice = (price) => {
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return "R$ 0,00";
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(numericPrice);
    };

    const handleEdit = (venda) => {
        // Implementar navegação para tela de edição de venda se existir
        console.log("Editar venda:", venda.id);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Gestão de Vendas" showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-7xl">
                    {/* Controles de Ações e Botão de Filtro */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-4 justify-between items-center">
                        <button
                            onClick={() => navigate('/vendas/nova')}
                            className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-action-primary text-white gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
                        >
                            <div className="text-white">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <span className="truncate">Registrar Nova Venda</span>
                        </button>

                        <button
                            onClick={openFilterSheet}
                            className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-input-background-light dark:bg-input-background-dark text-text-light dark:text-text-dark gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
                        >
                            <span className="material-symbols-outlined">filter_list</span>
                            <span className="truncate">Filtros</span>
                        </button>
                    </div>

                    {/* Campo de Busca (realocado aqui) */}
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
                                    placeholder="Buscar por nome ou CPF do comprador..."
                                />
                            </div>
                        </label>
                    </div>

                    {/* Lista de Vendas em formato de Card */}
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Todas as Vendas</h2>
                        {loading ? (
                            <p>Carregando vendas...</p>
                        ) : vendas.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vendas.map((venda) => (
                                    <SaleCard
                                        key={venda.id}
                                        venda={venda}
                                        onDelete={openDeleteModal}
                                        onEdit={handleEdit}
                                        formatPrice={formatPrice}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">Nenhuma venda encontrada.</p>
                        )}
                    </div>
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Você tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita e o estoque dos produtos não será revertido automaticamente."
            />

            {/* Bottom Sheet de Filtros */}
            <FilterBottomSheet
                isOpen={isFilterSheetOpen}
                onClose={closeFilterSheet}
                onClearFilters={clearFilters}
            >
                <div className="flex flex-col gap-3">
                    {/* Filtro por Estúdio */}
                    <select
                        value={studioFilter}
                        onChange={(e) => setStudioFilter(e.target.value)}
                        className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                    >
                        <option value="all">Estúdio: Todos</option>
                        {allStudios.map((studio) => (
                            <option key={studio.id} value={studio.id}>
                                Estúdio: {studio.nome}
                            </option>
                        ))}
                    </select>

                    {/* Ordenação */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                    >
                        <option value="data_venda">Ordenar por Data</option>
                        <option value="valor_total">Ordenar por Valor</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                    >
                        <option value="asc">Crescente</option>
                        <option value="desc">Decrescente</option>
                    </select>
                </div>
            </FilterBottomSheet>
        </div>
    );
};

export default GestaoVendasView;
