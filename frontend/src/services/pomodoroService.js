import api from './api';

export const pomodoroService = {
  logSession: (duration) => api.post('/pomodoro/sessions', { duration }),
  stats: () => api.get('/pomodoro/stats'),
};
