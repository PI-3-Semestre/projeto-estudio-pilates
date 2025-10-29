import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const useCadastrarUsuarioViewModel = () => {
    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        username: '',
        cpf: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/usuarios/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                cpf: formData.cpf,
                definir_nome_completo: formData.nome_completo,
            });
            const userId = response.data.id;
            navigate(`/alunos/cadastrar-perfil/${userId}`);
        } catch (err) {
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        error,
        handleChange,
        handleSubmit,
    };
};

export default useCadastrarUsuarioViewModel;
