import { useState } from "react";
import { Plus, Edit2, MapPin, Phone, Clock, ToggleLeft, ToggleRight, Trash2, Globe, X, Save } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type Location = {
  id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  mapsUrl: string;
  hours: WeekHours;
  status: "open" | "disabled";
  services: string[];
};

type WeekHours = { day: string; open: string; close: string; closed: boolean }[];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_SERVICES = ["Dine-in", "Takeaway", "Delivery", "Reservation", "Events"];

const defaultHours = (): WeekHours =>
  DAYS.map((d) => ({ day: d, open: "08:00", close: "02:00", closed: false }));

const INITIAL_LOCATIONS: Location[] = [
  {
    id: "1",
    name: "MADO Tashkent — Chilanzar",
    district: "Chilanzar",
    address: "Chilanzar district, 3rd block, Tashkent",
    phone: "+998 71 123 45 67",
    email: "chilanzar@madouz.uz",
    mapsUrl: "https://maps.google.com",
    hours: defaultHours(),
    status: "open",
    services: ["Dine-in", "Takeaway", "Delivery"],
  },
  {
    id: "2",
    name: "MADO Tashkent — Yunusabad",
    district: "Yunusabad",
    address: "Yunusabad district, 11th block, Tashkent",
    phone: "+998 71 234 56 78",
    email: "yunusabad@madouz.uz",
    mapsUrl: "https://maps.google.com",
    hours: (() => { const h = defaultHours(); h[6].open = "09:00"; return h; })(),
    status: "open",
    services: ["Dine-in", "Takeaway"],
  },
  {
    id: "3",
    name: "MADO Tashkent — Mirzo Ulugbek",
    district: "Mirzo Ulugbek",
    address: "Mirzo Ulugbek district, Tashkent",
    phone: "+998 71 345 67 89",
    email: "mirzo@madouz.uz",
    mapsUrl: "https://maps.google.com",
    hours: defaultHours(),
    status: "open",
    services: ["Dine-in"],
  },
];

