import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const useDetalhesUsuarioViewModel = (cpf) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchUsuario = async () => {
            if (!cpf) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/usuarios/');
                const foundUser = response.data.find((user) => user.cpf === cpf);
                if (foundUser) {
                    setUsuario(foundUser);
                } else {
                    setError(new Error('Usuário não encontrado'));
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsuario();
    }, [cpf]);

    const handleDelete = async (userId) => {
        try {
            await api.delete(`/usuarios/${userId}/`);
            showToast('Usuário deletado com sucesso!');
            navigate('/usuarios');
        } catch (err) {
            setError(err);
            showToast('Erro ao deletar usuário.', 'error');
        }
    };

    return {
        usuario,
        loading,
        error,
        handleDelete,
    };
};

export default useDetalhesUsuarioViewModel;
