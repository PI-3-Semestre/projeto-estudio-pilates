PACT - DEFINE PILATES (Versão Completa e Atualizada)
4.0
EQUIPE DE DESENVOLVIMENTO
Carlos Leonel Nina Quispe
Davi Bernardes Machado
Dmitri José Nunes Ferreira
Elias Lopes
Felipe Rocha
Kauā Hiro dos Santos Mizumoto
Matheus Salinas Zancope
Wellington Siqueira Porto
INTRODUÇÃO
Objetivo do Documento Este documento apresenta a análise PACT (Pessoas, Atividades, Contextos, Tecnologias) para o desenvolvimento do Sistema de Gestão para o estúdio Define Pilates. Esta metodologia, oriunda da área de Interação Humano-Computador (IHC), foi utilizada para obter uma compreensão holística do projeto. O objetivo é consolidar todos os achados da fase de levantamento de requisitos em um formato detalhado, descrevendo os processos e suas implicações, a fim de servir como um guia fundamental para as fases de design, desenvolvimento e validação do sistema.
Visão Geral do Sistema A solução consiste em uma aplicação web responsiva que centraliza a gestão operacional, clínica e financeira do estúdio. O sistema contará com portais específicos para cada perfil de usuário, um robusto sistema de agendamento, funcionalidades de acompanhamento clínico e ferramentas de gestão financeira, tudo suportado por uma arquitetura flexível e segura.
1 PESSOAS (PEOPLE): OS PERFIS DE USUÁRIO E SUAS MOTIVAÇÕES
O sistema será utilizado por seis perfis de usuário pré-definidos, operando em um modelo de trabalho híbrido e multi-unidade.
1.1 Admin Master (NOVO)
Descrição: Um perfil de "super administrador" com controle total sobre todo o sistema, em todas as unidades (São Miguel, Itaquera e outras). É o único perfil que pode criar e gerenciar outros Administradores.
Principais Tarefas no Sistema:
Gerenciar a lista de Administradores.
Possuir todas as permissões de um Administrador padrão, mas com escopo global (todas as unidades).
Visualizar relatórios consolidados de todo o negócio.

1.2 Administrador (por Unidade)
Descrição: Este perfil é o centro operacional do negócio em uma ou mais unidades específicas. Acumula a responsabilidade de gerenciar a unidade com a execução de tarefas de linha de frente, especialmente nas unidades sem recepcionista. Sua principal motivação é ter uma ferramenta centralizada e móvel.
Principais Tarefas no Sistema:
Atribuir perfis de usuário pré-definidos aos colaboradores e associá-los a unidades específicas.
Cadastrar, gerenciar e desativar colaboradores (offboarding).
Gerenciar as configurações da(s) sua(s) unidade(s).
Visualizar relatórios gerenciais e financeiros da(s) sua(s) unidade(s).
Aprovar ou rejeitar solicitações de troca de plano feitas pelos alunos da(s) sua(s) unidade(s).
1.3 Recepcionista (por Unidade)
Descrição: Perfil dedicado às tarefas operacionais e de atendimento nas unidades que contam com este funcionário. É a linha de frente no atendimento ao cliente.
Principais Tarefas no Sistema:
Realizar o cadastro completo de novos alunos.
Agendar aulas experimentais e aulas regulares.
Processar vendas de planos e produtos.
Gerenciar a agenda diária da sua unidade.
1.4 Fisioterapeuta (por Unidade)
Descrição: Perfil clínico focado no tratamento e reabilitação de "pacientes", associado a unidades específicas. Sua principal necessidade é a documentação precisa e rápida da conduta realizada em cada sessão, para cumprir as exigências legais do Crefito.
Principais Tarefas no Sistema:
Visualizar a agenda diária de seus pacientes na sua unidade.
Registrar presença e falta.
Preencher o "Prontuário" com o registro de evolução de cada atendimento.
Realizar avaliações posturais.
1.5 Instrutor (Educador Físico, por Unidade)
Descrição: O instrutor possui um papel híbrido (pedagógico e, condicionalmente, administrativo), associado a unidades específicas. O foco da sua documentação é no planejamento futuro da aula para o "aluno".
Principais Tarefas no Sistema:
Visualizar a agenda diária de suas aulas na sua unidade.
Registrar presença, falta e reposições dos alunos.
Preencher o "Planejamento de Aula".
Realizar cadastros e vendas (apenas quando tiver permissão na sua unidade).


