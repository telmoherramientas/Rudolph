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

function nullish(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "number" && isNaN(v)) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  return false;
}

interface RawEntry {
  row: MeliRow;
  isPackageParent: boolean;
  isPackageSubRow: boolean;
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

  const entries: RawEntry[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    const numVenta = s(r[iNumVenta]);
    if (!numVenta || numVenta === "# de venta") continue;

    const unidades = n(r[iUnidades]);
    const sku = s(r[iSku]);
    const estado = s(r[iEstado]);
    const paquete = s(r[iPaquete]);
    const ingresoNull = nullish(r[iIngresos]);

    // Package parent: Estado = "Paquete de N productos", no SKU, has revenue
    const isPackageParent =
      estado.toLowerCase().includes("paquete de") && !sku && !ingresoNull;

    // Package sub-row: "Paquete de varios" has any value AND ingresos is null.
    // A row with "Paquete de varios" non-empty but WITH ingresos is a regular bundle (same SKU, N units).
    const isPackageSubRow = paquete.length > 0 && ingresoNull;

    if (unidades === 0 && !isPackageParent) continue;

    entries.push({
      row: {
        numeroVenta: numVenta,
        fechaVenta: s(r[iFecha]),
        estado,
        descripcionEstado: s(r[iDescEstado]),
        paquete,
        perteneceKit: s(r[iKit]),
        unidades,
        ingresosPorProductos: n(r[iIngresos]),
        ingresoEnvio: n(r[iIngresoEnvio]),
        costoEnvio: n(r[iCostoEnvio]),
        anulaciones: n(r[iAnulaciones]),
        total: n(r[iTotal]),
        mesFacturacion: s(r[iMes]),
        ventaPublicidad: s(r[iPublicidad]),
        sku,
        publicacion: s(r[iPub]),
        titulo: s(r[iTitulo]),
        variante: s(r[iVariante]),
        precioUnitario: n(r[iPrecio]),
        tieneCuotas: s(r[iCuotas]),
      },
      isPackageParent,
      isPackageSubRow,
    });
  }

  return resolvePackages(entries);
}

function resolvePackages(entries: RawEntry[]): MeliRow[] {
  const result: MeliRow[] = [];
  let i = 0;

  while (i < entries.length) {
    const entry = entries[i];

    if (entry.isPackageParent) {
      // Collect immediately following sub-rows
      const subEntries: RawEntry[] = [];
      let j = i + 1;
      while (j < entries.length && entries[j].isPackageSubRow) {
        subEntries.push(entries[j]);
        j++;
      }

      if (subEntries.length > 0) {
        const parent = entry.row;
        const totalRevenue = subEntries.reduce(
          (sum, e) => sum + e.row.precioUnitario * e.row.unidades,
          0
        );

        for (const sub of subEntries) {
          const subRevenue = sub.row.precioUnitario * sub.row.unidades;
          const share =
            totalRevenue > 0 ? subRevenue / totalRevenue : 1 / subEntries.length;

          result.push({
            ...sub.row,
            ingresosPorProductos: subRevenue,
            ingresoEnvio: parent.ingresoEnvio * share,
            costoEnvio: parent.costoEnvio * share,
            anulaciones: parent.anulaciones * share,
            total: parent.total * share,
            mesFacturacion: parent.mesFacturacion || sub.row.mesFacturacion,
            tieneCuotas: parent.tieneCuotas || sub.row.tieneCuotas,
          });
        }
        i = j;
      } else {
        // No sub-rows found — skip orphan package parent
        i++;
      }
    } else {
      result.push(entry.row);
      i++;
    }
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
