import { useState, useEffect, useCallback, useMemo } from 'react';
import financeiroService from '../services/financeiroService';
import { useToast } from '../context/ToastContext';

const useGerenciamentoPagamentosViewModel = () => {
    const { showToast } = useToast();

    const [pagamentos, setPagamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para filtro e ordenação
    const [sortBy, setSortBy] = useState('data_vencimento');
    const [sortOrder, setSortOrder] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [metodoPagamentoFilter, setMetodoPagamentoFilter] = useState('all');

    // Opções hardcoded para filtros (conforme análise crítica)
    const statusOptions = [
        { value: 'all', label: 'Status: Todos' },
        { value: 'PENDENTE', label: 'Pendente' },
        { value: 'PAGO', label: 'Pago' },
        { value: 'ATRASADO', label: 'Atrasado' },
        { value: 'CANCELADO', label: 'Cancelado' },
    ];

    const metodoPagamentoOptions = [
        { value: 'all', label: 'Método: Todos' },
        { value: 'PIX', label: 'PIX' },
        { value: 'DINHEIRO', label: 'Dinheiro' },
        { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
        { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
        { value: 'BOLETO', label: 'Boleto' },
        // Adicionar outros métodos conforme necessário ou se o backend fornecer um endpoint
    ];

    const fetchPagamentos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await financeiroService.getPagamentos();
            setPagamentos(response.data);
        } catch (err) {
            setError(err);
            showToast('Erro ao carregar os pagamentos.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchPagamentos();
    }, [fetchPagamentos]);

    // Lógica de filtragem e ordenação
    const processedPagamentos = useMemo(() => {
        if (!pagamentos || pagamentos.length === 0) return [];

        let filtered = [...pagamentos];

        // Aplica filtro de status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(pagamento => pagamento.status === statusFilter);
        }

        // Aplica filtro de método de pagamento
        if (metodoPagamentoFilter !== 'all') {
            filtered = filtered.filter(pagamento => pagamento.metodo_pagamento === metodoPagamentoFilter);
        }

        // Aplica ordenação
        filtered.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'data_vencimento':
                    valueA = new Date(a.data_vencimento).getTime();
                    valueB = new Date(b.data_vencimento).getTime();
                    break;
                case 'valor_total':
                    valueA = parseFloat(a.valor_total);
                    valueB = parseFloat(b.valor_total);
                    break;
                case 'status':
                    valueA = a.status;
                    valueB = b.status;
                    break;
                default:
                    valueA = a[sortBy];
                    valueB = b[sortBy];
            }

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        });

        return filtered;
    }, [pagamentos, statusFilter, metodoPagamentoFilter, sortBy, sortOrder]);

    const handleDeletePagamento = async (pagamento) => {
        try {
            await financeiroService.deletePagamento(pagamento.id);
            showToast('Pagamento deletado com sucesso!', { type: 'success' });
            setPagamentos(prevPagamentos => prevPagamentos.filter(p => p.id !== pagamento.id));
        } catch (err) {
            showToast('Erro ao deletar o pagamento. Verifique se há dependências.', { type: 'error' });
        }
    };

    return {
        pagamentos: processedPagamentos,
        loading,
        error,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        statusFilter,
        setStatusFilter,
        metodoPagamentoFilter,
        setMetodoPagamentoFilter,
        statusOptions,
        metodoPagamentoOptions,
        handleDeletePagamento,
        refreshPagamentos: fetchPagamentos,
    };
};

export default useGerenciamentoPagamentosViewModel;
