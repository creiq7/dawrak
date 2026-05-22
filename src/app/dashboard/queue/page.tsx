import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import QueueManagerClient from "./QueueManagerClient";

export default async function DashboardQueuePage() {
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

  // Fetch today's tickets
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const tickets = await db.ticket.findMany({
    where: {
      queueId: shop.queue.id,
      createdAt: { gte: startOfDay },
      status: { in: ["WAITING", "SERVING", "DONE", "SKIPPED"] },
    },
    orderBy: { ticketNumber: "asc" },
  });

  const servingTicket = tickets.find((t) => t.status === "SERVING") || null;
  const waitingTickets = tickets.filter((t) => t.status === "WAITING");

  const initialData = {
    shopId: shop.id,
    currentNumber: shop.queue.currentNumber,
    servingTicket: servingTicket ? {
      id: servingTicket.id,
      ticketNumber: servingTicket.ticketNumber,
      createdAt: servingTicket.createdAt,
    } : null,
    waitingTickets: waitingTickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      createdAt: t.createdAt,
    })),
  };

  return (
    <QueueManagerClient
      initialData={initialData}
      lang={lang}
      dict={dict}
    />
  );
}
