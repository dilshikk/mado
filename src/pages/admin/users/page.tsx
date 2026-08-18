import { useEffect, useState } from "react";
import { Shield, Edit2, Plus, KeyRound, Trash2, AlertCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import { ROLES, ROLE_META, type UserRole } from "@/lib/roles.ts";

// ─── Types ──────────────────────────────────────────────────────────────────

type UserStatus = "active" | "blocked";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastSeen: string | null;
};

const STATUS_META: Record<UserStatus, { label: string; color: string }> = {
  active: { label: "Активен", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  blocked: { label: "Заблокирован", color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

function formatLastSeen(iso: string | null): string {
  if (!iso) return "Никогда";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Сейчас";
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ч назад`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return "Вчера";
  if (diffDay < 30) return `${diffDay} дн назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && ROLES.some((r) => r.value === value);
}

function mapUser(item: Record<string, unknown>): TeamMember {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? "Unknown"),
    email: String(item.email ?? ""),
    role: isUserRole(item.role) ? item.role : "content_manager",
    status: (item.status === "blocked" ? "blocked" : "active") as UserStatus,
    lastSeen: item.last_seen ? String(item.last_seen) : null,
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [resetting, setResetting] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState<TeamMember | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, me] = await Promise.all([api.getUsers(), api.getMe()]);
      setUsers(Array.isArray(data) ? (data as Record<string, unknown>[]).map(mapUser) : []);
      setCurrentUserEmail(String((me as Record<string, unknown>).email ?? ""));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load team members";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold">Пользователи и роли</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление доступом команды</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Добавить сотрудника
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Roles */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Роли</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLES.map((role) => (
            <div key={role.value} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", role.color)}>
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
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Сотрудники</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-2 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}

            {!loading &&
              users.map((user) => (
                <div key={user.id} className="group flex items-center justify-between px-5 py-4 hover:bg-muted/30">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary-foreground">{user.name[0]?.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", STATUS_META[user.status].color)}>
                          {STATUS_META[user.status].label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden lg:block">Был на связи: {formatLastSeen(user.lastSeen)}</span>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", ROLE_META[user.role].color)}>
                      {ROLE_META[user.role].name}
                    </span>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing(user)}
                        title="Редактировать сотрудника"
                        className="p-1.5 rounded hover:bg-muted"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setResetting(user)}
                        title="Сбросить пароль"
                        className="p-1.5 rounded hover:bg-muted"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setDeleting(user)}
                        disabled={user.email === currentUserEmail}
                        title={user.email === currentUserEmail ? "Нельзя удалить свою учётную запись" : "Удалить сотрудника"}
                        className="p-1.5 rounded hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {!loading && users.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Пока нет сотрудников</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {creating && (
        <CreateMemberModal
          onClose={() => setCreating(false)}
          onCreated={(user) => {
            setUsers((prev) => [user, ...prev]);
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <EditMemberModal
          member={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setEditing(null);
          }}
        />
      )}

      {resetting && <ResetPasswordModal member={resetting} onClose={() => setResetting(null)} />}

      {deleting && (
        <DeleteMemberModal
          member={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(id) => {
            setUsers((prev) => prev.filter((u) => u.id !== id));
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Shared modal shell ─────────────────────────────────────────────────────

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-serif font-bold">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const fieldCls =
  "w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring";

/** Role picker used by both create & edit modals — 5 roles, shown as a wrapping grid instead of a single row */
function RolePicker({
  value,
  onChange,
  disabled,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {ROLES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
          disabled={disabled}
          className={cn(
            "text-left px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
            value === r.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
          )}
        >
          {r.name}
        </button>
      ))}
    </div>
  );
}

// ─── Create member modal ────────────────────────────────────────────────────

function CreateMemberModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: TeamMember) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("content_manager");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      toast.error("Заполните имя, почту и пароль (минимум 6 символов)");
      return;
    }
    setSubmitting(true);
    try {
      const result = (await api.register(name.trim(), email.trim(), password, role)) as {
        user: Record<string, unknown>;
      };
      toast.success("Сотрудник добавлен");
      onCreated(mapUser(result.user));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось создать сотрудника");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Добавить сотрудника" subtitle="Создать новую учётную запись в админ-панели" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Полное имя</label>
          <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" disabled={submitting} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Почта</label>
          <input
            type="email"
            className={fieldCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            disabled={submitting}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Пароль</label>
          <input
            type="password"
            className={fieldCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 6 символов"
            disabled={submitting}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Роль</label>
          <RolePicker value={role} onChange={setRole} disabled={submitting} />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} disabled={submitting} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Создание…" : "Создать сотрудника"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Edit member modal ───────────────────────────────────────────────────────

function EditMemberModal({
  member,
  onClose,
  onSaved,
}: {
  member: TeamMember;
  onClose: () => void;
  onSaved: (user: TeamMember) => void;
}) {
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState<UserRole>(member.role);
  const [status, setStatus] = useState<UserStatus>(member.status);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Имя обязательно");
      return;
    }
    setSubmitting(true);
    try {
      await api.updateUser(member.id, { name: name.trim(), role, status });
      toast.success("Сотрудник обновлён");
      onSaved({ ...member, name: name.trim(), role, status });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось обновить сотрудника");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Редактировать сотрудника" subtitle={member.email} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Полное имя</label>
          <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Роль</label>
          <RolePicker value={role} onChange={setRole} disabled={submitting} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Статус</label>
          <div className="flex gap-2">
            {(Object.keys(STATUS_META) as UserStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                disabled={submitting}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                  status === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                )}
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} disabled={submitting} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Сохранение…" : "Сохранить изменения"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Reset password modal ────────────────────────────────────────────────────

function ResetPasswordModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }
    setSubmitting(true);
    try {
      await api.resetUserPassword(member.id, password);
      toast.success(`Пароль сброшен для ${member.name}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сбросить пароль");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Сбросить пароль" subtitle={`Для ${member.name} (${member.email})`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Новый пароль</label>
          <input
            type="password"
            className={fieldCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 6 символов"
            disabled={submitting}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} disabled={submitting} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Сброс…" : "Сбросить пароль"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Delete member modal ─────────────────────────────────────────────────────

function DeleteMemberModal({
  member,
  onClose,
  onDeleted,
}: {
  member: TeamMember;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.deleteUser(member.id);
      toast.success(`${member.name} удалён`);
      onDeleted(member.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить сотрудника");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Удалить сотрудника" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Вы уверены, что хотите удалить <span className="font-semibold text-foreground">{member.name}</span> (
          {member.email})? Он сразу потеряет доступ к админ-панели. Это действие нельзя отменить.
        </p>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} disabled={submitting} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">
            Отмена
          </button>
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="flex-1 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Удаление…" : "Удалить сотрудника"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
