import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productsService';
import { useToast } from '../context/ToastContext';

export const useProductsViewModel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

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
    } catch (err) {
      showToast('Erro ao adicionar produto.', { type: 'error' });
    }
  };

  const editProduct = async (id, updatedData) => {
    try {
      const updated = await updateProduct(id, updatedData);
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      showToast('Produto atualizado com sucesso!', { type: 'success' });
    } catch (err) {
      showToast('Erro ao atualizar produto.', { type: 'error' });
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
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
  };
};
