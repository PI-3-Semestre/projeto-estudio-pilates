import { useState } from 'react';
import authService from '../services/authService';

const useAdminCadastroViewModel = () => {
  const [formData, setFormData] = useState({
    username: '',
    definir_nome_completo: '',
    email: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validação
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);

    try {
      // Prepara os dados para enviar, removendo o confirmPassword
      const { confirmPassword, ...userData } = formData;
      
      await authService.adminCreateUser(userData);
      
      setSuccess('Aluno criado com sucesso!');
      // Limpa o formulário
      setFormData({
        username: '',
        definir_nome_completo: '',
        email: '',
        cpf: '',
        password: '',
        confirmPassword: '',
      });

    } catch (err) {
      // Extrai a mensagem de erro da API, se possível
      const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setError(`Erro ao criar usuário: ${errorMessage}`);
      console.error('Erro no cadastro:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
  };
};

export default useAdminCadastroViewModel;
