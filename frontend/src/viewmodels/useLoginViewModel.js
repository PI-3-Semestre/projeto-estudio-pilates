import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const useLoginViewModel = () => {
  const [emailCpf, setEmailCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <-- Novo estado

  const { login: contextLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(emailCpf, password);
      contextLogin(data.user, data.access, data.refresh);
    } catch (err) {
      setError(err.message);
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  // <-- Nova função
  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return {
    emailCpf,
    setEmailCpf,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
    showPassword, // <-- Exporta o estado
    toggleShowPassword, // <-- Exporta a função
  };
};

export default useLoginViewModel;
