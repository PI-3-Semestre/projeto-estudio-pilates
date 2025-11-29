### **Relatório Completo de Rotas POST do Sistema**

Este relatório detalha todas as rotas POST identificadas no sistema, seus corpos de requisição JSON esperados e as regras de validação associadas, organizadas por aplicativo Django.

---

### **1. Agendamentos App**

#### 1.1. `HorarioTrabalhoViewSet` (Rota: `api/agendamentos/horarios-trabalho/`)

*   **Serializer:** `HorarioTrabalhoSerializer`
*   **Modelo:** `HorarioTrabalho`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "id": "integer (somente leitura)",
        "campo1": "tipo_do_campo1",
        "campo2": "tipo_do_campo2",
        // ... todos os campos do modelo HorarioTrabalho ...
    }
    ```
*   **Regras de Validação:** Todos os campos do modelo `HorarioTrabalho` são aceitos. Tipos de campo específicos e validações (ex: `required`, `max_length`, `choices`) dependem da definição do modelo. `id` é somente leitura.

#### 1.2. `BloqueioAgendaViewSet` (Rota: `api/agendamentos/bloqueios-agenda/`)

*   **Serializer:** `BloqueioAgendaWriteSerializer`
*   **Modelo:** `BloqueioAgenda`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "id": "integer (somente leitura)",
        "data": "date (YYYY-MM-DD)",
        "descricao": "string",
        "studio": "integer (ID do Studio)"
    }
    ```
*   **Regras de Validação:**
    *   `id`: Somente leitura.
    *   `data`: Obrigatório, deve ser uma data válida.
    *   `descricao`: String.
    *   `studio`: Obrigatório, deve ser o ID de um objeto `Studio` existente.

#### 1.3. `ModalidadeViewSet` (Rota: `api/agendamentos/modalidades/`)

*   **Serializer:** `ModalidadeSerializer`
*   **Modelo:** `Modalidade`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "id": "integer (somente leitura)",
        "campo1": "tipo_do_campo1",
        "campo2": "tipo_do_campo2",
        // ... todos os campos do modelo Modalidade ...
    }
    ```
*   **Regras de Validação:** Todos os campos do modelo `Modalidade` são aceitos. Tipos de campo específicos e validações dependem da definição do modelo. `id` é somente leitura.

#### 1.4. `AulaViewSet` (Rota: `api/agendamentos/aulas/`)

*   **Serializer:** `AulaWriteSerializer`
*   **Modelo:** `Aula`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "data_hora_inicio": "datetime (YYYY-MM-DDTHH:MM:SSZ)",
        "capacidade_maxima": "integer",
        "duracao_minutos": "integer",
        "tipo_aula": "string (campo de escolha, ex: 'REGULAR', 'EXPERIMENTAL')",
        "modalidade": "integer (ID da Modalidade)",
        "studio": "integer (ID do Studio)",
        "instrutor_principal": "integer (ID do Usuário/Colaborador)",
        "instrutor_substituto": "integer (ID do Usuário/Colaborador, opcional)"
    }
    ```
*   **Regras de Validação:**
    *   `data_hora_inicio`: Obrigatório, formato de data e hora válido.
    *   `capacidade_maxima`: Obrigatório, inteiro.
    *   `duracao_minutos`: Obrigatório, inteiro.
    *   `tipo_aula`: Obrigatório, deve ser uma das escolhas definidas em `Aula.TipoAula`.
    *   `modalidade`: Obrigatório, deve ser o ID de um objeto `Modalidade` existente.
    *   `studio`: Obrigatório, deve ser o ID de um objeto `Studio` existente.
    *   `instrutor_principal`: Obrigatório, deve ser o ID de um instrutor existente.
    *   `instrutor_substituto`: Opcional, deve ser o ID de um instrutor existente se fornecido.

#### 1.5. `AulaAlunoViewSet` (Rota: `api/agendamentos/aulas-alunos/`)

*   **Serializers (condicional):**
    *   **Para Staff:** `AgendamentoStaffSerializer`
    *   **Para Aluno:** `AgendamentoAlunoSerializer`

