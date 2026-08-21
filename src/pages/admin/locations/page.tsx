import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, MapPin, Phone, Clock, ToggleLeft, ToggleRight, Trash2, Globe, X, Save, Loader2, Image } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGS = [
  { code: "ru", flag: "🇷🇺", label: "RU" },
  { code: "uz", flag: "🇺🇿", label: "UZ" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "tr", flag: "🇹🇷", label: "TR" },
] as const;

type LangCode = "ru" | "uz" | "en" | "tr";

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const ALL_SERVICES = ["В зале", "Навынос", "Доставка", "Бронирование", "Мероприятия"];

// ─── Types ────────────────────────────────────────────────────────────────────

type WeekHours = { day: string; open: string; close: string; closed: boolean }[];

type LangFields = { name: string; district: string; address: string };

type Location = {
  id: string;
  langs: Record<LangCode, LangFields>;
  phone: string;
  email: string;
  mapsUrl: string;
  photoUrl: string;
  hours: WeekHours;
  status: "open" | "disabled";
  services: string[];
};

type ApiLocation = {
  id: number;
  name: string;
  name_ru: string | null; name_uz: string | null; name_en: string | null; name_tr: string | null;
  district: string;
  district_ru: string | null; district_uz: string | null; district_en: string | null; district_tr: string | null;
  address: string;
  address_ru: string | null; address_uz: string | null; address_en: string | null; address_tr: string | null;
  phone: string; email: string | null; maps_url: string | null; photo_url: string | null; status: string;
  hours: { day_of_week: number; open_time: string; close_time: string; is_closed: boolean }[];
  services: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultHours = (): WeekHours =>
  DAYS.map((d) => ({ day: d, open: "08:00", close: "22:00", closed: false }));

const emptyLangs = (): Record<LangCode, LangFields> => ({
  ru: { name: "", district: "", address: "" },
  uz: { name: "", district: "", address: "" },
  en: { name: "", district: "", address: "" },
  tr: { name: "", district: "", address: "" },
});

function fromApi(loc: ApiLocation): Location {
  const hours: WeekHours = DAYS.map((day, i) => {
    const h = loc.hours.find((x) => x.day_of_week === i);
    return { day, open: h?.open_time?.slice(0, 5) ?? "08:00", close: h?.close_time?.slice(0, 5) ?? "22:00", closed: h?.is_closed ?? false };
  });
  return {
    id: String(loc.id),
    langs: {
      ru: { name: loc.name_ru ?? loc.name, district: loc.district_ru ?? loc.district, address: loc.address_ru ?? loc.address },
      uz: { name: loc.name_uz ?? "", district: loc.district_uz ?? "", address: loc.address_uz ?? "" },
      en: { name: loc.name_en ?? "", district: loc.district_en ?? "", address: loc.address_en ?? "" },
      tr: { name: loc.name_tr ?? "", district: loc.district_tr ?? "", address: loc.address_tr ?? "" },
    },
    phone: loc.phone, email: loc.email ?? "", mapsUrl: loc.maps_url ?? "", photoUrl: loc.photo_url ?? "",
    status: loc.status === "open" ? "open" : "disabled",
    hours, services: loc.services,
  };
}

function toApiPayload(loc: Omit<Location, "id">) {
  return {
    name_ru: loc.langs.ru.name, name_uz: loc.langs.uz.name, name_en: loc.langs.en.name, name_tr: loc.langs.tr.name,
    district_ru: loc.langs.ru.district, district_uz: loc.langs.uz.district, district_en: loc.langs.en.district, district_tr: loc.langs.tr.district,
    address_ru: loc.langs.ru.address, address_uz: loc.langs.uz.address, address_en: loc.langs.en.address, address_tr: loc.langs.tr.address,
    phone: loc.phone, email: loc.email || null, maps_url: loc.mapsUrl || null, photo_url: loc.photoUrl || null,
    status: loc.status, services: loc.services,
    hours: loc.hours.map((h, i) => ({ day_of_week: i, open_time: h.open, close_time: h.close, is_closed: h.closed })),
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ModalMode = "add" | "edit" | null;

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [hoursModal, setHoursModal] = useState<Location | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Location | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getLocations() as ApiLocation[];
      setLocations(data.map(fromApi));
    } catch {
      toast.error("Не удалось загрузить филиалы");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadLocations(); }, [loadLocations]);

  const openAdd = () => {
    setEditTarget({ id: "", langs: emptyLangs(), phone: "", email: "", mapsUrl: "", photoUrl: "", hours: defaultHours(), status: "open", services: ["В зале"] });
    setModalMode("add");
  };

  const openEdit = (loc: Location) => {
    setEditTarget({ ...loc, hours: loc.hours.map((h) => ({ ...h })) });
    setModalMode("edit");
  };

  const handleSave = async () => {
    if (!editTarget) return;
    if (!editTarget.langs.ru.name || !editTarget.langs.ru.district || !editTarget.langs.ru.address || !editTarget.phone) {
      toast.error("Заполните обязательные поля (минимум вкладка RU)");
      return;
    }
    try {
      setSaving(true);
      const payload = toApiPayload(editTarget);
      if (modalMode === "add") { await api.createLocation(payload); toast.success("Филиал добавлен"); }
      else { await api.updateLocation(editTarget.id, payload); toast.success("Филиал обновлён"); }
      setModalMode(null); setEditTarget(null);
      await loadLocations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить филиал");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.deleteLocation(deleteConfirm.id);
      toast.success(`"${deleteConfirm.langs.ru.name || deleteConfirm.langs.en.name}" удалён`);
      setDeleteConfirm(null);
      await loadLocations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить филиал");
    }
  };

  const toggle = async (loc: Location) => {
    const newStatus = loc.status === "open" ? "disabled" : "open";
    try {
      setToggling(loc.id);
      await api.updateLocation(loc.id, toApiPayload({ ...loc, status: newStatus }));
      setLocations((prev) => prev.map((l) => l.id === loc.id ? { ...l, status: newStatus } : l));
    } catch { toast.error("Не удалось обновить статус"); }
    finally { setToggling(null); }
  };

  const handleSaveHours = async (loc: Location, hours: WeekHours) => {
    try {
      await api.updateLocation(loc.id, toApiPayload({ ...loc, hours }));
      toast.success("Часы обновлены"); setHoursModal(null);
      await loadLocations();
    } catch { toast.error("Не удалось обновить часы"); }
  };

  const openCount = locations.filter((l) => l.status === "open").length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Филиалы</h1>
          <p className="text-sm text-muted-foreground mt-1">{loading ? "Загрузка…" : `${locations.length} филиалов · ${openCount} открыто`}</p>
        </div>
        <button onClick={openAdd} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Добавить филиал
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border rounded-xl h-64 animate-pulse" />)}
        </div>
      )}

      {!loading && locations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <MapPin className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium">Нет филиалов</p>
          <p className="text-sm mt-1">Нажмите "Добавить филиал" чтобы создать первый</p>
        </div>
      )}

      {!loading && locations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => {
            const displayName = loc.langs.ru.name || loc.langs.en.name;
            const displayDistrict = loc.langs.ru.district || loc.langs.en.district;
            const displayAddress = loc.langs.ru.address || loc.langs.en.address;
            const filledLangs = LANGS.filter((l) => loc.langs[l.code].name).map((l) => l.flag);

            return (
              <div key={loc.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-colors">
                {loc.photoUrl ? (
                  <img src={loc.photoUrl} alt={displayName} className="w-full h-40 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-28 bg-muted flex items-center justify-center">
                    <Image className="w-7 h-7 text-muted-foreground/25" />
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-lg text-foreground truncate">{displayName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{displayDistrict}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {filledLangs.map((flag, i) => <span key={i} className="text-sm">{flag}</span>)}
                      <button
                        onClick={() => toggle(loc)}
                        disabled={toggling === loc.id}
                        className="ml-2"
                        title={loc.status === "open" ? "Закрыть" : "Открыть"}
                      >
                        {toggling === loc.id
                          ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          : loc.status === "open"
                            ? <ToggleRight className="w-6 h-6 text-emerald-600" />
                            : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" /><span className="truncate">{displayAddress}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0 text-accent" /><span>{loc.phone}</span></div>
                    {loc.hours.length > 0 && (
                      <button
                        onClick={() => setHoursModal(loc)}
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0 text-accent" />
                        <span>{loc.hours.find((h) => !h.closed)?.open ?? "—"} – {loc.hours.find((h) => !h.closed)?.close ?? "—"}</span>
                      </button>
                    )}
                    {loc.mapsUrl && (
                      <a href={loc.mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <Globe className="w-3.5 h-3.5 shrink-0 text-accent" />
                        <span className="text-xs">Посмотреть на карте</span>
                      </a>
                    )}
                  </div>

                  {loc.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {loc.services.map((s) => (
                        <span key={s} className="text-[10px] font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-full">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => openEdit(loc)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> Редактировать
                    </button>
                    <button onClick={() => setDeleteConfirm(loc)}
                      className="p-2 border border-border rounded-lg hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Add modal */}
      {(modalMode === "add" || modalMode === "edit") && editTarget && (
        <LocationModal
          mode={modalMode}
          location={editTarget}
          onChange={setEditTarget}
          onSave={() => { void handleSave(); }}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          saving={saving}
        />
      )}

      {/* Hours modal */}
      {hoursModal && (
        <HoursModal
          location={hoursModal}
          onSave={(hours) => { void handleSaveHours(hoursModal, hours); }}
          onClose={() => setHoursModal(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <h2 className="font-serif font-bold text-lg mb-2">Удалить филиал?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              «{deleteConfirm.langs.ru.name || deleteConfirm.langs.en.name}» будет удалён безвозвратно.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">
                Отмена
              </button>
              <button onClick={() => { void handleDelete(); }}
                className="flex-1 py-2.5 text-sm font-medium bg-destructive text-white rounded-lg hover:bg-destructive/90">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Location Modal ───────────────────────────────────────────────────────────

function LocationModal({
  mode, location, onChange, onSave, onClose, saving,
}: {
  mode: "add" | "edit";
  location: Location;
  onChange: (loc: Location) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [activeLang, setActiveLang] = useState<LangCode>("ru");

  const cur = location.langs[activeLang];
  const photoValid = location.photoUrl.startsWith("http");

  const setLangField = (field: keyof LangFields, value: string) =>
    onChange({ ...location, langs: { ...location.langs, [activeLang]: { ...cur, [field]: value } } });

  const toggleService = (s: string) => {
    const services = location.services.includes(s)
      ? location.services.filter((x) => x !== s)
      : [...location.services, s];
    onChange({ ...location, services });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4 z-10">
          <h2 className="font-serif font-bold text-lg">{mode === "add" ? "Добавить филиал" : "Редактировать филиал"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">URL фото ресторана</label>
            <input
              value={location.photoUrl}
              onChange={(e) => onChange({ ...location, photoUrl: e.target.value })}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {photoValid && (
              <div className="mt-2 rounded-lg overflow-hidden border border-border h-36">
                <img src={location.photoUrl} alt="Preview" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Язык контента</p>
            <div className="flex gap-2">
              {LANGS.map((l) => {
                const filled = !!location.langs[l.code].name;
                return (
                  <button key={l.code} onClick={() => setActiveLang(l.code)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative",
                      activeLang === l.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                    <span>{l.flag}</span> {l.label}
                    {filled && activeLang !== l.code && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />}
                  </button>
                );
              })}
            </div>
            {activeLang === "ru" && <p className="text-xs text-muted-foreground mt-1.5">* RU обязателен. Остальные языки — опционально.</p>}
          </div>

          <div className="space-y-4 bg-muted/30 rounded-xl p-4">
            <Field label={`Название филиала${activeLang === "ru" ? " *" : ""}`} value={cur.name} onChange={(v) => setLangField("name", v)} placeholder={activeLang === "ru" ? "например, MADO Ташкент — Мирабад" : "e.g. MADO Tashkent — Mirabad"} />
            <Field label={`Район${activeLang === "ru" ? " *" : ""}`} value={cur.district} onChange={(v) => setLangField("district", v)} placeholder={activeLang === "ru" ? "например, Мирабад" : "e.g. Mirabad"} />
            <Field label={`Полный адрес${activeLang === "ru" ? " *" : ""}`} value={cur.address} onChange={(v) => setLangField("address", v)} placeholder={activeLang === "ru" ? "Улица, квартал, город" : "Street, block, city"} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Телефон *" value={location.phone} onChange={(v) => onChange({ ...location, phone: v })} placeholder="+998 71 ..." />
            <Field label="Email" value={location.email} onChange={(v) => onChange({ ...location, email: v })} placeholder="branch@madouz.uz" />
          </div>
          <Field label="Google Maps URL" value={location.mapsUrl} onChange={(v) => onChange({ ...location, mapsUrl: v })} placeholder="https://maps.google.com/..." />

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Услуги</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SERVICES.map((s) => (
                <button key={s} onClick={() => toggleService(s)}
                  className={cn("px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                    location.services.includes(s) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Отмена</button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hours Modal ──────────────────────────────────────────────────────────────

function HoursModal({ location, onSave, onClose }: { location: Location; onSave: (hours: WeekHours) => void; onClose: () => void }) {
  const [hours, setHours] = useState<WeekHours>(location.hours.map((h) => ({ ...h })));
  const [sameHours, setSameHours] = useState(true);

  const setAll = (field: "open" | "close", value: string) => setHours(hours.map((h) => ({ ...h, [field]: value })));
  const setDay = (i: number, field: "open" | "close" | "closed", value: string | boolean) =>
    setHours(hours.map((h, idx) => idx === i ? { ...h, [field]: value } : h));

  const displayName = location.langs.ru.name || location.langs.en.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4">
          <h2 className="font-serif font-bold">{displayName}</h2>
          <p className="text-sm text-muted-foreground">Часы работы</p>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={sameHours} onChange={(e) => setSameHours(e.target.checked)} className="rounded" />
            <span className="text-sm font-medium">Одинаковые часы каждый день</span>
          </label>
          {sameHours ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Открывается</label>
                <input type="time" value={hours[0].open} onChange={(e) => setAll("open", e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Закрывается</label>
                <input type="time" value={hours[0].close} onChange={(e) => setAll("close", e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {hours.map((h, i) => (
                <div key={h.day} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-24 shrink-0">{h.day.slice(0, 3)}</span>
                  <label className="flex items-center gap-1 cursor-pointer shrink-0">
                    <input type="checkbox" checked={h.closed} onChange={(e) => setDay(i, "closed", e.target.checked)} className="rounded" />
                    <span className="text-xs text-muted-foreground">Закрыто</span>
                  </label>
                  {!h.closed && (
                    <>
                      <input type="time" value={h.open} onChange={(e) => setDay(i, "open", e.target.value)} className="flex-1 px-2 py-1.5 text-xs border border-input rounded-lg bg-background focus:outline-none" />
                      <span className="text-muted-foreground text-xs">–</span>
                      <input type="time" value={h.close} onChange={(e) => setDay(i, "close", e.target.value)} className="flex-1 px-2 py-1.5 text-xs border border-input rounded-lg bg-background focus:outline-none" />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Отмена</button>
          <button onClick={() => onSave(hours)} className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg">Сохранить часы</button>
        </div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
