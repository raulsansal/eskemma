// app/blog/page.tsx
import Link from 'next/link';

// Importar la función del servidor
import { getSortedPostsData } from '@/lib/posts';

// Definir la interfaz PostData
interface PostData {
  id: string;
  title: string;
  date: Date;
  content: string;
  featureImage?: string;
  status: 'draft' | 'published';
  slug: string; // AÑADIDO: slug necesario para las URLs
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Componente principal (Server Component)
export default async function BlogPage() {
  try {
    // Obtener los datos de los posts
    const sortedPosts = await getSortedPostsData();

    // Filtrar solo los posts publicados y asegurar que coincidan con la interfaz
    const publishedPosts = sortedPosts
      .filter((post) => post.status === 'published')
      .map((post) => ({
        id: post.id || '',
        title: post.title || 'Sin título',
        date: post.date ? new Date(post.date) : new Date(),
        content: post.content || '',
        featureImage: post.featureImage || undefined,
        status: post.status || 'draft',
        slug: post.slug || '', // AÑADIDO: incluir el slug
        metaTitle: post.metaTitle || post.title || 'Sin título',
        metaDescription: post.metaDescription || post.content?.substring(0, 160) || '',
        keywords: post.keywords || [],
      }));

    return (
      <div>
        <h1>El Baúl de Fouché</h1>
        <ul>
          {publishedPosts.map(({ id, title, date, featureImage, slug }) => (
            <li key={id} style={{ marginBottom: '20px' }}>
              {featureImage && (
                <img
                  src={featureImage}
                  alt={`Imagen destacada para ${title}`}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              )}
              {/* CORRECCIÓN: Usar slug en lugar de id */}
              <Link href={`/blog/${slug}`}>
                <h2>{title}</h2>
              </Link>
              <small>{new Date(date).toLocaleDateString()}</small>
              
              {/* Debug temporal: mostrar tanto el ID como el slug */}
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Debug - ID: {id} | Slug: {slug}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    return <div>Ocurrió un error al cargar los posts. Por favor, inténtalo de nuevo más tarde.</div>;
  }
}