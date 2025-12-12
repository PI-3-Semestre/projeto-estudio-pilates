import api from './api';

/**
 * **NOVO**
 * Retorna os detalhes completos do perfil do aluno que está atualmente logado.
 */
export const getMeuPerfil = () => {
  return api.get('/alunos/me/');
};


/**
 * Busca os dados de um aluno específico pelo CPF.
 * @param {string} cpf - O CPF do aluno.
 * @returns {Promise} A promessa da API com os dados do aluno.
 */
export const getAlunoByCpf = (cpf) => {
  return api.get(`/alunos/${cpf}/`);
};

/**
 * Busca todos os alunos.
 * @returns {Promise} A promessa da API com a lista de alunos.
 */
export const getAlunos = () => {
  return api.get('/alunos/');
};

/**
 * Busca alunos por nome, sobrenome ou CPF.
 * @param {string} query - O termo de busca.
 */
export const searchAlunos = (query) => {
    return api.get('/alunos/', {
        params: {
            search: query,
        },
    });
};

// Manter a exportação padrão para não quebrar outras partes do sistema
const alunosService = {
    getMeuPerfil,
    getAlunoByCpf,
    getAlunos,
    searchAlunos,
};

export default alunosService;
