import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import { takeTicketAction } from "@/lib/actions";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Users, Clock, MapPin, Tag, Landmark, Loader2 } from "lucide-react";

interface QueuePageProps {
  params: Promise<{ slug: string }>;
}

export default async function QueuePage({ params }: QueuePageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const dict = getDictionary(lang);

  const shop = await db.shop.findUnique({
    where: { slug },
    include: { queue: true },
  });

  if (!shop || !shop.queue) {
    notFound();
  }

  // Fetch current serving ticket today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const activeServing = await db.ticket.findFirst({
    where: {
      queueId: shop.queue.id,
      status: "SERVING",
      createdAt: { gte: startOfDay },
    },
    orderBy: { ticketNumber: "desc" },
  });

  // Count waiting tickets today
  const waitingCount = await db.ticket.count({
    where: {
      queueId: shop.queue.id,
      status: "WAITING",
      createdAt: { gte: startOfDay },
    },
  });

  // Estimated wait time for new ticket
  const estWaitTime = waitingCount * shop.avgServiceTime;

  // Server Action handler for form submission to handle redirect cleanly
  const handleTakeTicket = async () => {
    "use server";
    const res = await takeTicketAction(slug);
    if (res.success && res.ticketId) {
      redirect(`/ticket/${res.ticketId}`);
    }
  };

  const displayName = lang === "ar" ? shop.name : shop.nameEn;
  const displayCity = lang === "ar" ? shop.city : shop.cityEn;
  const displayCategory = lang === "ar" ? shop.category : shop.categoryEn;

  return (
    <div className="flex-1 flex flex-col min-h-screen relative p-4 bg-background justify-center items-center">
      {/* Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      {/* Floating Header Actions */}
      <div className="absolute top-4 right-4 left-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-1 text-sm font-bold text-muted-text">
          <Landmark className="w-4 h-4 text-primary" />
          <span>{dict.common.appName}</span>
        </div>
        <LanguageSwitcher currentLang={lang} />
      </div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 text-center animate-fade-in shadow-xl mt-12">
        {/* Shop Branding Header */}
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-4 shadow-sm">
            {displayName.charAt(0)}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{displayName}</h1>
          
          <div className="flex justify-center gap-4 mt-3 text-xs text-muted-text font-medium">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-card-border bg-card-bg">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {displayCity}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-card-border bg-card-bg">
              <Tag className="w-3.5 h-3.5 text-primary" />
              {displayCategory}
            </span>
          </div>
        </div>

        {/* Realtime Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl border border-card-border bg-card-bg/30">
            <span className="text-[10px] md:text-xs font-bold text-muted-text uppercase block mb-1">
              {dict.dashboard.currentServing}
            </span>
            <span className="text-3xl font-black text-primary font-outfit">
              {activeServing ? activeServing.ticketNumber : "—"}
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-card-border bg-card-bg/30">
            <span className="text-[10px] md:text-xs font-bold text-muted-text uppercase block mb-1">
              {dict.dashboard.waitingCount}
            </span>
            <span className="text-3xl font-black text-foreground font-outfit">
              {waitingCount}
            </span>
          </div>
        </div>

        {/* Estimated Time Indicator */}
        <div className="p-4 rounded-2xl border border-card-border bg-card-bg/20 flex items-center gap-4 text-right mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-text block font-medium">
              {dict.customer.estimatedWait}
            </span>
            <span className="text-sm font-bold text-foreground">
              {estWaitTime} {dict.common.minutes}
            </span>
          </div>
        </div>

        {/* Join Queue Form */}
        <form action={handleTakeTicket}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-4 md:py-5 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 cursor-pointer text-base pulse-primary"
          >
            <Users className="w-5 h-5" />
            <span>{dict.customer.takeTicketBtn}</span>
          </button>
        </form>

        <p className="text-[11px] text-muted-text mt-6 leading-relaxed font-medium">
          {dict.customer.estimatedWaitDesc}
        </p>
      </div>
    </div>
  );
}
