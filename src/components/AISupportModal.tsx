import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  HelpCircle, 
  Instagram, 
  Terminal, 
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { ChatMessage } from '../types';
import { playTapSound, playSuccessSound } from '../utils/sound';

interface AISupportModalProps {
  onClose?: () => void;
  serverHost: string;
  serverPort: number;
}

export const AISupportModal: React.FC<AISupportModalProps> = ({
  onClose,
  serverHost,
  serverPort,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `🔥 **Welcome to HellBot 24/7 AI Support!**
I am your dedicated Minecraft server and Aternos automation specialist created for **HellBot**.

I can help you with:
- Keeping your Aternos server alive 24/7 without manual restarts
- Finding your server's DynIP & changing ports
- Running HellBot for **100% free on your Android phone using Termux**
- Fixing \`Bot Kicked\`, \`Protocol -1\`, or \`Connection Timed Out\` errors
- Payment, plans, and real 12-digit UTR verification

Ask me anything below, or tap a quick chip to get started!`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'How do I keep Aternos online 24/7 with this bot?',
    'How do I run HellBot on my Android phone using Termux for free?',
    'Why is my bot getting kicked when it joins?',
    'How do I find my Aternos Dynamic Port?',
    'How does real UTR payment verification work?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    playTapSound();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          serverContext: {
            host: serverHost,
            port: serverPort,
          },
        }),
      });

      const data = await response.json();
      const reply = data.reply || data.fallback || 'HellBot AI could not generate an answer. DM @hell_king_ansh on Instagram for direct support!';

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      playSuccessSound();
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Network connection issue reaching the AI backend. For immediate human support, message **@hell_king_ansh** on Instagram!',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="rounded-3xl bg-zinc-950 border border-red-950/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col h-[750px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white shadow-md glow-red">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">HellBot AI Support</h3>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Online 24/7
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Aternos Minecraft & Mineflayer Troubleshooting Engine
              </p>
            </div>
          </div>

          <a
            href="https://instagram.com/hell_king_ansh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-pink-950/60 hover:bg-pink-900/60 border border-pink-700/60 text-pink-300 text-xs font-semibold transition"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>DM @hell_king_ansh</span>
          </a>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-zinc-900">
          <span className="text-[11px] font-bold text-zinc-500 shrink-0">Quick Topics:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-zinc-800 text-white'
                    : 'bg-gradient-to-tr from-red-600 to-orange-600 text-white shadow-sm'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <span className="text-[10px] text-zinc-400 mt-2 block text-right font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-orange-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-400 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>HellBot AI is analyzing server parameters...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-4 border-t border-zinc-800 flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask about Aternos, Mineflayer, Termux, crash errors, or UTR..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-red-950"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
