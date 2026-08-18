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
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import { canAccessSection, ROLE_META, type NavSectionKey, type UserRole } from "@/lib/roles.ts";
import { AdminUserContext } from "@/pages/admin/_lib/admin-user-context.tsx";

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
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin", section: "dashboard" },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Pages", icon: FileText, href: "/admin/pages", section: "pages" },
      {
        label: "Menu",
        icon: UtensilsCrossed,
        section: "menu",
        children: [
          { label: "Categories", href: "/admin/menu/categories" },
          { label: "Dishes", href: "/admin/menu/dishes" },
        ],
      },
      { label: "Locations", icon: MapPin, href: "/admin/locations", section: "locations" },
      {
        label: "Catering",
        icon: PartyPopper,
        section: "catering",
        children: [
          { label: "Content", href: "/admin/catering/content" },
          { label: "Requests", href: "/admin/catering/requests" },
        ],
      },
      { label: "Promotions", icon: Tag, href: "/admin/promotions", section: "promotions" },
      { label: "Media", icon: Image, href: "/admin/media", section: "media" },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { label: "Requests", icon: Inbox, href: "/admin/requests", section: "requests" },
      {
        label: "Careers",
        icon: Briefcase,
        section: "careers",
        children: [
          { label: "Vacancies", href: "/admin/careers/vacancies" },
          { label: "Applications", href: "/admin/careers/applications" },
        ],
      },
      { label: "Reviews", icon: Star, href: "/admin/reviews", section: "reviews" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "FAQ", icon: HelpCircle, href: "/admin/faq", section: "faq" },
      { label: "Users & Roles", icon: Users, href: "/admin/users", section: "users" },
      { label: "Activity Log", icon: Activity, href: "/admin/activity", section: "activity" },
      { label: "Settings", icon: Settings, href: "/admin/settings", section: "settings" },
    ],
  },
];

const ACTION_COLORS: Record<string, string> = {
  create:      "bg-emerald-100 text-emerald-700",
  update:      "bg-blue-100 text-blue-700",
  delete:      "bg-red-100 text-red-700",
  received:    "bg-amber-100 text-amber-700",
  upload:      "bg-violet-100 text-violet-700",
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
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
  // Restore collapsed state from localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"; }
    catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: UserRole; email?: string } | null>(null);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<NotificationEntry[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // Persist collapsed state
  const handleToggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next)); }
    catch { /* ignore */ }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin/login', { state: { from: location } });
        return;
      }
      try {
        const me = (await api.getMe()) as { name?: string; role?: string; email?: string };
        setCurrentUser({ name: me.name ?? '', role: (me.role as UserRole) ?? 'content_manager', email: me.email });
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('token');
        api.clearToken();
        navigate('/admin/login', { state: { from: location } });
      }
    };
    void checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load notifications and compute unread badge
  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await api.request('/activity?limit=12&offset=0') as { data: NotificationEntry[] };
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
      /* ignore */
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Initial badge count on mount
  useEffect(() => {
    if (isAuthenticated) void loadNotifications();
  }, [isAuthenticated, loadNotifications]);

  // Close notifications on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpenNotifications = async () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) {
      await loadNotifications();
      // Mark as seen
      try { localStorage.setItem(NOTIFICATIONS_SEEN_KEY, new Date().toISOString()); }
      catch { /* ignore */ }
      setUnreadCount(0);
    }
  };

  const visibleNavSections = useMemo(() => {
    if (!currentUser) return [];
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessSection(currentUser.role, item.section)),
    })).filter((section) => section.items.length > 0);
  }, [currentUser]);

  const handleLogout = () => {
    setLoggingOut(true);
    api.clearToken();
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  if (isAuthenticated === null || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const sidebar = (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <span className="font-serif text-accent-foreground text-sm font-bold">M</span>
        </div>
        {!collapsed && (
          <div>
            <div className="font-serif text-sidebar-foreground font-bold text-base leading-none">MADO</div>
            <div className="text-xs text-sidebar-foreground/50 mt-0.5">Admin Panel</div>
          </div>
        )}
        <button
          onClick={handleToggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto p-1.5 rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed
            ? <PanelLeftOpen className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {visibleNavSections.map((section) => (
          <div key={section.title}>
            {section.title && !collapsed && (
              <p className="text-[10px] font-semibold text-sidebar-foreground/40 tracking-widest uppercase px-3 mb-2">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItemComponent key={item.label} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Back to site</span>}
        </button>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{loggingOut ? "Logging out..." : "Logout"}</span>}
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
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 relative hidden sm:block max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="ml-auto flex items-center gap-1">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => void handleOpenNotifications()}
                  className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-accent text-accent-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="text-sm font-semibold">Recent Activity</span>
                      <button
                        onClick={() => { setNotifOpen(false); navigate("/admin/activity"); }}
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                      >
                        View all
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
                        <div className="text-center py-8 text-sm text-muted-foreground">No activity yet</div>
                      ) : notifItems.map((item) => (
                        <div key={item.id} className="px-4 py-3 hover:bg-muted/40 transition-colors">
                          <div className="flex items-start gap-2">
                            <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5", ACTION_COLORS[item.action] ?? "bg-muted text-muted-foreground")}>
                              {item.action}
                            </span>
                            <p className="text-sm text-foreground/80 leading-snug flex-1">{item.details ?? `${item.action} ${item.target_type ?? ""}`}</p>
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

              {/* Profile button */}
              <button
                onClick={() => navigate("/admin/profile")}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                title="My Profile"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">
                    {currentUser.name[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
                <span className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <span className="text-[10px] text-muted-foreground">{ROLE_META[currentUser.role]?.name}</span>
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
              </button>
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
