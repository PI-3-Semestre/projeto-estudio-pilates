import { useState } from 'react';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';

const useEsqueceuSenhaViewModel = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
      showToast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
    } catch (err) {
      console.error(err);
      // O backend geralmente retorna erro 400 se o e-mail não existir ou for inválido
      const msg = err.response?.data?.email?.[0] || 'Erro ao solicitar recuperação. Verifique o e-mail.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    success,
    handleSubmit,
  };
};

export default useEsqueceuSenhaViewModel;