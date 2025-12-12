import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import financeiroService from '../services/financeiroService';
import { useToast } from '../context/ToastContext';

const useDetalhesPagamentoViewModel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [pagamento, setPagamento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPagamento = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await financeiroService.getPagamentoById(id);
            setPagamento(response.data);
        } catch (err) {
            setError(err);
            showToast('Erro ao carregar os detalhes do pagamento.', { type: 'error' });
            navigate('/financeiro/pagamentos'); // Volta para a lista se não encontrar
        } finally {
            setLoading(false);
        }
    }, [id, navigate, showToast]);

    useEffect(() => {
        fetchPagamento();
    }, [fetchPagamento]);

    const formatPrice = (price) => {
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return "R$ 0,00";
        }
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericPrice);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return {
        pagamento,
        loading,
        error,
        formatPrice,
        formatDate,
        refreshPagamento: fetchPagamento,
    };
};

export default useDetalhesPagamentoViewModel;
