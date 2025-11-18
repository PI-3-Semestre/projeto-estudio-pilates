import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBloqueioAgenda, getBloqueiosAgenda } from '../services/horariosService';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

export const useCadastrarBloqueioViewModel = () => {
    const [data, setData] = useState('');
    const [descricao, setDescricao] = useState('');
    const [selectedStudio, setSelectedStudio] = useState('');
    const [studios, setStudios] = useState([]);
    const [existingBloqueios, setExistingBloqueios] = useState([]);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studiosRes, bloqueiosRes] = await Promise.all([
                    studiosService.getAllStudios(),
                    getBloqueiosAgenda()
                ]);
                setStudios(studiosRes.data);
                setExistingBloqueios(bloqueiosRes.data);
            } catch (err) {
                showToast('Erro ao buscar dados iniciais.', { type: 'error' });
            }
        };
        fetchData();
    }, [showToast]);

    useEffect(() => {
        if (selectedStudio && data) {
            const duplicate = existingBloqueios.some(b => 
                b.studio_id && b.studio_id.toString() === selectedStudio && 
                b.data === data
            );
            setIsDuplicate(duplicate);
        } else {
            setIsDuplicate(false);
        }
    }, [selectedStudio, data, existingBloqueios]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudio) {
            showToast('Por favor, selecione um estúdio.', { type: 'error' });
            return;
        }
        if (isDuplicate) {
            showToast('Já existe um bloqueio para este estúdio nesta data.', { type: 'error' });
            return;
        }
        setLoading(true);
        setError(null);

        const payload = {
            data,
            descricao,
            studio: selectedStudio,
        };

        try {
            await createBloqueioAgenda(payload);
            showToast('Bloqueio de agenda criado com sucesso.', { type: 'success' });
            navigate('/bloqueios');
        } catch (err) {
            const errorMessage = err.response?.data?.non_field_errors?.[0] || 'Erro ao criar bloqueio.';
            setError(err.response?.data || 'Erro ao criar bloqueio.');
            showToast(errorMessage, { type: 'error' });
            setLoading(false);
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
        isDuplicate,
        loading,
        error,
        handleSubmit,
    };
};
