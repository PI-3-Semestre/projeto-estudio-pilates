import api from './api';

const alunosService = {
    /**
     * Busca alunos por nome, sobrenome ou CPF.
     * @param {string} query - O termo de busca.
     */
    searchAlunos: (query) => {
        return api.get('/alunos/', {
            params: {
                search: query,
            },
        });
    },

    // Futuramente, outras funções relacionadas a alunos podem ser adicionadas aqui.
    // Ex: getAlunoById, createAluno, etc.
};

export default alunosService;
