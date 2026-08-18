import { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Shield, Calendar, Save, Eye, EyeOff, CheckCircle2, AlertTriangle, Camera, Loader2 } from "lucide-react";
import api from "@/lib/api.ts";
import { ROLE_META } from "@/lib/roles.ts";
import { AdminUserContext } from "@/pages/admin/_lib/admin-user-context.tsx";
import { useContext } from "react";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  last_seen: string | null;
  created_at: string;
  avatar_url?: string | null;
};

function AvatarCircle({
  src,
  name,
  size = "lg",
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = {
    sm: "w-7 h-7 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-2xl",
    xl: "w-20 h-20 text-3xl",
  }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-primary flex items-center justify-center shrink-0`}>
      <span className="font-bold text-primary-foreground">
        {name[0]?.toUpperCase() ?? "?"}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ctx = useContext(AdminUserContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const me = await api.getMe() as UserProfile;
      setProfile(me);
      setName(me.name);
      setEmail(me.email);
    } catch {
      setErrorMsg("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setErrorMsg(null);
    try {
      const result = await api.uploadAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatar_url: result.avatar_url } : prev);
      if (ctx) {
        (ctx as { avatar_url?: string }).avatar_url = result.avatar_url;
      }
      setSuccessMsg("Фото профиля обновлено!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("Новые пароли не совпадают");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setErrorMsg("Минимум 6 символов");
      return;
    }

    setSaving(true);
    try {
      const updated = await api.request("/auth/me", {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      }) as UserProfile;

      setProfile(updated);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Профиль успешно обновлён");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Не удалось обновить профиль");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Никогда";
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold">Мой профиль</h1>
        <p className="text-sm text-muted-foreground mt-1">Управление настройками и безопасностью аккаунта</p>
      </div>

      {/* Profile card info */}
      {profile && (
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
          <div className="relative shrink-0 group">
            <AvatarCircle src={profile.avatar_url} name={profile.name} size="xl" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
              title="Изменить фото"
            >
              {avatarUploading
                ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                : <Camera className="w-6 h-6 text-white" />
              }
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void handleAvatarChange(e)}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="mt-1.5 text-xs text-primary hover:underline cursor-pointer disabled:opacity-50"
            >
              {avatarUploading ? "Загрузка..." : profile.avatar_url ? "Изменить фото" : "Загрузить фото"}
            </button>

            <div className="flex flex-wrap gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                {ROLE_META[profile.role as keyof typeof ROLE_META]?.name ?? profile.role}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Зарегистрирован {formatDate(profile.created_at)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Последний раз в сети {formatDate(profile.last_seen)}
              </span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${profile.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-100 text-red-700"}`}>
            {profile.status}
          </div>
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={(e) => void handleSave(e)} className="space-y-5">
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* Personal info */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" /> Личная информация
          </h2>

          <div className="space-y-1">
            <label className="text-sm font-medium">Полное имя</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ваше имя"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Адрес email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Change password */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" /> Изменить пароль
            <span className="text-xs text-muted-foreground font-normal">(оставьте пустым для сохранения)</span>
          </h2>

          <div className="space-y-1">
            <label className="text-sm font-medium">Текущий пароль</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Введите текущий пароль"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Новый пароль</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Минимум 6 символов"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Подтвердите пароль</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                    confirmPassword && confirmPassword !== newPassword ? "border-red-400" : "border-input"
                  }`}
                  placeholder="Повторите пароль"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500">Пароли не совпадают</p>
              )}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </div>
  );
}
