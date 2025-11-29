import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import colaboradoresService from '../services/colaboradoresService'; // Importando o serviço
import { useToast } from '../context/ToastContext';

const useCadastrarColaboradorViewModel = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [studios, setStudios] = useState([]);
    const [perfis, setPerfis] = useState([]);
    const [formData, setFormData] = useState({
        perfis: [],
        registro_profissional: '',
        data_nascimento: '',
        telefone: '',
        data_admissao: '',
        status: 'ATIVO',
        endereco: {
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
        },
        vinculos_studio: [{ studio_id: '', permissao_ids: [] }]
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [userResponse, studiosResponse, perfisResponse] = await Promise.all([
                    api.get(`/usuarios/${userId}/`),
                    api.get('/studios/'),
                    colaboradoresService.getPerfis(), // Usando a função do serviço
                ]);
                setUserInfo(userResponse.data);
                setStudios(studiosResponse.data);
                setPerfis(perfisResponse.data);
            } catch (error) {
                setError('Falha ao carregar dados.');
                showToast('Erro ao carregar dados iniciais.', { type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [userId, showToast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEnderecoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            endereco: { ...prev.endereco, [name]: value }
        }));
    };

    const handlePerfilChange = (e) => {
        const { value, checked } = e.target;
        const perfilId = parseInt(value);
        setFormData(prev => {
            const newPerfis = checked
                ? [...prev.perfis, perfilId]
                : prev.perfis.filter(id => id !== perfilId);
            return { ...prev, perfis: newPerfis };
        });
    };

    const handleVinculoChange = (index, field, value) => {
        const newVinculos = [...formData.vinculos_studio];
        newVinculos[index][field] = value;
        setFormData(prev => ({ ...prev, vinculos_studio: newVinculos }));
    };
    
    const handleVinculoPermissaoChange = (vinculoIndex, permissaoId) => {
        const newVinculos = [...formData.vinculos_studio];
        const vinculo = newVinculos[vinculoIndex];
        const permissaoIndex = vinculo.permissao_ids.indexOf(permissaoId);
    
        if (permissaoIndex > -1) {
            vinculo.permissao_ids.splice(permissaoIndex, 1);
        } else {
            vinculo.permissao_ids.push(permissaoId);
        }
    
        setFormData(prev => ({ ...prev, vinculos_studio: newVinculos }));
    };

    const addVinculo = () => {
        setFormData(prev => ({
            ...prev,
            vinculos_studio: [...prev.vinculos_studio, { studio_id: '', permissao_ids: [] }]
        }));
    };

    const removeVinculo = (index) => {
        const newVinculos = formData.vinculos_studio.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, vinculos_studio: newVinculos }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            ...formData,
            usuario: userId,
        };

        try {
            // Usando a função do serviço
            await colaboradoresService.createColaborador(payload);
            showToast('Colaborador cadastrado com sucesso!', { type: 'success' });
            navigate('/colaboradores');
        } catch (err) {
            const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : 'Ocorreu um erro desconhecido.';
            setError(errorMessage);
            showToast(`Erro ao cadastrar colaborador: ${errorMessage}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return {
        userInfo,
        formData,
        loading,
        error,
        studios,
        perfis,
        handleChange,
        handleEnderecoChange,
        handlePerfilChange,
        handleVinculoChange,
        handleVinculoPermissaoChange,
        addVinculo,
        removeVinculo,
        handleSubmit,
    };
};

export default useCadastrarColaboradorViewModel;
