import api from './api';

export const adminService = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};
