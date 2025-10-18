import { useState } from 'react';
import authService from '../services/authService';

const useCadastroViewModel = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    definir_nome_completo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não conferem');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.cpf,
        formData.definir_nome_completo
      );
      console.log('Cadastro bem-sucedido:', data);
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err) {
      setError(err.message);
      console.error('Erro no cadastro:', err);
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

export default useCadastroViewModel;
