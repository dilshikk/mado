import { FileText, Edit2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const pages = [
  { name: "Home", path: "/", sections: 6, status: "published", updatedAt: "Today" },
  { name: "Our Story", path: "/story", sections: 6, status: "published", updatedAt: "3 days ago" },
  { name: "Menu", path: "/menu", sections: 4, status: "published", updatedAt: "Today" },
  { name: "Catering", path: "/catering", sections: 5, status: "published", updatedAt: "1 week ago" },
  { name: "Locations", path: "/locations", sections: 3, status: "published", updatedAt: "5 days ago" },
  { name: "Careers", path: "/careers", sections: 4, status: "published", updatedAt: "2 weeks ago" },
  { name: "Contact", path: "/contact", sections: 3, status: "published", updatedAt: "1 week ago" },
];

export default function PagesPage() {
  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold">Pages</h1>
        <p className="text-sm text-muted-foreground mt-1">{pages.length} pages</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {pages.map((page) => (
            <div key={page.path} className="group flex items-center justify-between px-5 py-4 hover:bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{page.name}</p>
                  <p className="text-xs text-muted-foreground">{page.path} · {page.sections} sections · Updated {page.updatedAt}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={page.path}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted"
                  target="_blank"
                >
                  <Eye className="w-3 h-3" /> View
                </Link>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
