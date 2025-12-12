import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authService from "../services/authService";
import { useToast } from "../context/ToastContext";

const useRedefinirSenhaVIewModel = () => {
    //useParam para pegar oas parâmetros da rota definida no App.jsx (:uid e :token)
    const { token } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({ ...prev, [name]: value}))
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null)

        if(formData.newPassword !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if( formData.newPassword < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
        }
        setLoading(true);

        try {
            await authService.confirmPasswordReset(token, formData.newPassword);
            setSuccess(true);
            showToast('Senha redefinica com sucesso! Estamos te redirecionando...', 'success');

            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.detail || 
                                 err.response?.data?.token?.[0] || 
                                 err.response?.data?.new_password?.[0] ||
                                 'Erro ao redefinir senha. O link pode ter expirado.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }
    return {
        formData,
        handleChange, 
        handleSubmit,
        loading,
        error,
        success
    };

}

export default useRedefinirSenhaVIewModel;