export type Upload = {
  id: string;
  outlet_id: string;
  file_name: string;
  period_month: number | null;
  period_year: number | null;
  status: "processing" | "success" | "error";
  error_message: string | null;
  rows_imported: number;
  uploaded_at: string;
};
