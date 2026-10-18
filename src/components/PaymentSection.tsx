import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  Smartphone,
  Info,
  CheckCircle2,
  Clock,
  KeyRound,
  Send,
  Instagram,
  ArrowRight,
  ShieldAlert,
  Tag,
  Share2,
  Percent,
  X
} from 'lucide-react';
import { Plan, PaymentSubmissionTicket } from '../types';
import { PLANS } from '../data/plans';
import { playTapSound, playSuccessSound, playAlertSound } from '../utils/sound';

interface PaymentSectionProps {
  selectedPlan: Plan;
  onSelectPlan: (plan: Plan) => void;
  serverHost: string;
  serverPort: number;
  botUsername: string;
  onPaymentSuccess: (subscriptionData: any) => void;
  onBackToDashboard: () => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  selectedPlan,
  onSelectPlan,
  serverHost,
  serverPort,
  botUsername,
  onPaymentSuccess,
  onBackToDashboard,
}) => {
  // Tabs: 'submit' (pay & submit ticket) vs 'redeem' (enter owner passcode)
  const [activeStep, setActiveStep] = useState<'submit' | 'redeem'>('submit');

  // Referral & 20% Discount state
  const [referralInput, setReferralInput] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<string | null>(null);
  const [referralSuccessMsg, setReferralSuccessMsg] = useState<string | null>(null);
  const [referralErrorMsg, setReferralErrorMsg] = useState<string | null>(null);
  const [myReferralCopied, setMyReferralCopied] = useState(false);

  // Submit form state
  const [utrInput, setUtrInput] = useState('');
  const [senderName, setSenderName] = useState('');
  const [instagramId, setInstagramId] = useState('');
  const [upiApp, setUpiApp] = useState('Google Pay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<PaymentSubmissionTicket | null>(null);

  // Redeem form state (NO EXAMPLES in placeholder as requested!)
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemedData, setRedeemedData] = useState<any | null>(null);

  // Quick clipboard state
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState(false);

  const UPI_ID = 'mukeshkumae078@okicici';
  const PAYEE_NAME = 'Mukesh Kumar';

  // Check URL parameters for referral code on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref && !appliedReferral) {
        const cleanRef = ref.trim().toUpperCase();
        setReferralInput(cleanRef);
        setAppliedReferral(cleanRef);
        setReferralSuccessMsg(`🎉 20% Discount applied via referral link (${cleanRef})!`);
      }
    }
  }, []);

  // 20% Discount Calculation
  const discountAmount = appliedReferral && selectedPlan.price > 0 ? Math.round(selectedPlan.price * 0.20) : 0;
  const finalPrice = Math.max(0, selectedPlan.price - discountAmount);

  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&cu=INR&am=${finalPrice}&tn=${encodeURIComponent(
    `HellBot-${selectedPlan.name}-${botUsername}${appliedReferral ? `-${appliedReferral}` : ''}`
  )}`;

  const handleApplyReferral = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    const code = referralInput.trim().toUpperCase();
    if (!code) {
      setReferralErrorMsg('Please enter a referral code.');
      playAlertSound();
      return;
    }
    if (code.length < 3) {
      setReferralErrorMsg('Referral code must be at least 3 characters.');
      playAlertSound();
      return;
    }

    setAppliedReferral(code);
    setReferralErrorMsg(null);
    setReferralSuccessMsg(`🎉 Referral code "${code}" applied! You get 20% OFF instantly.`);
    playSuccessSound();
  };

  const handleRemoveReferral = () => {
    playTapSound();
    setAppliedReferral(null);
    setReferralSuccessMsg(null);
    setReferralErrorMsg(null);
    setReferralInput('');
  };

  const handleCopyMyReferral = () => {
    playTapSound();
    const myCode = instagramId ? instagramId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'HELLBOT20';
    const link = `${window.location.origin}/?ref=${myCode}`;
    navigator.clipboard.writeText(link);
    setMyReferralCopied(true);
    setTimeout(() => setMyReferralCopied(false), 2500);
  };

  const handleCopyUPI = () => {
    playTapSound();
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyTicket = (ticketId: string) => {
    playTapSound();
    navigator.clipboard.writeText(ticketId);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2500);
  };

  // Step 1: Submit Payment Ticket to Owner
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    setSubmitError(null);

    const cleanUTR = utrInput.trim().toUpperCase();

    if (!cleanUTR || cleanUTR.length < 12) {
      setSubmitError('Please enter a valid 12-digit UTR from your UPI payment receipt.');
      playAlertSound();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-payment-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: cleanUTR,
          amount: finalPrice,
          originalAmount: selectedPlan.price,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          durationDays: selectedPlan.durationDays,
          senderName: senderName || 'Customer',
          instagramId: instagramId || '',
          referralCode: appliedReferral || '',
          discountApplied: !!appliedReferral,
          upiApp,
          serverHost: serverHost || 'Custom.aternos.me',
          serverPort: serverPort || 25565,
          botUsername: botUsername || 'HellBot',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit payment ticket.');
      }

      setIsSubmitting(false);
      setCreatedTicket(data.ticket);
      playSuccessSound();
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Submission error. Check your UTR and try again.');
      playAlertSound();
    }
  };

  // Step 2: Redeem Secret Passcode issued by Owner @hell_king_ansh
  const handleRedeemPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    setRedeemError(null);

    const cleanCode = passcodeInput.trim().toUpperCase();

    if (!cleanCode) {
      setRedeemError('Please enter the secret activation key.');
      playAlertSound();
      return;
    }

    setIsRedeeming(true);

    try {
      const response = await fetch('/api/redeem-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: cleanCode,
          serverHost,
          serverPort,
          botUsername,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid passcode. Access Denied.');
      }

      setIsRedeeming(false);
      setRedeemedData(data.subscription);
      playSuccessSound();

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
      });

      onPaymentSuccess(data.subscription);
    } catch (err: any) {
      setIsRedeeming(false);
      setRedeemError(err.message || 'Verification failed. Random codes are not allowed.');
      playAlertSound();
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Step Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => {
            playTapSound();
            onBackToDashboard();
          }}
          className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <span className="text-base">←</span>
          <span>Back to Bot Dashboard</span>
        </button>

        {/* Step Tabs: 1. Pay & Submit | 2. Redeem Secret Key */}
        <div className="flex items-center space-x-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => {
              playTapSound();
              setActiveStep('submit');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeStep === 'submit'
                ? 'bg-red-950 text-red-300 border border-red-800 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>1. Pay & Submit Proof</span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              setActiveStep('redeem');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeStep === 'redeem'
                ? 'bg-red-950 text-red-300 border border-red-800 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Redeem Secret Key</span>
          </button>
        </div>
      </div>

      {/* Refer & 20% Discount Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-zinc-950 to-amber-950/80 border border-amber-600/40 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Percent className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-center md:justify-start">
              <span>Referral Program: Get 20% Discount</span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-amber-500/30 text-amber-300 border border-amber-500/50">
                20% OFF
              </span>
            </h4>
            <p className="text-xs text-zinc-400">
              Apply any friend's referral code or <code className="text-amber-300 font-mono font-bold">ANSH20</code> to instantly get 20% off all plans!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {appliedReferral ? (
            <div className="flex items-center justify-between gap-2 bg-emerald-950/80 border border-emerald-600 px-3 py-1.5 rounded-xl text-xs text-emerald-300 w-full md:w-auto">
              <span className="font-bold">Code: {appliedReferral} (-20% Active)</span>
              <button
                onClick={handleRemoveReferral}
                title="Remove Discount"
                className="p-1 hover:bg-emerald-900 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyReferral} className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Enter Referral Code..."
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs w-full sm:w-44 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white font-bold text-xs cursor-pointer shrink-0"
              >
                Apply 20%
              </button>
            </form>
          )}

          <button
            onClick={handleCopyMyReferral}
            title="Share referral link"
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-pink-400" />
            <span>{myReferralCopied ? 'Link Copied!' : 'Refer Friends'}</span>
          </button>
        </div>
      </div>

      {referralSuccessMsg && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{referralSuccessMsg}</span>
        </div>
      )}

      {referralErrorMsg && (
        <div className="mb-6 p-3 rounded-xl bg-red-950/70 border border-red-700 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{referralErrorMsg}</span>
        </div>
      )}

      {/* STEP 1: SCANNER & SUBMIT PROOF */}
      {activeStep === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: QR Scanner (Mukesh Kumar) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border-2 border-red-900/50 p-6 shadow-2xl shadow-red-950/40 relative overflow-hidden">
              {/* Merchant Identity Header */}
              <div className="flex items-center space-x-3 mb-5 border-b border-zinc-800/80 pb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                  M
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{PAYEE_NAME}</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <span>Verified Merchant</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </p>
                </div>
              </div>

              {/* QR Box with Dynamic Amount */}
              <div className="relative bg-white rounded-2xl p-5 shadow-inner flex flex-col items-center justify-center my-2">
                <div className="relative p-2 bg-white rounded-xl">
                  <QRCodeSVG
                    value={upiIntentUrl}
                    size={220}
                    level="H"
                    includeMargin={false}
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-11 h-11 bg-white rounded-full p-1 shadow-md flex items-center justify-center border border-zinc-200">
                      <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-[11px] font-bold text-zinc-600 tracking-wider uppercase block">
                    UPI ID
                  </span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 select-all">
                    {UPI_ID}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-zinc-500 font-medium">
                  Scan to pay with any UPI app
                </div>
              </div>

              {/* Price Breakdown Banner */}
              <div className="mt-4 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400 block text-[11px]">{selectedPlan.name}</span>
                  {appliedReferral && (
                    <span className="text-emerald-400 text-[10px] font-bold">20% Referral Applied</span>
                  )}
                </div>
                <div className="text-right">
                  {appliedReferral ? (
                    <div>
                      <span className="line-through text-zinc-500 text-[11px] mr-1.5">₹{selectedPlan.price}</span>
                      <span className="font-extrabold text-base text-amber-400 font-mono">₹{finalPrice}</span>
                    </div>
                  ) : (
                    <span className="font-extrabold text-base text-white font-mono">₹{finalPrice}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-2.5">
                <button
                  onClick={handleCopyUPI}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied: {UPI_ID}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-red-400" />
                      <span>Copy UPI ID</span>
                    </>
                  )}
                </button>

                <a
                  href={upiIntentUrl}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay ₹{finalPrice} in UPI App</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Submit Ticket or Ticket Status */}
          <div className="lg:col-span-7">
            {createdTicket ? (
              /* Ticket Created - Waiting for Owner Approval */
              <div className="rounded-3xl bg-zinc-950 border border-amber-500/70 p-6 sm:p-8 shadow-2xl shadow-amber-950/30">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400">
                    <Clock className="w-7 h-7 animate-spin" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Step 1 Complete: Ticket Created
                    </span>
                    <h3 className="text-2xl font-black text-white">
                      Status: Pending Approval by @hell_king_ansh
                    </h3>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-3 font-mono text-xs mb-6">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">Your Ticket ID:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-amber-400 select-all">{createdTicket.ticketId}</span>
                      <button
                        onClick={() => handleCopyTicket(createdTicket.ticketId)}
                        className="text-zinc-400 hover:text-white"
                      >
                        {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">Submitted UTR:</span>
                    <span className="font-bold text-white select-all">{createdTicket.utr}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">Plan & Amount:</span>
                    <span className="font-bold text-white">{createdTicket.planName} (₹{createdTicket.amount})</span>
                  </div>
                  {createdTicket.referralCode && (
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span className="text-zinc-400">Referral Code:</span>
                      <span className="font-bold text-emerald-400">{createdTicket.referralCode} (-20%)</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">SMP Target:</span>
                    <span className="font-bold text-white">{createdTicket.serverHost}:{createdTicket.serverPort}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-zinc-400">Submitted At:</span>
                    <span className="text-zinc-400">{new Date(createdTicket.submittedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 mb-6 space-y-2">
                  <p className="font-bold">Next Step: Send this Ticket ID to Ansh on Instagram</p>
                  <p className="text-[11px] text-amber-300/80">
                    Once Ansh checks his bank/UPI statement and verifies your payment of ₹{createdTicket.amount}, 
                    he will generate and send you your <strong>Secret Activation Key</strong>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://ig.me/m/hell_king_ansh`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-pink-950"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Send Ticket to @hell_king_ansh on Instagram</span>
                  </a>

                  <button
                    onClick={() => {
                      playTapSound();
                      setActiveStep('redeem');
                    }}
                    className="py-3 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>I already have my Key</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Ticket Submission Form */
              <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-white">
                    Submit Payment Details
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Pay ₹{finalPrice} on the scanner, then submit your 12-digit UTR to request your secret key.
                  </p>
                </div>

                {/* Plan switcher */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Selected Plan:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PLANS.filter((p) => p.price > 0).map((p) => {
                      const itemDiscount = appliedReferral ? Math.round(p.price * 0.20) : 0;
                      const itemPrice = p.price - itemDiscount;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            playTapSound();
                            onSelectPlan(p);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            selectedPlan.id === p.id
                              ? 'bg-red-950/80 border-red-600 text-white shadow'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-[11px] block truncate">{p.name}</span>
                          <span className="text-sm font-extrabold text-white">₹{itemPrice}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                      12-Digit Banking UTR Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter 12-digit UPI reference number..."
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm tracking-widest focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                        Your Name on Bank / UPI
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                        Your Instagram ID (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="@your_username"
                        value={instagramId}
                        onChange={(e) => setInstagramId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                      Payment App Used
                    </label>
                    <select
                      value={upiApp}
                      onChange={(e) => setUpiApp(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="Google Pay">Google Pay (GPay)</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Paytm">Paytm</option>
                      <option value="CRED">CRED</option>
                      <option value="BHIM UPI">BHIM UPI</option>
                      <option value="Other Bank App">Other Bank App</option>
                    </select>
                  </div>

                  {submitError && (
                    <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-700 text-red-300 text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-950 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Submitting Payment Ticket...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Payment Proof for Owner Review</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: REDEEM SECRET PASSCODE (WITHOUT ANY EXAMPLES IN PLACEHOLDER!) */}
      {activeStep === 'redeem' && (
        <div className="max-w-2xl mx-auto">
          {redeemedData ? (
            /* Unlocked state */
            <div className="rounded-3xl bg-zinc-950 border border-emerald-600/70 p-8 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Security Key Verified
              </span>
              <h3 className="text-2xl font-black text-white mb-2">
                HellBot License Unlocked!
              </h3>
              <p className="text-xs text-zinc-300 mb-6">
                Your license for <span className="font-bold text-white font-mono">{redeemedData.planName}</span> ({redeemedData.durationDays} Days) is now active.
              </p>

              <button
                onClick={() => {
                  playTapSound();
                  onBackToDashboard();
                }}
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-extrabold text-sm inline-flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-950"
              >
                <span>Go to Bot Dashboard & Download .zip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Passcode Input Box (CLEAN - NO EXAMPLES!) */
            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-600 flex items-center justify-center text-red-400 mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  Redeem Secret Activation Key
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                  Enter the secret key given to you by <span className="text-pink-400 font-bold">@hell_king_ansh</span> after payment confirmation.
                </p>
              </div>

              <form onSubmit={handleRedeemPasscode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 text-center">
                    Secret Key / Passcode:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter secret activation key"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-center font-mono text-base tracking-widest focus:outline-none focus:border-red-500"
                  />
                </div>

                {redeemError && (
                  <div className="p-4 rounded-xl bg-red-950/90 border border-red-700 text-red-300 text-xs flex items-start space-x-2.5">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">{redeemError}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRedeeming}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:brightness-110 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-950 cursor-pointer"
                >
                  {isRedeeming ? (
                    <span>Validating Passcode with Server...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Verify Secret Key & Unlock Access</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-zinc-900 text-center">
                <p className="text-xs text-zinc-500">
                  Don't have a secret key yet?{' '}
                  <button
                    onClick={() => setActiveStep('submit')}
                    className="text-red-400 font-bold hover:underline cursor-pointer"
                  >
                    Submit payment proof here
                  </button>{' '}
                  or DM{' '}
                  <a
                    href="https://instagram.com/hell_king_ansh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 font-bold hover:underline"
                  >
                    @hell_king_ansh
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
