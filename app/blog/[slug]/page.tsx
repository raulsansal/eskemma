// app/blog/[slug]/page.tsx
import { getPostData } from '@/lib/posts';
import SanitizedContent from '../../components/componentsBlog/SanitizedContent';

// Definir la interfaz PostData
interface PostData {
  id: string;
  title: string;
  date: Date;
  content: string;
  featureImage?: string;
  status: 'draft' | 'published';
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// CORRECCIÓN: Hacer params asíncrono
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Esperar los params antes de usarlos
  const { slug } = await params;

  console.log('Slug recibido:', slug); // Debug: ver qué slug estamos recibiendo

  // Obtener los datos del post usando el slug
  const postData = await getPostData(slug);

  if (!postData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[--background] text-[--foreground]">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Post no encontrado</h1>
        <p className="text-lg text-gray-600">No se pudo encontrar el post con slug: {slug}</p>
      </div>
    );
  }

  // Debug: Imprimir los datos recibidos del backend
  console.log('Datos del post recibidos:', postData);

  // Validar y asignar valores predeterminados si es necesario
  const validatedPostData: PostData = {
    id: postData.id || '',
    title: postData.title || 'Sin título',
    date: postData.updatedAt instanceof Date && !isNaN(postData.updatedAt.getTime())
      ? postData.updatedAt
      : new Date(),
    content: postData.content || '',
    featureImage: postData.featureImage || undefined,
    status: postData.status || 'draft',
    metaTitle: postData.metaTitle || postData.title || 'Sin título',
    metaDescription: postData.metaDescription || postData.content?.substring(0, 160) || '',
    keywords: postData.keywords || [],
  };

  // Formatear la fecha
  const formattedDate = validatedPostData.date instanceof Date && !isNaN(validatedPostData.date.getTime())
    ? validatedPostData.date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Fecha no disponible';

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <h1 className="text-4xl font-bold text-bluegreen-eske mb-6">
          {validatedPostData.title}
        </h1>

        {/* Fecha */}
        <small className="block text-sm text-gray-500 mb-6">
          {formattedDate}
        </small>

        {/* Imagen Destacada */}
        {validatedPostData.featureImage && (
          <img
            src={validatedPostData.featureImage}
            alt={`Imagen destacada para ${validatedPostData.title}`}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        {/* Contenido del Post */}
        <SanitizedContent
          content={validatedPostData.content}
          className="max-w-none text-[--foreground]"
        />
      </div>
    </div>
  );
}

// CORRECCIÓN: Mejorar la generación de rutas estáticas
export async function generateStaticParams() {
  try {
    const { getAllPostIds } = await import('@/lib/posts');
    const posts = await getAllPostIds();

    console.log('Posts para generar rutas:', posts); // Debug: ver qué posts estamos obteniendo

    return posts.map((post) => ({
      slug: post.slug, // Asegúrate de que este sea el slug real, no el ID
    }));
  } catch (error) {
    console.error('Error al generar rutas estáticas:', error);
    return [];
  }
}