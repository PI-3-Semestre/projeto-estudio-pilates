import api from './api';

const studiosService = {
  getAllStudios: () => {
    return api.get('/studios/');
  },

  getStudioById: (id) => {
    return api.get(`/studios/${id}/`);
  },

  createStudio: (studioData) => {
    return api.post('/studios/', studioData);
  },

  updateStudio: (id, studioData) => {
    return api.put(`/studios/${id}/`, studioData);
  },

  deleteStudio: (id) => {
    return api.delete(`/studios/${id}/`);
  },

  getDashboardStudio: (studioId) => {
    return api.get(`/studios/${studioId}/dashboard/`);
  },
};

export default studiosService;