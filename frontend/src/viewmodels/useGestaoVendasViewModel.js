import { useState, useEffect, useCallback, useMemo } from 'react';
import vendasService from '../services/vendasService';
import studiosService from '../services/studiosService'; // Importar o serviço de estúdios
import { useToast } from '../context/ToastContext';

const useGestaoVendasViewModel = () => {
    const { showToast } = useToast();

    const [vendas, setVendas] = useState([]);
    const [allStudios, setAllStudios] = useState([]); // Novo estado para todos os estúdios
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para ordenação
    const [sortBy, setSortBy] = useState('data_venda');
    const [sortOrder, setSortOrder] = useState('desc');

    // Novo estado para filtro de estúdio
    const [studioFilter, setStudioFilter] = useState('all'); // 'all' para todos os estúdios

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

    const fetchStudios = useCallback(async () => {
        try {
            const response = await studiosService.getAllStudios();
            setAllStudios(response.data);
        } catch (err) {
            showToast('Erro ao carregar a lista de estúdios para filtro.', { type: 'error' });
        }
    }, [showToast]);

    useEffect(() => {
        fetchVendas();
        fetchStudios(); // Carrega os estúdios ao montar o componente
    }, [fetchVendas, fetchStudios]);

    // Lógica de filtragem e ordenação memoizada
    const processedVendas = useMemo(() => {
        if (!vendas || vendas.length === 0) return [];

        let filtered = [...vendas];

        // Aplica o filtro de estúdio
        if (studioFilter !== 'all') {
            filtered = filtered.filter(venda => venda.studio?.id.toString() === studioFilter.toString());
        }

        // Aplica a ordenação
        filtered.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'data_venda':
                    valueA = new Date(a.data_venda).getTime();
                    valueB = new Date(b.data_venda).getTime();
                    break;
                case 'valor_total':
                    valueA = parseFloat(a.valor_total);
                    valueB = parseFloat(b.valor_total);
                    break;
                default:
                    valueA = a[sortBy];
                    valueB = b[sortBy];
            }

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(a.valueA);
            }
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        });

        return filtered;
    }, [vendas, studioFilter, sortBy, sortOrder]);

    const handleDeleteVenda = async (id) => {
        try {
            await vendasService.deleteVenda(id);
            showToast('Venda deletada com sucesso!', { type: 'success' });
            // Atualiza a lista de vendas após a exclusão
            setVendas(prevVendas => prevVendas.filter(venda => venda.id !== id));
        } catch (err) {
            showToast('Erro ao deletar a venda. Verifique se há pagamentos associados.', { type: 'error' });
        }
    };

    return {
        vendas: processedVendas, // Agora retorna as vendas filtradas e ordenadas
        loading,
        error,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        allStudios,      // Exporta todos os estúdios
        studioFilter,    // Exporta o filtro de estúdio atual
        setStudioFilter, // Exporta a função para alterar o filtro de estúdio
        handleDeleteVenda,
        refreshVendas: fetchVendas,
    };
};

export default useGestaoVendasViewModel;
