"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, MessageCircle, ListTodo, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "ホーム",
    icon: Home,
  },
  {
    href: "/coaching",
    label: "コーチング",
    icon: MessageCircle,
  },
  {
    href: "/habits",
    label: "習慣",
    icon: ListTodo,
  },
  {
    href: "/progress",
    label: "進捗",
    icon: BarChart3,
  },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* メインコンテンツ */}
      <main className="flex-1 pb-20">{children}</main>

      {/* モバイルボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background safe-area-inset-bottom">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors touch-target",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "text-primary"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
