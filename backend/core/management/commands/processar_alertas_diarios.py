# core/management/commands/processar_alertas_diarios.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from financeiro.models import Matricula
from agendamentos.models import AulaAluno
from alunos.models import Aluno
from notifications.models import Notification
from usuarios.models import Usuario

class Command(BaseCommand):
    help = 'Processa e gera notificações diárias para administradores e alunos.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando processamento de alertas diários...'))
        
        self.notificar_matriculas_expirando()
        self.notificar_alunos_inativos()

        self.stdout.write(self.style.SUCCESS('Processamento de alertas diários concluído.'))

    def notificar_matriculas_expirando(self):
        """
        Cenário 3: Notifica alunos cujas matrículas expiram em 7 dias.
        """
        data_alvo = timezone.now().date() + timedelta(days=7)
        matriculas = Matricula.objects.filter(data_fim=data_alvo)

        for matricula in matriculas:
            Notification.objects.get_or_create(
                recipient=matricula.aluno,
                message=f"Atenção! Sua matrícula no {matricula.plano.nome} expira em 7 dias. Renove agora para não perder seus benefícios.",
                level=Notification.NotificationLevel.WARNING,
                content_object=matricula
            )
        self.stdout.write(f'  - {matriculas.count()} notificações de matrículas expirando enviadas.')

    def notificar_alunos_inativos(self):
        """
        Cenário 6: Notifica admins sobre alunos ativos mas sem agendamentos recentes.
        """
        admins = Usuario.objects.filter(role__in=['ADMIN_MASTER', 'ADMINISTRADOR'])
        if not admins.exists():
            return

        data_limite = timezone.now() - timedelta(days=15)
        
        # Alunos com matrícula ativa
        alunos_ativos = Aluno.objects.filter(matricula__data_fim__gte=timezone.now().date()).distinct()
        
        alunos_inativos_count = 0
        for aluno in alunos_ativos:
            # Verifica se há algum agendamento recente
            agendamento_recente = AulaAluno.objects.filter(aluno=aluno, aula__data_hora_inicio__gte=data_limite).exists()
            
            if not agendamento_recente:
                # Cria notificação para cada admin
                for admin in admins:
                    Notification.objects.get_or_create(
                        recipient=admin,
                        message=f"O aluno {aluno.usuario.get_full_name()} tem uma matrícula ativa mas não agenda uma aula há 15 dias.",
                        level=Notification.NotificationLevel.WARNING,
                        content_object=aluno
                    )
                alunos_inativos_count += 1
        
        self.stdout.write(f'  - {alunos_inativos_count} alertas de alunos inativos gerados para {admins.count()} admin(s).')
