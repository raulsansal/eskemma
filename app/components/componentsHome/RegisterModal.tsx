'use client';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { saveUserData } from '../../../firebase/firestoreUtils';
import { auth } from '../../../firebase/firebaseConfig';
import countries from '../../../app/data/countries.json';

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
    name: '',
    lastName: '',
    sex: '',
    country: '',
    roles: [],
    otherRole: '',
    interests: [],
    otherInterest: '',
    userName: '',
  });

  const { user, setIsRegisterModalOpen, setIsRegistrationSuccessModalOpen } =
    useAuth();
  
  // Definir los países preferenciales
  const preferredCountries = ["México", "Estados Unidos", "España", "Argentina", "Perú"];

  // Filtrar el resto de los países (excluyendo los preferenciales)
  const allCountries = countries.filter((country) => !preferredCountries.includes(country));

  // Combinar los países preferenciales con el resto del listado
  const sortedCountries = [...preferredCountries, ...allCountries];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'name') {
      const isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value);
      if (!isValid) return;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        userName: value.toLowerCase().replace(/\s+/g, ''),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
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
        ? [...prev.interests, value]
        : prev.interests.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('No se detectó un usuario autenticado. Por favor, inicia sesión.');
      return;
    }

    try {
      console.log('Iniciando proceso de registro...');

      // Obtener el valor actual de emailVerified desde Firebase Authentication
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');
      await currentUser.reload();
      const emailVerified = currentUser.emailVerified;

      // Preparar los datos del usuario
      const userData = {
        uid: user.uid,
        email: user.email,
        name: formData.name,
        lastName: formData.lastName,
        sex: formData.sex,
        country: formData.country,
        roles: formData.roles.includes('Otro')
          ? [
              ...formData.roles.filter((role) => role !== 'Otro'),
              formData.otherRole,
            ]
          : formData.roles,
        interests: formData.interests.includes('Otro')
          ? [
              ...formData.interests.filter((interest) => interest !== 'Otro'),
              formData.otherInterest,
            ]
          : formData.interests,
        userName: formData.userName,
        profileCompleted: true,
        emailVerified, // Incluir el valor correcto
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Datos preparados para guardar:', userData);

      await saveUserData(userData);
      console.log('Datos guardados correctamente en Firestore.');

      console.log('Cerrando modal de registro y abriendo modal de éxito...');
      setIsRegisterModalOpen(false);
      setIsRegistrationSuccessModalOpen(true);

      console.log('Registro completado con éxito.');
    } catch (error) {
      console.error('Error durante el registro:', error);
      alert('Ocurrió un error al completar tu perfil. Inténtalo de nuevo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div
        className="bg-white-eske rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-y-auto max-h-[80vh]"
        style={{ marginTop: '20px' }}
      >
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-red-eske transition-colors duration-300"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 24 24"
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
            <label className="block text-[18px] font-medium text-black-eske mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
            />
          </div>

          <div>
            <label className="block text-[18px] font-medium text-black-eske mb-1">
              Apellidos
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
            />
          </div>

          <div>
            <label className="block text-[18px] font-medium text-black-eske mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[18px] font-medium text-black-eske mb-1">
              Sexo
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
            >
              <option value="">Selecciona una opción</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="no-binario">No binario</option>
            </select>
          </div>

          <div>            
            <div>
              <label className="block text-[18px] font-medium text-black-eske mb-1">
                País
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, country: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
              >
                <option value="">Selecciona una opción</option>
                {sortedCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <hr className="border-bluegreen-eske my-4" />
            <p className="text-[16px] font-medium text-bluegreen-eske text-center mb-6">
              {' '}
              La siguiente información será útil para ofrecerte un mejor
              servicio, acorde con tus intereses.
            </p>
          </div>

          <div>
            <label className="block text-[18px] font-medium text-black-eske mb-1">
              Roles
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="roles"
                  value="Candidatura"
                  checked={formData.roles.includes('Candidatura')}
                  onChange={handleRolesChange}
                  className="mr-2"
                />
                Candidatura
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="roles"
                  value="Consultoría o Asesoría"
                  checked={formData.roles.includes('Consultoría o Asesoría')}
                  onChange={handleRolesChange}
                  className="mr-2"
                />
                Consultoría o Asesoría
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="roles"
                  value="Integrante de equipo de campaña"
                  checked={formData.roles.includes(
                    'Integrante de equipo de campaña'
                  )}
                  onChange={handleRolesChange}
                  className="mr-2"
                />
                Integrante de equipo de campaña
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="roles"
                  value="Integrante de partido político"
                  checked={formData.roles.includes(
                    'Integrante de partido político'
                  )}
                  onChange={handleRolesChange}
                  className="mr-2"
                />
                Integrante de partido político
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="roles"
                  value="Servicio público"
                  checked={formData.roles.includes('Servicio público')}
                  onChange={handleRolesChange}
                  className="mr-2"
                />
                Servicio público
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="roles"
                  value="Academia"
                  checked={formData.roles.includes('Academia')}
                  onChange={handleRolesChange}
                  className="mr-2"
                />
                Academia
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="roles"
                  value="Otro"
                  checked={formData.roles.includes('Otro')}
                  onChange={handleRolesChange}
                  className="mr-2"
                />
                Otro
              </label>
              {formData.roles.includes('Otro') && (
                <input
                  type="text"
                  name="otherRole"
                  value={formData.otherRole}
                  onChange={handleChange}
                  placeholder="Especifica tu rol"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske-10"
                />
              )}
            </div>
          </div>

          <div>
            <hr className="border-bluegreen-eske my-4" />
            <label className="block text-[18px] font-medium text-black-eske mb-1">
              Temas de interés
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Análisis de datos"
                  checked={formData.interests.includes('Análisis de Datos')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Análisis de Datos
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Campañas institucionales"
                  checked={formData.interests.includes(
                    'Campañas Institucionales'
                  )}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Campañas Institucionales
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Comunicación de gobierno"
                  checked={formData.interests.includes(
                    'Comunicación de Gobierno'
                  )}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Comunicación de Gobierno
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Comunicación política"
                  checked={formData.interests.includes('Comunicación Política')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Comunicación Política
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Encuestas y muestreo"
                  checked={formData.interests.includes('Encuestas y Muestreo')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Encuestas y Muestreo
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Estrategia electoral"
                  checked={formData.interests.includes('Estrategia Electoral')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Estrategia Electoral
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Estrategia política"
                  checked={formData.interests.includes('Estrategia política')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Estrategia política
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Gerencia política"
                  checked={formData.interests.includes('Gerencia Electoral')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Gerencia Electoral
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Gobierno municipal"
                  checked={formData.interests.includes('Gobierno Municipal')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Gobierno Municipal
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Investigación cualitativa"
                  checked={formData.interests.includes(
                    'Investigación cualitativa'
                  )}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Investigación cualitativa
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Liderazgo y negociación"
                  checked={formData.interests.includes(
                    'Liderazgo de negociación'
                  )}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Liderazgo y negociación
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Marca política"
                  checked={formData.interests.includes('Marca política')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Marca política
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Marco jurídico-electoral"
                  checked={formData.interests.includes(
                    'Marco jurídico-electoral'
                  )}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Marco jurídico-electoral
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Marketing electoral"
                  checked={formData.interests.includes('Marketing Electoral')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Marketing Electoral
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Mrketing político digital"
                  checked={formData.interests.includes(
                    'Marketing Político Digital'
                  )}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Marketing Político Digital
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Opinión pública"
                  checked={formData.interests.includes('Opinión Pública')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Opinión Pública
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Participación ciudadana"
                  checked={formData.interests.includes(
                    'Participación Ciudadana'
                  )}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Participación Ciudadana
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Poder legislativo"
                  checked={formData.interests.includes('Poder Legislativo')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Poder Legislativo
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Políticas públicas"
                  checked={formData.interests.includes('Políticas Públicas')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Políticas Públicas
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Encuestas y muestreo"
                  checked={formData.interests.includes('Encuestas y Muestreo')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Encuestas y Muestreo
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Sociedad civil"
                  checked={formData.interests.includes('Sociedad Civil')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Sociedad Civil
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Storytelling"
                  checked={formData.interests.includes('Storytelling')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Storytelling
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Técnicas de análisis político"
                  checked={formData.interests.includes(
                    'Técnicas de Análisis Político'
                  )}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Técnicas de Análisis Político
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="interests"
                  value="Otro"
                  checked={formData.interests.includes('Otro')}
                  onChange={handleInterestsChange}
                  className="mr-2"
                />
                Otro
              </label>
              {formData.interests.includes('Otro') && (
                <input
                  type="text"
                  name="otherInterest"
                  value={formData.otherInterest}
                  onChange={handleChange}
                  placeholder="Especifica tu interés"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske-10"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-bluegreen-eske text-white-eske py-2 rounded hover:bg-bluegreen-70 transition-colors duration-300 cursor-pointer"
          >
            COMPLETAR REGISTRO
          </button>

          <p className="mt-4 text-[16px] text-black-eske text-center">
            Al registrarme acepto las{' '}
            <a
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske-60 underline cursor-pointer"
            >
              condiciones de uso y política de privacidad
            </a>{' '}
            de Eskemma.
          </p>

          <hr className="border-gray-300 my-4" />

          <p className="text-[16px] text-black-eske text-center">
            ¿Ya te has registrado?{' '}
            <a
              href="/login"
              className="text-blue-eske-60 underline cursor-pointer"
            >
              Inicia sesión
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
