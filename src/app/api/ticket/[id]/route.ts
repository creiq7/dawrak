import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
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
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let peopleAhead = 0;
    let estWaitTime = 0;

    if (ticket.status === "WAITING") {
      // Count all WAITING tickets created today with ticketNumber < current ticketNumber
      peopleAhead = await db.ticket.count({
        where: {
          queueId: ticket.queueId,
          status: "WAITING",
          ticketNumber: { lt: ticket.ticketNumber },
          createdAt: { gte: startOfDay },
        },
      });

      estWaitTime = peopleAhead * ticket.queue.shop.avgServiceTime;
    }

    // Check if there is an active serving ticket to return
    const activeServing = await db.ticket.findFirst({
      where: {
        queueId: ticket.queueId,
        status: "SERVING",
        createdAt: { gte: startOfDay },
      },
      orderBy: { ticketNumber: "desc" },
    });

    return NextResponse.json({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      createdAt: ticket.createdAt,
      servedAt: ticket.servedAt,
      peopleAhead,
      estWaitTime,
      currentNumber: ticket.queue.currentNumber,
      avgServiceTime: ticket.queue.shop.avgServiceTime,
      shop: {
        id: ticket.queue.shop.id,
        name: ticket.queue.shop.name,
        nameEn: ticket.queue.shop.nameEn,
        slug: ticket.queue.shop.slug,
      },
      activeServingNumber: activeServing ? activeServing.ticketNumber : null,
      activeServingId: activeServing ? activeServing.id : null,
    });
  } catch (error) {
    console.error("Ticket API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
