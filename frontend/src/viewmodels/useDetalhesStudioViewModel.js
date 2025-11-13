import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

const useDetalhesStudioViewModel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudio = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studiosService.getStudioById(id);
      setStudio(response.data);
    } catch (err) {
      showToast('Falha ao carregar os detalhes do studio.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchStudio();
  }, [fetchStudio]);

  const handleDelete = async () => {
    try {
      await studiosService.deleteStudio(id);
      showToast('Studio excluído com sucesso!', 'success');
      navigate('/studios');
    } catch (err) {
      showToast('Falha ao excluir o studio. Tente novamente.', 'error');
      console.error(err);
    }
  };

  return {
    studio,
    loading,
    handleDelete,
  };
};

export default useDetalhesStudioViewModel;
