// app/blog/[slug]/page.tsx
import { getPostData, getAdjacentPosts, calculateReadingTime, extractHeadings } from "@/lib/posts";
import SanitizedContent from "../../components/componentsBlog/SanitizedContent";
import { PostData } from "@/types/post.types";
import ViewCounter from "./ViewCounter";
import BackToButton from "./BackToButton";
import ReadingTime from "./ReadingTime";
import ShareButtons from "./ShareButtons";
import TableOfContents from "./TableOfContents";
import PostNavigation from "./PostNavigation";
import { getCategoryColor, getCategoryLabel } from "@/lib/constants/categories";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  console.log("Slug recibido:", slug);

  const postData = await getPostData(slug);

  if (!postData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-eske-10">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Post no encontrado
        </h1>
        <p className="text-lg text-gray-600">
          No se pudo encontrar el post con slug: {slug}
        </p>
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
    createdAt:
      postData.createdAt instanceof Date &&
      !isNaN(postData.createdAt.getTime())
        ? postData.createdAt
        : new Date(),
    updatedAt:
      postData.updatedAt instanceof Date &&
      !isNaN(postData.updatedAt.getTime())
        ? postData.updatedAt
        : new Date(),
    tags: postData.tags || [],
    metaTitle: postData.metaTitle || postData.title || "Sin título",
    metaDescription:
      postData.metaDescription || postData.content?.substring(0, 160) || "",
    keywords: postData.keywords || [],
  };

  const formattedDate =
    validatedPostData.updatedAt instanceof Date &&
    !isNaN(validatedPostData.updatedAt.getTime())
      ? validatedPostData.updatedAt.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Fecha no disponible";

  const readingTime = calculateReadingTime(validatedPostData.content);
  const headings = extractHeadings(validatedPostData.content);
  const { previous, next } = await getAdjacentPosts(slug);

  const categoryColor = getCategoryColor(validatedPostData.category);
  const categoryLabel = getCategoryLabel(validatedPostData.category);

  return (
    <div className="min-h-screen bg-gray-eske-10 py-8 px-4 sm:px-6 lg:px-8">
      <ViewCounter postId={validatedPostData.id} slug={validatedPostData.slug} />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna principal - Contenido del post */}
          <div className="flex-1 lg:w-2/3">
            <BackToButton />

            <article className="bg-white-eske rounded-lg shadow-md p-6 sm:p-8">
              {/* Categoría */}
              <div className="mb-4">
                <span
                  className="inline-block px-3 py-1 text-sm font-semibold rounded-full text-white"
                  style={{ backgroundColor: categoryColor }}
                >
                  {categoryLabel}
                </span>
              </div>

              {/* Título */}
              <h1 className="text-3xl sm:text-4xl font-bold text-bluegreen-eske mb-6">
                {validatedPostData.title}
              </h1>

              {/* Fecha, Autor y Metadata */}
              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-eske-20">
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

                <ReadingTime minutes={readingTime} />
              </div>

              {/* Botones para compartir */}
              <ShareButtons title={validatedPostData.title} slug={slug} />

              {/* Imagen Destacada */}
              {validatedPostData.featureImage && (
                <img
                  src={validatedPostData.featureImage}
                  alt={`Imagen destacada para ${validatedPostData.title}`}
                  className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8 shadow-lg"
                />
              )}

              {/* Contenido del Post */}
              <div className="prose prose-lg max-w-none">
                <SanitizedContent
                  content={validatedPostData.content}
                  className="markdown-content"
                />
              </div>

              {/* Tags si existen */}
              {validatedPostData.tags && validatedPostData.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-eske-20">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Etiquetas:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {validatedPostData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 text-sm bg-gray-eske-10 text-gray-700 rounded-full hover:bg-bluegreen-eske hover:text-white-eske transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Navegación entre posts */}
            <PostNavigation previous={previous} next={next} />
          </div>

          {/* Sidebar - Tabla de Contenidos */}
          {headings.length > 0 && (
            <aside className="hidden lg:block lg:w-1/3">
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>
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