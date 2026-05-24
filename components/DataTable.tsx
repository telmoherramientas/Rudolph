"use client";
import type { ProcessedRow } from "@/types";

interface Props {
  rows: ProcessedRow[];
}

const ars = (n: number) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const pct = (n: number) => (n * 100).toFixed(1) + "%";

function CmgBadge({ v }: { v: number }) {
  const pctVal = v * 100;
  const color =
    pctVal >= 30
      ? "bg-green-100 text-green-800"
      : pctVal >= 15
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {pct(v)}
    </span>
  );
}

export default function DataTable({ rows }: Props) {
  if (rows.length === 0)
    return <p className="text-gray-400 text-sm p-8 text-center">Sin datos</p>;

  // Summary totals
  const totalIngresos = rows.reduce((s, r) => s + r.facturacionSinIva, 0);
  const totalCosto = rows.reduce((s, r) => s + r.costoTotal, 0);
  const totalMargen = rows.reduce((s, r) => s + r.margen, 0);
  const avgCmg = totalIngresos > 0 ? totalMargen / totalIngresos : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card label="Ventas (s/IVA)" value={`$${ars(totalIngresos)}`} />
        <Card label="Costo total" value={`$${ars(totalCosto)}`} color="text-red-600" />
        <Card label="Margen total" value={`$${ars(totalMargen)}`} color={totalMargen >= 0 ? "text-green-600" : "text-red-600"} />
        <Card label="CMG promedio" value={pct(avgCmg)} color={avgCmg >= 0.2 ? "text-green-600" : "text-red-600"} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-left">
              <th className="px-3 py-2 font-medium sticky left-0 bg-gray-100">Fecha</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium max-w-48 truncate">Título</th>
              <th className="px-3 py-2 font-medium">Uds.</th>
              <th className="px-3 py-2 font-medium text-right">Facturación S/IVA</th>
              <th className="px-3 py-2 font-medium text-right">Com. %</th>
              <th className="px-3 py-2 font-medium text-right">Comisión</th>
              <th className="px-3 py-2 font-medium text-right">Com. Fija</th>
              <th className="px-3 py-2 font-medium text-right">Cuotas</th>
              <th className="px-3 py-2 font-medium text-right">Tot. Comis.</th>
              <th className="px-3 py-2 font-medium text-right">IIBB</th>
              <th className="px-3 py-2 font-medium text-right">D&C</th>
              <th className="px-3 py-2 font-medium text-right">Envío neto</th>
              <th className="px-3 py-2 font-medium text-right">Tot. Imp.</th>
              <th className="px-3 py-2 font-medium text-right">Costo Land</th>
              <th className="px-3 py-2 font-medium text-right">Costo Total</th>
              <th className="px-3 py-2 font-medium text-right">Margen</th>
              <th className="px-3 py-2 font-medium text-right">CMG %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-2 sticky left-0 bg-inherit text-gray-500 whitespace-nowrap">
                  {r.fechaVenta.split(" ")[0] || "-"}
                </td>
                <td className="px-3 py-2 font-mono text-blue-700">{r.sku || "-"}</td>
                <td className="px-3 py-2 max-w-48 truncate text-gray-700" title={r.titulo}>
                  {r.titulo || "-"}
                </td>
                <td className="px-3 py-2 text-center">{r.unidades}</td>
                <td className="px-3 py-2 text-right">${ars(r.facturacionSinIva)}</td>
                <td className="px-3 py-2 text-right text-gray-500">{pct(r.comisionPct)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.comision)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.comisionFija)}</td>
                <td className="px-3 py-2 text-right text-red-500">
                  {r.cuotas > 0 ? `-$${ars(r.cuotas)}` : "-"}
                </td>
                <td className="px-3 py-2 text-right text-red-600 font-medium">-${ars(r.totalComisiones)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.iibb)}</td>
                <td className="px-3 py-2 text-right text-red-500">-${ars(r.dyc)}</td>
                <td className={`px-3 py-2 text-right ${r.envioNeto >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {r.envioNeto >= 0 ? "+" : "-"}${ars(Math.abs(r.envioNeto))}
                </td>
                <td className={`px-3 py-2 text-right font-medium ${r.totalImpuestos >= 0 ? "text-red-600" : "text-green-600"}`}>
                  {r.totalImpuestos >= 0 ? "-" : "+"}${ars(Math.abs(r.totalImpuestos))}
                </td>
                <td className="px-3 py-2 text-right text-red-500">
                  {r.costoLandTotal > 0 ? `-$${ars(r.costoLandTotal)}` : "-"}
                </td>
                <td className="px-3 py-2 text-right text-red-700 font-semibold">-${ars(r.costoTotal)}</td>
                <td className={`px-3 py-2 text-right font-semibold ${r.margen >= 0 ? "text-green-700" : "text-red-700"}`}>
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

function Card({ label, value, color = "text-gray-800" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
