import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";

// Ожидаемые названия листов (регистронезависимо, с гибким сопоставлением)
const SHEET_PATTERNS = {
  transactions: ["операции", "приход", "расход", "движение", "дебет"],
  dishes: ["abc", "абс", "блюда", "анализ блюд"],
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/\s+/g, "_");
}

function findSheet(workbook: XLSX.WorkBook, patterns: string[]): string | null {
  const sheetName = workbook.SheetNames.find((name) =>
    patterns.some((p) => name.toLowerCase().includes(p))
  );
  return sheetName ?? null;
}

// Сопоставление текста способа оплаты с нашими ключами
function detectPaymentMethod(raw: string): string | null {
  const v = raw.toLowerCase();
  if (v.includes("нал")) return "cash";
  if (v.includes("терминал") || v.includes("карт")) return "terminal";
  if (v.includes("payme") || v.includes("пейми")) return "payme";
  if (v.includes("rahmat") || v.includes("рахмат")) return "rahmat";
  if (v.includes("qr") || v.includes("кр") || v.includes("единый")) return "qr";
  return null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const outletId = formData.get("outletId") as string | null;
  const periodMonth = Number(formData.get("periodMonth"));
  const periodYear = Number(formData.get("periodYear"));

  if (!file || !outletId || !periodMonth || !periodYear) {
    return NextResponse.json(
      { error: "Не указан файл, точка или период" },
      { status: 400 }
    );
  }

  // Создаём запись в журнале загрузок
  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .insert({
      outlet_id: outletId,
      file_name: file.name,
      period_month: periodMonth,
      period_year: periodYear,
      status: "processing",
    })
    .select()
    .single();

  if (uploadError || !upload) {
    return NextResponse.json(
      { error: "Не удалось создать запись о загрузке" },
      { status: 500 }
    );
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

    let rowsImported = 0;
    const warnings: string[] = [];

    // --- Лист с операциями (приход/расход) ---
    const txSheetName = findSheet(workbook, SHEET_PATTERNS.transactions);
    if (txSheetName) {
      const sheet = workbook.Sheets[txSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: null,
      });

      const transactionsToInsert = [];

      for (const row of rows) {
        const normalized: Record<string, unknown> = {};
        for (const key of Object.keys(row)) {
          normalized[normalizeHeader(key)] = row[key];
        }

        // Гибкий поиск нужных полей по возможным названиям колонок
        const dateRaw =
          normalized["дата"] ?? normalized["date"] ?? normalized["период"];
        const directionRaw = String(
          normalized["тип"] ?? normalized["направление"] ?? ""
        ).toLowerCase();
        const amountRaw =
          normalized["сумма"] ?? normalized["amount"] ?? normalized["итого"];
        const methodRaw = String(
          normalized["способ_оплаты"] ??
            normalized["способ"] ??
            normalized["оплата"] ??
            ""
        );
        const categoryRaw = String(
          normalized["статья"] ??
            normalized["статья_расхода"] ??
            normalized["категория"] ??
            ""
        );

        if (!dateRaw || amountRaw == null) continue;

        const direction = directionRaw.includes("расход")
          ? "expense"
          : directionRaw.includes("приход") || directionRaw.includes("доход")
            ? "income"
            : null;

        if (!direction) {
          warnings.push(
            `Не удалось определить тип операции в строке (дата: ${dateRaw})`
          );
          continue;
        }

        const date =
          dateRaw instanceof Date
            ? dateRaw.toISOString().slice(0, 10)
            : String(dateRaw);

        transactionsToInsert.push({
          outlet_id: outletId,
          upload_id: upload.id,
          transaction_date: date,
          direction,
          payment_method:
            direction === "income" ? detectPaymentMethod(methodRaw) : null,
          expense_category: direction === "expense" ? categoryRaw || null : null,
          amount: Number(amountRaw) || 0,
        });
      }

      if (transactionsToInsert.length > 0) {
        const { error } = await supabase
          .from("transactions")
          .insert(transactionsToInsert);
        if (error) throw new Error(`Ошибка вставки операций: ${error.message}`);
        rowsImported += transactionsToInsert.length;
      }
    } else {
      warnings.push("Лист с операциями (приход/расход) не найден в файле");
    }

    // --- Лист с ABC-анализом блюд ---
    const dishSheetName = findSheet(workbook, SHEET_PATTERNS.dishes);
    if (dishSheetName) {
      const sheet = workbook.Sheets[dishSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: null,
      });

      const dishesToInsert = [];

      for (const row of rows) {
        const normalized: Record<string, unknown> = {};
        for (const key of Object.keys(row)) {
          normalized[normalizeHeader(key)] = row[key];
        }

        const dishName =
          normalized["блюдо"] ??
          normalized["название"] ??
          normalized["наименование"];
        if (!dishName) continue;

        dishesToInsert.push({
          outlet_id: outletId,
          upload_id: upload.id,
          period_month: periodMonth,
          period_year: periodYear,
          warehouse: normalized["склад"] ?? null,
          category: normalized["категория"] ?? null,
          dish_name: String(dishName),
          quantity_sold: Number(normalized["количество"] ?? 0),
          revenue: Number(normalized["выручка"] ?? normalized["сумма"] ?? 0),
          cost_price: normalized["себестоимость"]
            ? Number(normalized["себестоимость"])
            : null,
          abc_group: normalized["abc"] ?? normalized["группа"] ?? null,
        });
      }

      if (dishesToInsert.length > 0) {
        const { error } = await supabase
          .from("dish_sales")
          .insert(dishesToInsert);
        if (error) throw new Error(`Ошибка вставки блюд: ${error.message}`);
        rowsImported += dishesToInsert.length;
      }
    }

    await supabase
      .from("uploads")
      .update({
        status: "success",
        rows_imported: rowsImported,
        error_message: warnings.length > 0 ? warnings.join("; ") : null,
      })
      .eq("id", upload.id);

    return NextResponse.json({
      success: true,
      rowsImported,
      warnings,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    await supabase
      .from("uploads")
      .update({ status: "error", error_message: message })
      .eq("id", upload.id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
