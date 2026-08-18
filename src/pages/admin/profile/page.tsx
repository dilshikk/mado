import { useState, useEffect } from "react";
import { User, Mail, Lock, Shield, Calendar, Save, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import api from "@/lib/api.ts";
import { ROLE_META } from "@/lib/roles.ts";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  last_seen: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
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
      setErrorMsg("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const updated = await api.request('/auth/me', {
        method: 'PUT',
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
      setSuccessMsg("Profile updated successfully");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Never";
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
        <h1 className="text-2xl font-serif font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings and security</p>
      </div>

      {/* Profile card info */}
      {profile && (
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary-foreground">
              {profile.name[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                {ROLE_META[profile.role as keyof typeof ROLE_META]?.name ?? profile.role}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(profile.created_at)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Last seen {formatDate(profile.last_seen)}
              </span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${profile.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
            {profile.status}
          </div>
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={(e) => void handleSave(e)} className="space-y-5">
        {/* Success / Error messages */}
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
            <User className="w-4 h-4 text-muted-foreground" /> Personal Information
          </h2>

          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email Address
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
            <Lock className="w-4 h-4 text-muted-foreground" /> Change Password
            <span className="text-xs text-muted-foreground font-normal">(leave blank to keep current)</span>
          </h2>

          {/* Current password */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Min 6 characters"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                    confirmPassword && confirmPassword !== newPassword ? "border-red-400" : "border-input"
                  }`}
                  placeholder="Repeat new password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
