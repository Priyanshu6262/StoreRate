import api from './api';

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return {
      users: res.data || [],
      pagination: res.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  },

  async createUser(userData) {
    const res = await api.post('/admin/users', userData);
    return res.data;
  },

  async getUserById(id) {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  async getStores(params = {}) {
    const res = await api.get('/admin/stores', { params });
    return {
      stores: res.data || [],
      pagination: res.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  },

  async createStore(storeData) {
    const res = await api.post('/admin/stores', storeData);
    return res.data;
  },
};
