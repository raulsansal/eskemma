// app/profile/page.tsx 
"use client"; // Indica que es un Client Component

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { uploadAvatar } from "../../firebase/storageUtils";
import { saveUserData } from "../../firebase/firestoreUtils";
import Button from "../components/Button";

// Definición de la interfaz User
interface User {
  uid: string;
  email: string;
  name?: string;
  lastName?: string;
  country?: string;
  avatarUrl?: string;
  profileCompleted?: boolean;
  role?: string;
  roles?: string[];
  sex?: string;
  interests?: string[];
  userName?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    lastName: user?.lastName || "",
    country: user?.country || "",
    avatarUrl: user?.avatarUrl || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    try {
      const downloadURL = await uploadAvatar(file, user.uid);
      setFormData((prev) => ({ ...prev, avatarUrl: downloadURL }));
    } catch (error) {
      console.error("Error al subir el avatar:", error);
      alert("Ocurrió un error al subir tu avatar.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveUserData(formData);
      setUser((prevUser: User | null) => {
        if (!prevUser) {
          console.error("Usuario no encontrado al actualizar el estado.");
          return null;
        }
        return { ...prevUser, ...formData };
      });
      alert("Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      alert("Ocurrió un error al guardar tu perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Perfil</h1>

      {/* Avatar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Avatar</label>
        <input type="file" onChange={handleAvatarUpload} />
        {formData.avatarUrl && (
          <img
            src={formData.avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full mt-2 object-cover"
          />
        )}
      </div>

      {/* Nombre */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* Apellido */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Apellido</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* País */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">País</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* Botón Guardar */}
      <Button
        label={isSaving ? "Guardando..." : "Guardar Cambios"}
        variant="primary"
        onClick={handleSave}
      />
    </div>
  );
};

export default ProfilePage;