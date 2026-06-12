import api from './api';

export const groupService = {
  list: (params) => api.get('/groups', { params }),
  getOne: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  remove: (id) => api.delete(`/groups/${id}`),
  join: (id) => api.post(`/groups/${id}/join`),
  leave: (id) => api.delete(`/groups/${id}/leave`),
  announcements: (id) => api.get(`/groups/${id}/announcements`),
  addAnnouncement: (id, data) => api.post(`/groups/${id}/announcements`, data),
  files: (id) => api.get(`/groups/${id}/files`),
  uploadFile: (id, formData) =>
    api.post(`/groups/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  messages: (id, params) => api.get(`/groups/${id}/messages`, { params }),
};
