// app/firebase/storageUtils.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadAvatar = async (file: File, uid: string) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `avatars/${uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir el avatar:", error);
    throw new Error("Ocurrió un error al subir tu avatar.");
  }
};