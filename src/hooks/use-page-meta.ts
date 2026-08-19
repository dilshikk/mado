import { useEffect, useState } from "react";
import { publicApi, type PageData } from "@/lib/public-api.ts";

type UsePageResult =
  | { status: "loading"; data: null }
  | { status: "ok"; data: PageData }
  | { status: "error"; data: null };

/**
 * Fetches page metadata by slug from the public API.
 * Slug "" corresponds to the home page.
 */
export function usePage(slug: string): UsePageResult {
  const [result, setResult] = useState<UsePageResult>({ status: "loading", data: null });

  useEffect(() => {
    setResult({ status: "loading", data: null });
    publicApi
      .getPage(slug)
      .then((data) => setResult({ status: "ok", data }))
      .catch(() => setResult({ status: "error", data: null }));
  }, [slug]);

  return result;
}
