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
  updateEmail,
  getIdTokenResult,
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
  closeOnboardingModal: (showOnLogin?: boolean) => Promise<void>; // Declaración correcta
  registerUser: (email: string, password: string) => Promise<void>;
  loginUser: (identifier: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
  updateAuthEmail: (newEmail: string) => Promise<void>;
  debugUserToken: () => Promise<void>; // Función temporal para depurar el token
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

          // Obtener el token del usuario para verificar los claims personalizados
          const idTokenResult = await updatedUser.getIdTokenResult();
          const role = idTokenResult.claims.role || "visitor"; // Default a 'visitor' si no hay rol

          // Cargar datos del usuario desde Firestore
          const userDocRef = doc(db, "users", updatedUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!userDocSnapshot.exists()) {
            await setDoc(userDocRef, {
              uid: updatedUser.uid,
              email: updatedUser.email,
              role: role, // Guardar el rol del token en Firestore
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
          setUser({ ...updatedUser, ...userData, role }); // Incluir el rol en el estado del usuario

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

  // Resto del código sin cambios...

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
        closeOnboardingModal, // Incluimos la función aquí
        registerUser: async (email: string, password: string) => {
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
              alert(
                "La contraseña es demasiado débil. Usa al menos 6 caracteres."
              );
            } else {
              alert(
                "Ocurrió un error al registrar usuario. Inténtalo de nuevo."
              );
            }
          }
        },
        loginUser: async (identifier: string, password: string) => {
          try {
            let email;
            if (identifier.includes("@")) {
              email = identifier;
            } else {
              const usersRef = collection(db, "users");
              const q = query(
                usersRef,
                where("userName", "==", identifier),
                limit(1)
              );
              const querySnapshot = await getDocs(q);
              if (querySnapshot.empty) {
                throw new Error("Nombre de usuario o contraseña incorrectos.");
              }
              const userData = querySnapshot.docs[0].data();
              email = userData.email;
            }
            const userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );
            const user = userCredential.user;
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            if (!userDocSnapshot.exists()) {
              throw new Error("Datos de usuario no encontrados en Firestore.");
            }
            const userData = userDocSnapshot.data();
            setUser({ ...user, ...userData });
            setIsLoginModalOpen(false);
          } catch (error: any) {
            console.error("Error al iniciar sesión:", error.message);
            alert("Nombre de usuario o contraseña incorrectos.");
          }
        },
        signInWithGoogle: async () => {
          try {
            const result = await signInWithPopup(auth, providerGoogle);
            const user = result.user;
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            if (!userDocSnapshot.exists()) {
              await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || "Usuario",
                role: "registered",
                profileCompleted: false,
                emailVerified: true,
                showOnboardingModal: true,
                createdAt: new Date(),
              });
            }
            const userData = (await getDoc(userDocRef)).data();
            setUser({ ...user, ...userData });
            setIsLoginModalOpen(false);
          } catch (error: any) {
            console.error("Error al iniciar sesión con Google:", error.message);
            alert("Ocurrió un error al iniciar sesión con Google.");
          }
        },
        signInWithFacebook: async () => {
          try {
            const result = await signInWithPopup(auth, providerFacebook);
            const user = result.user;
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            if (!userDocSnapshot.exists()) {
              await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || "Usuario",
                role: "registered",
                profileCompleted: false,
                emailVerified: true,
                showOnboardingModal: true,
                createdAt: new Date(),
              });
            }
            const userData = (await getDoc(userDocRef)).data();
            setUser({ ...user, ...userData });
            setIsLoginModalOpen(false);
          } catch (error: any) {
            console.error(
              "Error al iniciar sesión con Facebook:",
              error.message
            );
            alert("Ocurrió un error al iniciar sesión con Facebook.");
          }
        },
        logout: async () => {
          try {
            await signOut(auth);
            setUser(null);
            setIsOnboardingModalOpen(false);
          } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Ocurrió un error al cerrar sesión.");
          }
        },
        resetPassword: async (email: string) => {
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
        },
        updateAuthEmail: async (newEmail: string) => {
          try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Usuario no autenticado");
            await updateEmail(currentUser, newEmail);
            await sendEmailVerification(currentUser);
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
              email: newEmail,
              updatedAt: new Date().toISOString(),
            });
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
        },
        debugUserToken: async () => {
          const user = auth.currentUser;
          if (user) {
            try {
              const idTokenResult = await user.getIdTokenResult();
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
        },
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
