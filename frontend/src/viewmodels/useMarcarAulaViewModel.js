import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getModalidades } from '../services/modalidadesService';
import { getStudios } from '../services/studiosService';
import { getColaboradores } from '../services/colaboradoresService';

import { createAula } from '../services/aulasService';
import { formatISO } from 'date-fns';

const useMarcarAulaViewModel = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        data_hora_inicio: '',
        capacidade_maxima: 3,
        duracao_minutos: 60,
        tipo_aula: 'REGULAR',
        modalidade: '',
        studio: '',
        instrutor_principal: '',
        instrutor_substituto: null,
    });
    const [modalidades, setModalidades] = useState([]);
    const [studios, setStudios] = useState([]);
    const [instrutores, setInstrutores] = useState([]); // Estado para instrutores
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const allowedProfiles = ['ADMIN_MASTER', 'ADMINISTRADOR', 'RECEPCIONISTA'];
    const isStaff = user && user.perfis && user.perfis.some(profile =>
        allowedProfiles.includes(profile.toUpperCase().replace(' ', '_'))
    );

    const fetchInitialData = useCallback(async () => {
        if (!isStaff) {
            setError('Você não tem permissão para criar aulas.');
            setLoading(false);
            return;
        }
        try {
            // 1. Buscar modalidades, estúdios e todos os colaboradores
            const [modalidadesRes, studiosRes, colaboradoresRes] = await Promise.all([
                getModalidades(),
                getStudios(),
                getColaboradores(),
            ]);

            // 2. Filtrar colaboradores que têm o perfil de "INSTRUTOR" pelo nome
            const instrutoresFiltrados = colaboradoresRes.data.filter(colab =>
                colab.perfis.some(p => p.nome.toUpperCase() === 'INSTRUTOR')
            );
            
            setModalidades(modalidadesRes.data);
            setStudios(studiosRes.data);
            setInstrutores(instrutoresFiltrados); // Armazenar a lista de instrutores

            // Set default values if data is available
            if (modalidadesRes.data.length > 0) {
                setFormData(prev => ({ ...prev, modalidade: modalidadesRes.data[0].id }));
            }
            if (studiosRes.data.length > 0) {
                setFormData(prev => ({ ...prev, studio: studiosRes.data[0].id }));
            }
            if (instrutoresFiltrados.length > 0) {
                setFormData(prev => ({ ...prev, instrutor_principal: instrutoresFiltrados[0].usuario }));
            }

        } catch (err) {
            setError('Erro ao carregar dados iniciais para o formulário.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [isStaff]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? null : value,
        }));
    }, []);

    const handleDateTimeChange = useCallback((date, time) => {
        if (date && time) {
            const [year, month, day] = date.split('-').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            const dateTime = new Date(year, month - 1, day, hours, minutes);
            setFormData(prev => ({
                ...prev,
                data_hora_inicio: formatISO(dateTime),
            }));
        } else {
            setFormData(prev => ({ ...prev, data_hora_inicio: '' }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Ensure IDs are numbers
        const payload = {
            ...formData,
            modalidade: parseInt(formData.modalidade),
            studio: parseInt(formData.studio),
            instrutor_principal: parseInt(formData.instrutor_principal),
            capacidade_maxima: parseInt(formData.capacidade_maxima),
            duracao_minutos: parseInt(formData.duracao_minutos),
            instrutor_substituto: formData.instrutor_substituto ? parseInt(formData.instrutor_substituto) : null,
        };

        try {
            await createAula(payload);
            setSuccess(true);
            // Optionally navigate back or clear form
            navigate('/agenda'); // Go back to agenda after successful creation
        } catch (err) {
            setError('Erro ao criar aula. Verifique os dados e suas permissões.');
            console.error('Erro ao criar aula:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        modalidades,
        studios,
        instrutores, // Retornar a lista de instrutores
        loading,
        error,
        success,
        isStaff,
        handleChange,
        handleDateTimeChange,
        handleSubmit,
        navigate,
    };
};

export default useMarcarAulaViewModel;
