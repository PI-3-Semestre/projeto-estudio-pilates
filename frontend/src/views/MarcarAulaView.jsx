import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Icon from '../components/Icon';
import useMarcarAulaViewModel from '../viewmodels/useMarcarAulaViewModel';
import { format, isSameDay } from 'date-fns';
import ClassCard from '../components/ClassCard';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const MarcarAulaView = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalData, setActionModalData] = useState(null); // { aulaId, isFull }

  const {
    studios,
    modalidades,
    filteredClasses,
    selectedStudioId,
    setSelectedStudioId,
    selectedModalityId,
    setSelectedModalityId,
    selectedDate,
    setSelectedDate,
    loading,
    error,
    getWeekDays,
    formattedDate,
    formattedDayOfWeek,
    setPreviousWeek,
    setNextWeek,
    daysWithAvailableClasses,
    currentStudioName,
    currentModalityName,
    marcarAula,
    entrarListaEspera,
  } = useMarcarAulaViewModel();

  useEffect(() => {
    setTempDate(format(selectedDate, "yyyy-MM-dd"));
  }, [selectedDate]);

  const handleStudioChange = (event) => {
    const value = event.target.value;
    setSelectedStudioId(value === 'all' ? 'all' : parseInt(value));
  };

  const handleModalityChange = (event) => {
    const value = event.target.value;
    setSelectedModalityId(value === 'all' ? 'all' : parseInt(value));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const openActionModal = (aulaId, isFull) => {
    setActionModalData({ aulaId, isFull });
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!actionModalData) return;

    const { aulaId, isFull } = actionModalData;
    let result;

    try {
      if (isFull) {
        result = await entrarListaEspera(aulaId);
        if (result.success) {
          // Usa a mensagem da API se disponível, senão uma mensagem padrão.
          showToast(result.message || 'Você entrou na lista de espera com sucesso!', 'success');
        } else {
          showToast(result.error, 'error');
        }
      } else {
        result = await marcarAula(aulaId);
        if (result.success) {
          showToast('Aula marcada com sucesso!', 'success');
          const agendamentoCriado = result.data;
          if (agendamentoCriado && agendamentoCriado.aula) {
            navigate('/aluno/meus-agendamentos', {
              state: {
                initialDate: agendamentoCriado.aula.data_hora_inicio,
                initialStudioId: agendamentoCriado.aula.studio?.id,
                forceRefresh: true,
              },
            });
          } else {
            navigate('/aluno/meus-agendamentos', { state: { forceRefresh: true } });
          }
        } else {
          showToast(result.error, 'error');
        }
      }
    } catch (err) {
      console.error("Erro na ação:", err);
      showToast("Ocorreu um erro inesperado.", 'error');
    } finally {
      setShowActionModal(false);
      setActionModalData(null);
    }
  };


  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-white transition-colors duration-300">
      <Header title="Marcar Aula" showBackButton={true} />

      <main className="flex-1 pb-24">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-background-light/80 p-4 pb-3 backdrop-blur-sm dark:bg-background-dark/80">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Aulas Disponíveis
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

        {/* Filtros de Estúdio e Modalidade, e Navegação Semanal */}
        <div className="sticky top-[72px] z-10 bg-background-light dark:bg-background-dark">
          <div className="bg-blue-600/10 px-4 py-3 dark:bg-blue-500/20 flex flex-col sm:flex-row gap-2 justify-between items-center">
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Modalidade:{" "}
                <span className="font-bold">{currentModalityName}</span>
              </p>
              <select
                value={selectedModalityId}
                onChange={handleModalityChange}
                className="appearance-none whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-primary shadow-sm hover:bg-gray-50 dark:bg-zinc-800 dark:text-primary dark:hover:bg-zinc-700/80"
              >
                {modalidades.map((modality) => (
                  <option key={modality.id} value={modality.id}>
                    {modality.nome}
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
                        isSameDay(date, selectedDate)
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
                      {daysWithAvailableClasses.has(format(date, "yyyy-MM-dd")) && (
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
              <ClassCard isLoading={true} />
              <ClassCard isLoading={true} />
              <ClassCard isLoading={true} />
            </>
          ) : filteredClasses.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-gray-600 dark:text-gray-300">
              <p>Nenhuma aula disponível encontrada para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClasses.map(aula => (
                <ClassCard
                  key={aula.id}
                  aula={aula}
                  onMarcarAula={openActionModal}
                />
              ))}
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

      {showActionModal && actionModalData && (
        <ConfirmDeleteModal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          onConfirm={confirmAction}
          title={actionModalData.isFull ? "Entrar na Lista de Espera" : "Confirmar Agendamento"}
          message={actionModalData.isFull ?
            "Esta aula está lotada. Deseja entrar na lista de espera? Você será notificado se uma vaga surgir." :
            "Você tem certeza que deseja agendar esta aula? Um crédito será utilizado."
          }
          confirmButtonText={actionModalData.isFull ? "Sim, Entrar" : "Sim, Agendar"}
          cancelButtonText="Não, Voltar"
          confirmButtonColor={actionModalData.isFull ? "bg-yellow-500 hover:bg-yellow-600" : "bg-primary hover:bg-primary/90"}
        />
      )}
    </div>
  );
};

export default MarcarAulaView;
