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

  const processed = useMemo(() => processRows(rows, vars), [rows, vars]);

  const handleExport = () => exportToExcel(processed, vars);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">CMG Calculator</h1>
            <p className="text-xs text-gray-500">MercadoLibre · Análisis de rentabilidad</p>
          </div>
        </div>
        {rows.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">{fileName}</p>
              <p className="text-xs text-gray-400">{rows.length} ventas cargadas</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ↓ Exportar Excel
            </button>
            <button
              onClick={() => { setRows([]); setFileName(""); }}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg transition-colors"
            >
              Cambiar archivo
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <VariablesPanel vars={vars} onChange={handleVarsChange} />

        <main className="flex-1 overflow-y-auto p-6">
          {rows.length === 0 ? (
            <div className="max-w-xl mx-auto mt-16">
              <FileUpload onFile={handleFile} />
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <p className="font-semibold mb-1">¿Cómo usar?</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-600">
                  <li>Descargá el reporte de ventas desde MercadoLibre (sin modificarlo)</li>
                  <li>Subilo acá</li>
                  <li>Configurá las variables y el costo de cada producto en el panel izquierdo</li>
                  <li>Exportá el Excel con todos los cálculos</li>
                </ol>
              </div>
            </div>
          ) : (
            <DataTable rows={processed} />
          )}
        </main>
      </div>
    </div>
  );
}
