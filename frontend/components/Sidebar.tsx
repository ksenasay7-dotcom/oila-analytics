"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Upload,
  UtensilsCrossed,
  GitCompare,
  LogOut,
  Store,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Обзор", icon: LayoutDashboard },
  { href: "/compare", label: "Сравнение периодов", icon: GitCompare },
  { href: "/dishes", label: "ABC-анализ блюд", icon: UtensilsCrossed },
  { href: "/upload", label: "Загрузка данных", icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-[240px] shrink-0 h-screen border-r border-[#2A2A2D] bg-[#0E0E0F] flex flex-col">
      {/* Логотип */}
      <div className="flex items-center gap-3 px-6 h-[72px] border-b border-[#2A2A2D]">
        <div className="w-8 h-8 rounded-[8px] bg-[#FF6A1A] flex items-center justify-center shrink-0">
          <span className="font-display text-[14px] font-medium text-[#0E0E0F]">
            O
          </span>
        </div>
        <div>
          <div className="font-display text-[15px] font-medium text-[#F5F3EF] leading-tight">
            OILA
          </div>
          <div className="text-[11px] text-[#8A8A8E] leading-tight">
            Analytics
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] transition-colors ${
                isActive
                  ? "bg-[#3A2415] text-[#FF6A1A]"
                  : "text-[#8A8A8E] hover:bg-[#18181B] hover:text-[#F5F3EF]"
              }`}
            >
              <Icon size={17} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Точки + выход */}
      <div className="px-3 pb-5 border-t border-[#2A2A2D] pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#8A8A8E]">
          <Store size={16} strokeWidth={1.75} />
          Все точки
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] text-[#8A8A8E] hover:bg-[#18181B] hover:text-[#F85149] transition-colors"
        >
          <LogOut size={17} strokeWidth={1.75} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
