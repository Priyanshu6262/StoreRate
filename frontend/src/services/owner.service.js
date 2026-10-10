import api from './api';

export const ownerService = {
  async getDashboard(storeId = null) {
    const params = storeId ? { storeId } : {};
    const res = await api.get('/owner/dashboard', { params });
    return res.data;
  },

  async getRatings(params = {}) {
    const res = await api.get('/owner/ratings', { params });
    return {
      ratings: res.data || [],
      pagination: res.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
      store: res.meta?.store || null,
      stores: res.meta?.stores || [],
    };
  },
};
