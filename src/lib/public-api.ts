/**
 * Public API client — no auth token required.
 * Used by public-facing pages to fetch page metadata and live menu data.
 *
 * Default base URL is '/api' (relative).
 * See src/lib/api.ts for VITE_API_URL usage notes.
 */

function resolveBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (!raw) return '/api';
  return raw.replace(/\/+$/, ''); // strip trailing slashes
}

const BASE_URL = resolveBaseUrl();

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const publicApi = {
  getPage: (slug: string) => publicFetch<PageData>(`/pages/${encodeURIComponent(slug)}`),
  getCategories: () => publicFetch<PublicCategory[]>('/categories'),
  getDishes: (params?: Record<string, string>) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return publicFetch<PublicDish[]>(`/dishes${query ? `?${query}` : ''}`);
  },
};

/**
 * Resolve a possibly-relative file URL (e.g. `/uploads/x.jpg`) to an absolute one.
 * Loopback/localhost URLs are stripped to a root-relative path so Nginx or
 * Vite proxy serves them correctly regardless of who is accessing the page.
 */
export function getPublicFileUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return '';

  if (/^https?:\/\//i.test(fileUrl)) {
    try {
      const parsed = new URL(fileUrl);
      const isLocal =
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname === 'localhost' ||
        (typeof window !== 'undefined' && parsed.hostname === window.location.hostname);
      if (isLocal) {
        return parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      // Not a valid URL
    }
    return fileUrl;
  }

  return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageData = {
  id: number;
  title: string;
  title_ru: string | null;
  title_uz: string | null;
  title_en: string | null;
  title_tr: string | null;
  slug: string;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  meta_title_ru: string | null;
  meta_title_uz: string | null;
  meta_title_en: string | null;
  meta_title_tr: string | null;
  meta_description_ru: string | null;
  meta_description_uz: string | null;
  meta_description_en: string | null;
  meta_description_tr: string | null;
};

export type PublicCategory = {
  id: number;
  label: string;
  label_ru: string | null;
  label_uz: string | null;
  label_en: string | null;
  label_tr: string | null;
  tab: string;
  image_url: string | null;
  position: number;
  dishCount: number;
};

export type PublicDish = {
  id: number;
  category_id: number;
  name_ru: string;
  name_uz: string | null;
  name_en: string | null;
  name_tr: string | null;
  description_ru: string | null;
  description_uz: string | null;
  description_en: string | null;
  description_tr: string | null;
  price: string | number;
  image_url: string | null;
  status: string;
  is_new: boolean;
  is_signature: boolean;
  is_vegetarian: boolean;
  is_spicy: boolean;
  category: string;
  category_label_ru: string | null;
  category_label_uz: string | null;
  category_label_en: string | null;
  category_label_tr: string | null;
  tab: string;
};
