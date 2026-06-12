import api from './api';

export const taskService = {
  list: (params) => api.get('/tasks', { params }),
  subjects: () => api.get('/tasks/subjects'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  setStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  remove: (id) => api.delete(`/tasks/${id}`),
};
