import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import agendamentosService from '../services/agendamentosService';
import studiosService from '../services/studiosService';
import { format, parseISO, isSameDay, addDays, startOfWeek, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Modificado para aceitar initialDate, initialStudioId e forceRefresh
const useMeusAgendamentosViewModel = (initialDate = new Date(), initialStudioId = 'all', forceRefresh = false) => {
  const { user, loading: authLoading } = useAuth();
  const [allAgendamentos, setAllAgendamentos] = useState([]);
  const [studios, setStudios] = useState([]);
  // Usar initialStudioId para o estado inicial
  const [selectedStudioId, setSelectedStudioId] = useState(initialStudioId);
  // Usar initialDate para o estado inicial
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudios = useCallback(async () => {
    try {
      const response = await studiosService.getAllStudios();
      const allSystemStudios = response.data;

      const allStudiosOption = { id: 'all', nome: 'Todos os Estúdios' };
      setStudios([allStudiosOption, ...allSystemStudios]);

      // Se o initialStudioId foi fornecido e não é 'all', garantir que ele seja um número
      if (initialStudioId !== 'all' && typeof initialStudioId === 'number') {
        setSelectedStudioId(initialStudioId);
      } else {
        setSelectedStudioId('all'); // Default para 'all' se não for um ID válido
      }
    } catch (err) {
      setError('Não foi possível carregar a lista de estúdios.');
      console.error('Erro ao buscar todos os estúdios:', err);
    }
  }, [initialStudioId]);

  const fetchAgendamentos = useCallback(async () => {
    if (!user || authLoading) return;

    setLoading(true);
    setError(null);
    console.log("Chamando fetchAgendamentos..."); // DEBUG: Ponto 2
    try {
      const data = await agendamentosService.getMeusAgendamentos();
      setAllAgendamentos(data);
      console.log("Agendamentos brutos recebidos:", data); // DEBUG: Ponto 3
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setError("Não foi possível carregar seus agendamentos.");
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Modificado para incluir forceRefresh como dependência
  useEffect(() => {
    console.log("ViewModel forceRefresh recebido:", forceRefresh); // DEBUG: Ponto 1
    if (!authLoading && user) {
      fetchStudios();
      fetchAgendamentos();
    }
  }, [authLoading, user, fetchStudios, fetchAgendamentos, forceRefresh]); // Adicionado forceRefresh aqui

  const currentStudioName = useMemo(() => {
    if (selectedStudioId === 'all') {
      return 'Todos os Estúdios';
    }
    return studios.find(s => s.id === parseInt(selectedStudioId))?.nome;
  }, [studios, selectedStudioId]);

  const filteredAgendamentos = useMemo(() => {
    const filtered = allAgendamentos.filter(agendamento => {
      const isSameDate = isSameDay(parseISO(agendamento.aula.data_hora_inicio), selectedDate);
      if (selectedStudioId === 'all') {
        return isSameDate;
      }
      const isSameStudio = agendamento.aula.studio?.id === parseInt(selectedStudioId);
      return isSameDate && isSameStudio;
    });
    console.log("Agendamentos filtrados:", filtered); // DEBUG: Ponto 4
    return filtered;
  }, [allAgendamentos, selectedDate, selectedStudioId]);

  const getWeekDays = useCallback(() => {
    const start = startOfWeek(selectedDate, { locale: ptBR });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [selectedDate]);

  const formattedDate = (date) => format(date, 'dd/MM', { locale: ptBR });
  const formattedDayOfWeek = (date) => format(date, 'EEE', { locale: ptBR });

  const setPreviousWeek = useCallback(() => {
    const newDate = addDays(selectedDate, -7);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const setNextWeek = useCallback(() => {
    const newDate = addDays(selectedDate, 7);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const daysWithAgendamentos = useMemo(() => {
    const dateSet = new Set();
    allAgendamentos.forEach(agendamento => {
      if (selectedStudioId === 'all' || agendamento.aula.studio?.id === parseInt(selectedStudioId)) {
        const date = format(parseISO(agendamento.aula.data_hora_inicio), 'yyyy-MM-dd');
        dateSet.add(date);
      }
    });
    return dateSet;
  }, [allAgendamentos, selectedStudioId]);

  const nextClass = useMemo(() => {
    const now = new Date();
    const futureConfirmedAgendamentos = allAgendamentos.filter(agendamento => {
      const parsedStartDate = parseISO(agendamento.aula.data_hora_inicio);
      const isFutureClass = isFuture(parsedStartDate);

      const isConfirmed = agendamento.status_presenca !== 'PRESENTE' &&
                          agendamento.status_presenca !== 'FALTOU' &&
                          agendamento.status_presenca !== 'CANCELADO';

      return isFutureClass && isConfirmed;
    });

    console.log("Agendamentos futuros e confirmados filtrados para nextClass:", futureConfirmedAgendamentos);

    if (futureConfirmedAgendamentos.length === 0) {
      return null;
    }

    futureConfirmedAgendamentos.sort((a, b) => {
      const dateA = parseISO(a.aula.data_hora_inicio);
      const dateB = parseISO(b.aula.data_hora_inicio);
      return dateA.getTime() - dateB.getTime();
    });

    return futureConfirmedAgendamentos[0];
  }, [allAgendamentos]);


  return {
    agendamentos: filteredAgendamentos,
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
    currentStudioName: currentStudioName || 'Carregando...',
    refreshAgendamentos: fetchAgendamentos,
    nextClass,
  };
};

export default useMeusAgendamentosViewModel;