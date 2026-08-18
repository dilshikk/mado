import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { canAccessSection, type NavSectionKey } from "@/lib/roles.ts";
import { useAdminUser } from "@/pages/admin/_lib/admin-user-context.tsx";

/**
 * Wrap a page's content with this to enforce role-based access at the page level.
 * This is a defense-in-depth / UX measure — the server (see server/src/middleware/auth.js
 * `authorize([...])`) is the real security boundary. This guard just prevents a page's
 * content from rendering at all for a role that shouldn't see it (e.g. a stale bookmark,
 * a role change, or a direct URL visit), instead of relying only on the sidebar being hidden.
 */
export default function RoleGuard({
  section,
  children,
}: {
  section: NavSectionKey;
  children: React.ReactNode;
}) {
  const currentUser = useAdminUser();

  if (!canAccessSection(currentUser.role, section)) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 max-w-md mx-auto">
        <div className="p-3 rounded-full bg-red-100 dark:bg-red-950 mb-4">
          <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-lg font-serif font-bold text-foreground">Доступ запрещён</h1>
        <p className="text-sm text-muted-foreground mt-2">
          У вашей роли нет доступа к этому разделу. Если это ошибка, обратитесь к главному администратору.
        </p>
        <Link
          to="/admin"
          className="mt-5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
