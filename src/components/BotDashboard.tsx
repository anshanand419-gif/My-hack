import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Play, 
  Square, 
  Shield, 
  Flame, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Lock, 
  AlertTriangle,
  Settings2,
  FileCode,
  Smartphone,
  HelpCircle,
  Clock
} from 'lucide-react';
import { BotConfig, SubscriptionState } from '../types';
import { generateBotCode, createBotZip } from '../utils/botGenerator';
import { playTapSound, playSuccessSound, playAlertSound } from '../utils/sound';

interface BotDashboardProps {
  config: BotConfig;
  setConfig: React.Dispatch<React.SetStateAction<BotConfig>>;
  subscription: SubscriptionState;
  isExpired: boolean;
  onOpenPlans: () => void;
  onOpenAI: () => void;
}

export const BotDashboard: React.FC<BotDashboardProps> = ({
  config,
  setConfig,
  subscription,
  isExpired,
  onOpenPlans,
  onOpenAI,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [activeView, setActiveView] = useState<'config' | 'code' | 'simulator'>('config');

  // Simulator states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simStats, setSimStats] = useState({
    ping: 42,
    health: 20,
    food: 20,
    mobsNearby: 2,
    sessionSeconds: 0,
    coords: { x: 120.4, y: 64.0, z: -340.8 },
  });
  const [simInput, setSimInput] = useState('');

  const isLocked = subscription.status === 'none' || isExpired;

  // Code generation
  const generatedCode = generateBotCode(config);

  const handleCopyCode = () => {
    playTapSound();
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadZip = async () => {
    if (isLocked) {
      playAlertSound();
      onOpenPlans();
      return;
    }
    try {
      playTapSound();
      setIsZipping(true);
      const blob = await createBotZip(config);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HellBot_${config.botUsername.replace(/[^a-zA-Z0-9]/g, '_')}_Aternos.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsZipping(false);
      playSuccessSound();
    } catch (err) {
      setIsZipping(false);
      console.error('Failed to create zip:', err);
    }
  };

  // Simulator loop
  useEffect(() => {
    if (!isSimulating) return;

    setSimLogs([
      `[${new Date().toLocaleTimeString()}] [HellBot] Starting Mineflayer instance for ${config.botUsername}...`,
      `[${new Date().toLocaleTimeString()}] [HellBot] Resolving ${config.serverHost}:${config.serverPort}...`,
      `[${new Date().toLocaleTimeString()}] [HellBot] Handshake packet sent. Ping: 42ms`,
      `[${new Date().toLocaleTimeString()}] [HellBot] Logged in as ${config.botUsername} (offline mode)`,
      `[${new Date().toLocaleTimeString()}] [HellBot] >>> BOT CONNECTED & SPAWNED SUCCESSFULLY <<<`,
      `[${new Date().toLocaleTimeString()}] [HellBot] Anti-AFK Routine: ACTIVE (Forward walking, random sneak/sprint enabled)`,
    ]);

    const interval = setInterval(() => {
      setSimStats((prev) => ({
        ...prev,
        sessionSeconds: prev.sessionSeconds + 1,
        ping: Math.floor(Math.random() * 20) + 38,
      }));

      // Random simulator events
      if (Math.random() < 0.25) {
        const events = [
          `[HellBot Anti-AFK] Performing random look yaw=${(Math.random() * 3).toFixed(2)} pitch=${(Math.random() * 0.5).toFixed(2)}`,
          `[HellBot Anti-AFK] Crouch/sneak action triggered (1.5s)`,
          `[HellBot Anti-AFK] Sprint burst forward (2.5s)`,
          `[HellBot Physics] Ground check OK. In water: false.`,
          `[HellBot Combat] Scanned 3.5m radius. Hostile mobs in range: 1.`,
          `[HellBot Combat] Defending against mob: zombie at distance 2.4m`,
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        setSimLogs((prev) => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${randomEvent}`]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating, config]);

  const handleSimCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim()) return;
    const cmd = simInput.trim();
    setSimLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [Command Sent] ${cmd}`,
      `[${new Date().toLocaleTimeString()}] [HellBot Echo] Executed '${cmd}' in server chat`,
    ]);
    setSimInput('');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              HellBot <span className="text-gradient-hell font-mono">Control Center</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-950 text-red-400 border border-red-800">
              Aternos 24/7
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure your custom SMP server details. Hardcoded Royal Kingdoms IP has been removed.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              playTapSound();
              setActiveView('config');
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeView === 'config'
                ? 'bg-red-950 text-red-300 border border-red-800/80 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Config & Features</span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              setActiveView('code');
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeView === 'code'
                ? 'bg-red-950 text-red-300 border border-red-800/80 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Generated Code</span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              setActiveView('simulator');
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeView === 'simulator'
                ? 'bg-red-950 text-red-300 border border-red-800/80 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Web Bot Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        {/* Lockout Overlay if Access Expired or Inactive */}
        {isLocked && (
          <div className="absolute inset-0 z-30 bg-zinc-950/85 backdrop-blur-md rounded-3xl border-2 border-red-900/60 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-950 border-2 border-red-600 flex items-center justify-center text-red-400 mb-4 shadow-xl shadow-red-950 animate-bounce">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              {isExpired ? 'ACCESS DISABLED: TIME KHATAM HO GAYA' : 'HellBot License Required'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-md mb-6 leading-relaxed">
              {isExpired
                ? 'Your HellBot subscription access has automatically expired. Bot download and live connection controls are disabled until renewed.'
                : 'Activate your 7-Day Free Trial (100% free, 1-click) or choose an instant paid plan with real UTR verification to unlock your custom bot bundle.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  playTapSound();
                  onOpenPlans();
                }}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-950 cursor-pointer"
              >
                {isExpired ? 'Renew Plan to Re-Enable Access' : 'Activate Free Trial or View Plans'}
              </button>
              <button
                onClick={() => {
                  playTapSound();
                  onOpenAI();
                }}
                className="py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold"
              >
                Ask AI Assistant
              </button>
            </div>
          </div>
        )}

        {/* View 1: Config & Features */}
        {activeView === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: SMP Server Inputs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-7 shadow-xl">
                <div className="flex items-center space-x-3 mb-5 border-b border-zinc-800 pb-4">
                  <div className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-800/50">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Your Minecraft SMP Server Address
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Enter your own Aternos host and dynamic port.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Server Host */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Server Host (IP / Domain) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. yourserver.aternos.me"
                      value={config.serverHost}
                      onChange={(e) => setConfig({ ...config, serverHost: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Tip: For Aternos, use the address or DynIP shown on your Aternos Connect tab.
                    </p>
                  </div>

                  {/* Server Port & Bot Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Server Port <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 25565 or 32612"
                        value={config.serverPort || ''}
                        onChange={(e) =>
                          setConfig({ ...config, serverPort: parseInt(e.target.value) || 25565 })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Bot Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HellBot_AFK"
                        value={config.botUsername}
                        onChange={(e) => setConfig({ ...config, botUsername: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition"
                      />
                    </div>
                  </div>

                  {/* Minecraft Version */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Minecraft Version
                    </label>
                    <select
                      value={config.minecraftVersion}
                      onChange={(e) => setConfig({ ...config, minecraftVersion: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="auto">Auto-Detect Server Version (Recommended)</option>
                      <option value="1.21">1.21 (Tricky Trials)</option>
                      <option value="1.20.4">1.20.4</option>
                      <option value="1.20.2">1.20.2</option>
                      <option value="1.20.1">1.20.1</option>
                      <option value="1.19.4">1.19.4</option>
                      <option value="1.18.2">1.18.2</option>
                      <option value="1.16.5">1.16.5</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bot Behavior & Combat Toggles */}
              <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-7 shadow-xl">
                <div className="flex items-center space-x-3 mb-5 border-b border-zinc-800 pb-4">
                  <div className="p-2 rounded-xl bg-orange-950 text-orange-400 border border-orange-800/50">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Anti-AFK & Combat Protection Systems
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Tweak internal Mineflayer automation loops.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Anti-AFK Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Anti-AFK Movement Randomizer
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Forward walk + random crouch, sprint, and head yaw/pitch.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableAntiAfk}
                      onChange={(e) => setConfig({ ...config, enableAntiAfk: e.target.checked })}
                      className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* 16 Mobs Combat Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Auto-Attack 16 Hostile Mobs
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Attacks zombies, creepers, skeletons, spiders, witches, blazes (3.5m radius).
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableCombat}
                      onChange={(e) => setConfig({ ...config, enableCombat: e.target.checked })}
                      className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Water Auto-Jump */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Water Physics Auto-Jump
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Automatically jumps in water to prevent drowning damage.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableWaterJump}
                      onChange={(e) => setConfig({ ...config, enableWaterJump: e.target.checked })}
                      className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Crash Guard */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Process Crash Control
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Catches uncaughtException & unhandledRejection to keep bot running 24/7.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enableCrashProtection}
                      onChange={(e) =>
                        setConfig({ ...config, enableCrashProtection: e.target.checked })
                      }
                      className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Export & Quick Launcher */}
            <div className="lg:col-span-6 space-y-6">
              {/* Ready to Deploy Action Box */}
              <div className="rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/40 border border-red-900/60 p-6 sm:p-7 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-red-400">
                    Customized Bot Bundle
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-red-950 text-red-300 border border-red-800">
                    Target: {config.serverHost}:{config.serverPort}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                  Download Ready-to-Run HellBot Package
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Includes everything configured for your server: <code className="text-zinc-200">bot.js</code>, 
                  <code className="text-zinc-200"> package.json</code>, 1-click Windows <code className="text-zinc-200">start.bat</code>, 
                  Android/Termux <code className="text-zinc-200">start.sh</code>, and PM2 config for 24/7 hosting.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-950/80 glow-red transition cursor-pointer"
                  >
                    {isZipping ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Compressing .zip...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Complete .zip Bundle</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyCode}
                    className="py-3.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Platform Quick Guides */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/80 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="font-bold text-white block mb-1">💻 Windows PC:</span>
                    <p className="text-[11px] text-zinc-400">
                      Unzip, install Node.js, and double-click <span className="font-mono text-zinc-300">start.bat</span>.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <span className="font-bold text-white block mb-1">📱 Mobile (Termux):</span>
                    <p className="text-[11px] text-zinc-400">
                      Run <span className="font-mono text-zinc-300">pkg install nodejs</span> then <span className="font-mono text-zinc-300">./start.sh</span> for 24/7 free phone keepalive.
                    </p>
                  </div>
                </div>
              </div>

              {/* Server Checklist */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Important Aternos Checklist:</span>
                </span>
                <ul className="space-y-2 text-zinc-400 text-[11px]">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span><strong>Turn ON "Cracked"</strong> in your Aternos server Options page so offline bots can join.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>If you have a <strong>whitelist</strong>, run <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-200">/whitelist add {config.botUsername}</code> in the Aternos console.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>Aternos ports change on reboot; check your "Connect" button for the current port.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Generated Code View */}
        {activeView === 'code' && (
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-zinc-400 ml-2">bot.js (Mineflayer Engine)</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadZip}
                  className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .zip</span>
                </button>
              </div>
            </div>

            <pre className="font-mono text-xs text-zinc-300 bg-zinc-900/70 p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}

        {/* View 3: Interactive Bot Simulator */}
        {activeView === 'simulator' && (
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-red-400" />
                  <span>Live Bot Test Console & Simulator</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Simulate connection to <span className="font-mono text-white">{config.serverHost}:{config.serverPort}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {isSimulating ? (
                  <button
                    onClick={() => {
                      playTapSound();
                      setIsSimulating(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-700 text-xs font-bold flex items-center space-x-2 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Simulator</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      playTapSound();
                      setIsSimulating(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold flex items-center space-x-2 shadow-md cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Test Simulation</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">PING LATENCY</span>
                <span className="font-bold text-emerald-400">{isSimulating ? `${simStats.ping} ms` : '--'}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">HEALTH / FOOD</span>
                <span className="font-bold text-red-400">{isSimulating ? '20 HP / 20' : '--'}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">COORDINATES</span>
                <span className="font-bold text-white">
                  {isSimulating ? `X:120 Y:64 Z:-340` : '--'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">ACTIVE UPTIME</span>
                <span className="font-bold text-amber-400">
                  {isSimulating ? `${simStats.sessionSeconds}s` : 'Offline'}
                </span>
              </div>
            </div>

            {/* Console Screen */}
            <div className="bg-black rounded-2xl p-4 border border-zinc-800 font-mono text-xs min-h-[300px] max-h-[400px] overflow-y-auto space-y-1.5 flex flex-col justify-end">
              {simLogs.length === 0 ? (
                <div className="text-zinc-600 text-center py-16">
                  Click "Start Test Simulation" above to test your bot parameters in real-time.
                </div>
              ) : (
                simLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      log.includes('ERROR') || log.includes('KICKED')
                        ? 'text-red-400'
                        : log.includes('SUCCESSFULLY') || log.includes('SPAWNED')
                        ? 'text-emerald-400 font-bold'
                        : log.includes('Combat')
                        ? 'text-amber-400'
                        : 'text-zinc-300'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Simulator Command Input */}
            <form onSubmit={handleSimCommand} className="flex gap-2">
              <input
                type="text"
                disabled={!isSimulating}
                placeholder={isSimulating ? "Send in-game command or chat (e.g. /say Hello SMP)..." : "Start simulator first to send commands"}
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-red-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isSimulating || !simInput.trim()}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
