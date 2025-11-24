import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useProductsViewModel } from '../viewmodels/useProductsViewModel';
import { useToast } from '../context/ToastContext';
import ProductFormModal from '../components/products/ProductFormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import ProductCard from '../components/ProductCard'; // Importar o novo ProductCard

const GerenciamentoProdutosView = () => {
    const {
        products, // Agora será filteredProducts do ViewModel
        loading,
        error,
        fetchProducts,
        addProduct,
        editProduct,
        removeProduct,
        // Do ViewModel de produtos para estoque
        productStockDetails,
        loadingStock,
        isStockModalOpen,
        selectedProductForStock,
        handleAdjustStock,
        openStockModal,
        closeStockModal,
        // Novos estados de busca do ViewModel
        searchText,
        setSearchText,
    } = useProductsViewModel();
    const { showToast } = useToast();

    // Estados para o modal de formulário de produto (Adicionar/Editar)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);

    // Estados para o modal de confirmação de exclusão
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Funções para o modal de formulário
    const openFormModal = (product = null) => {
        setSelectedProductToEdit(product);
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setSelectedProductToEdit(null);
        setIsFormModalOpen(false);
    };

    const handleSaveProduct = async (productData) => {
        try {
            if (selectedProductToEdit) {
                await editProduct(selectedProductToEdit.id, productData);
            } else {
                await addProduct(productData);
            }
            closeFormModal();
            fetchProducts(); // Recarrega a lista de produtos
        } catch (err) {
            // Erro já tratado no ViewModel
        }
    };

    // Funções para o modal de exclusão
    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setProductToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        if (productToDelete) {
            try {
                await removeProduct(productToDelete.id);
                fetchProducts(); // Recarrega a lista de produtos
                closeDeleteModal();
            } catch (err) {
                // Erro já tratado no ViewModel
            }
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Gerenciamento de Produtos" showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-4xl">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">Erro:</strong>
                            <span className="block sm:inline"> {error.message || 'Ocorreu um erro ao carregar os produtos.'}</span>
                        </div>
                    )}

                    {/* Controles de Ações e Campo de Busca */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-4 justify-between items-center">
                        <button
                            onClick={() => openFormModal()}
                            className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-action-primary text-white gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
                        >
                            <div className="text-white">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <span className="truncate">Adicionar Produto</span>
                        </button>

                        {/* Campo de Busca */}
                        <label className="flex flex-col min-w-40 h-12 w-full max-w-[480px]">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                                <div className="text-text-subtle-light dark:text-text-subtle-dark flex border-none bg-input-background-light dark:bg-input-background-dark items-center justify-center pl-4 rounded-l-xl border-r-0">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-none bg-input-background-light dark:bg-input-background-dark focus:border-none h-full placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                    placeholder="Buscar por nome do produto..."
                                />
                            </div>
                        </label>
                    </div>

                    {/* Lista de Produtos em formato de Card */}
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Todos os Produtos</h2>
                        {loading ? (
                            <p>Carregando produtos...</p>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onEdit={openFormModal}
                                        onDelete={openDeleteModal}
                                        onManageStock={openStockModal}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">Nenhum produto encontrado.</p>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            <ProductFormModal
                isOpen={isFormModalOpen}
                onClose={closeFormModal}
                onSubmit={handleSaveProduct}
                product={selectedProductToEdit}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão de Produto"
                message={`Tem certeza de que deseja excluir o produto "${productToDelete?.nome}"? Esta ação não pode ser desfeita.`}
            />

            <StockAdjustmentModal
                isOpen={isStockModalOpen}
                onClose={closeStockModal}
                product={selectedProductForStock}
                productStockDetails={productStockDetails}
                loadingStock={loadingStock}
                onAdjustStock={handleAdjustStock}
                showToast={showToast}
            />
        </div>
    );
};

export default GerenciamentoProdutosView;
