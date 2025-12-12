import { useState, useEffect, useCallback } from 'react';
import { getHorariosTrabalho, deleteHorarioTrabalho } from '../services/horariosService';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

const diaSemanaMap = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
};

export const useHorariosViewModel = () => {
    const [horariosTrabalho, setHorariosTrabalho] = useState([]);
    const [filteredHorarios, setFilteredHorarios] = useState([]);
    const [studios, setStudios] = useState([]);
    const [studioFilter, setStudioFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [horariosRes, studiosRes] = await Promise.all([
                getHorariosTrabalho(),
                studiosService.getAllStudios()
            ]);
            setHorariosTrabalho(horariosRes.data.sort((a, b) => a.dia_semana - b.dia_semana));
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
            setFilteredHorarios(horariosTrabalho);
        } else {
            setFilteredHorarios(horariosTrabalho.filter(h => h.studio && h.studio.toString() === studioFilter));
        }
    }, [studioFilter, horariosTrabalho]);

    const handleDeleteHorario = async (id) => {
        try {
            await deleteHorarioTrabalho(id);
            showToast('Horário de trabalho excluído com sucesso.', { type: 'success' });
            fetchData(); // Refresh data
        } catch (err) {
            setError(err);
            showToast('Erro ao excluir horário de trabalho.', { type: 'error' });
        }
    };

    const getDiaSemanaText = (dia) => diaSemanaMap[dia] || 'Dia inválido';

    return {
        filteredHorarios,
        studios,
        studioFilter,
        setStudioFilter,
        loading,
        error,
        handleDeleteHorario,
        getDiaSemanaText
    };
};
