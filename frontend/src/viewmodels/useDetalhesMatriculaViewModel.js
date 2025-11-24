import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import matriculasService from '../services/matriculasService';
import financeiroService from '../services/financeiroService'; // Importar o serviço de financeiro
import { useToast } from '../context/ToastContext';

const useDetalhesMatriculaViewModel = () => {
    const { id } = useParams();
    const { showToast } = useToast();

    const [matricula, setMatricula] = useState(null);
    const [pagamentos, setPagamentos] = useState([]); // Novo estado para pagamentos
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Busca os dados em paralelo
            const [matriculaResponse, pagamentosResponse] = await Promise.all([
                matriculasService.getMatriculaById(id),
                financeiroService.getPagamentosByMatriculaId(id)
            ]);
            
            setMatricula(matriculaResponse.data);
            setPagamentos(pagamentosResponse.data);

        } catch (err) {
            setError(err);
            showToast('Erro ao carregar os detalhes da matrícula.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        matricula,
        pagamentos, // Exporta os pagamentos
        loading,
        error,
        refreshData: fetchData, // Renomeado para refletir que busca ambos
    };
};

export default useDetalhesMatriculaViewModel;
