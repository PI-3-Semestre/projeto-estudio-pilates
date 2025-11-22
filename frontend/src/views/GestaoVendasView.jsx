import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useGestaoVendasViewModel from '../viewmodels/useGestaoVendasViewModel';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

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

                    {/* Tabela de Vendas */}
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Todas as Vendas</h2>
                        {loading ? (
                            <p>Carregando vendas...</p>
                        ) : vendas.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Data</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estúdio</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Comprador</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Total</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-card-dark dark:divide-gray-700">
                                        {vendas.map((venda) => (
                                            <tr key={venda.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(venda.data_venda).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{venda.studio?.nome || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {venda.aluno ? (
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">{venda.aluno.nome_completo}</div>
                                                            <div className="text-gray-500 dark:text-gray-400">{venda.aluno.cpf}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 dark:text-gray-300">Venda Avulsa</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatPrice(venda.valor_total)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link to={`/vendas/${venda.id}`} className="text-primary hover:text-primary-dark mr-4">Detalhes</Link>
                                                    <button onClick={() => openDeleteModal(venda)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
