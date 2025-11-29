import api from './api';

/**
 * **NOVO**
 * Busca as avaliações do aluno logado.
 * @returns {Promise} A promessa da API com a lista de avaliações do aluno.
 */
export const getMinhasAvaliacoes = () => {
  return api.get('/avaliacoes/me/');
};

/**
 * Cria uma nova avaliação física (rota global).
 * @param {object} avaliacaoData - Os dados completos da avaliação, incluindo o ID do aluno.
 * @returns {Promise} A promessa da API com a avaliação criada.
 */
export const createAvaliacaoGlobal = (avaliacaoData) => {
  return api.post('/avaliacoes/', avaliacaoData);
};

/**
 * Busca a lista global de todas as avaliações no sistema.
 * @returns {Promise} A promessa da API com a lista de todas as avaliações.
 */
export const getAllAvaliacoes = () => {
  return api.get('/avaliacoes/');
};

/**
 * Busca o histórico completo de avaliações de um aluno pelo ID do aluno.
 * @param {string|number} alunoId - O ID numérico do aluno.
 * @returns {Promise} A promessa da API com a lista de avaliações.
 */
export const getAvaliacoesByAlunoId = (alunoId) => {
  return api.get(`/avaliacoes/alunos/${alunoId}/`);
};

/**
 * Busca uma avaliação específica pelo seu ID.
 * @param {number} id - O ID da avaliação.
 * @returns {Promise} A promessa da API com os dados da avaliação.
 */
export const getAvaliacaoById = (id) => {
  return api.get(`/avaliacoes/avaliacoes/${id}/`);
};

/**
 * Atualiza uma avaliação específica (método PATCH).
 * @param {number} id - O ID da avaliação a ser atualizada.
 * @param {object} avaliacaoData - Os dados a serem modificados.
 * @returns {Promise} A promessa da API com a avaliação atualizada.
 */
export const updateAvaliacao = (id, avaliacaoData) => {
  return api.patch(`/avaliacoes/avaliacoes/${id}/`, avaliacaoData);
};

/**
 * Deleta uma avaliação específica pelo seu ID.
 * @param {number} id - O ID da avaliação a ser deletada.
 * @returns {Promise} A promessa da API.
 */
export const deleteAvaliacao = (id) => {
  return api.delete(`/avaliacoes/avaliacoes/${id}/`);
};
