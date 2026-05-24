"use client";
import { useRef, useState } from "react";

interface Props {
  onFile: (buffer: ArrayBuffer, name: string) => void;
}

export default function FileUpload({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = (file: File) => {
    file.arrayBuffer().then((buf) => onFile(buf, file.name));
  };

  return (
    <div
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-16 cursor-pointer transition-colors ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handle(f);
      }}
    >
      <div className="text-5xl mb-4">📊</div>
      <p className="text-lg font-semibold text-gray-700">Subir Excel de MercadoLibre</p>
      <p className="text-sm text-gray-500 mt-2">Arrastrá el archivo o hacé click para seleccionar</p>
      <p className="text-xs text-gray-400 mt-1">.xlsx · Reporte de ventas sin modificar</p>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />
    </div>
  );
}
