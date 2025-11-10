// app/firebase/adminConfig.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Obtener las variables de entorno
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
} as { [key: string]: string | undefined }; // Aserción de tipo explícita

// Validar que todas las variables de entorno estén presentes
const validateServiceAccount = (account: { [key: string]: string | undefined }) => {
  const requiredFields = [
    "type",
    "project_id",
    "private_key_id",
    "private_key",
    "client_email",
    "client_id",
    "auth_uri",
    "token_uri",
    "auth_provider_x509_cert_url",
    "client_x509_cert_url",
  ];

  for (const field of requiredFields) {
    if (!account[field]) {
      throw new Error(
        `Falta la variable de entorno requerida: ${field}. Por favor, verifica tu archivo .env`
      );
    }
  }
};

validateServiceAccount(serviceAccount);

console.log("Service Account cargado correctamente:", {
  project_id: serviceAccount.project_id,
  client_email: serviceAccount.client_email,
});

// Inicializar Firebase Admin SDK
const adminApp = initializeApp({
  credential: cert(serviceAccount as { [key: string]: string }), // Asegurarse de que los tipos sean correctos
});

// Exportar el módulo de autenticación de Firebase Admin
export const adminAuth = getAuth(adminApp);