// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, Dispatch, SetStateAction } from "react";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateEmail,
} from "firebase/auth";
import {
  auth,
  db,
  providerGoogle,
  providerFacebook,
} from "../firebase/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";

interface AuthContextType {
  user: any;
  setUser: Dispatch<SetStateAction<any>>;
  loading: boolean;
  isSignInModalOpen: boolean;
  setIsSignInModalOpen: Dispatch<SetStateAction<boolean>>;
  isVerifyEmailModalOpen: boolean;
  setIsVerifyEmailModalOpen: Dispatch<SetStateAction<boolean>>;
  isCompleteRegisterModalOpen: boolean;
  setIsCompleteRegisterModalOpen: Dispatch<SetStateAction<boolean>>;
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: Dispatch<SetStateAction<boolean>>;
  isRegistrationSuccessModalOpen: boolean;
  setIsRegistrationSuccessModalOpen: Dispatch<SetStateAction<boolean>>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: Dispatch<SetStateAction<boolean>>;
  isOnboardingModalOpen: boolean;
  setIsOnboardingModalOpen: Dispatch<SetStateAction<boolean>>;
  closeOnboardingModal: (showOnLogin?: boolean) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  loginUser: (identifier: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
  updateAuthEmail: (newEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados para controlar los modales
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isVerifyEmailModalOpen, setIsVerifyEmailModalOpen] = useState(false);
  const [isCompleteRegisterModalOpen, setIsCompleteRegisterModalOpen] =
    useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRegistrationSuccessModalOpen, setIsRegistrationSuccessModalOpen] =
    useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          await currentUser.reload();
          const updatedUser = auth.currentUser;

          if (!updatedUser) {
            console.error("Usuario no encontrado después de reload.");
            setUser(null);
            setLoading(false);
            return;
          }

          const userDocRef = doc(db, "users", updatedUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!userDocSnapshot.exists()) {
            await setDoc(userDocRef, {
              uid: updatedUser.uid,
              email: updatedUser.email,
              role: "registered",
              profileCompleted: false,
              emailVerified: updatedUser.emailVerified,
              showOnboardingModal: true,
              createdAt: new Date(),
            });
          } else {
            const userData = userDocSnapshot.data();
            if (userData.emailVerified !== updatedUser.emailVerified) {
              await updateDoc(userDocRef, {
                emailVerified: updatedUser.emailVerified,
                updatedAt: new Date(),
              });
            }
          }

          const userData = (await getDoc(userDocRef)).data();
          setUser({ ...updatedUser, ...userData });

