# agendamentos/tests.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
import datetime

from usuarios.models import Usuario, Perfil
from alunos.models import Aluno
from studios.models import Studio, FuncaoOperacional
from agendamentos.models import Modalidade, Aula, CreditoAula, AulaAluno, Colaborador


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
        cls.funcao_recep, _ = FuncaoOperacional.objects.get_or_create(nome="Recepcionista")
        cls.funcao_admin, _ = FuncaoOperacional.objects.get_or_create(nome="Administrador")


    def setUp(self):
        """
        Configuração executada antes de cada teste.
        Cria os objetos básicos necessários para os testes.
        """
        # Studio e Modalidade
        self.studio = Studio.objects.create(nome="Studio Teste")
        self.modalidade = Modalidade.objects.create(nome="Pilates")

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

        self.aluno, _ = Aluno.objects.get_or_create(
            usuario=self.user_aluno,
            defaults={"dataNascimento": "1990-01-01", "contato": "11999999999"},
        )
        self.aluno.unidades.add(self.studio)


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
        self.recepcionista.unidades.add(self.studio, through_defaults={'permissao': self.funcao_recep})

        # Aula
        self.aula = Aula.objects.create(
            studio=self.studio,
            modalidade=self.modalidade,
            data_hora_inicio=timezone.now() + datetime.timedelta(days=1),
            capacidade_maxima=3,
        )
        self.url_inscrever_aula = reverse(
            "aulaaluno-list"
        )

    def test_aluno_pode_agendar_a_si_mesmo_com_credito(self):
        """
        Verifica se um aluno autenticado pode se inscrever em uma aula
        se tiver um crédito disponível.
        """
        # Pré-condição: Aluno tem um crédito válido
        credito = CreditoAula.objects.create(
            aluno=self.aluno,
            data_validade=timezone.now().date() + datetime.timedelta(days=30),
        )

        # Ação: Aluno faz a requisição para se inscrever
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post(
            self.url_inscrever_aula, data={"aula": self.aula.pk}
        )

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
        self.assertEqual(agendamento.credito_utilizado, credito)
        self.assertIsNotNone(credito.data_invalidacao)

    def test_recepcionista_pode_agendar_aluno_especifico(self):
        """
        Verifica se uma recepcionista pode agendar um aluno específico.
        """
        # Pré-condição: Aluno tem um crédito válido
        CreditoAula.objects.create(
            aluno=self.aluno,
            data_validade=timezone.now().date() + datetime.timedelta(days=30),
        )

        # Ação: Recepcionista faz a requisição para inscrever o aluno
        self.client.force_authenticate(user=self.user_recepcionista)
        response = self.client.post(
            self.url_inscrever_aula, data={"aluno": self.aluno.pk, "aula": self.aula.pk}
        )

        # Verificações
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            AulaAluno.objects.filter(aluno=self.aluno, aula=self.aula).exists()
        )
        credito_usado = CreditoAula.objects.get(aluno=self.aluno)
        self.assertIsNotNone(credito_usado.data_invalidacao)

    def test_aluno_nao_pode_agendar_outro_aluno(self):
        """
        Verifica que um aluno recebe 400 ao tentar agendar outro aluno.
        """
        # Cria um segundo aluno
        user_outro_aluno = Usuario.objects.create_user(
            username="outro@teste.com",
            email="outro@teste.com",
            password="password123",
            cpf="33333333333",
            first_name="Outro",
        )
        outro_aluno = Aluno.objects.create(usuario=user_outro_aluno, dataNascimento="1990-01-01", contato="11988888888")
        outro_aluno.unidades.add(self.studio)

        # Ação: Aluno 1 tenta agendar Aluno 2
        self.client.force_authenticate(user=self.user_aluno)
        # O serializer do aluno não aceita o campo 'aluno', então a requisição é inválida (400)
        # antes mesmo de chegar na verificação de permissão (403).
        response = self.client.post(
            self.url_inscrever_aula, data={"aluno": outro_aluno.pk, "aula": self.aula.pk}
        )

        # Verificação
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_agendamento_falha_sem_credito_disponivel(self):
        """
        Verifica que o agendamento falha se o aluno não tiver créditos.
        """
        # Pré-condição: Aluno NÃO tem créditos

        # Ação
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post(self.url_inscrever_aula, data={"aula": self.aula.pk})

        # Verificação
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Você não possui créditos de aula disponíveis", response.data["detail"])

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
        outro_aluno = Aluno.objects.create(usuario=user_outro_aluno, dataNascimento="1990-01-01", contato="11977777777")
        outro_aluno.unidades.add(self.studio)
        CreditoAula.objects.create(
            aluno=outro_aluno, data_validade=timezone.now().date() + datetime.timedelta(days=30)
        )
        # Usar o client para agendar, garantindo o consumo do crédito e o fluxo correto
        self.client.force_authenticate(user=self.user_recepcionista)
        self.client.post(self.url_inscrever_aula, data={"aluno": outro_aluno.pk, "aula": self.aula.pk})

        # Tenta inscrever o aluno original na aula lotada
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post(self.url_inscrever_aula, data={"aula": self.aula.pk})

        # Verificação
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Não há mais vagas disponíveis nesta aula", response.data["detail"])

    def test_agendamento_falha_se_aluno_ja_inscrito(self):
        """
        Verifica que um aluno não pode se inscrever na mesma aula duas vezes.
        """
        # Pré-condição: Aluno já está inscrito na aula
        CreditoAula.objects.create(
            aluno=self.aluno, data_validade=timezone.now().date() + datetime.timedelta(days=30)
        )
        AulaAluno.objects.create(aula=self.aula, aluno=self.aluno)

        # Aluno tem um segundo crédito para a tentativa
        CreditoAula.objects.create(
            aluno=self.aluno, data_validade=timezone.now().date() + datetime.timedelta(days=30)
        )

        # Ação
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post(self.url_inscrever_aula, data={"aula": self.aula.pk})

        # Verificação
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Você já está inscrito nesta aula.")

    def test_aluno_pode_cancelar_proprio_agendamento(self):
        """
        Verifica se um aluno pode cancelar um de seus agendamentos.
        """
        # Pré-condição: Aluno tem um agendamento e um crédito utilizado
        credito = CreditoAula.objects.create(
            aluno=self.aluno,
            data_validade=timezone.now().date() + datetime.timedelta(days=30),
            data_invalidacao=timezone.now() # Simula o crédito como usado
        )
        agendamento = AulaAluno.objects.create(
            aula=self.aula, aluno=self.aluno, credito_utilizado=credito
        )

        # URL para cancelar o agendamento específico
        url_cancelar = reverse(
            "aulaaluno-detail", kwargs={"pk": agendamento.pk}
        )

        # Ação: Aluno faz a requisição para cancelar
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.delete(url_cancelar)

        # Verificações
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(AulaAluno.objects.filter(pk=agendamento.pk).exists())
        
        # Verifica se o crédito foi liberado (data de invalidação nula)
        credito.refresh_from_db()
        self.assertIsNone(credito.data_invalidacao)

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
        outro_aluno = Aluno.objects.create(usuario=user_outro_aluno, dataNascimento="1990-01-01", contato="11966666666")
        outro_aluno.unidades.add(self.studio)
        agendamento_outro = AulaAluno.objects.create(aula=self.aula, aluno=outro_aluno)

        url_cancelar = reverse(
            "aulaaluno-detail", kwargs={"pk": agendamento_outro.pk}
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
        user_admin, _ = Usuario.objects.get_or_create(
            cpf="44444444444",
            defaults={
                "username": "admin@teste.com",
                "email": "admin@teste.com",
                "first_name": "Admin",
            },
        )
        user_admin.set_password("password123")
        user_admin.save()
        admin, _ = Colaborador.objects.get_or_create(
            usuario=user_admin,
            defaults={
                "data_nascimento": timezone.now().date()
                - datetime.timedelta(days=365 * 30)
            },
        )
        admin.perfis.add(self.perfil_admin)
        admin.unidades.add(self.studio, through_defaults={'permissao': self.funcao_admin})

        url_cancelar = reverse(
            "aulaaluno-detail", kwargs={"pk": agendamento_aluno.pk}
        )

        # Ação: Admin faz a requisição para cancelar
        self.client.force_authenticate(user=user_admin)
        response = self.client.delete(url_cancelar)

        # Verificações
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(AulaAluno.objects.filter(pk=agendamento_aluno.pk).exists())
