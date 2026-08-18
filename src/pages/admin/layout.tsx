import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  MapPin,
  PartyPopper,
  Briefcase,
  HelpCircle,
  Image,
  Tag,
  Star,
  Search as SearchIcon,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Users,
  Settings,
  FileText,
  Activity,
  Inbox,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  UserCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import { canAccessSection, ROLE_META, type NavSectionKey, type UserRole } from "@/lib/roles.ts";
import { AdminUserContext, type AdminUser } from "@/pages/admin/_lib/admin-user-context.tsx";

// ── Types ─────────────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  section: NavSectionKey;
  children?: { label: string; href: string }[];
};

type NotificationEntry = {
  id: number;
  action: string;
  target_type: string | null;
  details: string | null;
  created_at: string;
  user_name: string | null;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SIDEBAR_COLLAPSED_KEY = "mado_admin_sidebar_collapsed";
const NOTIFICATIONS_SEEN_KEY = "mado_admin_notifications_seen_at";

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "",
    items: [
      { label: "Дашборд", icon: LayoutDashboard, href: "/admin", section: "dashboard" },
    ],
  },
  {
    title: "КОНТЕНТ",
    items: [
      { label: "Страницы", icon: FileText, href: "/admin/pages", section: "pages" },
      {
        label: "Меню",
        icon: UtensilsCrossed,
        section: "menu",
        children: [
          { label: "Категории", href: "/admin/menu/categories" },
          { label: "Блюда", href: "/admin/menu/dishes" },
        ],
      },
      { label: "Филиалы", icon: MapPin, href: "/admin/locations", section: "locations" },
      {
        label: "Кейтеринг",
        icon: PartyPopper,
        section: "catering",
        children: [
          { label: "Контент", href: "/admin/catering/content" },
          { label: "Заявки", href: "/admin/catering/requests" },
        ],
      },
      { label: "Акции", icon: Tag, href: "/admin/promotions", section: "promotions" },
      { label: "Медиатека", icon: Image, href: "/admin/media", section: "media" },
    ],
  },
  {
    title: "БИЗНЕС",
    items: [
      { label: "Заявки", icon: Inbox, href: "/admin/requests", section: "requests" },
      {
        label: "Вакансии",
        icon: Briefcase,
        section: "careers",
        children: [
          { label: "Вакансии", href: "/admin/careers/vacancies" },
          { label: "Отклики", href: "/admin/careers/applications" },
        ],
      },
      { label: "Отзывы", icon: Star, href: "/admin/reviews", section: "reviews" },
    ],
  },
  {
    title: "СИСТЕМА",
    items: [
      { label: "FAQ", icon: HelpCircle, href: "/admin/faq", section: "faq" },
      { label: "Пользователи и роли", icon: Users, href: "/admin/users", section: "users" },
      { label: "Журнал действий", icon: Activity, href: "/admin/activity", section: "activity" },
      { label: "Настройки", icon: Settings, href: "/admin/settings", section: "settings" },
    ],
  },
];

