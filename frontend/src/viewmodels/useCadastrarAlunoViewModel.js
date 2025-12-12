import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const useCadastrarAlunoViewModel = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [studios, setStudios] = useState([]);
    const [formData, setFormData] = useState({
        dataNascimento: '',
        contato: '',
        profissao: '',
        unidade: '',
        is_active: true,
        foto: null,
        fotoPreview: null,
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [userResponse, studiosResponse] = await Promise.all([
                    api.get(`/usuarios/${userId}/`),
                    api.get('/studios/')
                ]);
                setUserInfo(userResponse.data);
                setStudios(studiosResponse.data);
                setFormData(prev => ({ ...prev, fotoPreview: userResponse.data.foto }));
            } catch (error) {
                setError('Falha ao carregar dados iniciais.');
                showToast('Erro ao carregar dados. Tente voltar e começar de novo.', { type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [userId, showToast]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'dataNascimento') {
            const onlyNums = value.replace(/\D/g, '');
            let formattedValue = onlyNums;

            if (onlyNums.length > 4) {
                formattedValue = `${onlyNums.slice(0, 2)}/${onlyNums.slice(2, 4)}/${onlyNums.slice(4, 8)}`;
            } else if (onlyNums.length > 2) {
                formattedValue = `${onlyNums.slice(0, 2)}/${onlyNums.slice(2)}`;
            }
            
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    foto: reader.result,
                    fotoPreview: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.unidade) {
            showToast('Por favor, selecione a unidade principal do aluno.', { type: 'error' });
            return;
        }

        setLoading(true);
        setError(null);

        // **CORREÇÕES APLICADAS AQUI**

        // 1. Formatar data
        let formattedDate = null;
        if (formData.dataNascimento && /^\d{2}\/\d{2}\/\d{4}$/.test(formData.dataNascimento)) {
            const [dia, mes, ano] = formData.dataNascimento.split('/');
            formattedDate = `${ano}-${mes}-${dia}`;
        } else if (formData.dataNascimento) {
            showToast('Formato de data inválido. Use DD/MM/AAAA.', { type: 'error' });
            setLoading(false);
            return;
        }

        // 2. Formatar telefone para padrão internacional
        const formattedPhone = formData.contato ? `+55${formData.contato.replace(/\D/g, '')}` : null;

        // 3. Formatar imagem base64 (remover prefixo)
        const base64Image = formData.foto ? formData.foto.split(',')[1] : null;

        const submissionData = {
            usuario: userId,
            is_active: formData.is_active,
            dataNascimento: formattedDate,
            contato: formattedPhone,
            profissao: formData.profissao || null,
            unidades: [formData.unidade],
            foto: base64Image,
        };

        try {
            await api.post('/alunos/', submissionData);
            showToast('Aluno cadastrado com sucesso!', { type: 'success' });
            setTimeout(() => navigate('/alunos'), 500);
        } catch (err) {
            const errorData = err.response?.data;
            let errorMessage = 'Ocorreu um erro desconhecido.';
            if (errorData) {
                // Transforma o objeto de erro em uma string legível
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value.join(', ')}`).join('; ');
            }
            setError(errorMessage);
            showToast(`Erro: ${errorMessage}`, { type: 'error' });
            console.error("Erro no cadastro do aluno:", errorData);
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
        handleChange,
        handleFileChange,
        handleSubmit,
    };
};

export default useCadastrarAlunoViewModel;
