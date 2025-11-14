import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../context/ToastContext';

const useDetalhesAulaViewModel = (id) => {
    const [aula, setAula] = useState(null);
    const [alunos, setAlunos] = useState([]);
    const [listaDeEspera, setListaDeEspera] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            
            const [agendamentosRes, esperasRes, alunosRes] = await Promise.all([
                api.get('agendamentos/aulas-alunos/'),
                api.get('agendamentos/listas-espera/'),
                api.get('alunos/')
            ]);
            
            const todosAgendamentos = agendamentosRes.data;
            const todaListaDeEspera = esperasRes.data;
            const todosAlunos = alunosRes.data;

            const alunoMap = new Map(todosAlunos.map(aluno => [aluno.id, aluno]));

            const agendamentosDaAula = todosAgendamentos.filter(
                (ag) => ag.aula.id === parseInt(id)
            );

            if (agendamentosDaAula.length === 0) {
                try {
                    const aulaRes = await api.get(`aulas/${id}/`);
                    const aulaInfo = aulaRes.data;
                     const dataHora = new Date(aulaInfo.data_hora_inicio);
                    setAula({
                        ...aulaInfo,
                        nome: aulaInfo.modalidade.nome,
                        horario: format(dataHora, 'HH:mm'),
                        data: format(dataHora, "dd 'de' MMMM", { locale: ptBR }),
                        vagasOcupadas: 0,
                    });
                    setAlunos([]);
                } catch (aulaError) {
                     throw new Error("Aula não encontrada ou sem alunos agendados.");
                }
            } else {
                const aulaInfo = agendamentosDaAula[0].aula;
                const dataHora = new Date(aulaInfo.data_hora_inicio);
                
                setAula({
                    ...aulaInfo,
                    nome: aulaInfo.modalidade.nome,
                    horario: format(dataHora, 'HH:mm'),
                    data: format(dataHora, "dd 'de' MMMM", { locale: ptBR }),
                    vagasOcupadas: agendamentosDaAula.length,
                });
    
                const alunosDaAula = agendamentosDaAula.map(ag => ({
                    id: ag.id, // agendamento ID
                    nome: ag.aluno ? ag.aluno.nome : 'Aluno não encontrado',
                    foto: ag.aluno ? ag.aluno.foto : null,
                    status: ag.status_presenca,
                }));
    
                setAlunos(alunosDaAula);
            }

            const esperaDaAula = todaListaDeEspera
                .filter(item => item.aula === parseInt(id))
                .map(item => {
                    const alunoInfo = alunoMap.get(item.aluno);
                    return {
                        ...item,
                        aluno: alunoInfo ? { ...alunoInfo, nome: alunoInfo.nome } : { nome: 'Aluno não encontrado' }
                    };
                });

            setListaDeEspera(esperaDaAula);

        } catch (err) {
            setError('Erro ao carregar os detalhes da aula.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (agendamentoId, novoStatus) => {
        const originalAlunos = [...alunos];
        
        setAlunos(prevAlunos => prevAlunos.map(aluno => 
            aluno.id === agendamentoId ? { ...aluno, status: novoStatus } : aluno
        ));

        try {
            await api.patch(`agendamentos/aulas-alunos/${agendamentoId}/`, { status_presenca: novoStatus });
            showToast('Status do aluno atualizado com sucesso!', 'success');
        } catch (err) {
            console.error("Failed to update status", err);
            showToast('Erro ao atualizar o status do aluno.', 'error');
            setAlunos(originalAlunos);
        }
    };

    return {
        aula,
        alunos,
        listaDeEspera,
        loading,
        error,
        handleStatusChange,
    };
};

export default useDetalhesAulaViewModel;