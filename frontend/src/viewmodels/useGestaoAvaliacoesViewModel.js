import { useState, useEffect, useMemo } from 'react';
import { getAllAvaliacoes, deleteAvaliacao } from '../services/avaliacoesService';
import studiosService from '../services/studiosService'; // Importando o serviço de studios

const useGestaoAvaliacoesViewModel = () => {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [studios, setStudios] = useState([]); // Estado para a lista de estúdios
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para filtros e ordenação
    const [searchText, setSearchText] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [studioFilter, setStudioFilter] = useState(''); // Novo estado para o filtro de estúdio
    const [sortBy, setSortBy] = useState('data_avaliacao');
    const [sortOrder, setSortOrder] = useState('desc');

    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Busca avaliações e estúdios em paralelo para otimizar o carregamento
            const [avaliacoesResponse, studiosResponse] = await Promise.all([
                getAllAvaliacoes(),
                studiosService.getAllStudios()
            ]);
            setAvaliacoes(avaliacoesResponse.data);
            setStudios(studiosResponse.data);
        } catch (err) {
            setError('Erro ao carregar dados. Você pode não ter permissão para ver esta página.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteAvaliacao(id);
            // Refresca a lista de avaliações após a exclusão
            const response = await getAllAvaliacoes();
            setAvaliacoes(response.data);
        } catch (err) {
            console.error("Falha ao excluir avaliação:", err);
            throw err;
        }
    };

    const filteredAndSortedAvaliacoes = useMemo(() => {
        let filtered = avaliacoes.filter(av => {
            const searchLower = searchText.toLowerCase();
            const matchesSearch = (
                av.aluno_nome.toLowerCase().includes(searchLower) ||
                av.instrutor_nome.toLowerCase().includes(searchLower)
            );
            const matchesDate = dateFilter ? av.data_avaliacao === dateFilter : true;
            // **LÓGICA DO FILTRO DE ESTÚDIO**
            const matchesStudio = studioFilter ? av.studio.toString() === studioFilter : true;
            
            return matchesSearch && matchesDate && matchesStudio;
        });

        filtered.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (sortBy === 'data_avaliacao') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [avaliacoes, searchText, dateFilter, studioFilter, sortBy, sortOrder]);

    const openFilterSheet = () => setIsFilterSheetOpen(true);
    const closeFilterSheet = () => setIsFilterSheetOpen(false);

    const clearFilters = () => {
        setSearchText('');
        setDateFilter('');
        setStudioFilter(''); // Limpa o filtro de estúdio
        setSortBy('data_avaliacao');
        setSortOrder('desc');
    };

    return {
        avaliacoes: filteredAndSortedAvaliacoes,
        studios, // Exporta a lista de estúdios para a view
        loading,
        error,
        handleDelete,
        searchText,
        setSearchText,
        dateFilter,
        setDateFilter,
        studioFilter, // Exporta o estado do filtro
        setStudioFilter, // Exporta a função para atualizar o filtro
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        isFilterSheetOpen,
        openFilterSheet,
        closeFilterSheet,
        clearFilters,
    };
};

export default useGestaoAvaliacoesViewModel;