1.6 Aluno / Paciente
Descrição: O cliente final do estúdio, vinculado a uma unidade principal. Busca autonomia e conveniência.
Principais Tarefas no Sistema:
Consultar suas próximas aulas agendadas e histórico.
Realizar o auto-agendamento, cancelamento e remarcação de aulas.
Solicitar a troca do seu plano de aulas através do aplicativo.
Gerenciar créditos de reposição e verificar seus prazos de validade.
Visualizar o status do seu plano e a data de vencimento.
Acessar documentos e enviar comprovantes de pagamento.
2 ATIVIDADES (ACTIVITIES): DESCRIÇÃO DETALHADA DOS PROCESSOS
As funcionalidades do sistema são detalhadas a seguir em três jornadas principais.
2.1 Jornada do Aluno (Onboarding e Gestão)
Descrição do Processo: Esta jornada visa dar autonomia ao cliente e reduzir a carga administrativa.
Onboarding: O processo inicia internamente, com um Administrador ou Recepcionista realizando o Cadastro do Aluno e a Venda de um Plano.
Primeiro Acesso: O sistema deve enviar um link de primeiro acesso ao aluno, onde ele criará sua senha e aceitará o Termo de Consentimento (LGPD).
Autogestão: Uma vez logado, o aluno poderá visualizar a grade de horários e agendar uma aula.
Solicitação de Troca de Plano (NOVA ATIVIDADE): O aluno poderá, através de seu portal, visualizar outros planos disponíveis e enviar uma solicitação de troca. O sistema registrará o pedido com status "Pendente" e notificará o administrador para aprovação.
Lista de Espera: Caso uma aula esteja lotada, o sistema oferecerá ao aluno a opção de "Entrar na Lista de Espera".
2.2 Jornada Clínica (Avaliação e Acompanhamento)
Descrição do Processo: Esta jornada é o coração do serviço do estúdio e garante a qualidade e a conformidade legal do atendimento.
Avaliação Inicial: O instrutor utiliza o sistema para preencher a Ficha de Avaliação Inicial, registrando diagnósticos e realizando o upload das fotos posturais.
Rotina de Aula: Ao final de cada aula, o instrutor acessa a lista de alunos, realiza o Controle de Frequência e acessa a área de documentação ("Prontuário" para Fisioterapeuta ou "Planejamento de Aula" para Educador Físico).
2.3 Jornada Administrativa (Operação e Finanças)
Descrição do Processo: Esta jornada representa o centro de controle do negócio.
Gestão de Colaboradores: Inclui o fluxo de cadastro e o de Offboarding.
Aprovação de Troca de Plano (NOVA ATIVIDADE): O Administrador receberá notificações sobre solicitações de troca de plano. Em um painel específico, ele poderá revisar, aprovar ou rejeitar cada pedido. A aprovação acionará a lógica de negócio para a efetivação da troca.
Gestão Financeira: O sistema terá um módulo para o Controle de Caixa e o processo de Cancelamento de Plano.
Gestão de Produtos: A jornada incluirá uma área para o cadastro de produtos e o controle de estoque.

3 CONTEXTOS (CONTEXTS): O AMBIENTE E SUAS IMPLICAÇÕES NO DESENVOLVIMENTO
As condições de uso do sistema impõem restrições e guiam as decisões de desenvolvimento.
3.1 Contexto Organizacional e Operacional
Descrição: A empresa opera com um modelo organizacional híbrido (com e sem recepcionistas).
Implicações Diretas para o Desenvolvimento: O back-end (Django) deve implementar um sistema de permissões que associe um usuário a um papel dentro de uma unidade específica. Isso permitirá que as capacidades de um mesmo instrutor variem conforme o estúdio em que ele está logado.
3.2 Contexto de Acesso e Mobilidade
Descrição: O uso é segregado: administradores em notebooks via Wi-Fi e instrutores exclusivamente em celulares pessoais via dados móveis.
Implicações Diretas para o Desenvolvimento: O front-end (React) deve ser desenvolvido com uma abordagem "mobile-first" rigorosa. A API deve ser otimizada para minimizar o volume de dados trafegados, visando a performance em redes móveis.
3.3 Contexto Físico e Ambiental
Descrição: O ambiente possui iluminação intensa e ruído variável.
Implicações Diretas para o Desenvolvimento: O time de UI/UX deve priorizar a criação de um tema de alto contraste como requisito funcional. O sistema de notificações deve ser desenhado com foco em componentes visuais (badges, banners) e não sonoros.
3.4 Contexto Legal e Profissional
Descrição: O sistema deve estar em conformidade com a LGPD e as diretrizes do CREFITO.
Implicações Diretas para o Desenvolvimento: Todos os dados sensíveis (saúde, documentos) devem ser criptografados no banco de dados. O módulo de "Registro de Evolução" deve possuir um log de auditoria (quem alterou e quando). O módulo de gestão de consentimento deve armazenar a versão do termo e a data/hora da aceitação. O sistema deve implementar um session timeout automático para deslogar usuários inativos, mitigando riscos em dispositivos pessoais.

