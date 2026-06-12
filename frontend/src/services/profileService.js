import api from './api';

export const profileService = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data),
  uploadPicture: (formData) =>
    api.post('/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
