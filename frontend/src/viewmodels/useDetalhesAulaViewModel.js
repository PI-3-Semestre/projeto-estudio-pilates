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

            // Busca agendamentos e lista de espera em paralelo
            const [agendamentosRes, esperasRes] = await Promise.all([
                api.get('agendamentos/aulas-alunos/'),
                api.get(`agendamentos/aulas/${id}/lista-espera/`) // Nova rota específica
            ]);

            const todosAgendamentos = agendamentosRes.data;
            const todaListaDeEspera = esperasRes.data;

            // Filtra agendamentos para a aula atual
            const agendamentosDaAula = todosAgendamentos.filter(
                (ag) => ag.aula.id === parseInt(id)
            );

            // Define os detalhes da aula
            if (agendamentosDaAula.length > 0) {
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
                    id: ag.id,
                    nome: ag.aluno ? ag.aluno.nome : 'Aluno não encontrado',
                    foto: ag.aluno ? ag.aluno.foto : null,
                    status: ag.status_presenca,
                }));
                setAlunos(alunosDaAula);
            } else {
                // Se não houver alunos, busca os detalhes da aula separadamente
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
                    throw new Error("Aula não encontrada.");
                }
            }

            // Mapeia a lista de espera com a nova estrutura do JSON
            const esperaDaAula = todaListaDeEspera.map(item => ({
                id: item.id,
                data_inscricao: item.data_inscricao,
                status: item.status,
                aula: item.aula,
                aluno: {
                    id: item.aluno,
                    nome: item.aluno_nome, // Nova propriedade do JSON
                    foto: null // O novo endpoint não fornece a foto
                }
            }));

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

    return {
        aula,
        alunos,
        listaDeEspera,
        loading,
        error,
        handleStatusChange,
        handleDeleteAgendamento,
        handleRemoveFromWaitlist,
    };
};

export default useDetalhesAulaViewModel;
