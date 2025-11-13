import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

const useCadastrarStudioViewModel = () => {
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleNomeChange = (e) => {
    setNome(e.target.value);
  };

  const handleEnderecoChange = (e) => {
    setEndereco(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !endereco) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await studiosService.createStudio({ nome, endereco });
      showToast('Studio cadastrado com sucesso!', 'success');
      navigate('/studios'); // Redireciona para a lista de studios
    } catch (err) {
      showToast('Falha ao cadastrar o studio. Tente novamente.', 'error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nome,
    endereco,
    isLoading,
    handleNomeChange,
    handleEnderecoChange,
    handleSubmit,
  };
};

export default useCadastrarStudioViewModel;
