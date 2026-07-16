import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { FileText, Download, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { documents, type DocumentItem } from "@/lib/mock-data";

const docs: DocumentItem[] = documents;

export const Route = createFileRoute("/portal/documents")({
  head: () => ({ meta: [{ title: "Documents — ZYNO Property Management Portal" }] }),
  component: DocsPage,
});

function DocsPage() {
  const handleDownload = (name: string) => {
    toast.success(`${name} download started.`);
  };

  const handleSign = (name: string) => {
    toast(`${name} is ready for signature.`);
  };

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
                <Button size="sm" className="shrink-0" onClick={() => handleSign(d.name)}><PenLine /> Sign</Button>
              ) : (
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => handleDownload(d.name)}><Download /> Download</Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
