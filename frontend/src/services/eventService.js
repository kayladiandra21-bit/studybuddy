import api from './api';

export const eventService = {
  list: (params) => api.get('/events', { params }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  remove: (id) => api.delete(`/events/${id}`),
};
