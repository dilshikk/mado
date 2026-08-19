import { useEffect } from "react";
import { usePage } from "@/hooks/use-page-meta.ts";
import type { LangCode } from "@/hooks/use-language.ts";
import type { PageData } from "@/lib/public-api.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMetaTitle(page: PageData, lang: LangCode): string {
  const langKey = `meta_title_${lang}` as keyof PageData;
  const langVal = page[langKey];
  if (langVal && typeof langVal === "string" && langVal.trim()) return langVal;

  if (page.meta_title?.trim()) return page.meta_title;

  const titleKey = `title_${lang}` as keyof PageData;
  const titleVal = page[titleKey];
  if (titleVal && typeof titleVal === "string" && titleVal.trim()) return titleVal;

  return page.title;
}

function getMetaDescription(page: PageData, lang: LangCode): string {
  const langKey = `meta_description_${lang}` as keyof PageData;
  const langVal = page[langKey];
  if (langVal && typeof langVal === "string" && langVal.trim()) return langVal;

  return page.meta_description ?? "";
}

function getOgTitle(page: PageData, lang: LangCode): string {
  const langKey = `meta_title_${lang}` as keyof PageData;
  const langVal = page[langKey];
  if (langVal && typeof langVal === "string" && langVal.trim()) return langVal;
  return page.meta_title ?? page.title;
}

function setMetaTag(name: string, content: string, attr: "name" | "property" = "name") {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PageMetaProps {
  /** The page slug (empty string "" for home page) */
  slug: string;
  /** Current language */
  lang: LangCode;
}

/**
 * Imperatively sets document.title and meta tags based on page data.
 * Should be rendered once per page, near the top of each public page component.
 * Returns null — no DOM output.
 */
export default function PageMeta({ slug, lang }: PageMetaProps) {
  const result = usePage(slug);

  useEffect(() => {
    if (result.status !== "ok") return;
    const page = result.data;

    const title = getMetaTitle(page, lang);
    const description = getMetaDescription(page, lang);
    const ogTitle = getOgTitle(page, lang);
    const ogImage = page.og_image ?? "";

    document.title = title;
    setMetaTag("description", description);
    setMetaTag("og:title", ogTitle, "property");
    setMetaTag("og:description", description, "property");
    if (ogImage) setMetaTag("og:image", ogImage, "property");
  }, [result, lang]);

  return null;
}

// ─── Re-export helper to get translated page title for hero h1 ────────────────

export function getPageTitle(page: PageData | null, lang: LangCode, fallback: string): string {
  if (!page) return fallback;
  const key = `title_${lang}` as keyof PageData;
  const val = page[key];
  if (val && typeof val === "string" && val.trim()) return val;
  return page.title || fallback;
}
