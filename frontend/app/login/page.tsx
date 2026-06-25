"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#0E0E0F]">
      <div className="w-full max-w-[400px]">
        {/* Логотип / заголовок */}
        <div className="mb-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-[10px] bg-[#FF6A1A] flex items-center justify-center mb-5">
            <span className="font-display text-[20px] font-medium text-[#0E0E0F]">
              O
            </span>
          </div>
          <h1 className="font-display text-[24px] font-medium text-[#F5F3EF]">
            OILA Analytics
          </h1>
          <p className="text-[14px] text-[#8A8A8E] mt-1">
            Личный кабинет
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#18181B] border border-[#2A2A2D] rounded-[14px] p-8"
        >
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-[13px] text-[#8A8A8E] mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@oila.uz"
              className="w-full bg-[#0E0E0F] border border-[#2A2A2D] rounded-[8px] px-4 py-3 text-[15px] text-[#F5F3EF] placeholder:text-[#8A8A8E] outline-none focus:border-[#FF6A1A] transition-colors"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-[13px] text-[#8A8A8E] mb-2"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0E0E0F] border border-[#2A2A2D] rounded-[8px] px-4 py-3 text-[15px] text-[#F5F3EF] placeholder:text-[#8A8A8E] outline-none focus:border-[#FF6A1A] transition-colors"
            />
          </div>

          {error && (
            <div className="mb-5 text-[13px] text-[#F85149] bg-[#3A2415] border border-[#F85149]/30 rounded-[8px] px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6A1A] hover:bg-[#C9501A] disabled:opacity-50 text-[#0E0E0F] font-medium text-[15px] rounded-[8px] py-3 transition-colors"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#8A8A8E] mt-6">
          Доступ только для владельца аккаунта
        </p>
      </div>
    </main>
  );
}
