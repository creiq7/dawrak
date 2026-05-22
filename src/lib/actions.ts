"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "./db";
import { hashPassword, verifyPassword, setSession, clearSession } from "./auth";
import { generateQRCodeSVG } from "./qrcode";

// ==========================================
// 1. Authentication Actions
// ==========================================

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const shopName = formData.get("shopName") as string;
  const shopNameEn = formData.get("shopNameEn") as string;
  const city = formData.get("city") as string;
  const cityEn = formData.get("cityEn") as string;
  const category = formData.get("category") as string;
  const categoryEn = formData.get("categoryEn") as string;
  const slugInput = formData.get("slug") as string;

  if (!name || !email || !password || !shopName || !shopNameEn || !city || !cityEn || !category || !categoryEn || !slugInput) {
    return { success: false, error: "allFieldsRequired" };
  }

  const slug = slugInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
  if (!slug) {
    return { success: false, error: "invalidSlug" };
  }

  try {
    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "emailExists" };
    }

    // Check if slug already exists
    const existingShop = await db.shop.findUnique({ where: { slug } });
    if (existingShop) {
      return { success: false, error: "slugExists" };
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Generate QR Code URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shopUrl = `${appUrl}/queue/${slug}`;
    const qrCodeSVG = await generateQRCodeSVG(shopUrl);

    // Create User, Shop, Queue inside a single transaction
    const user = await db.$transaction(async (tx) => {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days trial

      const newShop = await tx.shop.create({
        data: {
          name: shopName,
          nameEn: shopNameEn,
          slug,
          city,
          cityEn,
          category,
          categoryEn,
          qrCode: qrCodeSVG,
          avgServiceTime: 10,
          trialEndsAt,
          subscriptionStatus: "TRIAL",
        },
      });

      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role: "OWNER",
          shopId: newShop.id,
        },
      });

      await tx.queue.create({
        data: {
          shopId: newShop.id,
          currentNumber: 0,
        },
      });

      return newUser;
    });

    // Set JWT Session
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      shopId: user.shopId,
      shopSlug: slug,
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "registrationFailed" };
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "allFieldsRequired" };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
      include: { shop: true },
    });

    if (!user) {
      return { success: false, error: "invalidCredentials" };
    }

    const isValidPassword = verifyPassword(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: "invalidCredentials" };
    }

    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      shopId: user.shopId,
      shopSlug: user.shop?.slug || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "loginFailed" };
  }
}

export async function logoutAction() {
  await clearSession();
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function toggleLanguageAction(locale: "ar" | "en") {
  const cookieStore = await cookies();
  cookieStore.set("lang", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}

// ==========================================
// 2. Queue Operations (Client & Owner)
// ==========================================

/**
 * Client takes a new ticket in the shop's queue
 */
export async function takeTicketAction(shopSlug: string) {
  try {
    const shop = await db.shop.findUnique({
      where: { slug: shopSlug },
      include: { queue: true },
    });

    if (!shop || !shop.queue) {
      return { success: false, error: "shopNotFound" };
    }

    // Find the highest ticket number today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const latestTicket = await db.ticket.findFirst({
      where: {
        queueId: shop.queue.id,
        createdAt: { gte: startOfDay },
      },
      orderBy: { ticketNumber: "desc" },
    });

    const nextNumber = latestTicket ? latestTicket.ticketNumber + 1 : 1;

    const ticket = await db.ticket.create({
      data: {
        queueId: shop.queue.id,
        ticketNumber: nextNumber,
        status: "WAITING",
      },
    });

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Error taking ticket:", error);
    return { success: false, error: "failedToTakeTicket" };
  }
}

/**
 * Client cancels their ticket
 */
