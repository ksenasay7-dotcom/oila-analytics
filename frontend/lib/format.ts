export function formatSum(value: number): string {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
      Math.round(value)
    ) + " сум"
  );
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
    Math.round(value)
  );
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toLocaleString("ru-RU", {
      maximumFractionDigits: 1,
    }) + " млн";
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toLocaleString("ru-RU", {
      maximumFractionDigits: 0,
    }) + " тыс";
  }
  return formatNumber(value);
}

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export function monthLabel(yyyyMM: string): string {
  const [, m] = yyyyMM.split("-").map(Number);
  return MONTH_NAMES[m - 1]?.slice(0, 3) ?? yyyyMM;
}

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}
