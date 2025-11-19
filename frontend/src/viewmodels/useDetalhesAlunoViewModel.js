import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const useDetalhesAlunoViewModel = () => {
  const { cpf } = useParams();
  const navigate = useNavigate();
  const [aluno, setAluno] = useState(null);
  const [studioNames, setStudioNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Helper function to format photo URL for display
  const formatPhotoUrl = (foto) => {
    if (!foto) return '';
    // If it's already a full URL or data URL, return as is
    if (foto.startsWith('http') || foto.startsWith('data:')) {
      return foto;
    }
    // If it's base64, format as data URL
    return `data:image/jpeg;base64,${foto}`;
  };

  useEffect(() => {
    const fetchAluno = async () => {
      try {
        const response = await api.get(`/alunos/${cpf}`);
        setAluno(response.data);
        if (response.data.unidades && response.data.unidades.length > 0) {
          const names = await Promise.all(
            response.data.unidades.map(async (studioId) => {
              const studioResponse = await api.get(`/studios/${studioId}/`);
              return studioResponse.data.nome;
            })
          );
          setStudioNames(names);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAluno();
  }, [cpf]);

  const handleDelete = async () => {
    try {
      await api.delete(`/alunos/${cpf}/`);
      showToast('Aluno deletado com sucesso!', 'success');
      navigate('/alunos');
    } catch (err) {
      showToast('Erro ao deletar aluno.', 'error');
      setError(err);
      console.error("Failed to delete student:", err);
    }
  };

  return { aluno, studioNames, loading, error, handleDelete, formatPhotoUrl };
};

export default useDetalhesAlunoViewModel;
