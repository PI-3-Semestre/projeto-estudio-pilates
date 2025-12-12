import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHorarioTrabalho, getHorariosTrabalho } from '../services/horariosService';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

export const useCadastrarHorarioViewModel = () => {
    const [diaSemana, setDiaSemana] = useState('1'); // Default to Monday
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFim, setHoraFim] = useState('');
    const [selectedStudio, setSelectedStudio] = useState('');
    const [studios, setStudios] = useState([]);
    const [existingHorarios, setExistingHorarios] = useState([]);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studiosRes, horariosRes] = await Promise.all([
                    studiosService.getAllStudios(),
                    getHorariosTrabalho()
                ]);
                setStudios(studiosRes.data);
                setExistingHorarios(horariosRes.data);
            } catch (err) {
                showToast('Erro ao buscar dados iniciais.', { type: 'error' });
            }
        };
        fetchData();
    }, [showToast]);

    useEffect(() => {
        if (selectedStudio && diaSemana) {
            const duplicate = existingHorarios.some(h => 
                h.studio.toString() === selectedStudio && 
                h.dia_semana.toString() === diaSemana
            );
            setIsDuplicate(duplicate);
        } else {
            setIsDuplicate(false);
        }
    }, [selectedStudio, diaSemana, existingHorarios]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudio) {
            showToast('Por favor, selecione um estúdio.', { type: 'error' });
            return;
        }
        if (isDuplicate) {
            showToast('Já existe um horário para este estúdio neste dia.', { type: 'error' });
            return;
        }
        setLoading(true);
        setError(null);

        const data = {
            dia_semana: parseInt(diaSemana, 10),
            hora_inicio: horaInicio,
            hora_fim: horaFim,
            studio: selectedStudio,
        };

        try {
            await createHorarioTrabalho(data);
            showToast('Horário de trabalho criado com sucesso.', { type: 'success' });
            navigate('/horarios');
        } catch (err) {
            const errorMessage = err.response?.data?.non_field_errors?.[0] || 'Erro ao criar horário.';
            setError(err.response?.data || 'Erro ao criar horário.');
            showToast(errorMessage, { type: 'error' });
            setLoading(false);
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
        isDuplicate,
        loading,
        error,
        handleSubmit,
    };
};
