import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError
from django.utils.text import slugify

from studios.models import Studio, FuncaoOperacional, ColaboradorStudio
from usuarios.models import Usuario, Perfil, Colaborador, Endereco
from alunos.models import Aluno
from avaliacoes.models import Avaliacao

class Command(BaseCommand):
    help = 'Popula o banco de dados com um conjunto de dados de teste predefinidos. Use --clean para limpar o banco antes.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Limpa o banco de dados antes de popular com novos dados.'
        )

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

        if options['clean']:
            self._clean_database()

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
                "role": "colaborador", "definir_nome_completo": "Ana Silva (Instrutora)",
                "email": "ana.silva@pilates.com", "password": "123456", "cpf": "11111111111",
                "colaborador_info": {
                    "perfis": ["INSTRUTOR"],
                    "data_nascimento": "1990-05-15", "telefone": "+5511987654321",
                    "endereco": {"logradouro": "Rua das Flores", "numero": "10", "bairro": "Centro", "cidade": "São Paulo", "estado": "SP", "cep": "01001-000"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade São Miguel", "permissao_ids": [5]}]
                }
            },
            {
                "role": "colaborador", "definir_nome_completo": "Roberto Lima (Fisio)",
                "email": "roberto.lima@pilates.com", "password": "123456", "cpf": "44444444444",
                "colaborador_info": {
                    "perfis": ["FISIOTERAPEUTA"],
                    "data_nascimento": "1988-11-30", "telefone": "+5511977776666",
                    "endereco": {"logradouro": "Rua dos Sonhos", "numero": "45", "bairro": "Tatuapé", "cidade": "São Paulo", "estado": "SP", "cep": "03300-000"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Itaquera", "permissao_ids": [4]}]
                }
            },
            {
                "role": "colaborador", "definir_nome_completo": "Carla Souza (Multi)",
                "email": "carla.souza@pilates.com", "password": "123456", "cpf": "55555555555",
                "colaborador_info": {
                    "perfis": ["INSTRUTOR", "FISIOTERAPEUTA"],
                    "data_nascimento": "1992-03-25", "telefone": "+5511966665555",
                    "endereco": {"logradouro": "Avenida Paulista", "numero": "1500", "bairro": "Bela Vista", "cidade": "São Paulo", "estado": "SP", "cep": "01310-200"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Paulista", "permissao_ids": [5, 4]}]
                }
            },
            {
                "role": "colaborador", "definir_nome_completo": "Fernando Alves (Admin)",
                "email": "fernando.alves@pilates.com", "password": "123456", "cpf": "66666666666",
                "colaborador_info": {
                    "perfis": ["ADMINISTRADOR"],
                    "data_nascimento": "1985-01-15", "telefone": "+5511955554444",
                    "endereco": {"logradouro": "Rua Augusta", "numero": "900", "bairro": "Consolação", "cidade": "São Paulo", "estado": "SP", "cep": "01304-001"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Paulista", "permissao_ids": [2]}]
                }
            },
            {
                "role": "colaborador", "definir_nome_completo": "Mariana Costa (Recepção)",
                "email": "mariana.costa@pilates.com", "password": "123456", "cpf": "77777777777",
                "colaborador_info": {
                    "perfis": ["RECEPCIONISTA"],
                    "data_nascimento": "1998-07-20", "telefone": "+5511944443333",
                    "endereco": {"logradouro": "Rua Itapura", "numero": "300", "bairro": "Tatuapé", "cidade": "São Paulo", "estado": "SP", "cep": "03310-000"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Itaquera", "permissao_ids": [3]}]
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
                self._seed_alunos(alunos_data, created_users_credentials)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ocorreu um erro durante o seeding: {e}'))
            self.stdout.write(self.style.WARNING('As alterações foram revertidas devido ao erro.'))
            return

        self.stdout.write(self.style.SUCCESS('\nProcesso de seeding concluído!'))
        self._report_credentials(created_users_credentials)

    def _clean_database(self):
        self.stdout.write(self.style.WARNING('\nLIMPANDO o banco de dados...'))
        Avaliacao.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Avaliações deletadas.'))
        ColaboradorStudio.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Vínculos Colaborador-Studio deletados.'))
        Aluno.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Alunos deletados.'))
        Usuario.objects.filter(is_superuser=False).delete()
        self.stdout.write(self.style.SUCCESS('Usuários (não-admin) deletados.'))
        Studio.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Studios deletados.'))
        Endereco.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Endereços deletados.'))
        self.stdout.write(self.style.WARNING('Limpeza concluída.'))

    def _report_credentials(self, credentials):
        self.stdout.write(self.style.HTTP_INFO('\n--- Credenciais dos Usuários Padrão ---'))
        if not credentials:
            self.stdout.write("Nenhum usuário definido foi criado ou encontrado.")
            return

        for cred in credentials:
            role = cred.get('role', 'desconhecido').replace("_", " ").title()
            self.stdout.write(f"\n- {role}")
            self.stdout.write(f"  Email: {cred['email']}")
            self.stdout.write(f"  Senha: {cred['password']}")
            if cred.get('perfis'):
                self.stdout.write(f"  Perfis: { ', '.join(cred['perfis']) }")
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

            cred_info = {'email': email, 'password': password, 'role': data.get('role')}
            if data.get('role') == 'colaborador':
                cred_info['perfis'] = data.get('colaborador_info', {}).get('perfis', [])

            if Usuario.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'Usuário com email "{email}" já existe.'))
                cred_info['password'] = 'senha existente'
                credentials_list.append(cred_info)
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
                credentials_list.append(cred_info)

                if data.get('role') == 'colaborador' and 'colaborador_info' in data:
                    self._create_colaborador_profile(user, data['colaborador_info'])

            except IntegrityError as e:
                self.stdout.write(self.style.ERROR(f'Erro de integridade ao criar "{email}": {e}'))

    def _create_colaborador_profile(self, user, info):
        PERFIL_ID_TO_FUNCAO_NOME = {
            1: 'Admin',       # ADMIN_MASTER (não usado para vinculo, mas mapeado)
            2: 'Admin',       # ADMINISTRADOR
            3: 'Recep',       # RECEPCIONISTA
            4: 'Fisio',       # FISIOTERAPEUTA
            5: 'Instrutor',   # INSTRUTOR
        }
        endereco_data = info.get('endereco')
        if not endereco_data:
            self.stdout.write(self.style.WARNING(f'Colaborador "{user.email}" sem dados de endereço.'))
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
        
        perfis_nomes = info.get('perfis', [])
        for perfil_nome in perfis_nomes:
            try:
                perfil = Perfil.objects.get(nome=perfil_nome)
                colaborador.perfis.add(perfil)
            except Perfil.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Perfil "{perfil_nome}" não encontrado.'))

        for vinculo in info.get('vinculos_studio', []):
            studio_nome = vinculo.get('studio_nome')
            permissao_ids = vinculo.get('permissao_ids', [])
            if not studio_nome or not permissao_ids:
                continue
            try:
                studio = Studio.objects.get(nome=studio_nome)
                for perfil_id in permissao_ids:
                    funcao_nome = PERFIL_ID_TO_FUNCAO_NOME.get(perfil_id)
                    if not funcao_nome:
                        self.stdout.write(self.style.ERROR(f'ID de Perfil inválido "{perfil_id}" para mapeamento de permissão.'))
                        continue
                    
                    permissao = FuncaoOperacional.objects.get(nome=funcao_nome)
                    ColaboradorStudio.objects.get_or_create(colaborador=colaborador, studio=studio, permissao=permissao)

            except (Studio.DoesNotExist, FuncaoOperacional.DoesNotExist) as e:
                self.stdout.write(self.style.ERROR(f'Erro ao vincular colaborador a studio: {e}'))
        self.stdout.write(self.style.SUCCESS(f'Perfil de colaborador para "{user.username}" configurado.'))

    def _seed_alunos(self, alunos_data, credentials_list):
        if not alunos_data: return
        quantidade = alunos_data.get('quantidade', 0)

        self.stdout.write(self.style.HTTP_INFO(f'\nGerando {quantidade + 1} alunos (1 padrão + {quantidade} aleatórios)...'))
        
        studios = list(Studio.objects.all())
        if not studios:
            return self.stdout.write(self.style.ERROR('Nenhum studio encontrado para associar alunos.'))

        # --- Cria Aluno de Teste Padrão ---
        aluno_email = "aluno@pilates.com"
        aluno_pass = "123456"
        if not Usuario.objects.filter(email=aluno_email).exists():
            aluno_user = Usuario.objects.create_user(
                username='aluno.teste', email=aluno_email, password=aluno_pass,
                first_name='Aluno', last_name='Teste', cpf=self._generate_valid_cpf()
            )
            aluno, _ = Aluno.objects.get_or_create(
                usuario=aluno_user,
                defaults={
                    'dataNascimento': date(1995, 1, 1),
                    'contato': '+5511912345678',
                }
            )
            aluno.unidades.add(random.choice(studios))
            self.stdout.write(self.style.SUCCESS('Aluno de teste padrão criado.'))
            credentials_list.append({'email': aluno_email, 'password': aluno_pass, 'role': 'Aluno'})
        else:
            self.stdout.write(self.style.WARNING(f'Aluno de teste padrão com email "{aluno_email}" já existe.'))
            credentials_list.append({'email': aluno_email, 'password': 'senha existente', 'role': 'Aluno'})

        # --- Cria Alunos Aleatórios Adicionais ---
        evaluators = list(Colaborador.objects.filter(perfis__nome__in=['INSTRUTOR', 'FISIOTERAPEUTA']).distinct())
        if not evaluators:
            self.stdout.write(self.style.WARNING('Nenhum instrutor ou fisioterapeuta encontrado para criar avaliações.'))

        nomes = ['Miguel', 'Arthur', 'Gael', 'Heitor', 'Theo', 'Davi', 'Gabriel', 'Bernardo', 'Samuel', 'João']
        sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes']

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

            aluno, aluno_created = Aluno.objects.get_or_create(
                usuario=user,
                defaults={
                    'dataNascimento': random_date,
                    'contato': f'+55119{random.randint(10000000, 99999999)}',
                }
            )
            aluno.unidades.add(random.choice(studios))

            if aluno_created and evaluators:
                Avaliacao.objects.create(
                    aluno=aluno,
                    instrutor=random.choice(evaluators),
                    data_avaliacao=date.today(),
                    objetivo_aluno="Melhorar a postura e fortalecer o core.",
                    diagnostico_fisioterapeutico="Sem diagnóstico inicial.",
                    historico_medico="Nenhuma condição pré-existente relatada."
                )

        self.stdout.write(self.style.SUCCESS(f'{quantidade} alunos aleatórios e suas avaliações iniciais foram criados.'))