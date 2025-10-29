// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { uploadAvatar } from "../../firebase/storageUtils";
import { saveUserData } from "../../firebase/firestoreUtils";
import Button from "../components/Button";
import ConfirmEditProfileModal from "../components/componentsHome/ConfirmEditProfileModal";
import ConfirmAvatarChange from "../components/componentsHome/ConfirmAvatarChange";
import ConfirmPasswordChange from "../components/componentsHome/ConfirmPasswordChange";
import countries from "../data/countries.json";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { isUserNameAvailable } from "../../utils/userUtils";
import { generateAlternativeUserName } from "@/utils/generateAlternativeUserName";

const ProfilePage = () => {
  const router = useRouter();
  const { user, setUser, updateAuthEmail } = useAuth();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarConfirmationOpen, setIsAvatarConfirmationOpen] =
    useState(false);
  const [isPasswordConfirmationOpen, setIsPasswordConfirmationOpen] =
    useState(false);

  // Redirigir al home si no hay usuario autenticado
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Tamaño máximo del avatar
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB

  // Definir los países preferenciales
  const preferredCountries = [
    "México",
    "Estados Unidos",
    "España",
    "Argentina",
    "Perú",
  ];
  const allCountries = countries.filter(
    (country) => !preferredCountries.includes(country)
  );
  const sortedCountries = [...preferredCountries, ...allCountries];
  const [isUserNameValid, setIsUserNameValid] = useState(true);
  const [userNameError, setUserNameError] = useState("");
  const [suggestionMessage, setSuggestionMessage] = useState("");

  // Lista de intereses
  const interestsList = [
    "Análisis de Datos",
    "Campañas Institucionales",
    "Comunicación de Gobierno",
    "Comunicación Política",
    "Encuestas y Muestreo",
    "Estrategia Electoral",
    "Estrategia Política",
    "Gerencia Electoral",
    "Gobierno Municipal",
    "Investigación Cualitativa",
    "Liderazgo y Negociación",
    "Marca Política",
    "Marco Jurídico-Electoral",
    "Marketing Electoral",
    "Marketing Político Digital",
    "Opinión Pública",
    "Participación Ciudadana",
    "Poder Legislativo",
    "Políticas Públicas",
    "Sociedad Civil",
    "Storytelling",
    "Técnicas de Análisis Político",
  ];

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
    otherRole: "",
    otherInterest: "",
    email: user?.email || "",
  });

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Estado para controlar el proceso de guardado
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Actualizar formData cuando el usuario cambie
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        lastName: user.lastName || "",
        country: user.country || "",
        avatarUrl: user.avatarUrl || "",
        userName: user.userName || "",
        sex: user.sex || "",
        roles: user.roles || [],
        interests: user.interests || [],
        otherRole: "",
        otherInterest: "",
        email: user.email || "",
      });
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  // ✅ NUEVA FUNCIÓN: Manejar cancelación
  const handleCancel = () => {
    // Confirmar si el usuario desea descartar cambios
    const hasChanges =
      formData.name !== user?.name ||
      formData.lastName !== user?.lastName ||
      formData.userName !== user?.userName ||
      formData.sex !== user?.sex ||
      formData.country !== user?.country ||
      formData.email !== user?.email ||
      JSON.stringify(formData.roles) !== JSON.stringify(user?.roles) ||
      JSON.stringify(formData.interests) !== JSON.stringify(user?.interests);

    if (hasChanges) {
      const confirmDiscard = window.confirm(
        "¿Estás seguro de que deseas descartar los cambios? Todos los cambios no guardados se perderán."
      );

      if (!confirmDiscard) {
        return; // El usuario decidió no descartar los cambios
      }
    }

    // Redirigir al home
    router.push("/");
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "userName") {
      const isValidChars = /^[a-zA-ZñÑüÜçÇ\s]*$/.test(value);
      if (!isValidChars) {
        setUserNameError("Solo se permiten letras, espacios, ñ, ü, ç.");
        setIsUserNameValid(false);
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value.toLowerCase() }));

      if (
        value.trim().length > 0 &&
        value.toLowerCase() !== user?.userName?.toLowerCase()
      ) {
        try {
          const available = await isUserNameAvailable(value.toLowerCase());
          setIsUserNameValid(available);

          if (!available) {
            const alternativeUserName = await generateAlternativeUserName(
              value.toLowerCase()
            );
            setFormData((prev) => ({ ...prev, userName: alternativeUserName }));
            setUserNameError("Este nombre de usuario ya está en uso.");
            setSuggestionMessage(
              `Se ha sugerido "${alternativeUserName}" como alternativa.`
            );
          } else {
            setUserNameError("");
            setSuggestionMessage("");
          }
        } catch (error) {
          console.error("Error al verificar el nombre de usuario:", error);
          setUserNameError(
            "Ocurrió un error al verificar el nombre de usuario."
          );
          setIsUserNameValid(false);
        }
      } else {
        setIsUserNameValid(true);
        setUserNameError("");
        setSuggestionMessage("");
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleRolesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      roles: checked
        ? [...prev.roles, value]
        : prev.roles.filter((item) => item !== value),
    }));
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      interests: checked
        ? [...new Set([...prev.interests, value])]
        : prev.interests.filter((item) => item !== value),
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateUserName = async (userName: string): Promise<boolean> => {
    if (!userName.trim()) {
      setErrors((prev) => ({
        ...prev,
        userName: "El nombre de usuario es obligatorio",
      }));
      return false;
    }

    // Si el userName es el mismo que tiene actualmente, es válido
    if (userName.toLowerCase() === user?.userName?.toLowerCase()) {
      return true;
    }

    try {
      // ✅ USAR LA FUNCIÓN DE UTILIDAD EN VEZ DE QUERY DIRECTA
      const available = await isUserNameAvailable(userName.toLowerCase());

      if (!available) {
        setErrors((prev) => ({
          ...prev,
          userName: "Este nombre de usuario ya está en uso",
        }));
        return false;
      }

      // Limpiar error si existía
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.userName;
        return newErrors;
      });

      return true;
    } catch (error) {
      console.error("Error al validar userName:", error);
      setErrors((prev) => ({
        ...prev,
        userName: "Error al validar el nombre de usuario",
      }));
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Los apellidos son obligatorios";
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "El nombre de usuario es obligatorio";
    }

    if (!formData.sex) {
      newErrors.sex = "Selecciona tu sexo";
    }

    if (!formData.country) {
      newErrors.country = "Selecciona tu país";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Ingresa tu contraseña actual";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Ingresa tu nueva contraseña";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "La contraseña debe tener al menos 6 caracteres";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      alert("Debes estar autenticado para subir un avatar.");
      return;
    }

    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (file.size > MAX_AVATAR_SIZE) {
      alert(
        `El archivo es demasiado grande. El tamaño máximo permitido es ${
          MAX_AVATAR_SIZE / (1024 * 1024)
        } MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const downloadURL = await uploadAvatar(file, user.uid);
      setFormData((prev) => ({ ...prev, avatarUrl: downloadURL }));
      setIsAvatarConfirmationOpen(true);
    } catch (error) {
      console.error("Error al subir el avatar:", error);
      alert("Ocurrió un error al subir tu avatar.");
      setAvatarPreview(formData.avatarUrl || null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      alert("No se pudo autenticar al usuario");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, passwordData.newPassword);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordSection(false);
      setIsPasswordConfirmationOpen(true);
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);

      if (error.code === "auth/wrong-password") {
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Contraseña actual incorrecta",
        }));
      } else if (error.code === "auth/too-many-requests") {
        alert("Demasiados intentos. Intenta más tarde.");
      } else {
        alert("Error al cambiar la contraseña. Inténtalo de nuevo.");
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert("Debes estar autenticado para guardar cambios.");
      return;
    }

    if (!validateForm()) {
      alert("Por favor, completa todos los campos obligatorios");
      return;
    }

    const isUserNameValid = await validateUserName(formData.userName);
    if (!isUserNameValid) {
      return;
    }

    setIsSaving(true);
    try {
      const finalRoles: string[] = formData.roles.includes("Otro")
        ? [
            ...formData.roles.filter((role: string) => role !== "Otro"),
            formData.otherRole || "",
          ].filter((role) => role !== "")
        : formData.roles;

      const finalInterests: string[] = formData.interests.includes("Otro")
        ? [
            ...new Set([
              ...formData.interests.filter(
                (interest: string) => interest !== "Otro"
              ),
              formData.otherInterest || "",
            ]),
          ].filter((interest) => interest !== "")
        : [...new Set(formData.interests)];

      const userDataToSave = {
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        lastName: formData.lastName,
        country: formData.country,
        avatarUrl: formData.avatarUrl,
        userName: formData.userName.toLowerCase(),
        sex: formData.sex,
        roles: finalRoles,
        interests: finalInterests,
        role: user.role || "user",
        profileCompleted: true,
        emailVerified: user.emailVerified ?? false,
        showOnboardingModal: user.showOnboardingModal ?? false,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (formData.email !== user.email) {
        await updateAuthEmail(formData.email);
        alert("Se ha enviado un correo de verificación a tu nueva dirección");
      }

      await saveUserData(userDataToSave);

      setUser({
        ...user,
        ...userDataToSave,
      });

      setIsConfirmationModalOpen(true);
    } catch (error: any) {
      console.error("Error al guardar el perfil:", error.message);
      alert(`Ocurrió un error al guardar tu perfil: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-bluegreen-eske text-center mb-8">
        Editar Perfil
      </h2>

      {/* SECCIÓN: Avatar */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-bluegreen-eske mb-4">
          Foto de Perfil
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-bluegreen-eske"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                <span className="text-gray-400 text-sm text-center px-2">
                  Sin foto
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer inline-block bg-bluegreen-eske text-white px-6 py-3 rounded hover:bg-bluegreen-eske-70 transition-colors duration-300"
            >
              {isUploadingAvatar ? "Subiendo..." : "Cambiar foto"}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={isUploadingAvatar}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">
              Tamaño máximo: 2 MB. Formatos: JPG, PNG, GIF
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: Información Personal */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-bluegreen-eske mb-4">
          Información Personal
        </h3>

        {/* Nombre */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:border-bluegreen-eske`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Apellidos */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellidos <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:border-bluegreen-eske`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        {/* Nombre de Usuario */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Usuario <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${
              !isUserNameValid ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:border-bluegreen-eske`}
          />
          {!isUserNameValid && (
            <p className="text-red-500 text-sm mt-1">{userNameError}</p>
          )}
          {suggestionMessage && (
            <p className="text-blue-500 text-sm mt-1">{suggestionMessage}</p>
          )}
        </div>

        {/* Sexo */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo <span className="text-red-500">*</span>
          </label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${
              errors.sex ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:border-bluegreen-eske`}
          >
            <option value="">Selecciona una opción</option>
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
            <option value="no-binario">No binario</option>
          </select>
          {errors.sex && (
            <p className="text-red-500 text-sm mt-1">{errors.sex}</p>
          )}
        </div>

        {/* País */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            País <span className="text-red-500">*</span>
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${
              errors.country ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:border-bluegreen-eske`}
          >
            <option value="">Selecciona una opción</option>
            {sortedCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">{errors.country}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:border-bluegreen-eske`}
          />
          <p className="text-xs text-gray-500 mt-1">
            ⚠️ Este es tu correo de autenticación. Cambiarlo requerirá
            verificación y afectará tu inicio de sesión.
          </p>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* SECCIÓN: Roles */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-bluegreen-eske mb-4">
          Roles Profesionales
        </h3>
        <div className="space-y-2">
          {[
            "Candidatura",
            "Consultoría o Asesoría",
            "Integrante de equipo de campaña",
            "Integrante de partido político",
            "Servicio público",
            "Academia",
            "Otro",
          ].map((role) => (
            <label key={role} className="flex items-center">
              <input
                type="checkbox"
                value={role}
                checked={formData.roles.includes(role)}
                onChange={handleRolesChange}
                className="mr-2 accent-bluegreen-eske"
              />
              <span className="text-gray-700">{role}</span>
            </label>
          ))}
          {formData.roles.includes("Otro") && (
            <input
              type="text"
              name="otherRole"
              value={formData.otherRole}
              onChange={handleInputChange}
              placeholder="Especifica tu rol"
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-bluegreen-eske"
            />
          )}
        </div>
      </div>

      {/* SECCIÓN: Intereses */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-bluegreen-eske mb-4">
          Temas de Interés
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {interestsList.map((interest) => (
            <label key={interest} className="flex items-center">
              <input
                type="checkbox"
                value={interest}
                checked={formData.interests.includes(interest)}
                onChange={handleInterestsChange}
                className="mr-2 accent-bluegreen-eske"
              />
              <span className="text-gray-700 text-sm">{interest}</span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="checkbox"
              value="Otro"
              checked={formData.interests.includes("Otro")}
              onChange={handleInterestsChange}
              className="mr-2 accent-bluegreen-eske"
            />
            <span className="text-gray-700 text-sm">Otro</span>
          </label>
        </div>
        {formData.interests.includes("Otro") && (
          <input
            type="text"
            name="otherInterest"
            value={formData.otherInterest}
            onChange={handleInputChange}
            placeholder="Especifica tu interés"
            className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-bluegreen-eske"
          />
        )}
      </div>

      {/* SECCIÓN: Cambiar Contraseña */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-bluegreen-eske mb-4">
          Seguridad
        </h3>

        {!showPasswordSection ? (
          <button
            onClick={() => setShowPasswordSection(true)}
            className="text-bluegreen-eske hover:underline cursor-pointer"
          >
            Cambiar contraseña
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Actual <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2 border ${
                  errors.currentPassword ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:border-bluegreen-eske`}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2 border ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:border-bluegreen-eske`}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva Contraseña{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:border-bluegreen-eske`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleChangePassword}
                className="bg-bluegreen-eske text-white px-6 py-2 rounded hover:bg-bluegreen-eske-70 transition-colors duration-300"
              >
                Actualizar Contraseña
              </button>
              <button
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setErrors({});
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ BOTONES: Guardar Cambios y Cancelar */}
      <div className="flex justify-center gap-4">
        <Button
          label="Cancelar"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSaving || isUploadingAvatar}
        />
        <Button
          label={isSaving ? "Guardando..." : "Guardar Cambios"}
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || isUploadingAvatar}
        />
      </div>

      {/* Modal de Confirmación del Avatar */}
      <ConfirmAvatarChange
        isOpen={isAvatarConfirmationOpen}
        onClose={() => setIsAvatarConfirmationOpen(false)}
      />

      {/* Modal de Confirmación del Cambio de Contraseña */}
      <ConfirmPasswordChange
        isOpen={isPasswordConfirmationOpen}
        onClose={() => setIsPasswordConfirmationOpen(false)}
      />

      {/* Modal de Confirmación del Perfil */}
      <ConfirmEditProfileModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