const ACTION_COLORS: Record<string, string> = {
  create:   "bg-emerald-100 text-emerald-700",
  update:   "bg-blue-100 text-blue-700",
  delete:   "bg-red-100 text-red-700",
  received: "bg-amber-100 text-amber-700",
  upload:   "bg-violet-100 text-violet-700",
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return `${diff} с назад`;
  if (diff < 3600)  return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

// ── UserAvatar ────────────────────────────────────────────────────────────────

function UserAvatar({ user, size = "sm" }: { user: AdminUser; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-primary flex items-center justify-center shrink-0`}>
      <span className="font-bold text-primary-foreground">
        {user.name[0]?.toUpperCase() ?? "?"}
      </span>
    </div>
  );
}

// ── NavItemComponent ──────────────────────────────────────────────────────────

function NavItemComponent({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const [open, setOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            open && "text-sidebar-foreground bg-sidebar-accent"
          )}
        >
          <item.icon className="shrink-0 w-4 h-4" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="mt-1 ml-7 space-y-1">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )
                }
              >
                <ChevronRight className="w-3 h-3" />
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href!}
      end={item.href === "/admin"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        )
      }
    >
      <item.icon className="shrink-0 w-4 h-4" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

// ── AdminLayout ───────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"; }
    catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<NotificationEntry[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleToggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next)); }
    catch { /* ignore */ }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login", { state: { from: location } });
        return;
      }
      try {
        const me = (await api.getMe()) as { name?: string; role?: string; email?: string; avatar_url?: string };
        setCurrentUser({
          name: me.name ?? "",
          role: (me.role as UserRole) ?? "content_manager",
          email: me.email,
          avatar_url: me.avatar_url,
        });
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("token");
        api.clearToken();
        navigate("/admin/login", { state: { from: location } });
      }
    };
    void checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for avatar updates from profile page via custom event
  useEffect(() => {
    const handler = (e: CustomEvent<{ avatar_url: string }>) => {
      setCurrentUser((prev) => prev ? { ...prev, avatar_url: e.detail.avatar_url } : prev);
    };
    window.addEventListener("mado:avatar-updated", handler as EventListener);
    return () => window.removeEventListener("mado:avatar-updated", handler as EventListener);
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await api.request("/activity?limit=12&offset=0") as { data: NotificationEntry[] };
      const items = res.data ?? [];
      setNotifItems(items);
      const seenAt = localStorage.getItem(NOTIFICATIONS_SEEN_KEY);
      if (!seenAt) {
        setUnreadCount(items.length);
      } else {
        const seenDate = new Date(seenAt);
        setUnreadCount(items.filter((n) => new Date(n.created_at) > seenDate).length);
      }
    } catch {
      // ignore
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleOpenNotifications = async () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    setProfileOpen(false);
    if (opening) {
      await loadNotifications();
      localStorage.setItem(NOTIFICATIONS_SEEN_KEY, new Date().toISOString());
      setUnreadCount(0);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      localStorage.removeItem("token");
      api.clearToken();
      navigate("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter nav sections based on role
  const visibleSections = useMemo(() => {
    if (!currentUser) return [];
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessSection(currentUser.role, item.section)),
    })).filter((section) => section.items.length > 0);
  }, [currentUser]);

  if (isAuthenticated === null || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const sidebar = (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-4 border-b border-sidebar-border", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0">
          <span className="font-serif text-white text-sm font-bold">M</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-serif font-bold text-sidebar-foreground text-sm leading-tight">MADO</p>
            <p className="text-[10px] text-sidebar-foreground/50 leading-tight">Панель управления</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {visibleSections.map((section) => (
          <div key={section.title}>
            {section.title && !collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItemComponent key={item.href ?? item.section} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className={cn("px-2 py-3 border-t border-sidebar-border", collapsed && "flex flex-col items-center")}>
        <button
          onClick={handleToggleCollapsed}
          className={cn(
            "flex items-center gap-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer",
            collapsed ? "justify-center p-1.5" : "px-2 py-2 w-full"
          )}
          title={collapsed ? "Развернуть" : "Свернуть"}
        >
          {collapsed
            ? <PanelLeftOpen className="shrink-0 w-4 h-4" />
            : <><PanelLeftClose className="shrink-0 w-4 h-4" /><span>Свернуть</span></>
          }
        </button>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            "w-full mt-1 flex items-center gap-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50",
            collapsed ? "justify-center p-1.5" : "px-2 py-2"
          )}
          title={collapsed ? "Выйти" : undefined}
        >
          <LogOut className="shrink-0 w-4 h-4" />
          {!collapsed && <span>{loggingOut ? "Выход..." : "Выйти"}</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <AdminUserContext.Provider value={currentUser}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">{sidebar}</div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="relative z-10">{sidebar}</div>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex items-center gap-4 px-4 md:px-6 py-3 border-b border-border bg-card">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 relative hidden sm:block max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Поиск..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="ml-auto flex items-center gap-1">
              {/* ── Notifications ── */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => void handleOpenNotifications()}
                  className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Уведомления"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-accent text-accent-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="text-sm font-semibold">Последние действия</span>
                      <button
                        onClick={() => { setNotifOpen(false); navigate("/admin/activity"); }}
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer"
                      >
                        Смотреть все
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {notifLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="px-4 py-3 flex gap-3">
                            <div className="w-6 h-5 bg-muted animate-pulse rounded shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                              <div className="h-2.5 w-1/3 bg-muted animate-pulse rounded" />
                            </div>
                          </div>
                        ))
                      ) : notifItems.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">Пока нет активности</div>
                      ) : notifItems.map((item) => (
                        <div key={item.id} className="px-4 py-3 hover:bg-muted/40 transition-colors">
                          <div className="flex items-start gap-2">
                            <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5", ACTION_COLORS[item.action] ?? "bg-muted text-muted-foreground")}>
                              {item.action}
                            </span>
                            <p className="text-sm text-foreground/80 leading-snug flex-1 truncate">
                              {item.details ?? `${item.action} ${item.target_type ?? ""}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {timeAgo(item.created_at)}
                            {item.user_name && <span className="ml-1">· {item.user_name}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Profile dropdown ── */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  title="Аккаунт"
                >
                  <UserAvatar user={currentUser} size="sm" />
                  <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium">{currentUser.name}</span>
                    <span className="text-[10px] text-muted-foreground">{ROLE_META[currentUser.role]?.name}</span>
                  </span>
                  <ChevronDown className={cn("w-3 h-3 text-muted-foreground hidden sm:block transition-transform", profileOpen && "rotate-180")} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* User info header */}
                    <div className="px-4 py-3.5 border-b border-border flex items-center gap-3">
                      <UserAvatar user={currentUser} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser.email ?? "—"}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{ROLE_META[currentUser.role]?.name}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                      <button
                        onClick={() => { setProfileOpen(false); navigate("/admin/profile"); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors cursor-pointer text-left"
                      >
                        <UserCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                        Мой профиль
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); navigate("/admin/settings"); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors cursor-pointer text-left"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
                        Настройки
                      </button>
                    </div>

                    <div className="p-1.5 border-t border-border">
                      <button
                        onClick={() => { setProfileOpen(false); handleLogout(); }}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50 text-left"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {loggingOut ? "Выход..." : "Выйти"}
                      </button>
                    </div>

                    <div className="p-1.5 border-t border-border">
                      <button
                        onClick={() => { setProfileOpen(false); navigate("/"); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-left"
                      >
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        Перейти на сайт
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminUserContext.Provider>
  );
}
