import { getOutlets, getTransactions } from "@/lib/data/queries";
import { formatSum } from "@/lib/format";
import { ComparePicker } from "@/components/ComparePicker";
import { Inbox } from "lucide-react";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{
    month1?: string;
    year1?: string;
    month2?: string;
    year2?: string;
  }>;
}) {
  const params = await searchParams;
  const outlets = await getOutlets();

  const now = new Date();
  const month1 = Number(params.month1) || now.getMonth(); // прошлый месяц по умолчанию
  const year1 = Number(params.year1) || now.getFullYear();
  const month2 = Number(params.month2) || now.getMonth() + 1; // текущий
  const year2 = Number(params.year2) || now.getFullYear();

  const [tx1, tx2] = await Promise.all([
    getTransactions({ year: year1, month: month1 || 12 }),
    getTransactions({ year: year2, month: month2 }),
  ]);

  function summarize(transactions: typeof tx1) {
    const income = transactions
      .filter((t) => t.direction === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.direction === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, profit: income - expense };
  }

  const s1 = summarize(tx1);
  const s2 = summarize(tx2);

  function delta(a: number, b: number) {
    if (a === 0) return b === 0 ? 0 : 100;
    return ((b - a) / Math.abs(a)) * 100;
  }

  const isEmpty = tx1.length === 0 && tx2.length === 0;

  const rows = [
    { label: "Приход", a: s1.income, b: s2.income },
    { label: "Расход", a: s1.expense, b: s2.expense },
    { label: "Прибыль", a: s1.profit, b: s2.profit },
  ];

  return (
    <div className="p-8 max-w-[1000px]">
      <div className="mb-7">
        <h1 className="font-display text-[22px] font-medium text-[#F5F3EF]">
          Сравнение периодов
        </h1>
        <p className="text-[14px] text-[#8A8A8E] mt-1">
          Сопоставьте показатели за два месяца
        </p>
      </div>

      <ComparePicker
        month1={month1 || 12}
        year1={year1}
        month2={month2}
        year2={year2}
      />

      {isEmpty ? (
        <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-12 flex flex-col items-center text-center mt-6">
          <div className="w-12 h-12 rounded-full bg-[#212124] flex items-center justify-center mb-4">
            <Inbox size={20} className="text-[#8A8A8E]" strokeWidth={1.75} />
          </div>
          <h3 className="text-[16px] text-[#F5F3EF] font-medium mb-1.5">
            Нет данных за выбранные периоды
          </h3>
          <p className="text-[14px] text-[#8A8A8E] max-w-[360px]">
            Выберите другие месяцы или загрузите данные за этот период
          </p>
        </div>
      ) : (
        <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] overflow-hidden mt-6">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-[#2A2A2D] text-left">
                <th className="px-5 py-3 text-[#8A8A8E] font-normal">
                  Показатель
                </th>
                <th className="px-5 py-3 text-[#8A8A8E] font-normal text-right">
                  Период 1
                </th>
                <th className="px-5 py-3 text-[#8A8A8E] font-normal text-right">
                  Период 2
                </th>
                <th className="px-5 py-3 text-[#8A8A8E] font-normal text-right">
                  Динамика
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const d = delta(r.a, r.b);
                const isPositive = d >= 0;
                return (
                  <tr key={r.label} className="border-b border-[#2A2A2D] last:border-0">
                    <td className="px-5 py-3.5 text-[#F5F3EF]">{r.label}</td>
                    <td className="px-5 py-3.5 text-right font-mono-num text-[#8A8A8E]">
                      {formatSum(r.a)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono-num text-[#F5F3EF]">
                      {formatSum(r.b)}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-right font-mono-num font-medium ${
                        isPositive ? "text-[#4ADE80]" : "text-[#F85149]"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {d.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
