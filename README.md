# Define Pilates - Backend

Este é o backend do sistema de gerenciamento para estúdios de Pilates, **Define Pilates**. Construído com Django e Django REST Framework, o sistema oferece uma solução completa para administrar alunos, agendamentos, finanças e múltiplos estúdios.

## Funcionalidades Atuais

O sistema atualmente suporta as seguintes funcionalidades:

### Gestão de Usuários e Acessos
- **Autenticação e Autorização:** Sistema de login seguro com JWT (JSON Web Tokens).
- **Perfis de Usuário:** Gerenciamento de diferentes papéis (Admin Master, Administrador, Recepcionista, Fisioterapeuta, Instrutor).
- **Controle de Acesso Granular:** Permissões detalhadas por estúdio, permitindo que um colaborador tenha papéis diferentes em unidades distintas.

### Gestão de Alunos
- **Cadastro Completo:** Perfil do aluno com informações pessoais, contato e foto.
- **Múltiplos Estúdios:** Alunos podem ser associados a uma ou mais unidades do estúdio.

### Avaliações e Acompanhamento
- **Avaliação Fisioterapêutica:** Registro de avaliações físicas e funcionais, com histórico médico, diagnóstico e objetivos.
- **Registros Clínicos:** Acompanhamento da evolução do aluno (fisioterapia) ou planejamento de aulas (educação física).


## Em breve

### Agendamentos e Aulas
- **Modalidades de Aulas:** Cadastro de diferentes tipos de aulas (ex: Pilates, Yoga).
- **Grade de Horários:** Criação e gerenciamento de aulas com instrutor, capacidade e data/hora.
- **Controle de Presença:** Registro de presença e ausência dos alunos.
- **Créditos de Reposição:** Sistema para gerenciar créditos de reposição para aulas perdidas.
- **Lista de Espera:** Gerenciamento automático de listas de espera para aulas lotadas.

### Financeiro
- **Planos e Matrículas:** Criação de planos de serviço e matrícula de alunos.
- **Gestão de Produtos:** Cadastro e controle de estoque de produtos para venda.
- **Registro de Vendas:** Sistema para registrar vendas de produtos.
- **Controle de Pagamentos:** Centralização de pagamentos de matrículas e vendas, com suporte a parcelas.

### Notificações
- **Sistema de Notificações:** Um sistema interno para notificar os usuários sobre eventos importantes.

## Tecnologias Utilizadas

- **Framework:** Django, Django REST Framework
- **Banco de Dados:** MySQL
- **Autenticação:** djangorestframework-simplejwt
- **Documentação da API:** drf-spectacular (geração de schema OpenAPI)
- **Validações:** django-cpf, email-validator, django-phonenumber-field
- **Imagens:** Pillow
- **Gerenciamento de Dependências:** Poetry

## Como Configurar e Rodar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd backend
   ```

2. **Instale as dependências:**
   O Poetry criará um ambiente virtual e instalará as dependências.
   ```bash
   poetry install
   ```

3. **Configure as variáveis de ambiente:**
   - Renomeie o arquivo `.env.example` para `.env`.
   - Preencha as variáveis de ambiente no arquivo `.env`, como as credenciais do banco de dados.

4. **Aplique as migrações do banco de dados:**
   Use `poetry run` para executar o comando dentro do ambiente virtual.
   ```bash
   poetry run python manage.py migrate
   ```

5. **Crie um superusuário:**
   ```bash
   poetry run python manage.py createsuperuser
   ```

6. **Rode o servidor de desenvolvimento:**
   ```bash
   poetry run python manage.py runserver
   ```

7. **Populando o Banco de Dados (Seeding):**
   Para facilitar os testes, um comando foi criado para popular o banco de dados com um conjunto completo de dados de teste, incluindo studios, todos os tipos de colaboradores (admins, recepcionistas, fisios, instrutores) e alunos com avaliações.

   - **Para popular o banco de dados:**
     ```bash
     poetry run python manage.py seed_db
     ```

   - **Para LIMPAR o banco e depois popular:**
     Use a flag `--clean` para apagar todos os dados das tabelas antes de inserir os novos.
     ```bash
     poetry run python manage.py seed_db --clean
     ```
   Ao final da execução, o terminal exibirá as credenciais de login (email e senha) para cada usuário padrão criado.

## Documentação da API

A documentação da API é gerada automaticamente pelo `drf-spectacular` e pode ser acessada em:

- **/api/schema/**: O schema OpenAPI em formato `yaml` ou `json`.
- **/api/schema/swagger-ui/**: A interface do Swagger UI.
- **/api/schema/redoc/**: A interface do ReDoc.

## Futuras Implementações

- **Dashboard e Analytics:** Painéis visuais com métricas financeiras, ocupação de aulas, crescimento de alunos, etc.
- **Pagamentos Online:** Integração com gateways de pagamento (ex: Stripe, PagSeguro) para cobrança automática e recorrente.
- **Calendário Interativo:** Uma interface de calendário mais rica para agendamentos e reservas.
- **Aplicativo para Alunos:** Um aplicativo móvel para que os alunos possam agendar aulas, ver seu progresso e receber notificações.
- **Notificações Automatizadas:** Envio de e-mails e/ou SMS para lembretes de aulas, vencimentos de pagamentos, etc.
- **Sistema de Relatórios:** Geração de relatórios financeiros e operacionais em formatos como PDF e CSV.