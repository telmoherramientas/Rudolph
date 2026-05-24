"use client";
import type { Variables, SkuConfig, ComisionFijaTier } from "@/types";

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

  const setSkuField = (sku: string, field: keyof SkuConfig, value: number | boolean) => {
    set({
      skuConfigs: {
        ...vars.skuConfigs,
        [sku]: { ...vars.skuConfigs[sku], [field]: value },
      },
    });
  };

  const setTier = (i: number, field: keyof ComisionFijaTier, value: number) => {
    const tiers = vars.comisionFijaTiers.map((t, idx) => idx === i ? { ...t, [field]: value } : t);
    set({ comisionFijaTiers: tiers });
  };

  const skus = Object.values(vars.skuConfigs);

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
                  <label className="text-xs text-gray-700">
                    {i === 0 ? "Hasta $" : "Hasta $"}
                  </label>
                  <input
                    type="number"
                    disabled={isLast}
                    className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                    value={isLast ? "∞" : tier.precioMax}
                    onChange={(e) => setTier(i, "precioMax", parseFloat(e.target.value) || 0)}
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

      {/* SKU configs */}
      {skus.length > 0 && (
        <section className="px-4 py-4 flex-1">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Configuración por SKU</h3>
          <div className="space-y-4">
            {skus.map((cfg) => (
              <div key={cfg.sku} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-blue-700 truncate" title={cfg.titulo}>
                  {cfg.sku || <span className="italic text-gray-400">Sin SKU</span>}
                </p>
                <p className="text-xs text-gray-400 truncate">{cfg.titulo}</p>
                <div className="space-y-2 mt-1">

                  {/* IVA */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-gray-800">IVA</label>
                    <div className="flex gap-1">
                      {[21, 10.5].map((v) => (
                        <button key={v}
                          onClick={() => setSkuField(cfg.sku, "ivaPct", v / 100)}
                          className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                            Math.abs((cfg.ivaPct ?? vars.ivaPct) * 100 - v) < 0.1
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                          }`}
                        >{v}%</button>
                      ))}
                    </div>
                  </div>

                  {/* Comisión % */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-gray-800">Comisión %</label>
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1"
                        className="w-16 text-right border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={(cfg.comisionPct * 100).toFixed(1)}
                        onChange={(e) => setSkuField(cfg.sku, "comisionPct", parseFloat(e.target.value) / 100 || 0)}
                      />
                      <span className="text-xs text-gray-700">%</span>
                    </div>
                  </div>

                  {/* Premium toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-gray-800">Publicación Premium</label>
                    <button
                      onClick={() => setSkuField(cfg.sku, "esPremium", !cfg.esPremium)}
                      className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                        cfg.esPremium
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                      }`}
                    >
                      {cfg.esPremium ? "Premium (sin com. fija)" : "Clásica"}
                    </button>
                  </div>

                  {/* Costo LAND */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-gray-800">Costo LAND (USD)</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-700">U$D</span>
                      <input type="number" step="0.01"
                        className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={cfg.costoLandUsd}
                        onChange={(e) => setSkuField(cfg.sku, "costoLandUsd", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
