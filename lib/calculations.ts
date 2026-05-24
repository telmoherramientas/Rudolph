import type { MeliRow, ProcessedRow, Variables } from "@/types";

export function calculateRow(row: MeliRow, vars: Variables): ProcessedRow {
  const skuCfg = vars.skuConfigs[row.sku] || {
    comisionPct: 0.145,
    comisionFija: 0,
    costoLandUsd: 0,
  };

  const facturacionConIva = row.ingresosPorProductos;
  const facturacionSinIva = facturacionConIva / (1 + vars.ivaPct);
  const iva = facturacionConIva - facturacionSinIva;

  const comisionPct = skuCfg.comisionPct;
  const comision = facturacionSinIva * comisionPct;
  const comisionFija = skuCfg.comisionFija;

  const tieneCuotas = row.tieneCuotas.toLowerCase() === "sí" || row.tieneCuotas.toLowerCase() === "si";
  const cuotasPct = tieneCuotas ? vars.cuotasPct : 0;
  const cuotas = tieneCuotas ? facturacionSinIva * vars.cuotasPct : 0;

  const totalComisiones = comision + comisionFija + cuotas;

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
    iva,
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
