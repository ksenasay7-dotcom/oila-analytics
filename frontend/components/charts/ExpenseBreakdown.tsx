"use client";

import { formatSum } from "@/lib/format";

type Props = {
  data: { category: string; amount: number }[];
};

export function ExpenseBreakdown({ data }: Props) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-5">
      <span className="text-[14px] text-[#F5F3EF] font-medium block mb-4">
        Расходы по статьям
      </span>

      <div className="flex flex-col gap-3.5">
        {data.map((d) => (
          <div key={d.category}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] text-[#F5F3EF]">{d.category}</span>
              <span className="text-[13px] text-[#8A8A8E] font-mono-num">
                {formatSum(d.amount)}
              </span>
            </div>
            <div className="h-1.5 bg-[#0E0E0F] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6A1A] rounded-full"
                style={{ width: `${(d.amount / max) * 100}%` }}
              />
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <p className="text-[13px] text-[#8A8A8E]">
            Нет данных за выбранный период
          </p>
        )}
      </div>
    </div>
  );
}
