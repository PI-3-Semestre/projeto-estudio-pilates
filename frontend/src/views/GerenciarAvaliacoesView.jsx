import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AvaliacaoProvider, useAvaliacao } from '../context/AvaliacaoContext'; // CORRIGIDO
import HistoricoAvaliacaoItem from '../components/HistoricoAvaliacaoItem';
import AvaliacaoDetails from '../components/AvaliacaoDetails';
import AvaliacaoForm from '../components/AvaliacaoForm';
import PageHeader from '../components/PageHeader';
import { getAlunoByCpf } from '../services/alunosService';

const GerenciarAvaliacoesContent = () => {
  const { cpf } = useParams();
  const {
    avaliacoes,
    avaliacaoSelecionada,
    loading,
    error,
    fetchAvaliacoes,
    selectAvaliacao,
    criarAvaliacao,
    atualizarAvaliacao,
    deletarAvaliacao,
  } = useAvaliacao(); // CORRIGIDO

  const [alunoNome, setAlunoNome] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAvaliacoes(cpf);
    getAlunoByCpf(cpf).then(response => {
      setAlunoNome(response.data.nome);
    });
  }, [cpf, fetchAvaliacoes]);

  const handleSelectAvaliacao = (avaliacao) => {
    selectAvaliacao(avaliacao);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleStartCreating = () => {
    setIsCreating(true);
    setIsEditing(false);
    selectAvaliacao(null); // Desseleciona qualquer avaliação existente
  };

  const handleStartEditing = () => {
    if (avaliacaoSelecionada) {
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    // Se havia uma avaliação selecionada antes de editar, volta a selecioná-la
    if (avaliacoes.length > 0) {
      selectAvaliacao(avaliacoes.find(a => a.id === avaliacaoSelecionada?.id) || avaliacoes[0]);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (isEditing) {
        await atualizarAvaliacao(avaliacaoSelecionada.id, formData, cpf);
      } else {
        await criarAvaliacao(cpf, formData);
      }
      setIsCreating(false);
      setIsEditing(false);
    } catch (err) {
      // O erro já é tratado no contexto, mas pode-se adicionar lógica extra aqui
      console.error("Falha ao salvar avaliação:", err);
    }
  };

  const handleDelete = async () => {
    if (avaliacaoSelecionada && window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await deletarAvaliacao(avaliacaoSelecionada.id, cpf);
        // A seleção será atualizada automaticamente pelo contexto
      } catch (err) {
        console.error("Falha ao deletar avaliação:", err);
      }
    }
  };

  const renderContent = () => {
    if (loading && !isCreating && !isEditing) {
      return <div className="text-center p-10">Carregando avaliações...</div>;
    }
    if (error) {
      return <div className="text-center p-10 text-red-500">{error}</div>;
    }
    if (isCreating || isEditing) {
      return (
        <AvaliacaoForm
          initialData={isEditing ? avaliacaoSelecionada : null}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      );
    }
    if (avaliacoes.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Nenhuma avaliação encontrada para este aluno.</p>
                <button onClick={handleStartCreating} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-action-primary text-text-light gap-2 text-base font-bold leading-normal tracking-[0.015em]">
                  Criar Primeira Avaliação
                </button>
            </div>
        );
    }
    return (
      <AvaliacaoDetails
        avaliacao={avaliacaoSelecionada}
        onEdit={handleStartEditing}
        onDelete={handleDelete}
        loading={loading}
      />
    );
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader title={`Gerenciar Avaliações de ${alunoNome}`} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar de Histórico */}
        <aside className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Histórico</h3>
            <button onClick={handleStartCreating} disabled={isCreating} className="flex items-center justify-center rounded-xl h-9 px-3 bg-action-primary text-text-light text-sm font-bold leading-normal tracking-wide disabled:opacity-50">
              + Nova
            </button>
          </div>
          {avaliacoes.length > 0 ? (
            <ul className="space-y-2">
              {avaliacoes.map((av) => (
                <HistoricoAvaliacaoItem
                  key={av.id}
                  avaliacao={av}
                  onClick={handleSelectAvaliacao}
                  isActive={av.id === avaliacaoSelecionada?.id && !isCreating}
                />
              ))}
            </ul>
          ) : (
            !loading && !isCreating && <p className="text-sm text-gray-500">Nenhum histórico.</p>
          )}
        </aside>

        {/* Conteúdo Principal */}
        <main className="md:col-span-3">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const GerenciarAvaliacoesView = () => (
  <AvaliacaoProvider>
    <GerenciarAvaliacoesContent />
  </AvaliacaoProvider>
);

export default GerenciarAvaliacoesView;
