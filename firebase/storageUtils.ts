// Instalar primero: npm install browser-image-compression
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';

export const uploadAvatar = async (file: File, uid: string) => {
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB en bytes
  const MAX_AVATAR_DIMENSIONS = 500; // Máximo 500x500 píxeles

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error(
      `El archivo es demasiado grande. El tamaño máximo permitido es ${MAX_AVATAR_SIZE / (1024 * 1024)} MB.`
    );
  }

  try {
    // Configuración para la compresión
    const options = {
      maxSizeMB: 1, // Tamaño máximo en MB
      maxWidthOrHeight: MAX_AVATAR_DIMENSIONS, // Máximo 500x500 píxeles
      useWebWorker: true, // Usar Web Worker para mejor rendimiento
      fileType: 'image/jpeg', // Convertir a JPEG
      initialQuality: 0.8 // Calidad inicial del 80%
    };

    // Comprimir y redimensionar la imagen
    const compressedFile = await imageCompression(file, options);

    // Crear un nuevo nombre de archivo con extensión .jpg
    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
    const finalFile = new File([compressedFile], fileName, { type: 'image/jpeg' });

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