import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string;
  delta?: number; // в процентах, например 12.4 или -5.2
  deltaLabel?: string; // например "к марту"
  accent?: boolean; // выделить как главный KPI оранжевым
};

export function KpiCard({
  label,
  value,
  delta,
  deltaLabel = "к прошлому периоду",
  accent = false,
}: KpiCardProps) {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-5 flex flex-col gap-3">
      <span className="text-[13px] text-[#8A8A8E]">{label}</span>

      <span
        className={`font-mono-num text-[28px] font-medium leading-none ${
          accent ? "text-[#FF6A1A]" : "text-[#F5F3EF]"
        }`}
      >
        {value}
      </span>

      {delta !== undefined && (
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center gap-0.5 text-[13px] font-medium ${
              isPositive ? "text-[#4ADE80]" : "text-[#F85149]"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={14} strokeWidth={2} />
            ) : (
              <ArrowDownRight size={14} strokeWidth={2} />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-[13px] text-[#8A8A8E]">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
