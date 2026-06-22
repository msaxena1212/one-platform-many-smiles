import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const docs = [
  { id: "d1", name: "Lease agreement — A-1201", size: "248 KB", date: "2024-08-15", action: "download" },
  { id: "d2", name: "Q3 2026 rent invoice", size: "92 KB", date: "2026-06-15", action: "download" },
  { id: "d3", name: "Move-in inspection report", size: "1.2 MB", date: "2024-08-20", action: "download" },
  { id: "d4", name: "Lease renewal — sign required", size: "186 KB", date: "2026-06-20", action: "sign" },
  { id: "d5", name: "Community house rules v3", size: "412 KB", date: "2026-01-01", action: "download" },
  { id: "d6", name: "Pool access acknowledgement — sign required", size: "44 KB", date: "2026-06-10", action: "sign" },
];

export const Route = createFileRoute("/portal/documents")({
  head: () => ({ meta: [{ title: "Documents — Kinan Portal" }] }),
  component: DocsPage,
});

function DocsPage() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold">My documents</h3>
          <p className="text-xs text-muted-foreground">Lease, invoices, inspections and community policies.</p>
        </div>
        <ul className="divide-y divide-border">
          {docs.map(d => (
            <li key={d.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.size} · {d.date}</p>
                </div>
              </div>
              {d.action === "sign" ? (
                <Button size="sm" className="shrink-0"><PenLine /> Sign</Button>
              ) : (
                <Button size="sm" variant="outline" className="shrink-0"><Download /> Download</Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
