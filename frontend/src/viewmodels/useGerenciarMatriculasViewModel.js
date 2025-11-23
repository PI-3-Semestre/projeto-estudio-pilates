import { useState, useEffect, useCallback, useMemo } from 'react';
import matriculasService from '../services/matriculasService';
import studiosService from '../services/studiosService'; // Importar o serviço de estúdios
import { useToast } from '../context/ToastContext';

const useGerenciarMatriculasViewModel = () => {
    const { showToast } = useToast();

    const [matriculas, setMatriculas] = useState([]);
    const [allStudios, setAllStudios] = useState([]); // Novo estado para todos os estúdios
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para ordenação e filtro
    const [sortBy, setSortBy] = useState('data_inicio');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchText, setSearchText] = useState('');

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
        } catch (err) {
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
    }, [matriculas, searchText, sortBy, sortOrder]);

    const handleDeleteMatricula = async (matricula) => {
        try {
            await matriculasService.deleteMatricula(matricula.id);
            showToast('Matrícula deletada com sucesso!', { type: 'success' });
            setMatriculas(prevMatriculas => prevMatriculas.filter(m => m.id !== matricula.id));
        } catch (err) {
            showToast('Erro ao deletar a matrícula.', { type: 'error' });
        }
    };

    return {
        matriculas: processedMatriculas,
        allStudios, // Exporta a lista de estúdios
        loading,
        error,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        searchText,
        setSearchText,
        handleDeleteMatricula,
        refreshMatriculas: fetchData,
    };
};

export default useGerenciarMatriculasViewModel;
