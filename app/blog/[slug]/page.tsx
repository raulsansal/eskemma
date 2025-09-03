// app/blog/[slug]/page.tsx
import { getPostData } from "@/lib/posts";
import SanitizedContent from "../../components/componentsBlog/SanitizedContent";
import { PostData } from "@/lib/types";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
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
    date: postData.updatedAt instanceof Date && !isNaN(postData.updatedAt.getTime())
      ? postData.updatedAt
      : new Date(),
    content: postData.content || "",
    featureImage: postData.featureImage || undefined,
    slug: postData.slug || "", // Asegurarse de que siempre haya un slug
    status: postData.status || "draft",
    author: postData.author || {
      uid: "",
      displayName: "Desconocido",
      email: "correo@desconocido.com",
    },
    likes: postData.likes || 0, // Valor por defecto
    views: postData.views || 0, // Valor por defecto
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
    validatedPostData.date instanceof Date && !isNaN(validatedPostData.date.getTime())
      ? validatedPostData.date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Fecha no disponible";

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <h1 className="text-4xl font-bold text-bluegreen-eske mb-6">{validatedPostData.title}</h1>

        {/* Fecha, Autor y Correo Electrónico */}
        <div className="mb-8">
          <small className="text-base text-gray-500 leading-relaxed">{formattedDate}</small>
          <p className="text-sm text-gray-600 font-bold leading-relaxed">
            Por {validatedPostData.author?.displayName || "Desconocido"}
          </p>
          <p className="text-sm text-blue-eske-60">
            {validatedPostData.author?.email || "correo@desconocido.com"}
          </p>
        </div>

        {/* Imagen Destacada */}
        {validatedPostData.featureImage && (
          <img
            src={validatedPostData.featureImage}
            alt={`Imagen destacada para ${validatedPostData.title}`}
            className="w-full h-128 object-cover rounded-lg mb-8"
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