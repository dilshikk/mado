/**
 * API Client for MADO Admin Frontend
 * Handles all HTTP requests to the backend server
 *
 * ── How to set VITE_API_URL ──────────────────────────────────────────────────
 *
 * In most setups you do NOT need VITE_API_URL at all.
 * Leave it unset — requests go to /api on the same host (Vite proxy or Nginx).
 *
 * Set it ONLY when the API is on a different domain, e.g.:
 *   VITE_API_URL=https://api.mado.uz/api    ✓ correct — ends with /api, no trailing slash
 *   VITE_API_URL=http://ftp.mado.uz/api     ✓ correct
 *   VITE_API_URL=http://ftp.mado.uz/        ✗ wrong — missing /api, trailing slash
 *   VITE_API_URL=http://ftp.mado.uz         ✗ wrong — missing /api
 *
 * The code below normalises trailing slashes so common mistakes don't cause
 * double-slash URLs, but the /api suffix must be present in the value.
 */

function resolveBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;

  if (!raw) {
    // No env var — use a relative path that works with Vite proxy and Nginx
    return '/api';
  }

  // Strip any number of trailing slashes to avoid double-slash in URLs
  const normalised = raw.replace(/\/+$/, '');

  // Warn in dev if the value looks like it's missing /api
  if (import.meta.env.DEV && !normalised.endsWith('/api')) {
    console.warn(
      `[API] VITE_API_URL="${raw}" does not end with /api.\n` +
      `Expected format: http://ftp.mado.uz/api\n` +
      `Using "${normalised}" — requests may fail.`
    );
  }

  return normalised;
}

const API_BASE_URL = resolveBaseUrl();

/**
 * Derive the server origin for resolving relative upload URLs.
 */
