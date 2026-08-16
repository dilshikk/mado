import { UtensilsCrossed, MapPin, Inbox, Briefcase, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Dishes", value: "128", icon: UtensilsCrossed, href: "/admin/menu/dishes", color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { label: "Locations", value: "8", icon: MapPin, href: "/admin/locations", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
  { label: "New Requests", value: "14", icon: Inbox, href: "/admin/requests", color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  { label: "Vacancies", value: "6", icon: Briefcase, href: "/admin/careers/vacancies", color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
];

const recentActivity = [
  { time: "06:42", text: "Price updated — Pistachio Kebab: 99,000 → 109,000 UZS", type: "edit" },
  { time: "06:30", text: "New catering request #124 — Corporate event, 120 guests", type: "new" },
  { time: "06:10", text: "New job application — Dilshod Shomuratov (Waiter)", type: "new" },
  { time: "05:58", text: "Review approved — ⭐ 5.0 by Anonymous", type: "approve" },
  { time: "05:30", text: "Menu published — From The Oven (updated 3 items)", type: "publish" },
];

const quickActions = [
  { label: "+ Add Dish", href: "/admin/menu/dishes", color: "bg-primary text-primary-foreground hover:bg-primary/90" },
  { label: "+ Add Location", href: "/admin/locations", color: "bg-secondary text-secondary-foreground hover:bg-secondary/80" },
  { label: "+ Add Vacancy", href: "/admin/careers/vacancies", color: "bg-secondary text-secondary-foreground hover:bg-secondary/80" },
  { label: "+ Create Promotion", href: "/admin/promotions", color: "bg-secondary text-secondary-foreground hover:bg-secondary/80" },
];

const typeColors: Record<string, string> = {
  edit: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  new: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  approve: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  publish: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};

export default function AdminDashboard() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">
          {greeting}, Dilshot
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.href}
            className="group bg-card border border-border rounded-xl p-5 flex items-start justify-between hover:border-accent hover:shadow-sm transition-all"
          >
            <div>
              <p className="text-3xl font-bold text-foreground group-hover:text-accent transition-colors">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${s.color}`}>
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
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono w-10">{item.time}</span>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${typeColors[item.type]}`}
                >
                  {item.type}
                </span>
                <p className="text-sm text-foreground/80">{item.text}</p>
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
                key={a.label}
                to={a.href}
                className={`w-full block text-center text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${a.color}`}
              >
                {a.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Website Status: Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
