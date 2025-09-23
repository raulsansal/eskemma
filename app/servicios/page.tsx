// app/servicios/page.tsx

import Link from "next/link";
import Image from "next/image";

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-white-eske">
      {/* Hero Section */}
      <section className="relative min-h-[400px] w-full flex items-center justify-center bg-bluegreen-eske overflow-hidden">
        {/* Imagen de fondo */}
        <Image
          src="/images/yanmin_yang.jpg" // Asegúrate de que esta imagen exista en /public/images/
          alt="Hero Background"
          fill
          style={{ objectFit: "cover" }}
          className="object-cover"
          priority
        />

        {/* Overlay con transparencia */}
        <div className="absolute inset-0 bg-bluegreen-eske opacity-75"></div>

        {/* Contenido del Hero */}
        <div className="relative z-10 text-center text-white-eske px-4 sm:px-6 md:px-8 max-w-screen-xl mx-auto w-full">
          <h1 className="text-[36px] max-sm:text-2xl leading-tight font-bold">
            Nuestros Servicios
          </h1>
          <p className="mt-4 max-sm:mt-2 text-[18px] max-sm:text-base leading-relaxed font-light">
            Descubre cómo podemos ayudarte a profesionalizar tu carrera
            política.
          </p>
        </div>
      </section>

      {/* Sección de Descripción General */}
      <section className="bg-white-eske py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-8">
            ¿Qué ofrecemos?
          </h2>
          <p className="text-lg font-light text-center text-black-eske mb-8">
            En Eskemma, brindamos soluciones integrales para apoyar tu proyecto político.
          </p>
        </div>
      </section>

      {/* Sección de Servicios Detallados */}
      <section className="bg-white-eske py-2 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl mb-12">
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-12">
            Nuestros servicios destacados
          </h2>

          {/* Grilla de Servicios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Servicio 1 */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/icon_Consultoria.svg" // Ícono de Consultoría
                alt="Consultoría Política"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Consultoría Política
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Estrategias personalizadas para fortalecer tu proyecto político.
              </p>
            </div>

            {/* Servicio 2 */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/icon_Moddulo.svg" // Ícono de Moddulo
                alt="Herramientas Digitales"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Herramientas Digitales
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Acceso a herramientas para diseñar y gestionar tu estrategia política.
              </p>
            </div>

            {/* Servicio 3 */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/icon_Sefix.svg" // Ícono de Sefix
                alt="Dashboards Interactivos"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Dashboards Interactivos
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Visualización de datos para profundizar en el análisis de información política.
              </p>
            </div>

            {/* Servicio 4: Cursos y Talleres */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/icon_Cursos.svg" // Ícono de Cursos
                alt="Cursos y Talleres"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Cursos y Talleres
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Plataforma virtual, disponible 24/7, para aprender a desarrollar soluciones prácticas.
              </p>
            </div>           

            {/* Servicio 5: Monitoreo de Información */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/icon_Monitor.svg" // Ícono de Monitor
                alt="Monitoreo de Información"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Monitoreo de Información
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Seguimiento y análisis de datos relevantes para tu proyecto
                político.
              </p>
            </div>

             {/* Servicio 6: Capacitación */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/icon_Cursos.svg" // Ícono de Cursos (temporal)
                alt="Capacitación"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Capacitación
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Presencial y virtual para el desarrollo de habilidades
                políticas.
              </p>
            </div>

            {/* Servicio 7: Desarrollo de Software */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/icon_Software.svg" // Ícono de Blog (temporal)
                alt="Desarrollo de Software"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Desarrollo de Software
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Soluciones tecnológicas adaptadas a las necesidades de tu proyecto.
              </p>
            </div>

            {/* Servicio 8: Producción Audiovisual */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/icon_Producción.svg" // Ícono de Blog (temporal)
                alt="Producción Audiovisual"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Producción Audiovisual
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Creación de contenido multimedia para campañas electorales y de gobierno.
              </p>
            </div>

            {/* Servicio 9: Investigación Cuantitativa y Cualitativa */}
            <div className="flex flex-col items-center text-center">
              <Image
                src="/icons/icon_Investigación.svg" // Ícono de Blog (temporal)
                alt="Investigación Cuantitativa y Cualitativa"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Investigación Cuantitativa y Cualitativa
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Análisis profundo de datos sociales y políticos para tomar
                decisiones informadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-eske-20  py-12 px-4 sm:px-6 md:px-8 text-center text-black-eske-90">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-2xl font-semibold mb-4">¿Comenzamos?</h2>
          <p className="text-lg font-light mb-8">
            Contáctanos para obtener más información sobre nuestros servicios.
          </p>
          <Link
            href="/contacto"
            className="inline-block bg-orange-eske text-white-eske px-8 py-4 rounded-lg font-medium hover:bg-orange-eske-70 transition-all duration-300"
          >
            CONTACTAR AHORA
          </Link>
        </div>
      </section>
    </main>
  );
}
