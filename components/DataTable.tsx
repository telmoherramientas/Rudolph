"use client";
import { useState } from "react";
import type { ProcessedRow } from "@/types";

interface Props {
  rows: ProcessedRow[];
}

const ars = (n: number) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const pct = (n: number) => (n * 100).toFixed(1) + "%";

interface TooltipState { text: string; x: number; y: number }

function Th({ label, tooltip, onShow, onHide }: {
  label: string;
  tooltip: string;
  onShow: (t: TooltipState) => void;
  onHide: () => void;
}) {
  return (
    <th className="px-3 py-2 font-medium whitespace-nowrap">
      <div
        className="inline-flex items-center gap-1 cursor-default"
        onMouseEnter={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onShow({ text: tooltip, x: r.left + r.width / 2, y: r.bottom });
        }}
        onMouseLeave={onHide}
      >
        <span>{label}</span>
        <span className="text-gray-400 text-xs leading-none">ⓘ</span>
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
  const [tip, setTip] = useState<TooltipState | null>(null);

  if (rows.length === 0) return <p className="text-gray-400 text-sm p-8 text-center">Sin datos</p>;

  const totalSinIva = rows.reduce((s, r) => s + r.facturacionSinIva, 0);
  const totalCosto = rows.reduce((s, r) => s + r.costoTotal, 0);
  const totalMargen = rows.reduce((s, r) => s + r.margen, 0);
  const avgCmg = totalSinIva > 0 ? totalMargen / totalSinIva : 0;

  const th = (label: string, tooltip: string) => (
    <Th label={label} tooltip={tooltip} onShow={setTip} onHide={() => setTip(null)} />
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Tooltip portal — position fixed, escapa cualquier overflow */}
      {tip && (
        <div
          className="fixed z-[9999] w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{ left: tip.x, top: tip.y + 6, transform: "translateX(-50%)" }}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
          {tip.text}
        </div>
      )}

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
            {/* Sección headers */}
            <tr className="text-center text-xs font-semibold uppercase tracking-wide">
              <th colSpan={8} className="px-3 py-1.5 bg-gray-200 text-gray-700 border-r-2 border-gray-400">
                Operación
              </th>
              <th colSpan={6} className="px-3 py-1.5 bg-yellow-100 text-yellow-800 border-r-2 border-yellow-400">
                MercadoLibre
              </th>
              <th colSpan={6} className="px-3 py-1.5 bg-orange-100 text-orange-800 border-r-2 border-orange-400">
                Impuestos
              </th>
              <th colSpan={4} className="px-3 py-1.5 bg-blue-100 text-blue-800">
                Producto
              </th>
            </tr>
            {/* Columnas */}
            <tr className="bg-gray-100 text-gray-800 text-left">
              {/* — Operación — */}
              {th("# Operación", "ID de la operación en MercadoLibre. Click para abrir el detalle de la venta.")}
              {th("Fecha", "Fecha de la venta según MercadoLibre.")}
              {th("SKU", "Código interno del producto.")}
              {th("Título", "Nombre de la publicación en MercadoLibre.")}
              {th("Uds.", "Cantidad de unidades vendidas en esta operación.")}
              {th("Fact. C/IVA", "Ingresos por la venta incluyendo IVA. Es el precio que pagó el comprador.")}
              {th("Fact. S/IVA", "Ingresos netos de IVA. Base de cálculo para IIBB y otras métricas.")}
              {th("Alíc. IVA", "Alícuota de IVA aplicada a este producto según configuración por SKU (21% o 10.5%).")}
              {/* — MercadoLibre — */}
              {th("Com. %", "Porcentaje de comisión de MercadoLibre según categoría. Se aplica sobre Fact. C/IVA.")}
              {th("Comisión", "Comisión porcentual de MeLi = Fact. C/IVA × Com. %")}
              {th("Com. Fija", "Cargo fijo de MeLi por operación según precio unitario. Configurable por tramos en el panel.")}
              {th("Cuotas", "Cargo por ofrecer cuotas sin interés. Solo aplica cuando el comprador pagó en cuotas.")}
              {th("Tot. Comis.", "Total comisiones MeLi = Comisión % + Comisión Fija + Cuotas.")}
              {th("Envío neto", "Diferencia entre lo que cobró MeLi al comprador por envío y lo que te descontó a vos. Positivo = beneficio.")}
              {/* — Impuestos — */}
              {th("IVA Débito", "IVA cargado en la venta = Fact. C/IVA − Fact. S/IVA. Es el IVA que le cobraste al comprador.")}
              {th("IVA Crédito", "IVA sobre las comisiones de MeLi que podés computar como crédito fiscal = Total Comisiones × tasa IVA.")}
              {th("Saldo IVA", "IVA neto que le debés a AFIP = IVA Débito − IVA Crédito.")}
              {th("IIBB", "Ingresos Brutos = Fact. S/IVA × tasa IIBB. Impuesto provincial configurable.")}
              {th("D&C", "Débitos y Créditos = Fact. C/IVA × tasa D&C. Impuesto al cheque sobre el monto bruto.")}
              {th("Tot. Imp.", "Total impuestos netos = IIBB + D&C − Envío neto. Si el envío te favorece, reduce este total.")}
              {/* — Producto — */}
              {th("Costo Merc.", "Costo de mercadería = Costo USD por unidad × Cotización Blue × Unidades.")}
              {th("Costo Total", "Suma de todos los costos: Comisiones + Impuestos + Costo de mercadería.")}
              {th("Margen", "Ganancia neta = Facturación S/IVA − Costo Total.")}
              {th("CMG %", "Contribución Marginal Bruta = Margen ÷ Fact. S/IVA. Verde ≥30%, amarillo ≥15%, rojo <15%.")}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-900">
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {/* — Operación — */}
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
                <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                  {r.fechaVenta.replace(" hs.", "").split(" de ").slice(0, 3).join("/") || r.fechaVenta.split(" ")[0] || "-"}
                </td>
                <td className="px-3 py-2 font-mono text-blue-700">{r.sku || "-"}</td>
                <td className="px-3 py-2 max-w-48 truncate text-gray-900" title={r.titulo}>{r.titulo || "-"}</td>
                <td className="px-3 py-2 text-center text-gray-900 font-medium">{r.unidades}</td>
                <td className="px-3 py-2 text-right text-gray-900">${ars(r.facturacionConIva)}</td>
                <td className="px-3 py-2 text-right text-gray-900 font-medium">${ars(r.facturacionSinIva)}</td>
                <td className="px-3 py-2 text-right text-gray-500 border-r-2 border-gray-300">{pct(r.ivaPct)}</td>
                {/* — MercadoLibre — */}
                <td className="px-3 py-2 text-right text-gray-900">{pct(r.comisionPct)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.comision)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.comisionFija)}</td>
                <td className="px-3 py-2 text-right text-red-500">{r.cuotas > 0 ? `-$${ars(r.cuotas)}` : "-"}</td>
                <td className="px-3 py-2 text-right text-red-600 font-medium">-${ars(r.totalComisiones)}</td>
                <td className={`px-3 py-2 text-right border-r-2 border-yellow-300 ${r.envioNeto >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {r.envioNeto >= 0 ? "+" : "-"}${ars(Math.abs(r.envioNeto))}
                </td>
                {/* — Impuestos — */}
                <td className="px-3 py-2 text-right text-blue-700 font-medium">${ars(r.iva)}</td>
                <td className="px-3 py-2 text-right text-green-600">-${ars(r.ivaCredito)}</td>
                <td className="px-3 py-2 text-right text-orange-600 font-medium">${ars(r.saldoIva)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.iibb)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.dyc)}</td>
                <td className={`px-3 py-2 text-right font-medium border-r-2 border-orange-300 ${r.totalImpuestos >= 0 ? "text-red-600" : "text-green-600"}`}>
                  {r.totalImpuestos >= 0 ? "-" : "+"}${ars(Math.abs(r.totalImpuestos))}
                </td>
                {/* — Producto — */}
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