export async function cancelTicketAction(ticketId: string) {
  try {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: { queue: { include: { shop: true } } },
    });

    if (!ticket) {
      return { success: false, error: "ticketNotFound" };
    }

    await db.ticket.update({
      where: { id: ticketId },
      data: {
        status: "CANCELLED",
        completedAt: new Date(),
      },
    });

    revalidatePath(`/ticket/${ticketId}`);
    revalidatePath(`/queue/${ticket.queue.shop.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Error cancelling ticket:", error);
    return { success: false, error: "failedToCancelTicket" };
  }
}

/**
 * Owner calls the next waiting customer
 */
export async function nextTicketAction(shopId: string) {
  try {
    const queue = await db.queue.findUnique({ where: { shopId } });
    if (!queue) return { success: false, error: "queueNotFound" };

    // 1. Finish the currently SERVING ticket if there is one
    await db.ticket.updateMany({
      where: {
        queueId: queue.id,
        status: "SERVING",
      },
      data: {
        status: "DONE",
        completedAt: new Date(),
      },
    });

    // 2. Find the first WAITING ticket for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const nextTicket = await db.ticket.findFirst({
      where: {
        queueId: queue.id,
        status: "WAITING",
        createdAt: { gte: startOfDay },
      },
      orderBy: { ticketNumber: "asc" },
    });

    if (!nextTicket) {
      return { success: false, error: "noCustomersWaiting" };
    }

    // 3. Set next ticket status to SERVING
    await db.ticket.update({
      where: { id: nextTicket.id },
      data: {
        status: "SERVING",
        servedAt: new Date(),
      },
    });

    // 4. Update the current called number on the queue
    await db.queue.update({
      where: { id: queue.id },
      data: { currentNumber: nextTicket.ticketNumber },
    });

    revalidatePath("/dashboard/queue");
    return { success: true, ticketNumber: nextTicket.ticketNumber };
  } catch (error) {
    console.error("Error serving next ticket:", error);
    return { success: false, error: "failedToCallNext" };
  }
}

/**
 * Owner skips the current customer in queue
 */
export async function skipTicketAction(ticketId: string) {
  try {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: { queue: true },
    });

    if (!ticket) return { success: false, error: "ticketNotFound" };

    await db.ticket.update({
      where: { id: ticketId },
      data: {
        status: "SKIPPED",
        completedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/queue");
    return { success: true };
  } catch (error) {
    console.error("Error skipping ticket:", error);
    return { success: false, error: "failedToSkipTicket" };
  }
}

/**
 * Owner recalls the current customer (triggers realtime visual flash & buzzer)
 */
export async function recallTicketAction(ticketId: string) {
  try {
    const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { success: false, error: "ticketNotFound" };

    // Update servedAt to trigger fresh notifications on polling
    await db.ticket.update({
      where: { id: ticketId },
      data: { servedAt: new Date() },
    });

    revalidatePath("/dashboard/queue");
    return { success: true };
  } catch (error) {
    console.error("Error recalling ticket:", error);
    return { success: false, error: "failedToRecallTicket" };
  }
}

/**
 * Owner completes service for the current customer
 */
export async function finishTicketAction(ticketId: string) {
  try {
    const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { success: false, error: "ticketNotFound" };

    await db.ticket.update({
      where: { id: ticketId },
      data: {
        status: "DONE",
        completedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/queue");
    return { success: true };
  } catch (error) {
    console.error("Error finishing ticket:", error);
    return { success: false, error: "failedToFinishTicket" };
  }
}

// ==========================================
// 3. Settings Operations
// ==========================================

export async function updateShopSettingsAction(shopId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const nameEn = formData.get("nameEn") as string;
  const city = formData.get("city") as string;
  const cityEn = formData.get("cityEn") as string;
  const category = formData.get("category") as string;
  const categoryEn = formData.get("categoryEn") as string;
  const avgServiceTime = parseInt(formData.get("avgServiceTime") as string, 10);

  if (!name || !nameEn || !city || !cityEn || !category || !categoryEn || isNaN(avgServiceTime)) {
    return { success: false, error: "allFieldsRequired" };
  }

  try {
    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) return { success: false, error: "shopNotFound" };

    // If slug URL was changed, update it. But we locked slug in registration for MVP. 
    // We update basic branding.
    await db.shop.update({
      where: { id: shopId },
      data: {
        name,
        nameEn,
        city,
        cityEn,
        category,
        categoryEn,
        avgServiceTime,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "failedToSaveSettings" };
  }
}
