/**
 * API Client for MADO Admin Frontend
 * Handles all HTTP requests to the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiClient {
  token: string | null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
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
  login(email: string, password: string): Promise<any> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(name: string, email: string, password: string, role: string = 'editor'): Promise<any> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  getMe(): Promise<any> {
    return this.request('/auth/me');
  }

  // Categories
  getCategories(tab?: string): Promise<any> {
    const query = tab ? `?tab=${tab}` : '';
    return this.request(`/categories${query}`);
  }

  getCategory(id: string | number): Promise<any> {
    return this.request(`/categories/${id}`);
  }

  createCategory(label: string, tab: string): Promise<any> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify({ label, tab }),
    });
  }

  updateCategory(id: string | number, label: string): Promise<any> {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ label }),
    });
  }

  deleteCategory(id: string | number): Promise<any> {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Dishes
  getDishes(params: Record<string, any>): Promise<any> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dishes${query ? '?' + query : ''}`);
  }

  getDish(id: string | number): Promise<any> {
    return this.request(`/dishes/${id}`);
  }

  createDish(dish: Record<string, any>): Promise<any> {
    return this.request('/dishes', {
      method: 'POST',
      body: JSON.stringify(dish),
    });
  }

  updateDish(id: string | number, dish: Record<string, any>): Promise<any> {
    return this.request(`/dishes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dish),
    });
  }

  deleteDish(id: string | number): Promise<any> {
    return this.request(`/dishes/${id}`, { method: 'DELETE' });
  }

  bulkUpdateDishStatus(ids: (string | number)[], status: string): Promise<any> {
    return this.request('/dishes/bulk/status', {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    });
  }

  // Locations
  getLocations(): Promise<any> {
    return this.request('/locations');
  }

  getLocation(id: string | number): Promise<any> {
    return this.request(`/locations/${id}`);
  }

  createLocation(location: Record<string, any>): Promise<any> {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  updateLocation(id: string | number, location: Record<string, any>): Promise<any> {
    return this.request(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  deleteLocation(id: string | number): Promise<any> {
    return this.request(`/locations/${id}`, { method: 'DELETE' });
  }

  // Promotions
  getPromotions(status?: string): Promise<any> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/promotions${query}`);
  }

  getPromotion(id: string | number): Promise<any> {
    return this.request(`/promotions/${id}`);
  }

  createPromotion(promo: Record<string, any>): Promise<any> {
    return this.request('/promotions', {
      method: 'POST',
      body: JSON.stringify(promo),
    });
  }

  updatePromotion(id: string | number, promo: Record<string, any>): Promise<any> {
    return this.request(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promo),
    });
  }

  deletePromotion(id: string | number): Promise<any> {
    return this.request(`/promotions/${id}`, { method: 'DELETE' });
  }

  // Reviews
  getReviews(params: Record<string, any>): Promise<any> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reviews${query ? '?' + query : ''}`);
  }

  getReviewStats(): Promise<any> {
    return this.request('/reviews/stats/summary');
  }

  createReview(review: Record<string, any>): Promise<any> {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  updateReviewStatus(id: string | number, status: string): Promise<any> {
    return this.request(`/reviews/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  deleteReview(id: string | number): Promise<any> {
    return this.request(`/reviews/${id}`, { method: 'DELETE' });
  }

  // Requests
  getRequests(params: Record<string, any>): Promise<any> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/requests${query ? '?' + query : ''}`);
  }

  getRequestStats(): Promise<any> {
    return this.request('/requests/stats/summary');
  }

  createRequest(request: Record<string, any>): Promise<any> {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  updateRequestStatus(id: string | number, status: string): Promise<any> {
    return this.request(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  deleteRequest(id: string | number): Promise<any> {
    return this.request(`/requests/${id}`, { method: 'DELETE' });
  }

  // Catering
  getCateringRequests(status?: string): Promise<any> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/catering/requests${query}`);
  }

  getCateringRequest(id: string | number): Promise<any> {
    return this.request(`/catering/requests/${id}`);
  }

  createCateringRequest(request: Record<string, any>): Promise<any> {
    return this.request('/catering/requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  updateCateringRequestStatus(id: string | number, status: string): Promise<any> {
    return this.request(`/catering/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  getCateringContent(lang: string): Promise<any> {
    return this.request(`/catering/content?lang=${lang}`);
  }

  updateCateringContent(lang: string, content: Record<string, any>): Promise<any> {
    return this.request('/catering/content', {
      method: 'PUT',
      body: JSON.stringify({ lang, content }),
    });
  }

  // Vacancies
  getVacancies(status?: string): Promise<any> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/vacancies${query}`);
  }

  getVacancy(id: string | number): Promise<any> {
    return this.request(`/vacancies/${id}`);
  }

  createVacancy(vacancy: Record<string, any>): Promise<any> {
    return this.request('/vacancies', {
      method: 'POST',
      body: JSON.stringify(vacancy),
    });
  }

  updateVacancy(id: string | number, vacancy: Record<string, any>): Promise<any> {
    return this.request(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vacancy),
    });
  }

  deleteVacancy(id: string | number): Promise<any> {
    return this.request(`/vacancies/${id}`, { method: 'DELETE' });
  }

  // Applications
  getApplications(params: Record<string, any>): Promise<any> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/applications${query ? '?' + query : ''}`);
  }

  getApplication(id: string | number): Promise<any> {
    return this.request(`/applications/${id}`);
  }

  createApplication(app: Record<string, any>): Promise<any> {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(app),
    });
  }

  updateApplicationStatus(id: string | number, status: string): Promise<any> {
    return this.request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  deleteApplication(id: string | number): Promise<any> {
    return this.request(`/applications/${id}`, { method: 'DELETE' });
  }

  // FAQ
  getFaqItems(category?: string): Promise<any> {
    const query = category ? `?category=${category}` : '';
    return this.request(`/faq${query}`);
  }

  getFaqItem(id: string | number): Promise<any> {
    return this.request(`/faq/${id}`);
  }

  createFaqItem(item: Record<string, any>): Promise<any> {
    return this.request('/faq', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  updateFaqItem(id: string | number, item: Record<string, any>): Promise<any> {
    return this.request(`/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  deleteFaqItem(id: string | number): Promise<any> {
    return this.request(`/faq/${id}`, { method: 'DELETE' });
  }

  // Settings
  getSettings(): Promise<any> {
    return this.request('/settings');
  }

  getSetting(key: string): Promise<any> {
    return this.request(`/settings/${key}`);
  }

  updateSetting(key: string, value: any): Promise<any> {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  updateSettings(settings: Record<string, any>): Promise<any> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  deleteSetting(key: string): Promise<any> {
    return this.request(`/settings/${key}`, { method: 'DELETE' });
  }

  // Users
  getUsers(): Promise<any> {
    return this.request('/users');
  }

  getUser(id: string | number): Promise<any> {
    return this.request(`/users/${id}`);
  }

  updateUser(id: string | number, user: Record<string, any>): Promise<any> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  resetUserPassword(id: string | number, password: string): Promise<any> {
    return this.request(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  deleteUser(id: string | number): Promise<any> {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Activity Log
  getActivityLog(limit: number = 100, offset: number = 0): Promise<any> {
    return this.request(`/activity?limit=${limit}&offset=${offset}`);
  }

  getActivityForEntity(type: string, id: string | number): Promise<any> {
    return this.request(`/activity/${type}/${id}`);
  }

  // Pages
  getPages(): Promise<any> {
    return this.request('/pages');
  }

  getPage(slug: string): Promise<any> {
    return this.request(`/pages/${slug}`);
  }

  createPage(page: Record<string, any>): Promise<any> {
    return this.request('/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    });
  }

  updatePage(id: string | number, page: Record<string, any>): Promise<any> {
    return this.request(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(page),
    });
  }

  deletePage(id: string | number): Promise<any> {
    return this.request(`/pages/${id}`, { method: 'DELETE' });
  }
}

export default new ApiClient();