          if (updatedUser.emailVerified) {
            setIsVerifyEmailModalOpen(false);
            if (!userData?.profileCompleted) {
              setIsCompleteRegisterModalOpen(true);
            } else if (userData.showOnboardingModal) {
              setIsOnboardingModalOpen(true);
            }
          } else {
            setUser({ ...updatedUser, role: "visitor" });
          }
        } catch (error) {
          console.error("Error al verificar el estado del usuario:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para registrar un usuario con correo electrónico y contraseña
  const registerUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: "registered",
        profileCompleted: false,
        emailVerified: false,
        showOnboardingModal: true,
        createdAt: new Date(),
      });

      setIsVerifyEmailModalOpen(true);
      setIsSignInModalOpen(false);
    } catch (error: any) {
      console.error("Error al registrar usuario:", error.message);
      if (error.code === "auth/email-already-in-use") {
        alert("Este correo ya está registrado. Intenta iniciar sesión.");
        setIsSignInModalOpen(false);
        setIsLoginModalOpen(true);
      } else if (error.code === "auth/weak-password") {
        alert("La contraseña es demasiado débil. Usa al menos 6 caracteres.");
      } else {
        alert("Ocurrió un error al registrar usuario. Inténtalo de nuevo.");
      }
    }
  };

  // Función mejorada para iniciar sesión con correo electrónico y contraseña
  const loginUser = async (identifier: string, password: string) => {
    try {
      let email;

      console.log("Identificador recibido:", identifier);

      // Determinar si el identificador es un correo electrónico o un nombre de usuario
      if (identifier.includes("@")) {
        email = identifier; // Es un correo electrónico
        console.log("Identificado como correo electrónico:", email);
      } else {
        console.log(
          "Identificado como nombre de usuario. Buscando correo electrónico..."
        );

        // Buscar el correo electrónico asociado al nombre de usuario
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("userName", "==", identifier),
          limit(1)
        );

        try {
          const querySnapshot = await getDocs(q);

          console.log(
            "Resultado de la consulta a Firestore:",
            querySnapshot.docs.length
          );

          if (querySnapshot.empty) {
            console.error(
              "No se encontró ningún usuario con el nombre de usuario proporcionado."
            );
            // Usar un error específico que podamos identificar después
            const userNotFoundError = new Error(
              "Nombre de usuario o contraseña incorrectos."
            );
            userNotFoundError.name = "USER_NOT_FOUND";
            throw userNotFoundError;
          }

          const userData = querySnapshot.docs[0].data() as { email: string };
          email = userData.email;
          console.log("Correo electrónico encontrado:", email);
        } catch (firestoreError: any) {
          console.error("Error al consultar Firestore:", firestoreError);

          // Si es nuestro error personalizado, relanzarlo
          if (firestoreError.name === "USER_NOT_FOUND") {
            throw firestoreError;
          }

          // Si es un error de permisos de Firestore
          if (firestoreError.code === "permission-denied") {
            const permissionError = new Error(
              "Error de configuración. Contacta al administrador."
            );
            permissionError.name = "PERMISSION_ERROR";
            throw permissionError;
          }

          // Si es otro error de Firestore
          const firestoreGenericError = new Error(
            "Nombre de usuario o contraseña incorrectos."
          );
          firestoreGenericError.name = "FIRESTORE_ERROR";
          throw firestoreGenericError;
        }
      }

      // Intentar iniciar sesión con el correo electrónico y la contraseña
      console.log("Intentando iniciar sesión con correo electrónico:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log(
        "Inicio de sesión exitoso. Verificando datos en Firestore..."
      );
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        console.error("Datos de usuario no encontrados en Firestore.");
        throw new Error("Datos de usuario no encontrados en Firestore.");
      }

      const userData = userDocSnapshot.data();

      // Cerrar el modal de login al completar exitosamente
      setIsLoginModalOpen(false);

      return { ...user, ...userData };
    } catch (error: any) {
      console.error("Error completo:", error);
      console.error("Código del error:", error.code);
      console.error("Nombre del error:", error.name);
      console.error("Mensaje del error:", error.message);

      // Manejar errores personalizados primero
      if (error.name === "USER_NOT_FOUND" || error.name === "FIRESTORE_ERROR") {
        throw new Error("Nombre de usuario o contraseña incorrectos.");
      }

      if (error.name === "PERMISSION_ERROR") {
        throw new Error("Error de configuración. Contacta al administrador.");
      }

      // Manejar errores específicos de Firebase Auth
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential" ||
        error.code === "auth/invalid-email"
      ) {
        throw new Error("Nombre de usuario o contraseña incorrectos.");
      }

      // Error de configuración/permisos
      if (error.code === "permission-denied") {
        throw new Error("Error de configuración. Contacta al administrador.");
      }

      // Error genérico para cualquier otro caso
      throw new Error(
        "Ocurrió un error al iniciar sesión. Inténtalo de nuevo."
      );
    }
  };

  // Función para iniciar sesión con Google o Facebook
  const signInWithProvider = async (provider: any) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Usuario autenticado con proveedor externo:", user);

      // Verificar si el usuario ya existe en Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        console.log("Creando nuevo documento en Firestore para el usuario...");
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Usuario",
          role: "registered",
          profileCompleted: false,
          emailVerified: true, // El correo de Google/Facebook ya está verificado
          showOnboardingModal: true,
          createdAt: new Date(),
        });
      }

      const userData = (await getDoc(userDocRef)).data();
      setUser({ ...user, ...userData });

      setIsLoginModalOpen(false);

      if (!userData?.profileCompleted) {
        setIsCompleteRegisterModalOpen(true);
      } else if (userData.showOnboardingModal) {
        setIsOnboardingModalOpen(true);
      }
    } catch (error: any) {
      console.error(
        "Error al iniciar sesión con proveedor externo:",
        error.message
      );
      throw new Error(
        "Ocurrió un error al iniciar sesión con proveedor externo."
      );
    }
  };

  // Función para iniciar sesión con Google
  const signInWithGoogle = () => signInWithProvider(providerGoogle);

  // Función para iniciar sesión con Facebook
  const signInWithFacebook = () => signInWithProvider(providerFacebook);

  // Función para cerrar el modal de Onboarding
  const closeOnboardingModal = async (showOnLogin?: boolean) => {
    try {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          showOnboardingModal: showOnLogin || false, // Actualizar la preferencia del usuario
        });
      }
    } catch (error) {
      console.error("Error al actualizar la preferencia del modal:", error);
    } finally {
      setIsOnboardingModalOpen(false); // Cerrar el modal
    }
  };

  const updateAuthEmail = async (newEmail: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Usuario no autenticado");

      // Actualizar el correo en Firebase Authentication
      await updateEmail(currentUser, newEmail); // Corregido: updateEmail

      // Enviar correo de verificación al nuevo email
      await sendEmailVerification(currentUser); // Corregido: sendEmailVerification

      // Actualizar el correo en Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        email: newEmail,
        updatedAt: new Date().toISOString(),
      });

      // Actualizar el estado global del usuario
      setUser((prevUser: any) => ({ ...prevUser, email: newEmail }));

      alert(
        "Correo electrónico actualizado. Por favor, verifica tu nueva dirección."
      );
    } catch (error: any) {
      console.error(
        "Error al actualizar el correo electrónico:",
        error.message
      );
      alert(`Ocurrió un error al actualizar el correo: ${error.message}`);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsOnboardingModalOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Función para recuperar contraseña
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return "Correo de recuperación enviado correctamente.";
    } catch (error: any) {
      console.error("Error al recuperar la contraseña:", error.message);
      if (error.code === "auth/user-not-found") {
        throw new Error(
          "No se encontró ningún usuario con este correo electrónico."
        );
      } else {
        throw new Error(
          "Ocurrió un error al intentar recuperar la contraseña."
        );
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // Esta es la línea clave que faltaba
        loading,
        isSignInModalOpen,
        setIsSignInModalOpen,
        isVerifyEmailModalOpen,
        setIsVerifyEmailModalOpen,
        isCompleteRegisterModalOpen,
        setIsCompleteRegisterModalOpen,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        isRegistrationSuccessModalOpen,
        setIsRegistrationSuccessModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isOnboardingModalOpen,
        setIsOnboardingModalOpen,
        closeOnboardingModal,
        registerUser,
        loginUser,
        signInWithGoogle,
        signInWithFacebook,
        logout,
        resetPassword,
        updateAuthEmail,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
