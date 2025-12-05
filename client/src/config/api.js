// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
  },
  // Market Data
  MARKET: {
    SEARCH: `${API_BASE_URL}/market/search`,
    COMPANY_CHART: (id, days) => `${API_BASE_URL}/market/company/${id}/chart?days=${days}`,
  },
  // Portfolio
  PORTFOLIO: {
    BASE: `${API_BASE_URL}/portfolio`,
    BULK_DELETE: `${API_BASE_URL}/portfolio/bulk-delete`,
  },
  // Future Analysis
  FUTURE_ANALYSIS: {
    BASE: `${API_BASE_URL}/future-analysis`,
    BULK_DELETE: `${API_BASE_URL}/future-analysis/bulk-delete`,
    MOVE_TO_PORTFOLIO: `${API_BASE_URL}/future-analysis/move-to-portfolio`,
  },
  // Categories
  CATEGORIES: {
    BASE: `${API_BASE_URL}/categories`,
    BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,
    UPDATE_COMPANY_CATEGORY: `${API_BASE_URL}/categories/update-company-category`,
  },
  // Comparisons
  COMPARISONS: {
    BASE: `${API_BASE_URL}/comparisons`,
    BY_ID: (id) => `${API_BASE_URL}/comparisons/${id}`,
  },
};

export default API_BASE_URL;

