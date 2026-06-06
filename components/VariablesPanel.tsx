"use client";
import { useRef } from "react";
import type { Variables, ComisionFijaTier, SkuConfig } from "@/types";

interface Props {
  vars: Variables;
  onChange: (v: Variables) => void;
  onSkuImport: (buffer: ArrayBuffer) => void;
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
      <label className="text-xs text-zinc-600 flex-1">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          step="0.1"
          className="w-20 text-right border border-zinc-200 px-2 py-1.5 text-xs text-black bg-white focus:outline-none focus:border-black transition-colors"
          value={(value * 100).toFixed(2)}
          onChange={(e) => onChange(parseFloat(e.target.value) / 100 || 0)}
        />
        <span className="text-xs text-zinc-400 w-3">%</span>
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
      <label className="text-xs text-zinc-600 flex-1">{label}</label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-xs text-zinc-400">{prefix}</span>}
        <input
          type="number"
          className="w-28 text-right border border-zinc-200 px-2 py-1.5 text-xs text-black bg-white focus:outline-none focus:border-black transition-colors"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}

function SectionHeader({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">{children}</p>
      {note && <p className="text-[10px] text-zinc-400 mt-0.5">{note}</p>}
    </div>
  );
}

function SkuRow({
  cfg,
  defaultIva,
  onChange,
}: {
  cfg: SkuConfig;
  defaultIva: number;
  onChange: (updated: SkuConfig) => void;
}) {
  const set = (partial: Partial<SkuConfig>) => onChange({ ...cfg, ...partial });

  return (
    <div className="border border-zinc-100 bg-zinc-50/50 p-2.5 space-y-2">
      <p className="text-[10px] font-bold text-black uppercase tracking-wide truncate" title={cfg.sku}>
        {cfg.sku}
      </p>
      {cfg.titulo && (
        <p className="text-[10px] text-zinc-400 truncate -mt-1" title={cfg.titulo}>
          {cfg.titulo}
        </p>
      )}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-medium text-zinc-400 uppercase tracking-wide">LAND (USD)</label>
          <input
            type="number"
            step="0.01"
            className="w-full text-right border border-zinc-200 px-1.5 py-1 text-[11px] text-black bg-white focus:outline-none focus:border-black transition-colors"
            value={cfg.costoLandUsd}
            onChange={(e) => set({ costoLandUsd: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-medium text-zinc-400 uppercase tracking-wide">Com. %</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              className="w-full text-right border border-zinc-200 px-1.5 py-1 text-[11px] text-black bg-white focus:outline-none focus:border-black transition-colors"
              value={(cfg.comisionPct * 100).toFixed(1)}
              onChange={(e) => set({ comisionPct: parseFloat(e.target.value) / 100 || 0 })}
            />
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-medium text-zinc-400 uppercase tracking-wide">IVA %</label>
          <select
            className="w-full border border-zinc-200 px-1 py-1 text-[11px] text-black bg-white focus:outline-none focus:border-black transition-colors"
            value={(cfg.ivaPct * 100).toFixed(1)}
            onChange={(e) => set({ ivaPct: parseFloat(e.target.value) / 100 })}
          >
            <option value="21.0">21%</option>
            <option value="10.5">10.5%</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function VariablesPanel({ vars, onChange, onSkuImport }: Props) {
  const set = (partial: Partial<Variables>) => onChange({ ...vars, ...partial });
  const skuImportRef = useRef<HTMLInputElement>(null);

  const setTier = (i: number, field: keyof ComisionFijaTier, value: number) => {
    const tiers = vars.comisionFijaTiers.map((t, idx) =>
      idx === i ? { ...t, [field]: value } : t
    );
    set({ comisionFijaTiers: tiers });
  };

  const setSkuConfig = (sku: string, updated: SkuConfig) => {
    set({ skuConfigs: { ...vars.skuConfigs, [sku]: updated } });
  };

  const skuList = Object.values(vars.skuConfigs).sort((a, b) => a.sku.localeCompare(b.sku));

  return (
    <aside className="w-72 min-w-64 bg-white border-r border-zinc-200 flex flex-col h-full overflow-y-auto">
      {/* Panel header */}
      <div className="px-5 h-14 flex items-center border-b border-zinc-200 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Variables</p>
      </div>

      {/* Tasas impositivas */}
      <section className="px-5 py-5 border-b border-zinc-100">
        <SectionHeader>Tasas impositivas</SectionHeader>
        <div className="space-y-2.5">
          <PctInput label="IVA" value={vars.ivaPct} onChange={(v) => set({ ivaPct: v })} />
          <PctInput label="IIBB" value={vars.iibbPct} onChange={(v) => set({ iibbPct: v })} />
          <PctInput label="D&C" value={vars.dycPct} onChange={(v) => set({ dycPct: v })} />
        </div>
      </section>

      {/* Comisión fija MeLi */}
      <section className="px-5 py-5 border-b border-zinc-100">
        <SectionHeader note="Por tramo de precio unitario de venta">Comisión fija MeLi</SectionHeader>
        <div className="space-y-2">
          {vars.comisionFijaTiers.map((tier, i) => {
            const isLast = i === vars.comisionFijaTiers.length - 1;
            return (
              <div key={i} className="border border-zinc-100 p-2.5 space-y-2 bg-zinc-50/50">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                    Hasta $
                  </label>
                  <input
                    type="number"
                    placeholder={isLast ? "∞" : ""}
                    className="w-24 text-right border border-zinc-200 px-2 py-1.5 text-xs text-black bg-white focus:outline-none focus:border-black transition-colors"
                    value={tier.precioMax === Infinity ? "" : tier.precioMax}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setTier(i, "precioMax", isNaN(v) ? Infinity : v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                    Comisión
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-24 text-right border border-zinc-200 px-2 py-1.5 text-xs text-black bg-white focus:outline-none focus:border-black transition-colors"
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

      {/* Comisiones MercadoLibre */}
      <section className="px-5 py-5 border-b border-zinc-100">
        <SectionHeader>Comisiones MercadoLibre</SectionHeader>
        <PctInput
          label="Recargo cuotas"
          value={vars.cuotasPct}
          onChange={(v) => set({ cuotasPct: v })}
        />
      </section>

      {/* Cotización USD */}
      <section className="px-5 py-5 border-b border-zinc-100">
        <SectionHeader note="Para convertir costos USD → ARS">Cotización USD</SectionHeader>
        <NumInput
          label="Blue (ARS/USD)"
          value={vars.cotizacionBlue}
          onChange={(v) => set({ cotizacionBlue: v })}
          prefix="$"
        />
      </section>

      {/* Envío Flex */}
      <section className="px-5 py-5 border-b border-zinc-100">
        <SectionHeader note="C/IVA. Si está vacío, se carga por operación en la tabla.">
          Envío Flex
        </SectionHeader>
        <NumInput
          label="Costo universal"
          value={vars.costoEnvioFlexUniversal}
          onChange={(v) => set({ costoEnvioFlexUniversal: v })}
          prefix="$"
        />
      </section>

      {/* Productos / SKUs */}
      <section className="px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Productos</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Costo LAND, comisión e IVA por SKU</p>
          </div>
          <button
            onClick={() => skuImportRef.current?.click()}
            className="text-[10px] font-bold uppercase tracking-wide border border-zinc-300 px-2.5 py-1.5 text-zinc-600 hover:border-black hover:text-black transition-colors cursor-pointer whitespace-nowrap"
          >
            ↑ Importar
          </button>
          <input
            ref={skuImportRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                f.arrayBuffer().then((buf) => onSkuImport(buf));
                e.target.value = "";
              }
            }}
          />
        </div>

        {skuList.length === 0 ? (
          <p className="text-[10px] text-zinc-400 text-center py-4 border border-dashed border-zinc-200">
            Cargá el reporte de MeLi o importá<br />tu planilla de costos
          </p>
        ) : (
          <div className="space-y-2">
            {skuList.map((cfg) => (
              <SkuRow
                key={cfg.sku}
                cfg={cfg}
                defaultIva={vars.ivaPct}
                onChange={(updated) => setSkuConfig(cfg.sku, updated)}
              />
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
