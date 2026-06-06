"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FileUpload from "@/components/FileUpload";
import VariablesPanel from "@/components/VariablesPanel";
import DataTable from "@/components/DataTable";
import { parseExcel, extractSkus } from "@/lib/parseExcel";
import { processRows } from "@/lib/calculations";
import { exportToExcel } from "@/lib/exportExcel";
import type { MeliRow, Variables } from "@/types";

const STORAGE_KEY = "cmg-meli-vars";

const DEFAULT_VARS: Variables = {
  ivaPct: 0.21,
  iibbPct: 0.05,
  dycPct: 0.006,
  cuotasPct: 0.08,
  cotizacionBlue: 1200,
  comisionFijaTiers: [
    { precioMax: 11999, monto: 743.80 },
    { precioMax: Infinity, monto: 1487.60 },
  ],
  skuConfigs: {},
  costoEnvioFlexUniversal: 0,
  flexCosts: {},
};

function loadVars(): Variables {
  if (typeof window === "undefined") return DEFAULT_VARS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_VARS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_VARS;
}

export default function Home() {
  const [rows, setRows] = useState<MeliRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [vars, setVars] = useState<Variables>(DEFAULT_VARS);

  useEffect(() => {
    setVars(loadVars());
  }, []);

  const handleVarsChange = useCallback((v: Variables) => {
    setVars(v);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch {}
  }, []);

  const handleFile = useCallback(
    (buffer: ArrayBuffer, name: string) => {
      const parsed = parseExcel(buffer);
      setRows(parsed);
      setFileName(name);

      const skus = extractSkus(parsed);
      const newSkuConfigs = { ...vars.skuConfigs };
      let changed = false;
      skus.forEach((sku) => {
        if (!newSkuConfigs[sku]) {
          const sample = parsed.find((r) => r.sku === sku);
          newSkuConfigs[sku] = {
            sku,
            titulo: sample?.titulo || "",
            ivaPct: vars.ivaPct,
            comisionPct: 0.145,
            esPremium: false,
            costoLandUsd: 0,
          };
          changed = true;
        }
      });
      if (changed) {
        handleVarsChange({ ...vars, skuConfigs: newSkuConfigs });
      }
    },
    [vars, handleVarsChange]
  );

  const handleFlexCostChange = useCallback(
    (numeroVenta: string, cost: number) => {
      handleVarsChange({ ...vars, flexCosts: { ...vars.flexCosts, [numeroVenta]: cost } });
    },
    [vars, handleVarsChange]
  );

  const processed = useMemo(() => processRows(rows, vars), [rows, vars]);

  const handleExport = () => exportToExcel(processed, vars);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0 h-14">
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-black uppercase tracking-[0.2em] text-black select-none">
            RUDOLPH
          </span>
          <div className="w-px h-4 bg-zinc-300" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 select-none">
            CMG
          </span>
        </div>

        {rows.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] font-medium text-zinc-600 leading-tight">{fileName}</p>
              <p className="text-[10px] text-zinc-400">{rows.length} ventas cargadas</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white text-[11px] px-4 py-2 font-bold uppercase tracking-[0.1em] transition-colors cursor-pointer"
            >
              ↓ Exportar
            </button>
            <button
              onClick={() => { setRows([]); setFileName(""); }}
              className="text-[11px] text-zinc-400 hover:text-black px-3 py-2 border border-zinc-200 hover:border-zinc-400 transition-colors cursor-pointer"
            >
              Cambiar
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <VariablesPanel vars={vars} onChange={handleVarsChange} />

        <main className="flex-1 overflow-y-auto p-6 bg-white">
          {rows.length === 0 ? (
            <div className="max-w-lg mx-auto mt-16">
              <FileUpload onFile={handleFile} />
              <div className="mt-6 border border-zinc-200 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 mb-4">
                  ¿Cómo usar?
                </p>
                <ol className="space-y-3">
                  {[
                    "Descargá el reporte de ventas desde MercadoLibre (sin modificarlo)",
                    "Subilo acá",
                    "Configurá las variables en el panel izquierdo",
                    "Exportá el Excel con todos los cálculos",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-zinc-600">
                      <span className="shrink-0 w-5 h-5 border border-zinc-300 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <DataTable rows={processed} vars={vars} onFlexCostChange={handleFlexCostChange} />
          )}
        </main>
      </div>
    </div>
  );
}
