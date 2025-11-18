import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHorarioTrabalhoById, updateHorarioTrabalho } from '../services/horariosService';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

export const useEditarHorarioViewModel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [diaSemana, setDiaSemana] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFim, setHoraFim] = useState('');
    const [selectedStudio, setSelectedStudio] = useState('');
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchHorarioEStudios = useCallback(async () => {
        try {
            setLoading(true);
            const [horarioRes, studiosRes] = await Promise.all([
                getHorarioTrabalhoById(id),
                studiosService.getAllStudios()
            ]);
            
            const { dia_semana, hora_inicio, hora_fim, studio } = horarioRes.data;
            setDiaSemana(dia_semana.toString());
            setHoraInicio(hora_inicio);
            setHoraFim(hora_fim);
            setSelectedStudio(studio);
            setStudios(studiosRes.data);

        } catch (err) {
            setError(err);
            showToast('Erro ao buscar dados.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchHorarioEStudios();
    }, [fetchHorarioEStudios]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudio) {
            showToast('Por favor, selecione um estúdio.', { type: 'error' });
            return;
        }
        setSaving(true);
        setError(null);

        const data = {
            dia_semana: parseInt(diaSemana, 10),
            hora_inicio: horaInicio,
            hora_fim: horaFim,
            studio: selectedStudio,
        };

        try {
            await updateHorarioTrabalho(id, data);
            showToast('Horário de trabalho salvo com sucesso.', { type: 'success' });
            navigate('/horarios');
        } catch (err) {
            setError(err.response?.data || 'Erro ao salvar horário.');
            showToast('Erro ao salvar horário de trabalho.', { type: 'error' });
            setSaving(false);
        }
    };

    return {
        diaSemana,
        setDiaSemana,
        horaInicio,
        setHoraInicio,
        horaFim,
        setHoraFim,
        selectedStudio,
        setSelectedStudio,
        studios,
        loading,
        saving,
        error,
        handleSubmit,
    };
};
