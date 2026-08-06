import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
if (rawBaseUrl && !rawBaseUrl.endsWith('/api') && !rawBaseUrl.endsWith('/api/')) {
  rawBaseUrl = rawBaseUrl.replace(/\/$/, '') + '/api';
}
const API_BASE_URL = rawBaseUrl;

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

// Helper for handling 405 or network failures gracefully on static deployments (Vercel static host)
const handle405Fallback = async (apiCall, fallbackFn) => {
  try {
    return await apiCall();
  } catch (error) {
    if (error.response?.status === 405 || !error.response) {
      console.warn('⚠️ Server endpoint returned 405 or offline. Executing client demo fallback.');
      return { data: await fallbackFn() };
    }
    throw error;
  }
};

// Auth Endpoints
export const authService = {
  register: (data) => handle405Fallback(
    () => api.post('/auth/register', data),
    () => {
      const user = {
        id: 'user-' + Date.now(),
        name: data.name || 'User',
        email: data.email,
        created_at: new Date().toISOString()
      };
      const token = 'mock_jwt_token_' + Date.now();
      return { success: true, message: 'Account created successfully!', token, user };
    }
  ),
  login: (data) => handle405Fallback(
    () => api.post('/auth/login', data),
    () => {
      const storedUser = localStorage.getItem('financepilot_user');
      let user = storedUser ? JSON.parse(storedUser) : null;
      if (!user || user.email !== data.email) {
        user = {
          id: 'user-demo-' + Date.now(),
          name: data.email.split('@')[0],
          email: data.email,
          created_at: new Date().toISOString()
        };
      }
      const token = 'mock_jwt_token_' + Date.now();
      return { success: true, message: 'Login successful!', token, user };
    }
  ),
  forgotPassword: (email) => handle405Fallback(
    () => api.post('/auth/forgot-password', { email }),
    () => ({ success: true, message: 'Password reset code sent! Use code: 123456', code: '123456' })
  ),
  resetPassword: (data) => handle405Fallback(
    () => api.post('/auth/reset-password', data),
    () => ({ success: true, message: 'Password has been reset successfully! You can now log in.' })
  ),
  getProfile: () => handle405Fallback(
    () => api.get('/auth/profile'),
    () => {
      const user = JSON.parse(localStorage.getItem('financepilot_user') || '{}');
      return { success: true, user };
    }
  ),
  updateProfile: (data) => handle405Fallback(
    () => api.put('/auth/profile', data),
    () => {
      const user = JSON.parse(localStorage.getItem('financepilot_user') || '{}');
      const updated = { ...user, ...data };
      localStorage.setItem('financepilot_user', JSON.stringify(updated));
      return { success: true, message: 'Profile updated successfully!', user: updated };
    }
  )
};

// Income Endpoints
export const incomeService = {
  getIncome: () => handle405Fallback(
    () => api.get('/income'),
    () => {
      const items = JSON.parse(localStorage.getItem('fp_income') || '[]');
      if (items.length === 0) {
        const defaults = [
          { id: '1', source: 'Monthly Salary', amount: 5500, date: new Date().toISOString().slice(0, 10) },
          { id: '2', source: 'Freelancing Project', amount: 1200, date: new Date().toISOString().slice(0, 10) }
        ];
        localStorage.setItem('fp_income', JSON.stringify(defaults));
        return defaults;
      }
      return items;
    }
  ),
  createIncome: (data) => handle405Fallback(
    () => api.post('/income', data),
    () => {
      const items = JSON.parse(localStorage.getItem('fp_income') || '[]');
      const newItem = { id: 'inc-' + Date.now(), ...data, created_at: new Date().toISOString() };
      items.unshift(newItem);
      localStorage.setItem('fp_income', JSON.stringify(items));
      return newItem;
    }
  ),
  updateIncome: (id, data) => handle405Fallback(
    () => api.put(`/income/${id}`, data),
    () => {
      let items = JSON.parse(localStorage.getItem('fp_income') || '[]');
      items = items.map(item => item.id === id ? { ...item, ...data } : item);
      localStorage.setItem('fp_income', JSON.stringify(items));
      return { id, ...data };
    }
  ),
  deleteIncome: (id) => handle405Fallback(
    () => api.delete(`/income/${id}`),
    () => {
      let items = JSON.parse(localStorage.getItem('fp_income') || '[]');
      items = items.filter(item => item.id !== id);
      localStorage.setItem('fp_income', JSON.stringify(items));
      return { success: true };
    }
  )
};

