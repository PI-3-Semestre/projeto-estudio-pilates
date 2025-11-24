import React from 'react';

const ProductCard = ({ product, onEdit, onDelete, onManageStock }) => {
    const formatPrice = (price) => {
        if (price === null || price === undefined) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    return (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50 flex flex-col justify-between h-full relative">
            {/* Botão de Excluir (Lixeira) no canto superior direito */}
            <button
                onClick={() => onDelete(product)}
                className="absolute top-2 right-2 p-1 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                aria-label="Excluir Produto"
            >
                <span className="material-symbols-outlined text-xl">delete</span>
            </button>

            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{product.nome}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{product.descricao}</p>
                <p className="text-xl font-semibold text-primary dark:text-primary-light mb-4">{formatPrice(product.preco)}</p>
            </div>
            
            {/* Botões de Editar e Gerenciar Estoque na parte inferior */}
            <div className="flex justify-end gap-2 mt-auto">
                <button
                    onClick={() => onEdit(product)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                    aria-label="Editar Produto"
                >
                    <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button
                    onClick={() => onManageStock(product)}
                    className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/20"
                    aria-label="Gerenciar Estoque"
                >
                    <span className="material-symbols-outlined text-base">inventory_2</span>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
