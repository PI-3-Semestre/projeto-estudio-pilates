import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useAgendaViewModel from "../viewmodels/useAgendaViewModel";
import { format, parseISO, isSameDay } from "date-fns";
import Icon from "../components/Icon";

const AgendaView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const {
    aulas,
    studios,
    selectedStudioId,
    setSelectedStudioId,
    selectedDate, // This is now a Date object
    setSelectedDate,
    loading,
    error,
    getWeekDays,
    formattedDate,
    formattedDayOfWeek,
    setPreviousWeek,
    setNextWeek,
    daysWithClasses,
    currentStudioName,
  } = useAgendaViewModel();

  // State for the date picker input, which needs a 'yyyy-MM-dd' string
  const [tempDate, setTempDate] = useState(format(selectedDate, "yyyy-MM-dd"));

  const handleStudioChange = (event) => {
    setSelectedStudioId(parseInt(event.target.value));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const renderClassCard = (aula) => {
    const startTime = format(parseISO(aula.data_hora_inicio), "HH:mm");
    const endTime = format(
      new Date(
        parseISO(aula.data_hora_inicio).getTime() + aula.duracao_minutos * 60000
      ),
      "HH:mm"
    );
    const isFull = aula.capacidade_maxima === aula.alunosInscritos;
    const isCancelled = aula.tipo_aula === "CANCELADA";
    const canEdit = user?.perfis?.some((p) =>
      ["Admin Master", "Administrador", "Recepcionista"].includes(p)
    );

    let capacityDisplay;
    let capacityClasses =
      "flex h-6 items-center justify-center rounded-full px-3";
    if (isCancelled) {
      capacityDisplay = "Cancelada";
      capacityClasses += " bg-red-500/20 text-red-600 dark:text-red-400";
    } else if (isFull) {
      capacityDisplay = `${aula.capacidade_maxima}/${aula.capacidade_maxima}`;
      capacityClasses +=
        " bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
    } else {
      capacityDisplay = `${aula.alunosInscritos || 0}/${
        aula.capacidade_maxima
      }`;
      capacityClasses += " bg-primary/10 text-primary";
    }

    return (
      <div
        key={aula.id}
        className="relative rounded-xl bg-white p-4 shadow-sm hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-700/50"
      >
        {canEdit && (
          <button
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/aulas/${aula.id}`);
            }}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        )}
        <div className="flex items-start justify-between pr-10">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {startTime} - {endTime}
            </p>
            <p className="mt-1 text-base text-gray-700 dark:text-gray-200">
              {aula.modalidade.nome}
            </p>
          </div>
          <div className={capacityClasses}>
            <span className="text-xs font-medium">{capacityDisplay}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Instrutor: {aula.instrutor_principal}
        </p>
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <main className="flex-grow pb-24">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-background-light/80 p-4 pb-3 backdrop-blur-sm dark:bg-background-dark/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const dashboardPath = "/dashboard";
                navigate(dashboardPath);
              }}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-gray-600 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-2xl">
                arrow_back
              </span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Agenda Geral
            </h1>
          </div>
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
                Você está gerenciando:{" "}
                <span className="font-bold">{currentStudioName}</span>
              </p>
              <select
                value={selectedStudioId || ""}
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
          <div className="border-b border-gray-200 bg-background-light px-4 dark:border-gray-700 dark:bg-background-dark">
            <div className="flex items-center space-x-2 py-3">
              <button
                onClick={setPreviousWeek}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
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
                      {daysWithClasses.has(format(date, "yyyy-MM-dd")) && (
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={setNextWeek}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading && <p>Carregando aulas...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && aulas.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Nenhuma aula encontrada para este dia e estúdio.
              </p>
            </div>
          )}

          {!loading && !error && aulas.length > 0 && (
            <div className="space-y-3">{aulas.map(renderClassCard)}</div>
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

      <button
        onClick={() => navigate("/admin/cadastrar-aula")}
        className="fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90"
      >
        <span className="material-symbols-outlined text-4xl">add</span>
      </button>
    </div>
  );
};

export default AgendaView;
