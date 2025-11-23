import { useState, useEffect, useCallback, useMemo } from 'react';
import matriculasService from '../services/matriculasService';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

const useGerenciarMatriculasViewModel = () => {
    const { showToast } = useToast();

    const [matriculas, setMatriculas] = useState([]);
    const [allStudios, setAllStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para ordenação e filtro
    const [sortBy, setSortBy] = useState('data_inicio');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchText, setSearchText] = useState('');
    const [studioFilter, setStudioFilter] = useState('all');
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false); // Novo estado para a gaveta

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [matriculasResponse, studiosResponse] = await Promise.all([
                matriculasService.getMatriculas(),
                studiosService.getAllStudios(),
            ]);
            setMatriculas(matriculasResponse.data);
            setAllStudios(studiosResponse.data);
        } catch (err) { // Corrigido: removido o '=>'
            setError(err);
            showToast('Erro ao carregar os dados.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Lógica de filtragem e ordenação
    const processedMatriculas = useMemo(() => {
        if (!matriculas || matriculas.length === 0) return [];

        let filtered = [...matriculas];

        if (searchText.trim()) {
            const query = searchText.toLowerCase().trim();
            filtered = filtered.filter(matricula =>
                (matricula.aluno?.nome?.toLowerCase().includes(query)) ||
                (matricula.aluno?.cpf?.includes(query))
            );
        }

        if (studioFilter !== 'all') {
            filtered = filtered.filter(matricula => {
                const studioId = matricula.studio?.id || matricula.studio;
                return studioId?.toString() === studioFilter.toString();
            });
        }

        filtered.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'data_inicio':
                case 'data_fim':
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                    break;
                case 'aluno_nome':
                    valueA = a.aluno?.nome || '';
                    valueB = b.aluno?.nome || '';
                    break;
                case 'plano_nome':
                    valueA = a.plano?.nome || '';
                    valueB = b.plano?.nome || '';
                    break;
                default:
                    return 0;
            }

            if (typeof valueA === 'string') {
                return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        });

        return filtered;
    }, [matriculas, searchText, studioFilter, sortBy, sortOrder]);

    const handleDeleteMatricula = async (matricula) => {
        try {
            await matriculasService.deleteMatricula(matricula.id);
            showToast('Matrícula deletada com sucesso!', { type: 'success' });
            setMatriculas(prevMatriculas => prevMatriculas.filter(m => m.id !== matricula.id));
        } catch (err) {
            showToast('Erro ao deletar a matrícula.', { type: 'error' });
        }
    };

    const clearFilters = () => {
        setSearchText('');
        setStudioFilter('all');
        setSortBy('data_inicio');
        setSortOrder('desc');
    };

    return {
        matriculas: processedMatriculas,
        allStudios,
        loading,
        error,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        searchText,
        setSearchText,
        studioFilter,
        setStudioFilter,
        isFilterSheetOpen,
        openFilterSheet: () => setIsFilterSheetOpen(true),
        closeFilterSheet: () => setIsFilterSheetOpen(false),
        clearFilters,
        handleDeleteMatricula,
        refreshMatriculas: fetchData,
    };
};

export default useGerenciarMatriculasViewModel;
