import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils.ts";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { label: string; href: string }[];
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Pages", icon: FileText, href: "/admin/pages" },
      {
        label: "Menu",
        icon: UtensilsCrossed,
        children: [
          { label: "Categories", href: "/admin/menu/categories" },
          { label: "Dishes", href: "/admin/menu/dishes" },
        ],
      },
      { label: "Locations", icon: MapPin, href: "/admin/locations" },
      {
        label: "Catering",
        icon: PartyPopper,
        children: [
          { label: "Content", href: "/admin/catering/content" },
          { label: "Requests", href: "/admin/catering/requests" },
        ],
      },
      { label: "Promotions", icon: Tag, href: "/admin/promotions" },
      { label: "Media", icon: Image, href: "/admin/media" },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { label: "Requests", icon: Inbox, href: "/admin/requests" },
      {
        label: "Careers",
        icon: Briefcase,
        children: [
          { label: "Vacancies", href: "/admin/careers/vacancies" },
          { label: "Applications", href: "/admin/careers/applications" },
        ],
      },
      { label: "Reviews", icon: Star, href: "/admin/reviews" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "FAQ", icon: HelpCircle, href: "/admin/faq" },
      { label: "Users & Roles", icon: Users, href: "/admin/users" },
      { label: "Activity Log", icon: Activity, href: "/admin/activity" },
      { label: "Settings", icon: Settings, href: "/admin/settings" },
    ],
  },
];

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

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

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
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
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
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Back to site</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">{sidebar}</div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
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

          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
            <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">D</span>
              </div>
              <span className="hidden sm:block text-sm font-medium">Dilshot</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
