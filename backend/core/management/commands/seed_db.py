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
    help = 'Popula o banco de dados com dados de teste. Garanta que as migrações já foram executadas com "python manage.py migrate" antes de rodar este comando.'

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
                    "registro_profissional": "CREF-98765",
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
                self._seed_users(users_data, created_users_credentials, num_random_colaboradores=5)
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
        # A ordem é importante para evitar erros de chave estrangeira
        ListaEspera.objects.all().delete()
        CreditoAula.objects.all().delete()
        Pagamento.objects.all().delete()
        VendaProduto.objects.all().delete()
        Venda.objects.all().delete()
        Matricula.objects.all().delete()
        BloqueioAgenda.objects.all().delete()
        HorarioTrabalho.objects.all().delete()
        AulaAluno.objects.all().delete()
        Aula.objects.all().delete()
        Modalidade.objects.all().delete()
        Avaliacao.objects.all().delete()
        ColaboradorStudio.objects.all().delete()
        Aluno.objects.all().delete()
        Colaborador.objects.all().delete()
        Usuario.objects.filter(is_superuser=False).delete()
        Studio.objects.all().delete()
        Endereco.objects.all().delete()
        Perfil.objects.all().delete()
        FuncaoOperacional.objects.all().delete()
        Produto.objects.all().delete()
        Plano.objects.all().delete()
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
            studio = random.choice(studios)
            
            for i in range(5):
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
                except IntegrityError:
                    pass
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
                BloqueioAgenda.objects.get_or_create(
                    studio=studio,
                    data=data_bloqueio,
                    defaults={'descricao': desc}
                )
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
        email = fake.email()
        password = '123456'
        cpf = self._generate_valid_cpf()
        uuid_obj = fake.uuid4()
        username = slugify(f'{first_name}-{last_name}-{uuid_obj[:6]}')

        if Usuario.objects.filter(email=email).exists():
            return

        try:
            user = Usuario.objects.create_user(
                username=username, email=email, password=password,
                first_name=first_name, last_name=last_name, cpf=cpf
            )
            credentials_list.append({'email': email, 'password': password, 'role': 'colaborador'})

            random_perfis = random.sample(list(Perfil.NOME_CHOICES), k=random.randint(1, 2))
            perfis_nomes = [p[0] for p in random_perfis if p[0] not in ['ADMIN_MASTER']]
            
            studios = list(Studio.objects.all())
            if not studios: return

            random_studio = random.choice(studios)
            random_funcoes = random.sample(list(FuncaoOperacional.objects.all()), k=random.randint(1, 2))
            permissao_nomes = [f.nome for f in random_funcoes]

            colaborador_info = {
                "perfis": perfis_nomes,
                "data_nascimento": fake.date_of_birth(minimum_age=22, maximum_age=60).strftime('%Y-%m-%d'),
                "telefone": fake.phone_number(),
                "registro_profissional": fake.bothify(text='##.###-##'),
                "endereco": {
                    "logradouro": fake.street_name(), "numero": fake.building_number(),
                    "bairro": fake.bairro(), "cidade": fake.city(),
                    "estado": fake.state_abbr(), "cep": fake.postcode()
                },
                "vinculos_studio": [{"studio_nome": random_studio.nome, "permissao_nomes": permissao_nomes}]
            }
            self._create_colaborador_profile_from_data(user, colaborador_info)

        except IntegrityError:
            pass

    def _create_colaborador_profile_from_data(self, user, info):
        endereco_data = info.get('endereco')
        if not endereco_data: return

        try:
            endereco, _ = Endereco.objects.get_or_create(**endereco_data)
            colaborador, _ = Colaborador.objects.get_or_create(
                usuario=user,
                defaults={
                    'endereco': endereco,
                    'data_nascimento': info.get('data_nascimento'),
                    'telefone': info.get('telefone'),
                    'registro_profissional': info.get('registro_profissional', fake.bothify(text='##.###-##'))
                }
            )

            for perfil_nome in info.get('perfis', []):
                perfil = Perfil.objects.get(nome=perfil_nome)
                colaborador.perfis.add(perfil)

            for vinculo in info.get('vinculos_studio', []):
                studio = Studio.objects.get(nome=vinculo['studio_nome'])
                for permissao_nome in vinculo['permissao_nomes']:
                    funcao = FuncaoOperacional.objects.get(nome=permissao_nome)
                    ColaboradorStudio.objects.get_or_create(colaborador=colaborador, studio=studio, permissao=funcao)
        except Exception:
            pass

    def _seed_alunos(self, alunos_data, credentials_list, num_random_alunos=20):
        self.stdout.write(self.style.HTTP_INFO(f'\nGerando {num_random_alunos + 1} alunos...'))
        
        studios = list(Studio.objects.all())
        if not studios: return

        aluno_email = "aluno@pilates.com"
        aluno_pass = "123456"
        try:
            aluno_user, user_created = Usuario.objects.get_or_create(
                email=aluno_email,
                defaults={'username': 'aluno.teste', 'first_name': 'Aluno', 'last_name': 'Teste', 'cpf': self._generate_valid_cpf()}
            )
            if user_created:
                aluno_user.set_password(aluno_pass)
                aluno_user.save()
            
            aluno, aluno_created = Aluno.objects.get_or_create(
                usuario=aluno_user,
                defaults={'dataNascimento': date(1995, 1, 1), 'contato': '+5511912345678', 'is_active': True}
            )
            if aluno_created:
                aluno.unidades.add(random.choice(studios))
                credentials_list.append({'email': aluno_email, 'password': aluno_pass, 'role': 'Aluno'})
        except IntegrityError:
            pass

        evaluators = list(Colaborador.objects.filter(perfis__nome__in=['INSTRUTOR', 'FISIOTERAPEUTA']).distinct())

        for _ in range(num_random_alunos):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = fake.email()
            cpf = self._generate_valid_cpf()
            username = slugify(f'{first_name}-{last_name}-{str(fake.uuid4())[:6]}')

            if Usuario.objects.filter(email=email).exists(): continue

            try:
                user = Usuario.objects.create_user(
                    username=username, email=email, password='123456',
                    first_name=first_name, last_name=last_name, cpf=cpf
                )
                aluno, aluno_created = Aluno.objects.get_or_create(
                    usuario=user,
                    defaults={
                        'dataNascimento': fake.date_of_birth(minimum_age=18, maximum_age=60),
                        'contato': fake.phone_number(), 'profissao': fake.job(), 'is_active': True
                    }
                )
                if aluno_created:
                    aluno.unidades.add(random.choice(studios))
                    if evaluators:
                        Avaliacao.objects.create(
                            aluno=aluno, instrutor=random.choice(evaluators),
                            data_avaliacao=fake.date_between(start_date='-1y', end_date='today'),
                            objetivo_aluno=fake.sentence(), studio=random.choice(studios)
                        )
            except IntegrityError:
                pass

    def _seed_creditos_manuais(self, num_alunos=5, num_creditos=3):
        self.stdout.write(self.style.HTTP_INFO(f'\nConcedendo créditos manuais...'))
        alunos = list(Aluno.objects.all())
        admin_user = Usuario.objects.filter(is_superuser=True).first()

        if not all([alunos, admin_user]): return

        for aluno in random.sample(alunos, min(len(alunos), num_alunos)):
            CreditoAula.objects.create(
                aluno=aluno, quantidade=num_creditos, adicionado_por=admin_user,
                data_validade=fake.date_between(start_date='+30d', end_date='+180d')
            )

    def _seed_modalidades(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando modalidades...'))
        for nome in ["Pilates Clássico", "Pilates Avançado", "Pilates com Equipamentos", "Mat Pilates", "Pilates Suspenso"]:
            Modalidade.objects.get_or_create(nome=nome)

    def _seed_aulas(self, total_aulas=40, chance_aula_lotada=0.2, chance_cancelamento=0.15):
        self.stdout.write(self.style.HTTP_INFO(f'\nPopulando aulas...'))
        modalidades = list(Modalidade.objects.all())
        studios = list(Studio.objects.all())
        instrutores = list(Colaborador.objects.filter(perfis__nome='INSTRUTOR'))
        alunos = list(Aluno.objects.all())

        if not all([modalidades, studios, instrutores, alunos]): return

        for _ in range(total_aulas):
            try:
                aula_data = {
                    'studio': random.choice(studios), 'instrutor_principal': random.choice(instrutores),
                    'modalidade': random.choice(modalidades),
                    'data_hora_inicio': fake.date_time_between(start_date='now', end_date='+30d', tzinfo=timezone.get_current_timezone()).replace(second=0, microsecond=0),
                    'capacidade_maxima': random.randint(3, 8), 'duracao_minutos': random.choice([60, 90]),
                    'tipo_aula': random.choice([Aula.TipoAula.REGULAR, Aula.TipoAula.EXPERIMENTAL]),
                    'instrutor_substituto': random.choice(instrutores) if random.random() < 0.2 else None
                }
                if BloqueioAgenda.objects.filter(studio=aula_data['studio'], data=aula_data['data_hora_inicio'].date()).exists(): continue
                
                aula, created = Aula.objects.get_or_create(**aula_data)
                if not created: continue

                alunos_para_inscrever = random.sample(alunos, min(len(alunos), aula.capacidade_maxima + 3))
                if random.random() < chance_aula_lotada:
                    for i in range(aula.capacidade_maxima):
                        if alunos_para_inscrever: AulaAluno.objects.create(aula=aula, aluno=alunos_para_inscrever.pop(0))
                    for aluno_extra in alunos_para_inscrever:
                        ListaEspera.objects.create(aula=aula, aluno=aluno_extra)
                else:
                    for i in range(random.randint(1, aula.capacidade_maxima)):
                        if alunos_para_inscrever:
                            aluno = alunos_para_inscrever.pop(0)
                            if random.random() < chance_cancelamento:
                                agendamento = AulaAluno.objects.create(aula=aula, aluno=aluno, status_presenca=AulaAluno.StatusPresenca.AUSENTE_COM_REPO)
                                CreditoAula.objects.create(aluno=aluno, quantidade=1, agendamento_origem=agendamento, data_validade=fake.date_between(start_date='+30d', end_date='+180d'))
                            else:
                                AulaAluno.objects.create(aula=aula, aluno=aluno)
            except IntegrityError:
                pass

    def _seed_planos(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando planos...'))
        for data in [
            {"nome": "Plano Mensal Básico", "duracao_dias": 30, "creditos_semanais": 1, "preco": "150.00"},
            {"nome": "Plano Mensal Premium", "duracao_dias": 30, "creditos_semanais": 2, "preco": "250.00"},
            {"nome": "Plano Trimestral", "duracao_dias": 90, "creditos_semanais": 2, "preco": "600.00"},
            {"nome": "Plano Anual", "duracao_dias": 365, "creditos_semanais": 3, "preco": "2500.00"},
        ]:
            Plano.objects.get_or_create(nome=data['nome'], defaults=data)

    def _seed_produtos(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando produtos...'))
        for data in [
            {"nome": "Camiseta Pilates", "preco": "79.90"}, {"nome": "Meia Antiderrapante", "preco": "35.00"},
            {"nome": "Bola Suíça", "preco": "120.00"}, {"nome": "Faixa Elástica", "preco": "25.00"},
        ]:
            Produto.objects.get_or_create(nome=data['nome'], defaults=data)

    def _seed_matriculas(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando matrículas...'))
        alunos = list(Aluno.objects.all())
        planos = list(Plano.objects.all())
        studios = list(Studio.objects.all())
        if not all([alunos, planos, studios]): return

        for _ in range(10):
            aluno, plano, studio = random.choice(alunos), random.choice(planos), random.choice(studios)
            data_inicio = fake.date_between(start_date='-60d', end_date='today')
            Matricula.objects.get_or_create(
                aluno=aluno.usuario, plano=plano, studio=studio, data_inicio=data_inicio,
                defaults={'data_fim': data_inicio + timedelta(days=plano.duracao_dias)}
            )

    def _seed_vendas(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando vendas...'))
        alunos = list(Aluno.objects.all())
        produtos = list(Produto.objects.all())
        studios = list(Studio.objects.all())
        if not all([alunos, produtos, studios]): return

        for _ in range(15):
            venda = Venda.objects.create(
                aluno=random.choice(alunos).usuario if random.random() > 0.3 else None,
                studio=random.choice(studios), data_venda=fake.date_between(start_date='-60d', end_date='today')
            )
            for produto in random.sample(produtos, random.randint(1, min(3, len(produtos)))):
                VendaProduto.objects.create(venda=venda, produto=produto, quantidade=random.randint(1, 3), preco_unitario=produto.preco)

    def _seed_pagamentos(self):
        self.stdout.write(self.style.HTTP_INFO('\nPopulando pagamentos...'))
        matriculas = list(Matricula.objects.all())
        vendas = list(Venda.objects.all())
        if not (matriculas or vendas): return

        for matricula in matriculas:
            Pagamento.objects.get_or_create(
                matricula=matricula,
                defaults={
                    'valor_total': matricula.plano.preco, 'metodo_pagamento': random.choice(['CARTAO_CREDITO', 'PIX', 'DINHEIRO']),
                    'status': random.choice(['PAGO', 'PENDENTE']), 'data_vencimento': fake.date_between(start_date='today', end_date='+30d'),
                    'data_pagamento': fake.date_between(start_date='-7d', end_date='today') if random.choice([True, False]) else None
                }
            )
        for venda in vendas:
            Pagamento.objects.get_or_create(
                venda=venda,
                defaults={
                    'valor_total': sum(vp.preco_unitario * vp.quantidade for vp in venda.vendaproduto_set.all()),
                    'metodo_pagamento': random.choice(['CARTAO_CREDITO', 'PIX', 'DINHEIRO']),
                    'status': random.choice(['PAGO', 'PENDENTE']), 'data_vencimento': fake.date_between(start_date='today', end_date='+30d'),
                    'data_pagamento': fake.date_between(start_date='-7d', end_date='today') if random.choice([True, False]) else None
                }
            )
