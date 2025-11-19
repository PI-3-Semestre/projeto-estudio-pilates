import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBloqueioAgendaById, updateBloqueioAgenda } from '../services/horariosService';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

export const useEditarBloqueioViewModel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [data, setData] = useState('');
    const [descricao, setDescricao] = useState('');
    const [selectedStudio, setSelectedStudio] = useState('');
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchBloqueioEStudios = useCallback(async () => {
        try {
            setLoading(true);
            const [bloqueioRes, studiosRes] = await Promise.all([
                getBloqueioAgendaById(id),
                studiosService.getAllStudios()
            ]);

            const { data, descricao, studio_id } = bloqueioRes.data;
            setData(data);
            setDescricao(descricao);
            setSelectedStudio(studio_id);
            setStudios(studiosRes.data);

        } catch (err) {
            setError(err);
            showToast('Erro ao buscar dados.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchBloqueioEStudios();
    }, [fetchBloqueioEStudios]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudio) {
            showToast('Por favor, selecione um estúdio.', { type: 'error' });
            return;
        }
        setSaving(true);
        setError(null);

        const payload = {
            data,
            descricao,
            studio: selectedStudio,
        };

        try {
            await updateBloqueioAgenda(id, payload);
            showToast('Bloqueio de agenda salvo com sucesso.', { type: 'success' });
            navigate('/bloqueios');
        } catch (err) {
            setError(err.response?.data || 'Erro ao salvar bloqueio.');
            showToast('Erro ao salvar bloqueio de agenda.', { type: 'error' });
            setSaving(false);
        }
    };

    return {
        data,
        setData,
        descricao,
        setDescricao,
        selectedStudio,
        setSelectedStudio,
        studios,
        loading,
        saving,
        error,
        handleSubmit,
    };
};
