"use client";
import type { Variables, SkuConfig } from "@/types";

interface Props {
  vars: Variables;
  onChange: (v: Variables) => void;
}

function PctInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-gray-600 flex-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="0.1"
          className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={(value * 100).toFixed(2)}
          onChange={(e) => onChange(parseFloat(e.target.value) / 100 || 0)}
        />
        <span className="text-sm text-gray-500">%</span>
      </div>
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-gray-600 flex-1">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-sm text-gray-500">{prefix}</span>}
        <input
          type="number"
          className="w-28 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}

export default function VariablesPanel({ vars, onChange }: Props) {
  const set = (partial: Partial<Variables>) => onChange({ ...vars, ...partial });

  const setSkuField = (sku: string, field: keyof SkuConfig, value: number) => {
    set({
      skuConfigs: {
        ...vars.skuConfigs,
        [sku]: { ...vars.skuConfigs[sku], [field]: value },
      },
    });
  };

  const skus = Object.values(vars.skuConfigs);

  return (
    <aside className="w-80 min-w-72 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-800">Variables</h2>
      </div>

      {/* Tasas impositivas */}
      <section className="px-4 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Tasas impositivas
        </h3>
        <div className="space-y-2">
          <PctInput label="IVA (default)" value={vars.ivaPct} onChange={(v) => set({ ivaPct: v })} />
          <p className="text-xs text-gray-400">Podés cambiar IVA por SKU abajo (21% o 10.5%)</p>
          <PctInput label="IIBB" value={vars.iibbPct} onChange={(v) => set({ iibbPct: v })} />
          <PctInput label="D&C" value={vars.dycPct} onChange={(v) => set({ dycPct: v })} />
        </div>
      </section>

      {/* Comisiones MeLi */}
      <section className="px-4 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Comisiones MercadoLibre
        </h3>
        <div className="space-y-2">
          <PctInput
            label="Recargo cuotas"
            value={vars.cuotasPct}
            onChange={(v) => set({ cuotasPct: v })}
          />
        </div>
      </section>

      {/* Cotización */}
      <section className="px-4 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Cotización USD
        </h3>
        <NumInput
          label="Blue (ARS/USD)"
          value={vars.cotizacionBlue}
          onChange={(v) => set({ cotizacionBlue: v })}
          prefix="$"
        />
        <p className="text-xs text-gray-400 mt-2">
          Se usa para convertir el costo de producto en USD a ARS
        </p>
      </section>

      {/* SKU configs */}
      {skus.length > 0 && (
        <section className="px-4 py-4 flex-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Configuración por SKU
          </h3>
          <div className="space-y-4">
            {skus.map((cfg) => (
              <div key={cfg.sku} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-blue-700 truncate" title={cfg.titulo}>
                  {cfg.sku || <span className="italic text-gray-400">Sin SKU</span>}
                </p>
                <p className="text-xs text-gray-400 truncate">{cfg.titulo}</p>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-gray-600">IVA</label>
                    <div className="flex gap-1">
                      {[21, 10.5].map((v) => (
                        <button
                          key={v}
                          onClick={() => setSkuField(cfg.sku, "ivaPct", v / 100)}
                          className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                            Math.abs((cfg.ivaPct ?? vars.ivaPct) * 100 - v) < 0.1
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {v}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-gray-600">Comisión %</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        className="w-16 text-right border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={(cfg.comisionPct * 100).toFixed(1)}
                        onChange={(e) =>
                          setSkuField(cfg.sku, "comisionPct", parseFloat(e.target.value) / 100 || 0)
                        }
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-gray-600">Com. fija (ARS)</label>
                    <input
                      type="number"
                      className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={cfg.comisionFija}
                      onChange={(e) =>
                        setSkuField(cfg.sku, "comisionFija", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-gray-600">Costo LAND (USD)</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">U$D</span>
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={cfg.costoLandUsd}
                        onChange={(e) =>
                          setSkuField(cfg.sku, "costoLandUsd", parseFloat(e.target.value) || 0)
                        }
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
