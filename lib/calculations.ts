import type { MeliRow, ProcessedRow, Variables, ComisionFijaTier } from "@/types";

function calcComisionFija(precioUnitario: number, tiers: ComisionFijaTier[], esPremium: boolean): number {
  if (esPremium) return 0;
  const sorted = [...tiers].sort((a, b) => a.precioMax - b.precioMax);
  for (const tier of sorted) {
    if (precioUnitario < tier.precioMax) return tier.monto;
  }
  return sorted[sorted.length - 1]?.monto ?? 0;
}

export function calculateRow(row: MeliRow, vars: Variables): ProcessedRow {
  const skuCfg = vars.skuConfigs[row.sku] || {
    ivaPct: vars.ivaPct,
    comisionPct: 0.145,
    esPremium: false,
    costoLandUsd: 0,
  };

  const ivaPct = skuCfg.ivaPct ?? vars.ivaPct;
  const facturacionConIva = row.ingresosPorProductos;
  const facturacionSinIva = facturacionConIva / (1 + ivaPct);
  const iva = facturacionConIva - facturacionSinIva;

  const comisionPct = skuCfg.comisionPct;
  const comision = facturacionConIva * comisionPct;
  // comisionFija: monto por unidad (el panel lo configura con IVA incluido)
  const comisionFijaUnitaria = calcComisionFija(row.precioUnitario, vars.comisionFijaTiers, skuCfg.esPremium);
  const comisionFija = comisionFijaUnitaria * row.unidades;

  const tieneCuotas = row.tieneCuotas.toLowerCase() === "sí" || row.tieneCuotas.toLowerCase() === "si";
  const cuotasPct = tieneCuotas ? vars.cuotasPct : 0;
  const cuotas = tieneCuotas ? facturacionSinIva * vars.cuotasPct : 0;

  const totalComisiones = comision + comisionFija + cuotas;

  // IVA crédito: comision % y cuotas son importes netos (IVA encima),
  // comisionFija ya tiene IVA incluido → se extrae con fija * ivaPct / (1 + ivaPct)
  const ivaCredito =
    (comision + cuotas) * ivaPct +
    comisionFija * ivaPct / (1 + ivaPct);
  const saldoIva = iva - ivaCredito;

  const iibb = facturacionSinIva * vars.iibbPct;
  const dyc = facturacionConIva * vars.dycPct;
  const envioNeto = row.ingresoEnvio + row.costoEnvio;
  const totalImpuestos = iibb + dyc - envioNeto;

  const costoLandInd = skuCfg.costoLandUsd;
  const costoLandTotal = costoLandInd * vars.cotizacionBlue * row.unidades;

  const costoTotal = totalComisiones + totalImpuestos + costoLandTotal;
  const margen = facturacionSinIva - costoTotal;
  const cmgPct = facturacionSinIva !== 0 ? margen / facturacionSinIva : 0;

  return {
    ...row,
    facturacionConIva,
    facturacionSinIva,
    ivaPct,
    iva,
    ivaCredito,
    saldoIva,
    comisionPct,
    comision,
    comisionFija,
    cuotasPct,
    cuotas,
    totalComisiones,
    iibb,
    dyc,
    envioNeto,
    totalImpuestos,
    costoLandInd,
    costoLandTotal,
    costoTotal,
    margen,
    cmgPct,
  };
}

export function processRows(rows: MeliRow[], vars: Variables): ProcessedRow[] {
  return rows.map((r) => calculateRow(r, vars));
}