// Expense Endpoints
export const expenseService = {
  getExpenses: () => handle405Fallback(
    () => api.get('/expenses'),
    () => {
      const items = JSON.parse(localStorage.getItem('fp_expenses') || '[]');
      if (items.length === 0) {
        const defaults = [
          { id: 'e1', title: 'Apartment Rent', category: 'Rent', amount: 1500, date: new Date().toISOString().slice(0, 10) },
          { id: 'e2', title: 'Grocery Shopping', category: 'Food', amount: 420, date: new Date().toISOString().slice(0, 10) },
          { id: 'e3', title: 'Electric Bill', category: 'Utilities', amount: 180, date: new Date().toISOString().slice(0, 10) }
        ];
        localStorage.setItem('fp_expenses', JSON.stringify(defaults));
        return defaults;
      }
      return items;
    }
  ),
  createExpense: (data) => handle405Fallback(
    () => api.post('/expenses', data),
    () => {
      const items = JSON.parse(localStorage.getItem('fp_expenses') || '[]');
      const newItem = { id: 'exp-' + Date.now(), ...data, created_at: new Date().toISOString() };
      items.unshift(newItem);
      localStorage.setItem('fp_expenses', JSON.stringify(items));
      return newItem;
    }
  ),
  updateExpense: (id, data) => handle405Fallback(
    () => api.put(`/expenses/${id}`, data),
    () => {
      let items = JSON.parse(localStorage.getItem('fp_expenses') || '[]');
      items = items.map(item => item.id === id ? { ...item, ...data } : item);
      localStorage.setItem('fp_expenses', JSON.stringify(items));
      return { id, ...data };
    }
  ),
  deleteExpense: (id) => handle405Fallback(
    () => api.delete(`/expenses/${id}`),
    () => {
      let items = JSON.parse(localStorage.getItem('fp_expenses') || '[]');
      items = items.filter(item => item.id !== id);
      localStorage.setItem('fp_expenses', JSON.stringify(items));
      return { success: true };
    }
  )
};

// Budget Endpoints
export const budgetService = {
  getBudget: (month) => handle405Fallback(
    () => api.get(`/budget${month ? `?month=${month}` : ''}`),
    () => {
      const budget = JSON.parse(localStorage.getItem('fp_budget') || 'null');
      return budget || { monthly_budget: 3500, month: new Date().toISOString().slice(0, 7) };
    }
  ),
  setBudget: (data) => handle405Fallback(
    () => api.post('/budget', data),
    () => {
      localStorage.setItem('fp_budget', JSON.stringify(data));
      return data;
    }
  )
};

// AI Endpoints
export const aiService = {
  analyze: (data = {}) => handle405Fallback(
    () => api.post('/ai/analyze', data),
    () => ({
      healthScore: 88,
      analysis: 'Your savings rate is strong at 65%. Your top spending category is Rent. Recommendation: Allocate 15% of your income to automated investments.',
      insights: [
        'Great job keeping food expenses under budget.',
        'Rent accounts for 45% of total expenses.',
        'Consider setting up an emergency fund with 3 months of expenses.'
      ]
    })
  ),
  chat: (message) => handle405Fallback(
    () => api.post('/ai/chat', { message }),
    () => ({
      reply: `FinancePilot AI Analysis: Based on your financial data, your cash flow is positive. You have safe discretionary spending buffer for this month.`
    })
  ),
  getReports: () => handle405Fallback(
    () => api.get('/ai/reports'),
    () => ({
      reports: [
        { id: 'rep-1', title: 'Monthly Financial Health Check', created_at: new Date().toISOString() }
      ]
    })
  )
};

export default api;
