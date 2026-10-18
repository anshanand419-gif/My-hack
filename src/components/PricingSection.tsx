import React from 'react';
import { Check, Flame, Sparkles, Shield, Zap, Crown, ArrowRight } from 'lucide-react';
import { PLANS } from '../data/plans';
import { Plan } from '../types';
import { playTapSound } from '../utils/sound';

interface PricingSectionProps {
  onSelectPlan: (plan: Plan) => void;
  onStartTrial: () => void;
  currentPlanId?: string;
  isExpired?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  onStartTrial,
  currentPlanId,
  isExpired,
}) => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 text-xs font-bold uppercase tracking-wider mb-4 glow-red">
          <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>Flexible Plans for Every Minecraft Server</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          Unstoppable <span className="text-gradient-hell font-mono">HellBot</span> 24/7 Hosting
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-4">
          Keep your Aternos SMP running continuously with automated anti-AFK, water physics jump, 16-mob combat defense, 
          and instant crash reconnect. Tested and backed by creator <span className="text-pink-400 font-semibold">@hell_king_ansh</span>.
        </p>

        {/* 20% Referral Promo Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-950/70 via-red-950/70 to-amber-950/70 border border-amber-600/50 text-amber-300 text-xs font-bold shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>REFERRAL DEAL: Apply code <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-200 font-mono">ANSH20</code> or your friend's code for an instant 20% OFF!</span>
        </div>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {PLANS.map((plan) => {
          const isTrial = plan.id === 'trial_7d';
          const isCurrent = currentPlanId === plan.id && !isExpired;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-zinc-950 border transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:scale-[1.02] ${
                plan.isBestValue
                  ? 'border-orange-500/80 shadow-xl shadow-orange-950/40 glow-amber'
                  : plan.isPopular
                  ? 'border-red-600/80 shadow-xl shadow-red-950/40 glow-red'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black tracking-wider uppercase rounded-bl-xl border-l border-b ${
                    plan.isBestValue
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-500'
                      : plan.isPopular
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500'
                      : isTrial
                      ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-1">
                    {plan.isBestValue ? (
                      <Flame className="w-5 h-5 text-orange-400" />
                    ) : plan.id === 'month_8' ? (
                      <Crown className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Zap className="w-5 h-5 text-red-400" />
                    )}
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-400 min-h-[32px]">{plan.subtitle}</p>
                </div>

                {/* Price Display */}
                <div className="mb-6 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs text-zinc-400 ml-1">
                        / {plan.durationDays} days
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {plan.durationDays}d license
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 mb-6 text-xs text-zinc-300">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className="p-0.5 rounded-full bg-red-950 text-red-400 mt-0.5 shrink-0 border border-red-800/40">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                {isCurrent ? (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-xs text-center">
                    Current Active Plan
                  </div>
                ) : isTrial ? (
                  <button
                    onClick={() => {
                      playTapSound();
                      onStartTrial();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Start Free Trial</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      playTapSound();
                      onSelectPlan(plan);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg ${
                      plan.isBestValue
                        ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:brightness-110 text-white shadow-orange-950/60'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white shadow-red-950/60'
                    }`}
                  >
                    <span>Pay ₹{plan.price} & Unlock</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-zinc-950 via-red-950/30 to-zinc-950 border border-red-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">
              Full Security for Your Money & Real UTR Verification
            </h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              All payments are verified in real-time through our 12-digit banking UTR verification engine. 
              No fake verification — every transaction is tied to Mukesh Kumar (<span className="text-zinc-300 font-mono">mukeshkumae078@okicici</span>) 
              and instantly audited by <span className="text-pink-400 font-semibold">@hell_king_ansh</span>.
            </p>
          </div>
        </div>

        <a
          href="https://instagram.com/hell_king_ansh"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-pink-300 border border-pink-700/60 text-xs font-semibold shrink-0 transition"
        >
          Message @hell_king_ansh on Insta
        </a>
      </div>
    </section>
  );
};
