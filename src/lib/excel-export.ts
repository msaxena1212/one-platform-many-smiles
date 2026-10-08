import * as XLSX from "xlsx";
import { toast } from "sonner";

export interface ExcelExportColumn<T = any> {
  header: string;
  accessor: keyof T | ((row: T) => any);
}

export function exportToExcel<T = any>(
  data: T[],
  columnsOrFilename?: ExcelExportColumn<T>[] | string,
  optionalFilename?: string,
  sheetName = "Data"
) {
  try {
    if (!data || data.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    let exportRows: Record<string, any>[] = [];
    let filename = typeof columnsOrFilename === "string" ? columnsOrFilename : (optionalFilename || "export.xlsx");

    if (Array.isArray(columnsOrFilename)) {
      exportRows = data.map((item) => {
        const row: Record<string, any> = {};
        for (const col of columnsOrFilename) {
          const raw = typeof col.accessor === "function" ? col.accessor(item) : item[col.accessor];
          row[col.header] = raw == null ? "" : typeof raw === "object" ? JSON.stringify(raw) : String(raw);
        }
        return row;
      });
    } else {
      exportRows = data.map((item: any) => {
        const row: Record<string, any> = {};
        for (const [k, v] of Object.entries(item)) {
          if (typeof v !== "function") {
            row[k] = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
          }
        }
        return row;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Auto-fit column widths based on longest cell content
    if (exportRows.length > 0) {
      const headers = Object.keys(exportRows[0]);
      const colWidths = headers.map((header) => {
        let maxLen = header.length;
        for (const row of exportRows) {
          const val = row[header];
          const len = val != null ? String(val).length : 0;
          if (len > maxLen) maxLen = len;
        }
        return { wch: Math.min(Math.max(maxLen + 4, 12), 60) };
      });
      worksheet["!cols"] = colWidths;
    }

    const workbook = XLSX.utils.book_new();
    const safeSheetName = (sheetName || "Data").replace(/[*?:/[\]]/g, "_").slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

    const fullFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
    XLSX.writeFile(workbook, fullFilename);
    toast.success(`Successfully exported ${data.length} records to ${fullFilename}`);
  } catch (error: any) {
    console.error("Excel Export Error:", error);
    toast.error("Failed to export Excel file: " + (error?.message || "Unknown error"));
  }
}
