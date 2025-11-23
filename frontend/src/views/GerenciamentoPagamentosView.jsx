import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useGerenciamentoPagamentosViewModel from '../viewmodels/useGerenciamentoPagamentosViewModel';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import PaymentCard from '../components/PaymentCard';
import FilterBottomSheet from '../components/FilterBottomSheet'; // Importa o FilterBottomSheet

const GerenciamentoPagamentosView = () => {
    const navigate = useNavigate();
    const {
        pagamentos,
        loading,
        handleDeletePagamento,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        statusFilter,
        setStatusFilter,
        metodoPagamentoFilter,
        setMetodoPagamentoFilter,
        statusOptions,
        metodoPagamentoOptions,
        isFilterSheetOpen,
        openFilterSheet,
        closeFilterSheet,
        clearFilters,
    } = useGerenciamentoPagamentosViewModel();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pagamentoToDelete, setPagamentoToDelete] = useState(null);

    const openDeleteModal = (pagamento) => {
        setPagamentoToDelete(pagamento);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        if (pagamentoToDelete) {
            handleDeletePagamento(pagamentoToDelete);
        }
        setIsModalOpen(false);
        setPagamentoToDelete(null);
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const handleEdit = (pagamento) => {
        navigate(`/financeiro/pagamentos/${pagamento.id}/editar`);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Gerenciamento de Pagamentos" showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-7xl">
                    {/* Controles de Ações e Botão de Filtro */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-4 justify-between items-center">
                        <button
                            onClick={() => navigate('/financeiro/pagamentos/novo')}
                            className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-action-primary text-white gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
                        >
                            <div className="text-white">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <span className="truncate">Registrar Novo Pagamento</span>
                        </button>

                        <button
                            onClick={openFilterSheet}
                            className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-input-background-light dark:bg-input-background-dark text-text-light dark:text-text-dark gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
                        >
                            <span className="material-symbols-outlined">filter_list</span>
                            <span className="truncate">Filtros</span>
                        </button>
                    </div>

                    {/* Lista de Pagamentos em formato de Card */}
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Todos os Pagamentos</h2>
                        {loading ? (
                            <p>Carregando pagamentos...</p>
                        ) : pagamentos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pagamentos.map((pagamento) => (
                                    <PaymentCard
                                        key={pagamento.id}
                                        pagamento={pagamento}
                                        onDelete={openDeleteModal}
                                        onEdit={handleEdit}
                                        formatPrice={formatPrice}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">Nenhum pagamento encontrado.</p>
                        )}
                    </div>
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Você tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
            />

            {/* Bottom Sheet de Filtros */}
            <FilterBottomSheet
                isOpen={isFilterSheetOpen}
                onClose={closeFilterSheet}
                onClearFilters={clearFilters}
            >
                <div className="flex flex-col gap-3">
                    {/* Filtro por Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Filtro por Método de Pagamento */}
                    <select
                        value={metodoPagamentoFilter}
                        onChange={(e) => setMetodoPagamentoFilter(e.target.value)}
                        className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                    >
                        {metodoPagamentoOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Ordenação */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                    >
                        <option value="data_vencimento">Ordenar por Vencimento</option>
                        <option value="valor_total">Ordenar por Valor</option>
                        <option value="status">Ordenar por Status</option>
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

export default GerenciamentoPagamentosView;