type ModalMode = "add" | "edit" | null;

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [hoursModal, setHoursModal] = useState<Location | null>(null);

  const openAdd = () => {
    setEditTarget({
      id: "",
      name: "",
      district: "",
      address: "",
      phone: "",
      email: "",
      mapsUrl: "",
      hours: defaultHours(),
      status: "open",
      services: ["Dine-in"],
    });
    setModalMode("add");
  };

  const openEdit = (loc: Location) => {
    setEditTarget({ ...loc, hours: loc.hours.map((h) => ({ ...h })) });
    setModalMode("edit");
  };

  const handleSave = () => {
    if (!editTarget) return;
    if (modalMode === "add") {
      setLocations([...locations, { ...editTarget, id: Date.now().toString() }]);
    } else {
      setLocations(locations.map((l) => l.id === editTarget.id ? editTarget : l));
    }
    setModalMode(null);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => setLocations(locations.filter((l) => l.id !== id));

  const toggle = (id: string) => {
    setLocations(locations.map((l) => l.id === id ? { ...l, status: l.status === "open" ? "disabled" : "open" } : l));
  };

  const openCount = locations.filter((l) => l.status === "open").length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Locations</h1>
          <p className="text-sm text-muted-foreground mt-1">{locations.length} branches · {openCount} open</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-card border border-border rounded-xl p-5 space-y-4 hover:border-accent/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="min-w-0 pr-3">
                <h3 className="font-semibold text-foreground truncate">{loc.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {loc.district}
                </p>
              </div>
              <span className={cn(
                "shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full",
                loc.status === "open"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
              )}>
                {loc.status === "open" ? "● Open" : "○ Disabled"}
              </span>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="text-xs">{loc.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 shrink-0" /> {loc.phone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs">
                  {loc.hours[0].open} – {loc.hours[0].close} (daily)
                </span>
              </div>
              {loc.mapsUrl && (
                <a href={loc.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs">View on Google Maps</span>
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {loc.services.map((s) => (
                <span key={s} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => openEdit(loc)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => setHoursModal(loc)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Clock className="w-3.5 h-3.5" /> Hours
              </button>
              <button
                onClick={() => toggle(loc.id)}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                title={loc.status === "open" ? "Disable" : "Enable"}
              >
                {loc.status === "open"
                  ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                  : <ToggleLeft className="w-4 h-4 text-red-500" />}
              </button>
              <button
                onClick={() => handleDelete(loc.id)}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit modal */}
      {(modalMode === "add" || modalMode === "edit") && editTarget && (
        <LocationFormModal
          mode={modalMode}
          location={editTarget}
          onChange={setEditTarget}
          onSave={handleSave}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
        />
      )}

      {/* Working hours modal */}
      {hoursModal && (
        <HoursModal
          location={hoursModal}
          onSave={(hours) => {
            setLocations(locations.map((l) => l.id === hoursModal.id ? { ...l, hours } : l));
            setHoursModal(null);
          }}
          onClose={() => setHoursModal(null)}
        />
      )}
    </div>
  );
}

function LocationFormModal({
  mode, location, onChange, onSave, onClose,
}: {
  mode: "add" | "edit";
  location: Location;
  onChange: (l: Location) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = (key: keyof Location, value: string) => onChange({ ...location, [key]: value });
  const toggleService = (s: string) => {
    const has = location.services.includes(s);
    onChange({
      ...location,
      services: has ? location.services.filter((x) => x !== s) : [...location.services, s],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4">
          <h2 className="font-serif font-bold text-lg">{mode === "add" ? "Add Location" : "Edit Location"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Branch Name" value={location.name} onChange={(v) => set("name", v)} placeholder="e.g. MADO Tashkent — Mirabad" />
          <Field label="District" value={location.district} onChange={(v) => set("district", v)} placeholder="e.g. Mirabad" />
          <Field label="Full Address" value={location.address} onChange={(v) => set("address", v)} placeholder="Street, block, city" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" value={location.phone} onChange={(v) => set("phone", v)} placeholder="+998 71 ..."/>
            <Field label="Email" value={location.email} onChange={(v) => set("email", v)} placeholder="branch@madouz.uz" />
          </div>
          <Field label="Google Maps URL" value={location.mapsUrl} onChange={(v) => set("mapsUrl", v)} placeholder="https://maps.google.com/..." />
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Services</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SERVICES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleService(s)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                    location.services.includes(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Cancel</button>
          <button onClick={onSave} className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

function HoursModal({
  location,
  onSave,
  onClose,
}: {
  location: Location;
  onSave: (hours: WeekHours) => void;
  onClose: () => void;
}) {
  const [hours, setHours] = useState<WeekHours>(location.hours.map((h) => ({ ...h })));
  const [sameHours, setSameHours] = useState(true);

  const setAll = (field: "open" | "close", value: string) =>
    setHours(hours.map((h) => ({ ...h, [field]: value })));

  const setDay = (i: number, field: "open" | "close" | "closed", value: string | boolean) =>
    setHours(hours.map((h, idx) => idx === i ? { ...h, [field]: value } : h));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4">
          <h2 className="font-serif font-bold">{location.name}</h2>
          <p className="text-sm text-muted-foreground">Working hours</p>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={sameHours} onChange={(e) => setSameHours(e.target.checked)} className="rounded" />
            <span className="text-sm font-medium">Same hours every day</span>
          </label>

          {sameHours ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Opens</label>
                <input type="time" value={hours[0].open} onChange={(e) => setAll("open", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Closes</label>
                <input type="time" value={hours[0].close} onChange={(e) => setAll("close", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {hours.map((h, i) => (
                <div key={h.day} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-20 shrink-0">{h.day.slice(0, 3)}</span>
                  <label className="flex items-center gap-1 cursor-pointer shrink-0">
                    <input type="checkbox" checked={h.closed} onChange={(e) => setDay(i, "closed", e.target.checked)} className="rounded" />
                    <span className="text-xs text-muted-foreground">Closed</span>
                  </label>
                  {!h.closed && (
                    <>
                      <input type="time" value={h.open} onChange={(e) => setDay(i, "open", e.target.value)}
                        className="flex-1 px-2 py-1.5 text-xs border border-input rounded-lg bg-background focus:outline-none" />
                      <span className="text-muted-foreground text-xs">–</span>
                      <input type="time" value={h.close} onChange={(e) => setDay(i, "close", e.target.value)}
                        className="flex-1 px-2 py-1.5 text-xs border border-input rounded-lg bg-background focus:outline-none" />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Cancel</button>
          <button onClick={() => onSave(hours)} className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg">Save Hours</button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
