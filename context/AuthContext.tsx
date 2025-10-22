// context/AuthContext.tsx
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateEmail as firebaseUpdateEmail,
  getIdTokenResult,
  User,
  getAuth,
  fetchSignInMethodsForEmail, // ← AGREGAR esta importación
} from "firebase/auth";
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
import { auth, db, providerGoogle } from "../firebase/firebaseConfig";

// Interfaz para los datos de Firestore
interface FirestoreUserData {
  uid: string;
  email: string;
  role?: string;
  name?: string;
  lastName?: string;
  country?: string;
  avatarUrl?: string;
  userName?: string;
  sex?: "hombre" | "mujer" | "no-binario" | string;
  roles?: string[];
  interests?: string[];
  profileCompleted: boolean;
  emailVerified: boolean;
  showOnboardingModal: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Tipo extendido que combina User de Firebase con datos de Firestore
interface ExtendedUser extends User {
  role?: string;
  name?: string;
  lastName?: string;
  country?: string;
  avatarUrl?: string;
  userName?: string;
  sex?: "hombre" | "mujer" | "no-binario" | string;
  roles?: string[];
  interests?: string[];
  profileCompleted?: boolean;
  showOnboardingModal?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  setUser: Dispatch<SetStateAction<ExtendedUser | null>>;
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
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
  updateAuthEmail: (newEmail: string) => Promise<void>;
  debugUserToken: () => Promise<void>;
  updateUserRole: (uid: string, newRole: string) => Promise<void>;
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
  const [user, setUser] = useState<ExtendedUser | null>(null);
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

          // Forzar la renovación del token con un pequeño retraso
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const idTokenResult = await updatedUser.getIdTokenResult(true);

          // Validar que el campo 'role' en el token sea un string
          const tokenRole = idTokenResult.claims.role;
          const role = typeof tokenRole === "string" ? tokenRole : "visitor";

          // Cargar datos del usuario desde Firestore
          const userDocRef = doc(db, "users", updatedUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!userDocSnapshot.exists()) {
            await setDoc(userDocRef, {
              uid: updatedUser.uid,
              email: updatedUser.email,
              userName: generateDefaultUserName(updatedUser.email || ""),
              role: role,
              profileCompleted: false,
              emailVerified: updatedUser.emailVerified,
              showOnboardingModal: true,
              createdAt: new Date(),
            });

            const newExtendedUser: ExtendedUser = {
              ...updatedUser,
              role: role,
              profileCompleted: false,
              showOnboardingModal: true,
            };
            setUser(newExtendedUser);
          } else {
            const userData = userDocSnapshot.data() as FirestoreUserData;

            // Actualizar emailVerified si cambió
            if (userData.emailVerified !== updatedUser.emailVerified) {
              await updateDoc(userDocRef, {
                emailVerified: updatedUser.emailVerified,
                updatedAt: new Date(),
              });
            }

            // Validar que el campo 'role' en Firestore sea un string
            const firestoreRole = userData.role;
            const finalRole =
              typeof firestoreRole === "string" ? firestoreRole : role;

            const extendedUser: ExtendedUser = {
              ...updatedUser,
              ...userData,
              role: finalRole,
            };

            // Agregar logs para depuración
            console.log("Usuario autenticado:", updatedUser);
            console.log("Datos de usuario desde Firestore:", userData);

            setUser(extendedUser);
          }

