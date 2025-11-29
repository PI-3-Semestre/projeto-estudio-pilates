# agendamentos/serializers.py
import datetime
from rest_framework import serializers
from .models import (
    HorarioTrabalho,
    BloqueioAgenda,
    Modalidade,
    Aula,
    AulaAluno,
    Reposicao,
    ListaEspera,
    CreditoAula,
    Aluno
)
from studios.models import Studio
from datetime import timedelta
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from alunos.serializers import AlunoSerializer # Importar o AlunoSerializer

class HorarioTrabalhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioTrabalho
        fields = "__all__"


class BloqueioAgendaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueioAgenda
        fields = ['id', 'data', 'descricao', 'studio']

class BloqueioAgendaReadSerializer(serializers.ModelSerializer):
    studio = serializers.StringRelatedField(read_only=True)
    studio_id = serializers.IntegerField(source='studio.id', read_only=True)
    class Meta:
        model = BloqueioAgenda
        fields = ['id', 'data', 'descricao', 'studio', 'studio_id']


class ModalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modalidade
        fields = "__all__"


class StudioNestedSerializer(serializers.ModelSerializer):
    """
    Serializer leve para representar o Studio em respostas aninhadas.
    Retorna apenas os campos essenciais: id, nome e agora o endereço.
    """
    class Meta:
        model = Studio
        fields = ['id', 'nome', 'endereco'] # Adicionado o campo 'endereco'


class AulaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = [
            "data_hora_inicio",
            "capacidade_maxima",
            "duracao_minutos",
            "tipo_aula",
            "modalidade",
            "studio",
            "instrutor_principal",
            "instrutor_substituto",
        ]

class AulaReadSerializer(serializers.ModelSerializer):
    modalidade = ModalidadeSerializer(read_only=True)
    instrutor_principal = serializers.StringRelatedField(read_only=True)
    instrutor_substituto = serializers.StringRelatedField(read_only=True)
    studio = StudioNestedSerializer(read_only=True)
    
    # NOVO CAMPO: vagas_preenchidas
    vagas_preenchidas = serializers.SerializerMethodField()

    class Meta:
        model = Aula
        fields = [
            "id",
            "data_hora_inicio",
            "capacidade_maxima",
            "duracao_minutos",
            "tipo_aula",
            "modalidade",
            "studio",
            "instrutor_principal",
            "instrutor_substituto",
            "vagas_preenchidas", # <-- Adicione o campo aqui também
        ]   
    
    # NOVO MÉTODO: get_vagas_preenchidas
    def get_vagas_preenchidas(self, obj):
        """
        Calcula o número de vagas preenchidas para a aula.
        Conta apenas os agendamentos com status 'AGENDADO'.
        """
        return obj.alunos_inscritos.filter(status_presenca='AGENDADO').count()


class AulaAlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AulaAluno
        fields = '__all__'
        
class AgendamentoAlunoReadSerializer(serializers.ModelSerializer):
    """
    Serializer para LEITURA (GET) de agendamentos.
    Mostra os detalhes completos da aula aninhados, em vez de apenas o ID.
    """
    # Aninha o AulaSerializer
    aula = AulaReadSerializer(read_only=True)
    
    # Aninha os detalhes do aluno
    aluno = AlunoSerializer(read_only=True) 

    class Meta:
        model = AulaAluno
        fields = ['id', 'aula', 'aluno', 'status_presenca', 'credito_utilizado']
        # Usamos 'depth = 1' ou definimos os campos aninhados manualmente
        # Optámos por definir 'aula' e 'aluno' manualmente para melhor controlo.
