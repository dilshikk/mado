import { Shield, Edit2 } from "lucide-react";

const ROLES = [
  { name: "Super Admin", description: "Full access to all features", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  { name: "Content Manager", description: "Menu, Pages, Media, Translations, SEO", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  { name: "Restaurant Manager", description: "Locations, Reservations, Requests, Reviews", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  { name: "HR", description: "Careers, Applications", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  { name: "Marketing", description: "Promotions, Pages, Media", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
];

const USERS = [
  { name: "Dilshot", email: "dilshot@madouz.uz", role: "Super Admin", lastSeen: "Now" },
  { name: "Kamola", email: "kamola@madouz.uz", role: "Content Manager", lastSeen: "2h ago" },
  { name: "Jasur", email: "jasur@madouz.uz", role: "Restaurant Manager", lastSeen: "Yesterday" },
];

export default function UsersPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold">Users & Roles</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage team access</p>
      </div>

      {/* Roles */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLES.map((role) => (
            <div key={role.name} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${role.color} shrink-0`}>
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{role.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Team Members</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {USERS.map((user) => (
              <div key={user.email} className="group flex items-center justify-between px-5 py-4 hover:bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">{user.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground hidden sm:block">Last seen: {user.lastSeen}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{user.role}</span>
                  <button className="p-1.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
