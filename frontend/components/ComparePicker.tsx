"use client";

import { useRouter, usePathname } from "next/navigation";
import { monthName } from "@/lib/format";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

type Props = {
  month1: number;
  year1: number;
  month2: number;
  year2: number;
};

export function ComparePicker({ month1, year1, month2, year2 }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function update(next: Partial<Props>) {
    const merged = { month1, year1, month2, year2, ...next };
    const qs = new URLSearchParams({
      month1: String(merged.month1),
      year1: String(merged.year1),
      month2: String(merged.month2),
      year2: String(merged.year2),
    });
    router.push(`${pathname}?${qs.toString()}`);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-[#18181B] border border-[#2A2A2D] rounded-[10px] px-3 py-2">
        <span className="text-[12px] text-[#8A8A8E]">Период 1</span>
        <select
          value={month1}
          onChange={(e) => update({ month1: Number(e.target.value) })}
          className="bg-transparent text-[13px] text-[#F5F3EF] outline-none"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m} className="bg-[#18181B]">
              {monthName(m)}
            </option>
          ))}
        </select>
        <select
          value={year1}
          onChange={(e) => update({ year1: Number(e.target.value) })}
          className="bg-transparent text-[13px] text-[#F5F3EF] outline-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y} className="bg-[#18181B]">
              {y}
            </option>
          ))}
        </select>
      </div>

      <span className="text-[#8A8A8E] text-[13px]">vs</span>

      <div className="flex items-center gap-2 bg-[#18181B] border border-[#2A2A2D] rounded-[10px] px-3 py-2">
        <span className="text-[12px] text-[#8A8A8E]">Период 2</span>
        <select
          value={month2}
          onChange={(e) => update({ month2: Number(e.target.value) })}
          className="bg-transparent text-[13px] text-[#F5F3EF] outline-none"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m} className="bg-[#18181B]">
              {monthName(m)}
            </option>
          ))}
        </select>
        <select
          value={year2}
          onChange={(e) => update({ year2: Number(e.target.value) })}
          className="bg-transparent text-[13px] text-[#F5F3EF] outline-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y} className="bg-[#18181B]">
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