class AgendamentoAlunoSerializer(serializers.ModelSerializer):
    """
    Serializer para o Aluno agendar sua própria aula.
    O 'aluno' é 'read_only' pois será pego do request.user.
    """
    aluno = serializers.PrimaryKeyRelatedField(read_only=True)
    entrar_lista_espera = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = AulaAluno
        # --- CORREÇÃO (Dúvida do ID auto-increment) ---
        fields = ['id', 'aula', 'aluno', 'status_presenca', 'credito_utilizado', 'entrar_lista_espera']
        read_only_fields = [
            'id',
            'aluno', # Pego do request.user
            'status_presenca',
            'credito_utilizado'
        ]

    # --- INÍCIO DA NOVA LÓGICA (ISSUE #63 - FLUXO ALUNO) ---
    def validate(self, attrs):
        """
        Validação customizada para o Aluno:
        1. Impedir agendamentos duplos (conflito de horário).
        2. Verificar disponibilidade de vagas ou adicionar à lista de espera.
        3. Verificar e preparar consumo de crédito (Issue #57).
        """
        aula = attrs.get('aula')
        
        # 1. Obter o aluno a partir do contexto da requisição
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not hasattr(request.user, 'aluno'):
            raise ValidationError("Não foi possível identificar o perfil do aluno logado.")
            
        aluno = request.user.aluno

        # Verificar se o aluno já está inscrito nesta aula
        if AulaAluno.objects.filter(aula=aula, aluno=aluno).exists():
            raise ValidationError({"detail": "Você já está inscrito nesta aula."})
        
        # --- 2. Validação de Conflito de Horário (LÓGICA EM PYTHON) ---
        horario_inicio_desejado = aula.data_hora_inicio
        horario_fim_desejado = horario_inicio_desejado + timedelta(minutes=aula.duracao_minutos)
        
        # Busca os agendamentos existentes (sem cálculos complexos)
        agendamentos_existentes = AulaAluno.objects.filter(
            aluno=aluno,
            status_presenca='AGENDADO'
        ).select_related('aula') # Otimiza a query para buscar os dados da aula
        
        # Se for atualização, exclui o próprio agendamento da checagem
        if self.instance:
            agendamentos_existentes = agendamentos_existentes.exclude(pk=self.instance.pk)

        # Loop em Python para verificar conflito
        for agendamento_existente in agendamentos_existentes:
            inicio_existente = agendamento_existente.aula.data_hora_inicio
            fim_existente = inicio_existente + timedelta(minutes=agendamento_existente.aula.duracao_minutos)
            
            # Lógica de conflito (A se sobrepõe a B se A_inicio < B_fim E A_fim > B_inicio)
            conflito = (
                horario_inicio_desejado < fim_existente and
                horario_fim_desejado > inicio_existente
            )
            
            if conflito:
                raise ValidationError(
                    f"Conflito de agendamento. Você já está inscrito na aula '{agendamento_existente.aula}' que ocorre de {inicio_existente.strftime('%H:%M')} às {fim_existente.strftime('%H:%M')}."
                )

        # --- 3. Validação de Vagas na Aula ---
        vagas_ocupadas = AulaAluno.objects.filter(aula=aula, status_presenca='AGENDADO').count()
        is_update_sem_mudanca_aula = self.instance and self.instance.aula == aula
        
        if not is_update_sem_mudanca_aula: 
            if vagas_ocupadas >= aula.capacidade_maxima:
                # Se a aula está cheia, verifica se o aluno quer entrar na lista de espera
                if attrs.get('entrar_lista_espera'):
                    # Verifica se o aluno já está na lista de espera
                    if ListaEspera.objects.filter(aula=aula, aluno=aluno).exists():
                        raise ValidationError({"detail": "Você já está na lista de espera para esta aula."})
                    
                    # Adiciona o aluno à lista de espera
                    ListaEspera.objects.create(aula=aula, aluno=aluno)
                    attrs['_adicionado_lista_espera'] = True
                    return attrs
                else:
                    raise ValidationError("Não há mais vagas disponíveis nesta aula. Para entrar na lista de espera, envie 'entrar_lista_espera: true'.")

        
        # --- 4. Validação e Preparação para Consumo de Crédito ---
        if aula.tipo_aula == Aula.TipoAula.REGULAR:
            credito_disponivel = CreditoAula.objects.filter(
                aluno=aluno,
                # ANTES: status=CreditoAula.StatusCredito.DISPONIVEL,
                data_invalidacao__isnull=True, # Significa que não foi usado/invalidado
                data_validade__gte=horario_inicio_desejado.date()
            ).order_by('data_validade').first()

            if not credito_disponivel:
                 raise ValidationError("Você não possui créditos de aula disponíveis ou válidos para este agendamento.")
            
            # Guarda o crédito para ser usado no método perform_create da view
            attrs['credito_a_utilizar'] = credito_disponivel 

        return attrs
        