##### 1.5.1. `AgendamentoAlunoSerializer` (para Alunos)

*   **Modelo:** `AulaAluno`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "aula": "integer (ID da Aula)",
        "entrar_lista_espera": "boolean (opcional, padrão: false)"
    }
    ```
*   **Regras de Validação:**
    *   `aula`: Obrigatório, deve ser o ID de um objeto `Aula` existente.
    *   `aluno`: Definido automaticamente a partir do perfil do usuário autenticado (somente leitura).
    *   `status_presenca`: Somente leitura.
    *   `credito_utilizado`: Somente leitura.
    *   `entrar_lista_espera`: Booleano opcional. Se `true` e a `aula` estiver cheia, o aluno será adicionado a uma lista de espera.
    *   **Validações Customizadas:**
        *   Impede agendamentos duplicados para o mesmo aluno na mesma `aula`.
        *   Verifica conflitos de agendamento com aulas `AGENDADO` existentes para o aluno.
        *   Se a `aula` estiver cheia:
            *   Se `entrar_lista_espera` for `true`, adiciona à `ListaEspera` (se ainda não estiver lá).
            *   Caso contrário, levanta um erro de validação.
        *   Para `aula` do tipo `REGULAR`, verifica se há `CreditoAula` disponível e válido para o aluno. Se não houver crédito válido, levanta um erro. O crédito é então consumido.

##### 1.5.2. `AgendamentoStaffSerializer` (para Staff)

*   **Modelo:** `AulaAluno`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "aula": "integer (ID da Aula)",
        "aluno": "integer (ID do Aluno)",
        "entrar_lista_espera": "boolean (opcional, padrão: false)"
    }
    ```
*   **Regras de Validação:**
    *   `aula`: Obrigatório, deve ser o ID de um objeto `Aula` existente.
    *   `aluno`: Obrigatório, deve ser o ID de um objeto `Aluno` existente.
    *   `status_presenca`: Somente leitura.
    *   `credito_utilizado`: Somente leitura.
    *   `entrar_lista_espera`: Booleano opcional. Se `true` e a `aula` estiver cheia, o aluno será adicionado a uma lista de espera.
    *   **Validações Customizadas:**
        *   Impede agendamentos duplicados para o `aluno` especificado na mesma `aula`.
        *   Verifica conflitos de agendamento com aulas `AGENDADO` existentes para o `aluno` especificado.
        *   Se a `aula` estiver cheia:
            *   Se `entrar_lista_espera` for `true`, adiciona à `ListaEspera` (se ainda não estiver lá).
            *   Caso contrário, levanta um erro de validação.
        *   Para `aula` do tipo `REGULAR`, verifica se há `CreditoAula` disponível e válido para o `aluno` especificado. Se não houver crédito válido, levanta um erro. O crédito é então consumido.

#### 1.6. `ListaEsperaViewSet` (Rota: `api/agendamentos/listas-espera/`)

*   **Serializer:** `ListaEsperaSerializer`
*   **Modelo:** `ListaEspera`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "id": "integer (somente leitura)",
        "aula": "integer (ID da Aula)",
        "aluno": "integer (ID do Aluno)",
        "data_inscricao": "datetime (YYYY-MM-DDTHH:MM:SSZ, somente leitura)"
    }
    ```
*   **Regras de Validação:**
    *   `id`: Somente leitura.
    *   `aula`: Obrigatório, deve ser o ID de um objeto `Aula` existente.
    *   `aluno`: Obrigatório, deve ser o ID de um objeto `Aluno` existente.
    *   `data_inscricao`: Somente leitura, definida automaticamente na criação.

---

### **2. Alunos App**

#### 2.1. `AlunoViewSet` (Rota: `api/alunos/`)

*   **Serializer:** `AlunoSerializer`
*   **Modelo:** `Aluno`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "usuario": "integer (ID do Usuário)",
        "foto": "string (imagem codificada em base64, opcional)",
        "dataNascimento": "date (YYYY-MM-DD)",
        "contato": "string",
        "profissao": "string",
        "is_active": "boolean",
        "unidades": "array de inteiros (IDs de objetos Studio, opcional)"
    }
    ```
