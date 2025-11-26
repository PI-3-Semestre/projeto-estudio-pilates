import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api'; // Import api
import { getAulas } from '../services/aulasService';
import studiosService from '../services/studiosService';
import { format, parseISO, isSameDay, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const useAgendaViewModel = () => {
    const [allAgendamentos, setAllAgendamentos] = useState([]); // Store all appointments
    const [allAulas, setAllAulas] = useState([]); // Store all classes
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

    // Function to fetch all classes from new endpoint
    const fetchAllAulas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/agendamentos/aulas/');
            setAllAulas(response.data);
        } catch (err) {
            setError('Não foi possível carregar as aulas.');
            console.error('Erro ao buscar aulas:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudios();
        fetchAllAulas(); // Fetch all classes
    }, [fetchStudios, fetchAllAulas]);

    // a studio has a name and an id.
    const currentStudioName = useMemo(() => {
        return studios.find(s => s.id === selectedStudioId)?.nome;
    }, [studios, selectedStudioId]);

    // Process aulas with enrollment counts (directly from vagas_preenchidas field)
    const aulasWithEnrollments = useMemo(() => {
        return allAulas.map(aula => ({
            ...aula,
            alunosInscritos: parseInt(aula.vagas_preenchidas || "0"),
        }));
    }, [allAulas]);

    const filteredAulas = useMemo(() => {
        if (!currentStudioName) return [];

        return aulasWithEnrollments.filter(aula => {
            const isSameDate = isSameDay(parseISO(aula.data_hora_inicio), selectedDate);
            // The studio name in the class object must match the selected studio name
            const isSameStudio = aula.studio?.nome === currentStudioName;
            return isSameDate && isSameStudio;
        });
    }, [aulasWithEnrollments, selectedDate, currentStudioName]);


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
        aulasWithEnrollments.forEach(aula => {
            if (aula.studio?.nome === currentStudioName) {
                const date = format(parseISO(aula.data_hora_inicio), 'yyyy-MM-dd');
                dateSet.add(date);
            }
        });
        return dateSet;
    }, [aulasWithEnrollments, currentStudioName]);

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
