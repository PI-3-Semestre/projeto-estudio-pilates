import { useState, useEffect, useCallback } from 'react';
import { getBloqueiosAgenda, deleteBloqueioAgenda } from '../services/horariosService';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

export const useBloqueiosViewModel = () => {
    const [bloqueios, setBloqueios] = useState([]);
    const [filteredBloqueios, setFilteredBloqueios] = useState([]);
    const [studios, setStudios] = useState([]);
    const [studioFilter, setStudioFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [bloqueiosRes, studiosRes] = await Promise.all([
                getBloqueiosAgenda(),
                studiosService.getAllStudios()
            ]);
            setBloqueios(bloqueiosRes.data);
            setStudios(studiosRes.data);
        } catch (err) {
            setError(err);
            showToast('Erro ao buscar dados.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (studioFilter === 'all') {
            setFilteredBloqueios(bloqueios);
        } else {
            setFilteredBloqueios(bloqueios.filter(b => b.studio_id && b.studio_id.toString() === studioFilter));
        }
    }, [studioFilter, bloqueios]);

    const handleDeleteBloqueio = async (id) => {
        try {
            await deleteBloqueioAgenda(id);
            showToast('Bloqueio de agenda excluído com sucesso.', { type: 'success' });
            fetchData(); // Re-fetch all data
        } catch (err) {
            setError(err);
            showToast('Erro ao excluir bloqueio de agenda.', { type: 'error' });
        }
    };

    return {
        filteredBloqueios,
        studios,
        studioFilter,
        setStudioFilter,
        loading,
        error,
        handleDeleteBloqueio,
    };
};
