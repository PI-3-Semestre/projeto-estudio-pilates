import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

// Função de validação de CPF
const validateCPF = (cpf) => {
    const cleanedCpf = cpf.replace(/[^\d]/g, ''); // Remove non-digits

    if (cleanedCpf.length !== 11 || /^(\d)\1+$/.test(cleanedCpf)) {
        return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cleanedCpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    if (remainder !== parseInt(cleanedCpf.substring(9, 10))) {
        return false;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cleanedCpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    if (remainder !== parseInt(cleanedCpf.substring(10, 11))) {
        return false;
    }

    return true;
};


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
    const location = useLocation();
    const { userType } = location.state || { userType: 'aluno' }; // Default to 'aluno' if not provided

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const cleanedCpf = formData.cpf.replace(/[^\d]/g, '');

        if (!validateCPF(formData.cpf)) {
            setError({ form: 'CPF inválido. Por favor, verifique o número digitado.' });
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/usuarios/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                cpf: cleanedCpf,
                definir_nome_completo: formData.nome_completo,
            });
            const userId = response.data.id;
            if (userType === 'aluno') {
                navigate(`/alunos/cadastrar-perfil/${userId}`);
            } else {
                navigate(`/colaboradores/cadastrar-perfil/${userId}`);
            }
        } catch (err) {
            setError(err.response?.data || { form: 'Ocorreu um erro desconhecido.' });
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        error,
        userType,
        handleChange,
        handleSubmit,
    };
};

export default useCadastrarUsuarioViewModel;
