export interface MeliRow {
  numeroVenta: string;
  fechaVenta: string;
  estado: string;
  descripcionEstado: string;
  paquete: string;
  perteneceKit: string;
  unidades: number;
  ingresosPorProductos: number;
  ingresoEnvio: number;
  costoEnvio: number;
  anulaciones: number;
  total: number;
  mesFacturacion: string;
  ventaPublicidad: string;
  sku: string;
  publicacion: string;
  titulo: string;
  variante: string;
  precioUnitario: number;
  tieneCuotas: string;
}

export interface SkuConfig {
  sku: string;
  titulo: string;
  comisionPct: number;
  comisionFija: number;
  costoLandUsd: number;
}

export interface Variables {
  ivaPct: number;
  iibbPct: number;
  dycPct: number;
  cuotasPct: number;
  cotizacionBlue: number;
  skuConfigs: Record<string, SkuConfig>;
}

export interface ProcessedRow extends MeliRow {
  facturacionConIva: number;
  facturacionSinIva: number;
  iva: number;
  comisionPct: number;
  comision: number;
  comisionFija: number;
  cuotasPct: number;
  cuotas: number;
  totalComisiones: number;
  iibb: number;
  dyc: number;
  envioNeto: number;
  totalImpuestos: number;
  costoLandInd: number;
  costoLandTotal: number;
  costoTotal: number;
  margen: number;
  cmgPct: number;
}
