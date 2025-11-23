import React from 'react';
import { Link } from 'react-router-dom';

const SaleCard = ({ venda, onDelete, onEdit, formatPrice }) => {
    const handleActionClick = (e, action) => {
        e.stopPropagation(); // Impede a navegação do Link pai
        e.preventDefault(); // Impede o comportamento padrão do link
        action(venda);
    };

    return (
        <Link to={`/vendas/${venda.id}`} className="relative block bg-white dark:bg-card-dark shadow-md rounded-xl p-4 space-y-2 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Venda #{venda.id}</h3>
            </div>
            <div className="mb-2"> {/* Nova div para a data */}
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
                        <p className="font-medium text-gray-800 dark:text-gray-200">{venda.aluno.nome_completo || venda.aluno.nome}</p>
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
            </div>
        </Link>
    );
};

export default SaleCard;
