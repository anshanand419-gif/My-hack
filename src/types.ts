export interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  durationDays: number;
  badge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  features: string[];
}

export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired';

export interface SubscriptionState {
  status: SubscriptionStatus;
  planId: string;
  planName: string;
  activatedAt: string;
  expiresAt: string;
  utr?: string;
  amount?: number;
  senderName?: string;
  serverHost: string;
  serverPort: number;
  botUsername: string;
  autoRenewReminder?: boolean;
}

export interface BotConfig {
  serverHost: string;
  serverPort: number;
  botUsername: string;
  minecraftVersion: string;
  enableAntiAfk: boolean;
  enableCombat: boolean;
  enableWaterJump: boolean;
  enableCrashProtection: boolean;
  reconnectIntervalSeconds: number;
  maxSessionHours: number;
  attackDistance: number;
}

export interface UTRRecord {
  id: string;
  utr: string;
  amount: number;
  planId: string;
  planName: string;
  durationDays: number;
  senderName: string;
  upiApp: string;
  serverHost: string;
  serverPort: number;
  botUsername: string;
  status: 'verified' | 'pending' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  verificationMethod: string;
  expiresAt: string;
}

export interface PasscodeRecord {
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

export interface PaymentSubmissionTicket {
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
  referralCode?: string;
  discountApplied?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
