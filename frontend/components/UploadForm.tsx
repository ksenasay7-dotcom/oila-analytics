"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileSpreadsheet, X, CheckCircle2, AlertCircle } from "lucide-react";
import type { Outlet } from "@/lib/data/types";
import { monthName } from "@/lib/format";

type Props = {
  outlets: Outlet[];
};

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export function UploadForm({ outlets }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    { success: true; rowsImported: number; warnings: string[] } | { success: false; error: string } | null
  >(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  }

  async function handleSubmit() {
    if (!file || !outletId) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("outletId", outletId);
    formData.append("periodMonth", String(month));
    formData.append("periodYear", String(year));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, error: data.error ?? "Ошибка загрузки" });
      } else {
        setResult({
          success: true,
          rowsImported: data.rowsImported,
          warnings: data.warnings ?? [],
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      }
    } catch {
      setResult({ success: false, error: "Не удалось связаться с сервером" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-6">
      {/* Точка + период */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-[13px] text-[#8A8A8E] mb-2">
            Торговая точка
          </label>
          <select
            value={outletId}
            onChange={(e) => setOutletId(e.target.value)}
            className="w-full bg-[#0E0E0F] border border-[#2A2A2D] rounded-[8px] px-3 py-2.5 text-[14px] text-[#F5F3EF] outline-none focus:border-[#FF6A1A] transition-colors"
          >
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] text-[#8A8A8E] mb-2">
            Месяц
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full bg-[#0E0E0F] border border-[#2A2A2D] rounded-[8px] px-3 py-2.5 text-[14px] text-[#F5F3EF] outline-none focus:border-[#FF6A1A] transition-colors"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {monthName(m)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] text-[#8A8A8E] mb-2">Год</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full bg-[#0E0E0F] border border-[#2A2A2D] rounded-[8px] px-3 py-2.5 text-[14px] text-[#F5F3EF] outline-none focus:border-[#FF6A1A] transition-colors"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Зона загрузки файла */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        id="file-input"
      />

      {!file ? (
        <label
          htmlFor="file-input"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#2A2A2D] rounded-[10px] py-12 cursor-pointer hover:border-[#FF6A1A]/50 transition-colors"
        >
          <UploadCloud size={28} className="text-[#8A8A8E]" strokeWidth={1.5} />
          <div className="text-center">
            <p className="text-[14px] text-[#F5F3EF]">
              Перетащите файл сюда или нажмите, чтобы выбрать
            </p>
            <p className="text-[13px] text-[#8A8A8E] mt-1">
              Поддерживаются .xlsx и .xls
            </p>
          </div>
        </label>
      ) : (
        <div className="flex items-center justify-between border border-[#2A2A2D] rounded-[10px] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={20} className="text-[#FF6A1A]" strokeWidth={1.75} />
            <div>
              <p className="text-[14px] text-[#F5F3EF]">{file.name}</p>
              <p className="text-[12px] text-[#8A8A8E]">
                {(file.size / 1024).toFixed(0)} КБ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setResult(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-[#8A8A8E] hover:text-[#F5F3EF] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Результат */}
      {result && (
        <div
          className={`mt-4 rounded-[10px] px-4 py-3 text-[13px] ${
            result.success
              ? "bg-[#0E1F14] border border-[#4ADE80]/30 text-[#4ADE80]"
              : "bg-[#3A2415] border border-[#F85149]/30 text-[#F85149]"
          }`}
        >
          {result.success ? (
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <div>
                <p>Загружено успешно: {result.rowsImported} строк</p>
                {result.warnings.length > 0 && (
                  <ul className="mt-1.5 text-[#8A8A8E] list-disc list-inside">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="w-full mt-5 bg-[#FF6A1A] hover:bg-[#C9501A] disabled:opacity-40 disabled:cursor-not-allowed text-[#0E0E0F] font-medium text-[14px] rounded-[8px] py-3 transition-colors"
      >
        {loading ? "Загружаем и обрабатываем..." : "Загрузить файл"}
      </button>
    </div>
  );
}
