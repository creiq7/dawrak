import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import TicketTrackerClient from "./TicketTrackerClient";

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const dict = getDictionary(lang);

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      queue: {
        include: {
          shop: true,
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  // Calculate initial metrics
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  let initialPeopleAhead = 0;
  if (ticket.status === "WAITING") {
    initialPeopleAhead = await db.ticket.count({
      where: {
        queueId: ticket.queueId,
        status: "WAITING",
        ticketNumber: { lt: ticket.ticketNumber },
        createdAt: { gte: startOfDay },
      },
    });
  }

  const initialEstWait = initialPeopleAhead * ticket.queue.shop.avgServiceTime;

  const initialData = {
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
    peopleAhead: initialPeopleAhead,
    estWaitTime: initialEstWait,
    currentNumber: ticket.queue.currentNumber,
    avgServiceTime: ticket.queue.shop.avgServiceTime,
    shop: {
      name: ticket.queue.shop.name,
      nameEn: ticket.queue.shop.nameEn,
      slug: ticket.queue.shop.slug,
    },
  };

  return (
    <TicketTrackerClient
      initialData={initialData}
      lang={lang}
      dict={dict}
    />
  );
}
