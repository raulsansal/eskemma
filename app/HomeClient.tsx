// app/HomeClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { BlogPost } from "@/types/post.types";

interface HomeClientProps {
  blogPosts: BlogPost[];
}

export default function HomeClient({ blogPosts }: HomeClientProps) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateTime: "",
  });

  const [isBasicSuscriptionModalOpen, setIsBasicSuscriptionModalOpen] =
    useState(false);
  const [isPremiumSuscriptionModalOpen, setIsPremiumSuscriptionModalOpen] =
    useState(false);
  const [isGrupalSuscriptionModalOpen, setIsGrupalSuscriptionModalOpen] =
    useState(false);
  const [isResponseSuscriptionModalOpen, setIsResponseSuscriptionModalOpen] =
    useState(false);

  // ✅ NUEVO: Estado para controlar carga del video
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const userName = "Usuario";

  // ✅ NUEVO: Timeout de seguridad - Si el video no carga en 10s, oculta spinner
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isVideoLoading) {
        setIsVideoLoading(false);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timeout);
  }, [isVideoLoading]);

  return (
    <main className="min-h-screen overflow-x-hidden w-full">
      {/* Hero Section */}
      <section className="relative min-h-[650px] max-sm:min-h-[50vh] w-full flex items-center justify-center overflow-hidden bg-bluegreen-eske">
        <Image
          src="/images/hero2.webp"
          alt=""
          fill
          style={{ objectFit: "cover" }}
          className="object-cover max-sm:object-contain"
          priority
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-bluegreen-eske opacity-20"
          aria-hidden="true"
        ></div>
        <div className="relative z-10 text-center text-white-eske px-4 sm:px-6 md:px-8 max-w-screen-xl mx-auto w-full">
          <h1 className="text-[48px] max-sm:text-2xl leading-tight font-bold">
            Consultoría política
          </h1>
          <p className="mt-8 max-sm:mt-4 text-[32px] max-sm:text-xl leading-[1.25] font-light">
            <span>Un ecosistema digital</span>
            <br />
            <span>para tu proyecto político</span>
          </p>
          <div className="mt-[10vh] max-sm:mt-6 space-y-4 max-sm:space-y-1 text-[18px] max-sm:text-base leading-[1.15] font-normal">
            <p>Descubre tus ventajas competitivas.</p>
            <p>Te acompañamos con tecnología y datos.</p>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section
        className="bg-gray-eske-10 min-h-[580px] py-12 max-sm:py-8 px-4 sm:px-6 md:px-8"
        aria-labelledby="blog-heading"
      >
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2
            id="blog-heading"
            className="text-3xl max-sm:text-xl font-semibold text-center text-bluegreen-eske mb-12 max-sm:mb-8"
          >
            Hoy en Eskemma
          </h2>

          {blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl max-sm:text-base text-gray-eske-60">
                No hay posts disponibles
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-sm:gap-4">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col items-center text-center bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 max-sm:p-4 min-h-full"
                >
                  {/* Imagen */}
                  {post.featureImage && (
                    <img
                      src={post.featureImage}
                      alt={`Imagen destacada: ${post.title}`}
                      className="w-full h-48 max-sm:h-32 object-cover rounded-lg mb-4 max-sm:mb-2"
                    />
                  )}

                  {/* Título - con flex-grow para ocupar espacio variable */}
                  <h3 className="text-xl max-sm:text-base text-bluegreen-eske-60 font-semibold mb-2 max-sm:mb-1 hover:text-bluegreen-eske transition-colors duration-300 flex-grow-0">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="focus-ring-primary rounded"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  {/* Contenido - con flex-grow para ocupar espacio variable */}
                  <p className="text-[16px] max-sm:text-sm font-light text-gray-eske-90 mb-4 max-sm:mb-2 line-clamp-3 flex-grow">
                    {post.content.substring(0, 160)}...
                  </p>

                  {/* Fecha y autor */}
                  <div className="flex justify-between w-full text-sm max-sm:text-xs text-gray-700 mb-4 max-sm:mb-2 px-2 max-sm:px-1">
                    <time
                      className="text-gray-eske-60"
                      dateTime={post.updatedAt.toISOString()}
                    >
                      {post.updatedAt.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span className="text-bluegreen-eske font-medium">
                      {post.author?.displayName || "Desconocido"}
                    </span>
                  </div>

                  {/* Botón - con mt-auto para empujarlo al fondo */}
                  <div className="mt-auto w-full max-w-[200px]">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 max-sm:py-1.5 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px] max-sm:text-xs focus-ring-light"
                    >
                      Leer completo →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Información Relevante Section */}
      <section
        className="bg-white-eske min-h-[500px] py-12 max-sm:py-8 px-4 sm:px-6 md:px-8"
        aria-labelledby="info-heading"
      >
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2
            id="info-heading"
            className="text-3xl max-sm:text-xl font-semibold text-center text-bluegreen-eske mb-12 max-sm:mb-8"
          >
            Información relevante
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-sm:gap-4">
            {/* Card 1 */}
            <div className="flex flex-col items-center text-center min-h-full">
              <Image
                src="/images/part_comparativa_circuns.gif"
                alt="Gráfica animada de participación electoral por circunscripción en México 2006-2021"
                width={600}
                height={338}
                className="w-full h-auto object-contain rounded-lg mb-4 max-sm:mb-2"
                unoptimized={true}
              />
              <p className="text-[16px] max-sm:text-sm text-gray mb-4 max-sm:mb-2 flex-grow">
                Participación electoral por circunscripción{" "}
                <br className="max-sm:hidden" />
                en las elecciones federales de México 2006-2021
              </p>

              {/* Wrapper del botón con mt-auto para empujarlo al fondo */}
              <div className="mt-auto w-full max-w-[250px]">
                <Link
                  href="/monitor"
                  className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 max-sm:py-1.5 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px] max-sm:text-xs focus-ring-light"
                >
                  Consultar información →
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-center text-center min-h-full">
              <Image
                src="/images/part_tipo_eleccion.gif"
                alt="Gráfica animada de participación electoral por tipo de elección en México"
                width={600}
                height={338}
                className="w-full h-auto object-contain rounded-lg mb-4 max-sm:mb-2"
                unoptimized={true}
              />
              <p className="text-[16px] max-sm:text-sm text-gray mb-4 max-sm:mb-2 flex-grow">
                ¿Por qué la participación electoral aumenta en las{" "}
                <br className="max-sm:hidden" />
                elecciones presidenciales en México?
              </p>

              {/* Wrapper del botón con mt-auto para empujarlo al fondo */}
              <div className="mt-auto w-full max-w-[250px]">
                <Link
                  href="/monitor"
                  className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 max-sm:py-1.5 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px] max-sm:text-xs focus-ring-light"
                >
                  Consultar información →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Propuesta Section */}
      <section
        className="bg-bluegreen-eske min-h-[500px] max-sm:min-h-[400px] py-18 max-sm:py-12 px-4 sm:px-6 md:px-8"
        aria-labelledby="propuesta-heading"
      >
        <div className="w-[90%] mx-auto max-w-screen-xl flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/3 flex justify-center">
            <PropAnimation />
          </div>

          <div className="w-full md:w-1/2 text-center text-white-eske mt-8 md:mt-0">
            <h2
              id="propuesta-heading"
              className="text-[24px] max-sm:text-lg block mb-8 max-sm:mb-6"
            >
              El tiempo es el recurso más valioso.
            </h2>
            <p className="text-[18px] max-sm:text-base font-light mb-4 max-sm:mb-3 leading-relaxed">
              <span className="block">Nunca es demasiado pronto.</span>
              <span className="block">Comencemos a planear tu estrategia.</span>
            </p>
            <p className="mt-6 max-sm:mt-4 text-[18px] max-sm:text-base font-light leading-relaxed max-sm:hidden">
              <span className="block">Haz que cada decisión sea efectiva</span>
              <span className="block">en el contexto de tu proyecto.</span>
            </p>

            {/* Párrafo Adicional */}
            <p className="text-[18px] max-sm:text-base font-light mb-4 max-sm:mb-3 leading-relaxed">
              <span className="mt-6 block">
                Podemos colaborar desde ahora con una{" "}
              </span>
              <span className="block">
                asesoría gratuita de 30 minutos.
              </span>
            </p>

            {/* Botón "AGENDAR ASESORÍA GRATUITA" */}
            <div className="text-center mt-6 max-w-[300px] mx-auto">
              <Button
                label="AGENDAR ASESORÍA GRATUITA"
                variant="secondary"
                onClick={() => setIsScheduleModalOpen(true)}
              />
            </div>

            {/* Modal de Agendar Asesoría */}
            <ScheduleDate
              isOpen={isScheduleModalOpen}
              onClose={() => setIsScheduleModalOpen(false)}
              onSubmitSuccess={(data) => {
                setFormData(data);
                setIsScheduleModalOpen(false);
                setIsResponseModalOpen(true);
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
        </div>
      </section>

      {/* Sobre Nosotros Section - CON SPINNER DE CARGA */}
      <section
        className="bg-white-eske py-12 max-sm:py-8 px-4 sm:px-6 md:px-8"
        aria-labelledby="about-heading"
      >
        <div className="w-[90%] mx-auto max-w-screen-xl text-center">
          {/* Subtítulo */}
          <h2
            id="about-heading"
            className="text-3xl max-sm:text-xl font-bold text-bluegreen-eske mb-6 max-sm:mb-4"
          >
            Sobre nosotros
          </h2>

          {/* Párrafo Principal */}
          <p className="text-xl max-sm:text-base font-normal text-black-eske mb-6 max-sm:mb-4">
            Nuestro propósito es profesionalizar la vida pública.
          </p>

          {/* Recuadro para el Video - CON SPINNER */}
          <div className="relative w-full max-w-[680px] mx-auto overflow-hidden shadow-lg mb-8 max-sm:mb-6 rounded-lg bg-black">            
            {isVideoLoading && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black"
                aria-live="polite"
              >
                {/* Spinner animado */}
                <div className="w-12 h-12 max-sm:w-10 max-sm:h-10 border-4 border-bluegreen-eske/30 border-t-bluegreen-eske rounded-full animate-spin"></div>
                
                {/* Texto de carga (oculto para lectores de pantalla) */}
                <span className="sr-only">Cargando video de presentación</span>
                
                {/* Texto visible (opcional) */}
                <p className="mt-4 text-white-eske text-sm max-sm:text-xs font-light">
                  Cargando video...
                </p>
              </div>
            )}

            <div className="relative aspect-video w-full overflow-hidden">
              <iframe
                src="https://drive.google.com/file/d/1b8qZHWHYyID5Q-PN26pEbhCUySrilivE/preview"
                title="Video de presentación de Eskemma - Sobre nosotros"
                className="absolute left-0 w-full video-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                // ✅ Cuando el iframe carga, oculta el spinner
                onLoad={() => setIsVideoLoading(false)}
              ></iframe>

              <style jsx>{`
                /* Desktop: Sin cambios (valores originales) */
                .video-iframe {
                  top: 0;
                  height: 100%;
                  border: none;
                  /* Fade-in suave del video */
                  opacity: ${isVideoLoading ? 0 : 1};
                  transition: opacity 0.5s ease;
                }

                /* Mobile: Valores adaptativos con clamp() */
                @media (max-width: 640px) {
                  .video-iframe {
                    height: clamp(130%, 135%, 140%);
                    top: clamp(-20%, -17.5%, -15%);
                  }
                }
              `}</style>
            </div>
          </div>

          {/* Modal de Equipo */}
          <TeamModal />
        </div>
      </section>

      {/* Sección - Beneficios */}
      <BenefitsSection />

      {/* Sección - Testimonios */}
      <section
        className="bg-gray-eske-10 min-h-[600px] max-sm:min-h-[400px] py-20 max-sm:py-12 px-4 sm:px-6 md:px-8"
        aria-labelledby="testimonials-heading"
      >
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 id="testimonials-heading" className="sr-only">
            Testimonios de clientes
          </h2>

          {/* Contenedor de Testimonios */}
          <div className="space-y-12 max-sm:space-y-8">
            {/* Testimonio 1 */}
            <figure className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8 space-y-4 sm:space-y-0">
              {/* Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-60 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="https://untitledui.com/images/avatars/brianna-ware"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Texto */}
              <blockquote className="text-[16px] max-sm:text-sm text-black-eske font-light text-center sm:text-left w-full sm:max-w-[70%]">
                <p>
                  "Cuando pensé que no había nada más que hacer en mi
                  candidatura decidí utilizar el <em>Moddulo</em> de Eskemma.
                  Descubrí que había muchas opciones para competir con fuerza."
                </p>
              </blockquote>
            </figure>

            {/* Testimonio 2 */}
            <figure className="flex flex-col sm:flex-row-reverse items-center sm:items-start sm:space-x-reverse sm:space-x-8 space-y-4 sm:space-y-0">
              {/* Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-60 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="https://untitledui.com/images/avatars/drew-cano"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Texto */}
              <blockquote className="text-[16px] max-sm:text-sm text-black-eske font-light text-center sm:text-right w-full sm:max-w-[70%]">
                <p>
                  "En los cursos de comunicación política siempre hablan de
                  estrategia, pero hasta ahora sé cómo hacerlo en territorio, no
                  sólo en teoría."
                </p>
              </blockquote>
            </figure>

            {/* Testimonio 3 */}
            <figure className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8 space-y-4 sm:space-y-0">
              {/* Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-60 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="https://untitledui.com/images/avatars/ethan-valdez"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Texto */}
              <blockquote className="text-[16px] max-sm:text-sm text-black-eske font-light text-center sm:text-left w-full sm:max-w-[70%]">
                <p>
                  "Con su ayuda logré analizar mejor la información y saber cómo
                  aventajar a los otros partidos. Lo mejor es que lo hice yo
                  mismo y me ahorré una lana."
                </p>
              </blockquote>
            </figure>

            {/* Testimonio 4 */}
            <figure className="flex flex-col sm:flex-row-reverse items-center sm:items-start sm:space-x-reverse sm:space-x-8 space-y-4 sm:space-y-0">
              {/* Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-60 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="https://untitledui.com/images/avatars/ava-bentley"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Texto */}
              <blockquote className="text-[16px] max-sm:text-sm text-black-eske font-light text-center sm:text-right w-full sm:max-w-[70%]">
                <p>
                  "Pensé que estos servicios sólo eran para grandes campañas.
                  Participé en una elección local en 2024 y pude utilizar mucha
                  de la ayuda que me brindaron."
                </p>
              </blockquote>
            </figure>
          </div>
        </div>
      </section>

      {/* Sección - Planes de suscripción */}
      <section
        id="suscripciones"
        className="bg-white-eske min-h-[800px] py-18 max-sm:py-12 px-4 sm:px-6 md:px-8"
        aria-labelledby="subscriptions-heading"
      >
        <div className="w-[90%] mx-auto max-w-screen-xl">
          {/* Título de la Sección */}
          <h2
            id="subscriptions-heading"
            className="text-3xl max-sm:text-xl font-bold text-center text-bluegreen-eske mb-6 max-sm:mb-4"
          >
            Selecciona el mejor plan para tu proyecto político
          </h2>

          {/* Párrafo Descriptivo */}
          <p className="mt-12 max-sm:mt-6 text-2xl max-sm:text-lg font-light text-center text-black-eske mb-24 max-sm:mb-12 max-w-[600px] mx-auto">
            <span>Suscríbete y accede al</span>
            <br />
            <span>ecosistema digital de Eskemma</span>
          </p>

          {/* Contenedor de las Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-sm:gap-6">
            {/* Card 1 - Sólo un producto (Plan Básico) */}
            <article className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 max-sm:p-4 text-center relative overflow-visible w-full max-w-[350px] mx-auto flex flex-col order-2 sm:order-none">
              {/* Encabezado con fondo white-eske */}
              <div
                className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-white-eske px-6 max-sm:px-4 py-2 max-sm:py-1 border border-bluegreen-eske text-black-eske text-[14px] max-sm:text-xs font-medium z-10 whitespace-nowrap"
                style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)" }}
                aria-hidden="true"
              >
                Sólo un producto
              </div>

              {/* Contenido de la card */}
              <div className="flex flex-col flex-grow">
                {/* Título del Plan */}
                <h3 className="text-xl max-sm:text-lg font-semibold text-bluegreen-eske mt-6 max-sm:mt-4 mb-4 max-sm:mb-3">
                  Plan Básico
                </h3>

                {/* Detalles del Plan */}
                <div className="text-left text-[16px] max-sm:text-sm text-black-eske space-y-2 max-sm:space-y-1 flex-grow">
                  <p>Mensual</p>
                  <p>Para 1 persona</p>
                  <p className="mt-4 max-sm:mt-2 text-[10px] max-sm:text-[9px]">
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
                <div className="flex items-center justify-start mt-6 max-sm:mt-4 mb-6 max-sm:mb-4">
                  {/* Bandera */}
                  <div className="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-full bg-gray-20 flex items-center justify-center mr-4 max-sm:mr-2">
                    <img
                      src="https://www.banderas-mundo.es/data/flags/w1160/mx.webp"
                      alt="México"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {/* Precio */}
                  <p className="text-[16px] max-sm:text-sm font-bold text-black-eske">
                    $ 2,000 MX / mes
                  </p>
                </div>

                {/* Botón Suscribirme */}
                <div className="mt-auto">
                  <Button
                    label="SUSCRIBIRME"
                    variant="primary"
                    onClick={() => setIsBasicSuscriptionModalOpen(true)}
                  />
                </div>
              </div>
            </article>

            {/* Card 2 - Todo Eskemma (Plan Premium) */}
            <article className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 max-sm:p-4 text-center relative overflow-visible w-full max-w-[350px] mx-auto flex flex-col order-1 sm:order-none">
              {/* Encabezado con fondo black-eske */}
              <div
                className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-black-eske px-6 max-sm:px-4 py-2 max-sm:py-1 border border-bluegreen-eske text-white-eske text-[14px] max-sm:text-xs font-medium z-10 whitespace-nowrap"
                style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)" }}
                aria-hidden="true"
              >
                Todo Eskemma
              </div>

              {/* Contenido de la card */}
              <div className="flex flex-col flex-grow">
                {/* Título del Plan */}
                <h3 className="text-xl max-sm:text-lg font-semibold text-bluegreen-eske mt-6 max-sm:mt-4 mb-4 max-sm:mb-3">
                  Plan Premium
                </h3>

                {/* Detalles del Plan */}
                <div className="text-left text-[16px] max-sm:text-sm text-black-eske space-y-2 max-sm:space-y-1 flex-grow">
                  <p>Mensual</p>
                  <p>Para 1 persona</p>
                  <p className="mt-4 max-sm:mt-2 text-[16px] max-sm:text-sm">
                    <strong>Obtienes Plan Básico +</strong>
                  </p>
                  <p>Acceso total al ecosistema de Eskemma</p>
                  <p>Acceso a recursos exclusivos para tu proyecto político</p>
                  <p>1 sesión de asesoría gratuita al mes</p>
                </div>

                {/* Bandera y Precio */}
                <div className="flex items-center justify-start mt-6 max-sm:mt-4 mb-6 max-sm:mb-4">
                  {/* Bandera */}
                  <div className="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-full bg-gray-20 flex items-center justify-center mr-4 max-sm:mr-2">
                    <img
                      src="https://www.banderas-mundo.es/data/flags/w1160/mx.webp"
                      alt="México"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {/* Precio */}
                  <p className="text-[16px] max-sm:text-sm font-bold text-black-eske">
                    $ 4,000 MX / mes
                  </p>
                </div>

                {/* Botón Suscribirme */}
                <div className="mt-auto">
                  <Button
                    label="SUSCRIBIRME"
                    variant="secondary"
                    onClick={() => setIsPremiumSuscriptionModalOpen(true)}
                  />
                </div>
              </div>
            </article>

            {/* Card 3 - Trabajo colaborativo (Plan Grupal) */}
            <article className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 max-sm:p-4 text-center relative overflow-visible w-full max-w-[350px] mx-auto flex flex-col order-3 sm:order-none">
              {/* Encabezado con fondo white-eske */}
              <div
                className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-white-eske px-6 max-sm:px-4 py-2 max-sm:py-1 border border-bluegreen-eske text-black text-[14px] max-sm:text-xs font-medium z-10 whitespace-nowrap"
                style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)" }}
                aria-hidden="true"
              >
                Trabajo Colaborativo
              </div>

              {/* Contenido de la card */}
              <div className="flex flex-col flex-grow">
                {/* Título del Plan */}
                <h3 className="text-xl max-sm:text-lg font-semibold text-bluegreen-eske mt-6 max-sm:mt-4 mb-4 max-sm:mb-3">
                  Plan Grupal
                </h3>

                {/* Detalles del Plan */}
                <div className="text-left text-[16px] max-sm:text-sm text-black-eske space-y-2 max-sm:space-y-1 flex-grow">
                  <p>Mensual</p>
                  <p>Para 6 personas</p>
                  <p className="mt-4 max-sm:mt-2 text-[16px] max-sm:text-sm">
                    <strong>Obtienes Plan Premium +</strong>
                  </p>
                  <p>Versión colaborativa</p>
                  <p>Acceso a recursos exclusivos para grupos</p>
                  <p>2 sesiones de asesoría gratuita al mes</p>
                </div>

                {/* Bandera y Precio */}
                <div className="flex items-center justify-start mt-6 max-sm:mt-4 mb-6 max-sm:mb-4">
                  {/* Bandera */}
                  <div className="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-full bg-gray-20 flex items-center justify-center mr-4 max-sm:mr-2">
                    <img
                      src="https://www.banderas-mundo.es/data/flags/w1160/mx.webp"
                      alt="México"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {/* Precio */}
                  <p className="text-[16px] max-sm:text-sm font-bold text-black-eske">
                    $ 20,000 MX / mes
                  </p>
                </div>

                {/* Botón Suscribirme */}
                <div className="mt-auto">
                  <Button
                    label="SUSCRIBIRME"
                    variant="primary"
                    onClick={() => setIsGrupalSuscriptionModalOpen(true)}
                  />
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* MODALES */}
      {/* Modal de Suscripción (Plan Básico) */}
      <SuscriptionBasicModal
        isOpen={isBasicSuscriptionModalOpen}
        onClose={() => setIsBasicSuscriptionModalOpen(false)}
        onPaymentSuccess={() => {
          setIsBasicSuscriptionModalOpen(false);
          setIsResponseSuscriptionModalOpen(true);
        }}
      />

      {/* Modal de Suscripción (Plan Premium) */}
      <SuscriptionPremiumModal
        isOpen={isPremiumSuscriptionModalOpen}
        onClose={() => setIsPremiumSuscriptionModalOpen(false)}
        onPaymentSuccess={() => {
          setIsPremiumSuscriptionModalOpen(false);
          setIsResponseSuscriptionModalOpen(true);
        }}
      />

      {/* Modal de Suscripción (Plan Grupal) */}
      <SuscriptionGrupalModal
        isOpen={isGrupalSuscriptionModalOpen}
        onClose={() => setIsGrupalSuscriptionModalOpen(false)}
        onPaymentSuccess={() => {
          setIsGrupalSuscriptionModalOpen(false);
          setIsResponseSuscriptionModalOpen(true);
        }}
      />

      {/* Modal de Respuesta después de la suscripción */}
      <SuscriptionResponseModal
        isOpen={isResponseSuscriptionModalOpen}
        onClose={() => setIsResponseSuscriptionModalOpen(false)}
        userName={userName}
      />

      {/* Sección - FAQ */}
      <FaqSection />

      {/* Enlaces Rápidos Section */}
      <section
        className="bg-white-eske min-h-[500px] py-16 max-sm:py-12 px-4 sm:px-6 md:px-8"
        aria-labelledby="quick-links-heading"
      >
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2
            id="quick-links-heading"
            className="text-3xl max-sm:text-xl font-bold text-center text-bluegreen-eske mb-14 max-sm:mb-8"
          >
            Enlaces rápidos
          </h2>

          <nav
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-sm:gap-4"
            aria-label="Enlaces rápidos a secciones principales"
          >
            <Link
              href="/moddulo"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-60 transition-all duration-300 ease-in-out h-full focus-ring-primary rounded"
            >
              <img
                src="/icons/icon_Moddulo.svg"
                alt=""
                aria-hidden="true"
                className="w-32 h-32 max-sm:w-20 max-sm:h-20 mb-4 max-sm:mb-2 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl max-sm:text-sm text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Moddulo
              </span>
            </Link>

            <Link
              href="/sefix"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-80 transition-all duration-300 ease-in-out h-full focus-ring-primary rounded"
            >
              <img
                src="/icons/icon_Sefix.svg"
                alt=""
                aria-hidden="true"
                className="w-32 h-32 max-sm:w-20 max-sm:h-20 mb-4 max-sm:mb-2 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl max-sm:text-sm text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Sefix
              </span>
            </Link>

            <Link
              href="/servicios"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-80 transition-all duration-300 ease-in-out h-full focus-ring-primary rounded"
            >
              <img
                src="/icons/icon_Consultoria.svg"
                alt=""
                aria-hidden="true"
                className="w-32 h-32 max-sm:w-20 max-sm:h-20 mb-4 max-sm:mb-2 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl max-sm:text-sm text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Servicios
              </span>
            </Link>

            <Link
              href="/cursos"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-80 transition-all duration-300 ease-in-out h-full focus-ring-primary rounded"
            >
              <img
                src="/icons/icon_Cursos.svg"
                alt=""
                aria-hidden="true"
                className="w-32 h-32 max-sm:w-20 max-sm:h-20 mb-4 max-sm:mb-2 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl max-sm:text-sm text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Cursos
              </span>
            </Link>

            <Link
              href="/monitor"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-80 transition-all duration-300 ease-in-out h-full focus-ring-primary rounded"
            >
              <img
                src="/icons/icon_Monitor.svg"
                alt=""
                aria-hidden="true"
                className="w-32 h-32 max-sm:w-20 max-sm:h-20 mb-4 max-sm:mb-2 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl max-sm:text-sm text-bluegreen-eske font-medium hover:text-bluegreen-80">
                Monitor
              </span>
            </Link>

            <Link
              href="/blog"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-60 transition-all duration-300 ease-in-out h-full focus-ring-primary rounded"
            >
              <img
                src="/icons/icon_Blog.svg"
                alt=""
                aria-hidden="true"
                className="w-32 h-32 max-sm:w-20 max-sm:h-20 mb-4 max-sm:mb-2 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl max-sm:text-sm text-bluegreen-eske font-medium hover:text-bluegreen-60">
                El baúl de Fouché
              </span>
            </Link>
          </nav>
        </div>
      </section>
    </main>
  );
}

