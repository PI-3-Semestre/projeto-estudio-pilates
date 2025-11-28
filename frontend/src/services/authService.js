import api from './api';

const authService = {
  /**
   * Realiza o login do usuário.
   * @param {string} email - O email ou CPF do usuário.
   * @param {string} password - A senha do usuário.
   * @returns {Promise<object>} Os dados da resposta da API (access, refresh, user).
   */
  login: async (email, password) => {
    try {
      // O schema da API espera que o identificador (email/cpf/username)
      // seja enviado no campo 'username'.
      const response = await api.post('/auth/login/', {
        username: email, // Corrigido de 'email' para 'username'
        password: password,
      });
      return response.data;
    } catch (error) {
      // Extrai e traduz a mensagem de erro da resposta da API, se disponível
      const apiError = error.response?.data?.detail;
      let errorMessage = 'Credenciais inválidas. Verifique seu e-mail/CPF e senha.'; // Mensagem padrão

      if (apiError) {
        if (apiError.includes('No active account found')) {
          errorMessage = 'Nenhuma conta ativa foi encontrada com as credenciais fornecidas.';
        } else {
          errorMessage = apiError; // Usa o erro da API se for outro
        }
      }

      throw new Error(errorMessage);
    }
  },
  /**
   * Cria um novo usuário (aluno) a partir de uma conta de administrador.
   * @param {object} userData - Os dados do usuário para criação.
   * @returns {Promise<object>} Os dados do usuário criado.
   */
  adminCreateUser: async (userData) => {
    try {
      const response = await api.post('/api/usuarios/', userData);
      return response.data;
    } catch (error) {
      // Lança o erro original para que o ViewModel possa extrair detalhes de validação
      throw error;
    }
  },
  // Outros métodos de serviço de autenticação podem ser adicionados aqui.
  /**
   * Passo 1: Solicita o envio do e-mail de recuperação.
   * Rota no backend: /api/auth/password-reset/
   */
  requestPasswordReset: async (emailOrCpf) => {
    try {
      // O backend espera "identifier" (CPF ou Email)
      const response = await api.post('/auth/password-reset/', { 
        identifier: emailOrCpf 
      });
      return response.data;
    } catch (error) {
      throw error; 
    }
  },
  /**
   * Passo 2: Confirma a troca de senha.
   * Rota no backend: /api/auth/password-reset/confirm/
   */
  confirmPasswordReset: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/password-reset/confirm/', {
        token,
        password: newPassword,
        password_confirm: newPassword, // Seu serializer pode exigir este campo
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;

