"use client";
import { useState } from "react";
import type { ProcessedRow, Variables } from "@/types";

interface Props {
  rows: ProcessedRow[];
  vars: Variables;
  onFlexCostChange: (numeroVenta: string, cost: number) => void;
}

const ars = (n: number) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const pct = (n: number) => (n * 100).toFixed(1) + "%";

interface TooltipState { text: string; x: number; y: number }

function Th({
  label,
  tooltip,
  onShow,
  onHide,
}: {
  label: string;
  tooltip: string;
  onShow: (t: TooltipState) => void;
  onHide: () => void;
}) {
  return (
    <th className="px-3 py-2 font-semibold whitespace-nowrap">
      <div
        className="inline-flex items-center gap-1 cursor-default"
        onMouseEnter={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onShow({ text: tooltip, x: r.left + r.width / 2, y: r.bottom });
        }}
        onMouseLeave={onHide}
      >
        <span>{label}</span>
        <span className="text-zinc-400 opacity-60 text-[10px] leading-none">ⓘ</span>
      </div>
    </th>
  );
}

function CmgBadge({ v }: { v: number }) {
  const pctVal = v * 100;
  const color =
    pctVal >= 30
      ? "bg-emerald-100 text-emerald-800"
      : pctVal >= 15
      ? "bg-amber-100 text-amber-800"
      : "bg-red-100 text-red-700";
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {pct(v)}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  valueClass = "text-black",
  note,
}: {
  label: string;
  value: string;
  valueClass?: string;
  note?: string;
}) {
  return (
    <div className="border border-zinc-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-zinc-400 mb-2">{label}</p>
      <p className={`text-xl font-black leading-none ${valueClass}`}>{value}</p>
      {note && <p className="text-[10px] text-zinc-400 mt-1.5">{note}</p>}
    </div>
  );
}

