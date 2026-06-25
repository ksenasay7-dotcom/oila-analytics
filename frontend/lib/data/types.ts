// Типы данных, отражающие схему БД (database/schema.sql)

export type Outlet = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type Transaction = {
  id: string;
  outlet_id: string;
  transaction_date: string; // ISO date
  direction: "income" | "expense";
  payment_method: "cash" | "terminal" | "payme" | "rahmat" | "qr" | null;
  expense_category: string | null;
  amount: number;
  comment: string | null;
};

export type DishSale = {
  id: string;
  outlet_id: string;
  period_month: number;
  period_year: number;
  warehouse: string | null;
  category: string | null;
  dish_name: string;
  quantity_sold: number;
  revenue: number;
  cost_price: number | null;
  abc_group: "A" | "B" | "C" | null;
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Наличные",
  terminal: "Терминал",
  payme: "Payme",
  rahmat: "Rahmat",
  qr: "Единый QR",
};

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  cash: "#FF6A1A",
  terminal: "#4ADE80",
  payme: "#60A5FA",
  rahmat: "#C084FC",
  qr: "#F5F3EF",
};
