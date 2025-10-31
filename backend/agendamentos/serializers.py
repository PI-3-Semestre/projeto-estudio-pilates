# agendamentos/serializers.py
from rest_framework import serializers
from .models import (
    HorarioTrabalho, BloqueioAgenda, Modalidade, 
    Aula, AulaAluno, Reposicao, ListaEspera, Aluno, CreditoAula
)
from datetime import timedelta
from rest_framework.exceptions import ValidationError

class HorarioTrabalhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioTrabalho
        fields = '__all__'

class BloqueioAgendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueioAgenda
        fields = '__all__'

class ModalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modalidade
        fields = '__all__'

class AulaSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Aula.
    """
    class Meta:
        model = Aula
        fields = [
            'id', 'studio', 'modalidade', 'instrutor_principal', 
            'instrutor_substituto', 'data_hora_inicio', 'duracao_minutos', 
            'capacidade_maxima', 'tipo_aula'
        ]   

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
    aula = AulaSerializer(read_only=True)
    
    # Podemos também aninhar os detalhes do aluno se quisermos (opcional)
    # aluno = AlunoSerializer(read_only=True) 

    class Meta:
        model = AulaAluno
        fields = ['id', 'aula', 'aluno', 'status_presenca', 'credito_utilizado']
        # Usamos 'depth = 1' ou definimos os campos aninhados manualmente
        # Optámos por definir 'aula' manualmente para melhor controlo.
class AgendamentoAlunoSerializer(serializers.ModelSerializer):
    """
    Serializer para o Aluno agendar sua própria aula.
    O 'aluno' é 'read_only' pois será pego do request.user.
    """
    aluno = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AulaAluno
        fields = ['id', 'aula', 'aluno', 'status_presenca']
        read_only_fields = [
            'id',                   # ID é auto-increment
            'status_presenca',      # Status é 'AGENDADO' por default
            'credito_utilizado'   # Crédito é gerido na lógica interna
        ]

    # --- INÍCIO DA NOVA LÓGICA (ISSUE #63 - FLUXO ALUNO) ---
    def validate(self, attrs):
        """
        Validação customizada para o Aluno:
        1. Impedir agendamentos duplos (conflito de horário).
        2. Verificar disponibilidade de vagas.
        3. Verificar e preparar consumo de crédito (Issue #57).
        """
        aula = attrs.get('aula')
        
        # 1. Obter o aluno a partir do contexto da requisição
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not hasattr(request.user, 'aluno'):
            raise ValidationError("Não foi possível identificar o perfil do aluno logado.")
            
        aluno = request.user.aluno
        
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
                raise ValidationError("Não há mais vagas disponíveis nesta aula.")
        
        # --- 4. Validação e Preparação para Consumo de Crédito ---
        if aula.tipo_aula == Aula.TipoAula.REGULAR:
            credito_disponivel = CreditoAula.objects.filter(
                aluno=aluno,
                status=CreditoAula.StatusCredito.DISPONIVEL,
                data_expiracao__gte=horario_inicio_desejado.date()
            ).order_by('data_expiracao').first()

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

    class Meta:
        model = AulaAluno
        fields = ['id', 'aula', 'aluno', 'status_presenca']
        read_only_fields = ['status_presenca', 'credito_utilizado'] # credito_utilizado é gerenciado no backend

    # --- INÍCIO DA NOVA LÓGICA (ISSUE #63) ---
    def validate(self, attrs):
        """
        Validação para:
        1. Impedir agendamentos duplos (conflito de horário).
        2. Verificar disponibilidade de vagas.
        3. Verificar e preparar consumo de crédito (Issue #57).
        """
        aula = attrs.get('aula')
        aluno = attrs.get('aluno')
        
        if not aula or not aluno:
            return attrs 
            
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
                raise ValidationError("Não há mais vagas disponíveis nesta aula.")
        
        # Validação e Preparação para Consumo de Crédito
        # Só consome crédito se for uma aula REGULAR e se for uma criação 
        # A lógica exata de quando/como encontrar o crédito DISPONIVEL pode variar.
        
        if aula.tipo_aula == Aula.TipoAula.REGULAR:
            credito_disponivel = CreditoAula.objects.filter(
                aluno=aluno,
                status=CreditoAula.StatusCredito.DISPONIVEL,
                data_expiracao__gte=horario_inicio_desejado.date()
            ).order_by('data_expiracao').first() # Usa o crédito mais antigo primeiro?

            if not credito_disponivel:
                 raise ValidationError("Aluno não possui créditos de aula disponíveis ou válidos para este agendamento.")
            
            attrs['credito_a_utilizar'] = credito_disponivel 
            # NÃO mudamos o status do crédito aqui, isso deve ser feito atomicamente 
            # ao salvar o agendamento no método create/update.

        return attrs
    
    def create(self, validated_data):
        credito_a_utilizar = validated_data.pop('credito_a_utilizar', None)
        agendamento = super().create(validated_data) # Cria o AulaAluno

        if credito_a_utilizar:
            agendamento.credito_utilizado = credito_a_utilizar
            credito_a_utilizar.status = CreditoAula.StatusCredito.UTILIZADA
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
        fields = '__all__'

class ListaEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListaEspera
        fields = '__all__'

class CreditoAulaSerializer(serializers.ModelSerializer):
    """
    Serializer para LEITURA (GET) dos créditos de aula do aluno (Tarefa da Issue #62).
    Mostra o status, a validade e a origem/uso do crédito.
    """
    
    # Opcional: Mostrar o ID da aula que usou este crédito.
    agendamento_uso = serializers.PrimaryKeyRelatedField(read_only=True, many=True)
    
    # Opcional: Mostrar o ID do agendamento cancelado que gerou este crédito (se aplicável)
    agendamento_origem = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = CreditoAula
        fields = [
            'id', 
            'status', 
            'data_expiracao', 
            'agendamento_origem', 
            'agendamento_uso'   
        ]
        read_only_fields = fields