import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AgendamentoCard from '../components/AgendamentoCard';
import { useToast } from '../context/ToastContext';
import agendamentosService from '../services/agendamentosService';
import useMeusAgendamentosViewModel from '../viewmodels/useMeusAgendamentosViewModel';
import { format, parseISO } from 'date-fns';
import Icon from '../components/Icon';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useLocation } from 'react-router-dom';

const MeusAgendamentosView = () => {
  const { showToast } = useToast();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [agendamentoToCancelId, setAgendamentoToCancelId] = useState(null);

  const location = useLocation();
  const { initialDate, initialStudioId, forceRefresh } = location.state || {}; // Extrair forceRefresh

  const {
    agendamentos,
    studios,
    selectedStudioId,
    setSelectedStudioId,
    selectedDate,
    setSelectedDate,
    loading,
    error,
    getWeekDays,
    formattedDate,
    formattedDayOfWeek,
    setPreviousWeek,
    setNextWeek,
    daysWithAgendamentos,
    currentStudioName,
    refreshAgendamentos,
  } = useMeusAgendamentosViewModel(
    initialDate ? parseISO(initialDate) : undefined,
    initialStudioId !== undefined ? initialStudioId : undefined,
    forceRefresh // Passar forceRefresh para o ViewModel
  );

  // Limpar o estado de navegação após o uso para evitar re-refreshs indesejados
  useEffect(() => {
    if (forceRefresh) {
      // Isso é um hack para limpar o state da location sem causar um re-render imediato
      // Em React Router v6, você pode usar navigate('.', { replace: true, state: {} })
      // Mas para evitar dependência de navigate aqui, vamos apenas deixar o state ser consumido
      // e o ViewModel reagirá apenas uma vez a ele.
      // Se for necessário limpar o state para evitar que um refresh da página re-dispare a lógica,
      // seria preciso usar navigate com replace: true e um state vazio.
    }
  }, [forceRefresh]);


  useEffect(() => {
    setTempDate(format(selectedDate, "yyyy-MM-dd"));
  }, [selectedDate]);

  const handleStudioChange = (event) => {
    const value = event.target.value;
    setSelectedStudioId(value === 'all' ? 'all' : parseInt(value));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const openCancelModal = (agendamentoId) => {
    setAgendamentoToCancelId(agendamentoId);
    setShowCancelModal(true);
  };

  const confirmCancelAgendamento = async () => {
    if (!agendamentoToCancelId) return;

    try {
      await agendamentosService.cancelarAgendamento(agendamentoToCancelId);
      showToast('Agendamento cancelado com sucesso!', 'success');
      refreshAgendamentos();
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      const errorMessage = err.response?.data?.detail || "Não foi possível cancelar o agendamento.";
      showToast(errorMessage, 'error');
    } finally {
      setShowCancelModal(false);
      setAgendamentoToCancelId(null);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-white transition-colors duration-300">
      <Header title="Meus Agendamentos" showBackButton={true} />

      <main className="flex-1 pb-24">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-background-light/80 p-4 pb-3 backdrop-blur-sm dark:bg-background-dark/80">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Seus Agendamentos
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setTempDate(format(selectedDate, "yyyy-MM-dd"));
                setIsCalendarModalOpen(true);
              }}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-gray-600 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-2xl">
                calendar_today
              </span>
            </button>
          </div>
        </header>

        <div className="sticky top-[72px] z-10 bg-background-light dark:bg-background-dark">
          <div className="bg-blue-600/10 px-4 py-3 dark:bg-blue-500/20">
            <div className="flex flex-col items-start gap-2 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Estúdio:{" "}
                <span className="font-bold">{currentStudioName}</span>
              </p>
              <select
                value={selectedStudioId}
                onChange={handleStudioChange}
                className="appearance-none whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-primary shadow-sm hover:bg-gray-50 dark:bg-zinc-800 dark:text-primary dark:hover:bg-zinc-700/80"
              >
                {studios.map((studio) => (
                  <option key={studio.id} value={studio.id}>
                    {studio.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 bg-background-light px-4 dark:bg-background-dark">
            <div className="flex items-center space-x-2 py-3">
              <button
                onClick={setPreviousWeek}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_left
                </span>
              </button>
              <div className="overflow-x-auto flex-1">
                <div className="no-scrollbar flex items-center space-x-2">
                  {getWeekDays().map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateChange(date)}
                      className={`flex shrink-0 flex-col items-center gap-1.5 rounded-lg px-3 py-2 text-center ${
                        format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                          ? "bg-primary/10 text-primary dark:bg-primary/20"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {formattedDayOfWeek(date)}
                      </span>
                      <span className="text-sm font-semibold">
                        {formattedDate(date)}
                      </span>
                      {daysWithAgendamentos.has(format(date, "yyyy-MM-dd")) && (
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={setNextWeek}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 mb-4" role="alert">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {loading ? (
            <>
              <AgendamentoCard isLoading={true} />
              <AgendamentoCard isLoading={true} />
              <AgendamentoCard isLoading={true} />
            </>
          ) : agendamentos.length > 0 ? (
            agendamentos.map(agendamento => (
              <AgendamentoCard
                key={agendamento.id}
                agendamento={agendamento}
                onCancel={openCancelModal}
              />
            ))
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-gray-600 dark:text-gray-300">
              <p>Nenhum agendamento encontrado para este dia e estúdio.</p>
              <p className="mt-2">Que tal <a href="/aluno/marcar-aula" className="text-primary hover:underline">marcar uma aula</a>?</p>
            </div>
          )}
        </div>
      </main>

      {isCalendarModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300"
          onClick={() => setIsCalendarModalOpen(false)}
        >
          <div
            className="relative m-4 flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-card-light dark:bg-card-dark shadow-2xl transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center p-6 sm:p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Icon name="calendar_today" className="text-4xl text-primary" />
              </div>

              <h2 className="text-text-light dark:text-text-dark tracking-tight text-[28px] font-bold leading-tight text-center pb-3">
                Selecionar Data
              </h2>

              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-lg font-semibold text-gray-900 dark:border-gray-600 dark:bg-zinc-800 dark:text-white"
              />

              <div className="flex w-full flex-col-reverse sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-transparent text-text-light dark:text-text-dark text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-500/10 transition-colors"
                >
                  <span className="truncate">Cancelar</span>
                </button>
                <button
                  onClick={() => {
                    handleDateChange(new Date(tempDate));
                    setIsCalendarModalOpen(false);
                  }}
                  className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                >
                  <span className="truncate">Confirmar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelAgendamento}
        title="Confirmar Cancelamento"
        message="Você tem certeza que deseja cancelar este agendamento? Esta ação não poderá ser desfeita."
        confirmButtonText="Sim, Cancelar"
        cancelButtonText="Não, Manter"
      />
    </div>
  );
};

export default MeusAgendamentosView;
