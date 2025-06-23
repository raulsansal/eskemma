// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

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
        alert("Error al registrar usuario. Inténtalo de nuevo.");
      }
    }
  };

  const loginUser = async (identifier: string, password: string) => {
    try {
      let email;

      // Determinar si el identificador es un correo electrónico o un nombre de usuario
      if (identifier.includes("@")) {
        email = identifier;
      } else {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userName", "==", identifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Nombre de usuario o contraseña incorrectos.", {
            cause: { code: "auth/user-not-found" },
          });
        }

        const userData = querySnapshot.docs[0].data() as { email: string };
        email = userData.email;
      }

      // Intentar iniciar sesión con el correo electrónico y la contraseña
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Obtener datos adicionales del usuario desde Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();

        // Actualizar rol si es necesario
        if (userData.role === "registered") {
          await updateDoc(userDocRef, { role: "user", updatedAt: new Date() });
        }

        const updatedUserData = { ...user, ...userData };
        setUser(updatedUserData);

        setIsLoginModalOpen(false);
        if (userData.profileCompleted && userData.showOnboardingModal) {
          setIsOnboardingModalOpen(true);
        } else if (!userData.profileCompleted) {
          setIsCompleteRegisterModalOpen(true);
        }

        return updatedUserData;
      }
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error.message);
      console.log("Error detectado:", {
        code: error.code || error.cause?.code,
        message: error.message,
      });

      // Manejar errores específicos de Firebase
      if (
        error.cause?.code === "auth/user-not-found" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        throw new Error("Nombre de usuario o contraseña incorrectos.");
      } else {
        throw new Error("Ocurrió un error al iniciar sesión. Inténtalo de nuevo.");
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsOnboardingModalOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
        registerUser,
        loginUser,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};