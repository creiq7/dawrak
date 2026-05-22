"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/lib/actions";
import { User, Mail, Lock, ShoppingBag, Globe, MapPin, Tag, Link2, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state, router]);

  const errorMessages: Record<string, string> = {
    allFieldsRequired: "يرجى ملء جميع الحقول المطلوبة.",
    invalidSlug: "رابط المحل غير صالح. استخدم الحروف والأرقام والواصلات فقط.",
    emailExists: "البريد الإلكتروني مسجل بالفعل لدينا.",
    slugExists: "رابط المحل مستخدم بالفعل، يرجى اختيار رابط مميز آخر.",
    registrationFailed: "فشل إنشاء الحساب. يرجى مراجعة البيانات والمحاولة لاحقاً."
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen relative p-4 py-12 bg-background">
      {/* Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl glass-panel p-8 md:p-10 rounded-3xl relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
              د
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              دَوْرَك
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">إنشاء حساب محل جديد</h1>
          <p className="text-sm text-muted-text mt-2 font-medium">ابدأ استقبال وتوجيه عملائك رقمياً خلال دقائق</p>
        </div>

        {state?.error && (
          <div className="p-4 mb-6 rounded-2xl bg-error-red/10 border border-error-red/20 text-error-red text-sm font-medium text-center">
            {errorMessages[state.error] || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى"}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <h2 className="text-sm font-bold text-primary border-b border-card-border pb-2 uppercase tracking-wide">
            1. معلومات المالك والولوج
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">الاسم الكامل للمالك</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="محمد أحمد"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="owner@example.com"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">كلمة المرور للولوج</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right"
              />
            </div>
          </div>

          <h2 className="text-sm font-bold text-primary border-b border-card-border pb-2 pt-4 uppercase tracking-wide">
            2. معلومات النشاط التجاري (Bilingual Branding)
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">اسم المحل بالكامل (العربية)</label>
              <div className="relative">
                <ShoppingBag className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="text"
                  name="shopName"
                  required
                  placeholder="حلاقة راقية"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Shop Name (English)</label>
              <div className="relative">
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="text"
                  name="shopNameEn"
                  required
                  placeholder="Elegant Barber"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">المدينة (العربية)</label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="الرياض"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">City (English)</label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="text"
                  name="cityEn"
                  required
                  placeholder="Riyadh"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">تصنيف المحل (العربية)</label>
              <div className="relative">
                <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="text"
                  name="category"
                  required
                  placeholder="صالون حلاقة"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Category (English)</label>
              <div className="relative">
                <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="text"
                  name="categoryEn"
                  required
                  placeholder="Barber Shop"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>رابط المحل الفريد (Slug - حروف إنجليزية وأرقام فقط)</span>
              <span className="text-[10px] text-primary">سيكون رابط الطابور الخاص بك</span>
            </label>
            <div className="relative">
              <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
              <input
                type="text"
                name="slug"
                required
                placeholder="elegant-barber"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 cursor-pointer disabled:opacity-50 text-sm mt-8"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>إنشاء الحساب وبدء الطابور</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-card-border">
          <span className="text-sm text-muted-text">لديك حساب بالفعل؟ </span>
          <Link href="/login" className="text-sm font-bold text-primary hover:underline">
            سجل دخولك من هنا
          </Link>
        </div>
      </div>
    </div>
  );
}
