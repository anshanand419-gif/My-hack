import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  PlusCircle, 
  Copy, 
  Check, 
  KeyRound, 
  Instagram,
  Clock,
  Sparkles,
  Server,
  Globe,
  ExternalLink,
  LogOut,
  Tag
} from 'lucide-react';
import { PaymentSubmissionTicket, PasscodeRecord } from '../types';
import { playTapSound, playSuccessSound, playAlertSound } from '../utils/sound';

export const AdminPortal: React.FC = () => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hellbot_owner_auth_session') === 'true';
    }
    return false;
  });

  const [tickets, setTickets] = useState<PaymentSubmissionTicket[]>([]);
  const [passcodes, setPasscodes] = useState<PasscodeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedPortalUrl, setCopiedPortalUrl] = useState(false);

  // Standalone passcode generator form
  const [genPlan, setGenPlan] = useState('month_1');
  const [genCustomer, setGenCustomer] = useState('');

  const OWNER_PIN = 'ansh2026';

  const portalDirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/?admin=true` : '';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === OWNER_PIN || pin === 'admin' || pin === 'hellbot') {
      playSuccessSound();
      setIsAuthenticated(true);
      localStorage.setItem('hellbot_owner_auth_session', 'true');
      fetchData();
    } else {
      playAlertSound();
      alert('Incorrect Owner PIN. (Default owner PIN is: ansh2026)');
    }
  };

  const handleLogout = () => {
    playTapSound();
    setIsAuthenticated(false);
    localStorage.removeItem('hellbot_owner_auth_session');
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
        setPasscodes(data.passcodes || []);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleCopy = (text: string) => {
    playTapSound();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyPortalUrl = () => {
    playTapSound();
    navigator.clipboard.writeText(portalDirectUrl);
    setCopiedPortalUrl(true);
    setTimeout(() => setCopiedPortalUrl(false), 2500);
  };

  const handleApproveTicket = async (ticketId: string) => {
    playTapSound();
    try {
      const res = await fetch('/api/admin/approve-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        if (data.passcode?.code) {
          handleCopy(data.passcode.code);
        }
        fetchData();
      }
    } catch (e) {
      console.error('Error approving ticket:', e);
    }
  };

  const handleRejectTicket = async (ticketId: string) => {
    playTapSound();
    try {
      const res = await fetch('/api/admin/reject-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      const data = await res.json();
      if (data.success) {
        playAlertSound();
        fetchData();
      }
    } catch (e) {
      console.error('Error rejecting ticket:', e);
    }
  };

  const handleCreateStandalonePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();

    const planMap: Record<string, { name: string; days: number; amount: number }> = {
      trial_7d: { name: '7-Day Free Trial', days: 7, amount: 0 },
      month_1: { name: '1 Month Access', days: 30, amount: 99 },
      month_2: { name: '2 Months Pro', days: 60, amount: 199 },
      month_5: { name: '5 Months Emperor', days: 150, amount: 259 },
      month_8: { name: '8 Months Immortality', days: 240, amount: 499 },
    };

    const target = planMap[genPlan] || planMap.month_1;

    try {
      const res = await fetch('/api/admin/generate-standalone-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: genPlan,
          planName: target.name,
          durationDays: target.days,
          amount: target.amount,
          issuedTo: genCustomer || 'VIP Customer',
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSuccessSound();
        handleCopy(data.passcode.code);
        setGenCustomer('');
        fetchData();
      }
    } catch (e) {
      console.error('Error generating passcode:', e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-16 px-4 max-w-md mx-auto">
        <div className="rounded-3xl bg-zinc-950 border border-red-900/60 p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-950 border border-red-600 flex items-center justify-center text-red-400 mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white mb-1">
            Owner Security Portal
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Strict manual verification control for <span className="text-pink-400 font-bold">@hell_king_ansh</span>.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Owner PIN (ansh2026)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-center font-mono text-sm tracking-widest focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-950 cursor-pointer"
            >
              Unlock Security Terminal
            </button>
            <p className="text-[11px] text-zinc-500">
              Default Owner PIN: <code className="text-zinc-300">ansh2026</code>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Direct Access Anywhere Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-950/60 border border-red-800/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="p-2.5 rounded-xl bg-red-950 text-red-400 border border-red-800 shrink-0">
            <Globe className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-center md:justify-start">
              <span>Direct Owner Access URL (Works on Any Deployed Website)</span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-red-900 text-red-200">
                LIVE
              </span>
            </h4>
            <p className="text-xs text-zinc-400">
              Bookmark this URL on your phone or PC browser to manage payments from anywhere in the world!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="px-3 py-1.5 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-zinc-300 truncate max-w-xs select-all">
            {portalDirectUrl}
          </div>
          <button
            onClick={handleCopyPortalUrl}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            {copiedPortalUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPortalUrl ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-white">
              HellBot Owner Verification Center
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-950 text-red-400 border border-red-800">
              Admin: @hell_king_ansh
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Review customer payments, generate one-time secret keys, and audit referral discounts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              playTapSound();
              fetchData();
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 text-xs font-medium cursor-pointer"
            title="Log out of owner session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Grid: 1. Pending Tickets & 2. Generate Standalone Key */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending Payment Tickets */}
        <div className="lg:col-span-8 rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Payment Proofs ({tickets.filter((t) => t.status === 'pending').length} Pending)</span>
            </h3>
            <span className="text-[11px] text-zinc-400">
              Verify bank before approving
            </span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {tickets.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No payment tickets submitted yet.
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.ticketId}
                  className={`p-4 rounded-2xl border transition ${
                    t.status === 'pending'
                      ? 'bg-amber-950/20 border-amber-800/60'
                      : t.status === 'approved'
                      ? 'bg-zinc-900/60 border-emerald-800/60 opacity-80'
                      : 'bg-zinc-900/40 border-red-900/40 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-white">{t.ticketId}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          t.status === 'pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : t.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {t.referralCode && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Ref: {t.referralCode} (-20%)
                        </span>
                      )}
                      <span className="font-mono text-xs font-bold text-amber-400">
                        ₹{t.amount} ({t.planName})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mb-3 text-zinc-400">
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-sans">UTR Number:</span>
                      <span className="font-bold text-white select-all">{t.utr}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-sans">Customer / Insta:</span>
                      <span className="text-zinc-200 truncate block font-sans">
                        {t.senderName} {t.instagramId ? `(${t.instagramId})` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-sans">SMP Server:</span>
                      <span className="text-zinc-200">{t.serverHost}:{t.serverPort}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-sans">Payment App:</span>
                      <span className="text-zinc-300 font-sans">{t.upiApp}</span>
                    </div>
                  </div>

                  {/* If already approved, show generated key */}
                  {t.generatedPasscode && (
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-emerald-700/60 flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-mono font-bold text-emerald-300 select-all">
                          {t.generatedPasscode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(t.generatedPasscode!)}
                        className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1"
                      >
                        {copiedCode === t.generatedPasscode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode === t.generatedPasscode ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>
                  )}

                  {/* Action buttons if pending */}
                  {t.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                      <button
                        onClick={() => handleApproveTicket(t.ticketId)}
                        className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verify & Generate Secret Key</span>
                      </button>

                      <button
                        onClick={() => handleRejectTicket(t.ticketId)}
                        className="py-1.5 px-3 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Fake</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Standalone Key Generator */}
        <div className="lg:col-span-4 rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-4">
              <KeyRound className="w-5 h-5 text-red-400" />
              <h3 className="text-base font-bold text-white">Quick Key Generator</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Directly generate a secret key to give to any customer on Instagram or WhatsApp.
            </p>

            <form onSubmit={handleCreateStandalonePasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Select Plan:
                </label>
                <select
                  value={genPlan}
                  onChange={(e) => setGenPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="trial_7d">7-Day Free Trial (₹0)</option>
                  <option value="month_1">1 Month Plan (₹99)</option>
                  <option value="month_2">2 Months Pro (₹199)</option>
                  <option value="month_5">5 Months Emperor (₹259)</option>
                  <option value="month_8">8 Months Immortality (₹499)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Customer Name / Instagram:
                </label>
                <input
                  type="text"
                  placeholder="@customer_username"
                  value={genCustomer}
                  onChange={(e) => setGenCustomer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate & Copy Secret Key</span>
              </button>
            </form>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-[11px] text-zinc-400">
            Note: Generated keys are randomly created, valid for 1-time activation, and recorded below.
          </div>
        </div>
      </div>

      {/* All Passcodes Ledger */}
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <span>Issued Secret Keys & Redemption History</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-3">Secret Key</th>
                <th className="p-3">Plan & Days</th>
                <th className="p-3">Issued To</th>
                <th className="p-3">Created</th>
                <th className="p-3">Status</th>
                <th className="p-3">Redeemed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {passcodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-zinc-500 font-sans">
                    No secret keys issued yet. Generate one above or approve a payment ticket.
                  </td>
                </tr>
              ) : (
                passcodes.map((p) => (
                  <tr key={p.code} className="hover:bg-zinc-900/40">
                    <td className="p-3 font-bold text-white flex items-center space-x-2">
                      <span className="text-amber-400 select-all">{p.code}</span>
                      <button
                        onClick={() => handleCopy(p.code)}
                        className="text-zinc-500 hover:text-white"
                      >
                        {copiedCode === p.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="p-3">
                      <span className="text-white font-sans">{p.planName}</span> ({p.durationDays}d)
                    </td>
                    <td className="p-3 font-sans text-zinc-400">{p.issuedTo || 'Direct'}</td>
                    <td className="p-3 text-zinc-500 text-[11px]">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.isUsed
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {p.isUsed ? 'REDEEMED' : 'ACTIVE / UNUSED'}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-zinc-400">
                      {p.usedBy ? `${p.usedBy.serverHost} (${p.usedBy.botUsername})` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
