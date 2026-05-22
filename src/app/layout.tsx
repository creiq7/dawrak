import type { Metadata } from "next";
import { Tajawal, Outfit } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "دَوْرَك | نظام إدارة طوابير الانتظار الرقمية الذكي",
  description: "امسح الكود، احجز دورك، وانتظر براحة في أي مكان. نظام ذكي، بسيط وسريع للمحلات الخدمية.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${tajawal.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-tajawal bg-background text-foreground transition-colors duration-200">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
