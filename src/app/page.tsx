import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/dictionaries";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ArrowRight, ArrowLeft, Users, Zap, Clock, Smartphone } from "lucide-react";

export default async function HomePage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const dict = getDictionary(lang);

  const features = [
    {
      icon: <Smartphone className="w-6 h-6 text-primary" />,
      title: lang === "ar" ? "بدون تحميل تطبيقات" : "No App Downloads",
      desc: lang === "ar" ? "يعمل العميل بالكامل من متصفح جواله فور مسح كود QR." : "Customers scan a QR code and queue up immediately from their web browser."
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: lang === "ar" ? "حساب وقت الانتظار" : "Estimated Wait Time",
      desc: lang === "ar" ? "يعرف العميل وقته المتوقع بدقة وعدد الأشخاص أمامه." : "Customers see how many people are ahead and their exact estimated wait time."
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: lang === "ar" ? "تحديث فوري لحظي" : "Instant Live Updates",
      desc: lang === "ar" ? "تحديث تلقائي لحالة الدور بدون الحاجة لتحديث الصفحة." : "Live ticket tracking updates automatically without reloading the page."
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-card-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/20">
              د
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              {dict.common.appName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLang={lang} />
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {dict.auth.login}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-card-border bg-card-bg text-sm font-medium text-primary mb-8 animate-fade-in">
          <Users className="w-4 h-4" />
          <span>{dict.common.tagline}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-3xl">
          {lang === "ar" ? "أدر طوابير عملائك بذكاء وسلاسة" : "Manage Your Customer Queue Smartly & Seamlessly"}
        </h1>

        <p className="text-lg md:text-xl text-muted-text max-w-2xl mb-12 leading-relaxed">
          {dict.common.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 w-full max-w-md">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 cursor-pointer text-base"
          >
            <span>{dict.auth.register}</span>
            {lang === "ar" ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-card-bg border border-card-border hover:bg-card-border font-semibold rounded-2xl transition-all duration-200 cursor-pointer text-base"
          >
            <span>{dict.auth.login}</span>
          </Link>
        </div>

        {/* Features list */}
        <div className="grid md:grid-cols-3 gap-8 w-full">
          {features.map((feat, i) => (
            <div key={i} className="glass-panel p-8 rounded-3xl text-right flex flex-col items-start transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 w-full text-right">{feat.title}</h3>
              <p className="text-muted-text text-sm leading-relaxed text-right w-full">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-card-border mt-auto z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-text">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {dict.common.appName}.</span>
            <span>{lang === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</span>
          </div>
          <div>
            {lang === "ar" ? "صنع بحب لتسهيل أعمالكم" : "Made with passion to power your business"}
          </div>
        </div>
      </footer>
    </div>
  );
}
