import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Interfaces for High-Security Owner-Verified Architecture
interface PaymentTicket {
  ticketId: string;
  utr: string;
  amount: number;
  planId: string;
  planName: string;
  durationDays: number;
  senderName: string;
  instagramId?: string;
  upiApp: string;
  serverHost: string;
  serverPort: number;
  botUsername: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  generatedPasscode?: string;
}

interface PasscodeItem {
  code: string;
  planId: string;
  planName: string;
  durationDays: number;
  amount: number;
  isUsed: boolean;
  createdAt: string;
  issuedTo?: string;
  issuedForUTR?: string;
  usedAt?: string;
  usedBy?: {
    serverHost: string;
    serverPort: number;
    botUsername: string;
  };
}

// In-Memory Storage
const ticketsStore: Map<string, PaymentTicket> = new Map();
const passcodesStore: Map<string, PasscodeItem> = new Map();

// Helper to generate secure random passcodes like HELL-99-7K2X or ANSH-VIP-8921
function createRandomCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${rand}`.toUpperCase();
}

// Passcodes are strictly created by @hell_king_ansh in the Owner Admin Portal

// Helper to validate 12-digit UTR
function validateUTRFormat(utr: string): { isValid: boolean; reason?: string } {
  const cleanUTR = utr.trim().toUpperCase();
  if (!cleanUTR) {
    return { isValid: false, reason: 'UTR / Transaction Reference number is required.' };
  }
  const isNumeric12 = /^\d{12}$/.test(cleanUTR);
  const isAlphaNumeric12To16 = /^[A-Z0-9]{12,16}$/.test(cleanUTR);

  if (!isNumeric12 && !isAlphaNumeric12To16) {
    return {
      isValid: false,
      reason: 'Invalid format. Standard UPI UTR must be 12 digits (found on your payment receipt).',
    };
  }

  // Prevent obvious dummy sequences
  if (/^(\d)\1{11}$/.test(cleanUTR) || cleanUTR === '123456789012') {
    return { isValid: false, reason: 'Dummy test number detected. Enter the real UTR from your bank app.' };
  }

  return { isValid: true };
}

// Initialize AI if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'HellBot High-Security Node',
    version: '3.0.0',
    owner: 'hell_king_ansh',
    aiAvailable: !!aiClient,
  });
});

// Step 1: Submit Payment Ticket (Does NOT grant access!)
app.post('/api/submit-payment-ticket', (req: Request, res: Response) => {
  try {
    const {
      utr,
      amount,
      planId,
      planName,
      durationDays,
      senderName,
      instagramId,
      upiApp,
      serverHost,
      serverPort,
      botUsername,
    } = req.body;

    const validation = validateUTRFormat(utr);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.reason });
    }

    const cleanUTR = utr.trim().toUpperCase();

    // Check if UTR already has a ticket
    for (const ticket of ticketsStore.values()) {
      if (ticket.utr === cleanUTR) {
        return res.status(409).json({
          success: false,
          error: `A payment ticket (${ticket.ticketId}) for this UTR (${cleanUTR}) is already submitted with status: ${ticket.status.toUpperCase()}.`,
          ticket,
        });
      }
    }

    const ticketId = `HB-TICKET-${Math.floor(Math.random() * 8999 + 1000)}`;

    const newTicket: PaymentTicket = {
      ticketId,
      utr: cleanUTR,
      amount: Number(amount) || 99,
      planId: planId || 'month_1',
      planName: planName || '1 Month Access',
      durationDays: Number(durationDays) || 30,
      senderName: senderName?.trim() || 'Customer',
      instagramId: instagramId?.trim() || '',
      upiApp: upiApp || 'Google Pay',
      serverHost: serverHost?.trim() || 'Custom.aternos.me',
      serverPort: Number(serverPort) || 25565,
      botUsername: botUsername?.trim() || 'HellBot',
      status: 'pending', // PENDING VERIFICATION! No automatic access!
      submittedAt: new Date().toISOString(),
    };

    ticketsStore.set(ticketId, newTicket);

    return res.json({
      success: true,
      message: 'Payment details submitted successfully! Status: PENDING REVIEW by @hell_king_ansh.',
      ticket: newTicket,
    });
  } catch (err: any) {
    console.error('Error submitting payment ticket:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Step 2: Redeem Secret Passcode (ONLY valid passcodes issued by owner grant access!)
app.post('/api/redeem-passcode', (req: Request, res: Response) => {
  try {
    const { passcode, serverHost, serverPort, botUsername } = req.body;

    if (!passcode || typeof passcode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Secret passcode / activation key is required.',
      });
    }

    const cleanCode = passcode.trim().toUpperCase();

    if (!passcodesStore.has(cleanCode)) {
      return res.status(403).json({
        success: false,
        error: '❌ ACCESS DENIED: Invalid passcode. Random codes will not work. You must obtain an authentic activation key from owner @hell_king_ansh on Instagram after payment verification.',
      });
    }

    const item = passcodesStore.get(cleanCode)!;

    if (item.isUsed) {
      return res.status(409).json({
        success: false,
        error: `❌ ACCESS DENIED: This passcode (${cleanCode}) has already been redeemed on ${new Date(
          item.usedAt || ''
        ).toLocaleString()} and cannot be reused.`,
      });
    }

    // Mark as used
    const now = new Date();
    const expiresAt = new Date(now.getTime() + item.durationDays * 24 * 60 * 60 * 1000).toISOString();

    item.isUsed = true;
    item.usedAt = now.toISOString();
    item.usedBy = {
      serverHost: serverHost || 'Custom.aternos.me',
      serverPort: Number(serverPort) || 25565,
      botUsername: botUsername || 'HellBot',
    };
    passcodesStore.set(cleanCode, item);

    return res.json({
      success: true,
      message: `🎉 PASSCODE VERIFIED! ${item.planName} (${item.durationDays} Days) has been unlocked!`,
      subscription: {
        status: 'active',
        planId: item.planId,
        planName: item.planName,
        activatedAt: now.toISOString(),
        expiresAt,
        passcode: cleanCode,
        durationDays: item.durationDays,
        amount: item.amount,
        serverHost: item.usedBy.serverHost,
        serverPort: item.usedBy.serverPort,
        botUsername: item.usedBy.botUsername,
      },
    });
  } catch (err: any) {
    console.error('Error redeeming passcode:', err);
    return res.status(500).json({ success: false, error: 'Internal redemption error' });
  }
});

// Admin: Get all tickets & passcodes
app.get('/api/admin/data', (req: Request, res: Response) => {
  const tickets = Array.from(ticketsStore.values()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  const passcodes = Array.from(passcodesStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({
    success: true,
    tickets,
    passcodes,
  });
});

// Admin: Approve ticket & generate custom passcode for customer
app.post('/api/admin/approve-ticket', (req: Request, res: Response) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId || !ticketsStore.has(ticketId)) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const ticket = ticketsStore.get(ticketId)!;
    const prefix = `HELL-${ticket.amount}`;
    const newPasscode = createRandomCode(prefix);

    const passcodeItem: PasscodeItem = {
      code: newPasscode,
      planId: ticket.planId,
      planName: ticket.planName,
      durationDays: ticket.durationDays,
      amount: ticket.amount,
      isUsed: false,
      createdAt: new Date().toISOString(),
      issuedTo: ticket.senderName || ticket.instagramId || 'Verified Customer',
      issuedForUTR: ticket.utr,
    };

    passcodesStore.set(newPasscode, passcodeItem);

    ticket.status = 'approved';
    ticket.generatedPasscode = newPasscode;
    ticketsStore.set(ticketId, ticket);

    res.json({
      success: true,
      message: `Ticket approved! Generated secret passcode: ${newPasscode}`,
      ticket,
      passcode: passcodeItem,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Reject ticket (fake UTR)
app.post('/api/admin/reject-ticket', (req: Request, res: Response) => {
  const { ticketId, reason } = req.body;
  if (!ticketId || !ticketsStore.has(ticketId)) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }

  const ticket = ticketsStore.get(ticketId)!;
  ticket.status = 'rejected';
  ticketsStore.set(ticketId, ticket);

  res.json({ success: true, message: 'Ticket marked as rejected', ticket });
});

// Admin: Generate standalone passcode anytime
app.post('/api/admin/generate-standalone-passcode', (req: Request, res: Response) => {
  const { planId, planName, durationDays, amount, issuedTo } = req.body;
  const prefix = `HELL-${amount || 'PASS'}`;
  const code = createRandomCode(prefix);

  const passcodeItem: PasscodeItem = {
    code,
    planId: planId || 'month_1',
    planName: planName || '1 Month Access',
    durationDays: Number(durationDays) || 30,
    amount: Number(amount) || 99,
    isUsed: false,
    createdAt: new Date().toISOString(),
    issuedTo: issuedTo || 'Direct Customer',
  };

  passcodesStore.set(code, passcodeItem);
  res.json({ success: true, passcode: passcodeItem });
});

// AI Support Chat (HellBot Specialist)
app.post('/api/ai-chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!aiClient) {
      return res.json({
        reply: `⚡ **HellBot Technical Support Note**:
