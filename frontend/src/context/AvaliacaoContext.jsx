import React, { createContext, useState, useContext, useCallback } from 'react';
import * as avaliacoesService from '../services/avaliacoesService';

const AvaliacaoContext = createContext();

export const AvaliacaoProvider = ({ children }) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // **ATUALIZADO** para usar o ID do aluno
  const fetchAvaliacoes = useCallback(async (alunoId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await avaliacoesService.getAvaliacoesByAlunoId(alunoId);
      setAvaliacoes(response.data);
      if (response.data.length > 0) {
        setAvaliacaoSelecionada(response.data[0]);
      } else {
        setAvaliacaoSelecionada(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao buscar avaliações.';
      setError(errorMsg);
      setAvaliacoes([]);
      setAvaliacaoSelecionada(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectAvaliacao = useCallback((avaliacao) => {
    setAvaliacaoSelecionada(avaliacao);
  }, []);

  const criarAvaliacao = useCallback(async (alunoId, data) => {
    setLoading(true);
    setError(null);
    try {
      // A criação global não precisa do CPF, mas a atualização da lista sim.
      const response = await avaliacoesService.createAvaliacaoGlobal({ ...data, aluno: alunoId });
      await fetchAvaliacoes(alunoId);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || Object.values(err.response?.data || {}).join(' ') || 'Erro ao criar avaliação.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAvaliacoes]);

  const atualizarAvaliacao = useCallback(async (id, data, alunoId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await avaliacoesService.updateAvaliacao(id, data);
      await fetchAvaliacoes(alunoId);
      setAvaliacaoSelecionada(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || Object.values(err.response?.data || {}).join(' ') || 'Erro ao atualizar avaliação.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAvaliacoes]);

  const deletarAvaliacao = useCallback(async (id, alunoId) => {
    setLoading(true);
    setError(null);
    try {
      await avaliacoesService.deleteAvaliacao(id);
      await fetchAvaliacoes(alunoId);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao deletar avaliação.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAvaliacoes]);

  const value = {
    avaliacoes,
    avaliacaoSelecionada,
    loading,
    error,
    fetchAvaliacoes,
    selectAvaliacao,
    criarAvaliacao,
    atualizarAvaliacao,
    deletarAvaliacao,
  };

  return (
    <AvaliacaoContext.Provider value={value}>
      {children}
    </AvaliacaoContext.Provider>
  );
};

export const useAvaliacao = () => {
  const context = useContext(AvaliacaoContext);
  if (context === undefined) {
    throw new Error('useAvaliacao must be used within a AvaliacaoProvider');
  }
  return context;
};
