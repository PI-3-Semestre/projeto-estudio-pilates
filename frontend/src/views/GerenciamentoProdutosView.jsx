import React, { useState } from 'react';
import { useProductsViewModel } from '../viewmodels/useProductsViewModel';
import Header from '../components/Header';
import ProductFormModal from '../components/products/ProductFormModal';
import Icon from '../components/Icon';

// Componente de Modal de Confirmação genérico
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="flex items-center justify-center rounded-xl h-11 px-5 bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark text-base font-bold hover:bg-gray-300 dark:hover:bg-gray-600">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex items-center justify-center rounded-xl h-11 px-5 bg-red-600 text-white text-base font-bold hover:bg-red-700">
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
};

const GerenciamentoProdutosView = () => {
  const { products, loading, addProduct, editProduct, removeProduct } = useProductsViewModel();
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openAddModal = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const openDeleteConfirm = (product) => {
    setSelectedProduct(product);
    setIsConfirmModalOpen(true);
  };

  const handleFormSubmit = (productData) => {
    if (selectedProduct && selectedProduct.id) {
      editProduct(selectedProduct.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct && selectedProduct.id) {
      removeProduct(selectedProduct.id);
    }
    setIsConfirmModalOpen(false);
    setSelectedProduct(null);
  };

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Header title="Gerenciamento de Produtos" showBackButton={true} />
      
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-end mb-4">
          <button onClick={openAddModal} className="flex items-center justify-center rounded-xl h-12 px-5 bg-action-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-action-primary/90">
            <Icon name="add" className="mr-2" />
            Adicionar Produto
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{product.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(product.preco)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full">
                            <Icon name="edit" />
                          </button>
                          <button onClick={() => openDeleteConfirm(product)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full ml-2">
                            <Icon name="delete" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                        Nenhum produto cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir o produto "${selectedProduct?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default GerenciamentoProdutosView;
