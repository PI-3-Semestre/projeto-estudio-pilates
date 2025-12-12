import React from 'react';
import Header from '../components/Header';
import useDetalhesVendaViewModel from '../viewmodels/useDetalhesVendaViewModel';
import { Link } from 'react-router-dom';

const DetalhesVendaView = () => {
    const { venda, pagamento, loading, error } = useDetalhesVendaViewModel();

    const formatPrice = (price) => {
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return "R$ 0,00";
        }
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericPrice);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return <div>Carregando detalhes da venda...</div>;
    }

    if (error || !venda) {
        return <div>Erro ao carregar a venda. Tente novamente.</div>;
    }

    // Determina o status do pagamento para exibição
    let statusPagamentoText = 'Não Registrado';
    let statusPagamentoClass = 'text-gray-500 dark:text-gray-400';
    if (pagamento) {
        statusPagamentoText = pagamento.status;
        if (pagamento.status === 'PAGO') {
            statusPagamentoClass = 'text-green-600 dark:text-green-400';
        } else if (pagamento.status === 'PENDENTE') {
            statusPagamentoClass = 'text-yellow-600 dark:text-yellow-400';
        } else {
            statusPagamentoClass = 'text-red-600 dark:text-red-400';
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title={`Detalhes da Venda #${venda.id}`} showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-background-dark/50 space-y-6">
                        
                        {/* Informações Gerais */}
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Informações Gerais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-400">Data da Venda</p>
                                    <p className="text-gray-900 dark:text-white">{formatDate(venda.data_venda)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-400">Estúdio</p>
                                    <p className="text-gray-900 dark:text-white">{venda.studio?.nome || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-400">Comprador</p>
                                    {venda.aluno ? (
                                        <>
                                            <p className="text-gray-900 dark:text-white">{venda.aluno.nome_completo}</p>
                                            <p className="text-gray-600 dark:text-gray-400">{venda.aluno.cpf}</p>
                                        </>
                                    ) : (
                                        <p className="text-gray-900 dark:text-white">Venda Avulsa</p>
                                    )}
                                </div>
                                {/* Informações de Pagamento */}
                                <div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-400">Status do Pagamento</p>
                                    <p className={`font-bold ${statusPagamentoClass}`}>{statusPagamentoText}</p>
                                </div>
                                {pagamento && (
                                    <>
                                        <div>
                                            <p className="font-semibold text-gray-600 dark:text-gray-400">Método de Pagamento</p>
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
                                        {pagamento.comprovante_pagamento && (
                                            <div>
                                                <p className="font-semibold text-gray-600 dark:text-gray-400">Comprovante</p>
                                                <a href={pagamento.comprovante_pagamento} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver Comprovante</a>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Produtos Vendidos */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Produtos Vendidos</h3>
                            <div className="space-y-3">
                                {venda.produtos?.map(item => (
                                    <div key={item.produto_id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.nome}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.quantidade} x {formatPrice(item.preco_unitario)}
                                            </p>
                                        </div>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {formatPrice(item.quantidade * parseFloat(item.preco_unitario))}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total e Ações */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                            <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white">
                                <span>Valor Total:</span>
                                <span>{formatPrice(venda.valor_total)}</span>
                            </div>
                            
                            <div className="flex justify-end">
                                {!pagamento || pagamento.status !== 'PAGO' ? (
                                    <Link 
                                        to={`/financeiro/pagamentos/registrar?vendaId=${venda.id}&valor=${venda.valor_total}`}
                                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                                    >
                                        Registrar Pagamento Manual
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg"
                                    >
                                        Pagamento Registrado
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default DetalhesVendaView;
