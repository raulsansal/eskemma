// app/components/Footer.tsx
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer>
      {/* Primera sección: Fondo bluegreen-eske */}
      <div className="bg-bluegreen-eske text-white-eske py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          {/* Contenedor para Logotipo e Íconos de Redes Sociales */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            {/* Logotipo */}
            <div className="flex-shrink-0">
              <img
                src="/images/esk_log_wsm.svg"
                alt="Eskemma Logo"
                className="h-14 w-auto"
              />
            </div>
            {/* Íconos de redes sociales */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="https://twitter.com/eskemma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-eske-10 transition-colors duration-300"
              >
                <img src="/icons/twitter.svg" alt="Twitter" className="w-12 h-12" />
              </a>
              <a
                href="https://linkedin.com/company/eskemma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-eske-10 transition-colors duration-300"
              >
                <img src="/icons/linkedin.svg" alt="LinkedIn" className="w-12 h-12" />
              </a>
              <a
                href="https://www.youtube.com/@eskemma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-eske-10 transition-colors duration-300"
              >
                <img src="/icons/youtube.svg" alt="YouTube" className="w-12 h-12" />
              </a>
              <a
                href="https://www.tiktok.com/@eskemma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-eske-10 transition-colors duration-300"
              >
                <img src="/icons/tiktok.svg" alt="TikTok" className="w-12 h-12" />
              </a>
              <a
                href="https://www.facebook.com/eskemma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-eske-10 transition-colors duration-300"
              >
                <img src="/icons/facebook.svg" alt="Facebook" className="w-12 h-12" />
              </a>
              <a
                href="https://www.instagram.com/eskemma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-eske-10 transition-colors duration-300"
              >
                <img src="/icons/instagram.svg" alt="Instagram" className="w-12 h-12" />
              </a>
            </div>
          </div>
          {/* Línea divisoria después de redes sociales (móvil) */}
          <hr className="hidden max-sm:block border-t border-white-eske max-sm:my-6" />
          {/* Contenedor de columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mx-auto max-w-screen-xl">
            {/* Columna 1: Navegación */}
            <div>
              <h3 className="text-14px font-semibold mb-4 max-sm:text-center">Navegación</h3>
              <div className="grid grid-cols-1 gap-2">
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="hover:text-blue-eske-10 transition-colors duration-300">
                      Inicio
                    </Link>
                  </li>
                  <li>
                    <Link href="/recursos" className="hover:text-blue-eske-10 transition-colors duration-300">
                      Recursos
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-blue-eske-10 transition-colors duration-300">
                      El Baúl de Fouché
                    </Link>
                  </li>
                  <li>
                    <Link href="/servicios" className="hover:text-blue-eske-10 transition-colors duration-300">
                      Servicios
                    </Link>
                  </li>
                  <li>
                    <Link href="/moddulo" className="hover:text-blue-eske-10 transition-colors duration-300">
                      Moddulo
                    </Link>
                  </li>
                  <li>
                    <Link href="/sefix" className="hover:text-blue-eske-10 transition-colors duration-300">
                      Sefix
                    </Link>
                  </li>
                  <li>
                    <Link href="/cursos" className="hover:text-blue-eske-10 transition-colors duration-300">
                      Cursos
                    </Link>
                  </li>
                  <li>
                    <Link href="/monitor" className="hover:text-blue-eske-10 transition-colors duration-300">
                      Monitor
                    </Link>
                  </li>
                  <li>
                    <Link href="/contacto" className="hover:text-blue-eske-10 transition-colors duration-300">
                      Contacto
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:text-blue-eske-10 transition-colors duration-300">
                      Preguntas frecuentes
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* Línea divisoria después de Navegación (móvil) */}
            <hr className="hidden max-sm:block border-t border-white-eske max-sm:my-6" />
            
            {/* Columna 2: Legal (NUEVA) */}
            <div>
              <h3 className="text-14px font-semibold mb-4 max-sm:text-center">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/politica-de-privacidad" className="hover:text-blue-eske-10 transition-colors duration-300">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/condiciones-de-uso" className="hover:text-blue-eske-10 transition-colors duration-300">
                    Condiciones de uso
                  </Link>
                </li>
                <li>
                  <Link href="/politica-de-cookies" className="hover:text-blue-eske-10 transition-colors duration-300">
                    Política de cookies
                  </Link>
                </li>
                <li>
                  <Link href="/condiciones-asesorias-gratuitas" className="hover:text-blue-eske-10 transition-colors duration-300">
                    Condiciones de uso para asesorías gratuitas
                  </Link>
                </li>
              </ul>
            </div>
            {/* Línea divisoria después de Legal (móvil) */}
            <hr className="hidden max-sm:block border-t border-white-eske max-sm:my-6" />
            
            {/* Columna 3: Sitios de interés */}
            <div>
              <h3 className="text-14px font-semibold mb-4 max-sm:text-center">Sitios de interés</h3>
              <div className="grid grid-cols-1 gap-2">
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://ine.mx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-eske-10 transition-colors duration-300"
                    >
                      INE
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.inegi.org.mx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-eske-10 transition-colors duration-300"
                    >
                      INEGI
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.scjn.gob.mx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-eske-10 transition-colors duration-300"
                    >
                      SCJN
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.te.gob.mx/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-eske-10 transition-colors duration-300"
                    >
                      TEPJF
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.diputados.gob.mx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-eske-10 transition-colors duration-300"
                    >
                      H. Cámara de Diputados
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.senado.gob.mx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-eske-10 transition-colors duration-300"
                    >
                      Senado de la República
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://biblioteca.colmex.mx/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-eske-10 transition-colors duration-300"
                    >
                      Biblioteca del COLMEX
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.bidi.unam.mx/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-eske-10 transition-colors duration-300"
                    >
                      Biblioteca Digital UNAM
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Segunda sección: Fondo bluegreen-eske-80 */}
      <div className="bg-bluegreen-eske-80 text-white-eske py-6 px-4 sm:px-6 md:px-8 text-center font-light text-8px">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <p>
            Eskemma | {currentYear} | © Todos los derechos reservados |{" "}
            <Link href="/condiciones-de-uso" className="hover:text-blue-eske-10 transition-colors duration-300">
              Condiciones de uso
            </Link>{" "}
            |{" "}
            <Link href="/politica-de-cookies" className="hover:text-blue-eske-10 transition-colors duration-300">
              Política de cookies
            </Link>{" "}
            |{" "}
            <Link href="/politica-de-privacidad" className="hover:text-blue-eske-10 transition-colors duration-300">
              Política de privacidad
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;