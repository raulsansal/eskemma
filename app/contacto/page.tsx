// app/contact/page.tsx

import Link from "next/link";

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-white-eske">
      {/* Hero Section - Corregida */}
      <section className="relative min-h-[168px] w-full flex items-center bg-bluegreen-eske overflow-hidden">
        {/* Imagen de Fondo */}
        <img
          src="/images/yanmin_yang.jpg"
          alt="Hero Background"
          className="absolute inset-0 object-cover w-full h-full z-0"
        />

        {/* Overlay con opacidad */}
        <div className="absolute inset-0 bg-bluegreen-eske opacity-75 z-10"></div>

        {/* Contenedor Principal */}
        <div className="relative z-20 w-full max-w-screen-xl mx-auto flex items-center">
          {/* Imagen de Persona Sonriendo (Izquierda) - Corregida */}
          <div className="hidden md:block w-1/2 relative">
            <div className="relative h-full min-h-[168px]">
              <img
                src="/images/woman_calling_contact_2.jpg"
                alt="Persona Sonriendo"
                className="object-cover w-full h-full"
                style={{ objectPosition: "left center" }}
              />
            </div>
          </div>

          {/* Contenido del Hero (Derecha) */}
          <div className="w-full md:w-1/2 px-4 sm:px-6 md:px-8 text-center md:text-left">
            <h1 className="text-[36px] max-sm:text-2xl leading-tight font-bold text-white-eske">
              Estamos aquí para escucharte
            </h1>
            <p className="mt-4 max-sm:mt-2 text-[18px] max-sm:text-base leading-relaxed font-light text-white-eske">
              Facilitamos tu contacto con nosotros. <br />
              Resolvemos tus dudas y construimos juntos.
            </p>
          </div>
        </div>
      </section>

      {/* Resto del código permanece igual */}
      <section className="bg-gray-eske-10 py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-8">
            ¿Para qué puedes contactarnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Item 1 */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/icons/esk_sym_csm.svg"
                alt="Consultoría Política"
                width={60}
                height={60}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Contratar Servicios
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Si deseas contratar nuestros servicios.
              </p>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/icons/esk_sym_csm.svg"
                alt="Pedir Información"
                width={60}
                height={60}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Pedir Información
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Para resolver dudas sobre nuestros productos o servicios.
              </p>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/icons/esk_sym_csm.svg"
                alt="Publicar en el Blog"
                width={60}
                height={60}
                className="mb-4"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Publicar en el Blog
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Si tienes contenido relevante para nuestro blog.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white-eske py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-8">
            ¿Cómo puedes contactarnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Datos de Contacto */}
            <div className="space-y-4">
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">Teléfono:</span>{" "}
                +52 55 5555 5555
              </p>
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">Email:</span>{" "}
                contacto@eskemma.com
              </p>
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">Dirección:</span>{" "}
                Av. Reforma #222, CDMX, México
              </p>
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">
                  Horario de Atención:
                </span>{" "}
                Lunes a Viernes, 9:00 - 18:00
              </p>
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">
                  Tiempo de Respuesta:
                </span>{" "}
                24 horas hábiles
              </p>
            </div>

            {/* Formulario */}
            <form className="space-y-4">
              <h3 className="text-2xl font-semibold text-bluegreen-eske mb-4">
                Escríbenos
              </h3>
              <div>
                <label
                  htmlFor="name"
                  className="block text-black-eske font-medium"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-bluegreen-eske focus:ring focus:ring-bluegreen-eske-20 px-3 py-2"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-black-eske font-medium"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-bluegreen-eske focus:ring focus:ring-bluegreen-eske-20 px-3 py-2"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-black-eske font-medium"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-bluegreen-eske focus:ring focus:ring-bluegreen-eske-20 px-3 py-2"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-eske text-white-eske px-6 py-3 rounded-lg font-medium hover:bg-orange-eske-70 transition-all duration-300"
              >
                ENVIAR MENSAJE
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}