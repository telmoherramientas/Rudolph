import * as XLSX from "xlsx";

export interface ProductRow {
  sku: string;
  titulo: string;
  costoLandUsd: number;
  comisionPct: number;
}

export function parseProductsExcel(buffer: ArrayBuffer): ProductRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][];

  // Find header row by locating the cell that says exactly "SKU"
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(data.length, 30); i++) {
    if ((data[i] as unknown[]).some((c) => String(c ?? "").trim() === "SKU")) {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx === -1) return [];

  const headers = (data[headerRowIdx] as unknown[]).map((h) =>
    String(h ?? "").trim()
  );

  const iSku = headers.indexOf("SKU");
  const iLanded = headers.findIndex((h) => h.toLowerCase() === "landed");
  const iComision = headers.findIndex((h) =>
    h.toLowerCase().includes("com. ml")
  );
  // Product name is the column right after SKU
  const iTitulo = iSku >= 0 ? iSku + 1 : -1;

  if (iSku === -1 || iLanded === -1 || iComision === -1) return [];

  const result: ProductRow[] = [];

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i] as unknown[];
    const sku = String(row[iSku] ?? "").trim();
    if (!sku) continue;

    const costoLandUsd = Number(row[iLanded]);
    const comisionPct = Number(row[iComision]);
    if (isNaN(costoLandUsd) && isNaN(comisionPct)) continue;

    result.push({
      sku,
      titulo: iTitulo >= 0 ? String(row[iTitulo] ?? "").trim() : sku,
      costoLandUsd: isNaN(costoLandUsd) ? 0 : costoLandUsd,
      comisionPct: isNaN(comisionPct) ? 0 : comisionPct,
    });
  }

  return result;
}
