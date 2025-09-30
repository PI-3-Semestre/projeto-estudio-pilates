const API_URL = import.meta.env.VITE_API_URL;

const authService = {
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // Lança um erro para ser capturado pelo ViewModel
      const errorData = await response.json().catch(() => ({ detail: 'Erro de autenticação' }));
      throw new Error(errorData.detail || 'Não foi possível fazer login');
    }

    return response.json();
  },

  // Adicione outros métodos de serviço de autenticação aqui (ex: logout, me)
};

export default authService;
