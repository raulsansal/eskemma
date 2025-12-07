// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPostIds } from '@/lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    // Obtener todos los posts publicados
    const posts = await getAllPostIds();

    // Generar URLs de posts dinámicamente
    const postUrls = posts
      .filter(post => post.slug) // Solo posts con slug válido
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(), // ✅ Usar fecha actual (se actualiza al regenerar el sitemap)
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    // URLs estáticas del sitio
    const staticUrls = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/sefix`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/moddulo`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/monitor`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/cursos`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/servicios`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/recursos`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contacto`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.5,
      },
    ];

    // Combinar todas las URLs
    return [...staticUrls, ...postUrls];
  } catch (error) {
    console.error('Error generando sitemap:', error);
    
    // Retornar solo URLs estáticas si falla la obtención de posts
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ];
  }
}

/* 🚀 PARA PRODUCCIÓN: Si necesitas fechas exactas de actualización,
   modifica getAllPostIds() para que devuelva también updatedAt:
   
   interface PostForSitemap {
     slug: string;
     updatedAt: Date;
   }
   
   Y luego usa:
   lastModified: post.updatedAt,
*/