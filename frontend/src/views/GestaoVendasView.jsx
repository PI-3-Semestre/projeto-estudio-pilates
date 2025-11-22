import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useGestaoVendasViewModel from '../viewmodels/useGestaoVendasViewModel';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SaleCard from '../components/SaleCard'; // Importa o novo componente

const GestaoVendasView = () => {
    const navigate = useNavigate();
    const {
        vendas,
        loading,
        handleDeleteVenda,
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
                    {/* Ações */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => navigate('/vendas/nova')}
                            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark"
                        >
                            Registrar Nova Venda
                        </button>
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
