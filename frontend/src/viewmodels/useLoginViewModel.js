import { useState } from 'react';
import authService from '../services/authService';

const useLoginViewModel = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    'smart-input': '',
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
      const data = await authService.login(formData['smart-input'], formData.password);
      console.log('Login bem-sucedido:', data);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
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
