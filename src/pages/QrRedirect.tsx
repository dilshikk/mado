import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Use the bundled legacy worker so no separate file is needed
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDF_URL = "https://mado.uz/uploads/menu.pdf";

export default function QrRedirect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [total, setTotal] = useState(0);
  const [rendered, setRendered] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const pdf = await pdfjsLib.getDocument({
          url: PDF_URL,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist/cmaps/",
          cMapPacked: true,
        }).promise;

        if (cancelled) return;
        setTotal(pdf.numPages);
        setLoading(false);

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) break;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: window.devicePixelRatio > 1 ? 2 : 1.5 });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.display = "block";
          canvas.style.marginBottom = "8px";

          await page.render({ canvasContext: ctx, viewport }).promise;

          if (!cancelled) {
            containerRef.current?.appendChild(canvas);
            setRendered(i);
          }
        }
      } catch (e) {
        console.error("PDF load error", e);
        if (!cancelled) setError(true);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <p className="text-gray-600">Не удалось загрузить меню.</p>
        <a
          href={PDF_URL}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm"
        >
          Скачать PDF
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800">Меню Mado</span>
        {!loading && (
          <span className="text-xs text-gray-400">
            {rendered} / {total} стр.
          </span>
        )}
        <a
          href={PDF_URL}
          download
          className="text-xs text-gray-500 underline"
        >
          Скачать
        </a>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Загружаем меню…</p>
          </div>
        </div>
      )}

      {/* Pages rendered as canvas */}
      <div
        ref={containerRef}
        className="max-w-2xl mx-auto px-2 py-4"
      />
    </div>
  );
}
