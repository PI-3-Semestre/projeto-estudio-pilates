import api from './api';

const matriculasService = {
    /**
     * Retorna uma lista com todas as matrículas cadastradas no sistema.
     */
    getMatriculas: () => {
        return api.get('/matriculas/');
    },

    /**
     * Busca todas as matrículas de um aluno específico.
     * @param {number} alunoId - O ID do usuário (aluno).
     */
    getMatriculasByAlunoId: (alunoId) => {
        if (!alunoId) {
            return Promise.reject(new Error("É necessário fornecer o ID do aluno."));
        }
        return api.get(`/matriculas/aluno/${alunoId}/`);
    },

    /**
     * Retorna os detalhes de uma matrícula específica.
     * @param {number} id - O ID da matrícula.
     */
    getMatriculaById: (id) => {
        return api.get(`/matriculas/${id}/`);
    },

    /**
     * Registra uma nova matrícula para um aluno em um plano.
     * @param {object} matriculaData - Os dados da matrícula.
     */
    createMatricula: (matriculaData) => {
        return api.post('/matriculas/', matriculaData);
    },

    /**
     * Atualiza parcialmente uma matrícula existente.
     * @param {number} id - O ID da matrícula.
     * @param {object} data - Os dados a serem modificados.
     */
    updateMatricula: (id, data) => {
        return api.patch(`/matriculas/${id}/`, data);
    },

    /**
     * Exclui o registro de uma matrícula.
     * @param {number} id - O ID da matrícula.
     */
    deleteMatricula: (id) => {
        return api.delete(`/matriculas/${id}/`);
    },
};

export default matriculasService;
