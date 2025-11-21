import { useState, useEffect, useCallback } from 'react';
import financeiroService from '../services/financeiroService';
import { useToast } from '../context/ToastContext';

const useGerenciamentoFinanceiroViewModel = () => {
    const [resumo, setResumo] = useState(null);
    const [transacoes, setTransacoes] = useState([]);
    const [loadingResumo, setLoadingResumo] = useState(true);
    const [loadingTransacoes, setLoadingTransacoes] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        type: 'all',
    });
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchResumo = useCallback(async () => {
        try {
            setLoadingResumo(true);
            const response = await financeiroService.getResumoFinanceiro();
            setResumo(response.data);
        } catch (err) {
            setError(err);
            showToast('Erro ao buscar resumo financeiro.', { type: 'error' });
        } finally {
            setLoadingResumo(false);
        }
    }, [showToast]);

    const fetchTransacoes = useCallback(async () => {
        try {
            setLoadingTransacoes(true);
            const response = await financeiroService.getTransacoes(filters);
            setTransacoes(response.data);
        } catch (err) {
            setError(err);
            showToast('Erro ao buscar transações.', { type: 'error' });
        } finally {
            setLoadingTransacoes(false);
        }
    }, [filters, showToast]);

    useEffect(() => {
        fetchResumo();
        fetchTransacoes();
    }, [fetchResumo, fetchTransacoes]);

    const applyFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const handleDeleteTransacao = useCallback(async (id) => {
        try {
            await financeiroService.deleteTransacao(id);
            showToast('Transação excluída com sucesso.', { type: 'success' });
            fetchTransacoes(); // Refresh transactions
        } catch (err) {
            setError(err);
            showToast('Erro ao excluir transação.', { type: 'error' });
        }
    }, [showToast, fetchTransacoes]);

    return {
        resumo,
        transacoes,
        loadingResumo,
        loadingTransacoes,
        filters,
        applyFilters,
        handleDeleteTransacao,
        error,
    };
};

export default useGerenciamentoFinanceiroViewModel;
