import { createContext, useContext } from "react";
import type { UserRole } from "@/lib/roles.ts";

export type AdminUser = { name: string; role: UserRole; email?: string; avatar_url?: string };

/** Set by AdminLayout once the current user is loaded. Consumed by RoleGuard and any page that needs the role. */
export const AdminUserContext = createContext<AdminUser | null>(null);

export function useAdminUser(): AdminUser {
  const ctx = useContext(AdminUserContext);
  if (!ctx) {
    throw new Error("useAdminUser must be used within AdminLayout");
  }
  return ctx;
}
