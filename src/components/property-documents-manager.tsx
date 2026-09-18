import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  File,
  X,
  ShieldCheck,
  Paperclip,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export interface PropertyDocument {
  id: string;
  name: string;
  type: string;
  typeId?: string;
  size: number;
  uploadedAt: string;
  url?: string;
  remarks?: string;
  expiryDate?: string;
  isMandatory?: boolean;
}

export const REQUIRED_DOCUMENT_TYPES = [
  { id: "title_deed", label: "Title Deed / Ownership Certificate", category: "Ownership", required: true },
  { id: "building_permit", label: "Building / Construction Permit", category: "Compliance", required: true },
  { id: "municipality_license", label: "Municipality License / Registration", category: "Compliance", required: true },
  { id: "civil_defense", label: "Civil Defense / Fire Safety Certificate", category: "Safety", required: true },
  { id: "kahramaa_approval", label: "Kahramaa / Electricity & Water Clearance", category: "Utilities", required: false },
  { id: "insurance_policy", label: "Property Insurance Policy", category: "Insurance", required: false },
  { id: "architectural_drawings", label: "As-Built / Architectural Drawings", category: "Technical", required: false },
  { id: "mep_specifications", label: "MEP & Elevator Maintenance Contract", category: "Maintenance", required: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  Ownership: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  Compliance: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  Safety: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  Utilities: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
  Insurance: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  Technical: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  Maintenance: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  General: "bg-muted text-muted-foreground border-border",
};

interface PropertyDocumentsManagerProps {
  documents: PropertyDocument[];
  onChange: (documents: PropertyDocument[]) => void;
  disabled?: boolean;
}

export function PropertyDocumentsManager({
  documents,
  onChange,
  disabled = false,
}: PropertyDocumentsManagerProps) {
  const rowFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const otherFileInputRef = useRef<HTMLInputElement | null>(null);
  const [otherDocName, setOtherDocName] = useState("");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getDocsForType = (typeId: string): PropertyDocument[] =>
    documents.filter((d) => d.typeId === typeId);

  const handleRowUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    typeId: string,
    typeLabel: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newDocs: PropertyDocument[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: typeLabel,
      typeId,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
    }));
    onChange([...documents, ...newDocs]);
    toast.success(
      newDocs.length > 1
        ? `${newDocs.length} files uploaded for ${typeLabel}.`
        : `"${newDocs[0].name}" uploaded for ${typeLabel}.`
    );
    if (rowFileRefs.current[typeId]) rowFileRefs.current[typeId]!.value = "";
  };

  const handleOtherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const label = otherDocName.trim() || "Other Documents";
    const newDocs: PropertyDocument[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: label,
      typeId: "other",
      size: file.size,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
    }));
    onChange([...documents, ...newDocs]);
    toast.success(`${newDocs.length} document(s) uploaded.`);
    setOtherDocName("");
    if (otherFileInputRef.current) otherFileInputRef.current.value = "";
  };

  const handleRemoveDoc = (id: string) => {
    onChange(documents.filter((d) => d.id !== id));
    toast.info("Document removed.");
  };

  const mandatoryTotal = REQUIRED_DOCUMENT_TYPES.filter((r) => r.required).length;
  const mandatoryDone = REQUIRED_DOCUMENT_TYPES.filter(
    (r) => r.required && getDocsForType(r.id).length > 0
  ).length;
  const otherDocs = documents.filter((d) => d.typeId === "other");

  return (
    <div className="space-y-5">
      {/* Required Document Compliance Checklist Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Required Document Compliance Checklist
            </span>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              mandatoryDone === mandatoryTotal
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
            }`}
          >
            {mandatoryDone}/{mandatoryTotal} Mandatory
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">#</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Document Name</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Category</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Uploaded Files</th>
                <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {REQUIRED_DOCUMENT_TYPES.map((req, idx) => {
                const rowDocs = getDocsForType(req.id);
                const uploaded = rowDocs.length > 0;
                return (
                  <tr
                    key={req.id}
                    className={`transition-colors ${
                      uploaded
                        ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                        : req.required
                        ? "bg-amber-500/5 hover:bg-amber-500/10"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-3 text-muted-foreground font-medium">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {uploaded ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : req.required ? (
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <File className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-medium text-foreground">{req.label}</span>
                        {req.required && <span className="text-red-500 font-bold shrink-0">*</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          CATEGORY_COLORS[req.category] || CATEGORY_COLORS.General
                        }`}
                      >
                        {req.category}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 font-semibold ${
                          uploaded
                            ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                            : req.required
                            ? "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {uploaded ? `Uploaded (${rowDocs.length})` : req.required ? "Required" : "Optional"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 min-w-[200px]">
                      {rowDocs.length === 0 ? (
                        <span className="text-muted-foreground italic">No file uploaded</span>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {rowDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-muted/30 border border-border/50 text-xs">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="text-foreground font-medium truncate" title={doc.name}>
                                  {doc.name}
                                </span>
                                <span className="text-muted-foreground shrink-0 text-[11px]">
                                  ({formatFileSize(doc.size)})
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {doc.url && (
                                  <button
                                    type="button"
                                    onClick={() => window.open(doc.url, "_blank")}
                                    className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                                    title="View / Open File"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {!disabled && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDoc(doc.id)}
                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Remove File"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!disabled && (
                        <>
                          <input
                            type="file"
                            ref={(el) => { rowFileRefs.current[req.id] = el; }}
                            onChange={(e) => handleRowUpload(e, req.id, req.label)}
                            className="hidden"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
                          />
                          <Button
                            type="button"
                            variant={uploaded ? "outline" : req.required ? "default" : "outline"}
                            size="sm"
                            onClick={() => rowFileRefs.current[req.id]?.click()}
                            className={`h-7 text-[11px] gap-1.5 ${
                              !uploaded && req.required
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : ""
                            }`}
                          >
                            <Upload className="h-3 w-3" />
                            {uploaded ? "Add More" : "Upload"}
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Other / Additional Documents */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <Paperclip className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Other Documents
          </span>
          {otherDocs.length > 0 && (
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {otherDocs.length} file{otherDocs.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-3">
          {!disabled && (
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs font-semibold">Document Label (Optional)</Label>
                <Input
                  value={otherDocName}
                  onChange={(e) => setOtherDocName(e.target.value)}
                  placeholder="e.g. Environmental Clearance, NOC Letter..."
                  className="h-9 bg-background text-xs"
                />
              </div>
              <div className="shrink-0">
                <input
                  type="file"
                  ref={otherFileInputRef}
                  onChange={handleOtherUpload}
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => otherFileInputRef.current?.click()}
                  className="h-9 gap-2 text-xs w-full sm:w-auto"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Select and Upload Files
                </Button>
              </div>
            </div>
          )}

          {otherDocs.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground text-xs gap-2">
              <FileText className="h-4 w-4 opacity-40" />
              <span>No additional documents uploaded yet.</span>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {otherDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{doc.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {doc.type} - {formatFileSize(doc.size)} - {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {doc.url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => window.open(doc.url, "_blank")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        if (!doc.url) { toast.info(`No file URL for ${doc.name}`); return; }
                        const a = document.createElement("a");
                        a.href = doc.url;
                        a.download = doc.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveDoc(doc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Accepts PDF, DOC, DOCX, Images, Excel up to 25 MB per file. You may select multiple files at once.
          </p>
        </div>
      </div>
    </div>
  );
}