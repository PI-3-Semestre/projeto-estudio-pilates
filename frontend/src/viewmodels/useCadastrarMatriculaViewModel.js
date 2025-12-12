import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import alunosService from '../services/alunosService';
import planosService from '../services/planosService';
import studiosService from '../services/studiosService';
import matriculasService from '../services/matriculasService';
import { useToast } from '../context/ToastContext';

const useCadastrarMatriculaViewModel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    // Estados do formulário
    const [alunoSearchQuery, setAlunoSearchQuery] = useState('');
    const [alunoSearchResults, setAlunoSearchResults] = useState([]);
    const [selectedAluno, setSelectedAluno] = useState(null);
    
    const [allPlanos, setAllPlanos] = useState([]);
    const [selectedPlano, setSelectedPlano] = useState(null);

    const [allStudios, setAllStudios] = useState([]);
    const [selectedStudio, setSelectedStudio] = useState('');

    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    // Estados de controle
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isRenovacao, setIsRenovacao] = useState(false);
    const [matriculaAnterior, setMatriculaAnterior] = useState(null);
    const [novaMatricula, setNovaMatricula] = useState(null);

    // Função de inicialização para renovação
    const initializeRenovacao = useCallback((matriculaParaRenovar) => {
        setIsRenovacao(true);
        setMatriculaAnterior(matriculaParaRenovar);
        setSelectedAluno(matriculaParaRenovar.aluno);
        
        // Reintroduzida a lógica de pré-seleção do estúdio
        const studioId = matriculaParaRenovar.studio?.id || matriculaParaRenovar.studio;
        setSelectedStudio(studioId);

        const dataFimAnterior = new Date(matriculaParaRenovar.data_fim);
        const novaDataInicio = new Date(dataFimAnterior.valueOf() + 86400000); // Adiciona 1 dia
        setDataInicio(novaDataInicio.toISOString().split('T')[0]);
    }, []);

    // Busca de dados iniciais e lógica de pré-preenchimento
    useEffect(() => {
        const { matriculaParaRenovar } = location.state || {};
        if (matriculaParaRenovar) {
            initializeRenovacao(matriculaParaRenovar);
        }

        setLoading(true);
        Promise.all([
            planosService.getAllPlanos(),
            studiosService.getAllStudios(),
        ]).then(([planosResponse, studiosResponse]) => {
            setAllPlanos(planosResponse.data);
            setAllStudios(studiosResponse.data);
        }).catch(() => {
            showToast('Erro ao carregar planos e estúdios.', { type: 'error' });
        }).finally(() => {
            setLoading(false);
        });
    }, [location.state, initializeRenovacao, showToast]);

    // Busca de alunos
    useEffect(() => {
        if (alunoSearchQuery.length < 3) {
            setAlunoSearchResults([]);
            return;
        }
        const handler = setTimeout(() => {
            alunosService.searchAlunos(alunoSearchQuery)
                .then(response => setAlunoSearchResults(response.data))
                .catch(() => showToast('Erro ao buscar alunos.', { type: 'error' }));
        }, 300);
        return () => clearTimeout(handler);
    }, [alunoSearchQuery, showToast]);

    // Cálculo da data de fim
    useEffect(() => {
        if (dataInicio && selectedPlano) {
            const startDate = new Date(dataInicio);
            startDate.setDate(startDate.getDate() + selectedPlano.duracao_dias);
            setDataFim(startDate.toISOString().split('T')[0]);
        } else {
            setDataFim('');
        }
    }, [dataInicio, selectedPlano]);

    // Submissão do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAluno || !selectedPlano || !selectedStudio || !dataInicio || !dataFim) {
            showToast('Preencha todos os campos obrigatórios.', { type: 'warning' });
            return;
        }
        setSubmitting(true);

        const matriculaData = {
            aluno_id: selectedAluno.usuario_id || selectedAluno.id,
            plano_id: selectedPlano.id,
            studio_id: selectedStudio,
            data_inicio: dataInicio,
            data_fim: dataFim,
        };

        try {
            const response = await matriculasService.createMatricula(matriculaData);
            setNovaMatricula(response.data);
            showToast(`Matrícula ${isRenovacao ? 'de renovação ' : ''}registrada com sucesso!`, { type: 'success' });
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Erro ao registrar a matrícula.';
            showToast(errorMessage, { type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        alunoSearchQuery, setAlunoSearchQuery,
        alunoSearchResults, setAlunoSearchResults,
        selectedAluno, setSelectedAluno,
        allPlanos,
        selectedPlano, setSelectedPlano,
        allStudios,
        selectedStudio, setSelectedStudio,
        dataInicio, setDataInicio,
        dataFim, setDataFim,
        loading,
        submitting,
        isRenovacao,
        matriculaAnterior,
        novaMatricula,
        setNovaMatricula,
        handleSubmit,
    };
};

export default useCadastrarMatriculaViewModel;
