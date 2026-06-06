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
      className={`flex flex-col items-center justify-center border-2 border-dashed p-16 cursor-pointer transition-colors ${
        dragging
          ? "border-black bg-zinc-50"
          : "border-zinc-300 bg-white hover:border-zinc-600 hover:bg-zinc-50/50"
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
      <svg
        className={`w-8 h-8 mb-5 transition-colors ${dragging ? "text-black" : "text-zinc-300"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <p className="text-sm font-black uppercase tracking-[0.14em] text-black">
        Subir reporte
      </p>
      <p className="text-xs text-zinc-500 mt-2">
        MercadoLibre · arrastrá o hacé click
      </p>
      <p className="text-[10px] text-zinc-400 mt-1">.xlsx sin modificar</p>
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
