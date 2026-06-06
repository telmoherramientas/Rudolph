import * as XLSX from "xlsx";
import type { ProcessedRow, Variables } from "@/types";

function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

export function exportToExcel(rows: ProcessedRow[], vars: Variables): void {
  const headers = [
    "# de venta",
    "Fecha de venta",
    "Estado",
    "Unidades",
    "SKU",
    "Título",
    "Variante",
    "Precio unitario",
    "Tiene cuotas",
    "Ingresos por productos (ARS)",
    "Ingreso envío",
    "Costo envío",
    "Total MeLi",
    "Facturación C/IVA",
    "Facturación S/IVA",
    "IVA Débito",
    "IVA Crédito",
    "Saldo IVA",
    "Comisión %",
    "Comisión",
    "Comisión Fija",
    "% Cuotas",
    "Cuotas",
    "Total Comisiones",
    "IIBB",
    "D&C",
    "Envío neto",
    "Total Impuestos",
    "Costo LAND ind. (USD)",
    "Costo Land Total (ARS)",
    "Costo Envío Flex (C/IVA)",
    "Costo Total",
    "Margen",
    "CMG %",
  ];

  const data = rows.map((r) => [
    r.numeroVenta,
    r.fechaVenta,
    r.estado,
    r.unidades,
    r.sku,
    r.titulo,
    r.variante,
    r.precioUnitario,
    r.tieneCuotas,
    r.ingresosPorProductos,
    r.ingresoEnvio,
    r.costoEnvio,
    r.total,
    r.facturacionConIva,
    r.facturacionSinIva,
    r.iva,
    r.ivaCredito,
    r.saldoIva,
    r.comisionPct,
    r.comision,
    r.comisionFija,
    r.cuotasPct,
    r.cuotas,
    r.totalComisiones,
    r.iibb,
    r.dyc,
    r.envioNeto,
    r.totalImpuestos,
    r.costoLandInd,
    r.costoLandTotal,
    r.costoEnvioFlexConIva,
    r.costoTotal,
    r.margen,
    r.cmgPct,
  ]);

  // Config sheet with variables used
  const configData = [
    ["Variable", "Valor"],
    ["IVA %", vars.ivaPct],
    ["IIBB %", vars.iibbPct],
    ["D&C %", vars.dycPct],
    ["% Cuotas", vars.cuotasPct],
    ["Cotización Blue (ARS/USD)", vars.cotizacionBlue],
    [],
    [],
    ["Tramos Comisión Fija", "Hasta precio", "Monto"],
    ...vars.comisionFijaTiers.map((t) => ["", t.precioMax === Infinity ? "∞" : t.precioMax, t.monto]),
    [],
    ["SKU", "IVA %", "Comisión %", "Premium", "Costo LAND (USD)"],
    ...Object.values(vars.skuConfigs).map((c) => [
      c.sku,
      c.ivaPct,
      c.comisionPct,
      c.esPremium ? "Sí" : "No",
      c.costoLandUsd,
    ]),
  ];

  const wb = XLSX.utils.book_new();

  const wsData = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Column widths
  wsData["!cols"] = [
    { wch: 20 }, { wch: 22 }, { wch: 15 }, { wch: 8 }, { wch: 14 },
    { wch: 40 }, { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 16 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 16 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 },
    { wch: 10 },
  ];

  const wsConfig = XLSX.utils.aoa_to_sheet(configData);
  wsConfig["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 16 }];

  XLSX.utils.book_append_sheet(wb, wsData, "Ventas CMG");
  XLSX.utils.book_append_sheet(wb, wsConfig, "Variables");

  XLSX.writeFile(wb, "CMG_MercadoLibre.xlsx");
}