*   **Regras de Validação:**
    *   `usuario`: Obrigatório para criação, deve ser o ID de um objeto `User` existente. É `write_only`.
    *   `foto`: Opcional, string de imagem codificada em base64.
    *   `dataNascimento`: Obrigatório, formato de data válido (YYYY-MM-DD).
    *   `contato`: Obrigatório, string.
    *   `profissao`: Obrigatório, string.
    *   `is_active`: Obrigatório, booleano.
    *   `unidades`: Opcional, um array de inteiros representando os IDs de objetos `Studio`.
    *   `nome`, `email`, `cpf`: Estes campos são `read_only` e derivados do objeto `User` associado.
    *   **Validações Customizadas:**
        *   Garante que `usuario` seja fornecido durante a criação.
        *   Impede que um `User` seja associado a mais de um perfil de `Aluno`.

#### 2.2. `CreditoAulaViewSet` (Rota: `api/alunos/{aluno_cpf}/creditos/`)

*   **Serializer:** `CreditoAulaSerializer` (do `agendamentos.serializers`)
*   **Modelo:** `CreditoAula`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "quantidade": "integer",
        "data_validade": "date (YYYY-MM-DD)"
    }
    ```
*   **Regras de Validação:**
    *   `aluno`: Definido automaticamente a partir do `aluno_cpf` na URL (somente leitura no serializer).
    *   `quantidade`: Obrigatório, inteiro, deve ser 1 ou mais.
    *   `data_validade`: Obrigatório, formato de data válido (YYYY-MM-DD). Não pode ser no passado.
    *   `data_adicao`, `adicionado_por`, `data_invalidacao`, `invalidado_por`, `agendamento_origem`, `agendamento_uso`: Todos são campos somente leitura.

---

### **3. Autenticação App**

#### 3.1. `LoginAPIView` (Rota: `api/auth/login/`)

*   **Serializer:** `CustomTokenObtainPairSerializer` (herda de `TokenObtainPairSerializer`)
*   **Corpo da Requisição JSON:**
    ```json
    {
        "username": "string (email, cpf ou nome de usuário)",
        "password": "string"
    }
    ```
*   **Regras de Validação:**
    *   `username`: String obrigatória. Pode ser um email, CPF ou nome de usuário.
    *   `password`: String obrigatória.
    *   **Validação:** Autentica o usuário com base nas credenciais fornecidas. Se bem-sucedido, retorna tokens `access` e `refresh`, e potencialmente dados de perfil `user` se o usuário for um `Colaborador`.

#### 3.2. `TokenRefreshView` (Rota: `api/auth/token/refresh/`)

*   **Serializer:** `TokenRefreshSerializer` (serializer padrão do `rest_framework_simplejwt`)
*   **Corpo da Requisição JSON:**
    ```json
    {
        "refresh": "string (token de refresh)"
    }
    ```
*   **Regras de Validação:**
    *   `refresh`: String obrigatória, um token de refresh válido.
    *   **Validação:** Valida o token de refresh e, se válido, emite um novo token de acesso.

#### 3.3. `PasswordResetRequestAPIView` (Rota: `api/auth/password-reset/`)

*   **Serializer:** `PasswordResetRequestSerializer`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "identifier": "string (email ou cpf)"
    }
    ```
*   **Regras de Validação:**
    *   `identifier`: String obrigatória, comprimento máximo 255. Deve ser um email ou CPF não vazio.
    *   **Validação:** Verifica se o `identifier` corresponde a um usuário ativo. Se sim, envia um email de redefinição de senha. Não revela se o usuário existe por motivos de segurança.

#### 3.4. `PasswordResetConfirmAPIView` (Rota: `api/auth/password-reset/confirm/`)

