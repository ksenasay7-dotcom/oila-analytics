import { getOutlets, getUploads } from "@/lib/data/queries";
import { UploadForm } from "@/components/UploadForm";
import { monthName } from "@/lib/format";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  success: { icon: CheckCircle2, color: "text-[#4ADE80]", label: "Успешно" },
  error: { icon: XCircle, color: "text-[#F85149]", label: "Ошибка" },
  processing: { icon: Loader2, color: "text-[#8A8A8E]", label: "В обработке" },
};

export default async function UploadPage() {
  const [outlets, uploads] = await Promise.all([getOutlets(), getUploads()]);

  return (
    <div className="p-8 max-w-[900px]">
      <div className="mb-7">
        <h1 className="font-display text-[22px] font-medium text-[#F5F3EF]">
          Загрузка данных
        </h1>
        <p className="text-[14px] text-[#8A8A8E] mt-1">
          Загрузите Excel-файл с операциями (приход/расход) или ABC-анализом
          блюд
        </p>
      </div>

      {outlets.length === 0 ? (
        <div className="bg-[#3A2415] border border-[#FF6A1A]/30 rounded-[10px] px-4 py-3 text-[14px] text-[#FF6A1A]">
          Сначала нужно создать торговую точку в базе данных.
        </div>
      ) : (
        <UploadForm outlets={outlets} />
      )}

      {/* Подсказка по формату файла */}
      <div className="mt-6 bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-5">
        <h3 className="text-[14px] text-[#F5F3EF] font-medium mb-3">
          Формат файла
        </h3>
        <ul className="text-[13px] text-[#8A8A8E] flex flex-col gap-1.5 list-disc list-inside">
          <li>
            Лист с операциями должен содержать колонки: дата, тип
            (приход/расход), сумма, способ оплаты или статья расхода
          </li>
          <li>
            Лист с ABC-анализом должен содержать: блюдо, склад, категория,
            количество, выручка
          </li>
          <li>Названия листов и колонок определяются автоматически</li>
        </ul>
      </div>

      {/* Журнал загрузок */}
      {uploads.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[14px] text-[#F5F3EF] font-medium mb-3">
            История загрузок
          </h3>
          <div className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] overflow-hidden">
            {uploads.map((u, i) => {
              const config = STATUS_CONFIG[u.status];
              const Icon = config.icon;
              return (
                <div
                  key={u.id}
                  className={`flex items-center justify-between px-5 py-3.5 ${
                    i !== uploads.length - 1 ? "border-b border-[#2A2A2D]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={`${config.color} ${u.status === "processing" ? "animate-spin" : ""}`}
                    />
                    <div>
                      <p className="text-[13px] text-[#F5F3EF]">
                        {u.file_name}
                      </p>
                      <p className="text-[12px] text-[#8A8A8E]">
                        {u.period_month && u.period_year
                          ? `${monthName(u.period_month)} ${u.period_year}`
                          : ""}
                        {u.rows_imported > 0 && ` · ${u.rows_imported} строк`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[12px] ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
