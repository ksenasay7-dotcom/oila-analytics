"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_COLORS,
} from "@/lib/data/types";
import { formatSum } from "@/lib/format";

type Props = {
  data: { method: string; amount: number }[];
};

export function PaymentMethodChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-5">
      <span className="text-[14px] text-[#F5F3EF] font-medium block mb-4">
        Приход по способам оплаты
      </span>

      <div className="flex items-center gap-6">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="method"
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.method}
                  fill={PAYMENT_METHOD_COLORS[entry.method] ?? "#8A8A8E"}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#212124",
                border: "1px solid #2A2A2D",
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(value, name) => [
                formatSum(Number(value)),
                PAYMENT_METHOD_LABELS[String(name)] ?? String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 flex flex-col gap-2.5">
          {data
            .sort((a, b) => b.amount - a.amount)
            .map((d) => (
              <div
                key={d.method}
                className="flex items-center justify-between text-[13px]"
              >
                <span className="flex items-center gap-2 text-[#8A8A8E]">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{
                      backgroundColor:
                        PAYMENT_METHOD_COLORS[d.method] ?? "#8A8A8E",
                    }}
                  />
                  {PAYMENT_METHOD_LABELS[d.method] ?? d.method}
                </span>
                <span className="text-[#F5F3EF] font-mono-num">
                  {total > 0 ? ((d.amount / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
