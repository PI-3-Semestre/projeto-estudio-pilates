import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCard = ({ pagamento, onDelete, onEdit, formatPrice, formatDate }) => {
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
        <div className="bg-white dark:bg-card-dark shadow-md rounded-xl p-4 space-y-2 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pagamento #{pagamento.id}</h3>
                <span className={`text-sm font-semibold ${statusClass}`}>{pagamento.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-y-1 text-sm">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Valor:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatPrice(pagamento.valor_total)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Método:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{pagamento.metodo_pagamento || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Vencimento:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(pagamento.data_vencimento)}</p>
                </div>
                {pagamento.data_pagamento && (
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Pagamento:</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(pagamento.data_pagamento)}</p>
                    </div>
                )}
            </div>

            {/* Detalhes da Matrícula ou Venda */}
            {(isMatricula || isVenda) && (
                <div className="border-t pt-2 mt-2 border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                        {isMatricula ? 'Associado à Matrícula' : 'Associado à Venda'}
                    </p>
                    {isMatricula && (
                        <>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{pagamento.matricula.aluno.nome_completo}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{pagamento.matricula.plano.nome}</p>
                        </>
                    )}
                    {isVenda && (
                        <>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{pagamento.venda.aluno?.nome_completo || 'Venda Avulsa'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Venda #{pagamento.venda.id}</p>
                        </>
                    )}
                </div>
            )}

            {pagamento.comprovante_pagamento && (
                <div className="border-t pt-2 mt-2 border-gray-200 dark:border-gray-700">
                    <a
                        href={pagamento.comprovante_pagamento}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                    >
                        Ver Comprovante
                    </a>
                </div>
            )}

            <div className="flex justify-end space-x-2 border-t pt-2 mt-2 border-gray-200 dark:border-gray-700">
                <Link
                    to={`/financeiro/pagamentos/${pagamento.id}`}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Detalhes
                </Link>
                <button
                    onClick={() => onEdit(pagamento)}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                >
                    Editar
                </button>
                <button
                    onClick={() => onDelete(pagamento)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                    Excluir
                </button>
            </div>
        </div>
    );
};

export default PaymentCard;
