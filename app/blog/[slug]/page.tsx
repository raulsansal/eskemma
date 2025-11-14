// app/blog/[slug]/page.tsx
import { getPostData } from "@/lib/posts";
import SanitizedContent from "../../components/componentsBlog/SanitizedContent";
import { PostData } from "@/types/post.types";
import ViewCounter from "./ViewCounter";

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  console.log("Slug recibido:", slug);

  const postData = await getPostData(slug);

  if (!postData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[--background] text-[--foreground]">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Post no encontrado</h1>
        <p className="text-lg text-gray-600">No se pudo encontrar el post con slug: {slug}</p>
      </div>
    );
  }

  console.log("Datos del post recibidos:", postData);

  const validatedPostData: PostData = {
    id: postData.id || "",
    title: postData.title || "Sin título",
    content: postData.content || "",
    category: postData.category || "General",
    featureImage: postData.featureImage || undefined,
    slug: postData.slug || "",
    status: postData.status || "draft",
    author: postData.author || {
      uid: "",
      displayName: "Desconocido",
      email: "correo@desconocido.com",
    },
    likes: postData.likes || 0,
    views: postData.views || 0,
    createdAt: postData.createdAt instanceof Date && !isNaN(postData.createdAt.getTime())
      ? postData.createdAt
      : new Date(),
    updatedAt: postData.updatedAt instanceof Date && !isNaN(postData.updatedAt.getTime())
      ? postData.updatedAt
      : new Date(),
    tags: postData.tags || [],
    metaTitle: postData.metaTitle || postData.title || "Sin título",
    metaDescription: postData.metaDescription || postData.content?.substring(0, 160) || "",
    keywords: postData.keywords || [],
  };

  const formattedDate =
    validatedPostData.updatedAt instanceof Date && !isNaN(validatedPostData.updatedAt.getTime())
      ? validatedPostData.updatedAt.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Fecha no disponible";

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground] py-8 px-4 sm:px-6 lg:px-8">
      {/* ✅ AGREGAR EL CONTADOR DE VISTAS */}
      <ViewCounter postId={validatedPostData.id} slug={validatedPostData.slug} />

      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <h1 className="text-4xl font-bold text-bluegreen-eske mb-6">
          {validatedPostData.title}
        </h1>

        {/* Fecha, Autor y Metadata */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="font-medium">
              {validatedPostData.author?.displayName || "Desconocido"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>{validatedPostData.views} vistas</span>
          </div>
        </div>

        {/* Imagen Destacada */}
        {validatedPostData.featureImage && (
          <img
            src={validatedPostData.featureImage}
            alt={`Imagen destacada para ${validatedPostData.title}`}
            className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-lg"
          />
        )}

        {/* Contenido del Post */}
        <article className="prose prose-lg max-w-none">
          <SanitizedContent
            content={validatedPostData.content}
            className="text-[--foreground]"
          />
        </article>

        {/* Tags si existen */}
        {validatedPostData.tags && validatedPostData.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Etiquetas:
            </h3>
            <div className="flex flex-wrap gap-2">
              {validatedPostData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-bluegreen-eske hover:text-white-eske transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const { getAllPostIds } = await import("@/lib/posts");
    const posts = await getAllPostIds();

    console.log("Posts para generar rutas:", posts);

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error al generar rutas estáticas:", error);
    return [];
  }
}
