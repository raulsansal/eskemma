// types/newsletter.types.ts

export type NewsletterStatus = "pending" | "confirmed" | "unsubscribed";

export type NewsletterSource = "blog" | "homepage" | "footer" | "popup";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  userId?: string | null;
  status: NewsletterStatus;
  subscribedAt: Date;
  confirmedAt?: Date | null;
  unsubscribedAt?: Date | null;
  source: NewsletterSource;
  interests?: string[];
  confirmationToken?: string;
  lastEmailSent?: Date | null;
}

export interface NewsletterSubscribeRequest {
  email: string;
  userId?: string | null;
  source: NewsletterSource;
  interests?: string[];
}

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  subscriberId?: string;
  alreadySubscribed?: boolean;
}