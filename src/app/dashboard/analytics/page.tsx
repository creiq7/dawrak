import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import { BarChart3, Users, CheckCircle2, UserMinus, XCircle, Clock, TrendingUp } from "lucide-react";

export default async function DashboardAnalyticsPage() {
  const session = await getSession();

  if (!session || !session.shopId) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const dict = getDictionary(lang);

  const shop = await db.shop.findUnique({
    where: { id: session.shopId },
    include: { queue: true },
  });

  if (!shop || !shop.queue) {
    redirect("/login");
  }

  // Analytics for Today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayTickets = await db.ticket.findMany({
    where: {
      queueId: shop.queue.id,
      createdAt: { gte: startOfDay },
    },
  });

  // Calculate metrics
  const totalServed = todayTickets.filter((t) => t.status === "DONE").length;
  const totalSkipped = todayTickets.filter((t) => t.status === "SKIPPED").length;
  const totalCancelled = todayTickets.filter((t) => t.status === "CANCELLED").length;

  // Calculate Average Wait Time (minutes) for Served tickets
  const servedWithTime = todayTickets.filter((t) => t.status === "DONE" && t.servedAt);
  let totalWaitTimeMs = 0;
  servedWithTime.forEach((t) => {
    if (t.servedAt) {
      const waitMs = t.servedAt.getTime() - t.createdAt.getTime();
      totalWaitTimeMs += waitMs;
    }
  });

  const avgWaitTimeMins = servedWithTime.length > 0 
    ? Math.round((totalWaitTimeMs / servedWithTime.length) / 60000) 
    : 0;

  // Hourly distribution for peak hours (0 to 23)
  const hourlyCounts = Array(24).fill(0);
  todayTickets.forEach((t) => {
    const hour = new Date(t.createdAt).getHours();
    hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
  });

  // Keep only hours with data to make a beautiful, focused bar chart
  const activeHours = hourlyCounts
    .map((count, hour) => ({ hour, count }))
    .filter((h) => h.count > 0 || (h.hour >= 9 && h.hour <= 22)); // show standard business hours by default

  const maxHourCount = Math.max(...hourlyCounts, 1);

  // Format hour label helper (e.g. 14 -> 2:00 PM / 2:00 م)
  const formatHourLabel = (hour: number) => {
    const period = hour >= 12 ? (lang === "ar" ? "م" : "PM") : (lang === "ar" ? "ص" : "AM");
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${period}`;
  };

  const statCards = [
    {
      title: dict.analytics.totalServed,
      value: totalServed,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-500/10 border-emerald-500/10",
    },
    {
      title: dict.analytics.totalSkipped,
      value: totalSkipped,
      icon: <UserMinus className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-500/10 border-amber-500/10",
    },
    {
      title: dict.analytics.totalCancelled,
      value: totalCancelled,
      icon: <XCircle className="w-5 h-5 text-rose-500" />,
      bg: "bg-rose-500/10 border-rose-500/10",
    },
    {
      title: dict.analytics.avgWaitTime,
      value: `${avgWaitTimeMins} ${dict.common.minutes}`,
      icon: <Clock className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10 border-primary/10",
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{dict.analytics.title}</h1>
        <p className="text-sm text-muted-text mt-1 font-medium">احصائيات أداء المحل، ومستوى الإنجاز، وفترات الازدحام</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`p-5 rounded-3xl border glass-panel shadow-sm flex items-center gap-4 text-right`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-muted-text block font-bold">
                {card.title}
              </span>
              <span className="text-lg sm:text-xl font-black text-foreground font-outfit mt-0.5 block">
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* PEAK HOURS CHARTS (PURE CSS PREMIUM DESIGN) */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-card-border shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div className="text-right">
                <h3 className="font-extrabold text-foreground text-base">{dict.analytics.peakHours}</h3>
                <p className="text-xs text-muted-text mt-0.5">{dict.analytics.peakHoursDesc}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>

            {todayTickets.length > 0 ? (
              <div className="space-y-4 pt-2">
                {activeHours.map((h, i) => {
                  const percentage = Math.round((h.count / maxHourCount) * 100);
                  return (
                    <div key={i} className="flex items-center gap-4">
                      {/* Hour label */}
                      <span className="w-20 text-xs font-bold text-muted-text font-outfit text-right shrink-0">
                        {formatHourLabel(h.hour)}
                      </span>
                      
                      {/* Bar Container */}
                      <div className="flex-1 bg-card-border/30 h-4 rounded-full overflow-hidden relative">
                        <div
                          style={{ width: `${percentage}%` }}
                          className="bg-primary h-full rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                        >
                          {/* Gloss effect overlay */}
                          <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        </div>
                      </div>

                      {/* Count Badge */}
                      <span className="w-8 text-xs font-black text-foreground font-outfit text-left shrink-0">
                        {h.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <BarChart3 className="w-12 h-12 text-muted-text/20 mx-auto mb-3" />
                <span className="text-sm font-bold text-muted-text">
                  {dict.analytics.noAnalytics}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* EXTRA INSIGHTS PANEL */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-card-border shadow-md text-right">
            <h3 className="font-extrabold text-foreground text-base mb-6 border-b border-card-border pb-4">
              فترات الخدمة المتوقعة
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-muted-text block font-bold">مستوى الرضا عن الانتظار</span>
                  <p className="text-xs text-foreground font-medium mt-1 leading-relaxed">
                    سرعة إكمال الخدمات للعملاء اليوم تسجل متوسط خدمة يقدر بـ <strong className="text-primary font-outfit">{shop.avgServiceTime} {dict.common.minutes}</strong> لكل تذكرة.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-muted-text block font-bold">إجمالي التدفق اليومي</span>
                  <p className="text-xs text-foreground font-medium mt-1 leading-relaxed">
                    إجمالي الزيارات المسجلة لطابور الاستقبال اليوم هو <strong className="text-primary font-outfit">{todayTickets.length}</strong> عملاء.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
