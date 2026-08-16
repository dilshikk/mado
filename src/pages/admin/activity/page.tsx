import { Clock } from "lucide-react";

const LOG = [
  { time: "16 Aug 06:42", user: "Dilshot", action: "changed price", target: "Pistachio Kebab", detail: "99,000 → 109,000 UZS", type: "edit" },
  { time: "16 Aug 06:30", user: "Dilshot", action: "published menu section", target: "From The Oven", detail: "3 dishes updated", type: "publish" },
  { time: "16 Aug 06:10", user: "System", action: "received application", target: "Dilshod Shomuratov", detail: "Waiter position", type: "new" },
  { time: "16 Aug 05:58", user: "Kamola", action: "approved review", target: "Anna K.", detail: "⭐ 5.0", type: "approve" },
  { time: "15 Aug 14:20", user: "Dilshot", action: "added location", target: "MADO Mirzo Ulugbek", detail: "New branch", type: "new" },
  { time: "15 Aug 11:00", user: "Kamola", action: "updated page", target: "Our Story", detail: "Hero section edited", type: "edit" },
  { time: "14 Aug 09:15", user: "Jasur", action: "confirmed catering", target: "Request #122", detail: "Alex Kim · 50 guests", type: "approve" },
];

const TYPE_COLORS: Record<string, string> = {
  edit: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  publish: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  new: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  approve: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

export default function ActivityPage() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Full history of admin actions</p>
      </div>

      <div className="space-y-3">
        {LOG.map((entry, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">{entry.user[0]}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{entry.user}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${TYPE_COLORS[entry.type]}`}>{entry.type}</span>
              </div>
              <p className="text-sm text-foreground/80 mt-0.5">
                {entry.action} — <span className="font-medium">{entry.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">{entry.detail}</p>
            </div>
            <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> {entry.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
