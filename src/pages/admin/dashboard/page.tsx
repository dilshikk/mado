import { useState, useEffect } from "react";
import {
  UtensilsCrossed, MapPin, Inbox, Briefcase,
  TrendingUp, Clock, Users, Tag,
  RefreshCw, AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminUser } from "@/pages/admin/_lib/admin-user-context.tsx";
import type { UserRole } from "@/lib/roles.ts";
import api from "@/lib/api.ts";

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivityEntry = {
  id: number;
  action: string;
  target_type: string | null;
  target_id: number | null;
  details: string | null;
  created_at: string;
  user_name: string | null;
};

type DashboardStats = {
  dishes: number;
  locations: number;
  users: number;
  newRequests: number;
  newApplications: number;
  activeVacancies: number;
  activePromotions: number;
  recentActivity: ActivityEntry[];
};

// ── Quick actions ─────────────────────────────────────────────────────────────

type QuickAction = { label: string; href: string; primary?: boolean };

const QUICK_ACTIONS_BY_ROLE: Record<UserRole, QuickAction[]> = {
  admin: [
    { label: "+ Add Dish",         href: "/admin/menu/dishes",         primary: true },
    { label: "+ Add Location",     href: "/admin/locations" },
    { label: "+ Add Vacancy",      href: "/admin/careers/vacancies" },
    { label: "+ Create Promotion", href: "/admin/promotions" },
    { label: "Manage Users",       href: "/admin/users" },
    { label: "Activity Log",       href: "/admin/activity" },
  ],
  hr: [
    { label: "+ Add Vacancy",     href: "/admin/careers/vacancies",     primary: true },
    { label: "View Applications", href: "/admin/careers/applications" },
  ],
  marketing: [
    { label: "+ Create Promotion", href: "/admin/promotions",  primary: true },
    { label: "View Reviews",       href: "/admin/reviews" },
    { label: "View Requests",      href: "/admin/requests" },
    { label: "Open Media Library", href: "/admin/media" },
  ],
  content_manager: [
    { label: "+ Add Dish",         href: "/admin/menu/dishes",   primary: true },
    { label: "Edit Categories",    href: "/admin/menu/categories" },
    { label: "Edit Pages",         href: "/admin/pages" },
    { label: "Manage FAQ",         href: "/admin/faq" },
    { label: "Open Media Library", href: "/admin/media" },
  ],
  restaurant_manager: [
    { label: "+ Add Location",   href: "/admin/locations",         primary: true },
    { label: "Catering Content", href: "/admin/catering/content" },
    { label: "Catering Requests",href: "/admin/catering/requests" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  create:       "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  update:       "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  delete:       "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  bulk_delete:  "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  bulk_update:  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  upload:       "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  publish:      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  received:     "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  reset_password:"bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  clear:        "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

function actionColor(action: string) {
  return ACTION_COLORS[action] ?? "bg-muted text-muted-foreground";
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

// Stat card config — value filled dynamically from API
type StatCard = {
  label: string;
  key: keyof Omit<DashboardStats, "recentActivity">;
  icon: React.ElementType;
  href: string;
  color: string;
};

const STAT_CARDS: StatCard[] = [
  { label: "Published Dishes",   key: "dishes",           icon: UtensilsCrossed, href: "/admin/menu/dishes",         color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { label: "Open Locations",     key: "locations",        icon: MapPin,          href: "/admin/locations",           color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
  { label: "New Requests",       key: "newRequests",      icon: Inbox,           href: "/admin/requests",            color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  { label: "Active Vacancies",   key: "activeVacancies",  icon: Briefcase,       href: "/admin/careers/vacancies",   color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
  { label: "Admin Users",        key: "users",            icon: Users,           href: "/admin/users",               color: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
  { label: "Active Promotions",  key: "activePromotions", icon: Tag,             href: "/admin/promotions",          color: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { name, role } = useAdminUser();
  const quickActions = QUICK_ACTIONS_BY_ROLE[role] ?? QUICK_ACTIONS_BY_ROLE.admin;

  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data as DashboardStats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadStats(); }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr  = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {greeting}, {name || "Admin"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
        </div>
        <button
          onClick={() => void loadStats()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map((s) => (
          <Link
            key={s.key}
            to={s.href}
            className="group bg-card border border-border rounded-xl p-5 flex items-start justify-between hover:border-accent hover:shadow-sm transition-all"
          >
            <div>
              {loading ? (
                <div className="h-8 w-10 bg-muted animate-pulse rounded mb-1" />
              ) : (
                <p className="text-3xl font-bold text-foreground group-hover:text-accent transition-colors">
                  {stats ? stats[s.key].toLocaleString() : "—"}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.label}</p>
            </div>
            <div className={`p-2.5 rounded-lg shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Recent Activity
            </h2>
            <Link to="/admin/activity" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-8 bg-muted animate-pulse rounded shrink-0" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded shrink-0" />
                  <div className="h-3 flex-1 bg-muted animate-pulse rounded" />
                </div>
              ))
            ) : !stats || stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No activity yet</p>
            ) : stats.recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">{timeAgo(item.created_at)}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${actionColor(item.action)}`}>
                  {item.action}
                </span>
                <p className="text-sm text-foreground/80 truncate">
                  {item.details ?? `${item.action} ${item.target_type ?? ""}${item.target_id ? ` #${item.target_id}` : ""}`}
                </p>
                {item.user_name && (
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{item.user_name}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.href}
                to={a.href}
                className={
                  a.primary
                    ? "w-full block text-center text-sm font-medium px-4 py-2.5 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                    : "w-full block text-center text-sm font-medium px-4 py-2.5 rounded-lg transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }
              >
                {a.label}
              </Link>
            ))}
          </div>

          {/* Mini stats below quick actions */}
          {!loading && stats && (
            <div className="mt-5 pt-4 border-t border-border space-y-1.5">
              {stats.newApplications > 0 && (
                <Link to="/admin/careers/applications" className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground">
                  <span>New applications</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.newApplications}</span>
                </Link>
              )}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Website: Online</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
