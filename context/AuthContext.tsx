// context/AuthContext.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

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
          // Forzar la recarga del estado del usuario
          await currentUser.reload();
          const updatedUser = auth.currentUser;

          if (!updatedUser) {
            console.error('Usuario no encontrado después de reload.');
            setUser(null);
            setLoading(false);
            return;
          }

          const userDocRef = doc(db, 'users', updatedUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!userDocSnapshot.exists()) {
            // Crear documento en Firestore si no existe
            await setDoc(userDocRef, {
              uid: updatedUser.uid,
              email: updatedUser.email,
              role: 'registered',
              profileCompleted: false,
              emailVerified: updatedUser.emailVerified,
              showOnboardingModal: true, // Nuevo campo para controlar el modal Onboarding
              createdAt: new Date(),
            });
          } else {
            const userData = userDocSnapshot.data();
            // Sincronizar emailVerified con Firebase Authentication
            if (userData.emailVerified !== updatedUser.emailVerified) {
              await updateDoc(userDocRef, {
                emailVerified: updatedUser.emailVerified,
                updatedAt: new Date(),
              });
            }
          }

          // Obtener datos actualizados
          const userData = (await getDoc(userDocRef)).data();
          setUser({ ...updatedUser, ...userData });

          // Lógica de modales
          if (updatedUser.emailVerified) {
            setIsVerifyEmailModalOpen(false);
            if (!userData?.profileCompleted) {
              setIsCompleteRegisterModalOpen(true);
            } else if (userData.showOnboardingModal) {
              setIsOnboardingModalOpen(true);
            }
          } else {
            setUser({ ...updatedUser, role: 'visitor' });
          }
        } catch (error) {
          console.error('Error al verificar el estado del usuario:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para registrar un nuevo usuario
  const registerUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: 'registered',
        profileCompleted: false,
        emailVerified: false,
        showOnboardingModal: true, // Nuevo campo para controlar el modal Onboarding
        createdAt: new Date(),
      });

      setIsVerifyEmailModalOpen(true);
      setIsSignInModalOpen(false);

      const intervalId = setInterval(async () => {
        try {
          await user.reload();
          const updatedUser = auth.currentUser;

          if (updatedUser?.emailVerified) {
            clearInterval(intervalId);
            await updateDoc(doc(db, 'users', updatedUser.uid), {
              emailVerified: true,
              updatedAt: new Date(),
            });
            setIsVerifyEmailModalOpen(false);
            setIsCompleteRegisterModalOpen(true);
          }
        } catch (error) {
          console.error('Error al verificar el estado del correo:', error);
        }
      }, 5000);
    } catch (error: any) {
      console.error('Error al registrar usuario:', error.message);
      if (error.code === 'auth/email-already-in-use') {
        alert('Este correo ya está registrado. Intenta iniciar sesión.');
        setIsSignInModalOpen(false); // Cerrar el modal de registro
        setIsLoginModalOpen(true); // Abrir el modal de inicio de sesión
      } else if (error.code === 'auth/weak-password') {
        alert('La contraseña es demasiado débil. Usa al menos 6 caracteres.');
      } else {
        alert('Error al registrar usuario. Inténtalo de nuevo.');
      }
    }
  };

  // Función para iniciar sesión
  const loginUser = async (emailOrUsername: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailOrUsername,
        password
      );
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();

        // Actualizar rol si es necesario
        if (userData.role === 'registered') {
          await updateDoc(userDocRef, { role: 'user', updatedAt: new Date() });
        }

        // Actualizar estado del usuario
        const updatedUserData = { ...user, ...userData };
        setUser(updatedUserData);

        // Gestionar modales
        setIsLoginModalOpen(false);
        if (userData.profileCompleted && userData.showOnboardingModal) {
          setIsOnboardingModalOpen(true);
        } else if (!userData.profileCompleted) {
          setIsCompleteRegisterModalOpen(true);
        }

        return updatedUserData;
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error.message);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsOnboardingModalOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para actualizar el rol del usuario
  const updateUserRole = async (uid: string, newRole: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, { role: newRole, updatedAt: new Date() });
      setUser((prevUser: any) => ({ ...prevUser, role: newRole }));
    } catch (error) {
      console.error('Error al actualizar el rol del usuario:', error);
    }
  };

  // Función para cerrar el modal Onboarding y actualizar preferencias
  const closeOnboardingModal = async (showOnLogin: boolean) => {
    try {
      if (user && user.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { showOnboardingModal: showOnLogin });
        setIsOnboardingModalOpen(false);
      }
    } catch (error) {
      console.error('Error al cerrar el modal de bienvenida:', error);
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
        updateUserRole,
        closeOnboardingModal,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
