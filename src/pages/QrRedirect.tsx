import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Use CDN worker — avoids build-time bundling issues on Android Chrome
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PDF_URL = "https://mado.uz/uploads/menu.pdf";

export default function QrRedirect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [rendered, setRendered] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: PDF_URL,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          enableXfa: false,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setTotal(pdf.numPages);
        setLoading(false);

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) break;

          const page = await pdf.getPage(i);
          // Scale to fit mobile width
          const scale = Math.min(window.innerWidth / page.getViewport({ scale: 1 }).width, 2);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.display = "block";
          canvas.style.marginBottom = "4px";
          canvas.style.backgroundColor = "#fff";

          await page.render({ canvasContext: ctx, viewport }).promise;

          if (!cancelled && containerRef.current) {
            containerRef.current.appendChild(canvas);
            setRendered(i);
          }
        }
      } catch (e) {
        console.error("PDF load error", e);
        if (!cancelled) setError(String(e));
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <p className="text-gray-600 text-sm">Не удалось загрузить меню.</p>
        <a
          href={PDF_URL}
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium"
        >
          Открыть PDF
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800 text-sm">Меню Mado</span>
        <div className="flex items-center gap-3">
          {!loading && total > 0 && (
            <span className="text-xs text-gray-400">{rendered} / {total} стр.</span>
          )}
          <a
            href={PDF_URL}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-500 underline"
          >
            Скачать
          </a>
        </div>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Загружаем меню…</p>
          </div>
        </div>
      )}

      {/* Canvas pages */}
      <div ref={containerRef} className="max-w-2xl mx-auto" />
    </div>
  );
}
