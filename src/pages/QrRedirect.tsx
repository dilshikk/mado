const PDF_URL = "https://mado.uz/uploads/menu.pdf";

/**
 * /qr — embeds the menu PDF directly in the page.
 * Works on iOS Safari, Android Chrome, and desktop without any external service.
 * When the digital menu at /menu is ready, replace this page with a redirect.
 */
export default function QrRedirect() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <iframe
        src={PDF_URL}
        title="Меню Mado"
        className="flex-1 w-full border-0"
        allow="fullscreen"
      />
    </div>
  );
}
