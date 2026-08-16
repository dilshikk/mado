import { useState } from "react";
import { Plus, Edit2, Trash2, GripVertical, Check, X, ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type FaqCategory = "General" | "Catering" | "Menu" | "Careers";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
};

const CATEGORIES: FaqCategory[] = ["General", "Catering", "Menu", "Careers"];

const CAT_COLORS: Record<FaqCategory, string> = {
  General: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Catering: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  Menu: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Careers: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
};

const INITIAL: FaqItem[] = [
  { id: "1", question: "What types of events do you cater?", answer: "We cater all types of events including corporate events, weddings, birthdays, conferences, and private parties.", category: "Catering" },
  { id: "2", question: "Can you handle dietary requirements?", answer: "Yes, we offer vegetarian, vegan, halal, and gluten-free options. Please specify your requirements when submitting the form.", category: "Catering" },
  { id: "3", question: "Do you provide event setup?", answer: "Yes, our team handles full setup and breakdown including tables, linens, and serving equipment.", category: "Catering" },
  { id: "4", question: "What is the minimum guest count for catering?", answer: "Our minimum is 20 guests for full catering service. For smaller events, please contact us for custom options.", category: "Catering" },
  { id: "5", question: "How far in advance should I book?", answer: "We recommend booking at least 2 weeks in advance. For large events (100+ guests), please book 4\u20136 weeks ahead.", category: "Catering" },
  { id: "6", question: "Is the menu halal?", answer: "Yes, all our meat is halal certified. We also have clearly marked vegetarian options.", category: "Menu" },
  { id: "7", question: "Do you have a kids\u2019 menu?", answer: "We have dishes suitable for children across most of our menu sections. Ask your waiter for recommendations.", category: "Menu" },
  { id: "8", question: "Where are you located?", answer: "We have multiple branches across Tashkent. Visit our Locations page for addresses and working hours.", category: "General" },
  { id: "9", question: "Do you take reservations?", answer: "Yes, you can call any branch directly to make a reservation. Online booking is coming soon.", category: "General" },
  { id: "10", question: "How do I apply for a job at MADO?", answer: "Visit our Careers page and fill out the application form. Our HR team will be in touch within 3\u20135 business days.", category: "Careers" },
];

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>(INITIAL);
  const [editing, setEditing] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [editCat, setEditCat] = useState<FaqCategory>("General");
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [newCat, setNewCat] = useState<FaqCategory>("General");
  const [catFilter, setCatFilter] = useState<"all" | FaqCategory>("all");
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<FaqCategory>>(new Set(CATEGORIES));

  const filtered = items.filter((i) => {
    const matchCat = catFilter === "all" || i.category === catFilter;
    const q = search.toLowerCase();
    const matchSearch = i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const grouped = CATEGORIES.reduce<Record<FaqCategory, FaqItem[]>>((acc, cat) => {
    acc[cat] = filtered.filter((i) => i.category === cat);
    return acc;
  }, { General: [], Catering: [], Menu: [], Careers: [] });

  const startEdit = (item: FaqItem) => {
    setEditing(item.id);
    setEditQ(item.question);
    setEditA(item.answer);
    setEditCat(item.category);
  };

  const saveEdit = (id: string) => {
    setItems(items.map((i) => i.id === id ? { ...i, question: editQ, answer: editA, category: editCat } : i));
    setEditing(null);
  };

  const handleAdd = () => {
    if (!newQ.trim()) return;
    setItems([...items, { id: Date.now().toString(), question: newQ, answer: newA, category: newCat }]);
    setNewQ(""); setNewA(""); setAdding(false);
  };

  const toggleCat = (cat: FaqCategory) => {
    const next = new Set(expandedCats);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setExpandedCats(next);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">FAQ</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} questions across {CATEGORIES.length} categories</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCatFilter("all")}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", catFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", catFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-card border border-accent/50 rounded-xl p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Question</label>
              <input
                autoFocus
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                placeholder="e.g. Do you have parking?"
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select value={newCat} onChange={(e) => setNewCat(e.target.value as FaqCategory)}
                className="px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Answer</label>
            <textarea
              rows={3}
              value={newA}
              onChange={(e) => setNewA(e.target.value)}
              placeholder="Write the answer..."
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Add</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Grouped questions */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const catItems = grouped[cat];
          if (catItems.length === 0 && catFilter !== "all" && catFilter !== cat) return null;
          const isOpen = expandedCats.has(cat);
          return (
            <div key={cat} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded", CAT_COLORS[cat])}>{cat}</span>
                <span className="text-sm text-muted-foreground">{catItems.length} questions</span>
              </button>
              {isOpen && (
                <div className="divide-y divide-border border-t border-border">
                  {catItems.map((item) => (
                    <div key={item.id} className="group">
                      {editing === item.id ? (
                        <div className="p-4 space-y-3 bg-muted/20">
                          <div className="flex gap-3">
                            <input
                              value={editQ}
                              onChange={(e) => setEditQ(e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <select value={editCat} onChange={(e) => setEditCat(e.target.value as FaqCategory)}
                              className="px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none">
                              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <textarea
                            rows={3}
                            value={editA}
                            onChange={(e) => setEditA(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(item.id)} className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditing(null)} className="p-2 rounded-lg bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 px-4 py-4 hover:bg-muted/20">
                          <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 cursor-grab shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{item.question}</p>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.answer}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => startEdit(item)} className="p-1.5 rounded hover:bg-muted">
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => setItems(items.filter((i) => i.id !== item.id))} className="p-1.5 rounded hover:bg-destructive/10">
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {catItems.length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground">No questions in this category</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
