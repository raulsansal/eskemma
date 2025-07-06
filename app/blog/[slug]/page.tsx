// app/blog/[slug]/page.tsx

import { getPostData } from '@/lib/posts';

export default async function PostPage({ params }: { params: { slug: string } }) {
  // Asegurarse de que `params.slug` sea tratado como asíncrono
  const { slug } = await Promise.resolve(params);

  // Obtener los datos del post usando el slug
  const postData = await getPostData(slug);

  return (
    <div>
      <h1>{postData.title}</h1>
      <small>{postData.date}</small>
      {/* Renderizar el contenido HTML del post */}
      <article dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
    </div>
  );
}

// Generar rutas estáticas para los posts
export async function generateStaticParams() {
  const posts = await import('@/lib/posts').then((mod) => mod.getAllPostIds());
  return posts;
}