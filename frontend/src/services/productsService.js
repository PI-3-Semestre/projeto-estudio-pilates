import api from './api';

/**
 * Busca todos os produtos do catálogo geral.
 * @returns {Promise<Array>} Uma lista de produtos com seus estoques em todos os estúdios.
 */
export const getProducts = async () => {
  try {
    const response = await api.get('produtos/');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
};

/**
 * (NOVO) Busca a lista de produtos com estoque calculado para um estúdio específico.
 * Ideal para a tela de vendas.
 * @param {number} studioId - O ID do estúdio.
 * @returns {Promise<Array>} Uma lista de produtos com o campo 'quantidade_em_estoque'.
 */
export const getProductsByStudio = async (studioId) => {
  if (!studioId) {
    return Promise.reject(new Error("É necessário fornecer o ID do estúdio."));
  }
  try {
    const response = await api.get(`produtos/studio/${studioId}/`);
    return response.data;
  } catch (error)
  {
    console.error(`Erro ao buscar produtos para o estúdio ${studioId}:`, error);
    throw error;
  }
};

/**
 * Cria um novo produto.
 * @param {object} productData - Os dados do produto a ser criado (nome, preco).
 * @returns {Promise<object>} O produto criado.
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post('produtos/', productData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
};

/**
 * Atualiza um produto existente.
 * @param {number} id - O ID do produto a ser atualizado.
 * @param {object} productData - Os dados a serem modificados.
 * @returns {Promise<object>} O produto atualizado.
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.patch(`produtos/${id}/`, productData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar produto ${id}:`, error);
    throw error;
  }
};

/**
 * Deleta um produto.
 * @param {number} id - O ID do produto a ser deletado.
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
  try {
    await api.delete(`produtos/${id}/`);
  } catch (error) {
    console.error(`Erro ao deletar produto ${id}:`, error);
    // Lançar o erro para que o ViewModel possa tratá-lo (ex: produto em uso)
    throw error;
  }
};
