import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import SettingsClient from "./SettingsClient";

export default async function DashboardSettingsPage() {
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

  // Generate Customer link URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const customerUrl = `${appUrl}/queue/${shop.slug}`;

  const shopData = {
    id: shop.id,
    name: shop.name,
    nameEn: shop.nameEn,
    slug: shop.slug,
    city: shop.city,
    cityEn: shop.cityEn,
    category: shop.category,
    categoryEn: shop.categoryEn,
    qrCode: shop.qrCode || "",
    avgServiceTime: shop.avgServiceTime,
    customerUrl,
  };

  return (
    <SettingsClient
      shopData={shopData}
      lang={lang}
      dict={dict}
    />
  );
}