4 TECNOLOGIAS (TECHNOLOGIES): A STACK E SUA RACIONALIDADE
As escolhas tecnológicas foram feitas para atender diretamente aos requisitos levantados.
4.1 Arquitetura Front-end (React + Tailwind CSS)
Detalhamento: A arquitetura baseada em componentes do React facilitará a gestão da complexa interface do instrutor, utilizando a Renderização Condicional para exibir ou ocultar funcionalidades administrativas. O Tailwind CSS acelerará a criação de um design responsivo e de alto contraste.
4.2 Arquitetura Back-end (Python + Django + MySQL)
Detalhamento: O framework Django será a base, utilizando seus módulos django.contrib.auth para o sistema de permissões granular, o Admin para acelerar o desenvolvimento do back-office e o ORM para a interação com o banco de dados MySQL. A API será construída com o Django REST Framework (DRF).
4.3 Ambiente de Execução (Browsers e Hardware)
Detalhamento: A solução é uma Aplicação Web que deve ser testada para funcionar nos navegadores Chrome (motor Blink) e Safari (motor WebKit), em notebooks Windows e em uma ampla gama de smartphones (Android e iPhone).
4.4 Estratégia de Qualidade e Testes
Detalhamento: Para garantir a robustez e a manutenibilidade (RNF-010), todas as funcionalidades desenvolvidas serão acompanhadas de testes automatizados utilizando Pytest. Os testes cobrirão diversos cenários, incluindo fluxos de sucesso, casos de borda e condições de erro, facilitando a validação contínua e a apresentação do projeto.
CONCLUSÃO
A análise PACT proporcionou uma visão integral do projeto. Este documento detalhado serve como alicerce para a criação de um sistema que não seja apenas funcionalmente completo, mas também genuinamente útil, usável e adaptado à realidade de seus usuários.

DER.mermaid