export default function DataTable({ rows, vars, onFlexCostChange }: Props) {
  const [tip, setTip] = useState<TooltipState | null>(null);

  if (rows.length === 0)
    return <p className="text-zinc-400 text-sm p-8 text-center">Sin datos</p>;

  const totalSinIva = rows.reduce((s, r) => s + r.facturacionSinIva, 0);
  const totalCosto = rows.reduce((s, r) => s + r.costoTotal, 0);
  const totalMargen = rows.reduce((s, r) => s + r.margen, 0);
  const avgCmg = totalSinIva > 0 ? totalMargen / totalSinIva : 0;

  const th = (label: string, tooltip: string) => (
    <Th label={label} tooltip={tooltip} onShow={setTip} onHide={() => setTip(null)} />
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Tooltip */}
      {tip && (
        <div
          className="fixed z-[9999] w-56 bg-black text-white text-[11px] px-3 py-2 shadow-xl pointer-events-none leading-relaxed"
          style={{ left: tip.x, top: tip.y + 6, transform: "translateX(-50%)" }}
        >
          {tip.text}
        </div>
      )}

      {/* Cards resumen */}
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard
          label="Ventas S/IVA"
          value={`$${ars(totalSinIva)}`}
        />
        <SummaryCard
          label="Costo total"
          value={`$${ars(totalCosto)}`}
          valueClass="text-red-600"
          note={totalSinIva > 0 ? `${(totalCosto / totalSinIva * 100).toFixed(1)}% de ventas` : undefined}
        />
        <SummaryCard
          label="Margen"
          value={`$${ars(totalMargen)}`}
          valueClass={totalMargen >= 0 ? "text-emerald-700" : "text-red-600"}
        />
        <div className="border border-zinc-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-zinc-400 mb-2">CMG Promedio</p>
          <p
            className={`text-xl font-black leading-none ${
              avgCmg >= 0.3
                ? "text-emerald-700"
                : avgCmg >= 0.15
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {pct(avgCmg)}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1.5">{rows.length} operaciones</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-zinc-200">
        <table className="min-w-full text-[11px]">
          <thead>
            {/* Section headers */}
            <tr className="text-center text-[10px] font-bold uppercase tracking-[0.1em]">
              <th colSpan={8} className="px-3 py-2 bg-black text-white border-r-2 border-zinc-600">
                Operación
              </th>
              <th colSpan={7} className="px-3 py-2 bg-zinc-700 text-white border-r-2 border-zinc-500">
                MercadoLibre
              </th>
              <th colSpan={6} className="px-3 py-2 bg-zinc-500 text-white border-r-2 border-zinc-300">
                Impuestos
              </th>
              <th colSpan={4} className="px-3 py-2 bg-zinc-200 text-zinc-800">
                Producto
              </th>
            </tr>
            {/* Column headers */}
            <tr className="bg-zinc-50 text-zinc-600 text-left text-[10px] border-b border-zinc-200">
              {th("# Op.", "ID de la operación en MercadoLibre.")}
              {th("Fecha", "Fecha de la venta según MercadoLibre.")}
              {th("SKU", "Código interno del producto.")}
              {th("Título", "Nombre de la publicación en MercadoLibre.")}
              {th("Uds.", "Cantidad de unidades vendidas.")}
              {th("Fact. C/IVA", "Ingresos por la venta incluyendo IVA.")}
              {th("Fact. S/IVA", "Ingresos netos de IVA. Base de cálculo para IIBB y otras métricas.")}
              {th("IVA %", "Alícuota de IVA aplicada a este producto.")}
              {/* MercadoLibre */}
              {th("Com. %", "Porcentaje de comisión de MercadoLibre según categoría.")}
              {th("Comisión", "Comisión % aplicada sobre Fact. C/IVA.")}
              {th("Com. Fija", "Cargo fijo de MeLi por operación según precio unitario.")}
              {th("Cuotas", "Cargo por ofrecer cuotas sin interés.")}
              {th("Tot. Com.", "Total comisiones MeLi = Com. % + Fija + Cuotas.")}
              {th("Envío neto", "Ingreso envío cobrado al comprador menos costo descontado. Positivo = beneficio.")}
              {th("Costo Flex", vars.costoEnvioFlexUniversal > 0 ? `Flex universal $${vars.costoEnvioFlexUniversal} C/IVA.` : "Costo de entrega Flex C/IVA. Editá por operación o configurá universal en el panel.")}
              {/* Impuestos */}
              {th("IVA Déb.", "IVA cobrado al comprador = Fact. C/IVA − Fact. S/IVA.")}
              {th("IVA Créd.", "IVA sobre comisiones MeLi que podés computar como crédito fiscal.")}
              {th("Saldo IVA", "IVA neto = IVA Débito − IVA Crédito.")}
              {th("IIBB", "Ingresos Brutos = Fact. S/IVA × tasa IIBB.")}
              {th("D&C", "Débitos y Créditos = Fact. C/IVA × tasa D&C.")}
              {th("Tot. Imp.", "Total impuestos netos = IIBB + D&C − Envío neto.")}
              {/* Producto */}
              {th("Costo Merc.", "Costo de mercadería = Costo USD × Cotización Blue × Unidades.")}
              {th("Costo Total", "Comisiones + Impuestos + Mercadería + Flex.")}
              {th("Margen", "Ganancia neta = Fact. S/IVA − Costo Total.")}
              {th("CMG %", "Contribución Marginal = Margen ÷ Fact. S/IVA.")}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((r, i) => (
              <tr
                key={i}
                className={`text-zinc-800 transition-colors hover:bg-zinc-50 ${
                  i % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                }`}
              >
                {/* Operación */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <a
                    href={`https://www.mercadolibre.com.ar/ventas/${r.numeroVenta}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-black underline underline-offset-2 font-mono text-[10px] transition-colors"
                  >
                    {r.numeroVenta}
                  </a>
                </td>
                <td className="px-3 py-2 text-zinc-500 whitespace-nowrap text-[10px]">
                  {r.fechaVenta.replace(" hs.", "").split(" de ").slice(0, 3).join("/") ||
                    r.fechaVenta.split(" ")[0] ||
                    "–"}
                </td>
                <td className="px-3 py-2 font-mono text-[10px] font-semibold text-zinc-700">
                  {r.sku || "–"}
                </td>
                <td className="px-3 py-2 max-w-48 truncate text-zinc-700" title={r.titulo}>
                  {r.titulo || "–"}
                </td>
                <td className="px-3 py-2 text-center font-semibold text-zinc-800">{r.unidades}</td>
                <td className="px-3 py-2 text-right text-zinc-600">${ars(r.facturacionConIva)}</td>
                <td className="px-3 py-2 text-right font-semibold text-black">${ars(r.facturacionSinIva)}</td>
                <td className="px-3 py-2 text-right text-zinc-400 border-r-2 border-zinc-200">{pct(r.ivaPct)}</td>

                {/* MercadoLibre */}
                <td className="px-3 py-2 text-right text-zinc-500">{pct(r.comisionPct)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.comision)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.comisionFija)}</td>
                <td className="px-3 py-2 text-right text-red-500">
                  {r.cuotas > 0 ? `-$${ars(r.cuotas)}` : <span className="text-zinc-300">–</span>}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-red-600">-${ars(r.totalComisiones)}</td>
                <td className={`px-3 py-2 text-right font-medium ${r.envioNeto >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {r.envioNeto >= 0 ? "+" : "-"}${ars(Math.abs(r.envioNeto))}
                </td>
                <td className="px-3 py-2 text-right border-r-2 border-zinc-200">
                  {r.ingresoEnvio > 0 ? (
                    vars.costoEnvioFlexUniversal > 0 ? (
                      <span className="text-red-500">-${ars(vars.costoEnvioFlexUniversal)}</span>
                    ) : (
                      <input
                        key={r.numeroVenta}
                        type="number"
                        className="w-24 text-right border border-zinc-200 px-1.5 py-0.5 text-[11px] text-black bg-white focus:outline-none focus:border-black transition-colors"
                        defaultValue={vars.flexCosts?.[r.numeroVenta] || ""}
                        placeholder="$0"
                        onBlur={(e) =>
                          onFlexCostChange(r.numeroVenta, parseFloat(e.target.value) || 0)
                        }
                      />
                    )
                  ) : (
                    <span className="text-zinc-300">–</span>
                  )}
                </td>

                {/* Impuestos */}
                <td className="px-3 py-2 text-right text-zinc-600">${ars(r.iva)}</td>
                <td className="px-3 py-2 text-right text-emerald-600">-${ars(r.ivaCredito)}</td>
                <td className="px-3 py-2 text-right font-semibold text-amber-600">${ars(r.saldoIva)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.iibb)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.dyc)}</td>
                <td
                  className={`px-3 py-2 text-right font-semibold border-r-2 border-zinc-200 ${
                    r.totalImpuestos >= 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {r.totalImpuestos >= 0 ? "-" : "+"}${ars(Math.abs(r.totalImpuestos))}
                </td>

                {/* Producto */}
                <td className="px-3 py-2 text-right text-red-500">
                  {r.costoLandTotal > 0 ? `-$${ars(r.costoLandTotal)}` : <span className="text-zinc-300">–</span>}
                </td>
                <td className="px-3 py-2 text-right font-bold text-red-700">-${ars(r.costoTotal)}</td>
                <td
                  className={`px-3 py-2 text-right font-bold ${
                    r.margen >= 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  ${ars(r.margen)}
                </td>
                <td className="px-3 py-2 text-right">
                  <CmgBadge v={r.cmgPct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
