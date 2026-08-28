import { useEffect } from "react";

const PDF_URL = "https://mado.uz/uploads/menu.pdf";

// Google Docs viewer renders the PDF inside the browser on any device.
// Direct PDF links are downloaded on Android instead of being shown.
const VIEWER_URL = `https://docs.google.com/viewer?url=${encodeURIComponent(PDF_URL)}&embedded=true`;

/**
 * /qr — opens the menu PDF via Google Docs Viewer (works on iOS & Android).
 * When the digital menu at /menu is ready, replace VIEWER_URL with "/menu".
 */
export default function QrRedirect() {
  useEffect(() => {
    window.location.replace(VIEWER_URL);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-500 text-sm">Открываем меню…</p>
    </div>
  );
}
