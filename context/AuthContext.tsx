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
  fetchSignInMethodsForEmail,
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
import { isUserNameAvailable } from "../utils/userUtils";

// ✅ TIPOS DE ROLES
type UserRole =
  | "visitor"
  | "registered"
  | "user"
  | "basic"
  | "premium"
  | "grupal"
  | "unsubscribed-basic"
  | "unsubscribed-premium"
  | "unsubscribed-grupal"
  | "expired"
  | "admin";

// ✅ TIPOS DE PLANES
type SubscriptionPlan = "basic" | "premium" | "grupal" | null;

// ✅ TIPOS DE ESTADO DE SUSCRIPCIÓN
type SubscriptionStatus = "active" | "cancelled" | "expired" | null;

// ✅ Interfaz para los datos de Firestore (ACTUALIZADA)
interface FirestoreUserData {
  uid: string;
  email: string;
  role: UserRole;
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

  // ✅ NUEVOS CAMPOS PARA SUSCRIPCIONES
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionStartDate?: Date | string | null;
  subscriptionEndDate?: Date | string | null;
  previousSubscription?: SubscriptionPlan;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

// ✅ Tipo extendido que combina User de Firebase con datos de Firestore (ACTUALIZADO)
interface ExtendedUser extends User {
  role: UserRole;
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

  // ✅ CAMPOS DE SUSCRIPCIÓN
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionStartDate?: Date | string | null;
  subscriptionEndDate?: Date | string | null;
  previousSubscription?: SubscriptionPlan;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

// ✅ AuthContextType (ACTUALIZADO)
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
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;

  // ✅ NUEVAS FUNCIONES PARA SUSCRIPCIONES
  activateSubscription: (
    plan: SubscriptionPlan,
    stripeSubscriptionId?: string
  ) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  checkAndUpdateExpiredSubscriptions: () => Promise<void>;
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

  // ✅ FUNCIÓN AUXILIAR: Calcular rol desde roleUtils
  const { calculateUserRole } = require("../utils/roleUtils");

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

          await new Promise((resolve) => setTimeout(resolve, 1000));
          const idTokenResult = await updatedUser.getIdTokenResult(true);

          const userDocRef = doc(db, "users", updatedUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!userDocSnapshot.exists()) {
            // ✅ NUEVO USUARIO: Crear con role "visitor"
            const initialRole: UserRole = "visitor";

            await setDoc(userDocRef, {
              uid: updatedUser.uid,
              email: updatedUser.email,
              userName: generateDefaultUserName(updatedUser.email || ""),
              role: initialRole,
              profileCompleted: false,
              emailVerified: updatedUser.emailVerified,
              showOnboardingModal: true,
              createdAt: new Date(),
              subscriptionPlan: null,
              subscriptionStatus: null,
              subscriptionStartDate: null,
              subscriptionEndDate: null,
              previousSubscription: null,
              stripeCustomerId: null,
              stripeSubscriptionId: null,
            });

            const newExtendedUser: ExtendedUser = {
              ...updatedUser,
              role: initialRole,
              profileCompleted: false,
              showOnboardingModal: true,
            };
            setUser(newExtendedUser);
          } else {
            const userData = userDocSnapshot.data() as FirestoreUserData;

            // ✅ SI EL USUARIO ES ADMIN, NO RECALCULAR EL ROL
            if (userData.role === "admin") {
              console.log("🔒 Usuario es admin, manteniendo rol");

              const extendedUser: ExtendedUser = {
                ...updatedUser,
                ...userData,
                role: "admin",
              };

              console.log("Usuario autenticado:", updatedUser);
              console.log("Datos de usuario desde Firestore:", userData);
              console.log("Rol: admin (protegido)");

              setUser(extendedUser);
            } else {
              // ✅ CALCULAR ROL SOLO SI NO ES ADMIN
              const calculatedRole = calculateUserRole({
                emailVerified: updatedUser.emailVerified,
                profileCompleted: userData.profileCompleted,
                subscriptionPlan: userData.subscriptionPlan,
                subscriptionStatus: userData.subscriptionStatus,
                subscriptionEndDate: userData.subscriptionEndDate,
                previousSubscription: userData.previousSubscription,
              });

              // ✅ ACTUALIZAR ROL SI CAMBIÓ
              if (userData.role !== calculatedRole) {
                await updateDoc(userDocRef, {
                  role: calculatedRole,
                  updatedAt: new Date(),
                });

                await fetch("/api/setUserRole", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    uid: updatedUser.uid,
                    role: calculatedRole,
                  }),
                });
              }