class AgendamentoStaffSerializer(serializers.ModelSerializer):
    """
    Serializer para o Staff agendar um aluno em uma aula.
    O 'aluno' é explícito e obrigatório.
    """
    aluno = serializers.PrimaryKeyRelatedField(queryset=Aluno.objects.all()) 
    entrar_lista_espera = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = AulaAluno
        # --- CORREÇÃO (Dúvida do ID auto-increment) ---
        fields = ['id', 'aula', 'aluno', 'status_presenca', 'credito_utilizado', 'entrar_lista_espera']
        read_only_fields = [
            'id',
            'status_presenca',
            'credito_utilizado'
        ]
        # (Agora 'aula' e 'aluno' são de escrita, que é o correto)

    # --- INÍCIO DA NOVA LÓGICA (ISSUE #63) ---
    def validate(self, attrs):
        """
        Validação para:
        1. Impedir agendamentos duplos (conflito de horário).
        2. Verificar disponibilidade de vagas ou adicionar à lista de espera.
        3. Verificar e preparar consumo de crédito (Issue #57).
        """
        aula = attrs.get('aula')
        aluno = attrs.get('aluno')
        
        if not aula or not aluno:
            return attrs 

        # Verificar se o aluno já está inscrito nesta aula
        if AulaAluno.objects.filter(aula=aula, aluno=aluno).exists():
            raise ValidationError({"detail": f"O aluno {aluno} já está inscrito nesta aula."})
            
        # --- 1. Validação de Conflito de Horário (LÓGICA EM PYTHON) ---
        horario_inicio_desejado = aula.data_hora_inicio
        horario_fim_desejado = horario_inicio_desejado + timedelta(minutes=aula.duracao_minutos)
        
        # Busca os agendamentos existentes (sem cálculos complexos)
        agendamentos_existentes = AulaAluno.objects.filter(
            aluno=aluno,
            status_presenca='AGENDADO' 
        ).select_related('aula') # Otimiza a query para buscar os dados da aula

        # Se for atualização, exclui o próprio agendamento da checagem
        if self.instance:
            agendamentos_existentes = agendamentos_existentes.exclude(pk=self.instance.pk)

        # Loop em Python para verificar conflito
        for agendamento_existente in agendamentos_existentes:
            inicio_existente = agendamento_existente.aula.data_hora_inicio
            fim_existente = inicio_existente + timedelta(minutes=agendamento_existente.aula.duracao_minutos)
            
            # Lógica de conflito (A se sobrepõe a B se A_inicio < B_fim E A_fim > B_inicio)
            conflito = (
                horario_inicio_desejado < fim_existente and
                horario_fim_desejado > inicio_existente
            )
            
            if conflito:
                raise ValidationError(
                    f"Conflito de agendamento. O aluno já está inscrito na aula '{agendamento_existente.aula}' que ocorre de {inicio_existente.strftime('%H:%M')} às {fim_existente.strftime('%H:%M')}."
                )
        # Validação de Vagas na Aula
        vagas_ocupadas = AulaAluno.objects.filter(aula=aula, status_presenca='AGENDADO').count()
        
        is_update_sem_mudanca_aula = self.instance and self.instance.aula == aula
        
        # Só valida vagas se é uma criação OU é uma atualização para uma nova aula
        if not is_update_sem_mudanca_aula: 
            if vagas_ocupadas >= aula.capacidade_maxima:
                if attrs.get('entrar_lista_espera'):
                    if ListaEspera.objects.filter(aula=aula, aluno=aluno).exists():
                        raise ValidationError({"detail": f"O aluno {aluno} já está na lista de espera para esta aula."})
                    
                    ListaEspera.objects.create(aula=aula, aluno=aluno)
                    attrs['_adicionado_lista_espera'] = True
                    return attrs
                else:
                    raise ValidationError("Não há mais vagas disponíveis nesta aula. Para adicionar o aluno à lista de espera, envie 'entrar_lista_espera: true'.")

        
        # Validação e Preparação para Consumo de Crédito
        # Só consome crédito se for uma aula REGULAR e se for uma criação 
        # A lógica exata de quando/como encontrar o crédito DISPONIVEL pode variar.
        
        if aula.tipo_aula == Aula.TipoAula.REGULAR:
            credito_disponivel = CreditoAula.objects.filter(
                aluno=aluno,
                data_invalidacao__isnull=True, # Significa que não foi usado/invalidado
                data_validade__gte=horario_inicio_desejado.date()
            ).order_by('data_validade').first()

            if not credito_disponivel:
                 raise ValidationError("Aluno não possui créditos de aula disponíveis ou válidos para este agendamento.")
            
            attrs['credito_a_utilizar'] = credito_disponivel 
            # NÃO mudamos o status do crédito aqui, isso deve ser feito atomicamente 
            # ao salvar o agendamento no método create/update.

        return attrs
    
    def create(self, validated_data):
        validated_data.pop('entrar_lista_espera', None)
        credito_a_utilizar = validated_data.pop('credito_a_utilizar', None)
        agendamento = super().create(validated_data) # Cria o AulaAluno

        if credito_a_utilizar:
            credito_a_utilizar.data_invalidacao = timezone.now()
            # O 'invalidado_por' deve ser o Aluno, se ele mesmo agendou?
            # Ou o Staff? O serializer do Staff não tem acesso ao request.user...
            # Vamos assumir que invalidar a data é suficiente por agora.
            # Se 'invalidado_por' for obrigatório, teremos de passar o request.user
            # para o .create() a partir da view.
            credito_a_utilizar.save()
            agendamento.save()

        return agendamento

    def update(self, instance, validated_data):
        # Ex: O que acontece se mudar de aula? Libera o crédito antigo? Usa um novo?
        # Por enquanto, vamos manter simples e não mexer no crédito no update.
        # A validação no `validate` já garante que não haja conflito.
        validated_data.pop('credito_a_utilizar', None) # Remove se existir
        return super().update(instance, validated_data)

class ReposicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reposicao
        fields = "__all__"


class ListaEsperaSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.StringRelatedField(source='aluno', read_only=True)
    aula_modalidade = serializers.StringRelatedField(source='aula.modalidade', read_only=True)
    aula_data_hora_inicio = serializers.DateTimeField(source='aula.data_hora_inicio', read_only=True)

    class Meta:
        model = ListaEspera
        fields = [
            'id',
            'aula',
            'aula_modalidade',
            'aula_data_hora_inicio',
            'aluno',
            'aluno_nome',
            'data_inscricao',
            'status'
        ]

class CreditoAulaSerializer(serializers.ModelSerializer):
    """
    Serializer para LEITURA (GET) dos créditos de aula do aluno (Tarefa da Issue #62).
    Mostra o status, a validade e a origem/uso do crédito.
    """
    
    # Opcional: Mostrar o ID da aula que usou este crédito.
    agendamento_uso = serializers.PrimaryKeyRelatedField(read_only=True, many=True)
    
    # Opcional: Mostrar o ID do agendamento cancelado que gerou este crédito (se aplicável)
    agendamento_origem = serializers.PrimaryKeyRelatedField(read_only=True)

    adicionado_por_nome = serializers.SerializerMethodField()
    invalidado_por_nome = serializers.SerializerMethodField()
    
    matricula_id = serializers.IntegerField(
        source='matricula_origem.id', 
        read_only=True,
        allow_null=True # Permite que seja nulo (p/ créditos manuais)
    )
    
    # Isto irá "pular" da Matrícula para o Plano e pegar o nome
    plano_nome = serializers.CharField(
        source='matricula_origem.plano.nome', 
        read_only=True,
        allow_null=True # Permite que seja nulo (p/ créditos manuais)
    )
    
    class Meta:
        model = CreditoAula
        fields = [
            "id",
            "aluno",  # Será preenchido pela view (da URL)
            "quantidade",  # Obrigatório no POST
            "data_validade",
            "matricula_id",      
            "plano_nome",
            "data_adicao",
            "adicionado_por",
            "adicionado_por_nome",  # Campo de auditoria (GET)
            "data_invalidacao",
            "invalidado_por",
            "invalidado_por_nome",  # Campo de auditoria (GET)
            "agendamento_origem",  # Para créditos de reposição
            "agendamento_uso" 
        ]

        # Define quais campos SÃO OBRIGATÓRIOS no POST/PATCH
        # (Todos os outros em 'fields' serão 'read-only' por padrão)
        extra_kwargs = {
            # 'aluno' será 'read_only' no serializer, pois será
            # definido pela View (baseado no aluno_id da URL).
            "aluno": {"read_only": True},
            # Campos de auditoria são sempre read-only
            "data_adicao": {"read_only": True},
            "adicionado_por": {"read_only": True},
            "data_invalidacao": {"read_only": True},
            "invalidado_por": {"read_only": True},
            "agendamento_origem": {"read_only": True},
            # Campos de entrada obrigatórios no POST
            "agendamento_uso": {"read_only": True},
            "quantidade": {"required": True},
            "data_validade": {"required": True},
            "adicionado_por_nome": {"read_only": True},
            "invalidado_por_nome": {"read_only": True},
        }
        
    def get_adicionado_por_nome(self, obj):
        """
        Retorna o nome completo do usuário (do campo 'adicionado_por').
        """
        if obj.adicionado_por:
            # obj.adicionado_por é o objeto User (settings.AUTH_USER_MODEL)
            return obj.adicionado_por.get_full_name()
        return None

    def get_invalidado_por_nome(self, obj):
        """
        Retorna o nome completo do usuário (do campo 'invalidado_por').
        """
        if obj.invalidado_por:
            return obj.invalidado_por.get_full_name()
        return None

    def validate_data_validade(self, value):
        """
        [CRITÉRIO DE ACEITAÇÃO]
        Validação: Não permitir data de validade no passado.
        """
        if value and value < datetime.date.today():
            raise serializers.ValidationError(
                "A data de validade não pode ser no passado."
            )
        return value

    def validate_quantidade(self, value):
        """
        [CRITÉRIO DE ACEITAÇÃO]
        Validação: Não adicionar créditos negativos ou zero.
        (O 'PositiveIntegerField' no model já ajuda, mas
         o 'MinValueValidator(1)' é a garantia).
        """
        if value <= 0:
            raise serializers.ValidationError(
                "A quantidade de créditos deve ser 1 ou mais."
            )
        return value