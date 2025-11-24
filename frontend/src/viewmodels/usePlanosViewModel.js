import { useState, useEffect, useCallback } from 'react';
import planosService from '../services/planosService';
import { useToast } from '../context/ToastContext';

const usePlanosViewModel = () => {
    const [planos, setPlanos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchPlanos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await planosService.getAllPlanos();
            // Ensure response.data is an array before setting the state
            setPlanos(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(err);
            showToast('Erro ao buscar planos.', { type: 'error' });
            setPlanos([]); // Ensure planos is an array even on error
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchPlanos();
    }, [fetchPlanos]);

    const removePlano = async (id) => {
        try {
            await planosService.deletePlano(id);
            showToast('Plano excluído com sucesso.', { type: 'success' });
            fetchPlanos(); // Re-fetch data to update the list
        } catch (err) {
            setError(err);
            showToast('Erro ao excluir plano. Verifique se ele não está em uso.', { type: 'error' });
        }
    };

    return {
        planos,
        loading,
        error,
        removePlano,
    };
};

export default usePlanosViewModel;
