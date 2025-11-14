import random
from datetime import date, timedelta, time
from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError
from django.utils.text import slugify
from django.utils import timezone
from faker import Faker

from studios.models import Studio, FuncaoOperacional, ColaboradorStudio
from usuarios.models import Usuario, Perfil, Colaborador, Endereco
from alunos.models import Aluno
from avaliacoes.models import Avaliacao
from agendamentos.models import (
    Modalidade, Aula, AulaAluno, HorarioTrabalho, BloqueioAgenda, CreditoAula, ListaEspera
)
from financeiro.models import Plano, Produto, Matricula, Venda, VendaProduto, Pagamento

fake = Faker('pt_BR')

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
                "role": "colaborador", "definir_nome_completo": "Master Admin Profile",
                "email": "master.admin@pilates.com", "password": "123456", "cpf": "99999999999",
                "colaborador_info": {
                    "perfis": ['ADMIN_MASTER'],
                    "data_nascimento": "1980-01-01", "telefone": "+5511999999999",
                    "registro_profissional": "ADM-001",
                    "endereco": {"logradouro": "Rua Principal", "numero": "1", "bairro": "Centro", "cidade": "São Paulo", "estado": "SP", "cep": "01000-000"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade São Miguel", "permissao_nomes": ["Admin"]}]
                }
            },
            {
                "role": "colaborador", "definir_nome_completo": "Ana Silva (Instrutora)",
                "email": "ana.silva@pilates.com", "password": "123456", "cpf": "11111111111",
                "colaborador_info": {
                    "perfis": ['INSTRUTOR'],
                    "data_nascimento": "1990-05-15", "telefone": "+5511987654321",
                    "registro_profissional": "CREF-123456",
                    "endereco": {"logradouro": "Rua das Flores", "numero": "10", "bairro": "Centro", "cidade": "São Paulo", "estado": "SP", "cep": "01001-000"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade São Miguel", "permissao_nomes": ["Instrutor"]}]
                }
            },
            {
                "role": "colaborador", "definir_nome_completo": "Roberto Lima (Fisio)",
                "email": "roberto.lima@pilates.com", "password": "123456", "cpf": "44444444444",
                "colaborador_info": {
                    "perfis": ['FISIOTERAPEUTA'],
                    "data_nascimento": "1988-11-30", "telefone": "+5511977776666",
                    "registro_profissional": "CREFITO-7890",
                    "endereco": {"logradouro": "Rua dos Sonhos", "numero": "45", "bairro": "Tatuapé", "cidade": "São Paulo", "estado": "SP", "cep": "03300-000"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Itaquera", "permissao_nomes": ["Fisio"]}]
                }
            },
            {
                "role": "colaborador", "definir_nome_completo": "Carla Souza (Multi)",
                "email": "carla.souza@pilates.com", "password": "123456", "cpf": "55555555555",
                "colaborador_info": {
                    "perfis": ['INSTRUTOR', 'FISIOTERAPEUTA'],
                    "data_nascimento": "1992-03-25", "telefone": "+5511966665555",
                    # *** CORREÇÃO APLICADA AQUI ***
                    "registro_profissional": "CREF-98765", # Estava "CREF-987654" (12 chars)
                    "endereco": {"logradouro": "Avenida Paulista", "numero": "1500", "bairro": "Bela Vista", "cidade": "São Paulo", "estado": "SP", "cep": "01310-200"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Paulista", "permissao_nomes": ["Instrutor", "Fisio"]}]
                }
            },
            {
                "role": "colaborador", "definir_nome_completo": "Fernando Alves (Admin)",
                "email": "fernando.alves@pilates.com", "password": "123456", "cpf": "66666666666",
                "colaborador_info": {
                    "perfis": ['ADMINISTRADOR'],
                    "data_nascimento": "1985-01-15", "telefone": "+5511955554444",
                    "registro_profissional": "ADM-002",
                    "endereco": {"logradouro": "Rua Augusta", "numero": "900", "bairro": "Consolação", "cidade": "São Paulo", "estado": "SP", "cep": "01304-001"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Paulista", "permissao_nomes": ["Admin"]}]
                }
            },
            {
                "role": "colaborador", "definir_nome_completo": "Mariana Costa (Recepção)",
                "email": "mariana.costa@pilates.com", "password": "123456", "cpf": "77777777777",
                "colaborador_info": {
                    "perfis": ['RECEPCIONISTA'],
                    "data_nascimento": "1998-07-20", "telefone": "+5511944443333",
                    "registro_profissional": "REC-001",
                    "endereco": {"logradouro": "Rua Itapura", "numero": "300", "bairro": "Tatuapé", "cidade": "São Paulo", "estado": "SP", "cep": "03310-000"},
                    "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Itaquera", "permissao_nomes": ["Recep"]}]
                }
            }
        ]
        alunos_data = {"quantidade": 20}
        created_users_credentials = []

        try:
            with transaction.atomic():
                self._seed_base_data()
                self._seed_studios(studios_data)
                self._seed_bloqueios_agenda()

                # *** CORREÇÃO DE ORDEM APLICADA AQUI ***
                # 1. Criar usuários (incluindo instrutores)
                self._seed_users(users_data, created_users_credentials, num_random_colaboradores=5)
                # 2. Criar horários de trabalho (que dependem dos instrutores)
                self._seed_horarios_trabalho()

                self._seed_alunos(alunos_data, created_users_credentials, num_random_alunos=20)
                self._seed_creditos_manuais()
                self._seed_modalidades()
                self._seed_aulas()
                self._seed_planos()
                self._seed_produtos()
                self._seed_matriculas()
                self._seed_vendas()
                self._seed_pagamentos()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ocorreu um erro durante o seeding: {e}'))
            self.stdout.write(self.style.WARNING('As alterações foram revertidas devido ao erro.'))
            return

        self.stdout.write(self.style.SUCCESS('\nProcesso de seeding concluído!'))
        self._report_credentials(created_users_credentials)

    def _clean_database(self):
        self.stdout.write(self.style.WARNING('\nLIMPANDO o banco de dados...'))
        ListaEspera.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Lista de espera deletada.'))
        CreditoAula.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Créditos de aula deletados.'))
        Pagamento.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Pagamentos deletados.'))
        Venda.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Vendas deletadas.'))
        Matricula.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Matrículas deletadas.'))
        BloqueioAgenda.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Bloqueios de agenda deletados.'))
        HorarioTrabalho.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Horários de trabalho deletados.'))
        Aula.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Aulas deletadas.'))
        Modalidade.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Modalidades deletadas.'))
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
            role = cred.get('role', 'desconhecido').replace(" ", " ").title()
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

    def _seed_horarios_trabalho(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando horários de trabalho para instrutores...'))
        
        studios = list(Studio.objects.all())
        if not studios:
            self.stdout.write(self.style.ERROR('Nenhum studio encontrado para definir horários de trabalho.'))
            return

        instrutores = list(Colaborador.objects.filter(perfis__nome='INSTRUTOR'))
        if not instrutores:
            self.stdout.write(self.style.WARNING('Nenhum instrutor encontrado para definir horários de trabalho.'))
            return

        for instrutor in instrutores:
            # Assign a random studio to the instructor for work schedule
            studio = random.choice(studios)
            
            for i in range(5): # Create 5 work schedules for each instructor
                work_date = date.today() + timedelta(days=random.randint(1, 30))
                start_time = time(random.randint(8, 12), 0, 0)
                end_time = time(random.randint(14, 18), 0, 0)

                try:
                    HorarioTrabalho.objects.get_or_create(
                        dia_semana=work_date.weekday(),
                        hora_inicio=start_time,
                        hora_fim=end_time,
                        studio=studio
                    )
                    self.stdout.write(self.style.SUCCESS(f'Horário de trabalho para {instrutor.usuario.username} no studio {studio.nome} em {work_date} criado.'))
                except IntegrityError as e:
                    self.stdout.write(self.style.WARNING(f'Horário de trabalho para {instrutor.usuario.username} em {work_date} já existe: {e}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar horário de trabalho para {instrutor.usuario.username}: {e}'))

        self.stdout.write(self.style.SUCCESS('Horários de trabalho populados.'))

    def _seed_bloqueios_agenda(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando bloqueios de agenda (feriados e eventos)...'))
        studios = Studio.objects.all()
        if not studios.exists():
            self.stdout.write(self.style.ERROR('Nenhum studio encontrado para definir bloqueios.'))
            return

        current_year = date.today().year
        feriados_e_eventos = [
            (date(current_year, 1, 1), "Confraternização Universal"),
            (date(current_year, 2, 13), "Carnaval"),
            (date(current_year, 3, 29), "Sexta-feira Santa"),
            (date(current_year, 5, 1), "Dia do Trabalho"),
            (date(current_year, 9, 7), "Independência do Brasil"),
            (date(current_year, 10, 12), "Nossa Senhora Aparecida"),
            (date(current_year, 11, 2), "Finados"),
            (date(current_year, 11, 15), "Proclamação da República"),
            (date(current_year, 12, 25), "Natal"),
            (date(current_year + 1, 1, 1), "Confraternização Universal"),
            (date.today() + timedelta(days=random.randint(10, 60)), "Manutenção Geral do Studio"),
            (date.today() + timedelta(days=random.randint(10, 60)), "Evento Especial de Pilates"),
        ]

        for studio in studios:
            for data_bloqueio, desc in feriados_e_eventos:
                try:
                    BloqueioAgenda.objects.get_or_create(
                        studio=studio,
                        data=data_bloqueio,
                        defaults={'descricao': desc}
                    )
                    self.stdout.write(self.style.SUCCESS(f'Bloqueio de agenda para {studio.nome} em {data_bloqueio} ({desc}) criado.'))
                except IntegrityError as e:
                    self.stdout.write(self.style.WARNING(f'Bloqueio de agenda para {studio.nome} em {data_bloqueio} já existe: {e}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar bloqueio de agenda para {studio.nome}: {e}'))
        self.stdout.write(self.style.SUCCESS(f'Bloqueios de agenda definidos para {studios.count()} studios.'))

    def _seed_users(self, users_data, credentials_list, num_random_colaboradores=5):
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
                    self._create_colaborador_profile_from_data(user, data['colaborador_info'])

            except IntegrityError as e:
                self.stdout.write(self.style.ERROR(f'Erro de integridade ao criar "{email}": {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar usuário "{email}": {e}'))

        self.stdout.write(self.style.HTTP_INFO(f'\nGerando {num_random_colaboradores} colaboradores aleatórios...'))
        for _ in range(num_random_colaboradores):
            self._create_random_colaborador(credentials_list)

    def _create_random_colaborador(self, credentials_list):
        first_name = fake.first_name()
        last_name = fake.last_name()
        full_name = f"{first_name} {last_name}"
        email = fake.email()
        password = '123456'
        cpf = self._generate_valid_cpf()
        uuid_obj = fake.uuid4() # Define uuid_obj here
        
        # *** CORREÇÃO APLICADA AQUI ***
        username = slugify(f'{first_name}-{last_name}-{uuid_obj[:6]}')

        if Usuario.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Usuário aleatório com email "{email}" já existe, pulando.'))
            return

        try:
            user = Usuario.objects.create_user(
                username=username, email=email, password=password,
                first_name=first_name, last_name=last_name, cpf=cpf
            )
            self.stdout.write(self.style.SUCCESS(f'Usuário aleatório "{username}" criado.'))
            credentials_list.append({'email': email, 'password': password, 'role': 'colaborador'})

            # Random Colaborador Info
            random_perfis = random.sample(list(Perfil.NOME_CHOICES), k=random.randint(1, 2))
            perfis_nomes = [p[0] for p in random_perfis if p[0] not in ['ADMIN_MASTER']]
            
            studios = list(Studio.objects.all())
            if not studios:
                self.stdout.write(self.style.ERROR('Nenhum studio encontrado para vincular colaborador aleatório.'))
                return

            random_studio = random.choice(studios)
            random_funcoes = random.sample(list(FuncaoOperacional.objects.all()), k=random.randint(1, 2))
            permissao_nomes = [f.nome for f in random_funcoes]

            colaborador_info = {
                "perfis": perfis_nomes,
                "data_nascimento": fake.date_of_birth(minimum_age=22, maximum_age=60).strftime('%Y-%m-%d'),
                "telefone": fake.phone_number(),
                "registro_profissional": fake.bothify(text='##.###-##'),
                "endereco": {
                    "logradouro": fake.street_name(),
                    "numero": fake.building_number(),
                    "complemento": fake.word() or "",
                    "bairro": fake.bairro(),
                    "cidade": fake.city(),
                    "estado": fake.state_abbr(),
                    "cep": fake.postcode()
                },
                "vinculos_studio": [{"studio_nome": random_studio.nome, "permissao_nomes": permissao_nomes}]
            }
            self._create_colaborador_profile_from_data(user, colaborador_info)

        except IntegrityError as e:
            self.stdout.write(self.style.ERROR(f'Erro de integridade ao criar colaborador aleatório para "{email}": {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar colaborador aleatório para "{email}": {e}'))

    def _create_colaborador_profile_from_data(self, user, info):
        PERFIL_NOME_TO_FUNCAO_NOME = {
            'ADMIN_MASTER': 'Admin',
            'ADMINISTRADOR': 'Admin',
            'RECEPCIONISTA': 'Recep',
            'FISIOTERAPEUTA': 'Fisio',
            'INSTRUTOR': 'Instrutor',
        }
        endereco_data = info.get('endereco')
        if not endereco_data:
            self.stdout.write(self.style.WARNING(f'Colaborador "{user.email}" sem dados de endereço.'))
            return

        try:
            endereco, _ = Endereco.objects.get_or_create(**endereco_data)
            colaborador, created = Colaborador.objects.get_or_create(
                usuario=user,
                defaults={
                    'endereco': endereco,
                    'data_nascimento': info.get('data_nascimento'),
                    'telefone': info.get('telefone'),
                    'registro_profissional': info.get('registro_profissional', fake.bothify(text='##.###-##'))
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Colaborador "{user.username}" criado.'))
            else:
                self.stdout.write(self.style.WARNING(f'Colaborador "{user.username}" já existe.'))

            perfis_nomes = info.get('perfis', [])
            for perfil_nome in perfis_nomes:
                try:
                    perfil = Perfil.objects.get(nome=perfil_nome)
                    colaborador.perfis.add(perfil)
                except Perfil.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f'Perfil "{perfil_nome}" não encontrado para {user.email}.'))

            for vinculo in info.get('vinculos_studio', []):
                studio_nome = vinculo.get('studio_nome')
                permissao_nomes = vinculo.get('permissao_nomes', [])
                if not studio_nome or not permissao_nomes:
                    continue
                try:
                    studio = Studio.objects.get(nome=studio_nome)
                    for permissao_nome in permissao_nomes:
                        funcao_operacional = FuncaoOperacional.objects.get(nome=permissao_nome)
                        ColaboradorStudio.objects.get_or_create(colaborador=colaborador, studio=studio, permissao=funcao_operacional)
                        self.stdout.write(self.style.SUCCESS(f'Vínculo de {user.username} com {studio_nome} ({permissao_nome}) criado.'))
                except (Studio.DoesNotExist, FuncaoOperacional.DoesNotExist) as e:
                    self.stdout.write(self.style.ERROR(f'Erro ao vincular colaborador "{user.email}" a studio "{studio_nome}": {e}'))
            self.stdout.write(self.style.SUCCESS(f'Perfil de colaborador para "{user.username}" configurado.'))
        except IntegrityError as e:
            self.stdout.write(self.style.ERROR(f'Erro de integridade ao criar colaborador para "{user.email}": {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar colaborador para "{user.email}": {e}'))

    def _seed_alunos(self, alunos_data, credentials_list, num_random_alunos=20):
        self.stdout.write(self.style.HTTP_INFO(f'\nGerando {num_random_alunos + 1} alunos (1 padrão + {num_random_alunos} aleatórios)...'))
        
        studios = list(Studio.objects.all())
        if not studios:
            self.stdout.write(self.style.ERROR('Nenhum studio encontrado para associar alunos.'))
            return

        # --- Cria Aluno de Teste Padrão ---
        aluno_email = "aluno@pilates.com"
        aluno_pass = "123456"
        try:
            aluno_user, user_created = Usuario.objects.get_or_create(
                email=aluno_email,
                defaults={
                    'username': 'aluno.teste',
                    'first_name': 'Aluno',
                    'last_name': 'Teste',
                    'cpf': self._generate_valid_cpf()
                }
            )
            if user_created:
                aluno_user.set_password(aluno_pass)
                aluno_user.save()
                self.stdout.write(self.style.SUCCESS('Usuário de teste padrão para aluno criado.'))
            
            aluno, aluno_created = Aluno.objects.get_or_create(
                usuario=aluno_user,
                defaults={
                    'dataNascimento': date(1995, 1, 1),
                    'contato': '+5511912345678',
                    'is_active': True
                }
            )
            if aluno_created:
                aluno.unidades.add(random.choice(studios))
                self.stdout.write(self.style.SUCCESS('Aluno de teste padrão criado.'))
                credentials_list.append({'email': aluno_email, 'password': aluno_pass, 'role': 'Aluno'})
            else:
                self.stdout.write(self.style.WARNING(f'Aluno de teste padrão com email "{aluno_email}" já existe.'))
                credentials_list.append({'email': aluno_email, 'password': 'senha existente', 'role': 'Aluno'})
        except IntegrityError as e:
            self.stdout.write(self.style.ERROR(f'Erro de integridade ao criar aluno padrão "{aluno_email}": {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar aluno padrão "{aluno_email}": {e}'))


        # --- Cria Alunos Aleatórios Adicionais ---
        evaluators = list(Colaborador.objects.filter(perfis__nome__in=['INSTRUTOR', 'FISIOTERAPEUTA']).distinct())
        if not evaluators:
            self.stdout.write(self.style.WARNING('Nenhum instrutor ou fisioterapeuta encontrado para criar avaliações.'))

        for i in range(num_random_alunos):
            first_name = fake.first_name()
            last_name = fake.last_name()
            full_name = f"{first_name} {last_name}"
            email = fake.email()
            password = '123456'
            cpf = self._generate_valid_cpf()
            username = slugify(f'{first_name}-{last_name}-{str(fake.uuid4())[:6]}')

            if Usuario.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'Usuário aleatório com email "{email}" já existe, pulando.'))
                continue

            try:
                user = Usuario.objects.create_user(
                    username=username, email=email, password=password,
                    first_name=first_name, last_name=last_name, cpf=cpf
                )
                self.stdout.write(self.style.SUCCESS(f'Usuário aleatório "{username}" criado.'))

                random_date_of_birth = fake.date_of_birth(minimum_age=18, maximum_age=60)
                aluno, aluno_created = Aluno.objects.get_or_create(
                    usuario=user,
                    defaults={
                        'dataNascimento': random_date_of_birth,
                        'contato': fake.phone_number(),
                        'profissao': fake.job(),
                        'is_active': True
                    }
                )
                if aluno_created:
                    aluno.unidades.add(random.choice(studios))
                    self.stdout.write(self.style.SUCCESS(f'Aluno aleatório "{user.username}" criado.'))

                    if evaluators:
                        instrutor_avaliacao = random.choice(evaluators)
                        studio_avaliacao = random.choice(studios)
                        Avaliacao.objects.create(
                            aluno=aluno,
                            instrutor=instrutor_avaliacao,
                            data_avaliacao=fake.date_between(start_date='-1y', end_date='today'),
                            objetivo_aluno=fake.sentence(),
                            diagnostico_fisioterapeutico=fake.sentence(),
                            historico_medico=fake.paragraph(),
                            patologias=fake.sentence(),
                            exames_complementares=fake.sentence(),
                            medicamentos_em_uso=fake.sentence(),
                            tratamentos_realizados=fake.sentence(),
                            studio=studio_avaliacao
                        )
                        self.stdout.write(self.style.SUCCESS(f'Avaliação inicial para aluno "{user.username}" criada.'))
                else:
                    self.stdout.write(self.style.WARNING(f'Aluno aleatório "{user.username}" já existe.'))

            except IntegrityError as e:
                self.stdout.write(self.style.ERROR(f'Erro de integridade ao criar aluno aleatório para "{email}": {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar aluno aleatório para "{email}": {e}'))

        self.stdout.write(self.style.SUCCESS(f'{num_random_alunos} alunos aleatórios e suas avaliações iniciais foram criados.'))

    def _seed_creditos_manuais(self, num_alunos=5, num_creditos=3):
        self.stdout.write(self.style.HTTP_INFO(f'\nConcedendo {num_creditos} créditos para {num_alunos} alunos aleatórios...'))
        alunos = list(Aluno.objects.all())
        admin_user = Usuario.objects.filter(is_superuser=True).first()

        if not all([alunos, admin_user]):
            self.stdout.write(self.style.ERROR('Faltam alunos ou superusuário para conceder créditos.'))
            return

        alunos_selecionados = random.sample(alunos, min(len(alunos), num_alunos))
        for aluno in alunos_selecionados:
            try:
                CreditoAula.objects.create(
                    aluno=aluno,
                    quantidade=num_creditos,
                    adicionado_por=admin_user,
                    data_validade=fake.date_between(start_date='+30d', end_date='+180d')
                )
                self.stdout.write(self.style.SUCCESS(f'Créditos manuais concedidos a {aluno.usuario.username}.'))
            except IntegrityError as e:
                self.stdout.write(self.style.WARNING(f'Créditos para {aluno.usuario.username} já existem: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao conceder créditos a {aluno.usuario.username}: {e}'))
        self.stdout.write(self.style.SUCCESS(f'Créditos manuais concedidos a {len(alunos_selecionados)} alunos.'))

    def _seed_modalidades(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando modalidades...'))
        modalidades_nomes = ["Pilates Clássico", "Pilates Avançado", "Pilates com Equipamentos", "Mat Pilates", "Pilates Suspenso"]
        
        for nome in modalidades_nomes:
            try:
                modalidade, created = Modalidade.objects.get_or_create(
                    nome=nome
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Modalidade "{nome}" populada.'))
            except IntegrityError as e:
                self.stdout.write(self.style.WARNING(f'Modalidade "{nome}" já existe: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar modalidade "{nome}": {e}'))
        self.stdout.write(self.style.SUCCESS('Modalidades populadas.'))

    def _seed_aulas(self, total_aulas=40, chance_aula_lotada=0.2, chance_cancelamento=0.15):
        self.stdout.write(self.style.HTTP_INFO(f'\nPopulando {total_aulas} aulas com cenários complexos...'))

        modalidades = list(Modalidade.objects.all()) # Fetch existing modalities
        studios = list(Studio.objects.all()) # Fetch existing studios
        instrutores = list(Colaborador.objects.filter(perfis__nome='INSTRUTOR')) # Fetch existing instructors
        alunos = list(Aluno.objects.all()) # Fetch all students

        if not modalidades:
            self.stdout.write(self.style.ERROR('Nenhuma modalidade disponível para criar aulas.'))
            return
        if not instrutores:
            self.stdout.write(self.style.ERROR('Nenhum instrutor disponível para criar aulas.'))
            return
        if not alunos:
            self.stdout.write(self.style.ERROR('Nenhum aluno disponível para criar aulas.'))
            return


        aulas_criadas = 0
        listas_espera_criadas = 0
        creditos_gerados = 0

        for _ in range(total_aulas):
            try:
                studio = random.choice(studios)
                instrutor_principal = random.choice(instrutores)
                modalidade = random.choice(modalidades)
                
                data_hora_inicio = fake.date_time_between(start_date='now', end_date='+30d', tzinfo=timezone.get_current_timezone())
                data_hora_inicio = data_hora_inicio.replace(second=0, microsecond=0) # Normalize seconds and microseconds

                # Evita criar aulas em dias bloqueados
                if BloqueioAgenda.objects.filter(studio=studio, data=data_hora_inicio.date()).exists():
                    continue

                capacidade_maxima = random.randint(3, 8)
                duracao_minutos = random.choice([60, 90])
                tipo_aula = random.choice([Aula.TipoAula.REGULAR, Aula.TipoAula.EXPERIMENTAL])
                instrutor_substituto = random.choice(instrutores) if random.random() < 0.2 else None # 20% chance of substitute

                aula, created = Aula.objects.get_or_create(
                    studio=studio,
                    instrutor_principal=instrutor_principal,
                    modalidade=modalidade,
                    data_hora_inicio=data_hora_inicio,
                    defaults={
                        'duracao_minutos': duracao_minutos,
                        'capacidade_maxima': capacidade_maxima,
                        'tipo_aula': tipo_aula,
                        'instrutor_substituto': instrutor_substituto
                    }
                )

                if created:
                    aulas_criadas += 1
                    self.stdout.write(self.style.SUCCESS(f'Aula de {modalidade.nome} em {studio.nome} em {data_hora_inicio} criada.'))

                    alunos_para_inscrever = random.sample(alunos, min(len(alunos), capacidade_maxima + random.randint(0, 3))) # Some extra for waiting list

                    # Cenário de Aula Lotada
                    if random.random() < chance_aula_lotada:
                        # Preenche a capacidade máxima
                        for i in range(capacidade_maxima):
                            if not alunos_para_inscrever: break
                            aluno = alunos_para_inscrever.pop(0)
                            AulaAluno.objects.get_or_create(aula=aula, aluno=aluno)
                            self.stdout.write(self.style.SUCCESS(f'Aluno {aluno.usuario.username} inscrito na aula (lotada).'))
                        
                        # Adiciona os restantes à lista de espera
                        for aluno_extra in alunos_para_inscrever:
                            if aula.alunos_inscritos.count() >= aula.capacidade_maxima:
                                ListaEspera.objects.get_or_create(aula=aula, aluno=aluno_extra, defaults={'data_entrada': timezone.now()})
                                listas_espera_criadas += 1
                                self.stdout.write(self.style.SUCCESS(f'Aluno {aluno_extra.usuario.username} adicionado à lista de espera.'))
                    
                    # Cenário Normal de Inscrição
                    else:
                        num_alunos_inscritos = random.randint(1, capacidade_maxima)
                        for i in range(num_alunos_inscritos):
                            if not alunos_para_inscrever: break
                            aluno = alunos_para_inscrever.pop(0)
                            
                            if random.random() < chance_cancelamento:
                                agendamento, _ = AulaAluno.objects.get_or_create(
                                    aula=aula, 
                                    aluno=aluno, 
                                    defaults={'status_presenca': AulaAluno.StatusPresenca.AUSENTE_COM_REPO}
                                )
                                CreditoAula.objects.create(
                                    aluno=aluno,
                                    quantidade=1,
                                    agendamento_origem=agendamento,
                                    data_validade=fake.date_between(start_date='+30d', end_date='+180d')
                                )
                                creditos_gerados += 1
                                self.stdout.write(self.style.SUCCESS(f'Aluno {aluno.usuario.username} cancelou e recebeu crédito.'))
                            else:
                                AulaAluno.objects.get_or_create(aula=aula, aluno=aluno)
                                self.stdout.write(self.style.SUCCESS(f'Aluno {aluno.usuario.username} inscrito na aula.'))

            except IntegrityError as e:
                self.stdout.write(self.style.WARNING(f'Aula já existe ou erro de integridade: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar aula: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'{aulas_criadas} aulas criadas.'))
        self.stdout.write(self.style.SUCCESS(f'{listas_espera_criadas} inscrições em lista de espera.'))
        self.stdout.write(self.style.SUCCESS(f'{creditos_gerados} créditos de reposição gerados por ausência.'))

    def _seed_planos(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando planos...'))
        planos_data = [
            {"nome": "Plano Mensal Básico", "duracao_dias": 30, "creditos_semanais": 1, "preco": "150.00"},
            {"nome": "Plano Mensal Premium", "duracao_dias": 30, "creditos_semanais": 2, "preco": "250.00"},
            {"nome": "Plano Trimestral", "duracao_dias": 90, "creditos_semanais": 2, "preco": "600.00"},
            {"nome": "Plano Anual", "duracao_dias": 365, "creditos_semanais": 3, "preco": "2500.00"},
        ]

        for data in planos_data:
            try:
                from financeiro.models import Plano
                Plano.objects.get_or_create(
                    nome=data['nome'],
                    defaults={
                        'duracao_dias': data['duracao_dias'],
                        'creditos_semanais': data['creditos_semanais'],
                        'preco': data['preco']
                    }
                )
                self.stdout.write(self.style.SUCCESS(f'Plano "{data["nome"]}" populado.'))
            except IntegrityError as e:
                self.stdout.write(self.style.WARNING(f'Plano "{data["nome"]}" já existe: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar plano "{data["nome"]}": {e}'))
        self.stdout.write(self.style.SUCCESS('Planos populados.'))

    def _seed_produtos(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando produtos...'))
        produtos_data = [
            {"nome": "Camiseta Pilates", "preco": "79.90"},
            {"nome": "Meia Antiderrapante", "preco": "35.00"},
            {"nome": "Bola Suíça", "preco": "120.00"},
            {"nome": "Faixa Elástica", "preco": "25.00"},
        ]

        for data in produtos_data:
            try:
                from financeiro.models import Produto
                Produto.objects.get_or_create(
                    nome=data['nome'],
                    defaults={'preco': data['preco']}
                )
                self.stdout.write(self.style.SUCCESS(f'Produto "{data["nome"]}" populado.'))
            except IntegrityError as e:
                self.stdout.write(self.style.WARNING(f'Produto "{data["nome"]}" já existe: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar produto "{data["nome"]}": {e}'))
        self.stdout.write(self.style.SUCCESS('Produtos populados.'))

    def _seed_matriculas(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando matrículas...'))
        from financeiro.models import Plano, Matricula
        
        alunos = list(Aluno.objects.all())
        planos = list(Plano.objects.all())
        studios = list(Studio.objects.all())

        if not all([alunos, planos, studios]):
            self.stdout.write(self.style.WARNING('Faltam alunos, planos ou studios para criar matrículas.'))
            return

        for _ in range(10): # Create 10 random enrollments
            aluno = random.choice(alunos)
            plano = random.choice(planos)
            studio = random.choice(studios)
            
            data_inicio = fake.date_between(start_date='-60d', end_date='today')
            data_fim = data_inicio + timedelta(days=plano.duracao_dias)

            try:
                Matricula.objects.get_or_create(
                    aluno=aluno.usuario,
                    plano=plano,
                    studio=studio,
                    data_inicio=data_inicio,
                    defaults={'data_fim': data_fim}
                )
                self.stdout.write(self.style.SUCCESS(f'Matrícula para {aluno.usuario.username} com plano {plano.nome} no studio {studio.nome} criada.'))
            except IntegrityError as e:
                self.stdout.write(self.style.WARNING(f'Matrícula para {aluno.usuario.username} já existe: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar matrícula para {aluno.usuario.username}: {e}'))
        self.stdout.write(self.style.SUCCESS('Matrículas populadas.'))

    def _seed_vendas(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando vendas...'))
        from financeiro.models import Produto, Venda
        
        alunos = list(Aluno.objects.all())
        produtos = list(Produto.objects.all())
        studios = list(Studio.objects.all())

        if not all([alunos, produtos, studios]):
            self.stdout.write(self.style.WARNING('Faltam alunos, produtos ou studios para criar vendas.'))
            return

        for _ in range(15): # Create 15 random sales
            aluno = random.choice(alunos) if random.random() > 0.3 else None # 70% chance of associated student
            studio = random.choice(studios)
            
            num_produtos_vendidos = random.randint(1, min(3, len(produtos)))
            produtos_vendidos = random.sample(produtos, num_produtos_vendidos)
            
            data_venda = fake.date_between(start_date='-60d', end_date='today')

            try:
                venda = Venda.objects.create(
                    aluno=aluno.usuario if aluno else None,
                    studio=studio,
                    data_venda=data_venda
                )
                for produto in produtos_vendidos:
                    VendaProduto.objects.create(
                        venda=venda,
                        produto=produto,
                        quantidade=random.randint(1, 3), # Random quantity
                        preco_unitario=produto.preco
                    )
                self.stdout.write(self.style.SUCCESS(f'Venda {venda.id} no studio {studio.nome} criada.'))
            except IntegrityError as e:
                self.stdout.write(self.style.WARNING(f'Erro de integridade ao criar venda: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar venda: {e}'))
        self.stdout.write(self.style.SUCCESS('Vendas populadas.'))

    def _seed_pagamentos(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando pagamentos...'))
        
        matriculas = list(Matricula.objects.all())
        vendas = list(Venda.objects.all())

        if not (matriculas or vendas):
            self.stdout.write(self.style.WARNING('Faltam matrículas ou vendas para criar pagamentos.'))
            return

        # Payments for enrollments
        for matricula in matriculas:
            try:
                valor_total = matricula.plano.preco
                metodo_pagamento = random.choice(['CARTAO_CREDITO', 'PIX', 'DINHEIRO'])
                status = random.choice(['PAGO', 'PENDENTE'])
                data_vencimento = fake.date_between(start_date='today', end_date='+30d')
                data_pagamento = fake.date_between(start_date='-7d', end_date='today') if status == 'PAGO' else None

                Pagamento.objects.get_or_create(
                    matricula=matricula,
                    defaults={
                        'valor_total': valor_total,
                        'metodo_pagamento': metodo_pagamento,
                        'status': status,
                        'data_vencimento': data_vencimento,
                        'data_pagamento': data_pagamento
                    }
                )
                self.stdout.write(self.style.SUCCESS(f'Pagamento para matrícula {matricula.id} ({status}) criado.'))
            except IntegrityError as e:
                self.stdout.write(self.style.WARNING(f'Pagamento para matrícula {matricula.id} já existe: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar pagamento para matrícula {matricula.id}: {e}'))

        # Payments for sales
        for venda in vendas:
            try:
                # Corrigindo para calcular o valor total da venda corretamente
                valor_total = sum(vp.preco_unitario * vp.quantidade for vp in venda.vendaproduto_set.all())
                
                metodo_pagamento = random.choice(['CARTAO_CREDITO', 'PIX', 'DINHEIRO'])
                status = random.choice(['PAGO', 'PENDENTE'])
                data_vencimento = fake.date_between(start_date='today', end_date='+30d')
                data_pagamento = fake.date_between(start_date='-7d', end_date='today') if status == 'PAGO' else None

                Pagamento.objects.get_or_create(
                    venda=venda,
                    defaults={
                        'valor_total': valor_total,
                        'metodo_pagamento': metodo_pagamento,
                        'status': status,
                        'data_vencimento': data_vencimento,
                        'data_pagamento': data_pagamento
                    }
                )
                self.stdout.write(self.style.SUCCESS(f'Pagamento para venda {venda.id} ({status}) criado.'))
            except IntegrityError as e:
                self.stdout.write(self.style.WARNING(f'Pagamento para venda {venda.id} já existe: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro inesperado ao criar pagamento para venda {venda.id}: {e}'))
        self.stdout.write(self.style.SUCCESS('Pagamentos populados.'))