"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { cancelTicketAction } from "@/lib/actions";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Bell, Clock, Users, ArrowLeft, ArrowRight, XCircle, Volume2, ShieldAlert, CheckCircle2 } from "lucide-react";

interface TicketData {
  ticketId: string;
  ticketNumber: number;
  status: string;
  peopleAhead: number;
  estWaitTime: number;
  currentNumber: number;
  avgServiceTime: number;
  shop: {
    name: string;
    nameEn: string;
    slug: string;
  };
}

interface TicketTrackerProps {
  initialData: TicketData;
  lang: string;
  dict: any;
}

export default function TicketTrackerClient({ initialData, lang, dict }: TicketTrackerProps) {
  const [ticket, setTicket] = useState<TicketData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const prevStatusRef = useRef(initialData.status);

  // Web Audio API Synthesizer for premium high-fidelity bell chime
  const playBellChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      
      // We will play a dual tone bell chime: G5 (784Hz) then C6 (1046Hz) for a classic "ding-dong" effect
      const playTone = (freq: number, startDelay: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startDelay);
        
        // Add metallic ring effect with subtle frequency modulation
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startDelay);
        gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + startDelay + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startDelay + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(audioCtx.currentTime + startDelay);
        osc.stop(audioCtx.currentTime + startDelay + duration);
      };
      
      // Ding
      playTone(784, 0, 0.8);
      // Dong
      playTone(1046, 0.3, 1.2);
    } catch (err) {
      console.warn("Audio synthesis failed:", err);
    }
  };

  // Polling hook every 10 seconds
  useEffect(() => {
    // Prevent polling if ticket is already completed
    if (["DONE", "SKIPPED", "CANCELLED"].includes(ticket.status)) {
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/ticket/${ticket.ticketId}`);
        if (res.ok) {
          const data = await res.json();
          const newStatus = data.status;

          // If status changes to SERVING, trigger bell chime!
          if (newStatus === "SERVING" && prevStatusRef.current !== "SERVING") {
            playBellChime();
          }

          prevStatusRef.current = newStatus;
          setTicket({
            ticketId: data.ticketId,
            ticketNumber: data.ticketNumber,
            status: data.status,
            peopleAhead: data.peopleAhead,
            estWaitTime: data.estWaitTime,
            currentNumber: data.currentNumber,
            avgServiceTime: data.avgServiceTime,
            shop: {
              name: data.shop.name,
              nameEn: data.shop.nameEn,
              slug: data.shop.slug,
            },
          });
        }
      } catch (err) {
        console.error("Error fetching ticket updates:", err);
      }
    };

    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [ticket.ticketId, ticket.status]);

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelTicketAction(ticket.ticketId);
      if (res.success) {
        setTicket((prev) => ({ ...prev, status: "CANCELLED" }));
        setShowCancelModal(false);
      }
    });
  };

  // UI Theme Styling based on Ticket status
  let bgStyles = "bg-background";
  let borderCard = "border-card-border";
  let badgeStyles = "bg-primary/10 text-primary";
  let statusText = dict.customer.statusWaiting;
  let isAlert = false;

  if (ticket.status === "SERVING") {
    bgStyles = "bg-emerald-50/70 dark:bg-emerald-950/20 active-pulse";
    borderCard = "border-emerald-200 dark:border-emerald-900/50 shadow-emerald-100/50 dark:shadow-none";
    badgeStyles = "bg-emerald-500 text-white animate-bounce";
    statusText = dict.customer.statusServing;
    isAlert = true;
  } else if (ticket.status === "WAITING" && ticket.peopleAhead === 0) {
    // You are next! Alert customer visually
    bgStyles = "bg-amber-50/50 dark:bg-amber-950/10";
    borderCard = "border-amber-200 dark:border-amber-900/50";
    badgeStyles = "bg-amber-500 text-white";
    statusText = dict.customer.beReady;
  } else if (ticket.status === "DONE") {
    bgStyles = "bg-slate-50 dark:bg-slate-900/20";
    badgeStyles = "bg-slate-500 text-white";
    statusText = dict.customer.statusDone;
  } else if (ticket.status === "SKIPPED") {
    bgStyles = "bg-rose-50/30 dark:bg-rose-950/10";
    badgeStyles = "bg-rose-500 text-white";
    statusText = dict.customer.statusSkipped;
  } else if (ticket.status === "CANCELLED") {
    bgStyles = "bg-slate-50 dark:bg-slate-950/10";
    badgeStyles = "bg-slate-400 text-white";
    statusText = dict.customer.statusCancelled;
  }

  const shopName = lang === "ar" ? ticket.shop.name : ticket.shop.nameEn;

  return (
    <div className={`flex-1 flex flex-col min-h-screen relative p-4 transition-all duration-500 ${bgStyles} justify-center items-center`}>
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      {/* Floating actions */}
      <div className="absolute top-4 right-4 left-4 flex justify-between items-center z-20">
        <Link
          href={`/queue/${ticket.shop.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-card-border bg-card-bg text-sm font-medium hover:bg-card-border transition-all"
        >
          {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{dict.common.back}</span>
        </Link>
        <div className="flex items-center gap-3">
          {ticket.status === "SERVING" && (
            <button
              onClick={playBellChime}
              className="p-2 rounded-full border border-emerald-200 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-bell hover:scale-105 transition-all cursor-pointer"
              title="Test Sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
          <LanguageSwitcher currentLang={lang} />
        </div>
      </div>

      <div className={`w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 text-center transition-all duration-500 border ${borderCard} shadow-xl`}>
        {/* Ticket Header */}
        <div className="mb-6">
          <span className="text-xs text-muted-text uppercase font-bold block mb-1">
            {shopName}
          </span>
          <h1 className="text-xl font-black text-foreground mb-4">
            {lang === "ar" ? "بطاقة تتبع الانتظار" : "Queue Tracking Ticket"}
          </h1>
          
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase shadow-sm">
            <span className={`w-2 h-2 rounded-full ${ticket.status === "SERVING" ? "bg-white animate-ping" : ticket.status === "WAITING" ? "bg-primary animate-pulse" : "bg-white"}`} />
            <span className={badgeStyles}>{statusText}</span>
          </div>
        </div>

        {/* Large Ticket Number Display */}
        <div className="p-8 rounded-3xl border border-dashed border-card-border bg-card-bg/25 mb-6 relative overflow-hidden">
          <span className="text-xs text-muted-text font-bold block mb-2">
            {dict.customer.yourNumber}
          </span>
          <span className="text-7xl font-black text-primary font-outfit tracking-tight block my-2">
            {ticket.ticketNumber}
          </span>
          {ticket.status === "SERVING" && (
            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold animate-pulse text-sm">
              <Bell className="w-4 h-4 ring-bell" />
              <span>{dict.customer.itsYourTurn}</span>
            </div>
          )}
        </div>

        {/* Waiting Information Matrix */}
        {ticket.status === "WAITING" ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl border border-card-border bg-card-bg/30 text-right flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-text block font-bold">
                  {dict.customer.peopleAhead}
                </span>
                <span className="text-lg font-black text-foreground font-outfit">
                  {ticket.peopleAhead}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-card-border bg-card-bg/30 text-right flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-text block font-bold">
                  {dict.customer.estimatedWait}
                </span>
                <span className="text-sm font-black text-foreground font-outfit">
                  {ticket.estWaitTime} {dict.common.minutes}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-card-border bg-card-bg/30 mb-6 flex items-center justify-center gap-2">
            {ticket.status === "DONE" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {["SKIPPED", "CANCELLED"].includes(ticket.status) && <ShieldAlert className="w-5 h-5 text-rose-500" />}
            <span className="text-sm font-bold text-muted-text">
              {ticket.status === "DONE" ? dict.customer.statusDone : ticket.status === "SKIPPED" ? dict.customer.statusSkipped : dict.customer.statusCancelled}
            </span>
          </div>
        )}

        {/* Realtime serving indicator */}
        {ticket.status === "WAITING" && (
          <div className="p-4 rounded-2xl border border-card-border bg-card-bg/10 flex justify-between items-center text-sm font-medium mb-6">
            <span className="text-muted-text">{dict.customer.currentServingNumber}</span>
            <span className="text-base font-black text-primary font-outfit">
              {ticket.currentNumber || "—"}
            </span>
          </div>
        )}

        {/* Cancel button */}
        {ticket.status === "WAITING" && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-rose-600 dark:text-rose-400 font-bold rounded-2xl transition-all cursor-pointer text-sm"
          >
            <XCircle className="w-4 h-4" />
            <span>{dict.customer.cancelTicketBtn}</span>
          </button>
        )}
      </div>

      {/* Confirmation Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl text-center border border-card-border animate-scale-up">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-foreground mb-2">إلغاء التذكرة</h3>
            <p className="text-sm text-muted-text mb-6 leading-relaxed">
              {dict.customer.cancelWarning}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? "جاري الإلغاء..." : "نعم، إلغاء"}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-card-border hover:bg-card-border font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
