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
from financeiro.models import Plano, Produto, Matricula, Venda, VendaProduto, Pagamento, EstoqueStudio

fake = Faker('pt_BR')

class Command(BaseCommand):
    help = 'Popula o banco de dados com dados de teste para diversos cenários de uso.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Limpa o banco de dados antes de popular com novos dados.'
        )
        parser.add_argument('--num-colaboradores', type=int, default=5, help='Número de colaboradores aleatórios a serem criados.')
        parser.add_argument('--num-alunos', type=int, default=20, help='Número de alunos aleatórios a serem criados.')
        parser.add_argument('--num-aulas', type=int, default=50, help='Número total de aulas a serem criadas (passado e futuro).')

    def _generate_valid_cpf(self):
        """Gera um número de CPF válido e único no banco de dados."""
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
        self.stdout.write(self.style.SUCCESS('🚀 Iniciando o processo de seeding...'))

        if options['clean']:
            self._clean_database()

        # Parâmetros da execução
        num_random_colaboradores = options['num_colaboradores']
        num_random_alunos = options['num_alunos']
        num_aulas = options['num_aulas']

        # --- DADOS PREDEFINIDOS E CENÁRIOS ---
        studios_data = [
            {"nome": "DEFINE PILATES - Unidade São Miguel", "endereco": "São Miguel Paulista, São Paulo - SP"},
            {"nome": "DEFINE PILATES - Unidade Itaquera", "endereco": "Itaquera, São Paulo - SP"},
            {"nome": "DEFINE PILATES - Unidade Paulista", "endereco": "Avenida Paulista, São Paulo - SP"}
        ]
        users_data = self._get_predefined_users_scenarios()
        created_users_credentials = []

        try:
            with transaction.atomic():
                # Fase 1: Dados Estruturais
                self.stdout.write(self.style.HTTP_INFO('\n--- Fase 1: Populando Dados Estruturais ---'))
                self._seed_base_data()
                self._seed_studios(studios_data)
                self._seed_horarios_trabalho()
                self._seed_bloqueios_agenda()
                self._seed_modalidades()
                self._seed_planos()
                self._seed_produtos()
                self._seed_estoque() # <-- NOVO PASSO

                # Fase 2: Usuários e Alunos
                self.stdout.write(self.style.HTTP_INFO('\n--- Fase 2: Populando Usuários e Alunos com Cenários ---'))
                self._seed_users(users_data, created_users_credentials, num_random_colaboradores)
                self._seed_alunos(created_users_credentials, num_random_alunos)

                # Fase 3: Matrículas e Financeiro
                self.stdout.write(self.style.HTTP_INFO('\n--- Fase 3: Populando Cenários Financeiros ---'))
                self._seed_matriculas_e_cenarios()
                self._seed_vendas_e_cenarios()
                self._seed_pagamentos_e_cenarios()
                self._seed_creditos_e_cenarios()

                # Fase 4: Agendamentos e Avaliações
                self.stdout.write(self.style.HTTP_INFO('\n--- Fase 4: Populando Agendamentos e Avaliações ---'))
                self._seed_aulas_e_cenarios(num_aulas)
                self._seed_avaliacoes_e_cenarios()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Ocorreu um erro durante o seeding: {e}'))
            self.stdout.write(self.style.WARNING('As alterações foram revertidas devido ao erro.'))
            import traceback
            traceback.print_exc()
            return

        self.stdout.write(self.style.SUCCESS('\n✅ Processo de seeding concluído!'))
        self._report_credentials(created_users_credentials)

    def _get_predefined_users_scenarios(self):
        """Retorna uma lista de dicionários com cenários de usuários pré-definidos."""
        return [
            {"role": "superuser", "definir_nome_completo": "Admin Master", "email": "admin@pilates.com", "password": "123456", "cpf": "00000000000"},
            {"role": "colaborador", "definir_nome_completo": "Master Admin Profile", "email": "master.admin@pilates.com", "password": "123456", "cpf": "99999999999", "colaborador_info": {"perfis": ['ADMIN_MASTER'], "data_nascimento": "1980-01-01", "telefone": "+5511999999999", "registro_profissional": "ADM-001", "endereco": {"logradouro": "Rua Principal", "numero": "1", "bairro": "Centro", "cidade": "São Paulo", "estado": "SP", "cep": "01000-000"}, "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade São Miguel", "permissao_nomes": ["Admin"]}]}},
            {"role": "colaborador", "definir_nome_completo": "Ana Silva (Instrutora)", "email": "ana.silva@pilates.com", "password": "123456", "cpf": "11111111111", "colaborador_info": {"perfis": ['INSTRUTOR'], "data_nascimento": "1990-05-15", "telefone": "+5511987654321", "registro_profissional": "CREF-123456", "endereco": {"logradouro": "Rua das Flores", "numero": "10", "bairro": "Centro", "cidade": "São Paulo", "estado": "SP", "cep": "01001-000"}, "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade São Miguel", "permissao_nomes": ["Instrutor"]}]}},
            {"role": "colaborador", "definir_nome_completo": "Roberto Lima (Fisio)", "email": "roberto.lima@pilates.com", "password": "123456", "cpf": "44444444444", "colaborador_info": {"perfis": ['FISIOTERAPEUTA'], "data_nascimento": "1988-11-30", "telefone": "+5511977776666", "registro_profissional": "CREFITO-7890", "endereco": {"logradouro": "Rua dos Sonhos", "numero": "45", "bairro": "Tatuapé", "cidade": "São Paulo", "estado": "SP", "cep": "03300-000"}, "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Itaquera", "permissao_nomes": ["Fisio"]}]}},
            {"role": "colaborador", "definir_nome_completo": "Carla Souza (Multi-Perfil)", "email": "carla.souza@pilates.com", "password": "123456", "cpf": "55555555555", "colaborador_info": {"perfis": ['INSTRUTOR', 'FISIOTERAPEUTA'], "data_nascimento": "1992-03-25", "telefone": "+5511966665555", "registro_profissional": "CREF-98765", "endereco": {"logradouro": "Avenida Paulista", "numero": "1500", "bairro": "Bela Vista", "cidade": "São Paulo", "estado": "SP", "cep": "01310-200"}, "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Paulista", "permissao_nomes": ["Instrutor", "Fisio"]}]}},
            {"role": "colaborador", "definir_nome_completo": "Lucas Martins (Multi-Studio)", "email": "lucas.martins@pilates.com", "password": "123456", "cpf": "88888888888", "colaborador_info": {"perfis": ['INSTRUTOR'], "data_nascimento": "1993-08-10", "telefone": "+5511933332222", "registro_profissional": "CREF-55555", "endereco": {"logradouro": "Rua da Mooca", "numero": "2000", "bairro": "Mooca", "cidade": "São Paulo", "estado": "SP", "cep": "03104-002"}, "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade São Miguel", "permissao_nomes": ["Instrutor"]}, {"studio_nome": "DEFINE PILATES - Unidade Itaquera", "permissao_nomes": ["Instrutor"]}]}},
            {"role": "colaborador", "definir_nome_completo": "Mariana Costa (Recepção)", "email": "mariana.costa@pilates.com", "password": "123456", "cpf": "77777777777", "colaborador_info": {"perfis": ['RECEPCIONISTA'], "data_nascimento": "1998-07-20", "telefone": "+5511944443333", "registro_profissional": "REC-001", "endereco": {"logradouro": "Rua Itapura", "numero": "300", "bairro": "Tatuapé", "cidade": "São Paulo", "estado": "SP", "cep": "03310-000"}, "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade Itaquera", "permissao_nomes": ["Recep"]}]}},
            {"role": "colaborador", "definir_nome_completo": "Usuario Inativo", "email": "inativo@pilates.com", "password": "123456", "cpf": "10101010101", "is_active": False, "colaborador_info": {"perfis": ['INSTRUTOR'], "data_nascimento": "1990-01-01", "telefone": "+5511900000000", "registro_profissional": "INATIVO-01", "endereco": {"logradouro": "Rua dos Inativos", "numero": "1", "bairro": "Longe", "cidade": "São Paulo", "estado": "SP", "cep": "01010-010"}, "vinculos_studio": [{"studio_nome": "DEFINE PILATES - Unidade São Miguel", "permissao_nomes": ["Instrutor"]}]}},
        ]

    def _clean_database(self):
        self.stdout.write(self.style.WARNING('\n🧹 LIMPANDO o banco de dados...'))
        models_to_delete = [
            ListaEspera, CreditoAula, Pagamento, VendaProduto, Venda, Matricula,
            BloqueioAgenda, HorarioTrabalho, AulaAluno, Aula, Modalidade, Avaliacao,
            ColaboradorStudio, Aluno, Colaborador, Endereco, Perfil, FuncaoOperacional,
            EstoqueStudio, # <-- ADICIONADO
            Produto, Plano, Studio
        ]
        for model in models_to_delete:
            model.objects.all().delete()
        Usuario.objects.filter(is_superuser=False).delete()
        self.stdout.write(self.style.WARNING('Limpeza concluída.'))

    def _report_credentials(self, credentials):
        self.stdout.write(self.style.HTTP_INFO('\n--- 🔑 Credenciais dos Usuários para Teste ---'))
        if not credentials:
            self.stdout.write("Nenhum usuário definido foi criado ou encontrado.")
            return

        for cred in sorted(credentials, key=lambda x: x.get('role', 'z')):
            role = cred.get('role', 'desconhecido').replace("_", " ").title()
            self.stdout.write(f"\n- {role}: {cred.get('name', '')}")
            self.stdout.write(f"  Email: {cred['email']}")
            self.stdout.write(f"  Senha: {cred['password']}")
            if cred.get('perfis'):
                self.stdout.write(f"  Perfis: {', '.join(cred['perfis'])}")
        self.stdout.write(self.style.HTTP_INFO('---------------------------------------------'))

    def _seed_base_data(self):
        self.stdout.write('Populando dados de base (Perfis e Funções)...')
        for nome_db, _ in Perfil.NOME_CHOICES:
            Perfil.objects.get_or_create(nome=nome_db)
        for nome_funcao in ["Admin", "Instrutor", "Fisio", "Recep"]:
            FuncaoOperacional.objects.get_or_create(nome=nome_funcao)
        self.stdout.write(self.style.SUCCESS('Perfis e Funções populados.'))

    def _seed_studios(self, studios_data):
        self.stdout.write('Populando studios...')
        for data in studios_data:
            Studio.objects.get_or_create(nome=data['nome'], defaults={'endereco': data.get('endereco', '')})
        self.stdout.write(self.style.SUCCESS(f'{len(studios_data)} studios populados.'))

    def _seed_horarios_trabalho(self):
        self.stdout.write('Populando horários de trabalho dos estúdios...')
        studios = list(Studio.objects.all())
        if not studios:
            self.stdout.write(self.style.WARNING('Nenhum studio encontrado para definir horários.'))
            return

        for studio in studios:
            for dia in range(5):
                try:
                    HorarioTrabalho.objects.get_or_create(
                        studio=studio,
                        dia_semana=dia,
                        defaults={'hora_inicio': time(8, 0), 'hora_fim': time(20, 0)}
                    )
                except IntegrityError:
                    continue
        self.stdout.write(self.style.SUCCESS('Horários de trabalho dos estúdios populados.'))

    def _seed_bloqueios_agenda(self):
        self.stdout.write('Populando bloqueios de agenda (feriados e eventos)...')
        studios = Studio.objects.all()
        if not studios.exists(): return

        current_year = date.today().year
        feriados_e_eventos = [
            (date(current_year, 12, 25), "Natal"),
            (date(current_year + 1, 1, 1), "Confraternização Universal"),
            (date.today() + timedelta(days=15), "Manutenção Geral do Studio"),
        ]

        for studio in studios:
            for data_bloqueio, desc in feriados_e_eventos:
                BloqueioAgenda.objects.get_or_create(studio=studio, data=data_bloqueio, defaults={'descricao': desc})
        
        self.stdout.write(self.style.SUCCESS(f'Bloqueios de agenda definidos.'))

    def _seed_users(self, users_data, credentials_list, num_random_colaboradores):
        self.stdout.write('Populando usuários pré-definidos e cenários...')
        for data in users_data:
            email = data['email']
            password = data['password']
            cred_info = {'email': email, 'password': password, 'role': data.get('role'), 'name': data.get('definir_nome_completo')}
            if data.get('role') == 'colaborador':
                cred_info['perfis'] = data.get('colaborador_info', {}).get('perfis', [])

            if Usuario.objects.filter(email=email).exists():
                cred_info['password'] = '(senha existente)'
                credentials_list.append(cred_info)
                continue

            nome_completo = data.get('definir_nome_completo', '')
            first_name, last_name = (nome_completo.split(' ', 1) + [''])[:2]
            
            try:
                user_defaults = {
                    'first_name': first_name, 'last_name': last_name,
                    'cpf': data.get('cpf') or self._generate_valid_cpf(),
                    'is_active': data.get('is_active', True)
                }
                if data.get('role') == 'superuser':
                    user = Usuario.objects.create_superuser(username=email.split('@')[0], email=email, password=password, **user_defaults)
                else:
                    user = Usuario.objects.create_user(username=email.split('@')[0], email=email, password=password, **user_defaults)
                
                credentials_list.append(cred_info)

                if data.get('role') == 'colaborador' and 'colaborador_info' in data:
                    self._create_colaborador_profile_from_data(user, data['colaborador_info'])

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro ao criar usuário "{email}": {e}'))

        self.stdout.write(self.style.HTTP_INFO(f'Gerando {num_random_colaboradores} colaboradores aleatórios...'))
        for _ in range(num_random_colaboradores):
            self._create_random_colaborador(credentials_list)

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
                colaborador.perfis.add(Perfil.objects.get(nome=perfil_nome))
            for vinculo in info.get('vinculos_studio', []):
                studio = Studio.objects.get(nome=vinculo['studio_nome'])
                for permissao_nome in vinculo['permissao_nomes']:
                    funcao = FuncaoOperacional.objects.get(nome=permissao_nome)
                    ColaboradorStudio.objects.get_or_create(colaborador=colaborador, studio=studio, permissao=funcao)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro ao criar perfil de colaborador para "{user.email}": {e}'))

    def _create_random_colaborador(self, credentials_list):
        first_name, last_name, email = fake.first_name(), fake.last_name(), fake.email()
        if Usuario.objects.filter(email=email).exists(): return
        try:
            user = Usuario.objects.create_user(
                username=slugify(f'{first_name}-{last_name}-{str(fake.uuid4())[:4]}'),
                email=email, password='123456', first_name=first_name, last_name=last_name, cpf=self._generate_valid_cpf()
            )
            credentials_list.append({'email': email, 'password': '123456', 'role': 'Colaborador Aleatório', 'name': user.get_full_name()})
            
            perfis_nomes = [p[0] for p in random.sample(list(Perfil.NOME_CHOICES), k=random.randint(1, 2)) if p[0] not in ['ADMIN_MASTER']]
            studios = list(Studio.objects.all())
            if not studios: return
            
            random_studio = random.choice(studios)
            permissao_nomes = [f.nome for f in random.sample(list(FuncaoOperacional.objects.all()), k=1)]
            
            self._create_colaborador_profile_from_data(user, {
                "perfis": perfis_nomes, "data_nascimento": fake.date_of_birth(minimum_age=22, maximum_age=60),
                "telefone": fake.phone_number(), "registro_profissional": fake.bothify(text='??-#####'),
                "endereco": {"logradouro": fake.street_name(), "numero": fake.building_number(), "bairro": fake.bairro(), "cidade": fake.city(), "estado": fake.state_abbr(), "cep": fake.postcode()},
                "vinculos_studio": [{"studio_nome": random_studio.nome, "permissao_nomes": permissao_nomes}]
            })
        except IntegrityError: pass

    def _seed_alunos(self, credentials_list, num_random_alunos):
        self.stdout.write('Populando alunos com cenários específicos...')
        studios = list(Studio.objects.all())
        if not studios: return

        self._create_aluno_from_data({
            "email": "aluno@pilates.com", "password": "123456", "definir_nome_completo": "Aluno Padrão Teste",
            "data_nascimento": date(1995, 1, 1), "contato": "+5511912345678", "is_active": True,
            "unidades": [random.choice(studios)], "role": "Aluno Padrão"
        }, credentials_list)
        self._create_aluno_from_data({
            "email": "devedor@pilates.com", "password": "123456", "definir_nome_completo": "Aluno Devedor",
            "data_nascimento": date(1992, 2, 2), "is_active": True, "unidades": [random.choice(studios)],
            "role": "Aluno Devedor"
        }, credentials_list)
        self._create_aluno_from_data({
            "email": "historico@pilates.com", "password": "123456", "definir_nome_completo": "Aluno Histórico",
            "data_nascimento": date(1985, 3, 3), "is_active": True, "unidades": [random.choice(studios)],
            "role": "Aluno com Histórico"
        }, credentials_list)
        self._create_aluno_from_data({
            "email": "aluno.inativo@pilates.com", "password": "123456", "definir_nome_completo": "Aluno Inativo",
            "data_nascimento": date(1998, 4, 4), "is_active": False, "unidades": [random.choice(studios)],
            "role": "Aluno Inativo"
        }, credentials_list)
        self._create_aluno_from_data({
            "email": "novo@pilates.com", "password": "123456", "definir_nome_completo": "Aluno Novo",
            "data_nascimento": date(2000, 5, 5), "is_active": True, "unidades": [random.choice(studios)],
            "role": "Aluno Novo sem Vínculos"
        }, credentials_list)

        self.stdout.write(self.style.HTTP_INFO(f'Gerando {num_random_alunos} alunos aleatórios...'))
        for _ in range(num_random_alunos):
            self._create_random_aluno()
        self.stdout.write(self.style.SUCCESS('Alunos populados.'))

    def _create_aluno_from_data(self, data, credentials_list):
        if Usuario.objects.filter(email=data['email']).exists(): return
        try:
            nome_completo = data.get('definir_nome_completo', '')
            first_name, last_name = (nome_completo.split(' ', 1) + [''])[:2]
            user = Usuario.objects.create_user(
                username=data['email'].split('@')[0], email=data['email'], password=data['password'],
                first_name=first_name, last_name=last_name, cpf=self._generate_valid_cpf(), is_active=data.get('is_active', True)
            )
            aluno = Aluno.objects.create(
                usuario=user, dataNascimento=data['data_nascimento'],
                contato=data.get('contato', fake.phone_number()), profissao=data.get('profissao', fake.job())
            )
            for studio in data.get('unidades', []):
                aluno.unidades.add(studio)

            credentials_list.append({'email': data['email'], 'password': data['password'], 'role': data.get('role'), 'name': nome_completo})
            return aluno
        except IntegrityError: pass
        return None

    def _create_random_aluno(self):
        first_name, last_name, email = fake.first_name(), fake.last_name(), fake.email()
        if Usuario.objects.filter(email=email).exists(): return
        try:
            user = Usuario.objects.create_user(
                username=slugify(f'{first_name}-{last_name}-{str(fake.uuid4())[:4]}'),
                email=email, password='123456', first_name=first_name, last_name=last_name, cpf=self._generate_valid_cpf()
            )
            aluno = Aluno.objects.create(
                usuario=user, dataNascimento=fake.date_of_birth(minimum_age=18, maximum_age=70),
                contato=fake.phone_number(), profissao=fake.job()
            )
            studios = list(Studio.objects.all())
            if studios:
                aluno.unidades.add(random.choice(studios))
        except IntegrityError: pass

    def _seed_creditos_e_cenarios(self):
        self.stdout.write('Populando cenários de créditos de aula...')
        alunos = list(Aluno.objects.filter(usuario__is_active=True))
        admin_user = Usuario.objects.filter(is_superuser=True).first()
        if not alunos or not admin_user: return

        for aluno in random.sample(alunos, min(len(alunos), 5)):
            CreditoAula.objects.create(
                aluno=aluno, quantidade=random.randint(2, 5), adicionado_por=admin_user,
                data_validade=date.today() + timedelta(days=random.randint(30, 90))
            )
        aluno_cred_expirado = random.choice(alunos)
        CreditoAula.objects.create(
            aluno=aluno_cred_expirado, quantidade=2, adicionado_por=admin_user,
            data_validade=date.today() - timedelta(days=10)
        )
        self.stdout.write(self.style.SUCCESS('Cenários de créditos populados.'))

    def _seed_modalidades(self):
        self.stdout.write('Populando modalidades...')
        for nome in ["Pilates Clássico", "Pilates Avançado", "Pilates com Equipamentos", "Mat Pilates", "Pilates Suspenso"]:
            Modalidade.objects.get_or_create(nome=nome)
        self.stdout.write(self.style.SUCCESS('Modalidades populadas.'))

    def _seed_aulas_e_cenarios(self, total_aulas):
        self.stdout.write('Populando aulas com cenários (passado, futuro, lotadas, vazias)...')
        modalidades, studios = list(Modalidade.objects.all()), list(Studio.objects.all())
        instrutores = list(Colaborador.objects.filter(perfis__nome='INSTRUTOR', usuario__is_active=True))
        alunos = list(Aluno.objects.filter(usuario__is_active=True))
        if not all([modalidades, studios, instrutores, alunos]): return

        num_aulas_passado = int(total_aulas * 0.6)
        num_aulas_futuro = total_aulas - num_aulas_passado
        aulas_criadas = 0

        for i in range(num_aulas_passado):
            aula_dt = fake.date_time_between(start_date='-90d', end_date='-1d', tzinfo=timezone.get_current_timezone())
            aula = self._create_aula_obj(studios, instrutores, modalidades, aula_dt)
            if aula:
                alunos_para_inscrever = random.sample(alunos, min(len(alunos), aula.capacidade_maxima))
                for aluno in alunos_para_inscrever:
                    status_population = [
                        AulaAluno.StatusPresenca.PRESENTE,
                        AulaAluno.StatusPresenca.AUSENTE_COM_REPO,
                        AulaAluno.StatusPresenca.AUSENTE_SEM_REPO,
                    ]
                    status = random.choices(status_population, weights=[70, 15, 15], k=1)[0]
                    AulaAluno.objects.create(aula=aula, aluno=aluno, status_presenca=status)
                aulas_criadas += 1
        
        for i in range(num_aulas_futuro):
            aula_dt = fake.date_time_between(start_date='+1d', end_date='+30d', tzinfo=timezone.get_current_timezone())
            aula = self._create_aula_obj(studios, instrutores, modalidades, aula_dt)
            if not aula: continue

            if i % 10 == 0:
                pass
            elif i % 5 == 0:
                alunos_para_inscrever = random.sample(alunos, min(len(alunos), aula.capacidade_maxima + 3))
                for _ in range(aula.capacidade_maxima):
                    if alunos_para_inscrever: AulaAluno.objects.create(aula=aula, aluno=alunos_para_inscrever.pop(0))
                for aluno_extra in alunos_para_inscrever:
                    ListaEspera.objects.create(aula=aula, aluno=aluno_extra)
            else:
                num_inscritos = random.randint(1, aula.capacidade_maxima)
                alunos_para_inscrever = random.sample(alunos, min(len(alunos), num_inscritos))
                for aluno in alunos_para_inscrever:
                    AulaAluno.objects.create(aula=aula, aluno=aluno)
            aulas_criadas += 1

        self.stdout.write(self.style.SUCCESS(f'{aulas_criadas} aulas com cenários populadas.'))

    def _create_aula_obj(self, studios, instrutores, modalidades, data_hora):
        studio = random.choice(studios)
        
        instrutores_no_studio_ids = ColaboradorStudio.objects.filter(studio=studio).values_list('colaborador_id', flat=True)
        instrutores_disponiveis = [i for i in instrutores if i.pk in instrutores_no_studio_ids]

        if not instrutores_disponiveis: return None
        
        instrutor = random.choice(instrutores_disponiveis)
        if BloqueioAgenda.objects.filter(studio=studio, data=data_hora.date()).exists(): return None
        
        try:
            aula, _ = Aula.objects.get_or_create(
                studio=studio, instrutor_principal=instrutor, modalidade=random.choice(modalidades),
                data_hora_inicio=data_hora.replace(minute=0, second=0, microsecond=0),
                defaults={
                    'capacidade_maxima': random.randint(3, 8), 'duracao_minutos': 60,
                    'tipo_aula': random.choice([Aula.TipoAula.REGULAR, Aula.TipoAula.EXPERIMENTAL])
                }
            )
            return aula
        except IntegrityError:
            return None

    def _seed_planos(self):
        self.stdout.write('Populando planos...')
        planos_data = [
            {"nome": "Plano Mensal Básico", "duracao_dias": 30, "creditos_semanais": 1, "preco": "150.00"},
            {"nome": "Plano Mensal Premium", "duracao_dias": 30, "creditos_semanais": 2, "preco": "250.00"},
            {"nome": "Plano Trimestral", "duracao_dias": 90, "creditos_semanais": 2, "preco": "600.00"},
            {"nome": "Plano Anual", "duracao_dias": 365, "creditos_semanais": 3, "preco": "2500.00"},
        ]
        for data in planos_data:
            Plano.objects.get_or_create(nome=data['nome'], defaults=data)
        self.stdout.write(self.style.SUCCESS('Planos populados.'))

    def _seed_produtos(self):
        self.stdout.write('Populando produtos...')
        produtos_data = [
            {"nome": "Camiseta Pilates", "preco": "79.90"}, {"nome": "Meia Antiderrapante", "preco": "35.00"},
            {"nome": "Bola Suíça", "preco": "120.00"}, {"nome": "Faixa Elástica", "preco": "25.00"},
        ]
        for data in produtos_data:
            Produto.objects.get_or_create(nome=data['nome'], defaults=data)
        self.stdout.write(self.style.SUCCESS('Produtos populados.'))

    def _seed_estoque(self):
        self.stdout.write('Populando estoque inicial dos produtos...')
        produtos = list(Produto.objects.all())
        studios = list(Studio.objects.all())
        if not produtos or not studios:
            self.stdout.write(self.style.WARNING('Nenhum produto ou studio encontrado para criar estoque.'))
            return

        for produto in produtos:
            for studio in studios:
                EstoqueStudio.objects.get_or_create(
                    produto=produto,
                    studio=studio,
                    defaults={'quantidade': random.randint(10, 50)}
                )
        self.stdout.write(self.style.SUCCESS('Estoque inicial populado.'))

    def _seed_matriculas_e_cenarios(self):
        self.stdout.write('Populando matrículas com cenários...')
        alunos = list(Aluno.objects.filter(usuario__is_active=True))
        planos, studios = list(Plano.objects.all()), list(Studio.objects.all())
        if not all([alunos, planos, studios]): return

        try:
            aluno_hist = Aluno.objects.get(usuario__email="historico@pilates.com")
            plano_antigo, plano_novo = random.sample(planos, 2)
            studio = random.choice(studios)
            data_inicio_antiga = date.today() - timedelta(days=plano_antigo.duracao_dias + 30)
            Matricula.objects.create(
                aluno=aluno_hist.usuario, plano=plano_antigo, studio=studio, data_inicio=data_inicio_antiga,
                data_fim=data_inicio_antiga + timedelta(days=plano_antigo.duracao_dias)
            )
            data_inicio_nova = date.today() - timedelta(days=15)
            Matricula.objects.create(
                aluno=aluno_hist.usuario, plano=plano_novo, studio=studio, data_inicio=data_inicio_nova,
                data_fim=data_inicio_nova + timedelta(days=plano_novo.duracao_dias)
            )
            alunos.remove(aluno_hist)
        except Aluno.DoesNotExist: pass

        for aluno in random.sample(alunos, min(len(alunos), 10)):
            plano, studio = random.choice(planos), random.choice(studios)
            data_inicio = fake.date_between(start_date='-60d', end_date='today')
            Matricula.objects.get_or_create(
                aluno=aluno.usuario, plano=plano, studio=studio, data_inicio=data_inicio,
                defaults={'data_fim': data_inicio + timedelta(days=plano.duracao_dias)}
            )
        self.stdout.write(self.style.SUCCESS('Matrículas populadas.'))

    def _seed_vendas_e_cenarios(self):
        self.stdout.write('Populando vendas com cenários...')
        alunos = list(Aluno.objects.all())
        produtos = list(Produto.objects.all())
        studios = list(Studio.objects.all())
        if not all([produtos, studios]):
            self.stdout.write(self.style.WARNING('Nenhum produto ou studio encontrado para criar vendas.'))
            return

        # Cenário de venda de balcão
        studio_balcao = random.choice(studios)
        venda_balcao = Venda.objects.create(
            aluno=None,
            studio=studio_balcao,
            data_venda=fake.date_between(start_date='-30d', end_date='today'),
            valor_total=0 # Inicializa com 0, será atualizado
        )
        total_venda_balcao = 0
        produtos_vendidos_balcao = random.sample(produtos, random.randint(1, 2))
        for produto in produtos_vendidos_balcao:
            quantidade = random.randint(1, 2)
            VendaProduto.objects.create(
                venda=venda_balcao,
                produto=produto,
                quantidade=quantidade,
                preco_unitario=produto.preco
            )
            total_venda_balcao += produto.preco * quantidade
            # Atualiza o estoque
            estoque_studio, created = EstoqueStudio.objects.get_or_create(
                produto=produto, studio=studio_balcao, defaults={'quantidade': 0}
            )
            if estoque_studio.quantidade >= quantidade:
                estoque_studio.quantidade -= quantidade
                estoque_studio.save()
            else:
                self.stdout.write(self.style.WARNING(f"Estoque insuficiente para {produto.nome} no {studio_balcao.nome} durante o seeding. Estoque: {estoque_studio.quantidade}, Tentativa de venda: {quantidade}"))
        venda_balcao.valor_total = total_venda_balcao
        venda_balcao.save()


        # Cenários de vendas para alunos
        for _ in range(15):
            aluno_venda = random.choice(alunos).usuario
            studio_venda = random.choice(studios)
            venda = Venda.objects.create(
                aluno=aluno_venda,
                studio=studio_venda,
                data_venda=fake.date_between(start_date='-60d', end_date='today'),
                valor_total=0 # Inicializa com 0, será atualizado
            )
            total_venda = 0
            produtos_vendidos = random.sample(produtos, random.randint(1, min(3, len(produtos))))
            for produto in produtos_vendidos:
                quantidade = random.randint(1, 3)
                VendaProduto.objects.create(
                    venda=venda,
                    produto=produto,
                    quantidade=quantidade,
                    preco_unitario=produto.preco
                )
                total_venda += produto.preco * quantidade
                # Atualiza o estoque
                estoque_studio, created = EstoqueStudio.objects.get_or_create(
                    produto=produto, studio=studio_venda, defaults={'quantidade': 0}
                )
                if estoque_studio.quantidade >= quantidade:
                    estoque_studio.quantidade -= quantidade
                    estoque_studio.save()
                else:
                    self.stdout.write(self.style.WARNING(f"Estoque insuficiente para {produto.nome} no {studio_venda.nome} durante o seeding. Estoque: {estoque_studio.quantidade}, Tentativa de venda: {quantidade}"))
            venda.valor_total = total_venda
            venda.save()
            
        self.stdout.write(self.style.SUCCESS('Vendas populadas.'))

    def _seed_pagamentos_e_cenarios(self):
        self.stdout.write('Populando pagamentos com cenários...')
        matriculas = list(Matricula.objects.all())
        vendas = list(Venda.objects.all())
        if not (matriculas or vendas): return

        METODOS_PAGAMENTO = ['CARTAO_CREDITO', 'PIX', 'DINHEIRO', 'BOLETO']

        try:
            aluno_devedor = Aluno.objects.get(usuario__email="devedor@pilates.com")
            plano_devedor = Plano.objects.order_by('?').first()
            studio_devedor = Studio.objects.order_by('?').first()
            matricula_devedor = Matricula.objects.create(
                aluno=aluno_devedor.usuario, plano=plano_devedor, studio=studio_devedor,
                data_inicio=date.today() - timedelta(days=20),
                data_fim=date.today() + timedelta(days=10)
            )
            Pagamento.objects.create(
                matricula=matricula_devedor, valor_total=matricula_devedor.plano.preco,
                metodo_pagamento='BOLETO', status='PENDENTE',
                data_vencimento=date.today() - timedelta(days=10)
            )
        except (Aluno.DoesNotExist, Plano.DoesNotExist, Studio.DoesNotExist): pass

        for matricula in matriculas:
            if Pagamento.objects.filter(matricula=matricula).exists():
                continue
            status = random.choices(['PAGO', 'PENDENTE', 'CANCELADO'], weights=[80, 15, 5], k=1)[0]
            Pagamento.objects.get_or_create(
                matricula=matricula,
                defaults={
                    'valor_total': matricula.plano.preco,
                    'metodo_pagamento': random.choice(METODOS_PAGAMENTO),
                    'status': status,
                    'data_vencimento': fake.date_between(start_date='-15d', end_date='+30d'),
                    'data_pagamento': fake.date_between(start_date='-30d', end_date='today') if status == 'PAGO' else None
                }
            )
        for venda in vendas:
            # O valor_total já deve estar preenchido na venda, mas garantimos aqui
            valor_venda = venda.valor_total if venda.valor_total is not None else sum(vp.preco_unitario * vp.quantidade for vp in venda.vendaproduto_set.all())
            Pagamento.objects.get_or_create(
                venda=venda,
                defaults={
                    'valor_total': valor_venda,
                    'metodo_pagamento': random.choice(METODOS_PAGAMENTO),
                    'status': 'PAGO',
                    'data_pagamento': venda.data_venda,
                    'data_vencimento': venda.data_venda
                }
            )
        self.stdout.write(self.style.SUCCESS('Pagamentos populados.'))

    def _seed_avaliacoes_e_cenarios(self):
        self.stdout.write('Populando avaliações com cenários...')
        alunos = list(Aluno.objects.filter(usuario__is_active=True))
        avaliadores = list(Colaborador.objects.filter(perfis__nome__in=['INSTRUTOR', 'FISIOTERAPEUTA'], usuario__is_active=True).distinct())
        if not all([alunos, avaliadores]): return

        aluno_progresso = random.choice(alunos)
        avaliador = random.choice(avaliadores)
        studio = aluno_progresso.unidades.first()
        if studio:
            Avaliacao.objects.create(
                aluno=aluno_progresso, instrutor=avaliador, studio=studio,
                data_avaliacao=fake.date_between(start_date='-180d', end_date='-150d'),
                objetivo_aluno="Começar a praticar uma atividade física.",
                diagnostico_fisioterapeutico="Dores nas costas."
            )
            Avaliacao.objects.create(
                aluno=aluno_progresso, instrutor=avaliador, studio=studio,
                data_avaliacao=fake.date_between(start_date='-30d', end_date='-5d'),
                objetivo_aluno="Fortalecer o core e melhorar a postura.",
                diagnostico_fisioterapeutico="Nenhuma."
            )
            alunos.remove(aluno_progresso)

        for aluno in random.sample(alunos, min(len(alunos), 10)):
            studio = aluno.unidades.first()
            if studio:
                Avaliacao.objects.get_or_create(
                    aluno=aluno,
                    defaults={
                        'instrutor': random.choice(avaliadores), 'studio': studio,
                        'data_avaliacao': fake.date_between(start_date='-1y', end_date='today'),
                        'objetivo_aluno': fake.sentence(nb_words=6),
                        'diagnostico_fisioterapeutico': fake.sentence(nb_words=4)
                    }
                )
        self.stdout.write(self.style.SUCCESS('Avaliações populadas.'))
