import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import matriculasService from '../services/matriculasService';
import { useToast } from '../context/ToastContext';

const useEditarMatriculaViewModel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [matricula, setMatricula] = useState(null);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchMatricula = useCallback(async () => {
        setLoading(true);
        try {
            const response = await matriculasService.getMatriculaById(id);
            setMatricula(response.data);
            setDataInicio(response.data.data_inicio);
            setDataFim(response.data.data_fim);
        } catch (error) {
            showToast('Erro ao carregar os dados da matrícula.', { type: 'error' });
            navigate('/matriculas'); // Volta para a lista se não encontrar a matrícula
        } finally {
            setLoading(false);
        }
    }, [id, navigate, showToast]);

    useEffect(() => {
        fetchMatricula();
    }, [fetchMatricula]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const updatedData = {
            data_inicio: dataInicio,
            data_fim: dataFim,
        };

        try {
            await matriculasService.updateMatricula(id, updatedData);
            showToast('Matrícula atualizada com sucesso!', { type: 'success' });
            navigate(`/matriculas/${id}`); // Volta para a tela de detalhes
        } catch (error) {
            showToast('Erro ao atualizar a matrícula.', { type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        matricula,
        dataInicio,
        setDataInicio,
        dataFim,
        setDataFim,
        loading,
        submitting,
        handleSubmit,
    };
};

export default useEditarMatriculaViewModel;
