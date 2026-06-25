"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { monthLabel, formatCompact, formatSum } from "@/lib/format";

type Props = {
  data: { month: string; income: number; expense: number }[];
};

export function RevenueChart({ data }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    label: monthLabel(d.month),
  }));

  return (
    <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-5">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[14px] text-[#F5F3EF] font-medium">
          Динамика прихода и расхода
        </span>
        <div className="flex items-center gap-4 text-[12px] text-[#8A8A8E]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF6A1A] inline-block" />
            Приход
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8A8A8E] inline-block" />
            Расход
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6A1A" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#FF6A1A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2D" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#8A8A8E"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8A8A8E"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompact(v)}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: "#212124",
              border: "1px solid #2A2A2D",
              borderRadius: 8,
              fontSize: 13,
            }}
            labelStyle={{ color: "#F5F3EF" }}
            formatter={(value, name) => [
              formatSum(Number(value)),
              name === "income" ? "Приход" : "Расход",
            ]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#FF6A1A"
            strokeWidth={2}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#8A8A8E"
            strokeWidth={2}
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
