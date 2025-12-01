// types/newsletter.types.ts

export type NewsletterStatus = "pending" | "confirmed" | "unsubscribed";

export type NewsletterSource = "blog" | "homepage" | "footer" | "popup";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string; // ✅ AGREGADO
  userId?: string | null;
  status: NewsletterStatus;
  subscribedAt: Date;
  confirmedAt?: Date | null;
  unsubscribedAt?: Date | null;
  source: NewsletterSource;
  interests?: string[];
  confirmationToken?: string;
  lastEmailSent?: Date | null;
  // ✅ AGREGADO: Para unsubscribe feedback
  unsubscribeReasons?: string[];
  unsubscribeOtherReason?: string;
}

export interface NewsletterSubscribeRequest {
  email: string;
  name: string; // ✅ AGREGADO
  userId?: string | null;
  source: NewsletterSource;
  interests?: string[];
}

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  subscriberId?: string;
  alreadySubscribed?: boolean;
  verificationLink?: string; 
}

// ✅ AGREGADO: Para unsubscribe
export interface NewsletterUnsubscribeRequest {
  email: string;
  reasons?: string[];
  otherReason?: string;
  token?: string;
}

export interface NewsletterUnsubscribeResponse {
  success: boolean;
  message: string;
  alreadyUnsubscribed?: boolean;
}

// ✅ AGREGADO: Para feedback
export interface NewsletterFeedback {
  email: string;
  userId?: string | null;
  type: "unsubscribe";
  reasons: string[];
  otherReason?: string;
  source: NewsletterSource;
  subscribedAt: Date;
  unsubscribedAt: Date;
  daysSinceSubscription: number | null;
}

