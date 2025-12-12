import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

const useLoginViewModel = () => {
  const [emailCpf, setEmailCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login: contextLogin } = useAuth();
  const navigate = useNavigate(); // Inicializar useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(emailCpf, password);
      console.log('Dados recebidos do backend:', data);

      // Extrair user_type e user do objeto de dados
      const { access, refresh, user, user_type } = data;

      // Chamar contextLogin com user_type
      contextLogin(user, access, refresh, user_type);

      // Lógica de Redirecionamento
      switch (user_type) {
        case 'aluno':
          if (user.unidades && user.unidades.length > 1) {
            navigate('/aluno/selecionar-studio');
          } else if (user.unidades && user.unidades.length === 1) {
            navigate(`/aluno/dashboard/${user.unidades[0].id}`);
          } else {
            navigate('/aluno/dashboard'); // Fallback, caso não haja unidades (improvável)
          }
          break;
        case 'admin_master':
          navigate('/admin-master/dashboard');
          break;
        case 'administrador':
          navigate('/administrador/painel');
          break;
        case 'recepcionista':
          navigate('/recepcionista/atendimento');
          break;
        // Adicione outros tipos de colaborador conforme necessário
        default:
          navigate('/dashboard-generico'); // Página padrão ou de erro para tipos não mapeados
          break;
      }

    } catch (err) {
      setError(err.message);
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

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
    showPassword,
    toggleShowPassword,
  };
};

export default useLoginViewModel;
