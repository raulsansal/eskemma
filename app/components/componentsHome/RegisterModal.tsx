// components/componentsHome/RegisterModal.tsx
"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { saveUserData } from "../../../firebase/firestoreUtils";
import { auth } from "../../../firebase/firebaseConfig";
import countries from "../../../app/data/countries.json";
import { isUserNameAvailable } from "../../../utils/userUtils";
import { generateAlternativeUserName } from "../../../utils/generateAlternativeUserName";
import { calculateUserRole } from "../../../utils/roleUtils"; // ✅ IMPORTAR

interface RegisterFormData {
  name: string;
  lastName: string;
  sex: string;
  country: string;
  roles: string[];
  otherRole?: string;
  interests: string[];
  otherInterest?: string;
  userName: string;
}

export default function RegisterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    lastName: "",
    sex: "",
    country: "",
    roles: [],
    otherRole: "",
    interests: [],
    otherInterest: "",
    userName: "",
  });
  const [userNameEdited, setUserNameEdited] = useState(false);
  const [isUserNameValid, setIsUserNameValid] = useState(true);
  const [userNameError, setUserNameError] = useState("");
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ AGREGAR estado de loading

  const {
    user,
    setUser,
    setIsRegisterModalOpen,
    setIsCompleteRegisterModalOpen,
    setIsRegistrationSuccessModalOpen,
    setIsLoginModalOpen,
    setIsOnboardingModalOpen,
  } = useAuth();

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

  // Lista normalizada de intereses
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

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "name" || name === "lastName") {
      const isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜçÇ\s´]*$/.test(value);

      if (!isValid) {
        return;
      }

      if (name === "name") {
        const baseUserName = value.toLowerCase().replace(/\s+/g, "");
        const available = await isUserNameAvailable(baseUserName);
        const finalUserName = available
          ? baseUserName
          : await generateAlternativeUserName(baseUserName);

        setFormData((prev) => ({
          ...prev,
          name: value,
          userName: finalUserName,
        }));

        if (!available) {
          setSuggestionMessage(
            `El nombre de usuario "${baseUserName}" no está disponible. Se ha sugerido "${finalUserName}".`
          );
        } else {
          setSuggestionMessage("");
        }

        setUserNameEdited(!available);
        return;
      }

      setFormData((prev) => ({ ...prev, lastName: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserNameChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;

    const isValid = /^[a-zA-ZñÑüÜçÇ\s]*$/.test(value);
    if (!isValid) {
      setUserNameError("Solo se permiten letras, espacios, ñ, ü, ç.");
      setIsUserNameValid(false);
      return;
    }

    setFormData((prev) => ({ ...prev, userName: value.toLowerCase() }));
    setUserNameEdited(true);

    if (value.trim().length > 0) {
      try {
        const available = await isUserNameAvailable(value.toLowerCase());
        setIsUserNameValid(available);

        if (!available) {
          const alternativeUserName = await generateAlternativeUserName(
            value.toLowerCase()
          );
          setFormData((prev) => ({ ...prev, userName: alternativeUserName }));
          setUserNameError(
            "Este nombre de usuario ya está en uso. Se ha sugerido una alternativa."
          );
        } else {
          setUserNameError("");
        }
      } catch (error) {
        console.error("Error al verificar el nombre de usuario:", error);
        setUserNameError("Ocurrió un error al verificar el nombre de usuario.");
        setIsUserNameValid(false);
      }
    } else {
      setIsUserNameValid(true);
      setUserNameError("");
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

  // ✅ FUNCIÓN handleSubmit ACTUALIZADA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUserNameValid) {
      alert("Por favor, corrige el nombre de usuario antes de continuar.");
      return;
    }

    if (!user) {
      alert("No se detectó un usuario autenticado. Por favor, inicia sesión.");
      return;
    }

    setIsSubmitting(true); // ✅ Activar loading

    try {
      console.log("📝 Iniciando proceso de completar registro...");

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Usuario no autenticado");
      await currentUser.reload();
      const emailVerified = currentUser.emailVerified;

      // Filtrar roles e intereses
      const finalRoles: string[] = formData.roles.includes("Otro")
        ? [
            ...formData.roles.filter((role) => role !== "Otro"),
            formData.otherRole || "",
          ].filter((role) => role !== "")
        : formData.roles;

      const finalInterests: string[] = formData.interests.includes("Otro")
        ? [
            ...new Set([
              ...formData.interests.filter((interest) => interest !== "Otro"),
              formData.otherInterest || "",
            ]),
          ].filter((interest) => interest !== "")
        : [...new Set(formData.interests)];

      // ✅ CALCULAR ROL CORRECTO
      // Al completar el registro: emailVerified=true, profileCompleted=true → role="user"
      const calculatedRole = calculateUserRole({
        emailVerified: emailVerified,
        profileCompleted: true, // ✅ Ahora sí está completo
        subscriptionPlan: user.subscriptionPlan || null,
        subscriptionStatus: user.subscriptionStatus || null,
        subscriptionEndDate: user.subscriptionEndDate || null,
        previousSubscription: user.previousSubscription || null,
      });

      console.log(`✅ Rol calculado después de completar registro: ${calculatedRole}`);

      // ✅ PREPARAR DATOS CON EL ROL CORRECTO
      const userData = {
        uid: user.uid,
        email: user.email,
        name: formData.name,
        lastName: formData.lastName,
        sex: formData.sex,
        country: formData.country,
        roles: finalRoles,
        interests: finalInterests,
        userName: formData.userName.toLowerCase(),
        profileCompleted: true, // ✅ Marcar como completado
        role: calculatedRole, // ✅ Usar el rol calculado
        emailVerified,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // ✅ Mantener campos de suscripción si existen
        subscriptionPlan: user.subscriptionPlan || null,
        subscriptionStatus: user.subscriptionStatus || null,
        subscriptionStartDate: user.subscriptionStartDate || null,
        subscriptionEndDate: user.subscriptionEndDate || null,
        previousSubscription: user.previousSubscription || null,
        stripeCustomerId: user.stripeCustomerId || null,
        stripeSubscriptionId: user.stripeSubscriptionId || null,
      };

      console.log("📦 Datos preparados para guardar:", userData);

      // ✅ GUARDAR EN FIRESTORE
      await saveUserData(userData);
      console.log("✅ Datos guardados correctamente en Firestore");

      // ✅ ACTUALIZAR CUSTOM CLAIM
      await fetch("/api/setUserRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          role: calculatedRole,
        }),
      });
      console.log("✅ Custom claim actualizado");

      // ✅ ACTUALIZAR EL USUARIO EN EL CONTEXTO
      setUser({
        ...user,
        name: formData.name,
        lastName: formData.lastName,
        sex: formData.sex,
        country: formData.country,
        roles: finalRoles,
        interests: finalInterests,
        userName: formData.userName.toLowerCase(),
        profileCompleted: true,
        role: calculatedRole, // ✅ Actualizar con el rol correcto
        updatedAt: new Date().toISOString(),
      });

      console.log("✅ Usuario actualizado en el contexto");

      // ✅ CERRAR MODALES DE REGISTRO
      setIsRegisterModalOpen(false);
      setIsCompleteRegisterModalOpen(false);

      // ✅ MOSTRAR MODAL DE ONBOARDING SI CORRESPONDE
      if (user.showOnboardingModal) {
        console.log("🎯 Mostrando modal de onboarding");
        setIsOnboardingModalOpen(true);
      } else {
        console.log("✅ Registro completado - No se requiere onboarding");
        alert("¡Registro completado exitosamente!");
      }

      console.log(`✅ Registro completado con éxito. Role final: ${calculatedRole}`);
    } catch (error: any) {
      console.error("❌ Error durante el registro:", error);
      alert(
        `Ocurrió un error al completar tu perfil: ${
          error.message || "Inténtalo de nuevo."
        }`
      );
    } finally {
      setIsSubmitting(false); // ✅ Desactivar loading
    }
  };

  const handleLoginClick = () => {
    console.log("🔄 Cerrando registro y abriendo login...");
    setIsRegisterModalOpen(false);
    setTimeout(() => {
      setIsLoginModalOpen(true);
      console.log("✅ Modal de login abierto");
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div
        className="bg-white-eske rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-y-auto max-h-[80vh]"
        style={{ marginTop: "20px" }}
      >
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-red-eske transition-colors duration-300"
          onClick={onClose}
          disabled={isSubmitting} // ✅ Deshabilitar mientras se envía
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-bluegreen-eske text-center mb-6">
          Completar Registro
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[16px] font-medium text-black-eske mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting} // ✅ Deshabilitar mientras se envía
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-[16px] font-medium text-black-eske mb-1">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-[16px] font-medium text-black-eske mb-1">
              Nombre de usuario <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleUserNameChange}
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border ${
                !isUserNameValid ? "border-red-500" : "border-gray-300"
              } rounded focus:outline-none focus:border-blue-eske disabled:bg-gray-100`}
            />
            {!isUserNameValid && (
              <p className="text-red-500 text-sm mt-1">{userNameError}</p>
            )}
            {suggestionMessage && (
              <p className="text-blue-500 text-sm mt-1">{suggestionMessage}</p>
            )}
          </div>

          <div>
            <label className="block text-[16px] font-medium text-black-eske mb-1">
              Sexo <span className="text-red-500">*</span>
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske disabled:bg-gray-100"
            >
              <option value="">Selecciona una opción</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="no-binario">No binario</option>
            </select>
          </div>

          <div>
            <label className="block text-[16px] font-medium text-black-eske mb-1">
              País <span className="text-red-500">*</span>
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske disabled:bg-gray-100"
            >
              <option value="">Selecciona una opción</option>
              {sortedCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <hr className="border-bluegreen-eske my-4" />
            <p className="text-[16px] font-medium text-bluegreen-eske text-center mb-6">
              La siguiente información nos permite ofrecerte un mejor servicio,
              acorde con tu perfil e intereses.
            </p>
          </div>

          <div>
            <label className="block text-[16px] font-medium text-black-eske mb-1">
              Roles
            </label>
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
                    name="roles"
                    value={role}
                    checked={formData.roles.includes(role)}
                    onChange={handleRolesChange}
                    disabled={isSubmitting}
                    className="mr-2 accent-blue-eske disabled:opacity-50"
                  />
                  {role}
                </label>
              ))}
              {formData.roles.includes("Otro") && (
                <input
                  type="text"
                  name="otherRole"
                  value={formData.otherRole}
                  onChange={handleChange}
                  placeholder="Especifica tu rol"
                  disabled={isSubmitting}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske disabled:bg-gray-100"
                />
              )}
            </div>
          </div>

          <div>
            <hr className="border-bluegreen-eske my-4" />
            <label className="block text-[16px] font-medium text-black-eske mb-1">
              Temas de interés
            </label>
            <div className="space-y-2">
              {interestsList.map((interest) => (
                <label key={interest} className="flex items-center">
                  <input
                    type="checkbox"
                    name="interests"
                    value={interest}
                    checked={formData.interests.includes(interest)}
                    onChange={handleInterestsChange}
                    disabled={isSubmitting}
                    className="mr-2 accent-blue-eske disabled:opacity-50"
                  />
                  {interest}
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Otro"
                  checked={formData.interests.includes("Otro")}
                  onChange={handleInterestsChange}
                  disabled={isSubmitting}
                  className="mr-2 accent-blue-eske disabled:opacity-50"
                />
                Otro
              </label>
              {formData.interests.includes("Otro") && (
                <input
                  type="text"
                  name="otherInterest"
                  value={formData.otherInterest}
                  onChange={handleChange}
                  placeholder="Especifica tu interés"
                  disabled={isSubmitting}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske disabled:bg-gray-100"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-bluegreen-eske text-white-eske py-2 rounded hover:bg-bluegreen-70 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "COMPLETANDO REGISTRO..." : "COMPLETAR REGISTRO"}
          </button>

          <p className="mt-4 text-[14px] text-black-eske text-center">
            Al registrarme acepto las{" "}
            <a
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske-60 underline cursor-pointer"
            >
              condiciones de uso y política de privacidad
            </a>{" "}
            de Eskemma.
          </p>

          <hr className="border-gray-300 my-4" />

          <p className="text-[14px] text-black-eske text-center">
            ¿Ya te has registrado?{" "}
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={isSubmitting}
              className="text-bluegreen-eske-60 underline cursor-pointer bg-transparent border-none p-0 hover:text-bluegreen-eske disabled:opacity-50"
            >
              Inicia sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
