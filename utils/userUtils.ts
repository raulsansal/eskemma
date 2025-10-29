// utils/userUtils.ts
import { getFirestore } from "firebase/firestore";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

const db = getFirestore();

export const isUserNameAvailable = async (
  userName: string
): Promise<boolean> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("userName", "==", userName.toLowerCase()),
      limit(1)
    );

    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error("Error al verificar la disponibilidad del userName:", error);
    throw new Error("Ocurrió un error al verificar el nombre de usuario.");
  }
};
