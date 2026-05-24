"use client";
import type { ProcessedRow } from "@/types";

interface Props {
  rows: ProcessedRow[];
}

const ars = (n: number) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const pct = (n: number) => (n * 100).toFixed(1) + "%";

function Th({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <th className="px-3 py-2 font-medium whitespace-nowrap">
      <div className="relative group inline-flex items-center gap-1 cursor-default">
        <span>{label}</span>
        <span className="text-gray-400 text-xs leading-none">ⓘ</span>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-50 w-52 bg-gray-800 text-white text-xs rounded-lg p-2 shadow-lg pointer-events-none">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
          {tooltip}
        </div>
      </div>
    </th>
  );
}

function CmgBadge({ v }: { v: number }) {
  const pctVal = v * 100;
  const color = pctVal >= 30 ? "bg-green-100 text-green-800" : pctVal >= 15 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{pct(v)}</span>;
}

function Card({ label, value, color = "text-gray-800" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function DataTable({ rows }: Props) {
  if (rows.length === 0) return <p className="text-gray-400 text-sm p-8 text-center">Sin datos</p>;

  const totalSinIva = rows.reduce((s, r) => s + r.facturacionSinIva, 0);
  const totalCosto = rows.reduce((s, r) => s + r.costoTotal, 0);
  const totalMargen = rows.reduce((s, r) => s + r.margen, 0);
  const avgCmg = totalSinIva > 0 ? totalMargen / totalSinIva : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Cards resumen */}
      <div className="grid grid-cols-4 gap-3">
        <Card label="Ventas S/IVA" value={`$${ars(totalSinIva)}`} />
        <Card label="Costo total" value={`$${ars(totalCosto)}`} color="text-red-600" />
        <Card label="Margen total" value={`$${ars(totalMargen)}`} color={totalMargen >= 0 ? "text-green-600" : "text-red-600"} />
        <Card label="CMG promedio" value={pct(avgCmg)} color={avgCmg >= 0.2 ? "text-green-600" : "text-red-600"} />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-800 text-left">
              <Th label="# Operación" tooltip="ID de la operación en MercadoLibre. Click para abrir el detalle de la venta." />
              <Th label="Fecha" tooltip="Fecha de la venta según MercadoLibre" />
              <Th label="SKU" tooltip="Código interno del producto" />
              <Th label="Título" tooltip="Nombre de la publicación en MercadoLibre" />
              <Th label="Uds." tooltip="Cantidad de unidades vendidas en esta operación" />
              <Th label="Fact. C/IVA" tooltip="Ingresos por la venta incluyendo IVA. Es el precio que pagó el comprador." />
              <Th label="Fact. S/IVA" tooltip="Ingresos netos de IVA. Base de cálculo para comisiones e IIBB." />
              <Th label="IVA neto" tooltip="IVA débito (cobrado en la venta) menos IVA crédito (IVA sobre comisiones MeLi). Es lo que efectivamente debés a AFIP por IVA en esta operación." />
              <Th label="Com. %" tooltip="Porcentaje de comisión de MercadoLibre según categoría. Se aplica sobre la Facturación S/IVA." />
              <Th label="Comisión" tooltip="Monto de la comisión porcentual de MeLi = Fact. S/IVA × Com. %" />
              <Th label="Com. Fija" tooltip="Cargo fijo de MeLi por operación según el precio unitario de venta. Configurable por tramos en el panel." />
              <Th label="Cuotas" tooltip="Cargo por ofrecer cuotas sin interés. Solo aplica cuando el comprador pagó en cuotas." />
              <Th label="Tot. Comis." tooltip="Total de comisiones MeLi = Comisión % + Comisión Fija + Cuotas" />
              <Th label="IIBB" tooltip="Ingresos Brutos = Fact. S/IVA × tasa IIBB. Impuesto provincial configurable." />
              <Th label="D&C" tooltip="Débitos y Créditos = Fact. C/IVA × tasa D&C. Impuesto al cheque, se aplica sobre el monto bruto." />
              <Th label="Envío neto" tooltip="Diferencia entre lo que cobró MeLi al comprador por envío y lo que te descontó a vos. Positivo = beneficio." />
              <Th label="Tot. Imp." tooltip="Total impuestos = IIBB + D&C − Envío neto. Si el envío te favorece, reduce este total." />
              <Th label="Costo Land" tooltip="Costo de mercadería = Costo USD por unidad × Cotización Blue × Unidades." />
              <Th label="Costo Total" tooltip="Suma de todos los costos: Comisiones + Impuestos + Costo de mercadería." />
              <Th label="Margen" tooltip="Ganancia neta = Facturación S/IVA − Costo Total." />
              <Th label="CMG %" tooltip="Contribución Marginal Bruta = Margen ÷ Fact. S/IVA. Verde ≥30%, amarillo ≥15%, rojo <15%." />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-2 whitespace-nowrap">
                  <a
                    href={`https://www.mercadolibre.com.ar/ventas/${r.numeroVenta}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-xs"
                  >
                    {r.numeroVenta}
                  </a>
                </td>
                <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{r.fechaVenta.split(" ")[0] || "-"}</td>
                <td className="px-3 py-2 font-mono text-blue-700">{r.sku || "-"}</td>
                <td className="px-3 py-2 max-w-48 truncate text-gray-700" title={r.titulo}>{r.titulo || "-"}</td>
                <td className="px-3 py-2 text-center">{r.unidades}</td>
                <td className="px-3 py-2 text-right">${ars(r.facturacionConIva)}</td>
                <td className="px-3 py-2 text-right font-medium">${ars(r.facturacionSinIva)}</td>
                <td className="px-3 py-2 text-right text-orange-600 font-medium">${ars(r.ivaNeto)}</td>
                <td className="px-3 py-2 text-right text-gray-700">{pct(r.comisionPct)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.comision)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.comisionFija)}</td>
                <td className="px-3 py-2 text-right text-red-500">{r.cuotas > 0 ? `-$${ars(r.cuotas)}` : "-"}</td>
                <td className="px-3 py-2 text-right text-red-600 font-medium">-${ars(r.totalComisiones)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.iibb)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.dyc)}</td>
                <td className={`px-3 py-2 text-right ${r.envioNeto >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {r.envioNeto >= 0 ? "+" : "-"}${ars(Math.abs(r.envioNeto))}
                </td>
                <td className={`px-3 py-2 text-right font-medium ${r.totalImpuestos >= 0 ? "text-red-600" : "text-green-600"}`}>
                  {r.totalImpuestos >= 0 ? "-" : "+"}${ars(Math.abs(r.totalImpuestos))}
                </td>
                <td className="px-3 py-2 text-right text-red-500">{r.costoLandTotal > 0 ? `-$${ars(r.costoLandTotal)}` : "-"}</td>
                <td className="px-3 py-2 text-right text-red-700 font-semibold">-${ars(r.costoTotal)}</td>
                <td className={`px-3 py-2 text-right font-semibold ${r.margen >= 0 ? "text-green-700" : "text-red-700"}`}>${ars(r.margen)}</td>
                <td className="px-3 py-2 text-right"><CmgBadge v={r.cmgPct} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