*   **Serializer:** `PasswordResetConfirmSerializer`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "token": "string (token de redefinição do email)",
        "password": "string (nova senha)",
        "password_confirm": "string (confirmação da nova senha)"
    }
    ```
*   **Regras de Validação:**
    *   `token`: String obrigatória, o token de redefinição de senha recebido por email.
    *   `password`: String obrigatória, a nova senha.
    *   `password_confirm`: String obrigatória, deve corresponder a `password`.
    *   **Validação:**
        *   Verifica se o `token` é válido e não expirou.
        *   Garante que `password` e `password_confirm` coincidam.
        *   Se todas as validações passarem, atualiza a senha do usuário.

---

### **4. Avaliações App**

#### 4.1. `AvaliacaoListCreateView` (Rota: `api/avaliacoes/alunos/<str:aluno_cpf>/avaliacoes/`)

*   **Serializer:** `AvaliacaoSerializer`
*   **Modelo:** `Avaliacao`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "data_avaliacao": "date (YYYY-MM-DD)",
        "diagnostico_fisioterapeutico": "string",
        "historico_medico": "string",
        "patologias": "string",
        "exames_complementares": "string",
        "medicamentos_em_uso": "string",
        "tratamentos_realizados": "string",
        "objetivo_aluno": "string",
        "foto_avaliacao_postural": "string (imagem codificada em base64, opcional)",
        "data_reavalicao": "date (YYYY-MM-DD, opcional)",
        "studio": "integer (ID do Studio, opcional)"
    }
    ```
*   **Regras de Validação:**
    *   `id`, `aluno`, `aluno_nome`, `instrutor`, `instrutor_nome`, `data_criacao`, `data_ultima_modificacao`: Estes campos são `read_only`. `aluno` e `instrutor` são definidos automaticamente pelo método `perform_create` na view.
    *   `data_avaliacao`: Obrigatório, formato de data válido (YYYY-MM-DD).
    *   `diagnostico_fisioterapeutico`: Obrigatório, string.
    *   `historico_medico`: Obrigatório, string.
    *   `patologias`: Obrigatório, string.
    *   `exames_complementares`: Obrigatório, string.
    *   `medicamentos_em_uso`: Obrigatório, string.
    *   `tratamentos_realizados`: Obrigatório, string.
    *   `objetivo_aluno`: Obrigatório, string.
    *   `foto_avaliacao_postural`: Opcional, string de imagem codificada em base64.
    *   `data_reavalicao`: Opcional, formato de data válido (YYYY-MM-DD).
    *   `studio`: Opcional. A view tenta definir isso automaticamente com base nos estúdios associados ao aluno ou aos estúdios do instrutor, ou a partir dos dados da requisição, se fornecido.

---

### **5. Studios App**

#### 5.1. `StudioViewSet` (Rota: `api/studios/`)

*   **Serializer:** `StudioSerializer`
*   **Modelo:** `Studio`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "nome": "string",
        "endereco": "string"
    }
    ```
*   **Regras de Validação:**
    *   `id`: Somente leitura.
    *   `nome`: String obrigatória.
    *   `endereco`: String obrigatória.

---

### **6. Financeiro App**

#### 6.1. `PlanoViewSet` (Rota: `api/financeiro/planos/`)

*   **Serializer:** `PlanoSerializer`
*   **Modelo:** `Plano`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "nome": "string",
        "duracao_dias": "integer",
        "creditos_semanais": "integer",
        "preco": "decimal"
    }
    ```
*   **Regras de Validação:**
    *   `id`: Somente leitura.
    *   `nome`: String obrigatória.
    *   `duracao_dias`: Inteiro obrigatório.
    *   `creditos_semanais`: Inteiro obrigatório.
    *   `preco`: Decimal obrigatório.

#### 6.2. `MatriculaViewSet` (Rota: `api/financeiro/matriculas/`)

