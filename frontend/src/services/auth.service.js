import api from './api';

export const authService = {
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  async changePassword(passwords) {
    const res = await api.post('/auth/change-password', passwords);
    return res;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
