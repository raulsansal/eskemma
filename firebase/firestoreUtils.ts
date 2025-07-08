// firebase/firestoreUtils.ts

import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const saveUserData = async (userData: any, role?: string) => {
  try {
    console.log("Intentando guardar datos en Firestore:", userData);

    // Validaciones básicas
    if (!userData.uid) {
      throw new Error("UID del usuario no proporcionado.");
    }

    const userRef = doc(db, "users", userData.uid);

    // Limpieza de datos: Eliminar propiedades no serializables
    const cleanUserData = ((data: any) => {
      const allowedFields = [
        "uid",
        "email",
        "name",
        "lastName",
        "country",
        "avatarUrl",
        "userName",
        "sex",
        "roles",
        "interests",
        "profileCompleted",
        "createdAt",
        "updatedAt",
      ];

      const cleanedData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (data[key] !== undefined) {
          cleanedData[key] = data[key];
        }
      }

      return cleanedData;
    })(userData);

    // Preparar datos finales
    const finalUserData = {
      ...cleanUserData,
      role: role || "user", // Asignar rol predeterminado "user" si no se especifica
      profileCompleted: cleanUserData.profileCompleted ?? false,
      createdAt: cleanUserData.createdAt ?? new Date().toISOString(),
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