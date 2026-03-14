// app/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ✅ Configurar provider de Google
export const providerGoogle = new GoogleAuthProvider();
providerGoogle.setCustomParameters({
  prompt: 'select_account'
});

export const providerFacebook = new FacebookAuthProvider();

// ─── Solo en desarrollo: expone auth en window para pruebas desde consola ───
// Uso: const token = await window.__auth.currentUser.getIdToken()
// REMOVER antes de producción (o dejarlo — el bloque solo corre en dev)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as any).__auth = auth;
}