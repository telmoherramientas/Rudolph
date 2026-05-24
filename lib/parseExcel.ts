import * as XLSX from "xlsx";
import type { MeliRow } from "@/types";

function findHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:A1");
  for (let r = range.s.r; r <= Math.min(range.e.r, 10); r++) {
    const cell = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
    if (cell && String(cell.v).trim() === "# de venta") return r;
  }
  return 2;
}

function n(v: unknown): number {
  const num = Number(v);
  return isNaN(num) ? 0 : num;
}

function s(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

export function parseExcel(buffer: ArrayBuffer): MeliRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const headerRow = findHeaderRow(ws);
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    range: headerRow,
    defval: null,
  }) as unknown[][];

  const headers = (rows[0] as unknown[]).map((h) => s(h));

  const col = (name: string) => {
    // Support partial/fuzzy match
    const idx = headers.findIndex(
      (h) => h && h.toLowerCase().includes(name.toLowerCase())
    );
    return idx;
  };

  const iNumVenta = col("# de venta");
  const iFecha = col("Fecha de venta");
  const iEstado = col("Estado");
  const iDescEstado = col("Descripción del estado");
  const iPaquete = col("Paquete de varios");
  const iKit = col("Pertenece a un kit");
  const iUnidades = col("Unidades");
  const iIngresos = col("Ingresos por productos");
  const iIngresoEnvio = col("Ingresos por envío");
  const iCostoEnvio = col("Costos de envío");
  const iAnulaciones = col("Anulaciones");
  const iTotal = col("Total (ARS)");
  const iMes = col("Mes de facturación");
  const iPublicidad = col("Venta por publicidad");
  const iSku = col("SKU");
  const iPub = col("# de publicación");
  const iTitulo = col("Título de la publicación");
  const iVariante = col("Variante");
  const iPrecio = col("Precio unitario");
  const iCuotas = col("Tiene cuotas");

  const result: MeliRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    const numVenta = s(r[iNumVenta]);
    if (!numVenta || numVenta === "# de venta") continue;
    // Skip paquete parent rows with no SKU-level data if they're summary rows
    const unidades = n(r[iUnidades]);
    if (unidades === 0) continue;

    result.push({
      numeroVenta: numVenta,
      fechaVenta: s(r[iFecha]),
      estado: s(r[iEstado]),
      descripcionEstado: s(r[iDescEstado]),
      paquete: s(r[iPaquete]),
      perteneceKit: s(r[iKit]),
      unidades,
      ingresosPorProductos: n(r[iIngresos]),
      ingresoEnvio: n(r[iIngresoEnvio]),
      costoEnvio: n(r[iCostoEnvio]),
      anulaciones: n(r[iAnulaciones]),
      total: n(r[iTotal]),
      mesFacturacion: s(r[iMes]),
      ventaPublicidad: s(r[iPublicidad]),
      sku: s(r[iSku]),
      publicacion: s(r[iPub]),
      titulo: s(r[iTitulo]),
      variante: s(r[iVariante]),
      precioUnitario: n(r[iPrecio]),
      tieneCuotas: s(r[iCuotas]),
    });
  }

  return result;
}

export function extractSkus(rows: MeliRow[]): string[] {
  const seen = new Set<string>();
  rows.forEach((r) => {
    if (r.sku) seen.add(r.sku);
  });
  return Array.from(seen).sort();
}
