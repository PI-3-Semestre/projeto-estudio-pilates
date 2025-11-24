import api from './api';

// --- Horários de Trabalho (Semanal) ---

export const getHorariosTrabalho = () => {
    return api.get('/agendamentos/horarios-trabalho/');
};

export const getHorarioTrabalhoById = (id) => {
    return api.get(`/agendamentos/horarios-trabalho/${id}/`);
};

export const createHorarioTrabalho = (data) => {
    return api.post('/agendamentos/horarios-trabalho/', data);
};

export const updateHorarioTrabalho = (id, data) => {
    return api.put(`/agendamentos/horarios-trabalho/${id}/`, data);
};

export const deleteHorarioTrabalho = (id) => {
    return api.delete(`/agendamentos/horarios-trabalho/${id}/`);
};

// --- Bloqueios de Agenda (Datas Específicas) ---

export const getBloqueiosAgenda = () => {
    return api.get('/agendamentos/bloqueios-agenda/');
};

export const getBloqueioAgendaById = (id) => {
    return api.get(`/agendamentos/bloqueios-agenda/${id}/`);
};

export const createBloqueioAgenda = (data) => {
    return api.post('/agendamentos/bloqueios-agenda/', data);
};

export const updateBloqueioAgenda = (id, data) => {
    return api.put(`/agendamentos/bloqueios-agenda/${id}/`, data);
};

export const deleteBloqueioAgenda = (id) => {
    return api.delete(`/agendamentos/bloqueios-agenda/${id}/`);
};
