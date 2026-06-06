"use client";
import type { Variables, ComisionFijaTier } from "@/types";

interface Props {
  vars: Variables;
  onChange: (v: Variables) => void;
}

function PctInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-gray-800 flex-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number" step="0.1"
          className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={(value * 100).toFixed(2)}
          onChange={(e) => onChange(parseFloat(e.target.value) / 100 || 0)}
        />
        <span className="text-sm text-gray-700">%</span>
      </div>
    </div>
  );
}

function NumInput({ label, value, onChange, prefix }: { label: string; value: number; onChange: (n: number) => void; prefix?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-gray-800 flex-1">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-sm text-gray-700">{prefix}</span>}
        <input
          type="number"
          className="w-28 text-right border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}

export default function VariablesPanel({ vars, onChange }: Props) {
  const set = (partial: Partial<Variables>) => onChange({ ...vars, ...partial });

  const setTier = (i: number, field: keyof ComisionFijaTier, value: number) => {
    const tiers = vars.comisionFijaTiers.map((t, idx) =>
      idx === i ? { ...t, [field]: value } : t
    );
    set({ comisionFijaTiers: tiers });
  };

  return (
    <aside className="w-80 min-w-72 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-800">Variables</h2>
      </div>

      {/* Tasas */}
      <section className="px-4 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Tasas impositivas</h3>
        <div className="space-y-2">
          <PctInput label="IVA (default)" value={vars.ivaPct} onChange={(v) => set({ ivaPct: v })} />
          <p className="text-xs text-gray-400">Podés cambiar IVA por SKU abajo (21% o 10.5%)</p>
          <PctInput label="IIBB" value={vars.iibbPct} onChange={(v) => set({ iibbPct: v })} />
          <PctInput label="D&C" value={vars.dycPct} onChange={(v) => set({ dycPct: v })} />
        </div>
      </section>

      {/* Comisión fija MeLi por tramos */}
      <section className="px-4 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Comisión fija MeLi</h3>
        <p className="text-xs text-gray-400 mb-3">Por tramo de precio unitario de venta</p>
        <div className="space-y-2">
          {vars.comisionFijaTiers.map((tier, i) => {
            const isLast = i === vars.comisionFijaTiers.length - 1;
            return (
              <div key={i} className="bg-gray-50 rounded-lg p-2 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-gray-700">Hasta $</label>
                  <input
                    type="number"
                    placeholder={isLast ? "∞" : ""}
                    className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={tier.precioMax === Infinity ? "" : tier.precioMax}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setTier(i, "precioMax", isNaN(v) ? Infinity : v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-gray-700">Comisión</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">$</span>
                    <input
                      type="number" step="0.01"
                      className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={tier.monto}
                      onChange={(e) => setTier(i, "monto", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comisiones % y cuotas */}
      <section className="px-4 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Comisiones MercadoLibre</h3>
        <PctInput label="Recargo cuotas" value={vars.cuotasPct} onChange={(v) => set({ cuotasPct: v })} />
      </section>

      {/* Cotización */}
      <section className="px-4 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Cotización USD</h3>
        <NumInput label="Blue (ARS/USD)" value={vars.cotizacionBlue} onChange={(v) => set({ cotizacionBlue: v })} prefix="$" />
        <p className="text-xs text-gray-400 mt-2">Para convertir el costo de producto en USD a ARS</p>
      </section>

      {/* Envío Flex */}
      <section className="px-4 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Envío Flex</h3>
        <p className="text-xs text-gray-400 mb-3">Costo de entrega (C/IVA) para envíos Flex. Si está vacío, se carga por operación en la tabla.</p>
        <NumInput
          label="Costo universal"
          value={vars.costoEnvioFlexUniversal}
          onChange={(v) => set({ costoEnvioFlexUniversal: v })}
          prefix="$"
        />
      </section>

    </aside>
  );
}
