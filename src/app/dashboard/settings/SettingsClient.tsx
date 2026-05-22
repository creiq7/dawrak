"use client";

import { useActionState, useEffect, useTransition } from "react";
import { updateShopSettingsAction } from "@/lib/actions";
import { Settings, Printer, Download, Copy, Check, Clock, Globe, MapPin, Tag, Loader2, Link2 } from "lucide-react";
import { useState } from "react";

interface ShopData {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  city: string;
  cityEn: string;
  category: string;
  categoryEn: string;
  qrCode: string;
  avgServiceTime: number;
  customerUrl: string;
}

interface SettingsProps {
  shopData: ShopData;
  lang: string;
  dict: any;
}

export default function SettingsClient({ shopData, lang, dict }: SettingsProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction, isFormPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await updateShopSettingsAction(shopData.id, formData);
    },
    null
  );

  // Copy customer URL to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shopData.customerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Download QR Code as SVG file
  const handleDownloadQR = () => {
    try {
      const blob = new Blob([shopData.qrCode], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-code-${shopData.slug}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR code:", err);
    }
  };

  // Print QR Code Poster natively
  const handlePrintQR = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const displayName = lang === "ar" ? shopData.name : shopData.nameEn;
    const categoryName = lang === "ar" ? shopData.category : shopData.categoryEn;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${displayName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
            body {
              font-family: 'Tajawal', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 40px;
              box-sizing: border-box;
              text-align: center;
              background-color: #ffffff;
            }
            .poster {
              border: 15px solid #4f46e5;
              border-radius: 40px;
              padding: 60px 40px;
              width: 100%;
              max-width: 600px;
              box-shadow: 0 20px 50px rgba(0,0,0,0.05);
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .logo {
              width: 80px;
              height: 80px;
              border-radius: 24px;
              background-color: #4f46e5;
              color: white;
              font-size: 40px;
              font-weight: 900;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 38px;
              font-weight: 900;
              margin: 10px 0;
              color: #1e1b4b;
            }
            h2 {
              font-size: 20px;
              font-weight: 700;
              color: #4f46e5;
              margin: 0 0 40px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .qr-container {
              padding: 20px;
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 30px;
              margin-bottom: 40px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.03);
            }
            .qr-container svg {
              width: 320px !important;
              height: 320px !important;
            }
            .instructions {
              font-size: 22px;
              font-weight: 900;
              color: #1e1b4b;
              margin-bottom: 10px;
            }
            .sub-instructions {
              font-size: 16px;
              font-weight: 700;
              color: #64748b;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="poster">
            <div class="logo">د</div>
            <h1>${displayName}</h1>
            <h2>${categoryName}</h2>
            <div class="qr-container">
              ${shopData.qrCode}
            </div>
            <div class="instructions">امسح الكود واحجز دورك الآن</div>
            <div class="sub-instructions">Scan the code and reserve your turn now</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const displayName = lang === "ar" ? shopData.name : shopData.nameEn;

  return (
    <div className="flex-1 flex flex-col gap-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{dict.dashboard.settings}</h1>
        <p className="text-sm text-muted-text mt-1 font-medium">أضف لمستك الخاصة، واطبع كود الاستقبال لعملائك</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: BRANDING AND SETTINGS FORM */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-card-border shadow-md">
            <h2 className="text-lg font-extrabold text-foreground mb-6 flex items-center gap-2 border-b border-card-border pb-4">
              <Settings className="w-5 h-5 text-primary" />
              <span>{dict.dashboard.shopDetails}</span>
            </h2>

            {state?.success && (
              <div className="p-4 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold text-center animate-pulse">
                {dict.dashboard.settingsSaved}
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">اسم النشاط التجاري (العربية)</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={shopData.name}
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Shop Name (English)</label>
                  <input
                    type="text"
                    name="nameEn"
                    required
                    defaultValue={shopData.nameEn}
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right font-medium"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">المدينة (العربية)</label>
                  <input
                    type="text"
                    name="city"
                    required
                    defaultValue={shopData.city}
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">City (English)</label>
                  <input
                    type="text"
                    name="cityEn"
                    required
                    defaultValue={shopData.cityEn}
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right font-medium"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">تصنيف النشاط (العربية)</label>
                  <input
                    type="text"
                    name="category"
                    required
                    defaultValue={shopData.category}
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Category (English)</label>
                  <input
                    type="text"
                    name="categoryEn"
                    required
                    defaultValue={shopData.categoryEn}
                    className="w-full px-4 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{dict.common.avgServiceTime} ({dict.common.minutes})</span>
                </label>
                <input
                  type="number"
                  name="avgServiceTime"
                  required
                  min={1}
                  max={120}
                  defaultValue={shopData.avgServiceTime}
                  className="w-full px-4 py-3 rounded-xl border border-card-border bg-card-bg/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-right font-medium font-outfit"
                />
              </div>

              <button
                type="submit"
                disabled={isFormPending}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-2xl transition-all shadow-md shadow-primary/10 cursor-pointer disabled:opacity-50 text-sm"
              >
                {isFormPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>{dict.common.save}</span>
                )}
              </button>
            </form>
          </div>

          {/* Customer URL clipboard Card */}
          <div className="glass-panel p-6 rounded-3xl border border-card-border shadow-md">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-primary" />
              <span>{dict.dashboard.slugLink}</span>
            </h3>
            <div className="flex gap-2 items-center bg-card-bg/30 border border-card-border p-2 rounded-2xl">
              <input
                type="text"
                readOnly
                value={shopData.customerUrl}
                className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-primary text-right focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="p-2.5 rounded-xl border border-card-border bg-card-bg hover:bg-card-border text-muted-text hover:text-primary transition-all cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QR CODE PRINTER POSTER CARD */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-card-border shadow-md text-center flex flex-col items-center">
            <h2 className="text-sm font-extrabold text-foreground mb-2 w-full text-right">
              {dict.dashboard.qrCodeTitle}
            </h2>
            <p className="text-xs text-muted-text leading-relaxed text-right mb-6">
              {dict.dashboard.qrCodeDesc}
            </p>

            {/* QR SVG container */}
            <div className="p-4 bg-white border border-card-border rounded-[2.5rem] shadow-sm mb-6 flex items-center justify-center relative overflow-hidden">
              <div
                dangerouslySetInnerHTML={{ __html: shopData.qrCode }}
                className="w-56 h-56 [&>svg]:w-full [&>svg]:h-full"
              />
            </div>

            {/* Print and Download Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={handlePrintQR}
                className="inline-flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all cursor-pointer shadow-md shadow-primary/10 text-xs"
              >
                <Printer className="w-4.5 h-4.5" />
                <span>{dict.dashboard.printQR}</span>
              </button>
              
              <button
                onClick={handleDownloadQR}
                className="inline-flex items-center justify-center gap-2 py-3.5 border border-card-border bg-card-bg hover:bg-card-border font-bold rounded-2xl transition-all cursor-pointer text-xs"
              >
                <Download className="w-4.5 h-4.5" />
                <span>{dict.dashboard.downloadQR}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
