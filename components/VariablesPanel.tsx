"use client";
import { useRef } from "react";
import type { Variables, SkuConfig, ComisionFijaTier } from "@/types";
import { parseProductsExcel } from "@/lib/parseProductsExcel";

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
  const fileRef = useRef<HTMLInputElement>(null);
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
    const tiers = vars.comisionFijaTiers.map((t, idx) =>
      idx === i ? { ...t, [field]: value } : t
    );
    set({ comisionFijaTiers: tiers });
  };

  const handleProductsImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      const products = parseProductsExcel(buffer);
      if (products.length === 0) {
        alert("No se encontraron productos. Verificá que el archivo tenga una columna 'SKU', 'Landed' y '% Com. ML'.");
        return;
      }
      const newSkuConfigs: Record<string, SkuConfig> = {};
      products.forEach((p) => {
        const existing = vars.skuConfigs[p.sku];
        newSkuConfigs[p.sku] = {
          sku: p.sku,
          titulo: p.titulo,
          ivaPct: existing?.ivaPct ?? vars.ivaPct,
          esPremium: existing?.esPremium ?? false,
          costoLandUsd: p.costoLandUsd,
          comisionPct: p.comisionPct,
        };
      });
      set({ skuConfigs: newSkuConfigs });
      // Reset input so the same file can be re-imported
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
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

      {/* Productos — importar desde Excel */}
      <section className="px-4 py-4 flex-1">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Productos</h3>
        <p className="text-xs text-gray-400 mb-3">Costo LAND y comisión MeLi por SKU</p>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleProductsImport}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <span>📂</span>
          <span>{skus.length > 0 ? `Reimportar Excel (${skus.length} SKUs)` : "Importar Excel de productos"}</span>
        </button>

        {skus.length > 0 && (
          <div className="mt-3 space-y-2">
            {skus.map((cfg) => (
              <div key={cfg.sku} className="bg-gray-50 rounded-lg p-3 space-y-2">
                {/* SKU + título */}
                <p className="text-xs font-semibold text-blue-700 truncate" title={cfg.titulo}>
                  {cfg.sku || <span className="italic text-gray-400">Sin SKU</span>}
                </p>
                <p className="text-xs text-gray-400 truncate" title={cfg.titulo}>{cfg.titulo}</p>

                {/* Datos importados (read-only) */}
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>LAND: <span className="font-medium text-gray-700">U$D {cfg.costoLandUsd.toFixed(2)}</span></span>
                  <span>Com: <span className="font-medium text-gray-700">{(cfg.comisionPct * 100).toFixed(1)}%</span></span>
                </div>

                {/* IVA toggle */}
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

                {/* Premium toggle */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-gray-800">Publicación</label>
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
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
