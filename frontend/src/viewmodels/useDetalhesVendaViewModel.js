import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import vendasService from '../services/vendasService';
import financeiroService from '../services/financeiroService'; // Importar o serviço de financeiro
import { useToast } from '../context/ToastContext';

const useDetalhesVendaViewModel = () => {
    const { id } = useParams();
    const { showToast } = useToast();

    const [venda, setVenda] = useState(null);
    const [pagamento, setPagamento] = useState(null); // Novo estado para o pagamento
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const vendaResponse = await vendasService.getVendaById(id);
            setVenda(vendaResponse.data);

            // Tenta buscar o pagamento associado à venda
            try {
                const pagamentoResponse = await financeiroService.getPagamentoByVendaId(id);
                setPagamento(pagamentoResponse.data);
            } catch (pagamentoError) {
                // Se o pagamento não for encontrado (404), não é um erro crítico, apenas não há pagamento
                if (pagamentoError.response && pagamentoError.response.status === 404) {
                    setPagamento(null);
                } else {
                    console.error("Erro ao buscar pagamento da venda:", pagamentoError);
                    showToast('Erro ao carregar informações de pagamento.', { type: 'error' });
                }
            }

        } catch (err) {
            setError(err);
            showToast('Erro ao carregar os detalhes da venda.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    return {
        venda,
        pagamento, // Exporta o pagamento
        loading,
        error,
        refreshData: fetchData, // Renomeado para refletir que busca ambos
    };
};

export default useDetalhesVendaViewModel;
