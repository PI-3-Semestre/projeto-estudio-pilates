import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import matriculasService from '../services/matriculasService';
import { useToast } from '../context/ToastContext';

const useDetalhesAlunoViewModel = () => {
  const { cpf } = useParams();
  const navigate = useNavigate();
  const [aluno, setAluno] = useState(null);
  const [matriculas, setMatriculas] = useState([]);
  const [studioNames, setStudioNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  console.log("[DEBUG] CPF recebido da URL:", cpf); // LOG 0

  const formatPhotoUrl = (foto) => {
    if (!foto) return '';
    if (foto.startsWith('http') || foto.startsWith('data:')) {
      return foto;
    }
    return `data:image/jpeg;base64,${foto}`;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const alunoResponse = await api.get(`/alunos/${cpf}`);
      const alunoData = alunoResponse.data;
      setAluno(alunoData);

      if (alunoData.usuario_id) {
        console.log(`[DEBUG] Buscando matrículas para o aluno ID: ${alunoData.usuario_id}`);
        const matriculasResponse = await matriculasService.getMatriculasByAlunoId(alunoData.usuario_id);
        console.log("[DEBUG] Resposta da API de matrículas:", matriculasResponse.data);
        setMatriculas(matriculasResponse.data);
      }

      if (alunoData.unidades && alunoData.unidades.length > 0) {
        const names = await Promise.all(
          alunoData.unidades.map(async (studioId) => {
            const studioResponse = await api.get(`/studios/${studioId}/`);
            return studioResponse.data.nome;
          })
        );
        setStudioNames(names);
      }
    } catch (err) {
      console.error("[ERRO EM DETALHES DO ALUNO] Detalhes do erro:", err.response || err); // LOG DETALHADO
      setError(err);
      showToast('Erro ao carregar os detalhes do aluno.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [cpf, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return { aluno, matriculas, studioNames, loading, error, handleDelete, formatPhotoUrl };
};

export default useDetalhesAlunoViewModel;
