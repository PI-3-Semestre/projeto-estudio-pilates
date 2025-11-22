import React from 'react';
import { Link } from 'react-router-dom';

const SaleCard = ({ venda, onDelete, formatPrice }) => {
    return (
        <div className="bg-white dark:bg-card-dark shadow-md rounded-xl p-4 space-y-2 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Venda #{venda.id}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(venda.data_venda).toLocaleDateString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-y-1 text-sm">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Estúdio:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{venda.studio?.nome || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Comprador:</p>
                    {venda.aluno ? (
                        <p className="font-medium text-gray-800 dark:text-gray-200">{venda.aluno.nome_completo}</p>
                    ) : (
                        <p className="font-medium text-gray-800 dark:text-gray-200">Venda Avulsa</p>
                    )}
                </div>
                {venda.aluno && (
                    <div className="col-span-2">
                        <p className="text-gray-500 dark:text-gray-400">CPF:</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{venda.aluno.cpf}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-lg font-bold text-gray-900 dark:text-white">Total: {formatPrice(venda.valor_total)}</p>
                <div className="flex space-x-2">
                    <Link
                        to={`/vendas/${venda.id}`}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Detalhes
                    </Link>
                    <button
                        onClick={() => onDelete(venda.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleCard;
