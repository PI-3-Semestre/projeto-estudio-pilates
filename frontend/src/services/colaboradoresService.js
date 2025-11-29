import api from './api';

const BASE_URL = '/colaboradores/';

/**
 * **NOVO**
 * Cria um novo perfil de colaborador para um usuário existente.
 * @param {object} colaboradorData - Os dados do perfil do colaborador.
 * @returns {Promise} A promessa da API com os dados do colaborador criado.
 */
export const createColaborador = (colaboradorData) => {
    return api.post(BASE_URL, colaboradorData);
};

/**
 * Retorna a lista de todos os colaboradores.
 */
export const getColaboradores = () => {
    return api.get(BASE_URL);
};

/**
 * **NOVO**
 * Retorna a lista de todos os perfis de usuário disponíveis (ex: Administrador, Instrutor).
 * @returns {Promise} A promessa da API com a lista de perfis.
 */
export const getPerfis = () => {
    return api.get('/perfis/');
};

const colaboradoresService = {
    createColaborador,
    getColaboradores,
    getPerfis,
};

export default colaboradoresService;
