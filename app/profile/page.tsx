// app/profile/page.tsx
"use client"; // Indica que es un Client Component

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { uploadAvatar } from "../../firebase/storageUtils";
import { saveUserData } from "../../firebase/firestoreUtils";
import Button from "../components/Button";
import ConfirmEditProfileModal from "../components/componentsHome/ConfirmEditProfileModal";

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
  sex?: "hombre" | "mujer" | "no-binario" | string;
  interests?: string[];
  userName?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ProfilePage = () => {
  const { user, setUser, updateAuthEmail } = useAuth();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    name: user?.name || "",
    lastName: user?.lastName || "",
    country: user?.country || "",
    avatarUrl: user?.avatarUrl || "",
    userName: user?.userName || "",
    sex: user?.sex || "",
    roles: user?.roles || [],
    interests: user?.interests || [],
    otherRole: "", // Para manejar roles personalizados
    otherInterest: "", // Para manejar intereses personalizados
    email: user?.email || "", // Incluye el correo de autenticación
  });

  // Estado para controlar el proceso de guardado
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Manejo especial para roles e intereses (campos múltiples)
    if (name === "roles" || name === "interests") {
      const values = value.split(",").map((item) => item.trim());
      setFormData((prev) => ({ ...prev, [name]: values }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    try {
      const downloadURL = await uploadAvatar(file, user.uid); // Subir la imagen
      setFormData((prev) => ({ ...prev, avatarUrl: downloadURL })); // Actualizar el estado local

      // Actualizar el campo avatarUrl en Firestore
      await saveUserData({ uid: user.uid, avatarUrl: downloadURL });
    } catch (error) {
      console.error("Error al subir el avatar:", error);
      alert("Ocurrió un error al subir tu avatar.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userDataWithUid = {
        ...user,
        ...formData,
        uid: user.uid,
        // Asegurar que el sexo esté en el formato correcto
        sex:
          formData.sex === "male"
            ? "hombre"
            : formData.sex === "female"
              ? "mujer"
              : formData.sex === "other"
                ? "no-binario"
                : formData.sex,
      };

      // Procesar roles e intereses personalizados
      const processedRoles = formData.roles.includes("Otro")
        ? [
            ...formData.roles.filter((role: string) => role !== "Otro"),
            formData.otherRole,
          ].filter(Boolean)
        : formData.roles;

      const processedInterests = formData.interests.includes("Otro")
        ? [
            ...new Set([
              ...formData.interests.filter(
                (interest: string) => interest !== "Otro"
              ),
              formData.otherInterest,
            ]),
          ].filter(Boolean)
        : formData.interests;

      // Actualizar los roles e intereses procesados en los datos finales
      userDataWithUid.roles = processedRoles;
      userDataWithUid.interests = processedInterests;

      // Actualizar el correo de autenticación si ha cambiado
      if (formData.email !== user.email) {
        await updateAuthEmail(formData.email); // Actualiza el correo en Firebase Auth
      }

      // Guarda los datos actualizados en Firestore
      await saveUserData(userDataWithUid);

      // Actualiza el estado global del usuario
      setUser((prevUser: any) => {
        if (!prevUser) return null; // Maneja el caso en que prevUser sea null
        return { ...prevUser, ...userDataWithUid };
      });

      setIsConfirmationModalOpen(true);
    } catch (error: any) {
      console.error("Error al guardar el perfil:", error.message);
      alert(`Ocurrió un error al guardar tu perfil: ${error.message}`);
    } finally {
      setIsSaving(false); // Desactivar el estado de guardado
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-bluegreen-eske text-center mb-6">
        Editar Perfil
      </h2>

      {/* Avatar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Avatar
        </label>
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
        <label className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
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
        <label className="block text-sm font-medium text-gray-700">
          Apellidos
        </label>
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

      {/* Sexo */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Sexo</label>
        <select
          name="sex"
          value={formData.sex}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Selecciona una opción</option>
          <option value="hombre">Hombre</option>
          <option value="mujer">Mujer</option>
          <option value="no-binario">No binario</option>
        </select>
      </div>

      {/* Roles */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Roles</label>
        <input
          type="text"
          name="roles"
          value={formData.roles.join(", ")}
          onChange={handleInputChange}
          placeholder="Ej. Diseñador, Desarrollador"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
        {formData.roles.includes("Otro") && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">
              Otro Rol
            </label>
            <input
              type="text"
              name="otherRole"
              value={formData.otherRole}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Intereses */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Intereses
        </label>
        <input
          type="text"
          name="interests"
          value={formData.interests.join(", ")}
          onChange={handleInputChange}
          placeholder="Ej. Tecnología, Arte"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
        {formData.interests.includes("Otro") && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">
              Otro Interés
            </label>
            <input
              type="text"
              name="otherInterest"
              value={formData.otherInterest}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Nombre de Usuario */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Nombre de Usuario
        </label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* Correo Electrónico */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Correo Electrónico <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
        <p className="text-xs text-gray-500">
          Este es tu correo de autenticación. Cambiarlo afectará tu inicio de
          sesión y comunicación.
        </p>
      </div>

      {/* Botón Guardar */}
      <Button
        label={isSaving ? "Guardando..." : "Guardar Cambios"}
        variant="primary"
        onClick={handleSave}
        disabled={isSaving} // Deshabilitar el botón mientras se guarda
      />

      {/* Modal de Confirmación */}
      <ConfirmEditProfileModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
