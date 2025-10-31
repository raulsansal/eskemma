// app/blog/page.tsx
import Link from "next/link";
import Image from "next/image";
import { remark } from "remark";
import remarkHtml from "remark-html";
import DOMPurify from "isomorphic-dompurify";
import { getSortedPostsData } from "@/lib/posts";
import FoucheImageWithModal from "./FoucheModalClient";

// Función auxiliar para validar fechas
function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export default async function BlogPage() {
  try {
    const sortedPosts = await getSortedPostsData();

    const publishedPosts = sortedPosts
      .filter((post) => post.status === "published")
      .map(async (post) => {
        // Convertir Markdown a HTML para el resumen
        const excerptHtml = await remark()
          .use(remarkHtml)
          .process(post.content.substring(0, 160) + "...");

        // Sanitizar el HTML generado
        const sanitizedExcerpt = DOMPurify.sanitize(excerptHtml.toString());

        // Validar y formatear la fecha
        const validatedDate =
          post.updatedAt instanceof Date && !isNaN(post.updatedAt.getTime())
            ? post.updatedAt
            : new Date();

        return {
          id: post.id || "",
          title: post.title || "Sin título",
          date: validatedDate,
          excerpt: sanitizedExcerpt,
          slug: post.slug || "",
          author: post.author?.displayName || "Desconocido",
          featureImage: post.featureImage || undefined,
        };
      });

    const resolvedPosts = await Promise.all(publishedPosts);

    return (
      <main className="min-h-screen bg-white-eske">
        {/* Hero Section - EXACTAMENTE IGUAL QUE CONTACTO */}
        <section className="relative h-[250px] sm:h-[200px] md:h-[200px] w-full flex items-center bg-bluegreen-eske overflow-hidden">
          {/* Imagen de Fondo */}
          <Image
            src="/images/yanmin_yang.jpg"
            alt="Hero Background"
            fill
            style={{ objectFit: "cover" }}
            className="absolute inset-0 z-0"
            priority
          />

          {/* Overlay con opacidad */}
          <div className="absolute inset-0 bg-bluegreen-eske opacity-75 z-10"></div>

          {/* Contenedor Principal */}
          <div className="relative z-20 w-full max-w-screen-xl mx-auto flex items-center h-full">
            {/* ✅ Imagen de Fouché clickeable (componente client) */}
            <FoucheImageWithModal />

            {/* Contenido del Hero (Derecha en desktop, centrado en móvil) */}
            <div className="w-full md:w-1/2 px-4 sm:px-6 md:px-8 flex flex-col justify-center text-center md:text-left py-4">
              <h1 className="text-2xl sm:text-[26px] md:text-[32px] leading-tight font-bold text-white-eske">
                El Baúl de Fouché
              </h1>
              <p className="mt-2 text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-light text-white-eske">
                Análisis político, estrategias electorales{" "}
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>y los secretos del poder
                contemporáneo.
              </p>
            </div>
          </div>
        </section>

        {/* Sección de Posts */}
        <section className="bg-gray-eske-10 min-h-[580px] py-12 px-4 sm:px-6 md:px-8">
          <div className="w-[90%] mx-auto max-w-screen-xl">
            {/* Subtítulo */}
            <p className="text-center text-gray-eske-70 mb-12 text-lg">
              Explora nuestros artículos sobre política, estrategia y análisis
              electoral
            </p>

            {/* Contenedor de Artículos */}
            {resolvedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-eske-60">
                  No hay posts publicados aún.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resolvedPosts.map(
                  ({
                    id,
                    title,
                    date,
                    excerpt,
                    slug,
                    author,
                    featureImage,
                  }) => (
                    <div
                      key={id}
                      className="flex flex-col items-center text-center bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
                    >
                      {/* Imagen Destacada */}
                      {featureImage && (
                        <img
                          src={featureImage}
                          alt={`Imagen destacada para ${title}`}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}

                      {/* Título del Artículo */}
                      <h3 className="text-xl text-bluegreen-eske-60 font-semibold mb-2 hover:text-bluegreen-eske transition-colors duration-300">
                        <Link href={`/blog/${slug}`}>{title}</Link>
                      </h3>

                      {/* Resumen del Artículo */}
                      <div
                        className="text-[16px] font-light text-gray-eske-90 mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: excerpt }}
                      />

                      {/* Fecha y Autor */}
                      <div className="flex justify-between w-full text-sm text-gray-700 mb-4 px-2">
                        {/* Fecha */}
                        <small className="text-gray-eske-60">
                          {date.toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </small>
                        {/* Nombre del Autor */}
                        <small className="text-bluegreen-eske font-medium">
                          {author}
                        </small>
                      </div>

                      {/* Enlace "Leer completo" */}
                      <Link
                        href={`/blog/${slug}`}
                        className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px]"
                      >
                        Leer completo →
                      </Link>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">
            Ocurrió un error al cargar los posts.
          </p>
          <p className="text-gray-600">
            Por favor, inténtalo de nuevo más tarde.
          </p>
        </div>
      </div>
    );
  }
}