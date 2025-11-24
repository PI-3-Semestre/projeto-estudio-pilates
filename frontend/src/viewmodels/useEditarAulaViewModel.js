import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const useEditarAulaViewModel = (aulaId, initialData, onSuccess) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalidades, setModalidades] = useState([]);
    const [studios, setStudios] = useState([]);
    const [instrutores, setInstrutores] = useState([]);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        data_hora_inicio: '',
        capacidade_maxima: '',
        duracao_minutos: '',
        tipo_aula: 'REGULAR',
        modalidade: '',
        studio: '',
        instrutor_principal: '',
        instrutor_substituto: '',
    });

    useEffect(() => {
        // Carregar dados necessários (modalidades, studios, instrutores)
        const loadData = async () => {
            setLoading(true);
            try {
                const [modalidadesRes, studiosRes, instrutoresRes, usuariosRes] = await Promise.all([
                    api.get('/agendamentos/modalidades/'),
                    api.get('/studios/'),
                    api.get('/colaboradores/'),
                    api.get('/usuarios/'),
                ]);

                setModalidades(modalidadesRes.data);
                setStudios(studiosRes.data);

                // Filtrar apenas instrutores (mesmo filtro do marcar aula)
                const instrutoresFiltrados = instrutoresRes.data.filter(colab =>
                    colab.perfis.some(p => p.nome.toUpperCase() === 'INSTRUTOR')
                );

                // Combinar instrutores filtrados com dados de usuários
                const instrutoresComUsuarios = instrutoresFiltrados.map(colaborador => ({
                    ...colaborador,
                    usuario: usuariosRes.data.find(user => user.id === colaborador.usuario) || { nome_completo: 'Usuário não encontrado' }
                }));

                setInstrutores(instrutoresComUsuarios);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                showToast('Erro ao carregar dados necessários.', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [showToast]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                data_hora_inicio: initialData.data_hora_inicio ? new Date(initialData.data_hora_inicio).toISOString().slice(0, 16) : '',
                capacidade_maxima: initialData.capacidade_maxima || '',
                duracao_minutos: initialData.duracao_minutos || '',
                tipo_aula: initialData.tipo_aula || 'REGULAR',
                modalidade: initialData.modalidade?.id || initialData.modalidade || '',
                studio: initialData.studio?.id || initialData.studio || '',
                instrutor_principal: initialData.instrutor_principal?.id || initialData.instrutor_principal || '',
                instrutor_substituto: initialData.instrutor_substituto?.id || initialData.instrutor_substituto || '',
            });
        }
    }, [initialData]);

    const openModal = async () => {
        setIsOpen(true);
        setLoading(true);

        try {
            // Buscar dados necessários em paralelo
            const [modalidadesRes, studiosRes, instrutoresRes, usuariosRes] = await Promise.all([
                api.get('/agendamentos/modalidades/'),
                api.get('/studios/'),
                api.get('/colaboradores/'),
                api.get('/usuarios/'),
            ]);

            setModalidades(modalidadesRes.data);
            setStudios(studiosRes.data);

            // Filtrar apenas instrutores (mesmo filtro do marcar aula)
            const instrutoresFiltrados = instrutoresRes.data.filter(colab =>
                colab.perfis.some(p => p.nome.toUpperCase() === 'INSTRUTOR')
            );

            // Combinar instrutores filtrados com dados de usuários
            const instrutoresComUsuarios = instrutoresFiltrados.map(colaborador => ({
                ...colaborador,
                usuario: usuariosRes.data.find(user => user.id === colaborador.usuario) || { nome_completo: 'Usuário não encontrado' }
            }));

            setInstrutores(instrutoresComUsuarios);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast('Erro ao carregar dados necessários.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsOpen(false);
        setFormData({
            data_hora_inicio: '',
            capacidade_maxima: '',
            duracao_minutos: '',
            tipo_aula: 'REGULAR',
            modalidade: '',
            studio: '',
            instrutor_principal: '',
            instrutor_substituto: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updateData = {
                data_hora_inicio: formData.data_hora_inicio,
                capacidade_maxima: parseInt(formData.capacidade_maxima),
                duracao_minutos: parseInt(formData.duracao_minutos),
                tipo_aula: formData.tipo_aula,
                modalidade: parseInt(formData.modalidade),
                studio: parseInt(formData.studio),
                instrutor_principal: parseInt(formData.instrutor_principal),
                instrutor_substituto: formData.instrutor_substituto ? parseInt(formData.instrutor_substituto) : null,
            };

            await api.patch(`/agendamentos/aulas/${aulaId}/`, updateData);

            showToast('Aula atualizada com sucesso!', 'success');
            closeModal();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Erro ao salvar aula:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Erro ao salvar aula.';
            if (typeof errorMessage === 'object') {
                Object.entries(errorMessage).forEach(([key, value]) => {
                    showToast(`${key}: ${value}`, 'error');
                });
            } else {
                showToast(errorMessage, 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    return {
        isOpen,
        loading,
        saving,
        modalidades,
        studios,
        instrutores,
        formData,
        openModal,
        closeModal,
        handleChange,
        handleSubmit,
    };
};

export default useEditarAulaViewModel;
