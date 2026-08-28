import { useEffect } from "react";

const PDF_URL = "https://mado.uz/uploads/menu.pdf";

/**
 * /qr — instantly redirects to the printed menu PDF.
 * When the digital menu at /menu is ready, update PDF_URL to point there.
 */
export default function QrRedirect() {
  useEffect(() => {
    window.location.replace(PDF_URL);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-500 text-sm">Открываем меню…</p>
    </div>
  );
}
