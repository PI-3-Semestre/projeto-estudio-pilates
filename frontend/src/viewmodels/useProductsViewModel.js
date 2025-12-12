import { useState, useEffect, useCallback, useMemo } from 'react'; // Adicionado useMemo
import { getProducts, createProduct, updateProduct, deleteProduct, getProductStockDetails, adjustStock } from '../services/productsService';
import { useToast } from '../context/ToastContext';

export const useProductsViewModel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Estados para gerenciamento de estoque
  const [productStockDetails, setProductStockDetails] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);

  // Novos estados para busca
  const [searchText, setSearchText] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err);
      showToast('Falha ao carregar produtos.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const addProduct = async (newProduct) => {
    try {
      const created = await createProduct(newProduct);
      setProducts(prev => [...prev, created]);
      showToast('Produto adicionado com sucesso!', { type: 'success' });
      return created;
    } catch (err) {
      showToast('Erro ao adicionar produto.', { type: 'error' });
      throw err;
    }
  };

  const editProduct = async (id, updatedData) => {
    try {
      const updated = await updateProduct(id, updatedData);
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      showToast('Produto atualizado com sucesso!', { type: 'success' });
      return updated;
    } catch (err) {
      showToast('Erro ao atualizar produto.', { type: 'error' });
      throw err;
    }
  };

  const removeProduct = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Produto excluído com sucesso!', { type: 'success' });
    } catch (err) {
      if (err.response && (err.response.status === 409 || err.response.status === 400)) {
        showToast('Não é possível excluir. O produto está associado a uma ou mais vendas.', { type: 'error' });
      } else {
        showToast('Erro ao excluir produto.', { type: 'error' });
      }
      throw err;
    }
  };

  // Funções para gerenciamento de estoque
  const fetchProductStockDetails = useCallback(async (productId) => {
    setLoadingStock(true);
    try {
      const data = await getProductStockDetails(productId);
      setProductStockDetails(data);
    } catch (err) {
      showToast('Erro ao carregar detalhes de estoque.', { type: 'error' });
      setError(err);
    } finally {
      setLoadingStock(false);
    }
  }, [showToast]);

  const handleAdjustStock = async (productId, studioId, quantity, operation) => {
    try {
      const adjustmentData = {
        produto_id: productId,
        studio_id: studioId,
        quantidade: quantity,
        operacao: operation,
      };
      const response = await adjustStock(adjustmentData);
      showToast('Estoque ajustado com sucesso!', { type: 'success' });
      fetchProductStockDetails(productId);
      return response;
    } catch (err) {
      let errorMessage = 'Erro ao ajustar estoque.';
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response && err.response.data) {
        errorMessage = JSON.stringify(err.response.data);
      }
      showToast(errorMessage, { type: 'error' });
      throw err;
    }
  };

  const openStockModal = (product) => {
    setSelectedProductForStock(product);
    setIsStockModalOpen(true);
    fetchProductStockDetails(product.id);
  };

  const closeStockModal = () => {
    setSelectedProductForStock(null);
    setProductStockDetails(null);
    setIsStockModalOpen(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Lógica de filtragem
  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) {
      return products;
    }
    const query = searchText.toLowerCase().trim();
    return products.filter(product =>
      product.nome.toLowerCase().includes(query) ||
      product.descricao.toLowerCase().includes(query) // Incluindo descrição na busca
    );
  }, [products, searchText]);

  return {
    products: filteredProducts, // Retorna os produtos filtrados
    loading,
    error,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    // Retornos para gerenciamento de estoque
    productStockDetails,
    loadingStock,
    isStockModalOpen,
    selectedProductForStock,
    fetchProductStockDetails,
    handleAdjustStock,
    openStockModal,
    closeStockModal,
    // Retornos para busca
    searchText,
    setSearchText,
  };
};
