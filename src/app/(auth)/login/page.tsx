"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen relative p-4 bg-background">
      {/* Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-3xl relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
              د
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              دَوْرَك
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول للمنشأة</h1>
          <p className="text-sm text-muted-text mt-2 font-medium">أدر طابور انتظار عملائك بكل سهولة</p>
        </div>

        {state?.error && (
          <div className="p-4 mb-6 rounded-2xl bg-error-red/10 border border-error-red/20 text-error-red text-sm font-medium text-center">
            {state.error === "invalidCredentials"
              ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
              : "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى"}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
              <input
                type="email"
                name="email"
                required
                placeholder="owner@example.com"
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all text-right"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 cursor-pointer disabled:opacity-50 text-sm"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>دخول</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-card-border">
          <span className="text-sm text-muted-text">ليس لديك حساب؟ </span>
          <Link href="/register" className="text-sm font-bold text-primary hover:underline">
            أنشئ حسابك الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
