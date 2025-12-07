// app/blog/[slug]/page.tsx
import { Metadata } from "next"; // ✅ NUEVO
import {
  getPostData,
  getAdjacentPosts,
  calculateReadingTime,
  extractHeadings,
  getRelatedPosts,
} from "@/lib/posts";
import { getResourcesByCategory } from "@/lib/resources";
import { generatePostSEO, generateArticleStructuredData } from "@/lib/seo"; // ✅ NUEVO
import Link from "next/link";
import SanitizedContent from "../../components/componentsBlog/SanitizedContent";
import { PostData } from "@/types/post.types";
import ViewCounter from "./ViewCounter";
import BackToButton from "./BackToButton";
import ReadingTime from "./ReadingTime";
import ShareButtons from "./ShareButtons";
import PostNavigation from "./PostNavigation";
import PostReactions from "./PostReactions";
import { getCategoryColor, getCategoryLabel } from "@/lib/constants/categories";
import SaveForLater from "./SaveForLater";
import CommentSection from "./CommentSection";
import PostSidebar from "./PostSidebar";

// ✅ NUEVO: Generar metadata dinámica para SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const postData = await getPostData(slug);

  if (!postData) {
    return {
      title: "Post no encontrado - El Baúl de Fouché",
      description: "El post que buscas no existe o ha sido eliminado",
    };
  }

  const seoData = generatePostSEO(postData);

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    authors: [{ name: seoData.author || "Eskemma" }],
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: seoData.url,
      siteName: "El Baúl de Fouché - Eskemma",
      images: [
        {
          url: seoData.image,
          width: 1200,
          height: 630,
          alt: seoData.title,
        },
      ],
      locale: "es_MX",
      type: "article",
      publishedTime: seoData.publishedTime,
      modifiedTime: seoData.modifiedTime,
      authors: [seoData.author || "Eskemma"],
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.title,
      description: seoData.description,
      images: [seoData.image],
      creator: "@eskemma", // ✅ Cambiar por tu handle de Twitter/X
    },
    alternates: {
      canonical: seoData.url,
    },
  };
}

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
        <Link
          href="/blog"
          className="mt-6 px-6 py-3 bg-bluegreen-eske text-white rounded-lg hover:bg-bluegreen-eske-70 transition-colors font-semibold"
        >
          Volver al blog
        </Link>
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
      postData.createdAt instanceof Date && !isNaN(postData.createdAt.getTime())
        ? postData.createdAt
        : new Date(),
    updatedAt:
      postData.updatedAt instanceof Date && !isNaN(postData.updatedAt.getTime())
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

  // Obtener datos para el sidebar
  const relatedPosts = await getRelatedPosts(
    slug,
    validatedPostData.category,
    4
  );

  const resources = await getResourcesByCategory(
    validatedPostData.category,
    validatedPostData.id,
    3
  );

  const categoryColor = getCategoryColor(validatedPostData.category);
  const categoryLabel = getCategoryLabel(validatedPostData.category);

  // ✅ NUEVO: Generar SEO data y structured data
  const seoData = generatePostSEO(validatedPostData);
  const structuredData = generateArticleStructuredData(validatedPostData, seoData);

  return (
    <>
      {/* ✅ NUEVO: JSON-LD Structured Data para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-eske-10 py-8 px-4 sm:px-6 lg:px-8">
        <ViewCounter
          postId={validatedPostData.id}
          slug={validatedPostData.slug}
        />

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
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      Etiquetas:
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-eske-90">
                      {validatedPostData.tags.map((tag, index) => (
                        <span key={tag} className="flex items-center">
                          {index > 0 && <span className="mr-2">|</span>}
                          <Link
                            href={`/blog?search=${encodeURIComponent(tag)}`}
                            className="hover:text-bluegreen-eske transition-colors"
                          >
                            {tag}
                          </Link>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botones compartir + Me gusta en la misma línea */}
                <div className="mt-8 pt-6 border-t border-gray-eske-20">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Me gusta (izquierda) */}
                    <div className="w-full sm:w-auto">
                      <PostReactions
                        postId={validatedPostData.id}
                        initialLikes={validatedPostData.likes}
                      />
                    </div>

                    {/* Compartir (derecha) */}
                    <div className="w-full sm:w-auto">
                      <ShareButtons title={validatedPostData.title} slug={slug} />
                    </div>
                  </div>
                </div>

                {/* Guardar para leer después */}
                <SaveForLater
                  postId={validatedPostData.id}
                  postTitle={validatedPostData.title}
                  postSlug={validatedPostData.slug}
                />
              </article>

              {/* Sistema de comentarios */}
              <CommentSection postId={validatedPostData.id} />

              {/* Navegación entre posts */}
              <nav className="mt-16 pt-8 border-t border-gray-eske-30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Continuar leyendo
                  </h3>

                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-bluegreen-eske hover:text-bluegreen-eske-70 transition-colors duration-200 font-medium text-sm"
                  >
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    <span>Volver al blog</span>
                  </Link>
                </div>

                <PostNavigation previous={previous} next={next} />
              </nav>
            </div>

            {/* Sidebar unificado */}
            <PostSidebar
              headings={headings}
              relatedPosts={relatedPosts}
              resources={resources}
              currentCategory={validatedPostData.category}
            />
          </div>
        </div>
      </div>
    </>
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