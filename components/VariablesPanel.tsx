"use client";
import { useRef } from "react";
import type { Variables, ComisionFijaTier } from "@/types";

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

export default function VariablesPanel({ vars, onChange, onSkuImport }: Props) {
  const set = (partial: Partial<Variables>) => onChange({ ...vars, ...partial });
  const skuImportRef = useRef<HTMLInputElement>(null);

  const setTier = (i: number, field: keyof ComisionFijaTier, value: number) => {
    const tiers = vars.comisionFijaTiers.map((t, idx) =>
      idx === i ? { ...t, [field]: value } : t
    );
    set({ comisionFijaTiers: tiers });
  };

  const skuCount = Object.keys(vars.skuConfigs).length;

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

      {/* Costos de productos */}
      <section className="px-5 py-5">
        <SectionHeader note="Planilla con columnas SKU, Landed, Com. ML">
          Costos de productos
        </SectionHeader>
        <button
          onClick={() => skuImportRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 border border-zinc-300 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-600 hover:border-black hover:text-black transition-colors cursor-pointer"
        >
          ↑ Importar Excel
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
        {skuCount > 0 && (
          <p className="text-[10px] text-zinc-400 text-center mt-2">
            {skuCount} SKU{skuCount !== 1 ? "s" : ""} cargado{skuCount !== 1 ? "s" : ""}
          </p>
        )}
      </section>
    </aside>
  );
}
