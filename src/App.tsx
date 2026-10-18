import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { BotDashboard } from './components/BotDashboard';
import { PricingSection } from './components/PricingSection';
import { PaymentSection } from './components/PaymentSection';
import { AISupportModal } from './components/AISupportModal';
import { AdminPortal } from './components/AdminPortal';
import { BotConfig, SubscriptionState, Plan, UTRRecord } from './types';
import { PLANS } from './data/plans';
import { playSuccessSound, playAlertSound, playTapSound } from './utils/sound';
import { Instagram, Flame, ShieldCheck, Heart, Sparkles, MessageCircle } from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pricing' | 'payment' | 'ai' | 'admin'>('dashboard');

  // Direct Owner Portal URL routing (works on any deployed domain: ?admin=true or #admin)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('admin') === 'true' ||
        params.get('portal') === 'owner' ||
        window.location.hash === '#admin'
      ) {
        setActiveTab('admin');
      }
    }
  }, []);

  // Customer SMP server config state
  const [config, setConfig] = useState<BotConfig>(() => {
    const saved = localStorage.getItem('hellbot_config_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      serverHost: 'myserver.aternos.me',
      serverPort: 25565,
      botUsername: 'HellBot_AAGOP',
      minecraftVersion: 'auto',
      enableAntiAfk: true,
      enableCombat: true,
      enableWaterJump: true,
      enableCrashProtection: true,
      reconnectIntervalSeconds: 15,
      maxSessionHours: 10,
      attackDistance: 3.5,
    };
  });

  // Save config on change
  useEffect(() => {
    localStorage.setItem('hellbot_config_v2', JSON.stringify(config));
  }, [config]);

  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    const saved = localStorage.getItem('hellbot_subscription_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {}
    }
    return {
      status: 'none',
      planId: '',
      planName: '',
      activatedAt: '',
      expiresAt: '',
      serverHost: 'myserver.aternos.me',
      serverPort: 25565,
      botUsername: 'HellBot_AAGOP',
    };
  });

  // Selected plan for payment modal
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]); // Default 1 Month (₹99)

  // Real-time Countdown and Expiration Monitoring ("when time khatam acess automatically disable")
  const [remainingTime, setRemainingTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    function calculateTimeRemaining() {
      if (!subscription.expiresAt || subscription.status === 'none') {
        setIsExpired(false);
        setRemainingTime({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        return;
      }

      const expiryTime = new Date(subscription.expiresAt).getTime();
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        // TIME KHATAM HO GAYA -> Automatically disable access!
        setIsExpired(true);
        setRemainingTime({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

        if (subscription.status !== 'expired') {
          const expiredState: SubscriptionState = {
            ...subscription,
            status: 'expired',
          };
          setSubscription(expiredState);
          localStorage.setItem('hellbot_subscription_v2', JSON.stringify(expiredState));
          playAlertSound();
        }
      } else {
        setIsExpired(false);
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        setRemainingTime({ days, hours, minutes, seconds, totalSeconds });
      }
    }

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

  // Activate 7-Day Free Trial (1-click, instant)
  const handleStartTrial = () => {
    playTapSound();
    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const trialState: SubscriptionState = {
      status: 'trial',
      planId: 'trial_7d',
      planName: '7-Day Free Trial',
      activatedAt: now.toISOString(),
      expiresAt: expiry,
      serverHost: config.serverHost,
      serverPort: config.serverPort,
      botUsername: config.botUsername,
    };

    setSubscription(trialState);
    localStorage.setItem('hellbot_subscription_v2', JSON.stringify(trialState));
    playSuccessSound();
    setActiveTab('dashboard');
  };

  // Passcode verified & redeemed
  const handlePaymentSuccess = (subData: any) => {
    const newState: SubscriptionState = {
      status: 'active',
      planId: subData.planId,
      planName: subData.planName,
      activatedAt: subData.activatedAt,
      expiresAt: subData.expiresAt,
      utr: subData.passcode || subData.utr,
      amount: subData.amount,
      senderName: subData.senderName,
      serverHost: config.serverHost,
      serverPort: config.serverPort,
      botUsername: config.botUsername,
    };

    setSubscription(newState);
    localStorage.setItem('hellbot_subscription_v2', JSON.stringify(newState));
  };

  // Format remaining time string for badges
  const remainingTimeFormatted = isExpired
    ? 'Access Expired'
    : subscription.status === 'none'
    ? 'No Active Plan'
    : `${remainingTime.days}d ${remainingTime.hours}h ${remainingTime.minutes}m`;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-red-600 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-100px] w-[450px] h-[450px] bg-orange-600/5 rounded-full blur-[160px]" />
      </div>

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subscription={subscription}
        remainingTimeFormatted={remainingTimeFormatted}
        isExpired={isExpired}
        onOpenPlans={() => setActiveTab('pricing')}
      />

      {/* Global Access Expiration & Status Banner */}
      <SubscriptionBanner
        subscription={subscription}
        remainingTime={remainingTime}
        isExpired={isExpired}
        onOpenPlans={() => setActiveTab('pricing')}
        onStartTrial={handleStartTrial}
      />

      {/* Dynamic Content Views */}
      <main className="flex-1 relative z-10">
        {activeTab === 'dashboard' && (
          <BotDashboard
            config={config}
            setConfig={setConfig}
            subscription={subscription}
            isExpired={isExpired}
            onOpenPlans={() => setActiveTab('pricing')}
            onOpenAI={() => setActiveTab('ai')}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingSection
            currentPlanId={subscription.planId}
            isExpired={isExpired}
            onStartTrial={handleStartTrial}
            onSelectPlan={(plan) => {
              setSelectedPlan(plan);
              setActiveTab('payment');
            }}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentSection
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            serverHost={config.serverHost}
            serverPort={config.serverPort}
            botUsername={config.botUsername}
            onPaymentSuccess={handlePaymentSuccess}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'ai' && (
          <AISupportModal
            serverHost={config.serverHost}
            serverPort={config.serverPort}
          />
        )}

        {activeTab === 'admin' && <AdminPortal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-red-950/60 bg-zinc-950/90 py-10 px-4 sm:px-6 lg:px-8 relative z-10 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white glow-red">
              <Flame className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <span className="font-extrabold text-base tracking-wider font-mono text-gradient-hell">
                  HELLBOT
                </span>
                <span className="text-[10px] text-zinc-500">v2.5.0</span>
              </div>
              <p className="text-xs text-zinc-500">
                Created & maintained by{' '}
                <a
                  href="https://instagram.com/hell_king_ansh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 font-bold hover:underline"
                >
                  @hell_king_ansh
                </a>{' '}
                on Instagram.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-white transition cursor-pointer"
            >
              Bot Engine
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className="hover:text-white transition cursor-pointer"
            >
              Pricing (₹99 - ₹499)
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className="hover:text-white transition cursor-pointer"
            >
              Real UTR Scanner
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className="hover:text-white transition cursor-pointer"
            >
              AI Troubleshooting
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-amber-400 hover:text-amber-300 transition font-bold cursor-pointer flex items-center space-x-1"
            >
              <span>👑 Owner Portal</span>
            </button>
            <a
              href="https://instagram.com/hell_king_ansh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-pink-400 font-bold hover:text-pink-300 transition"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@hell_king_ansh</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-900 text-center text-[11px] text-zinc-600">
          Disclaimer: HellBot is an independent Minecraft server keepalive automation tool. Not affiliated with Mojang AB or Microsoft. All payments verified through secure Indian UPI banking references.
        </div>
      </footer>
    </div>
  );
}
