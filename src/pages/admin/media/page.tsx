import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload, Trash2, Copy, Check, Search, X, ChevronLeft,
  ChevronRight, Pencil, Plus, FolderOpen, ImageIcon, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaCategory = { id: number; name: string };

type MediaFile = {
  id: number;
  filename: string;
  file_url: string;   // relative (/uploads/...) or absolute URL
  file_size: number | null;
  file_type: string | null;
  category_id: number | null;
  category_name: string | null;
  created_at: string;
};

type MediaResponse = {
  files: MediaFile[];
  total: number;
  page: number;
  limit: number;
};

const PAGE_SIZE = 24;

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Copy text to clipboard.
 * Uses the modern Clipboard API when available (https / localhost),
 * and falls back to the legacy execCommand approach for plain http sites.
 */
function copyToClipboard(text: string): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
  } else {
    legacyCopy(text);
  }
}

function legacyCopy(text: string): void {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({
  onFiles,
  uploading,
  categories,
  uploadCategoryId,
  setUploadCategoryId,
}: {
  onFiles: (files: File[]) => void;
  uploading: boolean;
  categories: MediaCategory[];
  uploadCategoryId: string;
  setUploadCategoryId: (v: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length) onFiles(files);
    else toast.error("Только изображения (JPG, PNG, WEBP, GIF)");
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer select-none",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        uploading && "pointer-events-none opacity-60",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleInput}
      />

      <div className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
        dragging ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10",
      )}>
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <Upload className={cn("h-6 w-6 transition-colors", dragging ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">
          {uploading ? "Загрузка..." : dragging ? "Отпустите файлы" : "Перетащите файлы или нажмите"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPG, WEBP, GIF · до 10 МБ · несколько файлов
        </p>
      </div>

      {/* Category selector inside drop zone */}
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="text-xs text-muted-foreground">Категория:</label>
        <select
          value={uploadCategoryId}
          onChange={(e) => setUploadCategoryId(e.target.value)}
          className="text-xs border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">— без категории —</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({
  file,
  files,
  onClose,
  onNavigate,
}: {
  file: MediaFile;
  files: MediaFile[];
  onClose: () => void;
  onNavigate: (f: MediaFile) => void;
}) {
  const idx = files.findIndex((f) => f.id === file.id);
  const fullUrl = api.getFileUrl(file.file_url);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && idx < files.length - 1) onNavigate(files[idx + 1]);
      if (e.key === "ArrowLeft" && idx > 0) onNavigate(files[idx - 1]);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [idx, files, onClose, onNavigate]);

  const copyUrl = () => {
    copyToClipboard(fullUrl);
    toast.success("URL скопирован");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] max-w-4xl w-full mx-4 flex-col bg-card rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="text-sm font-semibold truncate max-w-xs">{file.filename}</p>
          <div className="flex gap-2">
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-muted hover:bg-muted/80 text-muted-foreground font-medium cursor-pointer"
            >
              <Copy className="w-3 h-3" /> Скопировать URL
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative flex-1 bg-muted/30 flex items-center justify-center overflow-hidden min-h-[300px]">
          <img
            src={fullUrl}
            alt={file.filename}
            className="max-h-[65vh] max-w-full object-contain"
          />

          {idx > 0 && (
            <button
              onClick={() => onNavigate(files[idx - 1])}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur border border-border hover:bg-card cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {idx < files.length - 1 && (
            <button
              onClick={() => onNavigate(files[idx + 1])}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur border border-border hover:bg-card cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex gap-6 text-xs text-muted-foreground flex-wrap">
          <span>Размер: {formatSize(file.file_size)}</span>
          <span>Тип: {file.file_type ?? "—"}</span>
          {file.category_name && <span>Категория: {file.category_name}</span>}
          <span>Загружен: {new Date(file.created_at).toLocaleDateString("ru-RU")}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Categories Manager Modal ─────────────────────────────────────────────────

function CategoriesModal({
  categories,
  onClose,
  onRefresh,
}: {
  categories: MediaCategory[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await api.createMediaCategory(newName.trim());
      setNewName("");
      onRefresh();
      toast.success("Категория создана");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await api.updateMediaCategory2(id, editName.trim());
      setEditId(null);
      onRefresh();
      toast.success("Категория обновлена");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteMediaCategory(id);
      onRefresh();
      toast.success("Категория удалена");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold">Управление категориями</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Add new */}
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Новая категория..."
              className="flex-1 text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить
            </button>
          </div>

          {/* List */}
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Нет категорий</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 bg-background"
                >
                  {editId === cat.id ? (
                    <>
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(cat.id);
                          if (e.key === "Escape") setEditId(null);
                        }}
                        className="flex-1 text-sm bg-transparent border-b border-primary outline-none"
                      />
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        disabled={saving}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="p-1 text-muted-foreground hover:bg-muted rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium">{cat.name}</span>
                      <button
                        onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                        className="p-1 text-muted-foreground hover:bg-muted rounded cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1 text-destructive hover:bg-destructive/10 rounded cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Категория <strong>{cat.name}</strong> будет удалена.
                              Файлы в ней останутся, но потеряют категорию.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cat.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaPage() {
  // ── Data ──
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MediaCategory[]>([]);

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");

  // ── UI ──
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);
  const [preview, setPreview] = useState<MediaFile | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadCategoryId, setUploadCategoryId] = useState("");

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await api.getMediaCategories();
      setCategories(Array.isArray(result) ? (result as MediaCategory[]) : []);
    } catch { /* silent */ }
  }, []);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_SIZE),
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterCategoryId) params.category_id = filterCategoryId;

      const result = await api.getMedia(params);
      const data = result as MediaResponse;
      setFiles(data.files ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось загрузить файлы");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterCategoryId]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadFiles(); }, [loadFiles]);

  // ── Upload ──
  const handleUpload = async (newFiles: File[]) => {
    setUploading(true);
    try {
      const catId = uploadCategoryId || undefined;
      await api.uploadMedia(newFiles, catId);
      toast.success(`Загружено ${newFiles.length} файл(ов)`);
      setPage(1);
      loadFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: number) => {
    try {
      await api.deleteMedia(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
      setTotal((t) => t - 1);
      toast.success("Файл удалён");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    try {
      await api.bulkDeleteMedia(ids);
      setFiles((prev) => prev.filter((f) => !ids.includes(f.id)));
      setTotal((t) => t - ids.length);
      setSelected(new Set());
      toast.success(`Удалено ${ids.length} файл(ов)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  };

  // ── Copy URL ──
  const handleCopy = (fileUrl: string, id: number) => {
    const fullUrl = api.getFileUrl(fileUrl);
    copyToClipboard(fullUrl);
    setCopied(id);
    toast.success("URL скопирован");
    setTimeout(() => setCopied(null), 1500);
  };

  // ── Select ──
  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const selectAll = () => setSelected(new Set(files.map((f) => f.id)));
  const clearSelection = () => setSelected(new Set());

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  return (
    <div className="space-y-5 max-w-6xl">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold">Медиатека</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} файл{total === 1 ? "" : total < 5 ? "а" : "ов"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategories(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" /> Категории
          </button>
        </div>
      </div>

      {/* ── Drop zone ── */}
      <DropZone
        onFiles={handleUpload}
        uploading={uploading}
        categories={categories}
        uploadCategoryId={uploadCategoryId}
        setUploadCategoryId={setUploadCategoryId}
      />

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer">
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setFilterCategoryId(""); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              filterCategoryId === "" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setFilterCategoryId(String(cat.id)); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filterCategoryId === String(cat.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bulk bar ── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl flex-wrap">
          <span className="text-sm font-semibold text-primary">{selected.size} выбрано</span>
          <button onClick={clearSelection} className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer">
            Сбросить
          </button>
          <button onClick={selectAll} className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer">
            Выбрать всё
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 font-medium cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" /> Удалить выбранные
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить {selected.size} файл(а)?</AlertDialogTitle>
                <AlertDialogDescription>
                  Файлы будут удалены безвозвратно с сервера.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Загрузка...
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="text-sm">Файлов не найдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {files.map((file) => {
            const imgSrc = api.getFileUrl(file.file_url);
            return (
              <div
                key={file.id}
                className={cn(
                  "group relative bg-card border rounded-xl overflow-hidden transition-all",
                  selected.has(file.id)
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-accent/60",
                )}
              >
                {/* Checkbox */}
                <div
                  onClick={() => toggleSelect(file.id)}
                  className="absolute top-1.5 left-1.5 z-10 cursor-pointer"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    selected.has(file.id)
                      ? "bg-primary border-primary"
                      : "border-white/70 bg-black/20 group-hover:border-white",
                  )}>
                    {selected.has(file.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </div>

                {/* Image */}
                <div
                  className="aspect-square bg-muted cursor-zoom-in"
                  onClick={() => setPreview(file)}
                >
                  <img
                    src={imgSrc}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-[11px] font-medium text-foreground truncate">{file.filename}</p>
                  <div className="flex items-center justify-between mt-0.5 gap-1 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">{formatSize(file.file_size)}</span>
                    {file.category_name && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded truncate max-w-[70px]">
                        {file.category_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover actions */}
                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(file.file_url, file.id); }}
                    className="p-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-muted cursor-pointer"
                    title="Скопировать URL"
                  >
                    {copied === file.id
                      ? <Check className="w-3 h-3 text-emerald-600" />
                      : <Copy className="w-3 h-3 text-muted-foreground" />}
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-destructive/10 cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить файл?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>{file.filename}</strong> будет удалён безвозвратно.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(file.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            Страница {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Preview modal ── */}
      {preview && (
        <PreviewModal
          file={preview}
          files={files}
          onClose={() => setPreview(null)}
          onNavigate={setPreview}
        />
      )}

      {/* ── Categories modal ── */}
      {showCategories && (
        <CategoriesModal
          categories={categories}
          onClose={() => setShowCategories(false)}
          onRefresh={loadCategories}
        />
      )}
    </div>
  );
}
