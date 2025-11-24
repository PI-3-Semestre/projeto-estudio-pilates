import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useDetalhesPagamentoViewModel from '../viewmodels/useDetalhesPagamentoViewModel';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'; // Para a exclusão

const DetalhesPagamentoView = () => {
    const navigate = useNavigate();
    const { pagamento, loading, error, formatPrice, formatDate, refreshPagamento } = useDetalhesPagamentoViewModel();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openDeleteModal = () => setIsModalOpen(true);
    const closeDeleteModal = () => setIsModalOpen(false);

    // Função de exclusão (a ser implementada no ViewModel ou aqui se for simples)
    const handleDelete = async () => {
        // Lógica de exclusão aqui
        // Por enquanto, apenas um placeholder
        console.log("Deletar pagamento", pagamento.id);
        closeDeleteModal();
        // Após deletar, navegar para a lista de pagamentos
        // navigate('/financeiro/pagamentos');
    };

    if (loading) {
        return <div>Carregando detalhes do pagamento...</div>;
    }

    if (error || !pagamento) {
        return <div>Erro ao carregar o pagamento. Tente novamente.</div>;
    }

    // Determina o tipo de associação (Matrícula ou Venda)
    const isMatricula = !!pagamento.matricula;
    const isVenda = !!pagamento.venda;

    // Determina o status do pagamento para estilização
    let statusClass = 'text-gray-500 dark:text-gray-400';
    switch (pagamento.status) {
        case 'PAGO':
            statusClass = 'text-green-600 dark:text-green-400';
            break;
        case 'PENDENTE':
            statusClass = 'text-yellow-600 dark:text-yellow-400';
            break;
        case 'ATRASADO':
            statusClass = 'text-red-600 dark:text-red-400';
            break;
        case 'CANCELADO':
            statusClass = 'text-gray-600 dark:text-gray-300';
            break;
        default:
            break;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title={`Detalhes do Pagamento #${pagamento.id}`} showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-background-dark/50 space-y-6">
                        
                        {/* Informações Principais do Pagamento */}
                        <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Dados do Pagamento</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-400">Status</p>
                                    <p className={`font-bold ${statusClass}`}>{pagamento.status}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-400">Valor Total</p>
                                    <p className="text-gray-900 dark:text-white">{formatPrice(pagamento.valor_total)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-400">Método</p>
                                    <p className="text-gray-900 dark:text-white">{pagamento.metodo_pagamento || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-400">Data de Vencimento</p>
                                    <p className="text-gray-900 dark:text-white">{formatDate(pagamento.data_vencimento)}</p>
                                </div>
                                {pagamento.data_pagamento && (
                                    <div>
                                        <p className="font-semibold text-gray-600 dark:text-gray-400">Data de Pagamento</p>
                                        <p className="text-gray-900 dark:text-white">{formatDate(pagamento.data_pagamento)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detalhes da Matrícula ou Venda Associada */}
                        {(isMatricula || isVenda) && (
                            <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                    {isMatricula ? 'Matrícula Associada' : 'Venda Associada'}
                                </h3>
                                {isMatricula && pagamento.matricula && (
                                    <div className="text-sm space-y-1">
                                        <p className="text-gray-800 dark:text-gray-200">Aluno: {pagamento.matricula.aluno?.nome || 'N/A'}</p>
                                        <p className="text-gray-600 dark:text-gray-400">Plano: {pagamento.matricula.plano?.nome || 'N/A'}</p>
                                        <p className="text-gray-600 dark:text-gray-400">Período: {formatDate(pagamento.matricula.data_inicio)} - {formatDate(pagamento.matricula.data_fim)}</p>
                                        <p className="text-gray-600 dark:text-gray-400">Estúdio: {pagamento.matricula.studio?.nome || 'N/A'}</p>
                                    </div>
                                )}
                                {isVenda && pagamento.venda && (
                                    <div className="text-sm space-y-1">
                                        <p className="text-gray-800 dark:text-gray-200">Aluno: {pagamento.venda.aluno?.nome || 'Venda Avulsa'}</p>
                                        <p className="text-gray-600 dark:text-gray-400">Venda ID: {pagamento.venda.id}</p>
                                        <p className="text-gray-600 dark:text-gray-400">Data da Venda: {formatDate(pagamento.venda.data_venda)}</p>
                                        {/* Produtos da venda podem ser listados aqui se necessário */}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Comprovante de Pagamento */}
                        {pagamento.comprovante_pagamento && (
                            <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Comprovante</h3>
                                <a
                                    href={pagamento.comprovante_pagamento}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm"
                                >
                                    Ver Comprovante Anexado
                                </a>
                            </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="pt-4 flex justify-end space-x-3">
                            <button
                                onClick={openDeleteModal}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
                            >
                                Excluir Pagamento
                            </button>
                            <button
                                onClick={() => navigate(`/financeiro/pagamentos/${pagamento.id}/editar`)}
                                className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600"
                            >
                                Editar Pagamento
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                message="Você tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
            />
        </div>
    );
};

export default DetalhesPagamentoView;
