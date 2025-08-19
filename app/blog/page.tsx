// app/blog/page.tsx
import Link from 'next/link';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import DOMPurify from 'isomorphic-dompurify'; 
import { getSortedPostsData } from '@/lib/posts';

// Función auxiliar para validar fechas
function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export default async function BlogPage() {
  try {
    const sortedPosts = await getSortedPostsData();

    const publishedPosts = sortedPosts
      .filter((post) => post.status === 'published')
      .map(async (post) => {
        // Convertir Markdown a HTML para el resumen
        const excerptHtml = await remark()
          .use(remarkHtml)
          .process(post.content.substring(0, 120) + '...');
        
        // Sanitizar el HTML generado
        const sanitizedExcerpt = DOMPurify.sanitize(excerptHtml.toString());

        // Validar y formatear la fecha
        const validatedDate = post.updatedAt instanceof Date && !isNaN(post.updatedAt.getTime())
          ? post.updatedAt
          : new Date(); // Usar la fecha actual como predeterminada

        return {
          id: post.id || '',
          title: post.title || 'Sin título',
          date: validatedDate, // Usar la fecha validada
          excerpt: sanitizedExcerpt,
          slug: post.slug || '',
        };
      });

    const resolvedPosts = await Promise.all(publishedPosts);

    return (
      <section className="bg-gray-eske-10 min-h-[580px] py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          {/* Título de la Sección */}
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-12">
            El Baúl de Fouché
          </h2>

          {/* Contenedor de Artículos */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolvedPosts.map(({ id, title, date, excerpt, slug }) => (
              <div key={id} className="flex flex-col items-center text-center">
                {/* Título del Artículo */}
                <h3 className="text-xl text-bluegreen-eske-60 font-light mb-2">
                  <Link href={`/blog/${slug}`} className="hover:text-blue-eske-70 transition-colors duration-300">
                    {title}
                  </Link>
                </h3>

                {/* Resumen del Artículo */}
                <div
                  className="text-[16px] font-light text-gray mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: excerpt }}
                />

                {/* Fecha del Artículo */}
                <small className="text-sm text-gray-500 mb-2">
                  {date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </small>

                {/* Enlace "Leer completo" */}
                <Link
                  href={`/blog/${slug}`}
                  className="text-blue-eske hover:text-blue-eske-70 font-medium text-[14px] transition-colors duration-300"
                >
                  Leer completo
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    return <div>Ocurrió un error al cargar los posts. Por favor, inténtalo de nuevo más tarde.</div>;
  }
}