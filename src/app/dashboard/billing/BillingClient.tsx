"use client";

import React, { useState } from "react";
import { 
  Check, 
  AlertCircle, 
  Calendar, 
  CreditCard, 
  Landmark, 
  ShieldCheck, 
  Smartphone, 
  Sparkles 
} from "lucide-react";
import { Dictionary } from "@/lib/dictionaries";

interface BillingClientProps {
  shop: {
    id: string;
    name: string;
    nameEn: string;
    slug: string;
    subscriptionStatus: string;
    trialEndsAt: string;
    subscriptionEndsAt: string | null;
  };
  sessionEmail: string;
  daysRemaining: number;
  isSubscriptionInvalid: boolean;
  lang: string;
  dict: Dictionary;
}

export default function BillingClient({
  shop,
  sessionEmail,
  daysRemaining,
  isSubscriptionInvalid,
  lang,
  dict,
}: BillingClientProps) {
  const isRtl = lang === "ar";
  const displayName = isRtl ? shop.name : shop.nameEn;
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");

  // Format WhatsApp message
  const handleWhatsAppActivation = () => {
    const planText = selectedPlan === "yearly" 
      ? (isRtl ? "السنوي (399 ريال/سنة)" : "Annual (99 SAR/year)")
      : (isRtl ? "الشهري (49 ريال/شهر)" : "Monthly (15 SAR/month)");

    const text = isRtl
      ? `السلام عليكم فريق دَوْرَك،\nأود تفعيل الاشتراك *${planText}* لحساب محلي.\n\nتفاصيل الحساب:\n• اسم المحل: ${displayName}\n• البريد الإلكتروني: ${sessionEmail}\n• رابط المحل الفريد: https://dawrak.com/queue/${shop.slug}\n\nلقد قمت بالتحويل البنكي، ومرفق أدناه إيصال التحويل لتفعيل الحساب.`
      : `Hello Dawrak Team,\nI would like to activate the *${planText}* subscription for my shop.\n\nAccount Details:\n• Shop Name: ${displayName}\n• Email Address: ${sessionEmail}\n• Shop Link: https://dawrak.com/queue/${shop.slug}\n\nI have completed the transfer, and attached below is the payment receipt for activation.`;

    const encodedText = encodeURIComponent(text);
    // WhatsApp contact number (Changeable to the user's phone)
    const phoneNumber = "+966500000000"; 
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, "_blank");
  };

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-8 pb-12 ${isRtl ? "rtl text-right" : "ltr text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent flex items-center gap-3">
          <Landmark className="w-8 h-8 text-primary shrink-0" />
          {dict.billing.title}
        </h1>
        <p className="text-muted-text text-sm">
          {isRtl ? "إدارة حالة اشتراكك، تفاصيل الفوترة وتنشيط باقتك الاحترافية." : "Manage your subscription status, billing details, and activate your professional plan."}
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 transition-all duration-300 ${
        isSubscriptionInvalid
          ? "bg-rose-500/5 border-rose-500/30 shadow-lg shadow-rose-500/5"
          : shop.subscriptionStatus === "TRIAL"
          ? "bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/5"
          : "bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {isSubscriptionInvalid ? (
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              ) : shop.subscriptionStatus === "TRIAL" ? (
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-muted-text">
                {dict.billing.subscriptionStatus}
              </span>
            </div>

            <div className="text-2xl md:text-3xl font-black text-foreground">
              {isSubscriptionInvalid ? (
                <span className="text-rose-500">{dict.billing.expired}</span>
              ) : shop.subscriptionStatus === "TRIAL" ? (
                <span className="text-amber-500">{dict.billing.trialActive}</span>
              ) : (
                <span className="text-emerald-500">{dict.billing.active}</span>
              )}
            </div>

            <p className="text-sm font-medium text-muted-text max-w-2xl">
              {isSubscriptionInvalid 
                ? dict.billing.lockMessage
                : isRtl 
                ? `أنت حالياً تستفيد من المزايا الكاملة للنظام. متبقي لديك ${daysRemaining} يوم في الفترة التجريبية.`
                : `You are currently enjoying the full benefits of the system. You have ${daysRemaining} days remaining in your trial.`}
            </p>
          </div>

          {/* Countdown / Days Circle */}
          <div className="shrink-0 flex items-center gap-4 bg-card-bg/40 border border-card-border px-6 py-4 rounded-2xl">
            <Calendar className={`w-8 h-8 ${isSubscriptionInvalid ? "text-rose-500" : "text-primary"}`} />
            <div>
              <span className="block text-2xl font-black text-foreground">
                {daysRemaining}
              </span>
              <span className="block text-xs font-bold text-muted-text">
                {dict.billing.daysRemaining}
              </span>
            </div>
          </div>
        </div>

        {/* Subtle background glow pattern */}
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none -z-10 ${
          isSubscriptionInvalid ? "bg-rose-500" : shop.subscriptionStatus === "TRIAL" ? "bg-amber-500" : "bg-emerald-500"
        }`} />
      </div>

      {/* Pricing / Packages Grid */}
      <div className="space-y-6">
        <div className="text-center md:text-right">
          <h2 className="text-2xl font-black text-foreground">{dict.billing.choosePlan}</h2>
          <p className="text-sm text-muted-text mt-1">
            {isRtl ? "خطط مرنة وبسيطة مصممة لتلبية احتياجات مشروعك وتحسين تجربة عملائك." : "Flexible, simple plans designed to meet your business needs and elevate customer satisfaction."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <div 
            onClick={() => setSelectedPlan("monthly")}
            className={`cursor-pointer group relative rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between ${
              selectedPlan === "monthly" 
                ? "bg-card-bg border-primary shadow-xl shadow-primary/5 scale-[1.01]" 
                : "bg-card-bg/40 border-card-border hover:border-muted-text/30 hover:scale-[1.005]"
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-foreground">{dict.billing.monthlyPlan}</span>
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  selectedPlan === "monthly" ? "border-primary bg-primary text-white" : "border-card-border"
                }`}>
                  {selectedPlan === "monthly" && <Check className="w-3.5 h-3.5" />}
                </span>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">59</span>
                <span className="text-sm font-bold text-muted-text"> {dict.billing.saudiRiyal} / {isRtl ? "شهرياً" : "month"}</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-card-border/60">
                <div className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isRtl ? "طوابير عملاء غير محدودة" : "Unlimited queues"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isRtl ? "سحب تذاكر ذكي عبر الباركود" : "Smart QR check-in"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isRtl ? "لوحة تحكم تفاعلية للموظفين" : "Interactive employee board"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isRtl ? "إحصائيات وتحليلات الأداء اليومي" : "Daily analytics reports"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Plan (Best Value) */}
          <div 
            onClick={() => setSelectedPlan("yearly")}
            className={`cursor-pointer group relative rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between ${
              selectedPlan === "yearly" 
                ? "bg-gradient-to-b from-card-bg to-primary/5 border-primary shadow-xl shadow-primary/10 scale-[1.01]" 
                : "bg-card-bg/40 border-card-border hover:border-muted-text/30 hover:scale-[1.005]"
            }`}
          >
            {/* Best Value Badge */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              {isRtl ? "القيمة الأفضل" : "Best Value"}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-foreground">{dict.billing.yearlyPlan}</span>
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  selectedPlan === "yearly" ? "border-primary bg-primary text-white" : "border-card-border"
                }`}>
                  {selectedPlan === "yearly" && <Check className="w-3.5 h-3.5" />}
                </span>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">499</span>
                <span className="text-sm font-bold text-muted-text"> {dict.billing.saudiRiyal} / {isRtl ? "سنوياً" : "year"}</span>
              </div>

              <div className="text-xs text-amber-500 font-bold bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-lg inline-block">
                {dict.billing.activatePromo}
              </div>

              <div className="space-y-3 pt-4 border-t border-card-border/60">
                <div className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isRtl ? "كل مميزات الباقة الشهرية" : "All monthly plan features"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isRtl ? "توفير يصل إلى 30% سنوياً" : "Save up to 30% annually"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isRtl ? "دعم فني مخصص ذو أولوية" : "Priority customer support"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isRtl ? "تحديثات دورية مجانية للميزات" : "Free feature updates"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Offline Payment Activation Channel */}
      <div className="glass-panel border border-card-border rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Landmark className="w-6 h-6 text-primary shrink-0" />
          <h3 className="text-xl font-black text-foreground">{dict.billing.bankTransferTitle}</h3>
        </div>

        <p className="text-sm text-muted-text">
          {dict.billing.bankDetails}
        </p>

        {/* Bank transfer cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card-bg/60 border border-card-border p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-foreground">مصرف الراجحي</span>
              <span className="text-xs text-primary font-bold">Al Rajhi Bank</span>
            </div>
            <div className="space-y-1.5 text-xs text-muted-text font-medium">
              <div className="flex justify-between">
                <span>{dict.billing.accountName}:</span>
                <span className="font-bold text-foreground">مؤسسة دورك لتقنية المعلومات</span>
              </div>
              <div className="flex justify-between">
                <span>{dict.billing.accountNumber}:</span>
                <span className="font-bold text-foreground font-mono">1234567890123</span>
              </div>
              <div className="flex justify-between">
                <span>{dict.billing.iban}:</span>
                <span className="font-bold text-foreground font-mono">SA8080000001234567890123</span>
              </div>
            </div>
          </div>

          <div className="bg-card-bg/60 border border-card-border p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-foreground">البنك الأهلي السعودي</span>
              <span className="text-xs text-primary font-bold">SNB Bank</span>
            </div>
            <div className="space-y-1.5 text-xs text-muted-text font-medium">
              <div className="flex justify-between">
                <span>{dict.billing.accountName}:</span>
                <span className="font-bold text-foreground">مؤسسة دورك لتقنية المعلومات</span>
              </div>
              <div className="flex justify-between">
                <span>{dict.billing.accountNumber}:</span>
                <span className="font-bold text-foreground font-mono">9876543210987</span>
              </div>
              <div className="flex justify-between">
                <span>{dict.billing.iban}:</span>
                <span className="font-bold text-foreground font-mono">SA4030000009876543210987</span>
              </div>
            </div>
          </div>
        </div>

        {/* STC Pay Transfer */}
        <div className="pt-4 border-t border-card-border/60 space-y-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-primary shrink-0" />
            <h4 className="text-md font-extrabold text-foreground">{dict.billing.stcPayTitle}</h4>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-xs text-muted-text font-medium">
              {dict.billing.stcPayDetails}
            </p>
            <span className="text-xs bg-emerald-500/10 text-emerald-500 font-bold px-3 py-1 rounded-full border border-emerald-500/20 shrink-0">
              {isRtl ? "تفعيل سريع وفوري" : "Fast Instant Activation"}
            </span>
          </div>
        </div>

        {/* Dynamic WhatsApp Activation CTA Button */}
        <div className="pt-6 flex flex-col items-center justify-center text-center gap-4">
          <button
            onClick={handleWhatsAppActivation}
            className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-md cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.465L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.978 14.12 .952 11.5 .952c-5.44 0-9.866 4.372-9.87 9.799-.002 1.702.459 3.361 1.332 4.811L1.928 22.03l6.719-1.768zm10.968-7.405c-.3-.15-1.77-.872-2.046-.971-.276-.1-.477-.15-.677.15-.2.3-.77.971-.944 1.171-.173.2-.347.225-.647.075-.3-.15-1.268-.467-2.414-1.49-1.146-1.023-1.92-2.286-2.146-2.686-.226-.4-.024-.616.177-.765.18-.135.4-.467.6-.7.2-.233.267-.399.4-.665.133-.267.067-.5-.033-.7-.1-.2-.8-1.928-1.097-2.65-.29-.697-.584-.603-.8-.613-.204-.009-.438-.01-.673-.01-.235 0-.617.089-.938.441-.32.352-1.22 1.196-1.22 2.915s1.246 3.379 1.42 3.613c.174.233 2.453 3.793 5.94 5.31.83.36 1.478.575 1.982.736.834.267 1.593.23 2.193.14.67-.1 1.77-.724 2.02-1.385.25-.66.25-1.229.176-1.348-.074-.12-.274-.22-.574-.37z"/>
            </svg>
            {dict.billing.whatsAppBtn}
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-text font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {isRtl ? "نضمن لك تفعيل حسابك خلال دقائق معدودة من استلام إيصال التحويل." : "We guarantee activating your account within minutes of receiving the transfer receipt."}
          </div>
        </div>
      </div>
    </div>
  );
}
