/**
 * Public API client — no auth token required.
 * Used by public-facing pages to fetch page metadata.
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000/api";

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const publicApi = {
  getPage: (slug: string) => publicFetch<PageData>(`/pages/${encodeURIComponent(slug)}`),
};

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
  // Multilingual meta fields (added via migration)
  meta_title_ru: string | null;
  meta_title_uz: string | null;
  meta_title_en: string | null;
  meta_title_tr: string | null;
  meta_description_ru: string | null;
  meta_description_uz: string | null;
  meta_description_en: string | null;
  meta_description_tr: string | null;
};
