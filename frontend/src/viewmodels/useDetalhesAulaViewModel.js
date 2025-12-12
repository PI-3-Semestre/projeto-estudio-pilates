import { useState, useEffect, useCallback } from 'react';
import api, { getAlunoPorCpf } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../context/ToastContext';

const useDetalhesAulaViewModel = (id) => {
    const [aula, setAula] = useState(null);
    const [alunos, setAlunos] = useState([]);
    const [listaDeEspera, setListaDeEspera] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [foundStudent, setFoundStudent] = useState(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);

            // Busca inscrições da aula específica usando nova rota
            const inscricoesRes = await api.get(`/agendamentos/aulas/${id}/inscricoes/`);

            const inscricoesDaAula = inscricoesRes.data;

            if (inscricoesDaAula.length > 0) {
                // Usa os dados da aula do primeiro item das inscrições
                const aulaInfo = inscricoesDaAula[0].aula;
                const dataHora = new Date(aulaInfo.data_hora_inicio);

                setAula({
                    ...aulaInfo,
                    nome: aulaInfo.modalidade.nome,
                    horario: format(dataHora, 'HH:mm'),
                    data: format(dataHora, "dd 'de' MMMM", { locale: ptBR }),
                    vagasOcupadas: inscricoesDaAula.length,
                });

                // Processa alunos das inscrições
                const alunosDaAula = inscricoesDaAula.map(inscricao => ({
                    id: inscricao.id,
                    nome: inscricao.aluno ? inscricao.aluno.nome : 'Aluno não encontrado',
                    foto: inscricao.aluno ? inscricao.aluno.foto : null,
                    status: inscricao.status_presenca,
                    aluno: inscricao.aluno, // Mantém referência completa
                }));
                setAlunos(alunosDaAula);
            } else {
                // Se não houver inscrições, busca diretamente detalhes da aula
                try {
                    const aulaRes = await api.get(`/agendamentos/aulas/`);
                    const aulaEncontrada = aulaRes.data.find(a => a.id === parseInt(id));

                    if (aulaEncontrada) {
                        const dataHora = new Date(aulaEncontrada.data_hora_inicio);
                        setAula({
                            ...aulaEncontrada,
                            nome: aulaEncontrada.modalidade.nome,
                            horario: format(dataHora, 'HH:mm'),
                            data: format(dataHora, "dd 'de' MMMM", { locale: ptBR }),
                            vagasOcupadas: 0,
                        });
                    } else {
                        throw new Error("Aula não encontrada.");
                    }
                    setAlunos([]);
                } catch (aulaError) {
                    throw new Error("Aula não encontrada.");
                }
            }

            // Ainda precisamos buscar lista de espera separadamente
            // Por enquanto, usar lista vazia
            setListaDeEspera([]);

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
            await api.patch(`/agendamentos/aulas-alunos/${agendamentoId}/`, { status_presenca: novoStatus });
            showToast('Status do aluno atualizado com sucesso!', 'success');
        } catch (err) {
            console.error("Failed to update status", err);
            showToast('Erro ao atualizar o status do aluno.', 'error');
            setAlunos(originalAlunos);
        }
    };

    const handleDeleteAgendamento = async (agendamentoId) => {
        try {
            await api.delete(`agendamentos/aulas-alunos/${agendamentoId}/`);
            showToast('Agendamento deletado com sucesso!', 'success');
            fetchData(); // Refresh data
        } catch (err) {
            console.error("Failed to delete agendamento", err);
            showToast('Erro ao deletar agendamento.', 'error');
        }
    };

    const handleSearchStudent = async (cpf) => {
        try {
            const alunoRes = await getAlunoPorCpf(cpf);
            setFoundStudent(alunoRes.data);
        } catch (err) {
            console.error("Failed to find student", err);
            if (err.response && err.response.status === 404) {
                showToast('Aluno não encontrado com esse CPF.', 'error');
            } else {
                showToast('Erro ao buscar aluno.', 'error');
            }
        }
    };

    const handleConfirmAdd = async (usuarioId) => {
        try {
            await api.post('agendamentos/aulas-alunos/', {
                aula: parseInt(id),
                aluno: usuarioId
            });

            showToast('Aluno adicionado à aula com sucesso!', 'success');
            setFoundStudent(null);
            fetchData(); // Refresh data
        } catch (err) {
            console.error("Failed to add student", err);
            showToast('Erro ao adicionar aluno à aula.', 'error');
        }
    };

    const handleRemoveFromWaitlist = async (waitlistItemId) => {
        try {
            await api.delete(`agendamentos/listas-espera/${waitlistItemId}/`);
            showToast('Removido da lista de espera com sucesso!', 'success');
            fetchData(); // Refresh data
        } catch (err) {
            console.error("Failed to remove from waitlist", err);
            showToast('Erro ao remover da lista de espera.', 'error');
        }
    };

    const handleDeleteAula = async () => {
        try {
            await api.delete(`agendamentos/aulas/${id}/`);
            showToast('Aula deletada com sucesso!', 'success');
            // Navigate back after deletion
        } catch (err) {
            console.error("Failed to delete aula", err);
            showToast('Erro ao deletar aula.', 'error');
        }
    };

    return {
        aula,
        alunos,
        listaDeEspera,
        loading,
        error,
        foundStudent,
        handleStatusChange,
        handleDeleteAgendamento,
        handleRemoveFromWaitlist,
        handleSearchStudent,
        handleConfirmAdd,
        handleDeleteAula,
    };
};

export default useDetalhesAulaViewModel;
