/**
 * API Client for MADO Admin Frontend
 * Handles all HTTP requests to the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/admin/login';
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API Error');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(name, email, password, role = 'editor') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Categories
  getCategories(tab) {
    const query = tab ? `?tab=${tab}` : '';
    return this.request(`/categories${query}`);
  }

  getCategory(id) {
    return this.request(`/categories/${id}`);
  }

  createCategory(label, tab) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify({ label, tab }),
    });
  }

  updateCategory(id, label) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ label }),
    });
  }

  deleteCategory(id) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Dishes
  getDishes(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dishes${query ? '?' + query : ''}`);
  }

  getDish(id) {
    return this.request(`/dishes/${id}`);
  }

  createDish(dish) {
    return this.request('/dishes', {
      method: 'POST',
      body: JSON.stringify(dish),
    });
  }

  updateDish(id, dish) {
    return this.request(`/dishes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dish),
    });
  }

  deleteDish(id) {
    return this.request(`/dishes/${id}`, { method: 'DELETE' });
  }

  bulkUpdateDishStatus(ids, status) {
    return this.request('/dishes/bulk/status', {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    });
  }

  // Locations
  getLocations() {
    return this.request('/locations');
  }

  getLocation(id) {
    return this.request(`/locations/${id}`);
  }

  createLocation(location) {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  updateLocation(id, location) {
    return this.request(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  deleteLocation(id) {
    return this.request(`/locations/${id}`, { method: 'DELETE' });
  }

  // Promotions
  getPromotions(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/promotions${query}`);
  }

  getPromotion(id) {
    return this.request(`/promotions/${id}`);
  }

  createPromotion(promo) {
    return this.request('/promotions', {
      method: 'POST',
      body: JSON.stringify(promo),
    });
  }

  updatePromotion(id, promo) {
    return this.request(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promo),
    });
  }

  deletePromotion(id) {
    return this.request(`/promotions/${id}`, { method: 'DELETE' });
  }

  // Reviews
  getReviews(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reviews${query ? '?' + query : ''}`);
  }

  getReviewStats() {
    return this.request('/reviews/stats/summary');
  }

  createReview(review) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  updateReviewStatus(id, status) {
    return this.request(`/reviews/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  deleteReview(id) {
    return this.request(`/reviews/${id}`, { method: 'DELETE' });
  }

  // Requests
  getRequests(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/requests${query ? '?' + query : ''}`);
  }

  getRequestStats() {
    return this.request('/requests/stats/summary');
  }

  createRequest(request) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  updateRequestStatus(id, status) {
    return this.request(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  deleteRequest(id) {
    return this.request(`/requests/${id}`, { method: 'DELETE' });
  }

  // Catering
  getCateringRequests(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/catering/requests${query}`);
  }

  getCateringRequest(id) {
    return this.request(`/catering/requests/${id}`);
  }

  createCateringRequest(request) {
    return this.request('/catering/requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  updateCateringRequestStatus(id, status) {
    return this.request(`/catering/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  getCateringContent(lang) {
    return this.request(`/catering/content?lang=${lang}`);
  }

  updateCateringContent(lang, content) {
    return this.request('/catering/content', {
      method: 'PUT',
      body: JSON.stringify({ lang, content }),
    });
  }

  // Vacancies
  getVacancies(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/vacancies${query}`);
  }

  getVacancy(id) {
    return this.request(`/vacancies/${id}`);
  }

  createVacancy(vacancy) {
    return this.request('/vacancies', {
      method: 'POST',
      body: JSON.stringify(vacancy),
    });
  }

  updateVacancy(id, vacancy) {
    return this.request(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vacancy),
    });
  }

  deleteVacancy(id) {
    return this.request(`/vacancies/${id}`, { method: 'DELETE' });
  }

  // Applications
  getApplications(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/applications${query ? '?' + query : ''}`);
  }

  getApplication(id) {
    return this.request(`/applications/${id}`);
  }

  createApplication(app) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(app),
    });
  }

  updateApplicationStatus(id, status) {
    return this.request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  deleteApplication(id) {
    return this.request(`/applications/${id}`, { method: 'DELETE' });
  }

  // FAQ
  getFaqItems(category) {
    const query = category ? `?category=${category}` : '';
    return this.request(`/faq${query}`);
  }

  getFaqItem(id) {
    return this.request(`/faq/${id}`);
  }

  createFaqItem(item) {
    return this.request('/faq', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  updateFaqItem(id, item) {
    return this.request(`/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  deleteFaqItem(id) {
    return this.request(`/faq/${id}`, { method: 'DELETE' });
  }

  // Settings
  getSettings() {
    return this.request('/settings');
  }

  getSetting(key) {
    return this.request(`/settings/${key}`);
  }

  updateSetting(key, value) {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Users
  getUsers() {
    return this.request('/users');
  }

  getUser(id) {
    return this.request(`/users/${id}`);
  }

  updateUser(id, user) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  resetUserPassword(id, password) {
    return this.request(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  deleteUser(id) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Activity Log
  getActivityLog(limit = 100, offset = 0) {
    return this.request(`/activity?limit=${limit}&offset=${offset}`);
  }

  getActivityForEntity(type, id) {
    return this.request(`/activity/${type}/${id}`);
  }

  // Pages
  getPages() {
    return this.request('/pages');
  }

  getPage(slug) {
    return this.request(`/pages/${slug}`);
  }

  createPage(page) {
    return this.request('/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    });
  }

  updatePage(id, page) {
    return this.request(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(page),
    });
  }

  deletePage(id) {
    return this.request(`/pages/${id}`, { method: 'DELETE' });
  }
}

export default new ApiClient();
