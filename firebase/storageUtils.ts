// app/firebase/storageUtils.ts

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";

/**
 * Sube un avatar al Firebase Storage después de comprimirlo y redimensionarlo.
 * @param file - El archivo de imagen que se va a subir.
 * @param uid - El ID único del usuario para organizar los avatares.
 * @returns URL descargable del avatar.
 */
export const uploadAvatar = async (file: File, uid: string) => {
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB en bytes
  const MAX_AVATAR_DIMENSIONS = 500; // Máximo 500x500 píxeles

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error(
      `El archivo es demasiado grande. El tamaño máximo permitido es ${
        MAX_AVATAR_SIZE / (1024 * 1024)
      } MB.`
    );
  }

  try {
    // Configuración para la compresión
    const options = {
      maxSizeMB: 1, // Tamaño máximo en MB
      maxWidthOrHeight: MAX_AVATAR_DIMENSIONS, // Máximo 500x500 píxeles
      useWebWorker: true, // Usar Web Worker para mejor rendimiento
      fileType: file.type, // Mantener el tipo MIME original
      initialQuality: 0.8, // Calidad inicial del 80%
    };

    // Comprimir y redimensionar la imagen
    const compressedFile = await imageCompression(file, options);

    // Mantener el nombre original del archivo
    const finalFile = new File([compressedFile], file.name, {
      type: compressedFile.type, // Mantener el tipo MIME original
    });

    // Subir el archivo comprimido a Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `avatars/${uid}/${finalFile.name}`);
    await uploadBytes(storageRef, finalFile);

    // Obtener la URL descargable
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir el avatar:", error);
    throw new Error("Ocurrió un error al subir tu avatar.");
  }
};

/**
 * Sube una imagen destacada al Firebase Storage después de comprimirla y redimensionarla.
 * @param file - El archivo de imagen que se va a subir.
 * @param postId - El ID único del post para organizar las imágenes destacadas.
 * @returns URL descargable de la imagen destacada.
 */
export const uploadFeaturedImage = async (file: File, postId: string) => {
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB en bytes
  const MAX_IMAGE_DIMENSIONS = 1920; // Máximo 1920x1080 píxeles

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `El archivo es demasiado grande. El tamaño máximo permitido es ${
        MAX_IMAGE_SIZE / (1024 * 1024)
      } MB.`
    );
  }

  try {
    // Configuración para la compresión
    const options = {
      maxSizeMB: 1, // Tamaño máximo en MB
      maxWidthOrHeight: MAX_IMAGE_DIMENSIONS, // Máximo 1920x1080 píxeles
      useWebWorker: true, // Usar Web Worker para mejor rendimiento
      fileType: file.type, // Mantener el tipo MIME original
      initialQuality: 0.8, // Calidad inicial del 80%
    };

    // Comprimir y redimensionar la imagen
    const compressedFile = await imageCompression(file, options);

    // Mantener el nombre original del archivo
    const finalFile = new File([compressedFile], file.name, {
      type: compressedFile.type, // Mantener el tipo MIME original
    });

    // Subir el archivo comprimido a Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `post-images/${postId}/${finalFile.name}`);
    await uploadBytes(storageRef, finalFile);

    // Obtener la URL descargable
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error("Error al subir la imagen destacada:", error.message);
    if (error.code === "storage/unauthorized") {
      throw new Error(
        "No tienes permisos para subir la imagen. Verifica las reglas de Firebase Storage."
      );
    }
    throw new Error("Ocurrió un error al subir la imagen destacada.");
  }
};

/**
 * Sube una imagen secundaria al Firebase Storage después de comprimirla y redimensionarla.
 * @param file - El archivo de imagen que se va a subir.
 * @param postId - El ID único del post para organizar las imágenes secundarias.
 * @returns URL descargable de la imagen secundaria.
 */
export const uploadSecondaryImage = async (file: File, postId: string) => {
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB en bytes
  const MAX_IMAGE_DIMENSIONS = 1024; // Máximo 1024x1024 píxeles

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `El archivo es demasiado grande. El tamaño máximo permitido es ${
        MAX_IMAGE_SIZE / (1024 * 1024)
      } MB.`
    );
  }

  try {
    // Configuración para la compresión
    const options = {
      maxSizeMB: 1, // Tamaño máximo en MB
      maxWidthOrHeight: MAX_IMAGE_DIMENSIONS, // Máximo 1024x1024 píxeles
      useWebWorker: true, // Usar Web Worker para mejor rendimiento
      fileType: file.type, // Mantener el tipo MIME original
      initialQuality: 0.8, // Calidad inicial del 80%
    };

    // Comprimir y redimensionar la imagen
    const compressedFile = await imageCompression(file, options);

    // Mantener el nombre original del archivo
    const finalFile = new File([compressedFile], file.name, {
      type: compressedFile.type, // Mantener el tipo MIME original
    });

    // Subir el archivo comprimido a Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `post-images/${postId}/secondary/${finalFile.name}`);
    await uploadBytes(storageRef, finalFile);

    // Obtener la URL descargable
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error("Error al subir la imagen secundaria:", error.message);
    if (error.code === "storage/unauthorized") {
      throw new Error(
        "No tienes permisos para subir la imagen. Verifica las reglas de Firebase Storage."
      );
    }
    throw new Error("Ocurrió un error al subir la imagen secundaria.");
  }
};

/**
 * Sube un archivo multimedia genérico al Firebase Storage.
 * @param file - El archivo que se va a subir.
 * @param path - La ruta donde se almacenará el archivo en Firebase Storage.
 * @returns URL descargable del archivo subido.
 */
export const uploadMedia = async (file: File, path: string) => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB en bytes

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `El archivo es demasiado grande. El tamaño máximo permitido es ${
        MAX_FILE_SIZE / (1024 * 1024)
      } MB.`
    );
  }

  try {
    // Subir el archivo a Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);

    // Obtener la URL descargable
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir el archivo multimedia:", error);
    throw new Error("Ocurrió un error al subir el archivo multimedia.");
  }
};