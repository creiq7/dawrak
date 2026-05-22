import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
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

  // Calculate days remaining
  let daysRemaining = 0;
  const now = new Date();

  if (shop.subscriptionStatus === "TRIAL") {
    const trialEnd = new Date(shop.trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } else if (shop.subscriptionStatus === "ACTIVE" && shop.subscriptionEndsAt) {
    const subEnd = new Date(shop.subscriptionEndsAt);
    const diffTime = subEnd.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const isTrial = shop.subscriptionStatus === "TRIAL";
  const isExpired = shop.subscriptionStatus === "EXPIRED";
  const trialEnded = isTrial && now > new Date(shop.trialEndsAt);
  const subscriptionEnded = shop.subscriptionStatus === "ACTIVE" && !!shop.subscriptionEndsAt && now > new Date(shop.subscriptionEndsAt);
  const isSubscriptionInvalid = !!(isExpired || trialEnded || subscriptionEnded);

  return (
    <BillingClient
      shop={{
        id: shop.id,
        name: shop.name,
        nameEn: shop.nameEn,
        slug: shop.slug,
        subscriptionStatus: shop.subscriptionStatus,
        trialEndsAt: shop.trialEndsAt.toISOString(),
        subscriptionEndsAt: shop.subscriptionEndsAt ? shop.subscriptionEndsAt.toISOString() : null,
      }}
      sessionEmail={session.email}
      daysRemaining={daysRemaining}
      isSubscriptionInvalid={isSubscriptionInvalid}
      lang={lang}
      dict={dict}
    />
  );
}