              // Actualizar emailVerified si cambió
              if (userData.emailVerified !== updatedUser.emailVerified) {
                const newRole = calculateUserRole({
                  emailVerified: updatedUser.emailVerified,
                  profileCompleted: userData.profileCompleted,
                  subscriptionPlan: userData.subscriptionPlan,
                  subscriptionStatus: userData.subscriptionStatus,
                  subscriptionEndDate: userData.subscriptionEndDate,
                  previousSubscription: userData.previousSubscription,
                });

                await updateDoc(userDocRef, {
                  emailVerified: updatedUser.emailVerified,
                  role: newRole,
                  updatedAt: new Date(),
                });
              }

              const extendedUser: ExtendedUser = {
                ...updatedUser,
                ...userData,
                role: calculatedRole,
              };

              console.log("Usuario autenticado:", updatedUser);
              console.log("Datos de usuario desde Firestore:", userData);
              console.log("Rol calculado:", calculatedRole);

              setUser(extendedUser);
            }
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

  // ✅ Función para registrar un nuevo usuario (ACTUALIZADA)
  const registerUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await new Promise((resolve) => setTimeout(resolve, 500));

      let defaultUserName = generateDefaultUserName(user.email || "");
      let isAvailable = await isUserNameAvailable(defaultUserName);

      if (!isAvailable) {
        let counter = 1;
        let alternativeUserName = `${defaultUserName}${counter}`;

        while (!(await isUserNameAvailable(alternativeUserName))) {
          counter++;
          alternativeUserName = `${defaultUserName}${counter}`;
        }

        defaultUserName = alternativeUserName;
      }

      await sendEmailVerification(user);

      const initialRole: UserRole = "visitor";

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        userName: defaultUserName,
        role: initialRole,
        profileCompleted: false,
        emailVerified: false,
        showOnboardingModal: true,
        createdAt: new Date(),
        subscriptionPlan: null,
        subscriptionStatus: null,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        previousSubscription: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      });

      await fetch("/api/setUserRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, role: initialRole }),
      });

      console.log(`✅ Usuario registrado con role: ${initialRole}`);

      setIsVerifyEmailModalOpen(true);
      setIsSignInModalOpen(false);
    } catch (error: any) {
      console.error("Error al registrar usuario:", error.message);

      if (error.code === "auth/email-already-in-use") {
        alert(
          "Este correo electrónico ya está registrado. Intenta iniciar sesión."
        );
        setIsSignInModalOpen(false);
        setIsLoginModalOpen(true);
      } else if (error.code === "auth/weak-password") {
        alert("La contraseña debe tener al menos 6 caracteres.");
      } else if (error.code === "permission-denied") {
        alert("Error de configuración. Contacta al administrador.");
      } else {
        alert("Ocurrió un error inesperado. Inténtalo de nuevo más tarde.");
      }
    }
  };

  // Función para iniciar sesión con correo electrónico o nombre de usuario
  const loginUser = async (identifier: string, password: string) => {
    try {
      let email: string;
      let userUid: string | null = null;

      console.log("🔐 Iniciando proceso de login con:", identifier);

      if (identifier.includes("@")) {
        email = identifier.toLowerCase().trim();
        console.log("📧 Login con email:", email);

        console.log("🔍 Verificando métodos de autenticación para email...");
        const authInstance = getAuth();
        try {
          const authMethods = await fetchSignInMethodsForEmail(
            authInstance,
            email
          );
          console.log("📋 Métodos disponibles:", authMethods);

          if (authMethods.length > 0) {
            if (authMethods.length === 1 && authMethods[0] === "google.com") {
              throw new Error(
                "Este usuario se registró con Google. Por favor, usa 'Iniciar sesión con Google'."
              );
            }

            if (!authMethods.includes("password") && authMethods.length > 0) {
              throw new Error(
                "Este usuario no tiene contraseña configurada. Si te registraste con tu cuenta de Google, intenta usa 'Iniciar sesión con Google'."
              );
            }
          } else {
            console.log(
              "⚠️ No se pudieron obtener los métodos de autenticación. Continuando con el login..."
            );
          }
        } catch (authError: any) {
          console.error("Error al verificar métodos:", authError);
          if (
            authError.message?.includes("Google") ||
            authError.message?.includes("contraseña configurada")
          ) {
            throw authError;
          }
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

      console.log("🔥 Autenticando con Firebase Auth...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

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

      if (!userData.emailVerified && !user.emailVerified) {
        throw new Error(
          "Por favor, verifica tu correo electrónico antes de iniciar sesión."
        );
      }

      // ✅ SI EL USUARIO ES ADMIN, NO RECALCULAR EL ROL
      if (userData.role === "admin") {
        console.log("🔒 Usuario es admin, manteniendo rol");

        const extendedUser: ExtendedUser = {
          ...user,
          ...userData,
          role: "admin",
        };
        setUser(extendedUser);

        console.log("✅ Login completado exitosamente con role: admin");

        setIsLoginModalOpen(false);

        if (!extendedUser.profileCompleted) {
          console.log("📝 Mostrando modal de completar registro");
          setIsCompleteRegisterModalOpen(true);
        } else if (extendedUser.showOnboardingModal) {
          console.log("🎯 Mostrando modal de onboarding");
          setIsOnboardingModalOpen(true);
        }

        return extendedUser;
      }

      // ✅ CALCULAR ROL SOLO SI NO ES ADMIN
      const calculatedRole = calculateUserRole({
        emailVerified: user.emailVerified,
        profileCompleted: userData.profileCompleted,
        subscriptionPlan: userData.subscriptionPlan,
        subscriptionStatus: userData.subscriptionStatus,
        subscriptionEndDate: userData.subscriptionEndDate,
        previousSubscription: userData.previousSubscription,
      });

      if (userData.role !== calculatedRole) {
        console.log(
          `🔄 Actualizando role de "${userData.role}" a "${calculatedRole}"`
        );
        await updateDoc(userDocRef, {
          role: calculatedRole,
          updatedAt: new Date(),
        });

        await fetch("/api/setUserRole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: finalUid,
            role: calculatedRole,
          }),
        });
      }

      const extendedUser: ExtendedUser = {
        ...user,
        ...userData,
        role: calculatedRole,
      };
      setUser(extendedUser);

      console.log("✅ Login completado exitosamente con role:", calculatedRole);

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

      if (
        error.message?.includes("Google") ||
        error.message?.includes("contraseña configurada")
      ) {
        throw error;
      }

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

  // ✅ Función para iniciar sesión con Google (ACTUALIZADA)
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, providerGoogle);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        const initialRole: UserRole = "registered";

        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Usuario",
          userName: generateDefaultUserName(user.email || ""),
          role: initialRole,
          profileCompleted: false,
          emailVerified: true,
          showOnboardingModal: true,
          createdAt: new Date(),
          lastName: "",
          sex: "",
          country: "",
          roles: [],
          interests: [],
          subscriptionPlan: null,
          subscriptionStatus: null,
          subscriptionStartDate: null,
          subscriptionEndDate: null,
          previousSubscription: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        });

        await fetch("/api/setUserRole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, role: initialRole }),
        });

        console.log(`✅ Nuevo usuario Google creado con role: ${initialRole}`);
      }

      const userData = (await getDoc(userDocRef)).data() as FirestoreUserData;

      // ✅ SI EL USUARIO ES ADMIN, NO RECALCULAR EL ROL
      if (userData.role === "admin") {
        console.log("🔒 Usuario es admin, manteniendo rol");

        const extendedUser: ExtendedUser = {
          ...user,
          ...userData,
          role: "admin",
        };

        setUser(extendedUser);
        setIsLoginModalOpen(false);

        if (!userData.profileCompleted) {
          console.log(
            "📝 Mostrando modal de completar registro para usuario Google"
          );
          setIsCompleteRegisterModalOpen(true);
        } else if (userData.showOnboardingModal) {
          console.log("🎯 Mostrando onboarding para usuario Google");
          setIsOnboardingModalOpen(true);
        }

        return;
      }

      // ✅ CALCULAR ROL SOLO SI NO ES ADMIN
      const calculatedRole = calculateUserRole({
        emailVerified: true,
        profileCompleted: userData.profileCompleted,
        subscriptionPlan: userData.subscriptionPlan,
        subscriptionStatus: userData.subscriptionStatus,
        subscriptionEndDate: userData.subscriptionEndDate,
        previousSubscription: userData.previousSubscription,
      });

      if (userData.role !== calculatedRole) {
        console.log(
          `🔄 Actualizando role de "${userData.role}" a "${calculatedRole}"`
        );
        await updateDoc(userDocRef, {
          role: calculatedRole,
          updatedAt: new Date(),
        });

        await fetch("/api/setUserRole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            role: calculatedRole,
          }),
        });
      }

      const extendedUser: ExtendedUser = {
        ...user,
        ...userData,
        role: calculatedRole,
      };

      setUser(extendedUser);
      setIsLoginModalOpen(false);

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

  // ✅ Función para actualizar el rol del usuario (ACTUALIZADA)
  const updateUserRole = async (uid: string, newRole: UserRole) => {
    try {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      await fetch("/api/setUserRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, role: newRole }),
      });

      setUser((prevUser) => {
        if (!prevUser) return null;
        return { ...prevUser, role: newRole };
      });

      console.log(`✅ Rol actualizado a: ${newRole}`);
    } catch (error) {
      console.error("Error al actualizar el rol del usuario:", error);
      alert("Ocurrió un error al actualizar el rol del usuario.");
    }
  };

  // ✅ ========== NUEVAS FUNCIONES PARA SUSCRIPCIONES ==========

  /**
   * Activa una suscripción para el usuario actual
   */
  const activateSubscription = async (
    plan: SubscriptionPlan,
    stripeSubscriptionId?: string
  ) => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    if (!plan) {
      throw new Error("Plan de suscripción no especificado");
    }

    // ✅ NO MODIFICAR ROL SI ES ADMIN
    if (user.role === "admin") {
      console.log("🔒 Usuario admin detectado, no se modificará el rol");
      return;
    }

    try {
      console.log(`🎯 Activando suscripción ${plan} para usuario ${user.uid}`);

      const userDocRef = doc(db, "users", user.uid);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const updateData: any = {
        subscriptionPlan: plan,
        subscriptionStatus: "active" as SubscriptionStatus,
        subscriptionStartDate: startDate.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
        previousSubscription: null,
        updatedAt: new Date().toISOString(),
      };

      if (stripeSubscriptionId) {
        updateData.stripeSubscriptionId = stripeSubscriptionId;
      }

      await updateDoc(userDocRef, updateData);

      const newRole = calculateUserRole({
        emailVerified: user.emailVerified ?? true,
        profileCompleted: user.profileCompleted ?? true,
        subscriptionPlan: plan,
        subscriptionStatus: "active",
        subscriptionEndDate: endDate.toISOString(),
        previousSubscription: null,
      });

      await updateDoc(userDocRef, {
        role: newRole,
      });

      await fetch("/api/setUserRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, role: newRole }),
      });

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          subscriptionPlan: plan,
          subscriptionStatus: "active",
          subscriptionStartDate: startDate.toISOString(),
          subscriptionEndDate: endDate.toISOString(),
          stripeSubscriptionId: stripeSubscriptionId || null,
          role: newRole,
        };
      });

      console.log(`✅ Suscripción ${plan} activada. Nuevo role: ${newRole}`);
      alert(`¡Suscripción ${plan} activada exitosamente!`);
    } catch (error: any) {
      console.error("Error al activar suscripción:", error);
      throw new Error(`Error al activar suscripción: ${error.message}`);
    }
  };

  /**
   * Cancela la suscripción actual del usuario
   */
  const cancelSubscription = async () => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    if (!user.subscriptionPlan || user.subscriptionStatus !== "active") {
      throw new Error("No hay suscripción activa para cancelar");
    }

    // ✅ NO MODIFICAR ROL SI ES ADMIN
    if (user.role === "admin") {
      console.log("🔒 Usuario admin detectado, no se modificará el rol");
      return;
    }

    try {
      console.log(`🚫 Cancelando suscripción para usuario ${user.uid}`);

      const userDocRef = doc(db, "users", user.uid);
      const previousPlan = user.subscriptionPlan;

      await updateDoc(userDocRef, {
        subscriptionStatus: "cancelled" as SubscriptionStatus,
        previousSubscription: previousPlan,
        updatedAt: new Date().toISOString(),
      });

      const newRole = calculateUserRole({
        emailVerified: user.emailVerified ?? true,
        profileCompleted: user.profileCompleted ?? true,
        subscriptionPlan: previousPlan,
        subscriptionStatus: "cancelled",
        subscriptionEndDate: user.subscriptionEndDate,
        previousSubscription: previousPlan,
      });

      await updateDoc(userDocRef, {
        role: newRole,
      });

      await fetch("/api/setUserRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, role: newRole }),
      });

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          subscriptionStatus: "cancelled",
          previousSubscription: previousPlan,
          role: newRole,
        };
      });

      console.log(`✅ Suscripción cancelada. Nuevo role: ${newRole}`);
      alert("Suscripción cancelada exitosamente.");
    } catch (error: any) {
      console.error("Error al cancelar suscripción:", error);
      throw new Error(`Error al cancelar suscripción: ${error.message}`);
    }
  };

  /**
   * Verifica y actualiza suscripciones expiradas
   * Debe ejecutarse periódicamente o al iniciar sesión
   */
  const checkAndUpdateExpiredSubscriptions = async () => {
    if (!user) return;

    // ✅ NO MODIFICAR ROL SI ES ADMIN
    if (user.role === "admin") {
      console.log(
        "🔒 Usuario admin detectado, omitiendo verificación de expiración"
      );
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) return;

      const userData = userDocSnapshot.data() as FirestoreUserData;

      if (
        userData.subscriptionEndDate &&
        new Date(userData.subscriptionEndDate) < new Date() &&
        userData.subscriptionStatus === "active"
      ) {
        console.log("⏰ Suscripción expirada detectada");

        await updateDoc(userDocRef, {
          subscriptionStatus: "expired" as SubscriptionStatus,
          updatedAt: new Date().toISOString(),
        });

        const newRole: UserRole = "expired";

        await updateDoc(userDocRef, {
          role: newRole,
        });

        await fetch("/api/setUserRole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, role: newRole }),
        });

        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            subscriptionStatus: "expired",
            role: newRole,
          };
        });

        console.log(
          `✅ Suscripción marcada como expirada. Nuevo role: ${newRole}`
        );
      }
    } catch (error) {
      console.error("Error al verificar suscripciones expiradas:", error);
    }
  };

  // ✅ EJECUTAR VERIFICACIÓN AL CARGAR EL USUARIO
  useEffect(() => {
    if (user) {
      checkAndUpdateExpiredSubscriptions();
    }
  }, [user?.uid]);

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
        activateSubscription,
        cancelSubscription,
        checkAndUpdateExpiredSubscriptions,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
