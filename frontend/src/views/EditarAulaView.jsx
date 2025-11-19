import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useEditarAulaViewModel from "../viewmodels/useEditarAulaViewModel";
import Header from "../components/Header";

const EditarAulaView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aula, setAula] = useState(null);

  useEffect(() => {
    // Buscar dados da aula específica usando a API própria
    const fetchAula = async () => {
      try {
        const response = await import("../services/api.js").then(
          ({ default: api }) => api.get(`/agendamentos/aulas/${id}/`)
        );
        setAula(response.data);
      } catch (error) {
        console.error("Erro ao buscar aula:", error);
      }
    };

    fetchAula();
  }, [id]);

  const {
    formData,
    loading,
    saving,
    modalidades,
    studios,
    instrutores,
    handleChange,
    handleSubmit,
  } = useEditarAulaViewModel(id, aula);

  const handleSave = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    // Após salvar, volta para a página de detalhes
    navigate(`/aulas/${id}`);
  };

  if (loading) {
    return (
      <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Carregando dados...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root font-display bg-background-light dark:bg-background-dark">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSave} className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              to={`/aulas/${id}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined text-2xl">
                arrow_back
              </span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Editar Aula
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Modifique os detalhes da aula
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informações Básicas
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Data e Hora */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Data e Hora*
                    </label>
                    <input
                      type="datetime-local"
                      name="data_hora_inicio"
                      value={formData.data_hora_inicio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  {/* Tipo da Aula */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo da Aula*
                    </label>
                    <select
                      name="tipo_aula"
                      value={formData.tipo_aula}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white"
                      required
                    >
                      <option value="REGULAR">Aula Regular</option>
                      <option value="REPOSICAO">Reposição</option>
                      <option value="AVULSA">Avulsa</option>
                    </select>
                  </div>

                  {/* Modalidade */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Modalidade*
                    </label>
                    <select
                      name="modalidade"
                      value={formData.modalidade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Selecione uma modalidade</option>
                      {modalidades.map((modalidade) => (
                        <option key={modalidade.id} value={modalidade.id}>
                          {modalidade.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Studio */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Studio*
                    </label>
                    <select
                      name="studio"
                      value={formData.studio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Selecione um studio</option>
                      {studios.map((studio) => (
                        <option key={studio.id} value={studio.id}>
                          {studio.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Capacidade Máxima */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Capacidade Máxima*
                    </label>
                    <input
                      type="number"
                      name="capacidade_maxima"
                      value={formData.capacidade_maxima}
                      onChange={handleChange}
                      min="1"
                      max="50"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  {/* Duração (minutos) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duração (minutos)*
                    </label>
                    <input
                      type="number"
                      name="duracao_minutos"
                      value={formData.duracao_minutos}
                      onChange={handleChange}
                      min="15"
                      max="180"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Instrutores */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Instrutores
                </h2>

                {/* Instrutor Principal */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instrutor Principal*
                  </label>
                  <select
                    name="instrutor_principal"
                    value={formData.instrutor_principal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Selecione o instrutor</option>
                    {instrutores.map((instrutor) => (
                      <option
                        key={instrutor.usuario.id}
                        value={instrutor.usuario.id}
                      >
                        {instrutor.usuario.nome_completo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instrutor Substituto */}
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instrutor Substituto (opcional)
                  </label>
                  <select
                    name="instrutor_substituto"
                    value={formData.instrutor_substituto}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white"
                  >
                    <option value="">Nenhum substituto</option>
                    {instrutores.map((instrutor) => (
                      <option
                        key={instrutor.usuario.id}
                        value={instrutor.usuario.id}
                      >
                        {instrutor.usuario.nome_completo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Resumo da Edição
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Preencha todos os campos obrigatórios
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Verifique os dados antes de salvar
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Alterações serão aplicadas imediatamente
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">
                          save
                        </span>
                        Salvar Alterações
                      </>
                    )}
                  </button>

                  <Link
                    to={`/aulas/${id}`}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      cancel
                    </span>
                    Cancelar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditarAulaView;
