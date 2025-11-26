import { useState, useCallback } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const useAgendaCalendar = (initialDate = new Date()) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const getWeekDays = useCallback(() => {
    const start = startOfWeek(selectedDate, { locale: ptBR });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [selectedDate]);

  const formattedDate = useCallback((date) => format(date, 'dd/MM', { locale: ptBR }), []);
  const formattedDayOfWeek = useCallback((date) => format(date, 'EEE', { locale: ptBR }), []);

  const setPreviousWeek = useCallback(() => {
    const newDate = addDays(selectedDate, -7);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const setNextWeek = useCallback(() => {
    const newDate = addDays(selectedDate, 7);
    setSelectedDate(newDate);
  }, [selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    getWeekDays,
    formattedDate,
    formattedDayOfWeek,
    setPreviousWeek,
    setNextWeek,
  };
};


