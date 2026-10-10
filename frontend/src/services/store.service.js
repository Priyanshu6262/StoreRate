import api from './api';

export const storeService = {
  async getStores(params = {}) {
    const res = await api.get('/stores', { params });
    return {
      stores: res.data || [],
      pagination: res.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  },

  async getStoreById(id) {
    const res = await api.get(`/stores/${id}`);
    return res.data;
  },

  async submitRating(storeId, rating) {
    const res = await api.post(`/stores/${storeId}/rating`, { rating });
    return res.data;
  },

  async modifyRating(storeId, rating) {
    const res = await api.put(`/stores/${storeId}/rating`, { rating });
    return res.data;
  },
};
