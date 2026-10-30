import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FileText, Download, PenLine, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { documents, type DocumentItem } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/documents")({
  head: () => ({ meta: [{ title: "Documents — ZYNO Tenant Portal" }] }),
  component: DocsPage,
});

const catIcon: Record<DocumentItem["category"], string> = {
  "Legal": "📄",
  "Finance": "🧾",
  "Inspection": "🔍",
  "Policy": "📋",
  "NOC & Letters": "✉️",
};

const catColor: Record<DocumentItem["category"], string> = {
  "Legal": "bg-sky-100 text-sky-700",
  "Finance": "bg-emerald-100 text-emerald-700",
  "Inspection": "bg-amber-100 text-amber-700",
  "Policy": "bg-purple-100 text-purple-700",
  "NOC & Letters": "bg-rose-100 text-rose-700",
};

const categories = ["All", "Legal", "Finance", "Inspection", "Policy", "NOC & Letters"] as const;

function DocsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = documents.filter(d => {
    const matchCat = activeCategory === "All" || d.category === activeCategory;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const pendingSign = documents.filter(d => d.action === "sign");

  return (
    <div className="space-y-6">
      {/* Pending Signature Alert */}
      {pendingSign.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-800">Action Required: {pendingSign.length} Document{pendingSign.length > 1 ? "s" : ""} Awaiting Your Signature</p>
            <ul className="mt-1 text-amber-700 space-y-0.5">
              {pendingSign.map(d => <li key={d.id} className="text-xs">&bull; {d.name}</li>)}
            </ul>
          </div>
          <Button size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => toast("Opening document for e-signature...")}>Sign Now</Button>
        </div>
      )}

      {/* KPI Bar */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
        {(["Legal", "Finance", "Inspection", "Policy", "NOC & Letters"] as DocumentItem["category"][]).map(cat => {
          const count = documents.filter(d => d.category === cat).length;
          return (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? "All" : cat)}
              className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm ${activeCategory === cat ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              <div className="text-lg mb-1">{catIcon[cat]}</div>
              <p className="text-lg font-bold">{count}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{cat}</p>
            </button>
          );
        })}
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                activeCategory === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>{c}</button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toast("Downloading all documents as ZIP...")}>
          <Download className="h-3.5 w-3.5" /> Download All
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map(d => (
          <Card key={d.id} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                {catIcon[d.category]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${catColor[d.category]}`}>{d.category}</span>
                  <span className="text-xs text-muted-foreground">{d.size} &middot; {d.date}</span>
                </div>
              </div>
              {d.action === "sign" ? (
                <Button size="sm" className="shrink-0 gap-1" onClick={() => toast(`Opening ${d.name} for e-signature...`)}>
                  <PenLine className="h-3.5 w-3.5" /> Sign
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => toast(`${d.name} download started.`)}>
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-10 w-10" />
            <p>No documents found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
