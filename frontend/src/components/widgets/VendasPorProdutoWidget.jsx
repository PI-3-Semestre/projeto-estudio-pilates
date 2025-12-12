import React from 'react';

const VendasPorProdutoWidget = ({ data, isLoading }) => {
    const formatPrice = (price) => {
        if (!price) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-card-dark h-80 animate-pulse">
                <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-600 rounded-md mb-4"></div>
                <div className="space-y-3 mt-4">
                    <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                    <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                    <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                    <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-card-dark h-80">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Top Produtos por Receita</h3>
            <div className="overflow-auto h-64">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Produto</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Qtd.</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Valor Gerado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-card-dark dark:divide-gray-700">
                        {data?.produtos?.map((produto) => (
                            <tr key={produto.produto_id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{produto.produto_nome}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{produto.quantidade_vendida}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatPrice(produto.valor_total_gerado)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendasPorProdutoWidget;
