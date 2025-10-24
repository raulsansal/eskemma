// firebase/firestoreUtils.ts
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { updatePassword as firebaseUpdatePassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "./firebaseConfig";

/**
 * Función para subir una imagen destacada a Firebase Storage
 */
export const uploadFeaturedImage = async (file: File, postId: string): Promise<string> => {
  try {
    // Validar que se haya proporcionado un archivo
    if (!file) {
      throw new Error("No se proporcionó ningún archivo para subir.");
    }

    // Obtener una referencia al servicio de almacenamiento de Firebase
    const storage = getStorage();

    // Generar un nombre único para el archivo usando UUID
    const fileName = `post-images/${postId}/${uuidv4()}-${file.name}`;

    // Crear una referencia al archivo en Firebase Storage
    const storageRef = ref(storage, fileName);

    // Subir el archivo al almacenamiento
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Esperar a que la subida se complete
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Opcional: Monitorear el progreso de la subida
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Progreso de la subida: ${progress.toFixed(2)}%`);
        },
        (error) => {
          // Manejar errores específicos de Firebase Storage
          if (error.code === "storage/unauthorized") {
            console.error("No tienes permiso para subir archivos a esta ubicación.");
            alert("No tienes permiso para subir archivos. Contacta al administrador.");
          } else {
            console.error("Error al subir la imagen destacada:", error.message);
            alert(`Ocurrió un error al subir la imagen destacada: ${error.message}`);
          }
          reject(error);
        },
        () => {
          // Subida completada
          resolve();
        }
      );
    });

    // Obtener la URL de descarga del archivo subido
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Imagen destacada subida exitosamente. URL:", downloadURL);

    return downloadURL;
  } catch (error: any) {
    console.error("Error al subir la imagen destacada:", error.message);
    alert(`Ocurrió un error al subir la imagen destacada: ${error.message}`);
    throw error; // Relanzar el error para manejarlo en el componente que llama a esta función
  }
};

/**
 * Función para guardar los datos del usuario en Firestore
 */
export const saveUserData = async (userData: any) => {
  try {
    // Referencia al documento del usuario en Firestore
    const userRef = doc(db, "users", userData.uid);

    // Guardar los datos del usuario
    await setDoc(userRef, userData, { merge: true });

    console.log("Datos guardados correctamente en Firestore.");
  } catch (error) {
    console.error("Error al guardar los datos en Firestore:", error);
    throw error; // Re-lanzar el error para manejarlo en el componente
  }
};

/**
 * Función para actualizar la contraseña del usuario
 */
export const updatePassword = async (userId: string, newPassword: string) => {
  try {
    // Obtener el usuario actual
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Usuario no autenticado. No se puede actualizar la contraseña.");
    }

    // Verificar si el usuario tiene un método de autenticación con contraseña
    const email = currentUser.email || "";
    const userMethods = await fetchSignInMethodsForEmail(auth, email);

    if (!userMethods.includes("password")) {
      throw new Error("Este usuario no tiene contraseña configurada. No se puede actualizar.");
    }

    // Actualizar la contraseña
    await firebaseUpdatePassword(currentUser, newPassword);

    console.log("Contraseña actualizada exitosamente.");
    alert("Contraseña actualizada exitosamente.");
  } catch (error: any) {
    console.error("Error al actualizar la contraseña:", error.message);

    // Manejar errores específicos
    if (error.code === "auth/weak-password") {
      alert("La nueva contraseña es demasiado débil. Usa al menos 6 caracteres.");
    } else if (error.code === "auth/requires-recent-login") {
      alert(
        "Debes iniciar sesión nuevamente para realizar esta acción. Tu sesión ha expirado."
      );
    } else {
      alert(`Ocurrió un error al actualizar la contraseña: ${error.message}`);
    }

    throw error; // Re-lanzar el error para manejarlo en el componente
  }
};