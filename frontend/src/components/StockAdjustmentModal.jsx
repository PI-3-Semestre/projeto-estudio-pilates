import React, { useState, useEffect } from 'react';
import studiosService from '../services/studiosService'; // Para buscar a lista de estúdios

const StockAdjustmentModal = ({ isOpen, onClose, product, productStockDetails, loadingStock, onAdjustStock, showToast }) => {
    const [allStudios, setAllStudios] = useState([]);
    const [selectedStudio, setSelectedStudio] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [operation, setOperation] = useState('definir'); // 'definir', 'adicionar', 'remover'
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Fetch studios when modal opens
            studiosService.getAllStudios()
                .then(response => {
                    setAllStudios(response.data);
                    if (response.data.length > 0) {
                        setSelectedStudio(response.data[0].id); // Seleciona o primeiro estúdio por padrão
                    }
                })
                .catch(() => showToast('Erro ao carregar estúdios.', { type: 'error' }));
        }
    }, [isOpen, showToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudio || !product || quantity <= 0) {
            showToast('Por favor, preencha todos os campos corretamente.', { type: 'warning' });
            return;
        }

        setSubmitting(true);
        try {
            await onAdjustStock(product.id, selectedStudio, quantity, operation);
            setQuantity(0); // Reset quantity
            onClose(); // Fecha o modal após o ajuste
        } catch (err) {
            // Erro já tratado no ViewModel, apenas para garantir
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative p-5 border w-full max-w-2xl md:max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    Ajustar Estoque de "{product?.nome}"
                </h3>

                {/* Detalhes do Estoque Atual */}
                <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-2">Estoque Atual por Estúdio:</h4>
                    {loadingStock ? (
                        <p className="text-gray-500 dark:text-gray-400">Carregando estoque...</p>
                    ) : productStockDetails && productStockDetails.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estúdio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Quantidade</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {productStockDetails.map(stock => (
                                        <tr key={stock.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{stock.studio_nome}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stock.quantidade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Nenhum registro de estoque para este produto.</p>
                    )}
                </div>

                {/* Formulário de Ajuste */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="studio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Estúdio</label>
                        <select
                            id="studio"
                            value={selectedStudio}
                            onChange={(e) => setSelectedStudio(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        >
                            {allStudios.map(studio => (
                                <option key={studio.id} value={studio.id}>{studio.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="operation" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Operação</label>
                        <select
                            id="operation"
                            value={operation}
                            onChange={(e) => setOperation(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        >
                            <option value="definir">Definir Quantidade</option>
                            <option value="adicionar">Adicionar</option>
                            <option value="remover">Remover</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Quantidade</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="0"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            disabled={submitting}
                        >
                            {submitting ? 'Ajustando...' : 'Ajustar Estoque'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;
