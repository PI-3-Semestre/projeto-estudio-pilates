
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const useCadastrarColaboradorViewModel = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
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
            try {
                const [userResponse, studiosResponse, perfisResponse] = await Promise.all([
                    api.get(`/usuarios/${userId}/`),
                    api.get('/studios/'),
                    // Assuming you have an endpoint to fetch profiles
                    // If not, you might need to hardcode them or create an endpoint
                    // For now, I'll simulate it.
                    Promise.resolve({ data: [
                        { id: 1, nome: 'ADMIN_MASTER' },
                        { id: 2, nome: 'ADMINISTRADOR' },
                        { id: 3, nome: 'RECEPCIONISTA' },
                        { id: 4, nome: 'FISIOTERAPEUTA' },
                        { id: 5, nome: 'INSTRUTOR' },
                    ]})
                ]);
                setUserInfo(userResponse.data);
                setStudios(studiosResponse.data);
                setPerfis(perfisResponse.data);
            } catch (error) {
                setError('Falha ao carregar dados.');
            }
        };
        fetchInitialData();
    }, [userId]);

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
            vinculo.permissao_ids.splice(permissaoIndex, 1); // Remove permissão
        } else {
            vinculo.permissao_ids.push(permissaoId); // Adiciona permissão
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
            await api.post('/colaboradores/', payload);
            navigate('/colaboradores'); // Or wherever you want to redirect after success
        } catch (err) {
            setError(err.response?.data || err.message);
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