erDiagram
    %% --- SEÇÃO DE USUÁRIOS E PERMISSÕES ---
    USUARIO {
        int id PK
        string email
        string senha
        string tipo_usuario "ALUNO ou COLABORADOR"
    }

    ALUNO {
        int id PK
        int id_usuario FK
        string nome_completo
        string cpf
        datetime data_nascimento
        datetime data_aceite_lgpd
        string versao_termo_aceito
        datetime data_criacao
        datetime data_ultima_modificacao
    }

    COLABORADOR {
        int id PK
        int id_usuario FK
        string nome_completo
        string formacao
        string tipo_conselho "CREF ou CREFITO"
        string numero_conselho
        datetime data_criacao
        datetime data_ultima_modificacao
    }

    STUDIO {
        int id PK
        string nome
        string endereco
    }

    COLABORADOR_STUDIO {
        int id_colaborador FK
        int id_studio FK
        string permissao "Admin, Instrutor, Fisio, Recep"
    }

    USUARIO ||--|{ ALUNO : "é um"
    USUARIO ||--|{ COLABORADOR : "é um"
    COLABORADOR ||--o{ COLABORADOR_STUDIO : "atua em"
    STUDIO ||--o{ COLABORADOR_STUDIO : "possui"


    %% --- SEÇÃO CLÍNICA (OTIMIZADA) ---
    AVALIACAO {
        int id PK
        int id_aluno FK
        int id_instrutor FK
        datetime data_avaliacao
        string diagnostico
        string historico_medico
        datetime data_proxima_reavaliacao
        datetime data_criacao
        datetime data_ultima_modificacao
    }

    REGISTRO_CLINICO {
        int id PK
        int id_avaliacao FK
        int id_colaborador FK
        int id_aula FK "Opcional"
        string tipo "EVOLUCAO ou PLANEJAMENTO"
        string descricao
        datetime data_registro
        datetime data_criacao
        datetime data_ultima_modificacao
    }

    ALUNO ||--o{ AVALIACAO : "realiza"
    AVALIACAO ||--o{ REGISTRO_CLINICO : "gera"
    COLABORADOR ||--o{ REGISTRO_CLINICO : "escreve"
    

    %% --- SEÇÃO DE AGENDAMENTO ---
    MODALIDADE {
        int id PK
        string nome "Pilates, Yoga, etc."
    }

    AULA {
        int id PK
        int id_studio FK
        int id_modalidade FK
        int id_instrutor_principal FK
        int id_instrutor_substituto FK "Opcional"
        datetime data_hora_inicio
        int duracao_minutos
        int capacidade_maxima
        string tipo_aula "REGULAR, EXPERIMENTAL, REPOSICAO"
    }

    AULA_ALUNO {
        int id_aula FK
        int id_aluno FK
        string status_presenca "PRESENTE, AUSENTE_COM_REPO, AUSENTE_SEM_REPO"
    }
    
    REPOSICAO {
        int id PK
        int id_aluno FK
        int id_aula_origem FK
        datetime data_expiracao
        string status "DISPONIVEL, UTILIZADA, EXPIRADA"
    }

    LISTA_ESPERA {
        int id PK
        int id_aula FK
        int id_aluno FK
        datetime data_inscricao
        string status "AGUARDANDO, NOTIFICADO"
    }

    STUDIO ||--|{ AULA : "ocorre em"
    MODALIDADE ||--o{ AULA : "é da"
    COLABORADOR ||--o{ AULA : "ministra como principal"
    COLABORADOR ||--o{ AULA : "ministra como substituto"
    AULA ||--o{ AULA_ALUNO : "tem"
    ALUNO ||--o{ AULA_ALUNO : "participa da"
    AULA ||--o{ LISTA_ESPERA : "tem"
    ALUNO ||--o{ LISTA_ESPERA : "aguarda na"
    AULA ||--o{ REPOSICAO : "gera"
    ALUNO ||--o{ REPOSICAO : "possui"
    AULA }o--|| REGISTRO_CLINICO : "pode gerar"


    %% --- SEÇÃO FINANCEIRA ---
    PLANO {
        int id PK
        string nome "Ex: Pilates Trimestral 2x"
        int duracao_dias
        int creditos_semanais
        float preco
        datetime data_criacao
        datetime data_ultima_modificacao
    }

    MATRICULA {
        int id PK
        int id_aluno FK
        int id_plano FK
        datetime data_inicio
        datetime data_fim
        float valor_pago
        string status "ATIVA, CANCELADA, CONCLUIDA"
    }

    PAGAMENTO {
        int id PK
        int id_matricula FK "Opcional, se for de plano"
        int id_venda FK "Opcional, se for de produto"
        float valor_total
        string metodo_pagamento
        string status "PENDENTE, PAGO, ATRASADO"
        datetime data_vencimento
        datetime data_pagamento
        datetime data_criacao
        datetime data_ultima_modificacao
    }

    PARCELA {
        int id PK
        int id_pagamento FK
        int numero_parcela
        float valor
        datetime data_vencimento
        string status
    }
    
    PRODUTO {
        int id PK
        string nome
        float preco
        int quantidade_estoque
    }

    VENDA {
        int id PK
        int id_aluno FK
        datetime data_venda
    }
    
    VENDA_PRODUTO {
        int id_venda FK
        int id_produto FK
        int quantidade
        float preco_unitario
    }

    ALUNO ||--o{ MATRICULA : "se matricula em"
    PLANO ||--o{ MATRICULA : "é o"
    MATRICULA ||--o{ PAGAMENTO : "gera"
    PAGAMENTO ||--o{ PARCELA : "pode ter"
    VENDA ||--|| PAGAMENTO : "gera"
    ALUNO ||--o{ VENDA : "realiza"
    VENDA ||--o{ VENDA_PRODUTO : "contém"
    PRODUTO ||--o{ VENDA_PRODUTO : "é vendido em"


    %% --- SEÇÃO DE NOTIFICAÇÕES ---
    NOTIFICACAO {
        int id PK
        int id_usuario FK
        string tipo
        string mensagem
        string status "NAO_LIDA, LIDA"
        datetime data_criacao
    }

    USUARIO ||--o{ NOTIFICACAO : "recebe"

