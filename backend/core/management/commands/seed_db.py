import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError
from django.utils.text import slugify

from studios.models import Studio, FuncaoOperacional, ColaboradorStudio
from usuarios.models import Usuario, Perfil, Colaborador, Endereco
from alunos.models import Aluno

class Command(BaseCommand):
    help = 'Popula o banco de dados com um conjunto de dados de teste predefinidos.'

    def _generate_valid_cpf(self):
        """Gera um número de CPF válido."""
        def calculate_digit(digits):
            s = sum(int(digit) * weight for digit, weight in zip(digits, range(len(digits) + 1, 1, -1)))
            res = 11 - (s % 11)
            return 0 if res > 9 else res

        while True:
            cpf_base = [random.randint(0, 9) for _ in range(9)]
            d1 = calculate_digit(cpf_base)
            d2 = calculate_digit(cpf_base + [d1])
            cpf = "".join(map(str, cpf_base + [d1, d2]))
            if not Usuario.objects.filter(cpf=cpf).exists():
                return cpf

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando o processo de seeding...'))

        # --- DADOS PREDEFINIDOS ---
        studios_data = [
            {"nome": "DEFINE PILATES - Unidade São Miguel", "endereco": "São Miguel Paulista, São Paulo - SP"},
            {"nome": "DEFINE PILATES - Unidade Itaquera", "endereco": "Itaquera, São Paulo - SP"},
            {"nome": "DEFINE PILATES - Unidade Paulista", "endereco": "Avenida Paulista, São Paulo - SP"}
        ]
        users_data = [
            {
                "role": "superuser", "definir_nome_completo": "Admin Master",
                "email": "admin@pilates.com", "password": "admin", "cpf": "00000000000"
            },
            {
                "role": "instrutor", "definir_nome_completo": "Ana Silva",
                "email": "ana.silva@pilates.com", "password": "123456", "cpf": "11111111111",
                "colaborador_info": {
                    "data_nascimento": "1990-05-15", "telefone": "+5511987654321",
                    "endereco": {"logradouro": "Rua das Flores", "numero": "10", "bairro": "Centro", "cidade": "São Paulo", "estado": "SP", "cep": "01001-000"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade São Miguel", "permissao_nome": "Instrutor"}]
                }
            }
        ]
        alunos_data = {"quantidade": 20}
        created_users_credentials = []

        try:
            with transaction.atomic():
                self._seed_base_data()
                self._seed_studios(studios_data)
                self._seed_users(users_data, created_users_credentials)
                self._seed_alunos(alunos_data)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ocorreu um erro durante o seeding: {e}'))
            self.stdout.write(self.style.WARNING('As alterações foram revertidas devido ao erro.'))
            return

        self.stdout.write(self.style.SUCCESS('\nProcesso de seeding concluído!'))
        self._report_credentials(created_users_credentials)

    def _report_credentials(self, credentials):
        self.stdout.write(self.style.HTTP_INFO('\n--- Credenciais dos Usuários Criados ---'))
        if not credentials:
            self.stdout.write("Nenhum novo usuário definido foi criado (podem já existir).")
        for cred in credentials:
            self.stdout.write(f"  Email: {cred['email']}\n  Senha: {cred['password']}")
        self.stdout.write(self.style.HTTP_INFO('----------------------------------------'))

    def _seed_base_data(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando dados de base (Perfis e Funções)...'))
        for nome_db, _ in Perfil.NOME_CHOICES:
            Perfil.objects.get_or_create(nome=nome_db)
        self.stdout.write(self.style.SUCCESS('Perfis populados.'))
        
        for nome_funcao in ["Admin", "Instrutor", "Fisio", "Recep"]:
            FuncaoOperacional.objects.get_or_create(nome=nome_funcao)
        self.stdout.write(self.style.SUCCESS('Funções Operacionais populadas.'))

    def _seed_studios(self, studios_data):
        if not studios_data: return
        self.stdout.write(self.style.HTTP_INFO('\nPopulando studios...'))
        for data in studios_data:
            Studio.objects.get_or_create(nome=data['nome'], defaults={'endereco': data.get('endereco', '')})
        self.stdout.write(self.style.SUCCESS('Studios populados.'))

    def _seed_users(self, users_data, credentials_list):
        if not users_data: return
        self.stdout.write(self.style.HTTP_INFO('\nPopulando usuários definidos...'))

        for data in users_data:
            email = data.get('email')
            password = data.get('password')
            if not email:
                self.stdout.write(self.style.WARNING(f'Usuário sem email nos dados, pulando.'))
                continue

            if Usuario.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'Usuário com email "{email}" já existe.'))
                continue

            nome_completo = data.get('definir_nome_completo', '')
            first_name, last_name = (nome_completo.split(' ', 1) + [''])[:2]
            username = email.split('@')[0]
            user_defaults = {
                'first_name': first_name, 'last_name': last_name,
                'cpf': data.get('cpf') or self._generate_valid_cpf()
            }

            try:
                user_creator = Usuario.objects.create_superuser if data.get('role') == 'superuser' else Usuario.objects.create_user
                user = user_creator(username=username, email=email, password=password, **user_defaults)
                self.stdout.write(self.style.SUCCESS(f'Usuário "{username}" criado.'))
                credentials_list.append({'email': email, 'password': password})

                if data.get('role') == 'instrutor' and 'colaborador_info' in data:
                    self._create_colaborador_profile(user, data['colaborador_info'])

            except IntegrityError as e:
                self.stdout.write(self.style.ERROR(f'Erro de integridade ao criar "{email}": {e}'))

    def _create_colaborador_profile(self, user, info):
        endereco_data = info.get('endereco')
        if not endereco_data:
            self.stdout.write(self.style.WARNING(f'Instrutor "{user.email}" sem dados de endereço.'))
            return

        endereco, _ = Endereco.objects.get_or_create(**endereco_data)
        colaborador, _ = Colaborador.objects.get_or_create(
            usuario=user,
            defaults={
                'endereco': endereco,
                'data_nascimento': info.get('data_nascimento'),
                'telefone': info.get('telefone')
            }
        )
        colaborador.perfis.add(Perfil.objects.get(nome='INSTRUTOR'))

        for vinculo in info.get('vinculos_studio', []):
            try:
                studio = Studio.objects.get(nome=vinculo['studio_nome'])
                permissao = FuncaoOperacional.objects.get(nome=vinculo['permissao_nome'])
                ColaboradorStudio.objects.get_or_create(colaborador=colaborador, studio=studio, permissao=permissao)
            except (Studio.DoesNotExist, FuncaoOperacional.DoesNotExist) as e:
                self.stdout.write(self.style.ERROR(f'Erro ao vincular instrutor a studio: {e}'))
        self.stdout.write(self.style.SUCCESS(f'Perfil de colaborador para "{user.username}" configurado.'))

    def _seed_alunos(self, alunos_data):
        if not alunos_data: return
        quantidade = alunos_data.get('quantidade', 0)
        if quantidade == 0: return

        self.stdout.write(self.style.HTTP_INFO(f'\nGerando {quantidade} alunos aleatórios...'))
        nomes = ['Miguel', 'Arthur', 'Gael', 'Heitor', 'Theo', 'Davi', 'Gabriel', 'Bernardo', 'Samuel', 'João']
        sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes']
        studios = list(Studio.objects.all())
        if not studios:
            return self.stdout.write(self.style.ERROR('Nenhum studio encontrado para associar alunos.'))

        for i in range(quantidade):
            first_name = random.choice(nomes)
            last_name = random.choice(sobrenomes)
            username = slugify(f'{first_name}-{last_name}-{i}')
            email = f'{username}@example.com'

            if Usuario.objects.filter(email=email).exists(): continue

            user = Usuario.objects.create_user(
                username=username, email=email, password='123456',
                first_name=first_name, last_name=last_name, cpf=self._generate_valid_cpf()
            )

            start_date = date(1970, 1, 1)
            end_date = date(2005, 12, 31)
            random_date = start_date + timedelta(days=random.randint(0, (end_date - start_date).days))

            aluno, _ = Aluno.objects.get_or_create(
                usuario=user,
                defaults={
                    'dataNascimento': random_date,
                    'contato': f'+55119{random.randint(10000000, 99999999)}',
                }
            )
            aluno.unidades.add(random.choice(studios))
        self.stdout.write(self.style.SUCCESS(f'{quantidade} alunos aleatórios criados.'))
