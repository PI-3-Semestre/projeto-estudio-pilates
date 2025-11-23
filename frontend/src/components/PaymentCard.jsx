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

    const handleActionClick = (e, action) => {
        e.stopPropagation(); // Impede a navegação do Link pai
        e.preventDefault(); // Impede o comportamento padrão do link
        action(pagamento);
    };

    return (
        <Link to={`/financeiro/pagamentos/${pagamento.id}`} className="relative block bg-white dark:bg-card-dark shadow-md rounded-xl p-4 space-y-2 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            {/* Ícones de Ação */}
            <div className="absolute top-2 right-2 flex space-x-1 bg-white/50 dark:bg-black/50 backdrop-blur-sm p-1 rounded-full">
                {onEdit && (
                    <button
                        onClick={(e) => handleActionClick(e, onEdit)}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded-full"
                        title="Editar"
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => handleActionClick(e, onDelete)}
                        className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded-full"
                        title="Excluir"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                )}
            </div>

            <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pagamento #{pagamento.id}</h3>
                {/* Status realocado para uma nova linha */}
            </div>
            <div className="mb-2"> {/* Nova div para o status */}
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
                            <p className="font-medium text-gray-800 dark:text-gray-200">{pagamento.matricula.aluno?.nome_completo || pagamento.matricula.aluno?.nome}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{pagamento.matricula.plano?.nome}</p>
                        </>
                    )}
                    {isVenda && (
                        <>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{pagamento.venda.aluno?.nome_completo || pagamento.venda.aluno?.nome || 'Venda Avulsa'}</p>
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
                        onClick={(e) => e.stopPropagation()} // Impede a navegação do Link pai
                    >
                        Ver Comprovante
                    </a>
                </div>
            )}
        </Link>
    );
};

export default PaymentCard;
