import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';

const useAdminCadastroViewModel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  // Pega o userType do estado da rota, com 'aluno' como padrão
  const userType = location.state?.userType || 'aluno';

  const [formData, setFormData] = useState({
    username: '',
    definir_nome_completo: '',
    email: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    user_type: userType,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Atualiza o user_type no formulário se o estado da rota mudar
  useEffect(() => {
    setFormData(prev => ({ ...prev, user_type: userType }));
  }, [userType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não conferem.');
      showToast('As senhas não conferem.', { type: 'error' });
      return;
    }
    
    if (!formData.username || !formData.email || !formData.cpf || !formData.password) {
        showToast('Por favor, preencha todos os campos obrigatórios.', { type: 'error' });
        return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmCreation = async () => {
    setLoading(true);
    setIsModalOpen(false);

    try {
      const { confirmPassword, ...userData } = formData;
      const response = await authService.adminCreateUser(userData);
      const newUserId = response.id;

      showToast('Usuário criado! Agora complete o perfil.', { type: 'success' });

      // Redireciona para a rota correta da Fase 2
      if (userType === 'colaborador') {
        navigate(`/colaboradores/completar-perfil/${newUserId}`);
      } else {
        navigate(`/alunos/completar-perfil/${newUserId}`);
      }

    } catch (err) {
      const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : 'Ocorreu um erro desconhecido.';
      setError(`Erro ao criar usuário: ${errorMessage}`);
      showToast(`Erro: ${errorMessage}`, { type: 'error' });
      console.error('Erro no cadastro:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    isModalOpen,
    setIsModalOpen,
    handleChange,
    handleSubmit,
    handleConfirmCreation,
    userType, // Exporta para a view poder customizar textos
  };
};

export default useAdminCadastroViewModel;