*   **Serializer:** `MatriculaSerializer`
*   **Modelo:** `Matricula`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "aluno_id": "integer (ID do Usuário associado a um Aluno)",
        "plano_id": "integer (ID do Plano)",
        "data_inicio": "date (YYYY-MM-DD)",
        "data_fim": "date (YYYY-MM-DD)",
        "studio": "integer (ID do Studio)"
    }
    ```
*   **Regras de Validação:**
    *   `id`, `aluno`, `plano`: Somente leitura.
    *   `aluno_id`: Obrigatório, inteiro, ID de um `Usuario` que possui um perfil `Aluno` associado. `write_only`.
    *   `plano_id`: Obrigatório, inteiro, ID de um objeto `Plano` existente. `write_only`.
    *   `data_inicio`: Obrigatório, formato de data válido (YYYY-MM-DD).
    *   `data_fim`: Obrigatório, formato de data válido (YYYY-MM-DD).
    *   `studio`: Obrigatório, inteiro, ID de um objeto `Studio` existente.

#### 6.3. `PagamentoViewSet` (Rota: `api/financeiro/pagamentos/`)

*   **Serializer:** `PagamentoSerializer`
*   **Modelo:** `Pagamento`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "matricula_id": "integer (ID da Matricula, opcional)",
        "venda_id": "integer (ID da Venda, opcional)",
        "valor_total": "decimal",
        "metodo_pagamento": "string (campo de escolha)",
        "status": "string (campo de escolha)",
        "data_vencimento": "date (YYYY-MM-DD)",
        "data_pagamento": "datetime (YYYY-MM-DDTHH:MM:SSZ, opcional)"
    }
    ```
*   **Regras de Validação:**
    *   `id`, `matricula`, `venda`, `comprovante_pagamento`: Somente leitura.
    *   **Validação:** Um pagamento deve ser associado a um `matricula_id` OU a um `venda_id`, mas não a ambos.
    *   `valor_total`: Obrigatório, decimal.
    *   `metodo_pagamento`: String obrigatória, deve ser uma das escolhas definidas.
    *   `status`: String obrigatória, deve ser uma das escolhas definidas.
    *   `data_vencimento`: Obrigatório, formato de data válido (YYYY-MM-DD).
    *   `data_pagamento`: Opcional, formato de data e hora válido.

#### 6.3.1. `PagamentoViewSet` Ação Customizada (Rota: `api/financeiro/pagamentos/{pk}/anexar_comprovante/`)

*   **Método:** POST
*   **Dados Esperados:** `multipart/form-data`
*   **Campo do Formulário:** `comprovante_pagamento`
*   **Regras de Validação:**
    *   `comprovante_pagamento`: Upload de arquivo obrigatório (string binária).

#### 6.4. `ProdutoViewSet` (Rota: `api/financeiro/produtos/`)

*   **Serializer:** `ProdutoSerializer`
*   **Modelo:** `Produto`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "nome": "string",
        "preco": "decimal"
    }
    ```
*   **Regras de Validação:**
    *   `id`, `estoque_studios`: Somente leitura.
    *   `nome`: String obrigatória.
    *   `preco`: Decimal obrigatório.

#### 6.5. `VendaViewSet` (Rota: `api/financeiro/vendas/`)

*   **Serializer:** `VendaSerializer`
*   **Modelo:** `Venda`
*   **Corpo da Requisição JSON:**
    ```json
    {
        "aluno": "integer (ID do Aluno, opcional)",
        "data_venda": "date (YYYY-MM-DD)",
        "produtos": "array de inteiros (IDs de objetos Produto)",
        "studio": "integer (ID do Studio)"
    }
    ```
*   **Regras de Validação:**
    *   `id`, `studio_display`: Somente leitura.
    *   `aluno`: Opcional, inteiro, ID de um objeto `Aluno` existente.
    *   `data_venda`: Obrigatório, formato de data válido (YYYY-MM-DD).
    *   `produtos`: Array de inteiros obrigatório, IDs de objetos `Produto` existentes.
    *   `studio`: Obrigatório, inteiro, ID de um objeto `Studio` existente. `write_only`.
    *   **Lógica Customizada:** Após a criação, a view realiza a baixa de estoque para os produtos vendidos no `studio` especificado.
