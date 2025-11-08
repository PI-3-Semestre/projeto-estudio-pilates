// frontend/src/viewmodels/useDetalhesAlunoViewModel.js
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getUsuario, getAlunoPorCpf } from '../services/api';

const useDetalhesAlunoViewModel = () => {
  const { cpf } = useParams(); // O CPF do aluno da URL
  const [aluno, setAluno] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarDados = useCallback(async () => {
    if (!cpf) {
      setError(new Error("CPF não fornecido na URL."));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAluno(null);
      setUsuario(null);

      // 1. Buscar o aluno pelo CPF
      const alunoResponse = await getAlunoPorCpf(cpf);
      let alunoData = alunoResponse.data;

      // Se a API retorna uma lista, pegue o primeiro. Se for um objeto, use-o.
      if (Array.isArray(alunoData)) {
        alunoData = alunoData.length > 0 ? alunoData[0] : null;
      }

      if (alunoData) {
        setAluno(alunoData);
        if (alunoData.usuario) {
          try {
            const usuarioResponse = await getUsuario(alunoData.usuario);
            setUsuario(usuarioResponse.data);
          } catch (userError) {
            console.error("Erro ao buscar dados do usuário:", userError);
            setUsuario(null);
          }
        } else {
          setUsuario(null);
        }
      } else {
        setError(new Error('Aluno não encontrado com o CPF fornecido.'));
      }

    } catch (err) {
      console.error("Erro ao carregar dados do aluno:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [cpf]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const formatarData = (data) => {
    if (!data) return 'Não informado';
    // Adiciona uma verificação para garantir que a data não seja apenas um horário
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
      return "Data inválida";
    }
    // Adiciona o fuso horário para evitar problemas de um dia a menos
    return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return {
    aluno,
    usuario,
    loading,
    error,
    formatarData,
  };
};

export default useDetalhesAlunoViewModel;