import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const useCadastrarAlunoViewModel = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [studios, setStudios] = useState([]); // New state for studios
    const [formData, setFormData] = useState({
        dataNascimento: '',
        contato: '',
        profissao: '',
        unidade: '',
        is_active: true,
        foto: null, // New field for the photo
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get(`/usuarios/${userId}/`);
                setUserInfo(response.data);
            } catch (error) {
                setError('Falha ao carregar dados do usuário.');
            }
        };
        fetchUserData();
    }, [userId]);

    // New useEffect to fetch studios
    useEffect(() => {
        const fetchStudios = async () => {
            try {
                const response = await api.get('/studios/');
                setStudios(response.data);
            } catch (error) {
                console.error("Failed to fetch studios", error);
            }
        };
        fetchStudios();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // New handler for file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, foto: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/alunosalunos/', {
                usuario: userId,
                dataNascimento: formData.dataNascimento,
                contato: formData.contato,
                profissao: formData.profissao,
                unidades: [formData.unidade],
                is_active: formData.is_active,
                foto: formData.foto, // Send the photo
            });
            navigate('/alunos');
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
        studios, // Expose studios
        handleChange,
        handleFileChange, // Expose file handler
        handleSubmit,
    };
};

export default useCadastrarAlunoViewModel;