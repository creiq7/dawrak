"use client";

import { useTransition } from "react";
import { toggleLanguageAction } from "@/lib/actions";

interface LanguageSwitcherProps {
  currentLang: string;
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextLang = currentLang === "ar" ? "en" : "ar";
    startTransition(async () => {
      await toggleLanguageAction(nextLang);
      // Force reload to apply layout changes and text translations
      window.location.reload();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-card-border bg-card-bg text-sm font-medium hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50"
    >
      <span className="font-outfit uppercase">{currentLang === "ar" ? "EN" : "عربي"}</span>
    </button>
  );
}
