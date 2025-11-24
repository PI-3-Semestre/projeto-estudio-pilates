import React from 'react';

const SaleConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    carrinho,
    selectedAluno,
    selectedStudio,
    totalCarrinho,
    metodoPagamento,
    statusPagamento,
    allStudios, // Para exibir o nome do estúdio
    formatPrice,
    formatDate,
}) => {
    if (!isOpen) return null;

    const currentStudio = allStudios.find(studio => studio.id.toString() === selectedStudio.toString());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-background-dark rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revisar e Confirmar Venda</h2>
                </div>

                <div className="p-6 space-y-4 text-gray-800 dark:text-gray-200">
                    {/* Informações Gerais */}
                    <div className="border-b pb-3 border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-lg mb-2">Detalhes da Venda</h3>
                        <p><strong>Estúdio:</strong> {currentStudio?.nome || 'N/A'}</p>
                        <p><strong>Comprador:</strong> {selectedAluno ? `${selectedAluno.nome} (${selectedAluno.cpf})` : 'Venda Avulsa'}</p>
                    </div>

                    {/* Produtos no Carrinho */}
                    <div className="border-b pb-3 border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-lg mb-2">Produtos</h3>
                        {carrinho.length === 0 ? (
                            <p>Nenhum produto no carrinho.</p>
                        ) : (
                            <ul className="space-y-2">
                                {carrinho.map(item => (
                                    <li key={item.produto_id} className="flex justify-between text-sm">
                                        <span>{item.produto_nome} x {item.quantidade}</span>
                                        <span>{formatPrice(item.quantidade * parseFloat(item.preco_unitario))}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Informações de Pagamento */}
                    <div className="border-b pb-3 border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-lg mb-2">Pagamento</h3>
                        <p><strong>Método:</strong> {metodoPagamento}</p>
                        <p><strong>Status:</strong> {statusPagamento}</p>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white pt-2">
                        <span>Total:</span>
                        <span>{formatPrice(totalCarrinho)}</span>
                    </div>
                </div>

                <div className="p-6 flex justify-end space-x-3 bg-gray-50 dark:bg-card-dark/50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Confirmar Venda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleConfirmationModal;
