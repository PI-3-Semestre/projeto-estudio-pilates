import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

const useEditarStudioViewModel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchStudio = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studiosService.getStudioById(id);
      setNome(response.data.nome);
      setEndereco(response.data.endereco);
    } catch (err) {
      showToast('Falha ao carregar os dados do studio.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchStudio();
  }, [fetchStudio]);

  const handleNomeChange = (e) => setNome(e.target.value);
  const handleEnderecoChange = (e) => setEndereco(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !endereco) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    setSaving(true);
    try {
      await studiosService.updateStudio(id, { nome, endereco });
      showToast('Studio atualizado com sucesso!', 'success');
      navigate(`/studios/${id}`); // Redirect to details page after saving
    } catch (err) {
      showToast('Falha ao atualizar o studio. Tente novamente.', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return {
    nome,
    endereco,
    loading,
    saving,
    handleNomeChange,
    handleEnderecoChange,
    handleSubmit,
  };
};

export default useEditarStudioViewModel;
