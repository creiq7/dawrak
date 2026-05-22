import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import { logoutAction } from "@/lib/actions";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, Landmark, User } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession();

  if (!session || !session.shopId) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const dict = getDictionary(lang);

  const shop = await db.shop.findUnique({
    where: { id: session.shopId },
  });

  if (!shop) {
    redirect("/login");
  }

  const handleLogout = async () => {
    "use server";
    await logoutAction();
    redirect("/login");
  };

  const displayName = lang === "ar" ? shop.name : shop.nameEn;

  const navItems = [
    {
      href: "/dashboard/queue",
      icon: <Users className="w-5 h-5" />,
      label: dict.dashboard.queueManager,
    },
    {
      href: "/dashboard/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      label: dict.dashboard.analytics,
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="w-5 h-5" />,
      label: dict.dashboard.settings,
    },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-background">
      {/* Side Navigation Bar */}
      <aside className="w-full md:w-64 glass-panel border-b md:border-b-0 md:border-l border-card-border flex flex-col shrink-0 z-20">
        {/* Brand Logo Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-card-border shrink-0 justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm">
              د
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              {dict.common.appName}
            </span>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher currentLang={lang} />
          </div>
        </div>

        {/* Shop context and user info */}
        <div className="p-4 border-b border-card-border bg-card-bg/20 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <span className="text-sm font-extrabold text-foreground block truncate">{displayName}</span>
              <span className="text-[10px] text-muted-text flex items-center gap-1 font-medium mt-0.5">
                <User className="w-3 h-3 text-primary" />
                {session.email}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible">
          {navItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-text hover:bg-card-bg hover:text-primary transition-all duration-200 whitespace-nowrap shrink-0 md:shrink-1"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 mt-auto border-t border-card-border hidden md:flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-muted-text font-bold">اللغة / Language</span>
            <LanguageSwitcher currentLang={lang} />
          </div>

          <form action={handleLogout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 border border-rose-200 dark:border-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-sm cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{dict.common.logout}</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col min-w-0 p-4 md:p-8 relative">
        {/* Mobile logout and context indicator */}
        <div className="md:hidden flex justify-between items-center mb-6 p-4 rounded-2xl glass-panel">
          <div className="overflow-hidden">
            <span className="text-sm font-extrabold text-foreground block truncate">{displayName}</span>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="p-2 border border-rose-200 text-rose-600 rounded-xl cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
