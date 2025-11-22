import { useState, useEffect, useCallback } from 'react';
import vendasService from '../services/vendasService';
import { useToast } from '../context/ToastContext';

const useGestaoVendasViewModel = () => {
    const { showToast } = useToast();

    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVendas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendasService.getVendas();
            setVendas(response.data);
        } catch (err) {
            setError(err);
            showToast('Erro ao carregar as vendas.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchVendas();
    }, [fetchVendas]);

    const handleDeleteVenda = async (id) => {
        try {
            await vendasService.deleteVenda(id);
            showToast('Venda deletada com sucesso!', { type: 'success' });
            setVendas(prevVendas => prevVendas.filter(venda => venda.id !== id));
        } catch (err) {
            showToast('Erro ao deletar a venda. Verifique se há pagamentos associados.', { type: 'error' });
        }
    };

    return {
        vendas,
        loading,
        error,
        handleDeleteVenda,
        refreshVendas: fetchVendas,
    };
};

export default useGestaoVendasViewModel;
