import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useMarcarAulaViewModel from "../viewmodels/useMarcarAulaViewModel";
import { useToast } from "../context/ToastContext";

const MarcarAulaView = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    formData,
    modalidades,
    studios,
    instrutores,
    loading,
    error,
    success,
    isStaff,
    handleChange,
    handleDateTimeChange,
    handleSubmit,
  } = useMarcarAulaViewModel();

  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    handleDateTimeChange(dateInput, timeInput);
  }, [dateInput, timeInput, handleDateTimeChange]);

  // Função para mostrar modal de confirmação
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  // Função para confirmar criação da aula
  const confirmCreateAula = async () => {
    setShowConfirmModal(false);
    setIsCreating(true);

    try {
      await handleSubmit(new Event("submit"));
      toast.showToast("Aula criada com sucesso!", "success");
      // navigate se faz no viewmodel
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Erro ao criar aula. Verifique os dados.";
      toast.showToast(errorMessage, "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Formatar dados do instrutor principal
  const instrutorPrincipal = instrutores.find(
    (inst) => inst.usuario === parseInt(formData.instrutor_principal)
  );
  const instrutorSubstituto = formData.instrutor_substituto
    ? instrutores.find(
        (inst) => inst.usuario === parseInt(formData.instrutor_substituto)
      )
    : null;
  const modalidadeSelecionada = modalidades.find(
    (mod) => mod.id === parseInt(formData.modalidade)
  );
  const studioSelecionado = studios.find(
    (est) => est.id === parseInt(formData.studio)
  );

  if (loading && !isCreating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-text-light dark:text-text-dark">Carregando...</p>
      </div>
    );
  }

  if (error && !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark p-4 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-text-light dark:text-text-dark"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-text-light dark:text-text-dark">
          Criar Nova Aula
        </h1>
        <div className="h-10 w-10 shrink-0"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <form
          id="aula-form"
          onSubmit={handleFormSubmit}
          className="mx-auto max-w-lg space-y-6"
        >
          {/* Modalidade */}
          <div className="flex flex-col">
            <label
              className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark"
              htmlFor="modalidade"
            >
              Modalidade
            </label>
            <div className="relative">
              <select
                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                id="modalidade"
                name="modalidade"
                value={formData.modalidade || ""}
                onChange={handleChange}
                required
              >
                <option disabled value="">
                  Selecione a modalidade
                </option>
                {modalidades.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Studio */}
          <div className="flex flex-col">
            <label
              className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark"
              htmlFor="studio"
            >
              Estúdio
            </label>
            <div className="relative">
              <select
                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                id="studio"
                name="studio"
                value={formData.studio || ""}
                onChange={handleChange}
                required
              >
                <option disabled value="">
                  Selecione o estúdio
                </option>
                {studios.map((studio) => (
                  <option key={studio.id} value={studio.id}>
                    {studio.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instrutor Principal */}
          <div className="flex flex-col">
            <label
              className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark"
              htmlFor="instrutor_principal"
            >
              Instrutor Principal
            </label>
            <div className="relative">
              <select
                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                id="instrutor_principal"
                name="instrutor_principal"
                value={formData.instrutor_principal || ""}
                onChange={handleChange}
                required
              >
                <option disabled value="">
                  Selecione um instrutor
                </option>
                {instrutores.map((colab) => (
                  <option key={colab.usuario} value={colab.usuario}>
                    {colab.nome_completo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instrutor Substituto */}
          <div className="flex flex-col">
            <label
              className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark"
              htmlFor="instrutor_substituto"
            >
              Instrutor Substituto (Opcional)
            </label>
            <div className="relative">
              <select
                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                id="instrutor_substituto"
                name="instrutor_substituto"
                value={formData.instrutor_substituto || ""}
                onChange={handleChange}
              >
                <option value="">Nenhum</option>
                {instrutores.map((colab) => (
                  <option key={colab.usuario} value={colab.usuario}>
                    {colab.nome_completo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacidade */}
          <div className="flex flex-col">
            <label
              className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark"
              htmlFor="capacidade_maxima"
            >
              Capacidade Máxima
            </label>
            <input
              className="h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
              id="capacidade_maxima"
              name="capacidade_maxima"
              type="number"
              placeholder="Ex: 15"
              value={formData.capacidade_maxima}
              onChange={handleChange}
            />
          </div>

          {/* Duração em Minutos */}
          <div className="flex flex-col">
            <label
              className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark"
              htmlFor="duracao_minutos"
            >
              Duração (minutos)
            </label>
            <input
              className="h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
              id="duracao_minutos"
              name="duracao_minutos"
              type="number"
              placeholder="Ex: 60"
              value={formData.duracao_minutos}
              onChange={handleChange}
            />
          </div>

          {/* Tipo de Aula */}
          <div className="flex flex-col">
            <label
              className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark"
              htmlFor="tipo_aula"
            >
              Tipo de Aula
            </label>
            <div className="relative">
              <select
                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                id="tipo_aula"
                name="tipo_aula"
                value={formData.tipo_aula}
                onChange={handleChange}
              >
                <option value="REGULAR">Regular</option>
                <option value="EXPERIMENTAL">Experimental</option>
                <option value="REPOSICAO">Reposição</option>
              </select>
            </div>
          </div>

          {/* Date and Time Picker */}
          <div className="grid grid-cols-2 gap-4">
            {/* Data */}
            <div className="flex flex-col">
              <label
                className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark"
                htmlFor="dateInput"
              >
                Data
              </label>
              <div className="relative">
                <input
                  className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark dark:[color-scheme:dark]"
                  id="dateInput"
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  required
                />
              </div>
            </div>
            {/* Horário */}
            <div className="flex flex-col">
              <label
                className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark"
                htmlFor="timeInput"
              >
                Horário
              </label>
              <div className="relative">
                <input
                  className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark dark:[color-scheme:dark]"
                  id="timeInput"
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light p-4 dark:bg-background-dark">
        <div className="mx-auto max-w-lg">
          <button
            type="submit"
            form="aula-form"
            className="w-full rounded-xl bg-primary px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
            disabled={loading || isCreating}
          >
            {loading || isCreating ? "Criando aula..." : "Criar Aula"}
          </button>
        </div>
      </footer>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="m-4 w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirmar criação da aula
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              {modalidadeSelecionada && (
                <p>
                  <span className="font-semibold">Modalidade:</span>{" "}
                  {modalidadeSelecionada.nome}
                </p>
              )}
              {studioSelecionado && (
                <p>
                  <span className="font-semibold">Estúdio:</span>{" "}
                  {studioSelecionado.nome}
                </p>
              )}
              {instrutorPrincipal && (
                <>
                  <p>
                    <span className="font-semibold">Instrutor:</span>{" "}
                    {instrutorPrincipal.nome_completo}
                  </p>
                  {instrutorSubstituto && (
                    <p>
                      <span className="font-semibold">Substituto:</span>{" "}
                      {instrutorSubstituto.nome_completo}
                    </p>
                  )}
                </>
              )}
              {dateInput && timeInput && (
                <p>
                  <span className="font-semibold">Data/Hora:</span> {dateInput}{" "}
                  às {timeInput}
                </p>
              )}
              {formData.capacidade_maxima && (
                <p>
                  <span className="font-semibold">Capacidade:</span>{" "}
                  {formData.capacidade_maxima} vagas
                </p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-lg bg-gray-200 py-3 font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button
                onClick={confirmCreateAula}
                className="flex-1 rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary/90 transition-colors"
                disabled={isCreating}
              >
                {isCreating ? "Criando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarcarAulaView;
