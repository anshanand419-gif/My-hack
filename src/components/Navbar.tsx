import React, { useState } from 'react';
import { 
  Flame, 
  Instagram, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Terminal, 
  CreditCard, 
  HelpCircle, 
  Lock, 
  Menu, 
  X,
  Clock
} from 'lucide-react';
import { SubscriptionState } from '../types';
import { playTapSound, toggleSound, isSoundEnabled } from '../utils/sound';

interface NavbarProps {
  activeTab: 'dashboard' | 'pricing' | 'payment' | 'ai' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'pricing' | 'payment' | 'ai' | 'admin') => void;
  subscription: SubscriptionState;
  remainingTimeFormatted: string;
  isExpired: boolean;
  onOpenPlans: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  subscription,
  remainingTimeFormatted,
  isExpired,
  onOpenPlans,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleTabClick = (tab: 'dashboard' | 'pricing' | 'payment' | 'ai' | 'admin') => {
    playTapSound();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) playTapSound();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-red-950/60 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabClick('dashboard')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 p-[2px] shadow-lg shadow-red-950/50 glow-red">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-wider text-gradient-hell font-mono">
                  HELLBOT
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/50">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                24/7 Aternos Server Bot Engine
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-red-950/60 text-red-400 border border-red-800/60 shadow-sm shadow-red-950'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Bot Dashboard</span>
            </button>

            <button
              onClick={() => handleTabClick('pricing')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'pricing'
                  ? 'bg-red-950/60 text-red-400 border border-red-800/60 shadow-sm shadow-red-950'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Plans & Pricing</span>
            </button>

            <button
              onClick={() => handleTabClick('payment')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'payment'
                  ? 'bg-red-950/60 text-red-400 border border-red-800/60 shadow-sm shadow-red-950'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Pay & UTR Verify</span>
            </button>

            <button
              onClick={() => handleTabClick('ai')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'ai'
                  ? 'bg-red-950/60 text-red-400 border border-red-800/60 shadow-sm shadow-red-950'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>AI Support</span>
            </button>

            <button
              onClick={() => handleTabClick('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-red-950 text-red-300 border border-red-700 shadow-md shadow-red-950'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Owner Portal</span>
            </button>
          </nav>

          {/* Right Header: Subscription Status & Instagram Link */}
          <div className="flex items-center space-x-3">
            {/* Audio Toggle */}
            <button
              onClick={handleSoundToggle}
              title={soundOn ? 'Sound FX Enabled' : 'Sound FX Muted'}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800/60 transition"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
            </button>

            {/* Live Access Status Badge */}
            <div className="hidden sm:flex items-center">
              {subscription.status === 'none' ? (
                <button
                  onClick={onOpenPlans}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/60 hover:brightness-110 transition animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start 7-Day Free Trial</span>
                </button>
              ) : isExpired ? (
                <button
                  onClick={onOpenPlans}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-700/80 shadow-md shadow-red-950 animate-bounce"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>Expired • Renew Now</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">{subscription.planName}</span>
                  <span className="text-emerald-200/80 font-mono text-[11px] bg-emerald-900/60 px-1.5 py-0.5 rounded">
                    {remainingTimeFormatted}
                  </span>
                </div>
              )}
            </div>

            {/* Instagram Profile Link */}
            <a
              href="https://instagram.com/hell_king_ansh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-red-900/40 hover:from-purple-800/60 hover:via-pink-800/60 hover:to-red-800/60 border border-pink-700/50 text-pink-300 text-xs font-semibold shadow-sm transition group"
              title="Official Instagram of Creator @hell_king_ansh"
            >
              <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline">@hell_king_ansh</span>
              <span className="xl:hidden inline">Insta</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800/80 space-y-2">
            <div className="px-2 pb-2">
              {subscription.status === 'none' ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPlans();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 text-white"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start 7-Day Free Trial</span>
                </button>
              ) : isExpired ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPlans();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold bg-red-950 text-red-300 border border-red-700"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Subscription Expired - Renew</span>
                </button>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{subscription.planName}</span>
                  </div>
                  <span className="font-mono text-emerald-300 font-bold">{remainingTimeFormatted}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'dashboard' ? 'bg-red-950/70 text-red-400' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Bot Dashboard</span>
            </button>

            <button
              onClick={() => handleTabClick('pricing')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'pricing' ? 'bg-red-950/70 text-red-400' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Plans & Pricing</span>
            </button>

            <button
              onClick={() => handleTabClick('payment')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'payment' ? 'bg-red-950/70 text-red-400' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Pay & UTR Verify</span>
            </button>

            <button
              onClick={() => handleTabClick('ai')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'ai' ? 'bg-red-950/70 text-red-400' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>AI Support</span>
            </button>

            <button
              onClick={() => handleTabClick('admin')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-xs font-semibold ${
                activeTab === 'admin' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Owner Admin Portal</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
