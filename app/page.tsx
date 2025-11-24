// app/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

import Image from "next/image";
import { BlogPost } from "@/types/post.types";
import Button from "./components/Button";
import PropAnimation from "./components/componentsHome/PropAnimation";
import TeamModal from "./components/componentsHome/TeamModal";
import ScheduleDate from "./components/componentsHome/ScheduleDate";
import ResponseDate from "./components/componentsHome/ReponseDate";
import BenefitsSection from "./components/componentsHome/BenefitsSection";
import SuscriptionBasicModal from "./components/componentsHome/SuscriptionBasicModal";
import SuscriptionPremiumModal from "./components/componentsHome/SuscriptionPremiumModal";
import SuscriptionGrupalModal from "./components/componentsHome/SuscriptionGrupalModal";
import SuscriptionResponseModal from "./components/componentsHome/SucriptionResponseModal";
import FaqSection from "./components/componentsHome/FaqSection";

export default function HomePage() {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const isPublicMode = searchParams.get("public") === "true";
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateTime: "",
  });

  // ✅ AGREGAR: Estado para los posts del blog
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Estados para controlar la visibilidad de los modales de planes de suscripción
  const [isBasicSuscriptionModalOpen, setIsBasicSuscriptionModalOpen] =
    useState(false);
  const [isPremiumSuscriptionModalOpen, setIsPremiumSuscriptionModalOpen] =
    useState(false);
  const [isGrupalSuscriptionModalOpen, setIsGrupalSuscriptionModalOpen] =
    useState(false);
  const [isResponseSuscriptionModalOpen, setIsResponseSuscriptionModalOpen] =
    useState(false);

  const { user } = useAuth();

  const userName = "Usuario";

  // ✅ AGREGAR: useEffect para cargar los posts
  useEffect(() => {
    async function loadBlogPosts() {
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al cargar posts");
        }

        const posts = await response.json();

        // Filtrar solo posts publicados y tomar los primeros 3
        const publishedPosts = posts
          .filter((post: any) => post.status === "published")
          .slice(0, 3)
          .map((post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            category: post.category || "general",
            featureImage: post.featureImage,
            // ✅ Convertir string ISO a Date
            updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
            author: post.author,
            status: post.status,
            tags: post.tags || [],
          }));

        setBlogPosts(publishedPosts);
      } catch (error) {
        console.error("Error al cargar posts del blog:", error);
        // Mostrar mensaje más detallado
        if (error instanceof Error) {
          console.error("Detalles del error:", error.message);
        }
      } finally {
        setLoadingPosts(false);
      }
    }

    loadBlogPosts();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden w-full">
      {/* Hero Section */}
      <section className="relative min-h-[650px] max-sm:min-h-[50vh] w-full flex items-center justify-center overflow-hidden bg-bluegreen-eske">
        <Image
          src="/images/hero2.webp"
          alt="Hero Background"
          fill
          style={{ objectFit: "cover" }}
          className="object-cover max-sm:object-contain"
          priority
        />
        <div className="absolute inset-0 bg-bluegreen-eske opacity-20"></div>
        <div className="relative z-10 text-center text-white-eske px-4 sm:px-6 md:px-8 max-w-screen-xl mx-auto w-full">
          <h1 className="text-[48px] max-sm:text-2xl leading-tight font-bold">
            Consultoría política
          </h1>
          <h2 className="mt-8 max-sm:mt-4 text-[32px] max-sm:text-xl leading-[1.25] font-light">
            <span>Un ecosistema digital</span>
            <br />
            <span>para tu proyecto político</span>
          </h2>
          <div className="mt-[10vh] max-sm:mt-6 space-y-4 max-sm:space-y-1 text-[18px] max-sm:text-base leading-[1.15] font-normal">
            <p>Descubre tus ventajas competitivas.</p>
            <p>Te acompañamos con tecnología y datos.</p>
          </div>
        </div>
      </section>

      {/* Blog Section - ✅ REEMPLAZAR ESTA SECCIÓN COMPLETA */}
      <section className="bg-gray-eske-10 min-h-[580px] py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-12">
            Hoy en Eskemma
          </h2>

          {loadingPosts ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-eske-60">Cargando posts...</p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-eske-60">
                No hay posts disponibles
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col items-center text-center bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
                >
                  {/* Imagen del Post */}
                  {post.featureImage && (
                    <img
                      src={post.featureImage}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  {/* Título del Post */}
                  <h3 className="text-xl text-bluegreen-eske-60 font-semibold mb-2 hover:text-bluegreen-eske transition-colors duration-300">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  {/* Resumen del Post */}
                  <p className="text-[16px] font-light text-gray-eske-90 mb-4 line-clamp-3">
                    {post.content.substring(0, 160)}...
                  </p>

                  {/* Fecha y Autor */}
                  <div className="flex justify-between w-full text-sm text-gray-700 mb-4 px-2">
                    <small className="text-gray-eske-60">
                      {post.updatedAt.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </small>
                    <small className="text-bluegreen-eske font-medium">
                      {post.author?.displayName || "Desconocido"}
                    </small>
                  </div>

                  {/* Enlace "Leer completo" */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px]"
                  >
                    Leer completo →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Información Relevante Section */}
      <section className="bg-white-eske min-h-[500px] py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          {/* Título de la Sección */}
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-12">
            Información relevante
          </h2>

          {/* Entradas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Entrada 1 */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/images/part_comparativa_circuns.gif" // Ruta relativa dentro de la carpeta public/
                alt="Gráfica 1"
                width={600} // Ancho fijo para imágenes responsivas
                height={338} // Altura fija para mantener proporción (16:9)
                className="w-full h-auto object-contain rounded-lg mb-4"
                unoptimized={true} // Indicar que no se optimice la imagen
              />
              <p className="text-[16px] text-gray mb-4">
                Participación electoral por circunscripción <br />
                en las elecciones federales de México 2006-2021
              </p>
              <a
                href="/monitor" // Enlace a la página Monitor
                className="text-blue-eske hover:text-blue-eske-70 font-medium text-[14px]"
              >
                Consultar información
              </a>
            </div>

            {/* Entrada 2 */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/images/part_tipo_eleccion.gif" // Ruta relativa dentro de la carpeta public/
                alt="Gráfica 2"
                width={600} // Ancho fijo para imágenes responsivas
                height={338} // Altura fija para mantener proporción (16:9)
                className="w-full h-auto object-contain rounded-lg mb-4"
                unoptimized={true} // Indicar que no se optimice la imagen
              />
              <p className="text-[16px] text-gray mb-4">
                ¿Por qué la participación electoral aumenta en las <br />
                elecciones presidenciales en México?
              </p>
              <a
                href="/monitor" // Enlace a la página Monitor
                className="text-blue-eske hover:text-blue-eske-70 font-medium text-[14px]"
              >
                Consultar información
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Propuesta Section */}
      <section className="bg-bluegreen-eske min-h-[500px] py-18 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl flex flex-col md:flex-row items-center justify-between">
          {/* Animación Izquierda */}
          <div className="w-full md:w-1/3 flex justify-center">
            {/* Eliminamos ml-10 y usamos justify-center */}
            <PropAnimation />
          </div>

          {/* Texto Centrado */}
          <div className="w-full md:w-1/2 text-center text-white-eske mt-8 md:mt-0">
            <h2 className="text-[24px] block mb-10">
              El tiempo es el recurso más valioso.
            </h2>
            <p className="text-[18px] font-light mb-4 leading-relaxed">
              <span className="block">Nunca es demasiado pronto.</span>
              <span className="block">Comencemos a planear tu estrategia.</span>
            </p>
            <p className="mt-6 text-[18px] font-light leading-relaxed">
              <span className="block">Haz que cada decisión sea efectiva</span>
              <span className="block">en el contexto de tu proyecto.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Sobre Nosotros Section */}
      <section className="bg-white-eske py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl text-center">
          {/* Subtítulo */}
          <h2 className="text-3xl font-bold text-bluegreen-eske mb-6">
            Sobre nosotros
          </h2>

          {/* Párrafo Principal */}
          <p className="text-xl font-normal text-black-eske mb-6">
            Nuestro propósito es profesionalizar la vida pública.
          </p>

          {/* Recuadro para el Video */}
          <div className="relative w-full max-w-[680px] mx-auto overflow-hidden shadow-lg mb-8">
            {/* Contenedor del video con relación de aspecto adaptable */}
            <div className="relative md:aspect-video md:h-auto h-56 sm:h-64">
              <iframe
                src="https://drive.google.com/file/d/1b8qZHWHYyID5Q-PN26pEbhCUySrilivE/preview"
                title="Video sobre nosotros"
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Modal de Equipo */}
          <TeamModal />

          {/* Párrafo Adicional */}
          <p className="mt-12 text-[18px] font-normal text-gray-700 mb-8">
            Podemos colaborar desde ahora con una asesoría gratuita de 30
            minutos.
          </p>

          {/* Botón "AGENDAR ASESORÍA GRATUITA" */}
          <div className="text-center">
            <Button
              label="AGENDAR ASESORÍA GRATUITA"
              variant="secondary"
              action="openScheduleModal"
              onClick={() => setIsScheduleModalOpen(true)} // Función personalizada
            />
          </div>

          {/* Botón "AGENDAR ASESORÍA GRATUITA" 
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-block bg-orange-eske text-white-eske text-10px font-bold uppercase px-8 py-4 rounded-lg shadow-md hover:bg-orange-70 transition-all duration-300 ease-in-out cursor-pointer"
          >
            AGENDAR ASESORÍA GRATUITA
          </button>*/}

          {/* Modal de Agendar Asesoría */}
          <ScheduleDate
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            onSubmitSuccess={(data) => {
              setFormData(data); // Almacenar los datos del formulario
              setIsScheduleModalOpen(false); // Cerrar el modal de agendamiento
              setIsResponseModalOpen(true); // Abrir el modal de confirmación
            }}
          />

          {/* Modal de Confirmación */}
          {isResponseModalOpen && (
            <ResponseDate
              isOpen={isResponseModalOpen}
              onClose={() => setIsResponseModalOpen(false)}
              fullName={formData.fullName}
              email={formData.email}
              dateTime={formData.dateTime}
            />
          )}
        </div>
      </section>

      {/* Sección - Beneficios */}
      <BenefitsSection />

      {/* Sección - Testimonios */}
      <section className="bg-gray-eske-10 min-h-[600px] py-20 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          {/* Contenedor de Testimonios */}
          <div className="space-y-12">
            {/* Testimonio 1 */}
            <div className="flex items-center space-x-8">
              {/* Avatar (Primera Columna) */}
              <div className="w-16 h-16 rounded-full bg-blue-60 flex items-center justify-center overflow-hidden">
                <img
                  src="https://untitledui.com/images/avatars/brianna-ware " // Ruta de la imagen del usuario
                  alt="Usuario 1"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Texto (Segunda Columna) */}
              <blockquote className="text-12px text-black-eske font-light max-w-[70%]">
                "Cuando pensé que no había nada más que hacer en mi candidatura
                decidí utilizar el <i>Moddulo</i> de Eskemma. Descubrí que había
                muchas opciones para competir con fuerza."
              </blockquote>
            </div>

            {/* Testimonio 2 */}
            <div className="flex items-center justify-end space-x-8">
              {/* Texto (Primera Columna) */}
              <blockquote className="text-12px text-black-eske font-light max-w-[70%] text-right">
                "En los cursos de comunicación política siempre hablan de
                estrategia, pero hasta ahora sé cómo hacerlo en territorio, no
                sólo en teoría."
              </blockquote>
              {/* Avatar (Segunda Columna) */}
              <div className="w-16 h-16 rounded-full bg-orange-60 flex items-center justify-center overflow-hidden">
                <img
                  src="https://untitledui.com/images/avatars/drew-cano " // Ruta de la imagen del usuario
                  alt="Usuario 2"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Testimonio 3 */}
            <div className="flex items-center space-x-8">
              {/* Avatar (Primera Columna) */}
              <div className="w-16 h-16 rounded-full bg-green-60 flex items-center justify-center overflow-hidden">
                <img
                  src="https://untitledui.com/images/avatars/ethan-valdez " // Ruta de la imagen del usuario
                  alt="Usuario 3"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Texto (Segunda Columna) */}
              <blockquote className="text-12px text-black-eske font-light max-w-[70%]">
                "Con su ayuda logré analizar mejor la información y saber cómo
                aventajar a los otros partidos. Lo mejor es que lo hice yo mismo
                y me ahorré una lana."
              </blockquote>
            </div>

            {/* Testimonio 4 */}
            <div className="flex items-center justify-end space-x-8">
              {/* Texto (Primera Columna) */}
              <blockquote className="text-12px text-black-eske font-light max-w-[70%] text-right">
                "Pensé que estos servicios sólo eran para grandes campañas.
                Participé en una elección local en 2024 y pude utilizar mucha de
                la ayuda que me brindaron."
              </blockquote>
              {/* Avatar (Segunda Columna) */}
              <div className="w-16 h-16 rounded-full bg-red-60 flex items-center justify-center overflow-hidden">
                <img
                  src="https://untitledui.com/images/avatars/ava-bentley " // Ruta de la imagen del usuario
                  alt="Usuario 4"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección - Planes de suscripción */}
      <section
        className="bg-white-eske min-h-[800px] py-18 px-4 sm:px-6 md:px-8"
        style={{ backgroundColor: "var(--White-eske)" }}
      >
        <div className="w-[90%] mx-auto max-w-screen-xl">
          {/* Título de la Sección */}
          <h2 className="text-3xl font-bold text-center text-bluegreen-eske mb-6">
            Selecciona el mejor plan para tu proyecto político
          </h2>

          {/* Párrafo Descriptivo */}
          <p className="mt-12 text-2xl font-light text-center text-black-eske mb-24 max-w-[600px] mx-auto">
            <span>Suscríbete y accede al</span>
            <br />
            <span>ecosistema digital de Eskemma</span>
          </p>

          {/* Contenedor de las Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 - Sólo un producto (Plan Básico) */}
            <div className="bg-white-10 rounded-lg shadow-lg p-6 text-center relative overflow-visible w-full max-w-[350px] mx-auto flex flex-col order-2 sm:order-none">
              {/* Encabezado con fondo white-eske */}
              <div
                className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-white-eske px-6 py-2 border border-bluegreen-eske text-black-eske text-10px font-medium z-10 whitespace-nowrap"
                style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)" }}
              >
                Sólo un producto
              </div>

              {/* Contenido de la card */}
              <div className="flex flex-col flex-grow">
                {/* Título del Plan */}
                <h3 className="text-xl font-semibold text-bluegreen-eske mt-6 mb-4">
                  Plan Básico
                </h3>

                {/* Detalles del Plan */}
                <div className="text-left text-[16px] text-black-eske space-y-2 flex-grow">
                  <p>Mensual</p>
                  <p>Para 1 persona</p>
                  <p className="mt-4 text-10px">
                    <strong>Obtienes:</strong>
                  </p>
                  <p>
                    Acceso a un producto: cursos online, Sefix, Moddulo o
                    Monitor
                  </p>
                  <p>Asistencia online 24/7</p>
                  <p>Acceso total a eBooks y plantillas</p>
                </div>

                {/* Bandera y Precio */}
                <div className="flex items-center justify-start mt-6 mb-6">
                  {/* Bandera */}
                  <div className="w-8 h-8 rounded-full bg-gray-20 flex items-center justify-center mr-4">
                    <img
                      src="https://www.banderas-mundo.es/data/flags/w1160/mx.webp "
                      alt="Bandera de México"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {/* Precio */}
                  <p className="text-[16px] font-bold text-black-eske">
                    $ 2,000 MX / mes
                  </p>
                </div>

                {/* Botón Suscribirme */}
                <button
                  onClick={() => setIsBasicSuscriptionModalOpen(true)}
                  className="mt-auto w-full bg-white-eske text-gray text-10px font-bold uppercase py-3 rounded-lg shadow-md border border-bluegreen-eske hover:bg-bluegreen-eske hover:text-white-eske transition-all duration-300 ease-in-out cursor-pointer"
                >
                  SUSCRIBIRME
                </button>
              </div>
            </div>

            {/* Card 2 - Todo Eskemma (Plan Premium) */}
            <div className="bg-white-10 rounded-lg shadow-lg p-6 text-center relative overflow-visible w-full max-w-[350px] mx-auto flex flex-col order-1 sm:order-none">
              {/* Encabezado con fondo black-eske */}
              <div
                className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-black-eske px-6 py-2 border border-bluegreen-eske text-white-eske text-10px font-medium z-10 whitespace-nowrap"
                style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)" }}
              >
                Todo Eskemma
              </div>

              {/* Contenido de la card */}
              <div className="flex flex-col flex-grow">
                {/* Título del Plan */}
                <h3 className="text-xl font-semibold text-bluegreen-eske mt-6 mb-4">
                  Plan Premium
                </h3>

                {/* Detalles del Plan */}
                <div className="text-left text-[16px] text-black-eske space-y-2 flex-grow">
                  <p>Mensual</p>
                  <p>Para 1 persona</p>
                  <p className="mt-4 text-[16px]">
                    <strong>Obtienes Plan Básico +</strong>
                  </p>
                  <p>Acceso total al ecosistema de Eskemma</p>
                  <p>Acceso a recursos exclusivos para tu proyecto político</p>
                  <p>1 sesión de asesoría gratuita al mes</p>
                </div>

                {/* Bandera y Precio */}
                <div className="flex items-center justify-start mt-6 mb-6">
                  {/* Bandera */}
                  <div className="w-8 h-8 rounded-full bg-gray-20 flex items-center justify-center mr-4">
                    <img
                      src="https://www.banderas-mundo.es/data/flags/w1160/mx.webp "
                      alt="Bandera de México"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {/* Precio */}
                  <p className="text-[16px] font-bold text-black-eske">
                    $ 4,000 MX / mes
                  </p>
                </div>

                {/* Botón Suscribirme */}
                <button
                  onClick={() => setIsPremiumSuscriptionModalOpen(true)}
                  className="mt-auto w-full bg-orange-eske text-white-eske text-10px font-bold uppercase py-3 rounded-lg shadow-md border border-bluegreen-eske hover:bg-bluegreen-eske hover:text-white-eske transition-all duration-300 ease-in-out cursor-pointer"
                >
                  SUSCRIBIRME
                </button>
              </div>
            </div>

            {/* Card 3 - Trabajo colaborativo (Plan Grupal) */}
            <div className="bg-white-10 rounded-lg shadow-lg p-6 text-center relative overflow-visible w-full max-w-[350px] mx-auto flex flex-col order-3 sm:order-none">
              {/* Encabezado con fondo white-eske */}
              <div
                className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-white-eske px-6 py-2 border border-bluegreen-eske text-black text-10px font-medium z-10 whitespace-nowrap"
                style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)" }}
              >
                Trabajo Colaborativo
              </div>

              {/* Contenido de la card */}
              <div className="flex flex-col flex-grow">
                {/* Título del Plan */}
                <h3 className="text-xl font-semibold text-bluegreen-eske mt-6 mb-4">
                  Plan Grupal
                </h3>

                {/* Detalles del Plan */}
                <div className="text-left text-[16px] text-black-eske space-y-2 flex-grow">
                  <p>Mensual</p>
                  <p>Para 6 personas</p>
                  <p className="mt-4 text-[16px]">
                    <strong>Obtienes Plan Premium +</strong>
                  </p>
                  <p>Versión colaborativa</p>
                  <p>Acceso a recursos exclusivos para grupos</p>
                  <p>2 sesiones de asesoría gratuita al mes</p>
                </div>

                {/* Bandera y Precio */}
                <div className="flex items-center justify-start mt-6 mb-6">
                  {/* Bandera */}
                  <div className="w-8 h-8 rounded-full bg-gray-20 flex items-center justify-center mr-4">
                    <img
                      src="https://www.banderas-mundo.es/data/flags/w1160/mx.webp "
                      alt="Bandera de México"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {/* Precio */}
                  <p className="text-[16px] font-bold text-black-eske">
                    $ 20,000 MX / mes
                  </p>
                </div>

                {/* Botón Suscribirme */}
                <button
                  onClick={() => setIsGrupalSuscriptionModalOpen(true)}
                  className="mt-auto w-full bg-white-eske text-gray text-10px font-bold uppercase py-3 rounded-lg shadow-md border border-bluegreen-eske hover:bg-bluegreen-eske hover:text-white-eske transition-all duration-300 ease-in-out cursor-pointer"
                >
                  SUSCRIBIRME
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODALES */}
      {/* Modal de Suscripción (Plan Básico) */}
      <SuscriptionBasicModal
        isOpen={isBasicSuscriptionModalOpen}
        onClose={() => setIsBasicSuscriptionModalOpen(false)}
        onPaymentSuccess={() => {
          setIsBasicSuscriptionModalOpen(false); // Cerrar el modal de suscripción
          setIsResponseSuscriptionModalOpen(true); // Abrir el modal de respuesta
        }}
      />

      {/* Modal de Suscripción (Plan Premium) */}
      <SuscriptionPremiumModal
        isOpen={isPremiumSuscriptionModalOpen}
        onClose={() => setIsPremiumSuscriptionModalOpen(false)}
        onPaymentSuccess={() => {
          setIsPremiumSuscriptionModalOpen(false); // Cerrar el modal de suscripción
          setIsResponseSuscriptionModalOpen(true); // Abrir el modal de respuesta
        }}
      />

      {/* Modal de Suscripción (Plan Grupal) */}
      <SuscriptionGrupalModal
        isOpen={isGrupalSuscriptionModalOpen}
        onClose={() => setIsGrupalSuscriptionModalOpen(false)}
        onPaymentSuccess={() => {
          setIsGrupalSuscriptionModalOpen(false); // Cerrar el modal de suscripción
          setIsResponseSuscriptionModalOpen(true); // Abrir el modal de respuesta
        }}
      />

      {/* Modal de Respuesta después de la suscripción */}
      <SuscriptionResponseModal
        isOpen={isResponseSuscriptionModalOpen}
        onClose={() => setIsResponseSuscriptionModalOpen(false)}
        userName={userName} // Pasar el nombre del usuario (valor estático por ahora)
      />

      {/* Sección - FAQ */}
      <FaqSection />

      {/* Enlaces Rápidos Section */}
      <section
        className="bg-white-eske min-h-[500px] py-16 px-4 sm:px-6 md:px-8"
        style={{ backgroundColor: "var(--white-eske)" }}
      >
        <div className="w-[90%] mx-auto max-w-screen-xl">
          {/* Título de la Sección */}
          <h2 className="text-3xl font-bold text-center text-bluegreen-eske mb-14">
            Enlaces rápidos
          </h2>

          {/* Grilla de enlaces */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Moddulo */}
            <Link
              href="/moddulo"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-60 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Moddulo.svg" // Ruta relativa al archivo en la carpeta public/
                alt="Moddulo"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110" // Tamaño reducido para mobile
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Moddulo
              </span>
            </Link>

            {/* Sefix */}
            <Link
              href="/sefix"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-blue-80 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Sefix.svg" // Ruta relativa al archivo en la carpeta public/
                alt="Sefix"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110" // Tamaño reducido para mobile
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Sefix
              </span>
            </Link>

            {/* Consultoría */}
            <Link
              href="/servicios"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-blue-80 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Consultoria.svg" // Ruta relativa al archivo en la carpeta public/
                alt="Consultoría"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110" // Tamaño reducido para mobile
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Servicios
              </span>
            </Link>

            {/* Cursos */}
            <Link
              href="/cursos"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-blue-80 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Cursos.svg" // Ruta relativa al archivo en la carpeta public/
                alt="Cursos"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110" // Tamaño reducido para mobile
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Cursos
              </span>
            </Link>

            {/* Monitor */}
            <Link
              href="/monitor"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-blue-80 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Monitor.svg" // Ruta relativa al archivo en la carpeta public/
                alt="Monitor"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110" // Tamaño reducido para mobile
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-blugreen-80">
                Monitor
              </span>
            </Link>

            {/* Blog */}
            <Link
              href="/blog"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-blugreen-60 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Blog.svg" // Ruta relativa al archivo en la carpeta public/
                alt="Software"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110" // Tamaño reducido para mobile
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-60">
                El baúl de Fouché
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