I can assist you with your Aternos 24/7 bot setup!
1. **To keep Aternos online**: Ensure your server is turned on in Aternos panel, then start the HellBot script.
2. **Payment & Activation**: All payments are verified by founder **@hell_king_ansh** on Instagram. Once verified, Ansh will give you your secret activation key!
3. **If bot is kicked**: Make sure "Cracked" is turned ON in Aternos Options.`,
      });
    }

    const systemInstruction = `You are "HellBot AI", the official elite assistant for HellBot — the premium Minecraft 24/7 Aternos server hosting bot created by @hell_king_ansh on Instagram.

Key Policies:
1. High-Security Payment: Payments are made via UPI QR code to Mukesh Kumar (mukeshkumae078@okicici).
2. Users submit their UTR/Payment Ticket. It does NOT automatically give access with random numbers.
3. The owner @hell_king_ansh verifies the payment in his bank account and sends a unique secret passcode (e.g. HELL-99-XXXX).
4. The user redeems that passcode on the site to unlock access.
5. Pricing: 7-day free trial, 1 month ₹99, 2 months ₹199, 5 months ₹259, 8 months ₹499.
6. Aternos Help: explain DynIP, cracked mode, auto-reconnect, and Termux mobile setup clearly.`;

    const chatHistory = Array.isArray(history)
      ? history.slice(-6).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(msg.content || '') }],
        }))
      : [];

    const contents = [
      ...chatHistory,
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'HellBot AI ready to assist. Please ask again.';
    res.json({ reply });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      error: 'Failed to generate AI response',
      details: error.message,
      fallback: 'HellBot AI is temporarily busy. DM @hell_king_ansh on Instagram for quick help!',
    });
  }
});

// Vite Middleware for Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[HellBot High-Security Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[HellBot Server] Failed to start:', err);
});
