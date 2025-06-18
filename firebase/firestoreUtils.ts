import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const saveUserData = async (userData: any) => {
  try {
    console.log("Intentando guardar datos en Firestore:", userData);

    // Validaciones básicas
    if (!userData.uid) {
      throw new Error("UID del usuario no proporcionado.");
    }
    if (!userData.email) {
      throw new Error("Correo electrónico no proporcionado.");
    }

    const userRef = doc(db, "users", userData.uid);

    // Preparar datos, omitiendo emailVerified para no sobrescribirlo
    const finalUserData = {
      ...userData,
      profileCompleted: userData.profileCompleted ?? false,
      createdAt: userData.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Datos finales para guardar en Firestore:", finalUserData);

    // Usar merge: true para preservar campos existentes como emailVerified
    await setDoc(userRef, finalUserData, { merge: true });
    console.log("Datos guardados exitosamente en Firestore.");
  } catch (error: any) {
    console.error("Error al guardar datos en Firestore:", error.message);
    alert(`Ocurrió un error al guardar tus datos: ${error.message}`);
  }
};