# backend/core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count, Avg, F
from drf_spectacular.utils import extend_schema

# Importar todos os modelos necessários
from financeiro.models import Pagamento, Matricula, Produto, VendaProduto
from agendamentos.models import Aula, ListaEspera, AulaAluno
from alunos.models import Aluno
from usuarios.models import Usuario, Colaborador
from studios.models import Studio
from notifications.models import Notification
from agendamentos.permissions import HasRole
from .serializers import DashboardSerializer

@extend_schema(tags=['Dashboard'])
class DashboardAPIView(APIView):
    """
    Endpoint que agrega dados de todo o sistema para o dashboard do Admin Master.
    """
    def get_permissions(self):
        """
        Instancia e retorna a lista de permissões que esta view requer.
        """
        return [IsAuthenticated(), HasRole.for_roles(['ADMIN_MASTER'])]

    def get(self, request, format=None):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        next_30_days = today + timedelta(days=30)
        last_15_days = today - timedelta(days=15)
        last_7_days = today - timedelta(days=7)
        last_30_days_datetime = timezone.now() - timedelta(days=30)

        # --- DADOS FINANCEIROS ---
        pagamentos_mes = Pagamento.objects.filter(data_vencimento__gte=start_of_month)
        receita_confirmada = pagamentos_mes.filter(status='PAGO').aggregate(total=Sum('valor_total'))['total'] or 0
        receita_pendente = pagamentos_mes.filter(status='PENDENTE').aggregate(total=Sum('valor_total'))['total'] or 0
        pagamentos_atrasados = Pagamento.objects.filter(status='ATRASADO').count()

        # --- DADOS DE AGENDAMENTOS ---
        aulas_hoje = Aula.objects.filter(data_hora_inicio__date=today)
        total_vagas_hoje = aulas_hoje.aggregate(total=Sum('capacidade_maxima'))['total'] or 1
        total_inscritos_hoje = AulaAluno.objects.filter(aula__in=aulas_hoje).count()
        taxa_ocupacao = (total_inscritos_hoje / total_vagas_hoje) * 100 if total_vagas_hoje > 0 else 0
        alunos_em_lista_espera = ListaEspera.objects.filter(status='AGUARDANDO').count()

        # --- DADOS DE USUÁRIOS E RETENÇÃO ---
        alunos_ativos = Aluno.objects.filter(is_active=True).count()
        colaboradores_ativos = Colaborador.objects.filter(status='ATIVO').count()
        novos_usuarios_semana = Usuario.objects.filter(date_joined__gte=last_7_days).count()
        matriculas_expirando = Matricula.objects.filter(data_fim__range=(today, next_30_days)).count()
        
        alunos_com_matricula_ativa = Aluno.objects.filter(usuario__matricula__data_fim__gte=today).distinct()
        alunos_com_aulas_recentes = Aluno.objects.filter(aulas_agendadas__aula__data_hora_inicio__gte=last_15_days).distinct()
        alunos_em_risco = alunos_com_matricula_ativa.exclude(pk__in=alunos_com_aulas_recentes).count()

        # --- ALERTAS ---
        notificacoes_nao_lidas = request.user.notifications.filter(is_read=False).count()
        # Esta é uma simplificação. Uma lógica real pode ser mais complexa.
        produtos_estoque_baixo = Produto.objects.filter(estoquestudio__quantidade__lte=5).distinct().count()

        # --- DADOS GERAIS ---
        total_studios = Studio.objects.count()

        # --- INSIGHTS ESTRATÉGICOS ---
        novas_matriculas_mes = Matricula.objects.filter(data_inicio__gte=start_of_month).count()
        
        receita_produtos_mes = Pagamento.objects.filter(
            status='PAGO',
            venda__isnull=False,
            data_pagamento__gte=start_of_month
        ).aggregate(total=Sum('valor_total'))['total'] or 0

        aulas_ultimos_30d = Aula.objects.filter(data_hora_inicio__gte=last_30_days_datetime, data_hora_inicio__lt=timezone.now())
        total_vagas_30d = aulas_ultimos_30d.aggregate(total=Sum('capacidade_maxima'))['total'] or 1
        total_inscritos_30d = AulaAluno.objects.filter(aula__in=aulas_ultimos_30d).count()
        taxa_ocupacao_30d = (total_inscritos_30d / total_vagas_30d) * 100 if total_vagas_30d > 0 else 0

        plano_popular_query = Matricula.objects.filter(data_fim__gte=today)\
            .values('plano__nome')\
            .annotate(total=Count('id'))\
            .order_by('-total').first()
        plano_mais_popular = plano_popular_query['plano__nome'] if plano_popular_query else "N/A"

        # CORREÇÃO APLICADA AQUI
        instrutor_destaque_query = Colaborador.objects.filter(
            aulas_principais__data_hora_inicio__gte=last_30_days_datetime
        ).annotate(
            media_alunos=Avg('aulas_principais__alunos_inscritos')
        ).order_by('-media_alunos').values(
            'usuario__first_name', 'usuario__last_name'
        ).first()

        instrutor_destaque = f"{instrutor_destaque_query['usuario__first_name']} {instrutor_destaque_query['usuario__last_name']}" if instrutor_destaque_query else "N/A"

        # --- MONTAGEM DO OBJETO DE DADOS ---
        data = {
            'financeiro': {
                'receita_confirmada_mes': receita_confirmada,
                'receita_pendente_mes': receita_pendente,
                'pagamentos_atrasados_total': pagamentos_atrasados,
            },
            'agendamentos': {
                'aulas_hoje': aulas_hoje.count(),
                'taxa_ocupacao_hoje': round(taxa_ocupacao, 2),
                'alunos_em_lista_espera': alunos_em_lista_espera,
            },
            'usuarios': {
                'alunos_ativos': alunos_ativos,
                'colaboradores_ativos': colaboradores_ativos,
                'novos_usuarios_semana': novos_usuarios_semana,
                'matriculas_expirando_mes': matriculas_expirando,
                'alunos_em_risco_churn': alunos_em_risco,
            },
            'alertas': {
                'notificacoes_nao_lidas': notificacoes_nao_lidas,
                'produtos_estoque_baixo': produtos_estoque_baixo,
            },
            'total_studios_ativos': total_studios,
            'insights_estrategicos': {
                'novas_matriculas_mes': novas_matriculas_mes,
                'receita_produtos_mes': receita_produtos_mes,
                'taxa_ocupacao_media_30d': round(taxa_ocupacao_30d, 2),
                'plano_mais_popular': plano_mais_popular,
                'instrutor_destaque': instrutor_destaque,
            }
        }

        serializer = DashboardSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)
