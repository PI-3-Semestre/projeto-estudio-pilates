import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const useEditarUsuarioViewModel = (userId) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        cpf: '',
        is_active: true,
        definir_nome_completo: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                // A API não tem um GET /usuarios/{id}, então buscamos na lista
                const response = await api.get('/usuarios/');
                const user = response.data.find(u => u.id.toString() === userId);
                if (user) {
                    setFormData({
                        username: user.username,
                        email: user.email,
                        password: '', // Senha não é retornada, então deixamos em branco
                        cpf: user.cpf,
                        is_active: user.is_active,
                        definir_nome_completo: user.nome_completo,
                    });
                } else {
                    setError({ detail: 'Usuário não encontrado.' });
                }
            } catch (err) {
                setError(err.response?.data || { detail: 'Erro ao carregar dados do usuário.' });
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUsuario();
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Cria um objeto apenas com os campos que serão enviados
        const payload = {
            username: formData.username,
            email: formData.email,
            cpf: formData.cpf,
            is_active: formData.is_active,
            definir_nome_completo: formData.definir_nome_completo,
        };

        // Adiciona a senha ao payload apenas se ela foi preenchida
        if (formData.password) {
            payload.password = formData.password;
        }

        try {
            await api.patch(`/usuarios/${userId}/`, payload);
            showToast('Usuário atualizado com sucesso!');
            navigate(`/usuarios/detalhes/${formData.cpf}`);
        } catch (err) {
            setError(err.response?.data || { detail: 'Ocorreu um erro desconhecido.' });
            showToast('Erro ao atualizar usuário.', 'error');
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

export default useEditarUsuarioViewModel;
