import { useState } from "react";
import { Upload, Image, Trash2, Copy, Check } from "lucide-react";

type MediaFile = {
  id: string;
  name: string;
  url: string;
  size: string;
  category: string;
};

const SAMPLE_MEDIA: MediaFile[] = [
  { id: "1", name: "mado-breakfast.jpg", url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=60", size: "245 KB", category: "Menu" },
  { id: "2", name: "adana-kebab.jpg", url: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&q=60", size: "312 KB", category: "Menu" },
  { id: "3", name: "baklava.jpg", url: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&q=60", size: "198 KB", category: "Menu" },
  { id: "4", name: "hummus.jpg", url: "https://images.unsplash.com/photo-1554998171-89445e31c52b?w=400&q=60", size: "185 KB", category: "Menu" },
  { id: "5", name: "catering-event.jpg", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60", size: "420 KB", category: "Catering" },
  { id: "6", name: "turkish-tea.jpg", url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=60", size: "156 KB", category: "Beverages" },
  { id: "7", name: "dondurma.jpg", url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=60", size: "230 KB", category: "Desserts" },
  { id: "8", name: "restaurant-interior.jpg", url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=60", size: "540 KB", category: "Brand" },
];

const CATEGORIES = ["All", "Menu", "Catering", "Beverages", "Desserts", "Brand"];

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>(SAMPLE_MEDIA);
  const [filter, setFilter] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);

  const filtered = filter === "All" ? files : files.filter((f) => f.category === filter);

  const handleCopy = (url: string, id: string) => {
    void navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
    const next = new Set(selected);
    next.delete(id);
    setSelected(next);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">{files.length} files</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        }`}
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Drag and drop files here, or click Upload above</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10 MB</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-sm font-semibold text-primary">{selected.size} selected</span>
          <button
            onClick={() => { selected.forEach((id) => handleDelete(id)); }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete selected
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map((file) => (
          <div
            key={file.id}
            onClick={() => toggleSelect(file.id)}
            className={`group relative bg-card border rounded-xl overflow-hidden cursor-pointer transition-all ${
              selected.has(file.id) ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-accent/50"
            }`}
          >
            <div className="aspect-square bg-muted">
              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">{file.size}</span>
                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{file.category}</span>
              </div>
            </div>
            {/* Hover actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(file.url, file.id); }}
                className="p-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-muted"
                title="Copy URL"
              >
                {copied === file.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                className="p-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-destructive/10"
                title="Delete"
              >
                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
            {selected.has(file.id) && (
              <div className="absolute top-2 left-2">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-16 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No media files</p>
          </div>
        )}
      </div>
    </div>
  );
}
