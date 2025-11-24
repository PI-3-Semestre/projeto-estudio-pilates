import { useState, useEffect, useCallback } from 'react';
import relatoriosService from '../services/relatoriosService';
import studioService from '../services/studioService';
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

// Helper para formatar data para YYYY-MM-DD
const toYYYYMMDD = (date) => date.toISOString().split('T')[0];

const useRelatoriosViewModel = () => {
    const { showToast } = useToast();
    
    // Filtros ativos que disparam a busca
    const [filters, setFilters] = useState({
        data_inicio: '',
        data_fim: '',
        studio_id: '',
    });

    // Rascunho de filtros para o BottomSheet
    const [draftFilters, setDraftFilters] = useState(filters);

    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para os dados dos relatórios
    const [faturamentoData, setFaturamentoData] = useState(null);
    const [vendasPorProdutoData, setVendasPorProdutoData] = useState(null);
    const [statusPagamentosData, setStatusPagamentosData] = useState(null);
    const [matriculasAtivasData, setMatriculasAtivasData] = useState(null);

    const fetchStudios = useCallback(async () => {
        try {
            const response = await studioService.getStudios();
            setStudios(response.data);
        } catch (err) {
            showToast(getErrorMessage(err, 'Erro ao buscar estúdios.'), { type: 'error' });
        }
    }, [showToast]);

    const fetchRelatorios = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            const params = {
                data_inicio: currentFilters.data_inicio || undefined,
                data_fim: currentFilters.data_fim || undefined,
                studio_id: currentFilters.studio_id || undefined,
            };

            const [
                faturamentoRes,
                vendasRes,
                pagamentosRes,
                matriculasRes,
            ] = await Promise.all([
                relatoriosService.getFaturamento(params),
                relatoriosService.getVendasPorProduto(params),
                relatoriosService.getStatusPagamentos(params),
                relatoriosService.getMatriculasAtivas({ studio_id: params.studio_id }),
            ]);

            setFaturamentoData(faturamentoRes.data);
            setVendasPorProdutoData(vendasRes.data);
            setStatusPagamentosData(pagamentosRes.data);
            setMatriculasAtivasData(matriculasRes.data);

        } catch (err) {
            showToast(getErrorMessage(err, 'Erro ao buscar dados dos relatórios.'), { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // Busca inicial de dados
    useEffect(() => {
        fetchStudios();
        fetchRelatorios(filters);
    }, []); // Executa apenas uma vez

    const handleDraftFilterChange = (newFilters) => {
        setDraftFilters(prev => ({ ...prev, ...newFilters }));
    };

    const setPeriodo = (period) => {
        const today = new Date();
        let data_inicio = '';
        let data_fim = toYYYYMMDD(today);

        switch (period) {
            case 'LAST_7_DAYS':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                data_inicio = toYYYYMMDD(sevenDaysAgo);
                break;
            case 'THIS_MONTH':
                data_inicio = toYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 1));
                break;
            case 'LAST_MONTH':
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                data_inicio = toYYYYMMDD(lastMonth);
                data_fim = toYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 0));
                break;
            case 'LAST_90_DAYS':
                const ninetyDaysAgo = new Date(today);
                ninetyDaysAgo.setDate(today.getDate() - 90);
                data_inicio = toYYYYMMDD(ninetyDaysAgo);
                break;
            default:
                break;
        }
        setDraftFilters(prev => ({ ...prev, data_inicio, data_fim }));
    };

    const applyAndFetch = () => {
        setFilters(draftFilters);
        fetchRelatorios(draftFilters);
    };

    const clearFilters = () => {
        const cleared = { data_inicio: '', data_fim: '', studio_id: '' };
        setDraftFilters(cleared);
        setFilters(cleared);
        fetchRelatorios(cleared);
    };

    // Sincroniza o rascunho quando os filtros principais mudam (ex: ao limpar)
    useEffect(() => {
        setDraftFilters(filters);
    }, [filters]);

    return {
        filters,
        draftFilters,
        studios,
        loading,
        handleDraftFilterChange,
        setPeriodo,
        applyAndFetch,
        clearFilters,
        faturamentoData,
        vendasPorProdutoData,
        statusPagamentosData,
        matriculasAtivasData,
    };
};

export default useRelatoriosViewModel;
