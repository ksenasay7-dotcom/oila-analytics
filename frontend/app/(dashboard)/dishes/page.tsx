import { getDishSales } from "@/lib/data/queries";
import { formatSum, formatNumber } from "@/lib/format";
import { Inbox } from "lucide-react";
import Link from "next/link";

const ABC_COLORS: Record<string, string> = {
  A: "text-[#4ADE80] bg-[#0E1F14]",
  B: "text-[#FF6A1A] bg-[#3A2415]",
  C: "text-[#8A8A8E] bg-[#212124]",
};

export default async function DishesPage() {
  const dishes = await getDishSales();

  // Группируем по складам
  const warehouses = Array.from(
    new Set(dishes.map((d) => d.warehouse ?? "Без склада"))
  );

  const sorted = [...dishes].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="mb-7">
        <h1 className="font-display text-[22px] font-medium text-[#F5F3EF]">
          ABC-анализ блюд
        </h1>
        <p className="text-[14px] text-[#8A8A8E] mt-1">
          Продажи по складам и категориям, разбивка по группам A/B/C
        </p>
      </div>

      {dishes.length === 0 ? (
        <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#212124] flex items-center justify-center mb-4">
            <Inbox size={20} className="text-[#8A8A8E]" strokeWidth={1.75} />
          </div>
          <h3 className="text-[16px] text-[#F5F3EF] font-medium mb-1.5">
            Пока нет данных по блюдам
          </h3>
          <p className="text-[14px] text-[#8A8A8E] mb-5 max-w-[360px]">
            Загрузите файл с ABC-анализом, чтобы увидеть разбивку по блюдам
          </p>
          <Link
            href="/upload"
            className="bg-[#FF6A1A] hover:bg-[#C9501A] text-[#0E0E0F] font-medium text-[14px] rounded-[8px] px-5 py-2.5 transition-colors"
          >
            Загрузить данные
          </Link>
        </div>
      ) : (
        <>
          {/* Сводка по складам */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {warehouses.map((wh) => {
              const items = dishes.filter(
                (d) => (d.warehouse ?? "Без склада") === wh
              );
              const revenue = items.reduce((s, d) => s + d.revenue, 0);
              return (
                <div
                  key={wh}
                  className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-5"
                >
                  <span className="text-[13px] text-[#8A8A8E]">{wh}</span>
                  <div className="font-mono-num text-[22px] font-medium text-[#F5F3EF] mt-2">
                    {formatSum(revenue)}
                  </div>
                  <span className="text-[12px] text-[#8A8A8E]">
                    {items.length} позиций
                  </span>
                </div>
              );
            })}
          </div>

          {/* Таблица блюд */}
          <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#2A2A2D] text-left">
                  <th className="px-5 py-3 text-[#8A8A8E] font-normal">Блюдо</th>
                  <th className="px-5 py-3 text-[#8A8A8E] font-normal">Склад</th>
                  <th className="px-5 py-3 text-[#8A8A8E] font-normal">Категория</th>
                  <th className="px-5 py-3 text-[#8A8A8E] font-normal text-right">
                    Кол-во
                  </th>
                  <th className="px-5 py-3 text-[#8A8A8E] font-normal text-right">
                    Выручка
                  </th>
                  <th className="px-5 py-3 text-[#8A8A8E] font-normal text-center">
                    Группа
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-[#2A2A2D] last:border-0"
                  >
                    <td className="px-5 py-3 text-[#F5F3EF]">{d.dish_name}</td>
                    <td className="px-5 py-3 text-[#8A8A8E]">
                      {d.warehouse ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-[#8A8A8E]">
                      {d.category ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-[#F5F3EF] text-right font-mono-num">
                      {formatNumber(d.quantity_sold)}
                    </td>
                    <td className="px-5 py-3 text-[#F5F3EF] text-right font-mono-num">
                      {formatSum(d.revenue)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {d.abc_group && (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-medium ${ABC_COLORS[d.abc_group] ?? "text-[#8A8A8E] bg-[#212124]"}`}
                        >
                          {d.abc_group}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
