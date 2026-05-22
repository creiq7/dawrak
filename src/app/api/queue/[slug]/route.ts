import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const shop = await db.shop.findUnique({
      where: { slug },
      include: {
        queue: {
          include: {
            tickets: {
              where: {
                status: "WAITING",
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
              orderBy: { ticketNumber: "asc" },
            },
          },
        },
      },
    });

    if (!shop || !shop.queue) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get current serving ticket number
    const activeServing = await db.ticket.findFirst({
      where: {
        queueId: shop.queue.id,
        status: "SERVING",
        createdAt: { gte: startOfDay },
      },
      orderBy: { ticketNumber: "desc" },
    });

    return NextResponse.json({
      shopName: shop.name,
      shopNameEn: shop.nameEn,
      city: shop.city,
      cityEn: shop.cityEn,
      category: shop.category,
      categoryEn: shop.categoryEn,
      currentNumber: shop.queue.currentNumber,
      servingTicket: activeServing ? {
        id: activeServing.id,
        ticketNumber: activeServing.ticketNumber,
        servedAt: activeServing.servedAt,
      } : null,
      waitingCount: shop.queue.tickets.length,
      avgServiceTime: shop.avgServiceTime,
    });
  } catch (error) {
    console.error("Queue API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
