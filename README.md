

# 🧘‍♀️ Define Pilates - Sistema de Gestão de Estúdios

Bem-vindo(a) ao **Define Pilates**. Este é um sistema completo para gerenciamento de estúdios de Pilates, oferecendo soluções para administrar alunos, agendamentos, finanças e múltiplas unidades.

O projeto opera em duas partes integradas:
1. **Backend (O Cérebro):** Construído com Django e Django REST Framework.
2. **Frontend (O Visual):** Uma aplicação SPA moderna construída com React e Vite.

---

## ✨ Funcionalidades do Projeto

### 🚀 Atuais

- **📊 Dashboard e Analytics:** Painéis visuais interativos com métricas financeiras, taxa de ocupação de aulas e crescimento de novos alunos.
- **Gestão de Usuários:** Login seguro (JWT), perfis variados (Admin, Instrutor, Fisioterapeuta, Recepcionista) e controle de acesso granular por estúdio.
- **Gestão de Alunos:** Cadastro completo com foto e associação a múltiplos estúdios.
- **Avaliações e Prontuários:** Registro de avaliações fisioterapêuticas, histórico médico e acompanhamento de evolução (fisioterapia e educação física).
- **Agendamentos:** Grade de horários, controle de presença, lista de espera automática e reposição de aulas.
- **Financeiro:** Venda de produtos, controle de estoque, planos de matrícula e fluxo de caixa.
- **Notificações:** Alertas internos sobre eventos importantes.

### 🚧 Em Breve (Roadmap)

- **Dashboard do Instrutor:** Visão personalizada para instrutores com agenda e métricas.
- **App Mobile:** Aplicativo para alunos agendarem aulas.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso | Badge |
|-----------|-----|-------|
| **Django** | Backend Framework | ![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white) |
| **Django REST Framework** | API RESTful | ![DRF](https://img.shields.io/badge/DRF-092E20?style=flat&logo=django&logoColor=white) |
| **React** | Frontend Framework | ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) |
| **Vite** | Build Tool | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) |
| **MySQL** | Banco de Dados (Produção) | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white) |
| **SQLite** | Banco de Dados (Dev) | ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white) |
| **SimpleJWT** | Autenticação | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=json-web-tokens&logoColor=white) |
| **Pillow** | Processamento de Imagens | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) |
| **Poetry** | Gerenciamento de Dependências | ![Poetry](https://img.shields.io/badge/Poetry-60A5FA?style=flat&logo=python&logoColor=white) |
| **drf-spectacular** | Documentação (Swagger/OpenAPI) | ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=black) |

---

## 📝 Guia de Instalação e Execução (Passo a Passo)

Siga este roteiro para rodar o projeto do zero em sua máquina.

### Passo 0: Pré-requisitos

Certifique-se de ter instalado:

1. **Git:** [Baixar Git](https://git-scm.com/downloads)
2. **Python (3.8+):** [Baixar Python](https://www.python.org/downloads/) (Marque "Add to PATH" na instalação)
3. **Node.js (18+):** [Baixar Node.js](https://nodejs.org/en)
4. **Poetry:** Abra o terminal e digite `pip install poetry`

---

### Passo 1: Baixar o Código

Abra seu terminal ou Git Bash e execute:

```bash
git clone https://github.com/PI-3-Semestre/Projeto-Estudio-Pilates.git
cd Projeto-Estudio-Pilates
```

---

### Passo 2: Configurando o Backend (Servidor)

**1. Entre na pasta do backend:**

```bash
cd backend
```

**2. Instale as dependências:**

```bash
poetry install
```

**3. Ative o ambiente virtual:**

```bash
poetry shell
```

**4. Configure as Senhas (.env):**

- Copie o arquivo de exemplo: `cp .env.example .env` (ou copie manualmente)
- Abra o arquivo `.env` criado
- **Gere uma chave secreta:** No terminal, rode:
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
  Copie o código gerado e cole na variável `DJANGO_SECRET_KEY` dentro do arquivo.
- **Banco de Dados:** Para rodar facilmente sem instalar MySQL, altere as linhas de banco de dados no `.env` para:
  ```ini
  DB_ENGINE=django.db.backends.sqlite3
  DB_NAME=db.sqlite3
  ```

**5. Crie as Tabelas:**

```bash
python manage.py migrate
```

**6. Popule o Banco de Dados (Dados de Teste):**

Para não começar com o sistema vazio, execute este comando que cria estúdios, alunos, instrutores e aulas fictícias para alimentar o Dashboard:

```bash
python manage.py seed_db
```

_Nota: Se precisar limpar tudo e recriar, use `python manage.py seed_db --clean`_

**7. Crie seu Usuário Admin:**

```bash
python manage.py createsuperuser
```

**8. Inicie o Servidor:**

```bash
python manage.py runserver
```

✅ O backend estará rodando em: `http://127.0.0.1:8000/`. **Deixe este terminal aberto.**

---

### Passo 3: Configurando o Frontend (Visual)

Abra uma **NOVA JANELA** do terminal.

**1. Entre na pasta do frontend:**

```bash
cd Projeto-Estudio-Pilates/frontend
```

**2. Instale as dependências:**

```bash
npm install
```

**3. Configure a Conexão:**

- Crie um arquivo `.env` na pasta frontend
- Adicione a linha: `VITE_API_URL=http://127.0.0.1:8000/api`

**4. Inicie o Visual:**

```bash
npm run dev
```

✅ Acesse o sistema pelo link exibido (geralmente `http://localhost:5173`).

---

## 📖 Documentação da API (Técnico)

Com o backend rodando, você pode consultar a documentação técnica das rotas em:

- **Swagger UI:** [http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)
- **ReDoc:** [http://127.0.0.1:8000/api/schema/redoc/](http://127.0.0.1:8000/api/schema/redoc/)
- **Schema JSON:** [http://127.0.0.1:8000/api/schema/](http://127.0.0.1:8000/api/schema/)

---

## 🔮 Futuras Implementações

- **Pagamentos Online:** Integração com gateways (Stripe/PagSeguro)
- **App Mobile:** Aplicativo para alunos agendarem aulas
- **Relatórios Avançados:** Geração de PDFs e CSVs financeiros e operacionais

---

## 👥 Equipe de Desenvolvimento

| Nome |
|------|
| Wellington Siqueira Porto |
| Carlos Leonel Nina Quispe |
| Davi Bernardes Machado |
| Dmitri José Nunes Ferreira |
| Elias Pereira Lopes |
| Felipe Rocha de Oliveira |
| Kauã Hiro dos Santos Mizumoto |
| Matheus Salinas Zancope |


---

## 🐛 Solução de Problemas

- Se der erro de `python` não encontrado,  tente usar `python3`
- Se o login falhar no frontend, verifique se o terminal do backend não foi fechado
