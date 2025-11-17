import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api'; // Import api
import studiosService from '../services/studiosService';
import { format, parseISO, isSameDay, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const useAgendaViewModel = () => {
    const [allAgendamentos, setAllAgendamentos] = useState([]); // Store all appointments
    const [studios, setStudios] = useState([]);
    const [selectedStudioId, setSelectedStudioId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudios = useCallback(async () => {
        try {
            const response = await studiosService.getAllStudios();
            setStudios(response.data);
            if (response.data.length > 0) {
                setSelectedStudioId(response.data[0].id); // Select the first studio by default
            }
        } catch (err) {
            setError('Não foi possível carregar os estúdios.');
            console.error('Erro ao buscar estúdios:', err);
        }
    }, []);

    // New function to fetch all appointments
    const fetchAgendamentos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/agendamentos/aulas-alunos/');
            setAllAgendamentos(response.data);
        } catch (err) {
            setError('Não foi possível carregar a agenda.');
            console.error('Erro ao buscar agendamentos:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudios();
        fetchAgendamentos(); // Fetch appointments on initial load
    }, [fetchStudios, fetchAgendamentos]);

    // a studio has a name and an id.
    const currentStudioName = useMemo(() => {
        return studios.find(s => s.id === selectedStudioId)?.nome;
    }, [studios, selectedStudioId]);

    // Derive unique aulas from allAgendamentos
    const uniqueAulas = useMemo(() => {
        const aulasMap = new Map();
        allAgendamentos.forEach(agendamento => {
            const aulaId = agendamento.aula.id;
            if (!aulasMap.has(aulaId)) {
                aulasMap.set(aulaId, {
                    ...agendamento.aula,
                    alunosInscritos: 1, // Start counting
                });
            } else {
                const existing = aulasMap.get(aulaId);
                existing.alunosInscritos += 1;
            }
        });
        return Array.from(aulasMap.values());
    }, [allAgendamentos]);

    const filteredAulas = useMemo(() => {
        if (!currentStudioName) return [];

        return uniqueAulas.filter(aula => {
            const isSameDate = isSameDay(parseISO(aula.data_hora_inicio), selectedDate);
            // The studio name in the class object must match the selected studio name
            const isSameStudio = aula.studio === currentStudioName;
            return isSameDate && isSameStudio;
        });
    }, [uniqueAulas, selectedDate, currentStudioName]);


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

    const daysWithClasses = useMemo(() => {
        const dateSet = new Set();
        uniqueAulas.forEach(aula => {
            if (aula.studio === currentStudioName) {
                const date = format(parseISO(aula.data_hora_inicio), 'yyyy-MM-dd');
                dateSet.add(date);
            }
        });
        return dateSet;
    }, [uniqueAulas, currentStudioName]);

    return {
        aulas: filteredAulas, // Use the new filteredAulas
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
        daysWithClasses,
        currentStudioName: currentStudioName || 'Carregando...',
    };
};

export default useAgendaViewModel;
