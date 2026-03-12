// types/firestore.types.ts
// ============================================================
// TIPOS EXTENDIDOS PARA FIRESTORE
// Incluye estructura para progreso del taller
// ============================================================

import type { 
  UserRole, 
  SubscriptionPlan, 
  SubscriptionStatus 
} from "./subscription.types";

export interface FirestoreUser {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  lastName?: string;
  userName?: string;
  profileCompleted: boolean;
  emailVerified: boolean;
  showOnboardingModal: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  
  // Suscripciones
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionStartDate?: Date | string | null;
  subscriptionEndDate?: Date | string | null;
  previousSubscription?: SubscriptionPlan;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  
  // Datos del taller
  workshopProgress?: {
    [workshopId: string]: UserWorkshopProgress;
  };
  
  // API keys (se almacenarán cifradas)
  apiKeys?: {
    twitter?: string;
    googleCivic?: string;
    ine?: string;
  };
}

export interface UserWorkshopProgress {
  startedAt: Date | string;
  lastAccessedAt: Date | string;
  completedAt?: Date | string;
  completionPercentage: number;
  
  // Progreso por sesión
  sessionsCompleted: {
    [sessionId: string]: {
      completedAt: Date | string;
      exercisesCompleted?: string[];
    };
  };
  
  // Datos subidos por el usuario
  userData?: {
    uploadedFile?: {
      path: string;
      name: string;
      uploadedAt: Date | string;
      size: number;
    };
    processedData?: boolean;
    lastProcessedAt?: Date | string;
  };
  
  // Notas y bookmarks
  bookmarks?: string[];
  notes?: {
    [sessionId: string]: {
      content: string;
      createdAt: Date | string;
    }[];
  };
  
  // Preferencias del taller
  preferences?: {
    fontSize?: "small" | "medium" | "large";
    autoSaveNotes?: boolean;
    showHints?: boolean;
  };
}