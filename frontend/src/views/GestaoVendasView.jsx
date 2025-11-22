import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useGestaoVendasViewModel from '../viewmodels/useGestaoVendasViewModel';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SaleCard from '../components/SaleCard';

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

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Gestão de Vendas" showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-7xl">
                    {/* Controles de Ações, Filtro e Ordenação */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <button
                            onClick={() => navigate('/vendas/nova')}
                            className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-action-primary text-white gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
                        >
                            <div className="text-white">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <span className="truncate">Registrar Nova Venda</span>
                        </button>

                        <div className="flex flex-col sm:flex-row gap-3 flex-wrap flex-grow">
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
                                        onDelete={() => openDeleteModal(venda)}
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
        </div>
    );
};

export default GestaoVendasView;
