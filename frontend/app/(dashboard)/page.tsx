import {
  getTransactions,
  groupByMonth,
  groupByPaymentMethod,
  groupByExpenseCategory,
} from "@/lib/data/queries";
import { formatSum } from "@/lib/format";
import { KpiCard } from "@/components/KpiCard";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { PaymentMethodChart } from "@/components/charts/PaymentMethodChart";
import { ExpenseBreakdown } from "@/components/charts/ExpenseBreakdown";
import { Inbox } from "lucide-react";
import Link from "next/link";

export default async function OverviewPage() {
  const transactions = await getTransactions();

  const totalIncome = transactions
    .filter((t) => t.direction === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.direction === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const profit = totalIncome - totalExpense;

  const monthly = groupByMonth(transactions);
  const byPayment = groupByPaymentMethod(transactions);
  const byExpense = groupByExpenseCategory(transactions);

  const isEmpty = transactions.length === 0;

  return (
    <div className="p-8 max-w-[1280px]">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display text-[22px] font-medium text-[#F5F3EF]">
            Обзор
          </h1>
          <p className="text-[14px] text-[#8A8A8E] mt-1">
            Общая аналитика по всем точкам
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#212124] flex items-center justify-center mb-4">
            <Inbox size={20} className="text-[#8A8A8E]" strokeWidth={1.75} />
          </div>
          <h3 className="text-[16px] text-[#F5F3EF] font-medium mb-1.5">
            Пока нет данных
          </h3>
          <p className="text-[14px] text-[#8A8A8E] mb-5 max-w-[360px]">
            Загрузите первый Excel-файл с операциями, чтобы увидеть аналитику
            здесь
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
          <div className="grid grid-cols-3 gap-4 mb-6">
            <KpiCard label="Приход" value={formatSum(totalIncome)} accent />
            <KpiCard label="Расход" value={formatSum(totalExpense)} />
            <KpiCard label="Прибыль" value={formatSum(profit)} />
          </div>

          <div className="mb-6">
            <RevenueChart data={monthly} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PaymentMethodChart data={byPayment} />
            <ExpenseBreakdown data={byExpense} />
          </div>
        </>
      )}
    </div>
  );
}
