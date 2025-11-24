import { useState, useEffect, useCallback, useMemo } from 'react';
import vendasService from '../services/vendasService';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

const useGestaoVendasViewModel = () => {
    const { showToast } = useToast();

    const [vendas, setVendas] = useState([]);
    const [allStudios, setAllStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para ordenação e filtro
    const [sortBy, setSortBy] = useState('data_venda');
    const [sortOrder, setSortOrder] = useState('desc');
    const [studioFilter, setStudioFilter] = useState('all');
    const [searchText, setSearchText] = useState(''); // Novo estado para o texto de busca
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [vendasResponse, studiosResponse] = await Promise.all([
                vendasService.getVendas(),
                studiosService.getAllStudios(),
            ]);
            setVendas(Array.isArray(vendasResponse.data) ? vendasResponse.data : []);
            setAllStudios(Array.isArray(studiosResponse.data) ? studiosResponse.data : []);
        } catch (err) {
            setError(err);
            showToast('Erro ao carregar os dados.', { type: 'error' });
            setVendas([]); // Ensure vendas is an array even on error
            setAllStudios([]); // Ensure allStudios is an array even on error
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Lógica de filtragem e ordenação memoizada
    const processedVendas = useMemo(() => {
        // Ensure vendas is an array before proceeding
        const currentVendas = Array.isArray(vendas) ? vendas : [];

        if (currentVendas.length === 0) return [];

        let filtered = [...currentVendas];

        // Aplica filtro de busca por texto
        if (searchText.trim()) {
            const query = searchText.toLowerCase().trim();
            filtered = filtered.filter(venda =>
                (venda.aluno?.nome_completo?.toLowerCase().includes(query)) ||
                (venda.aluno?.nome?.toLowerCase().includes(query)) || // Adicionado para consistência
                (venda.aluno?.cpf?.includes(query))
            );
        }

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
                return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        });

        return filtered;
    }, [vendas, searchText, studioFilter, sortBy, sortOrder]);

    const handleDeleteVenda = async (id) => {
        try {
            await vendasService.deleteVenda(id);
            showToast('Venda deletada com sucesso!', { type: 'success' });
            setVendas(prevVendas => prevVendas.filter(venda => venda.id !== id));
        } catch (err) {
            showToast('Erro ao deletar a venda. Verifique se há pagamentos associados.', { type: 'error' });
        }
    };

    const clearFilters = () => {
        setSearchText(''); // Limpa o texto de busca
        setStudioFilter('all');
        setSortBy('data_venda');
        setSortOrder('desc');
    };

    return {
        vendas: processedVendas,
        loading,
        error,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        allStudios,
        studioFilter,
        setStudioFilter,
        searchText,        // Exporta o estado de busca
        setSearchText,     // Exporta o setter da busca
        isFilterSheetOpen,
        openFilterSheet: () => setIsFilterSheetOpen(true),
        closeFilterSheet: () => setIsFilterSheetOpen(false),
        clearFilters,
        handleDeleteVenda,
        refreshVendas: fetchData,
    };
};

export default useGestaoVendasViewModel;
