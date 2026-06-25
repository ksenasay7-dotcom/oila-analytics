-- ============================================================
-- OILA ANALYTICS — схема базы данных
-- Платформа бизнес-аналитики для Kafe Oila / G-Consulting
-- ============================================================

-- 1. ТОРГОВЫЕ ТОЧКИ / ФИЛИАЛЫ
-- ============================================================
create table outlets (
  id uuid primary key default gen_random_uuid(),
  name text not null,              -- например: "OILA ЦЕНТР-1", "Бар Oyla"
  slug text unique not null,       -- например: "oila-centr-1"
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. ЗАГРУЖЕННЫЕ ФАЙЛЫ (журнал загрузок)
-- ============================================================
create table uploads (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid references outlets(id) on delete cascade,
  file_name text not null,
  period_month int,                 -- 1-12
  period_year int,                  -- например 2026
  status text default 'processing', -- processing | success | error
  error_message text,
  rows_imported int default 0,
  uploaded_at timestamptz default now()
);

-- 3. ОПЕРАЦИИ: ПРИХОД / РАСХОД (дебет/кредит)
-- ============================================================
create table transactions (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid references outlets(id) on delete cascade,
  upload_id uuid references uploads(id) on delete cascade,

  transaction_date date not null,
  direction text not null check (direction in ('income', 'expense')), -- приход / расход

  -- для ПРИХОДА: способ оплаты
  payment_method text,   -- 'cash' | 'terminal' | 'payme' | 'rahmat' | 'qr' | null (для расходов)

  -- для РАСХОДА: статья расхода
  expense_category text, -- 'аренда' | 'коммуналка' | 'зарплата' | 'прочее' и т.д.

  amount numeric(14,2) not null,
  comment text,

  created_at timestamptz default now()
);

create index idx_transactions_outlet_date on transactions(outlet_id, transaction_date);
create index idx_transactions_direction on transactions(direction);

-- 4. ABC-АНАЛИЗ БЛЮД
-- ============================================================
create table dish_sales (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid references outlets(id) on delete cascade,
  upload_id uuid references uploads(id) on delete cascade,

  period_month int not null,
  period_year int not null,

  warehouse text,          -- склад: 'кухня' | 'бар' и т.д.
  category text,           -- категория блюда: 'горячее', 'напитки', ...
  dish_name text not null,

  quantity_sold numeric(12,2) default 0,
  revenue numeric(14,2) default 0,
  cost_price numeric(14,2),          -- себестоимость, если есть
  abc_group text,                    -- 'A' | 'B' | 'C' — можно считать автоматически

  created_at timestamptz default now()
);

create index idx_dish_sales_outlet_period on dish_sales(outlet_id, period_year, period_month);
create index idx_dish_sales_warehouse on dish_sales(warehouse);

-- 5. ВСПОМОГАТЕЛЬНОЕ ПРЕДСТАВЛЕНИЕ: помесячная сводка по точке
-- ============================================================
create view monthly_summary as
select
  outlet_id,
  date_trunc('month', transaction_date)::date as month,
  direction,
  sum(amount) as total_amount
from transactions
group by outlet_id, date_trunc('month', transaction_date), direction;

-- ============================================================
-- ROW LEVEL SECURITY — раз пользователь один (Ксения),
-- доступ разрешён только авторизованным пользователям
-- ============================================================
alter table outlets enable row level security;
alter table uploads enable row level security;
alter table transactions enable row level security;
alter table dish_sales enable row level security;

create policy "authenticated full access" on outlets
  for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on uploads
  for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on transactions
  for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on dish_sales
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ: создаём первые точки
-- (можно переименовать/добавить позже через интерфейс)
-- ============================================================
insert into outlets (name, slug) values
  ('OILA ЦЕНТР-1', 'oila-centr-1'),
  ('Бар Oyla', 'oyla-bar');
