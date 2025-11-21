# studios/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db import models
from django.db.models import Sum, Count, Avg, F

from .models import Studio
from .serializers import StudioSerializer, DashboardSerializer
from .permissions import IsAdminMasterOrReadOnly, IsStudioAdminOrAdminMaster

# Import models from other apps for aggregation
from financeiro.models import Matricula, Venda, EstoqueStudio, Pagamento, Produto
from avaliacoes.models import Avaliacao
from agendamentos.models import Aula, ListaEspera, AulaAluno
from alunos.models import Aluno
from usuarios.models import Usuario, Colaborador
from notifications.models import Notification

@extend_schema(
    tags=['Studios'],
    description='ViewSet para gerenciar os Studios (unidades).'
)
class StudioViewSet(viewsets.ModelViewSet):
    queryset = Studio.objects.all()
    serializer_class = StudioSerializer
    permission_classes = [IsAdminMasterOrReadOnly]


@extend_schema(
    tags=['Dashboard'],
    description='Endpoint para o dashboard de gerenciamento de um Studio específico.'
)
class DashboardStudioView(APIView):
    permission_classes = [IsStudioAdminOrAdminMaster]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='studio_pk', type=int, location=OpenApiParameter.PATH, description='ID do Studio'),
        ],
        responses={200: DashboardSerializer},
    )
    def get(self, request, studio_pk, format=None):
        studio = get_object_or_404(Studio, pk=studio_pk)
        self.check_object_permissions(request, studio)

        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        next_30_days = today + timedelta(days=30)
        last_15_days = today - timedelta(days=15)
        last_7_days = today - timedelta(days=7)
        last_30_days_datetime = timezone.now() - timedelta(days=30)

        # --- DADOS FINANCEIROS ---
        pagamentos_mes = Pagamento.objects.filter(
            (models.Q(matricula__studio=studio) | models.Q(venda__studio=studio)),
            data_vencimento__gte=start_of_month
        )
        receita_confirmada = pagamentos_mes.filter(status='PAGO').aggregate(total=Sum('valor_total'))['total'] or 0
        receita_pendente = pagamentos_mes.filter(status='PENDENTE').aggregate(total=Sum('valor_total'))['total'] or 0
        pagamentos_atrasados = Pagamento.objects.filter(
            (models.Q(matricula__studio=studio) | models.Q(venda__studio=studio)),
            status='ATRASADO'
        ).count()

        # --- DADOS DE AGENDAMENTOS ---
        aulas_hoje = Aula.objects.filter(studio=studio, data_hora_inicio__date=today)
        total_vagas_hoje = aulas_hoje.aggregate(total=Sum('capacidade_maxima'))['total'] or 1
        total_inscritos_hoje = AulaAluno.objects.filter(aula__in=aulas_hoje).count()
        taxa_ocupacao = (total_inscritos_hoje / total_vagas_hoje) * 100 if total_vagas_hoje > 0 else 0
        alunos_em_lista_espera = ListaEspera.objects.filter(aula__studio=studio, status='AGUARDANDO').count()

        # --- DADOS DE USUÁRIOS E RETENÇÃO ---
        alunos_ativos = Aluno.objects.filter(unidades=studio, usuario__is_active=True).count()
        colaboradores_ativos = Colaborador.objects.filter(vinculos_studio__studio=studio, status='ATIVO').count()
        novos_usuarios_semana = Usuario.objects.filter(
            models.Q(aluno__unidades=studio) | models.Q(colaborador__vinculos_studio__studio=studio),
            date_joined__gte=last_7_days
        ).distinct().count()
        
        matriculas_expirando = Matricula.objects.filter(studio=studio, data_fim__range=(today, next_30_days)).count()
        
        alunos_com_matricula_ativa = Aluno.objects.filter(
            unidades=studio, usuario__matricula__data_fim__gte=today
        ).distinct()
        alunos_com_aulas_recentes = Aluno.objects.filter(
            unidades=studio, aulas_agendadas__aula__data_hora_inicio__gte=last_15_days
        ).distinct()
        alunos_em_risco = alunos_com_matricula_ativa.exclude(pk__in=alunos_com_aulas_recentes).count()

        # --- ALERTAS ---
        notificacoes_nao_lidas = request.user.notifications.filter(is_read=False).count()
        produtos_estoque_baixo = EstoqueStudio.objects.filter(studio=studio, quantidade__lte=5).count()

        # --- DADOS GERAIS ---
        total_avaliacoes = Avaliacao.objects.filter(studio=studio).count()

        # --- INSIGHTS ESTRATÉGICOS ---
        novas_matriculas_mes = Matricula.objects.filter(studio=studio, data_inicio__gte=start_of_month).count()
        
        receita_produtos_mes = Pagamento.objects.filter(
            venda__studio=studio,
            status='PAGO',
            venda__isnull=False,
            data_pagamento__gte=start_of_month
        ).aggregate(total=Sum('valor_total'))['total'] or 0

        aulas_ultimos_30d = Aula.objects.filter(studio=studio, data_hora_inicio__gte=last_30_days_datetime, data_hora_inicio__lt=timezone.now())
        total_vagas_30d = aulas_ultimos_30d.aggregate(total=Sum('capacidade_maxima'))['total'] or 1
        total_inscritos_30d = AulaAluno.objects.filter(aula__in=aulas_ultimos_30d).count()
        taxa_ocupacao_30d = (total_inscritos_30d / total_vagas_30d) * 100 if total_vagas_30d > 0 else 0

        plano_popular_query = Matricula.objects.filter(studio=studio, data_fim__gte=today)\
            .values('plano__nome')\
            .annotate(total=Count('id'))\
            .order_by('-total').first()
        plano_mais_popular = plano_popular_query['plano__nome'] if plano_popular_query else "N/A"

        instrutor_destaque_query = Colaborador.objects.filter(
            vinculos_studio__studio=studio,
            aulas_principais__studio=studio,
            aulas_principais__data_hora_inicio__gte=last_30_days_datetime
        ).annotate(
            media_alunos=Avg('aulas_principais__alunos_inscritos')
        ).order_by('-media_alunos').values(
            'usuario__first_name', 'usuario__last_name'
        ).first()

        instrutor_destaque = f"{instrutor_destaque_query['usuario__first_name']} {instrutor_destaque_query['usuario__last_name']}" if instrutor_destaque_query else "N/A"

        # --- MONTAGEM DO OBJETO DE DADOS ---
        dashboard_data = {
            "studio_id": studio.id,
            "studio_name": studio.nome,
            'financeiro': {
                'receita_confirmada_mes': receita_confirmada,
                'receita_pendente_mes': receita_pendente,
                'pagamentos_atrasados_total': pagamentos_atrasados,
                'novas_matriculas_mes': novas_matriculas_mes,
                'receita_produtos_mes': receita_produtos_mes,
            },
            'agendamentos': {
                'aulas_hoje': aulas_hoje.count(),
                'taxa_ocupacao_hoje': round(taxa_ocupacao, 2),
                'alunos_em_lista_espera': alunos_em_lista_espera,
                'taxa_ocupacao_media_30d': round(taxa_ocupacao_30d, 2),
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
            'insights_estrategicos': {
                'plano_mais_popular': plano_mais_popular,
                'instrutor_destaque': instrutor_destaque,
                'total_avaliacoes': total_avaliacoes,
            }
        }

        serializer = DashboardSerializer(dashboard_data)
        # CORREÇÃO: Remover a chamada a .is_valid() e retornar diretamente serializer.data
        return Response(serializer.data)
