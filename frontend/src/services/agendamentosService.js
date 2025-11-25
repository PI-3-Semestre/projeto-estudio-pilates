import api from './api';

const agendamentosService = {
  /**
   * Busca todos os agendamentos do aluno autenticado.
   * @returns {Promise<Array>} Uma lista de agendamentos.
   */
  getMeusAgendamentos: async () => {
    try {
      const response = await api.get('/agendamentos/aulas-alunos/');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar meus agendamentos:", error);
      throw error;
    }
  },

  /**
   * Cancela um agendamento específico do aluno.
   * @param {number} agendamentoId - O ID do agendamento a ser cancelado.
   * @returns {Promise<object>} A resposta da API após o cancelamento.
   */
  cancelarAgendamento: async (agendamentoId) => {
    try {
      const response = await api.delete(`/agendamentos/aulas-alunos/${agendamentoId}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao cancelar agendamento ${agendamentoId}:`, error);
      throw error;
    }
  },

  /**
   * Marca uma aula para o aluno autenticado ou o adiciona à lista de espera.
   * @param {object} payload - Objeto contendo { aula: aulaId, entrar_lista_espera: boolean (opcional) }.
   * @returns {Promise<object>} Os dados do agendamento criado.
   */
  marcarAula: async (payload) => {
    try {
      const response = await api.post('/agendamentos/aulas-alunos/', payload);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição marcarAula:", error); // DEBUG: Log do erro completo
      console.error("Detalhes da resposta de erro:", error.response); // DEBUG: Log da resposta de erro
      throw error; // Lança o erro para ser tratado no ViewModel/View
    }
  },
};

export default agendamentosService;
