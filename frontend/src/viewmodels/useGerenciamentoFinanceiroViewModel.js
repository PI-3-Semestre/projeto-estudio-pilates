import { useState, useEffect, useCallback } from 'react';
import financeiroService from '../services/financeiroService';
import { useToast } from '../context/ToastContext';

const getErrorMessage = (err, defaultMessage) => {
    if (err.response && err.response.data) {
        if (typeof err.response.data === 'object' && !err.response.data.detail) {
            const errorFields = Object.keys(err.response.data);
            if (errorFields.length > 0) {
                return errorFields.map(field => `${field}: ${err.response.data[field]}`).join('; ');
            }
        }
        return err.response.data.detail || JSON.stringify(err.response.data);
    }
    return err.message || defaultMessage;
};

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
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
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
            const message = getErrorMessage(err, 'Erro ao buscar resumo financeiro.');
            showToast(message, { type: 'error' });
        } finally {
            setLoadingResumo(false);
        }
    }, [showToast]);

    const fetchTransacoes = useCallback(async (page = 1) => {
        try {
            setLoadingTransacoes(true);
            const response = await financeiroService.getTransacoes(filters, page);
            setTransacoes(response.data.results);
            setPagination({
                currentPage: page,
                totalPages: response.data.total_pages,
                totalCount: response.data.count,
            });
        } catch (err) {
            setError(err);
            const message = getErrorMessage(err, 'Erro ao buscar transações.');
            showToast(message, { type: 'error' });
        } finally {
            setLoadingTransacoes(false);
        }
    }, [filters, showToast]);

    useEffect(() => {
        fetchResumo();
    }, [fetchResumo]);

    useEffect(() => {
        fetchTransacoes(1); // Reset to page 1 on filter change
    }, [filters, fetchTransacoes]);

    const applyFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const handleDeleteTransacao = useCallback(async (id) => {
        try {
            await financeiroService.deleteTransacao(id);
            showToast('Transação excluída com sucesso.', { type: 'success' });
            fetchTransacoes(pagination.currentPage); // Refresh transactions on the current page
        } catch (err) {
            setError(err);
            const message = getErrorMessage(err, 'Erro ao excluir transação.');
            showToast(message, { type: 'error' });
        }
    }, [showToast, fetchTransacoes, pagination.currentPage]);

    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchTransacoes(page);
        }
    };

    return {
        resumo,
        transacoes,
        loadingResumo,
        loadingTransacoes,
        filters,
        pagination,
        applyFilters,
        handleDeleteTransacao,
        goToPage,
        error,
    };
};

export default useGerenciamentoFinanceiroViewModel;
