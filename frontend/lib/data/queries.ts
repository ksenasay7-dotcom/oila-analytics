import { createClient } from "@/lib/supabase/server";
import type { Outlet, Transaction, DishSale } from "./types";
import type { Upload } from "./upload-types";

export async function getUploads(limit = 10): Promise<Upload[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .order("uploaded_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Ошибка загрузки журнала:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getOutlets(): Promise<Outlet[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outlets")
    .select("*")
    .order("name");

  if (error) {
    console.error("Ошибка загрузки точек:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getTransactions(filters?: {
  outletId?: string;
  year?: number;
  month?: number;
}): Promise<Transaction[]> {
  const supabase = await createClient();
  let query = supabase.from("transactions").select("*");

  if (filters?.outletId) {
    query = query.eq("outlet_id", filters.outletId);
  }
  if (filters?.year && filters?.month) {
    const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
    const nextMonth = filters.month === 12 ? 1 : filters.month + 1;
    const nextYear = filters.month === 12 ? filters.year + 1 : filters.year;
    const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
    query = query.gte("transaction_date", start).lt("transaction_date", end);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Ошибка загрузки операций:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getDishSales(filters?: {
  outletId?: string;
  year?: number;
  month?: number;
}): Promise<DishSale[]> {
  const supabase = await createClient();
  let query = supabase.from("dish_sales").select("*");

  if (filters?.outletId) query = query.eq("outlet_id", filters.outletId);
  if (filters?.year) query = query.eq("period_year", filters.year);
  if (filters?.month) query = query.eq("period_month", filters.month);

  const { data, error } = await query;

  if (error) {
    console.error("Ошибка загрузки продаж блюд:", error.message);
    return [];
  }
  return data ?? [];
}

// Группировка операций по месяцам — для графика динамики
export function groupByMonth(transactions: Transaction[]) {
  const map = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const month = t.transaction_date.slice(0, 7); // YYYY-MM
    if (!map.has(month)) map.set(month, { income: 0, expense: 0 });
    const entry = map.get(month)!;
    if (t.direction === "income") entry.income += Number(t.amount);
    else entry.expense += Number(t.amount);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({ month, ...vals }));
}

// Группировка по способу оплаты (только приходы)
export function groupByPaymentMethod(transactions: Transaction[]) {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.direction !== "income" || !t.payment_method) continue;
    map.set(
      t.payment_method,
      (map.get(t.payment_method) ?? 0) + Number(t.amount)
    );
  }
  return Array.from(map.entries()).map(([method, amount]) => ({
    method,
    amount,
  }));
}

// Группировка по статье расхода
export function groupByExpenseCategory(transactions: Transaction[]) {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.direction !== "expense" || !t.expense_category) continue;
    map.set(
      t.expense_category,
      (map.get(t.expense_category) ?? 0) + Number(t.amount)
    );
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}