          if (updatedUser.emailVerified) {
            setIsVerifyEmailModalOpen(false);
            const userData = (
              await getDoc(userDocRef)
            ).data() as FirestoreUserData;
            if (!userData?.profileCompleted) {
              setIsCompleteRegisterModalOpen(true);
            } else if (userData.showOnboardingModal) {
              setIsOnboardingModalOpen(true);
            }
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

  // Función para generar un nombre de usuario predeterminado
  const generateDefaultUserName = (email: string): string => {
    const [username] = email.split("@");
    return username;
  };

  // Función para cerrar el modal de Onboarding
  const closeOnboardingModal = async (showOnLogin?: boolean) => {
    try {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          showOnboardingModal: showOnLogin || false,
        });
      }
    } catch (error) {
      console.error("Error al actualizar la preferencia del modal:", error);
    } finally {
      setIsOnboardingModalOpen(false);
    }
  };

  // Función para registrar un nuevo usuario
  const registerUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Enviar correo de verificación
      await sendEmailVerification(user);

      // Guardar datos del usuario en Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        userName: generateDefaultUserName(user.email || ""),
        role: "registered",
        profileCompleted: false,
        emailVerified: false,
        showOnboardingModal: true,
        createdAt: new Date(),
      });

      // Asignar el rol 'registered' como Custom Claim
      await fetch("/api/setUserRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, role: "registered" }),
      });

      // Mostrar modal de verificación de correo
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

  // Función para iniciar sesión con correo electrónico o nombre de usuario
  const loginUser = async (identifier: string, password: string) => {
    try {
      let email: string;
      let userUid: string | null = null;

      console.log("🔐 Iniciando proceso de login con:", identifier);

      // 1. Determinar si es email o userName
      if (identifier.includes("@")) {
        email = identifier.toLowerCase().trim();
        console.log("📧 Login con email:", email);

        // ✅ VERIFICAR MÉTODOS CUANDO ES EMAIL DIRECTO (CON MANEJO MEJORADO)
        console.log("🔍 Verificando métodos de autenticación para email...");
        const authInstance = getAuth();
        try {
          const authMethods = await fetchSignInMethodsForEmail(
            authInstance,
            email
          );
          console.log("📋 Métodos disponibles:", authMethods);

          // ✅ SOLO VALIDAR SI HAY MÉTODOS RETORNADOS
          if (authMethods.length > 0) {
            // Si solo tiene Google, informar al usuario
            if (authMethods.length === 1 && authMethods[0] === "google.com") {
              throw new Error(
                "Este usuario se registró con Google. Por favor, usa 'Iniciar sesión con Google'."
              );
            }

            // Si no tiene método de contraseña pero tiene otros métodos
            if (!authMethods.includes("password") && authMethods.length > 0) {
              throw new Error(
                "Este usuario no tiene contraseña configurada. Si te registraste con tu cuenta de Google, intenta usa 'Iniciar sesión con Google'."
              );
            }
          } else {
            // ✅ CASO: authMethods.length === 0
            // Esto puede ocurrir por configuraciones de Firebase
            // Permitir que continúe y deje que signInWithEmailAndPassword maneje la validación
            console.log(
              "⚠️ No se pudieron obtener los métodos de autenticación. Continuando con el login..."
            );
          }
        } catch (authError: any) {
          console.error("Error al verificar métodos:", authError);
          // Si el error ya tiene un mensaje específico sobre Google, relanzarlo
          if (
            authError.message?.includes("Google") ||
            authError.message?.includes("contraseña configurada")
          ) {
            throw authError;
          }
          // ✅ Para otros errores (incluyendo problemas de red), continuar con el login
          console.log(
            "⚠️ Error al verificar métodos, pero continuando con autenticación..."
          );
        }
      } else {
        console.log("👤 Buscando usuario por userName:", identifier);

        const response = await fetch("/api/auth/find-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: identifier }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Error del servidor: ${response.status}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Usuario no encontrado");
        }

        if (!result.data?.email || !result.data?.uid) {
          throw new Error("Datos de usuario incompletos");
        }

        email = result.data.email;
        userUid = result.data.uid;

        // VERIFICAR MÉTODOS DE AUTENTICACIÓN DESDE EL API
        if (!result.data.canUsePassword) {
          const methods = result.data.authMethods || [];
          if (methods.includes("google.com")) {
            throw new Error(
              "Este usuario se registró con Google. Por favor, usa 'Iniciar sesión con Google'."
            );
          }
          throw new Error(
            "Este usuario no tiene contraseña configurada. Por favor, usa 'Iniciar sesión con Google'."
          );
        }

        console.log("✅ Usuario encontrado via API:", { email, uid: userUid });
      }

      // 2. Autenticar con Firebase Auth
      console.log("🔥 Autenticando con Firebase Auth...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 3. Obtener datos desde Firestore usando el UID correcto
      const finalUid = userUid || user.uid;
      console.log("📄 Obteniendo datos de Firestore para UID:", finalUid);

      const userDocRef = doc(db, "users", finalUid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        console.error(
          "❌ Documento no encontrado en Firestore para UID:",
          finalUid
        );
        throw new Error("Datos de usuario no encontrados en Firestore.");
      }

      const userData = userDocSnapshot.data() as FirestoreUserData;
      console.log("✅ Datos de Firestore obtenidos:", userData);

      // Verificar email verificado
      if (!userData.emailVerified && !user.emailVerified) {
        throw new Error(
          "Por favor, verifica tu correo electrónico antes de iniciar sesión."
        );
      }

      // 4. Crear usuario extendido
      const extendedUser: ExtendedUser = {
        ...user,
        ...userData,
      };
      setUser(extendedUser);

      console.log("✅ Login completado exitosamente");

      // 5. Cerrar modal y mostrar siguiente según estado
      setIsLoginModalOpen(false);

      if (!extendedUser.profileCompleted) {
        console.log("📝 Mostrando modal de completar registro");
        setIsCompleteRegisterModalOpen(true);
      } else if (extendedUser.showOnboardingModal) {
        console.log("🎯 Mostrando modal de onboarding");
        setIsOnboardingModalOpen(true);
      }

      return extendedUser;
    } catch (error: any) {
      console.error("❌ Error en login:", error);

      // Si ya es un error personalizado con mensaje específico, relanzarlo
      if (
        error.message?.includes("Google") ||
        error.message?.includes("contraseña configurada")
      ) {
        throw error;
      }

      // Manejo de errores de Firebase Auth
      switch (error.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          throw new Error(
            "Contraseña incorrecta. Por favor, verifica tus credenciales."
          );
        case "auth/user-not-found":
          throw new Error(
            "Usuario no encontrado. Verifica tu email o nombre de usuario."
          );
        case "auth/too-many-requests":
          throw new Error("Demasiados intentos fallidos. Intenta más tarde.");
        case "auth/invalid-email":
          throw new Error("Formato de correo electrónico inválido.");
        default:
          throw new Error(
            error.message || "Error al iniciar sesión. Inténtalo de nuevo."
          );
      }
    }
  };

  // Función para iniciar sesión con Google - VERSIÓN MEJORADA
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, providerGoogle);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        // Crear documento completo con todos los campos requeridos
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Usuario",
          userName: generateDefaultUserName(user.email || ""),
          role: "registered",
          profileCompleted: false, // IMPORTANTE: Dejar como false para completar registro
          emailVerified: true,
          showOnboardingModal: true,
          createdAt: new Date(),
          // Campos requeridos para el formulario de registro completo
          lastName: "",
          sex: "",
          country: "",
          roles: [],
          interests: [],
        });

        await fetch("/api/setUserRole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, role: "registered" }),
        });

        console.log("✅ Nuevo usuario Google creado en Firestore");
      } else {
        // Si el usuario ya existe, actualizar datos si es necesario
        const userData = userDocSnapshot.data();
        console.log("✅ Usuario Google ya existe en Firestore:", userData);
      }

      const userData = (await getDoc(userDocRef)).data() as FirestoreUserData;
      const extendedUser: ExtendedUser = {
        ...user,
        ...userData,
      };

      setUser(extendedUser);
      setIsLoginModalOpen(false);

      // Mostrar modales según el estado del usuario
      if (!userData.profileCompleted) {
        console.log(
          "📝 Mostrando modal de completar registro para usuario Google"
        );
        setIsCompleteRegisterModalOpen(true);
      } else if (userData.showOnboardingModal) {
        console.log("🎯 Mostrando onboarding para usuario Google");
        setIsOnboardingModalOpen(true);
      }
    } catch (error: any) {
      console.error("Error al iniciar sesión con Google:", error.message);
      alert("Ocurrió un error al iniciar sesión con Google.");
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
      alert("Ocurrió un error al cerrar sesión.");
    }
  };

  // Función para recuperar la contraseña
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

  // Función para actualizar el correo electrónico del usuario
  const updateAuthEmail = async (newEmail: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Usuario no autenticado");
      await firebaseUpdateEmail(currentUser, newEmail);
      await sendEmailVerification(currentUser);

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        email: newEmail,
        updatedAt: new Date().toISOString(),
      });

      setUser((prevUser) => {
        if (!prevUser) return null;
        return { ...prevUser, email: newEmail };
      });

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

  // Función para depurar el token del usuario
  const debugUserToken = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const idTokenResult = await user.getIdTokenResult(true);
        console.log("Token del usuario:", idTokenResult.claims);
        alert("Revisa la consola para ver los claims del token.");
      } catch (error) {
        console.error("Error al obtener el token del usuario:", error);
        alert("Ocurrió un error al depurar el token del usuario.");
      }
    } else {
      console.log("No hay usuario autenticado.");
      alert("No hay usuario autenticado.");
    }
  };

  // Función para actualizar el rol del usuario
  const updateUserRole = async (uid: string, newRole: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      setUser((prevUser) => {
        if (!prevUser) return null;
        return { ...prevUser, role: newRole };
      });
    } catch (error) {
      console.error("Error al actualizar el rol del usuario:", error);
      alert("Ocurrió un error al actualizar el rol del usuario.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
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
        logout,
        resetPassword,
        updateAuthEmail,
        debugUserToken,
        updateUserRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
