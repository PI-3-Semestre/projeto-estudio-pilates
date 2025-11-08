import axios from 'axios';

// Pega a URL da API do environment, com um fallback para desenvolvimento local
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: VITE_API_URL,
});

// Interceptador de Requisição: Adiciona o token de acesso ao header
api.interceptors.request.use(
  (config) => {
    console.log('Request Interceptor: Attaching token');
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      console.log('Token found:', accessToken);
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      console.log('Token not found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador de Resposta: Lida com a renovação de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verifica se o erro é 401 e se não é uma tentativa de refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marca para evitar loop infinito
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Tenta obter um novo access token usando o refresh token
          const response = await axios.post(`${VITE_API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access, refresh } = response.data;

          // Salva os novos tokens
          localStorage.setItem('access_token', access);
          if (refresh) { // O backend pode ou não retornar um novo refresh token
             localStorage.setItem('refresh_token', refresh);
          }

          // Atualiza o header da requisição original e a re-executa
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          
          return api(originalRequest);

        } catch (refreshError) {
          // Se o refresh token falhar, limpa tudo e desloga
          console.error("Refresh token failed", refreshError);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          // Redireciona para a página de login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const getAlunoPorCpf = (cpf) => api.get(`/alunos/${cpf}/`);
export const getUsuario = (userId) => api.get(`/usuarios/${userId}/`);
export const getColaboradorPorCpf = (cpf) => api.get(`/colaboradores/${cpf}/`);
