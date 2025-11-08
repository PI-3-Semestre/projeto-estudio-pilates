import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const useDetalhesAlunoViewModel = () => {
  const { cpf } = useParams();
  const [aluno, setAluno] = useState(null);
  const [studioNames, setStudioNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return { aluno, studioNames, loading, error };
};

export default useDetalhesAlunoViewModel;

