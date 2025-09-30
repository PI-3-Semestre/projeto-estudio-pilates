import { useState } from 'react';
import authService from '../services/authService';

const useLoginViewModel = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(formData.username, formData.password);
      console.log('Login bem-sucedido:', data);
      // Aqui você pode redirecionar o usuário ou salvar o token
      // Ex: localStorage.setItem('accessToken', data.access);
    } catch (err) {
      setError(err.message);
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit,
  };
};

export default useLoginViewModel;
