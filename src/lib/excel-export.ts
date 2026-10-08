import * as XLSX from "xlsx";
import { toast } from "sonner";

export interface ExcelExportColumn<T = any> {
  header?: string;
  label?: string;
  key?: string;
  accessor?: keyof T | ((row: T) => any);
  width?: number;
}

export interface ExcelExportOptions<T = any> {
  filename?: string;
  sheetName?: string;
  data: T[];
  columns?: ExcelExportColumn<T>[];
  headers?: ExcelExportColumn<T>[];
}

export function exportToExcel<T = any>(
  dataOrOptions: T[] | ExcelExportOptions<T>,
  columnsOrFilename?: ExcelExportColumn<T>[] | string,
  optionalFilename?: string,
  sheetNameParam = "Data"
) {
  try {
    let data: T[] = [];
    let filename = "export.xlsx";
    let sheetName = sheetNameParam;
    let columns: ExcelExportColumn<T>[] | undefined;

    // Check if called as exportToExcel({ data, filename, sheetName, headers/columns })
    if (dataOrOptions && !Array.isArray(dataOrOptions) && typeof dataOrOptions === "object" && "data" in dataOrOptions) {
      const opts = dataOrOptions as ExcelExportOptions<T>;
      data = Array.isArray(opts.data) ? opts.data : [];
      filename = opts.filename || "export.xlsx";
      sheetName = opts.sheetName || "Data";
      columns = opts.columns || opts.headers;
    } else if (Array.isArray(dataOrOptions)) {
      data = dataOrOptions;
      if (typeof columnsOrFilename === "string") {
        filename = columnsOrFilename;
      } else if (Array.isArray(columnsOrFilename)) {
        columns = columnsOrFilename;
        filename = optionalFilename || "export.xlsx";
      } else {
        filename = optionalFilename || "export.xlsx";
      }
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    let exportRows: Record<string, any>[] = [];

    if (Array.isArray(columns) && columns.length > 0) {
      exportRows = data.map((item) => {
        const row: Record<string, any> = {};
        for (const col of columns!) {
          const headerName = col.header || col.label || col.key || "Column";
          let raw: any;
          if (typeof col.accessor === "function") {
            raw = col.accessor(item);
          } else if (col.accessor) {
            raw = (item as any)[col.accessor];
          } else if (col.key && (item as any)[col.key] !== undefined) {
            raw = (item as any)[col.key];
          } else if (col.label && (item as any)[col.label] !== undefined) {
            raw = (item as any)[col.label];
          } else if (typeof item === "object" && item !== null && headerName in item) {
            raw = (item as any)[headerName];
          }
          row[headerName] = raw == null ? "" : typeof raw === "object" ? JSON.stringify(raw) : String(raw);
        }
        return row;
      });
    } else {
      exportRows = data.map((item: any) => {
        const row: Record<string, any> = {};
        if (item && typeof item === "object") {
          for (const [k, v] of Object.entries(item)) {
            if (typeof v !== "function") {
              row[k] = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
            }
          }
        }
        return row;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Auto-fit column widths based on longest cell content or specified header width
    if (exportRows.length > 0) {
      const headers = Object.keys(exportRows[0]);
      const colWidths = headers.map((header) => {
        const matchingCol = columns?.find(c => (c.header || c.label || c.key) === header);
        if (matchingCol?.width) {
          return { wch: matchingCol.width };
        }
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
