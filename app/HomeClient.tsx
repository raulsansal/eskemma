// app/HomeClient.tsx
"use client";

import { useState } from "react";
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

  const userName = "Usuario";

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

      {/* Blog Section */}
      <section className="bg-gray-eske-10 min-h-[580px] py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-12">
            Hoy en Eskemma
          </h2>

          {blogPosts.length === 0 ? (
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
                  className="flex flex-col items-center text-center bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 min-h-full"
                >
                  {/* Imagen */}
                  {post.featureImage && (
                    <img
                      src={post.featureImage}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  {/* Título - con flex-grow para ocupar espacio variable */}
                  <h3 className="text-xl text-bluegreen-eske-60 font-semibold mb-2 hover:text-bluegreen-eske transition-colors duration-300 flex-grow-0">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  {/* Contenido - con flex-grow para ocupar espacio variable */}
                  <p className="text-[16px] font-light text-gray-eske-90 mb-4 line-clamp-3 flex-grow">
                    {post.content.substring(0, 160)}...
                  </p>

                  {/* Fecha y autor */}
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

                  {/* Botón - con mt-auto para empujarlo al fondo */}
                  <div className="mt-auto w-full max-w-[200px]">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px]"
                    >
                      Leer completo →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Información Relevante Section */}
      <section className="bg-white-eske min-h-[500px] py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-12">
            Información relevante
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="flex flex-col items-center text-center min-h-full">
              <Image
                src="/images/part_comparativa_circuns.gif"
                alt="Gráfica 1"
                width={600}
                height={338}
                className="w-full h-auto object-contain rounded-lg mb-4"
                unoptimized={true}
              />
              <p className="text-[16px] text-gray mb-4 flex-grow">
                Participación electoral por circunscripción <br />
                en las elecciones federales de México 2006-2021
              </p>

              {/* Wrapper del botón con mt-auto para empujarlo al fondo */}
              <div className="mt-auto w-full max-w-[250px]">
                <Link
                  href="/monitor"
                  className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px]"
                >
                  Consultar información →
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-center text-center min-h-full">
              <Image
                src="/images/part_tipo_eleccion.gif"
                alt="Gráfica 2"
                width={600}
                height={338}
                className="w-full h-auto object-contain rounded-lg mb-4"
                unoptimized={true}
              />
              <p className="text-[16px] text-gray mb-4 flex-grow">
                ¿Por qué la participación electoral aumenta en las <br />
                elecciones presidenciales en México?
              </p>

              {/* Wrapper del botón con mt-auto para empujarlo al fondo */}
              <div className="mt-auto w-full max-w-[250px]">
                <Link
                  href="/monitor"
                  className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px]"
                >
                  Consultar información →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Propuesta Section */}
      <section className="bg-bluegreen-eske min-h-[500px] py-18 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/3 flex justify-center">
            <PropAnimation />
          </div>

          <div className="w-full md:w-1/2 text-center text-white-eske mt-8 md:mt-0">
            <h2 className="text-[24px] block mb-10">
              El tiempo es el recurso más valioso.
            </h2>
            <p className="text-[18px] font-light mb-4 leading-relaxed">
              <span className="block">Nunca es demasiado pronto.</span>
              <span className="block">Comencemos a planear tu estrategia.</span>
            </p>
            <p className="mt-6 text-[18px] font-light leading-relaxed">
              <span className="block">Haz que cada decisión sea efectivo</span>
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
          <div className="text-center max-w-[300px] mx-auto">
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
                  src="https://untitledui.com/images/avatars/brianna-ware"
                  alt="Usuario 1"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Texto (Segunda Columna) */}
              <blockquote className="text-[16px] text-black-eske font-light max-w-[70%]">
                "Cuando pensé que no había nada más que hacer en mi candidatura
                decidí utilizar el <i>Moddulo</i> de Eskemma. Descubrí que había
                muchas opciones para competir con fuerza."
              </blockquote>
            </div>

            {/* Testimonio 2 */}
            <div className="flex items-center justify-end space-x-8">
              {/* Texto (Primera Columna) */}
              <blockquote className="text-[16px] text-black-eske font-light max-w-[70%] text-right">
                "En los cursos de comunicación política siempre hablan de
                estrategia, pero hasta ahora sé cómo hacerlo en territorio, no
                sólo en teoría."
              </blockquote>
              {/* Avatar (Segunda Columna) */}
              <div className="w-16 h-16 rounded-full bg-orange-60 flex items-center justify-center overflow-hidden">
                <img
                  src="https://untitledui.com/images/avatars/drew-cano"
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
                  src="https://untitledui.com/images/avatars/ethan-valdez"
                  alt="Usuario 3"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Texto (Segunda Columna) */}
              <blockquote className="text-[16px] text-black-eske font-light max-w-[70%]">
                "Con su ayuda logré analizar mejor la información y saber cómo
                aventajar a los otros partidos. Lo mejor es que lo hice yo mismo
                y me ahorré una lana."
              </blockquote>
            </div>

            {/* Testimonio 4 */}
            <div className="flex items-center justify-end space-x-8">
              {/* Texto (Primera Columna) */}
              <blockquote className="text-[16px] text-black-eske font-light max-w-[70%] text-right">
                "Pensé que estos servicios sólo eran para grandes campañas.
                Participé en una elección local en 2024 y pude utilizar mucha de
                la ayuda que me brindaron."
              </blockquote>
              {/* Avatar (Segunda Columna) */}
              <div className="w-16 h-16 rounded-full bg-red-60 flex items-center justify-center overflow-hidden">
                <img
                  src="https://untitledui.com/images/avatars/ava-bentley"
                  alt="Usuario 4"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección - Planes de suscripción */}
      <section className="bg-white-eske min-h-[800px] py-18 px-4 sm:px-6 md:px-8">
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
            <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 text-center relative overflow-visible w-full max-w-[350px] mx-auto flex flex-col order-2 sm:order-none">
              {/* Encabezado con fondo white-eske */}
              <div
                className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-white-eske px-6 py-2 border border-bluegreen-eske text-black-eske text-[14px] font-medium z-10 whitespace-nowrap"
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
                  <p className="mt-4 text-[10px]">
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
                      src="https://www.banderas-mundo.es/data/flags/w1160/mx.webp"
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
                <div className="mt-auto">
                  <Button
                    label="SUSCRIBIRME"
                    variant="primary"
                    onClick={() => setIsBasicSuscriptionModalOpen(true)}
                  />
                </div>
              </div>
            </div>

            {/* Card 2 - Todo Eskemma (Plan Premium) */}
            <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 text-center relative overflow-visible w-full max-w-[350px] mx-auto flex flex-col order-1 sm:order-none">
              {/* Encabezado con fondo black-eske */}
              <div
                className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-black-eske px-6 py-2 border border-bluegreen-eske text-white-eske text-[14px] font-medium z-10 whitespace-nowrap"
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
                      src="https://www.banderas-mundo.es/data/flags/w1160/mx.webp"
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
                <div className="mt-auto">
                  <Button
                    label="SUSCRIBIRME"
                    variant="secondary"
                    onClick={() => setIsPremiumSuscriptionModalOpen(true)}
                  />
                </div>
              </div>
            </div>

            {/* Card 3 - Trabajo colaborativo (Plan Grupal) */}
            <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 text-center relative overflow-visible w-full max-w-[350px] mx-auto flex flex-col order-3 sm:order-none">
              {/* Encabezado con fondo white-eske */}
              <div
                className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-white-eske px-6 py-2 border border-bluegreen-eske text-black text-[14px] font-medium z-10 whitespace-nowrap"
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
                      src="https://www.banderas-mundo.es/data/flags/w1160/mx.webp"
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
                <div className="mt-auto">
                  <Button
                    label="SUSCRIBIRME"
                    variant="primary"
                    onClick={() => setIsGrupalSuscriptionModalOpen(true)}
                  />
                </div>
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
      <section className="bg-white-eske min-h-[500px] py-16 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-bold text-center text-bluegreen-eske mb-14">
            Enlaces rápidos
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link
              href="/moddulo"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-60 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Moddulo.svg"
                alt="Moddulo"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Moddulo
              </span>
            </Link>

            <Link
              href="/sefix"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-80 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Sefix.svg"
                alt="Sefix"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Sefix
              </span>
            </Link>

            <Link
              href="/servicios"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-80 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Consultoria.svg"
                alt="Consultoría"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Servicios
              </span>
            </Link>

            <Link
              href="/cursos"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-80 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Cursos.svg"
                alt="Cursos"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-60">
                Cursos
              </span>
            </Link>

            <Link
              href="/monitor"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-80 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Monitor.svg"
                alt="Monitor"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110"
              />
              <span className="text-xl text-bluegreen-eske font-medium hover:text-bluegreen-80">
                Monitor
              </span>
            </Link>

            <Link
              href="/blog"
              className="flex flex-col items-center justify-center text-center text-bluegreen-eske hover:text-bluegreen-60 transition-all duration-300 ease-in-out h-full"
            >
              <img
                src="/icons/icon_Blog.svg"
                alt="Software"
                className="w-32 h-32 mb-4 transition-transform duration-300 ease-in-out hover:scale-110"
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