function getServerOrigin(): string {
  if (!API_BASE_URL.startsWith('/')) {
    return API_BASE_URL.replace(/\/api$/, '');
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/** Safely parse JSON from a Response. Returns null if body is empty or not JSON. */
async function safeJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return { error: `Server error (${response.status})` };
  }
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { error: `Invalid JSON response (${response.status})` };
  }
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

  /**
   * Converts a backend file URL to a browser-safe URL.
   * Strips loopback origins so Vite proxy / Nginx serves the file.
   */
  getFileUrl(fileUrl: string): string {
    if (!fileUrl) return '';

    if (/^https?:\/\//i.test(fileUrl)) {
      try {
        const parsed = new URL(fileUrl);
        const isLocal =
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname === 'localhost' ||
          parsed.hostname === window.location.hostname;
        if (isLocal) {
          return parsed.pathname + parsed.search + parsed.hash;
        }
      } catch {
        // Not a valid URL, fall through
      }
      return fileUrl;
    }

    return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  }

  async request(endpoint: string, options: RequestOptions = {}): Promise<unknown> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/admin/login';
        throw new Error('Unauthorized');
      }

      const data = await safeJson(response);

      if (!response.ok) {
        const errData = data as { error?: string };
        throw new Error(errData?.error ?? `Request failed (${response.status})`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.message !== 'Unauthorized') {
        console.error('API Request Error:', error);
      }
      throw error;
    }
  }

  async uploadFiles(endpoint: string, formData: FormData): Promise<unknown> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {};
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(url, { method: 'POST', headers, body: formData });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/admin/login';
      throw new Error('Unauthorized');
    }

    const data = await safeJson(response);
    if (!response.ok) {
      const errData = data as { error?: string };
      throw new Error(errData?.error ?? `Upload failed (${response.status})`);
    }
    return data;
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const result = await this.uploadFiles('/auth/me/avatar', formData);
    return result as { avatar_url: string };
  }

  async uploadDishImage(file: File): Promise<string> {
    const result = await this.uploadMedia([file]);
    const files = result as { full_url: string; file_url: string }[];
    const uploaded = files[0];
    if (!uploaded) throw new Error('Upload failed: no file returned');
    return uploaded.full_url ?? this.getFileUrl(uploaded.file_url);
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────

  getDashboardStats(): Promise<unknown> {
    return this.request('/dashboard/stats');
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  login(email: string, password: string): Promise<unknown> {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  register(name: string, email: string, password: string, role = 'editor'): Promise<unknown> {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) });
  }

  getMe(): Promise<unknown> {
    return this.request('/auth/me');
  }

  // ── Menu sections (top-level tabs) ───────────────────────────────────────────

  getSections(): Promise<unknown> {
    return this.request('/sections');
  }

  getSection(id: string | number): Promise<unknown> {
    return this.request(`/sections/${id}`);
  }

  createSection(section: Record<string, unknown>): Promise<unknown> {
    return this.request('/sections', { method: 'POST', body: JSON.stringify(section) });
  }

  updateSection(id: string | number, section: Record<string, unknown>): Promise<unknown> {
    return this.request(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(section) });
  }

  reorderSections(orderedIds: (string | number)[]): Promise<unknown> {
    return this.request('/sections/reorder/all', { method: 'PUT', body: JSON.stringify({ orderedIds }) });
  }

  deleteSection(id: string | number): Promise<unknown> {
    return this.request(`/sections/${id}`, { method: 'DELETE' });
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  getCategories(tab?: string): Promise<unknown> {
    return this.request(`/categories${tab ? `?tab=${tab}` : ''}`);
  }

  getCategory(id: string | number): Promise<unknown> {
    return this.request(`/categories/${id}`);
  }

  createCategory(category: Record<string, unknown>): Promise<unknown> {
    return this.request('/categories', { method: 'POST', body: JSON.stringify(category) });
  }

  updateCategory(id: string | number, category: Record<string, unknown>): Promise<unknown> {
    return this.request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) });
  }

  deleteCategory(id: string | number): Promise<unknown> {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // ── Dishes ──────────────────────────────────────────────────────────────────

  getDishes(params: Record<string, string>): Promise<unknown> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dishes${query ? '?' + query : ''}`);
  }

  getDish(id: string | number): Promise<unknown> {
    return this.request(`/dishes/${id}`);
  }

  createDish(dish: Record<string, unknown>): Promise<unknown> {
    return this.request('/dishes', { method: 'POST', body: JSON.stringify(dish) });
  }

  updateDish(id: string | number, dish: Record<string, unknown>): Promise<unknown> {
    return this.request(`/dishes/${id}`, { method: 'PUT', body: JSON.stringify(dish) });
  }

  deleteDish(id: string | number): Promise<unknown> {
    return this.request(`/dishes/${id}`, { method: 'DELETE' });
  }

  bulkUpdateDishStatus(ids: (string | number)[], status: string): Promise<unknown> {
    return this.request('/dishes/bulk/status', { method: 'PUT', body: JSON.stringify({ ids, status }) });
  }

  // ── Locations ───────────────────────────────────────────────────────────────

  getLocations(): Promise<unknown> { return this.request('/locations'); }
  getLocation(id: string | number): Promise<unknown> { return this.request(`/locations/${id}`); }
  createLocation(location: Record<string, unknown>): Promise<unknown> {
    return this.request('/locations', { method: 'POST', body: JSON.stringify(location) });
  }
  updateLocation(id: string | number, location: Record<string, unknown>): Promise<unknown> {
    return this.request(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(location) });
  }
  deleteLocation(id: string | number): Promise<unknown> {
    return this.request(`/locations/${id}`, { method: 'DELETE' });
  }

  // ── Promotions ──────────────────────────────────────────────────────────────

  getPromotions(status?: string): Promise<unknown> {
    return this.request(`/promotions${status ? `?status=${status}` : ''}`);
  }
  getPromotion(id: string | number): Promise<unknown> { return this.request(`/promotions/${id}`); }
  createPromotion(promo: Record<string, unknown>): Promise<unknown> {
    return this.request('/promotions', { method: 'POST', body: JSON.stringify(promo) });
  }
  updatePromotion(id: string | number, promo: Record<string, unknown>): Promise<unknown> {
    return this.request(`/promotions/${id}`, { method: 'PUT', body: JSON.stringify(promo) });
  }
  deletePromotion(id: string | number): Promise<unknown> {
    return this.request(`/promotions/${id}`, { method: 'DELETE' });
  }

  // ── Reviews ─────────────────────────────────────────────────────────────────

  getReviews(params: Record<string, string>): Promise<unknown> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reviews${query ? '?' + query : ''}`);
  }
  getReviewStats(): Promise<unknown> { return this.request('/reviews/stats/summary'); }
  createReview(review: Record<string, unknown>): Promise<unknown> {
    return this.request('/reviews', { method: 'POST', body: JSON.stringify(review) });
  }
  updateReviewStatus(id: string | number, status: string): Promise<unknown> {
    return this.request(`/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }
  deleteReview(id: string | number): Promise<unknown> {
    return this.request(`/reviews/${id}`, { method: 'DELETE' });
  }

  // ── Requests ────────────────────────────────────────────────────────────────

  getRequests(params: Record<string, string>): Promise<unknown> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/requests${query ? '?' + query : ''}`);
  }
  getRequestStats(): Promise<unknown> { return this.request('/requests/stats/summary'); }
  createRequest(request: Record<string, unknown>): Promise<unknown> {
    return this.request('/requests', { method: 'POST', body: JSON.stringify(request) });
  }
  updateRequestStatus(id: string | number, status: string): Promise<unknown> {
    return this.request(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }
  deleteRequest(id: string | number): Promise<unknown> {
    return this.request(`/requests/${id}`, { method: 'DELETE' });
  }

  // ── Catering ────────────────────────────────────────────────────────────────

  getCateringRequests(status?: string): Promise<unknown> {
    return this.request(`/catering/requests${status ? `?status=${status}` : ''}`);
  }
  getCateringRequest(id: string | number): Promise<unknown> {
    return this.request(`/catering/requests/${id}`);
  }
  createCateringRequest(request: Record<string, unknown>): Promise<unknown> {
    return this.request('/catering/requests', { method: 'POST', body: JSON.stringify(request) });
  }
  updateCateringRequestStatus(id: string | number, status: string): Promise<unknown> {
    return this.request(`/catering/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }
  getCateringContent(lang: string): Promise<unknown> {
    return this.request(`/catering/content?lang=${lang}`);
  }
  updateCateringContent(lang: string, content: Record<string, unknown>): Promise<unknown> {
    return this.request('/catering/content', { method: 'PUT', body: JSON.stringify({ lang, content }) });
  }

  // ── Vacancies ───────────────────────────────────────────────────────────────

  getVacancies(status?: string): Promise<unknown> {
    return this.request(`/vacancies${status ? `?status=${status}` : ''}`);
  }
  getVacancy(id: string | number): Promise<unknown> { return this.request(`/vacancies/${id}`); }
  createVacancy(vacancy: Record<string, unknown>): Promise<unknown> {
    return this.request('/vacancies', { method: 'POST', body: JSON.stringify(vacancy) });
  }
  updateVacancy(id: string | number, vacancy: Record<string, unknown>): Promise<unknown> {
    return this.request(`/vacancies/${id}`, { method: 'PUT', body: JSON.stringify(vacancy) });
  }
  deleteVacancy(id: string | number): Promise<unknown> {
    return this.request(`/vacancies/${id}`, { method: 'DELETE' });
  }

  // ── Applications ────────────────────────────────────────────────────────────

  getApplications(params: Record<string, string>): Promise<unknown> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/applications${query ? '?' + query : ''}`);
  }
  getApplication(id: string | number): Promise<unknown> { return this.request(`/applications/${id}`); }
  createApplication(app: Record<string, unknown>): Promise<unknown> {
    return this.request('/applications', { method: 'POST', body: JSON.stringify(app) });
  }
  updateApplicationStatus(id: string | number, status: string): Promise<unknown> {
    return this.request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }
  updateApplicationNote(id: string | number, note: string): Promise<unknown> {
    return this.request(`/applications/${id}/note`, { method: 'PATCH', body: JSON.stringify({ note }) });
  }
  deleteApplication(id: string | number): Promise<unknown> {
    return this.request(`/applications/${id}`, { method: 'DELETE' });
  }

  // ── FAQ ─────────────────────────────────────────────────────────────────────

  getFaqItems(category?: string): Promise<unknown> {
    return this.request(`/faq${category ? `?category=${category}` : ''}`);
  }
  getFaqItem(id: string | number): Promise<unknown> { return this.request(`/faq/${id}`); }
  createFaqItem(item: Record<string, unknown>): Promise<unknown> {
    return this.request('/faq', { method: 'POST', body: JSON.stringify(item) });
  }
  updateFaqItem(id: string | number, item: Record<string, unknown>): Promise<unknown> {
    return this.request(`/faq/${id}`, { method: 'PUT', body: JSON.stringify(item) });
  }
  deleteFaqItem(id: string | number): Promise<unknown> {
    return this.request(`/faq/${id}`, { method: 'DELETE' });
  }

  // ── Settings ────────────────────────────────────────────────────────────────

  getSettings(): Promise<unknown> { return this.request('/settings'); }
  getSetting(key: string): Promise<unknown> { return this.request(`/settings/${key}`); }
  updateSetting(key: string, value: unknown): Promise<unknown> {
    return this.request(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
  }
  updateSettings(settings: Record<string, unknown>): Promise<unknown> {
    return this.request('/settings', { method: 'PUT', body: JSON.stringify(settings) });
  }
  deleteSetting(key: string): Promise<unknown> {
    return this.request(`/settings/${key}`, { method: 'DELETE' });
  }

  // ── Users ───────────────────────────────────────────────────────────────────

  getUsers(): Promise<unknown> { return this.request('/users'); }
  getUser(id: string | number): Promise<unknown> { return this.request(`/users/${id}`); }
  updateUser(id: string | number, user: Record<string, unknown>): Promise<unknown> {
    return this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) });
  }
  resetUserPassword(id: string | number, password: string): Promise<unknown> {
    return this.request(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) });
  }
  deleteUser(id: string | number): Promise<unknown> {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // ── Activity ────────────────────────────────────────────────────────────────

  getActivityLog(limit = 100, offset = 0): Promise<unknown> {
    return this.request(`/activity?limit=${limit}&offset=${offset}`);
  }
  getActivityForEntity(type: string, id: string | number): Promise<unknown> {
    return this.request(`/activity/${type}/${id}`);
  }

  // ── Pages ───────────────────────────────────────────────────────────────────

  getPages(): Promise<unknown> { return this.request('/pages'); }
  getPage(slug: string): Promise<unknown> { return this.request(`/pages/${slug}`); }
  createPage(page: Record<string, unknown>): Promise<unknown> {
    return this.request('/pages', { method: 'POST', body: JSON.stringify(page) });
  }
  updatePage(id: string | number, page: Record<string, unknown>): Promise<unknown> {
    return this.request(`/pages/${id}`, { method: 'PUT', body: JSON.stringify(page) });
  }
  deletePage(id: string | number): Promise<unknown> {
    return this.request(`/pages/${id}`, { method: 'DELETE' });
  }

  // ── Media ───────────────────────────────────────────────────────────────────

  getMedia(params: Record<string, string>): Promise<unknown> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/media${query ? '?' + query : ''}`);
  }

  uploadMedia(files: File[], categoryId?: string | number): Promise<unknown> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    if (categoryId != null) form.append('category_id', String(categoryId));
    return this.uploadFiles('/media/upload', form);
  }

  updateMediaCategory(id: string | number, categoryId: string | number | null): Promise<unknown> {
    return this.request(`/media/${id}/category`, {
      method: 'PATCH',
      body: JSON.stringify({ category_id: categoryId }),
    });
  }

  deleteMedia(id: string | number): Promise<unknown> {
    return this.request(`/media/${id}`, { method: 'DELETE' });
  }

  bulkDeleteMedia(ids: (string | number)[]): Promise<unknown> {
    return this.request('/media/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
  }

  getMediaCategories(): Promise<unknown> { return this.request('/media/categories'); }

  createMediaCategory(name: string): Promise<unknown> {
    return this.request('/media/categories', { method: 'POST', body: JSON.stringify({ name }) });
  }

  updateMediaCategory2(id: string | number, name: string): Promise<unknown> {
    return this.request(`/media/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
  }

  deleteMediaCategory(id: string | number): Promise<unknown> {
    return this.request(`/media/categories/${id}`, { method: 'DELETE' });
  }
}

export { getServerOrigin };
export default new ApiClient();
