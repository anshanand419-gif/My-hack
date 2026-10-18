import React from 'react';
import { ShieldCheck, AlertOctagon, Clock, Sparkles, RefreshCw, Server, ArrowRight } from 'lucide-react';
import { SubscriptionState } from '../types';
import { playTapSound } from '../utils/sound';

interface SubscriptionBannerProps {
  subscription: SubscriptionState;
  remainingTime: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  isExpired: boolean;
  onOpenPlans: () => void;
  onStartTrial: () => void;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  subscription,
  remainingTime,
  isExpired,
  onOpenPlans,
  onStartTrial,
}) => {
  // If no subscription at all
  if (subscription.status === 'none') {
    return (
      <div className="w-full bg-gradient-to-r from-red-950/80 via-zinc-900 to-amber-950/80 border-b border-red-900/60 p-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
              <Sparkles className="w-6 h-6 animate-spin text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                <span>Start Your 7-Day Free Trial of HellBot</span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Instant Access
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Test 24/7 Aternos keepalive, anti-AFK, water auto-jump, and 16 mob auto-combat. No payment needed.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => {
                playTapSound();
                onStartTrial();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-red-950/60 glow-red transition-all cursor-pointer"
            >
              <span>Activate 7 Days Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playTapSound();
                onOpenPlans();
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 font-semibold text-xs transition"
            >
              View Paid Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If subscription expired: "when time khatam acess automatically disable"
  if (isExpired) {
    return (
      <div className="w-full bg-red-950/90 border-b-2 border-red-600 p-4 shadow-xl shadow-red-950/80 animate-pulse">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-lg shadow-red-900">
              <AlertOctagon className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-base font-extrabold text-red-200 uppercase tracking-wide">
                  ⚠️ ACCESS DISABLED: TIME KHATAM HO GAYA (SUBSCRIPTION EXPIRED)
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black rounded bg-red-900 text-red-100 border border-red-500">
                  LOCKED
                </span>
              </div>
              <p className="text-xs text-red-300/90 mt-0.5">
                Your HellBot license for <span className="font-mono font-bold text-white">{subscription.serverHost}</span> has expired. 
                Bot generation, download, and server keepalive features are temporarily locked. Renew to resume!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onOpenPlans();
            }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-black font-extrabold text-sm shadow-lg shadow-red-950 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
            <span>Renew Plan & Unlock Now</span>
          </button>
        </div>
      </div>
    );
  }

  // Subscription is active!
  return (
    <div className="w-full bg-zinc-950 border-b border-emerald-950/80 p-3.5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-emerald-300">
                ACTIVE LICENSE: {subscription.planName}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/40">
                PROTECTED
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
              <Server className="w-3 h-3 text-zinc-500" />
              <span>Target: <span className="font-mono text-zinc-300">{subscription.serverHost}:{subscription.serverPort}</span></span>
              {subscription.utr && (
                <span className="text-zinc-500">| UTR: <span className="font-mono text-zinc-300">{subscription.utr}</span></span>
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Countdown Timer Block */}
        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <div className="flex items-center space-x-1 font-mono font-bold text-xs sm:text-sm">
              <span className="text-emerald-400">{String(remainingTime.days).padStart(2, '0')}d</span>
              <span className="text-zinc-600">:</span>
              <span className="text-emerald-400">{String(remainingTime.hours).padStart(2, '0')}h</span>
              <span className="text-zinc-600">:</span>
              <span className="text-emerald-400">{String(remainingTime.minutes).padStart(2, '0')}m</span>
              <span className="text-zinc-600">:</span>
              <span className="text-emerald-300 animate-pulse">{String(remainingTime.seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onOpenPlans();
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold transition"
          >
            Extend / Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};
