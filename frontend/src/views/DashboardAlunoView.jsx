import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import InfoCard from '../components/InfoCard';
import QuickActionButton from '../components/QuickActionButton';
import { useNavigate, useParams } from 'react-router-dom'; // Importar useNavigate
import useMeusAgendamentosViewModel from '../viewmodels/useMeusAgendamentosViewModel';
import { format, parseISO, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardAlunoView = () => {
  const { user, loading: authLoading } = useAuth();
  const { studioId } = useParams();
  const navigate = useNavigate(); // Inicializar useNavigate

  const {
    loading: agendamentosLoading,
    nextClass,
  } = useMeusAgendamentosViewModel();

  const [creditosDisponiveis, setCreditosDisponiveis] = useState(null);
  const [creditosLoading, setCreditosLoading] = useState(true);

  useEffect(() => {
    const fetchCreditos = async () => {
      setCreditosLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCreditosDisponiveis(10); // Dados mockados
      setCreditosLoading(false);
    };
    fetchCreditos();
  }, []);


  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <p className="text-gray-700 dark:text-gray-300">Carregando usuário...</p>
      </div>
    );
  }

  const alunoName = user?.nome || 'Aluno';
  const greetingMessage = `Olá, ${alunoName}!`;

  let nextClassModalidade = 'Nenhuma aula futura agendada.';
  let nextClassStudio = '';
  let nextClassDateTime = '';
  let nextClassLoading = agendamentosLoading;

  if (!agendamentosLoading && nextClass) {
    const aula = nextClass.aula;
    const parsedStartDate = parseISO(aula.data_hora_inicio);
    const endDate = addMinutes(parsedStartDate, aula.duracao_minutos);

    const formattedFullDate = format(parsedStartDate, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
    const startTime = format(parsedStartDate, 'HH:mm');
    const endTime = format(endDate, 'HH:mm');

    nextClassModalidade = `${aula.modalidade?.nome || 'Modalidade Indisponível'}`;
    nextClassStudio = `${aula.studio?.nome || 'Estúdio Indisponível'}`;
    nextClassDateTime = `${formattedFullDate} | ${startTime} - ${endTime}`;
  } else if (!agendamentosLoading && !nextClass) {
    nextClassModalidade = 'Nenhuma aula futura agendada.';
    nextClassStudio = '';
    nextClassDateTime = 'Que tal marcar uma?';
  }

  // Função para lidar com o clique no InfoCard da próxima aula
  const handleNextClassClick = () => {
    if (nextClass && nextClass.aula) {
      const aula = nextClass.aula;
      navigate('/aluno/meus-agendamentos', {
        state: {
          initialDate: aula.data_hora_inicio, // Passa a data completa
          initialStudioId: aula.studio?.id, // Passa o ID do estúdio
        },
      });
    } else {
      // Se não houver próxima aula, redireciona para a tela de marcar aula
      navigate('/aluno/marcar-aula');
    }
  };


  return (
    <div className="min-h-screen w-full flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-white transition-colors duration-300">
      <Header greeting={greetingMessage} />

      <main className="flex-1 p-4 space-y-4 md:p-6 md:space-y-6 lg:p-8 lg:space-y-8">
        {/* Seção de Créditos Disponíveis */}
        <section>
          <StatCard
            title="Créditos Disponíveis"
            value={creditosLoading ? '' : creditosDisponiveis}
            iconName="account_balance_wallet"
            isLoading={creditosLoading}
            bgColorClass="bg-primary/20"
            textColorClass="text-primary"
          />
        </section>

        {/* Seção de Próxima Aula */}
        <section>
          <InfoCard
            title="Sua Próxima Aula"
            isLoading={nextClassLoading}
            onClick={!nextClassLoading ? handleNextClassClick : undefined} // Torna o card clicável se não estiver carregando
          >
            {nextClassLoading ? null : (
              nextClass ? (
                <>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">{nextClassModalidade} - {nextClassStudio}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{nextClassDateTime}</p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300">{nextClassModalidade}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{nextClassDateTime}</p>
                </>
              )
            )}
          </InfoCard>
        </section>

        {/* Seção de Ações Rápidas */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Ações Rápidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <QuickActionButton iconName="calendar_month" label="Marcar Aula" to="/aluno/marcar-aula" />
            <QuickActionButton iconName="event_note" label="Meus Agendamentos" to="/aluno/meus-agendamentos" />
            <QuickActionButton iconName="assignment" label="Meus Planos" to="/aluno/meus-planos" />
            <QuickActionButton iconName="history" label="Histórico de Aulas" to="/aluno/historico-aulas" />
            <QuickActionButton iconName="receipt_long" label="Minhas Matrículas" to="/aluno/minhas-matriculas" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardAlunoView;
