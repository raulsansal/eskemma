// app/blog/[slug]/page.tsx
import { getPostData } from '@/lib/posts';
import SanitizedContent from '../../components/componentsBlog/SanitizedContent'; // Importar el nuevo componente

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
      <div>
        <h1>Post no encontrado</h1>
        <p>No se pudo encontrar el post con slug: {slug}</p>
      </div>
    );
  }

  // Validar y asignar valores predeterminados si es necesario
  const validatedPostData: PostData = {
    id: postData.id || '',
    title: postData.title || 'Sin título',
    date: postData.date ? new Date(postData.date) : new Date(),
    content: postData.content || '',
    featureImage: postData.featureImage || undefined,
    status: postData.status || 'draft',
    metaTitle: postData.metaTitle || postData.title || 'Sin título',
    metaDescription: postData.metaDescription || postData.content?.substring(0, 160) || '',
    keywords: postData.keywords || [],
  };

  return (
    <div>
      <h1>{validatedPostData.title}</h1>
      <small>{new Date(validatedPostData.date).toLocaleDateString()}</small>
      {validatedPostData.featureImage && (
        <img
          src={validatedPostData.featureImage}
          alt={`Imagen destacada para ${validatedPostData.title}`}
          style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', marginTop: '20px' }}
        />
      )}
      {/* CORRECCIÓN: Usar el componente SanitizedContent en lugar de sanitizar directamente */}
      <SanitizedContent content={validatedPostData.content} />
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