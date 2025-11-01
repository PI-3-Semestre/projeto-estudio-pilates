# agendamentos/tests.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
import datetime

from usuarios.models import Usuario, Perfil
from alunos.models import Aluno
from studios.models import Studio
from agendamentos.models import Modalidade, Aula, CreditoAula, AulaAluno


class AgendamentoAPITestCase(APITestCase):
    """
    Testes para o fluxo de agendamento de aulas.
    """

    @classmethod
    def setUpClass(cls):
        """
        Configuração inicial que é executada uma vez para a classe de teste.
        """
        super().setUpClass()
        # Perfis - Usando get_or_create para tornar o setup robusto
        cls.perfil_aluno, _ = Perfil.objects.get_or_create(nome="ALUNO")
        cls.perfil_recepcionista, _ = Perfil.objects.get_or_create(nome="RECEPCIONISTA")
        cls.perfil_admin, _ = Perfil.objects.get_or_create(nome="ADMINISTRADOR")

    def setUp(self):
        """
        Configuração executada antes de cada teste.
        Cria os objetos básicos necessários para os testes.
        """
        # Usuários - Usando get_or_create para robustez
        self.user_aluno, _ = Usuario.objects.get_or_create(
            cpf="11111111111",
            defaults={
                "username": "aluno@teste.com",
                "email": "aluno@teste.com",
                "first_name": "Aluno",
            },
        )
        self.user_aluno.set_password("password123")
        self.user_aluno.save()

        self.aluno, _ = Aluno.objects.get_or_create(usuario=self.user_aluno)
        self.aluno.usuario.perfis.add(self.perfil_aluno)

        self.user_recepcionista, _ = Usuario.objects.get_or_create(
            cpf="22222222222",
            defaults={
                "username": "recepcionista@teste.com",
                "email": "recepcionista@teste.com",
                "first_name": "Recepcionista",
            },
        )
        self.user_recepcionista.set_password("password123")
        self.user_recepcionista.save()

        self.recepcionista, _ = Colaborador.objects.get_or_create(
            usuario=self.user_recepcionista,
            defaults={
                "data_nascimento": timezone.now().date()
                - datetime.timedelta(days=365 * 25)
            },
        )
        self.recepcionista.perfis.add(self.perfil_recepcionista)

        # Studio e Modalidade
        self.studio = Studio.objects.create(nome="Studio Teste")
        self.modalidade = Modalidade.objects.create(nome="Pilates")

        # Aula
        self.aula = Aula.objects.create(
            studio=self.studio,
            modalidade=self.modalidade,
            data_hora_inicio=timezone.now() + datetime.timedelta(days=1),
            capacidade_maxima=3,
        )
        self.url_inscrever_aula = reverse(
            "aula-inscrever-aluno", kwargs={"pk": self.aula.pk}
        )

    def test_aluno_pode_agendar_a_si_mesmo_com_credito(self):
        """
        Verifica se um aluno autenticado pode se inscrever em uma aula
        se tiver um crédito disponível.
        """
        # Pré-condição: Aluno tem um crédito válido
        credito = CreditoAula.objects.create(
            aluno=self.aluno,
            quantidade=1,
            data_validade=timezone.now().date() + datetime.timedelta(days=30),
        )

        # Ação: Aluno faz a requisição para se inscrever
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post(
            self.url_inscrever_aula, data={}
        )  # Aluno não passa aluno_id

        # Verificações
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 1. Verifica se o agendamento (AulaAluno) foi criado
        agendamento_existe = AulaAluno.objects.filter(
            aluno=self.aluno, aula=self.aula
        ).exists()
        self.assertTrue(agendamento_existe)

        # 2. Verifica se o crédito foi consumido
        credito.refresh_from_db()
        agendamento = AulaAluno.objects.get(aluno=self.aluno, aula=self.aula)
        self.assertEqual(credito.agendamento_uso, agendamento)
        # O status do crédito não é mais um método, e sim uma propriedade ou campo.
        # A lógica de "utilizado" agora é a presença de um valor em `agendamento_uso`.
        self.assertIsNotNone(credito.agendamento_uso)

    def test_recepcionista_pode_agendar_aluno_especifico(self):
        """
        Verifica se uma recepcionista pode agendar um aluno específico.
        """
        # Pré-condição: Aluno tem um crédito válido
        credito = CreditoAula.objects.create(
            aluno=self.aluno,
            quantidade=1,
            data_validade=timezone.now().date() + datetime.timedelta(days=30),
        )

        # Ação: Recepcionista faz a requisição para inscrever o aluno
        self.client.force_authenticate(user=self.user_recepcionista)
        response = self.client.post(
            self.url_inscrever_aula, data={"aluno_id": self.aluno.pk}
        )

        # Verificações
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            AulaAluno.objects.filter(aluno=self.aluno, aula=self.aula).exists()
        )
        credito.refresh_from_db()
        self.assertIsNotNone(credito.agendamento_uso)

    def test_aluno_nao_pode_agendar_outro_aluno(self):
        """
        Verifica que um aluno recebe 403 ao tentar agendar outro aluno.
        """
        # Cria um segundo aluno
        user_outro_aluno = Usuario.objects.create_user(
            username="outro@teste.com",
            email="outro@teste.com",
            password="password123",
            cpf="33333333333",
            first_name="Outro",
        )
        outro_aluno = Aluno.objects.create(usuario=user_outro_aluno)

        # Ação: Aluno 1 tenta agendar Aluno 2
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post(
            self.url_inscrever_aula, data={"aluno_id": outro_aluno.pk}
        )

        # Verificação
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_agendamento_falha_sem_credito_disponivel(self):
        """
        Verifica que o agendamento falha se o aluno não tiver créditos.
        """
        # Pré-condição: Aluno NÃO tem créditos

        # Ação
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post(self.url_inscrever_aula, data={})

        # Verificação
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Nenhum crédito de aula disponível.")

    def test_agendamento_falha_em_aula_lotada(self):
        """
        Verifica que o agendamento falha se a aula já estiver cheia.
        """
        # Pré-condição: Aula está lotada
        self.aula.capacidade_maxima = 1
        self.aula.save()

        # Cria um aluno e o inscreve para lotar a aula
        user_outro_aluno = Usuario.objects.create_user(
            username="outro_lotado@teste.com",
            email="outro_lotado@teste.com",
            password="password123",
            cpf="33333333334",
            first_name="OutroLotado",
        )
        outro_aluno = Aluno.objects.create(usuario=user_outro_aluno)
        CreditoAula.objects.create(
            aluno=outro_aluno, quantidade=1, data_validade=timezone.now().date()
        )
        AulaAluno.objects.create(aula=self.aula, aluno=outro_aluno)

        # Aluno principal tenta se inscrever na aula lotada
        CreditoAula.objects.create(
            aluno=self.aluno, quantidade=1, data_validade=timezone.now().date()
        )
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post(self.url_inscrever_aula, data={})

        # Verificação
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "A aula está lotada.")

    def test_agendamento_falha_se_aluno_ja_inscrito(self):
        """
        Verifica que um aluno não pode se inscrever na mesma aula duas vezes.
        """
        # Pré-condição: Aluno já está inscrito na aula
        CreditoAula.objects.create(
            aluno=self.aluno, quantidade=1, data_validade=timezone.now().date()
        )
        AulaAluno.objects.create(aula=self.aula, aluno=self.aluno)

        # Aluno tem um segundo crédito para a tentativa
        CreditoAula.objects.create(
            aluno=self.aluno, quantidade=1, data_validade=timezone.now().date()
        )

        # Ação
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post(self.url_inscrever_aula, data={})

        # Verificação
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Você já está inscrito nesta aula.")

    def test_aluno_pode_cancelar_proprio_agendamento(self):
        """
        Verifica se um aluno pode cancelar um de seus agendamentos.
        """
        # Pré-condição: Aluno tem um agendamento e um crédito utilizado
        credito = CreditoAula.objects.create(
            aluno=self.aluno, quantidade=1, data_validade=timezone.now().date()
        )
        agendamento = AulaAluno.objects.create(
            aula=self.aula, aluno=self.aluno, credito_utilizado=credito
        )
        credito.agendamento_uso = agendamento
        credito.save()

        # URL para cancelar o agendamento específico
        url_cancelar = reverse(
            "aulaaluno-cancelar-agendamento", kwargs={"pk": agendamento.pk}
        )

        # Ação: Aluno faz a requisição para cancelar
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.delete(url_cancelar)

        # Verificações
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(AulaAluno.objects.filter(pk=agendamento.pk).exists())
        credito.refresh_from_db()
        self.assertIsNone(credito.agendamento_uso)

    def test_aluno_nao_pode_cancelar_agendamento_de_outro(self):
        """
        Verifica que um aluno recebe 403 ao tentar cancelar o agendamento de outro.
        """
        # Pré-condição: Outro aluno tem um agendamento
        user_outro_aluno = Usuario.objects.create_user(
            username="outro_cancel@teste.com",
            email="outro_cancel@teste.com",
            password="password123",
            cpf="33333333335",
            first_name="OutroCancel",
        )
        outro_aluno = Aluno.objects.create(usuario=user_outro_aluno)
        agendamento_outro = AulaAluno.objects.create(aula=self.aula, aluno=outro_aluno)

        url_cancelar = reverse(
            "aulaaluno-cancelar-agendamento", kwargs={"pk": agendamento_outro.pk}
        )

        # Ação: Aluno 1 tenta cancelar o agendamento do Aluno 2
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.delete(url_cancelar)

        # Verificação
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(AulaAluno.objects.filter(pk=agendamento_outro.pk).exists())

    def test_admin_pode_cancelar_qualquer_agendamento(self):
        """
        Verifica se um administrador pode cancelar o agendamento de qualquer aluno.
        """
        # Pré-condição: Aluno tem um agendamento
        agendamento_aluno = AulaAluno.objects.create(aula=self.aula, aluno=self.aluno)
        user_admin = Usuario.objects.create_user(
            username="admin@teste.com",
            email="admin@teste.com",
            password="password123",
            cpf="44444444444",
            first_name="Admin",
        )
        admin, _ = Colaborador.objects.get_or_create(
            usuario=user_admin,
            defaults={
                "data_nascimento": timezone.now().date()
                - datetime.timedelta(days=365 * 30)
            },
        )
        admin.perfis.add(self.perfil_admin)

        url_cancelar = reverse(
            "aulaaluno-cancelar-agendamento", kwargs={"pk": agendamento_aluno.pk}
        )

        # Ação: Admin faz a requisição para cancelar
        self.client.force_authenticate(user=user_admin)
        response = self.client.delete(url_cancelar)

        # Verificações
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(AulaAluno.objects.filter(pk=agendamento_aluno.pk).exists())
