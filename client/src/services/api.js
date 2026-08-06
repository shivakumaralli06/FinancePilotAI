import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('financepilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('financepilot_token');
      localStorage.removeItem('financepilot_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Income Endpoints
export const incomeService = {
  getIncome: () => api.get('/income'),
  createIncome: (data) => api.post('/income', data),
  updateIncome: (id, data) => api.put(`/income/${id}`, data),
  deleteIncome: (id) => api.delete(`/income/${id}`)
};

// Expense Endpoints
export const expenseService = {
  getExpenses: () => api.get('/expenses'),
  createExpense: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`)
};

// Budget Endpoints
export const budgetService = {
  getBudget: (month) => api.get(`/budget${month ? `?month=${month}` : ''}`),
  setBudget: (data) => api.post('/budget', data)
};

// AI Endpoints
export const aiService = {
  analyze: (data = {}) => api.post('/ai/analyze', data),
  chat: (message) => api.post('/ai/chat', { message }),
  getReports: () => api.get('/ai/reports')
};

export default api;
