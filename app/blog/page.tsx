// app/blog/page.tsx
import Link from "next/link";
import { remark } from "remark";
import remarkHtml from "remark-html";
import DOMPurify from "isomorphic-dompurify";
import { 
  getFilteredPosts, 
  getPopularPosts, 
  getCategoryCounts, 
  getAllTags 
} from "@/lib/posts";
import { PopularPostItem } from "@/types/post.types";
import FoucheHeroSection from "./FoucheHeroSection";
import Pagination from "../components/componentsBlog/Pagination";
import BlogToolbar from "../components/componentsBlog/BlogToolbar";
import Sidebar from "../components/componentsBlog/Sidebar";

interface BlogPageProps {
  searchParams: Promise<{ 
    page?: string; 
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  try {
    // ✅ AWAIT searchParams antes de usarlo
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const selectedCategory = params.category || "todos";
    const searchTerm = params.search || "";
    const sortBy = (params.sort as 'newest' | 'oldest' | 'popular') || "newest";
    const postsPerPage = 6;

    // Obtener posts con todos los filtros aplicados
    const { posts: sortedPosts, totalPages, totalPosts } = await getFilteredPosts(
      currentPage,
      postsPerPage,
      selectedCategory === "todos" ? null : selectedCategory,
      searchTerm || null,
      sortBy
    );

    // ✅ Obtener datos para el sidebar
    const [popularPostsRaw, categoryCounts, allTags] = await Promise.all([
      getPopularPosts(5),
      getCategoryCounts(),
      getAllTags(),
    ]);

    // ✅ Procesar posts populares con tipo correcto
    const popularPosts: PopularPostItem[] = popularPostsRaw.map((post) => ({
      id: post.id || "",
      title: post.title || "Sin título",
      slug: post.slug || "",
      views: post.views || 0,
      featureImage: post.featureImage || undefined,
    }));

    // Procesar posts para mostrar
    const publishedPosts = sortedPosts.map(async (post) => {
      const excerptHtml = await remark()
        .use(remarkHtml)
        .process(post.content.substring(0, 160) + "...");

      const sanitizedExcerpt = DOMPurify.sanitize(excerptHtml.toString());

      const validatedDate =
        post.updatedAt instanceof Date && !isNaN(post.updatedAt.getTime())
          ? post.updatedAt
          : new Date();

      return {
        id: post.id || "",
        title: post.title || "Sin título",
        date: validatedDate,
        excerpt: sanitizedExcerpt,
        slug: post.slug || "",
        author: post.author?.displayName || "Desconocido",
        featureImage: post.featureImage || undefined,
        category: post.category,
        views: post.views || 0,
      };
    });

    const resolvedPosts = await Promise.all(publishedPosts);

    return (
      <main className="min-h-screen bg-white-eske">
        {/* Hero Section */}
        <FoucheHeroSection />

        {/* Sección de Posts */}
        <section className="bg-gray-eske-10 min-h-[580px] py-12 px-4 sm:px-6 md:px-8">
          <div className="w-[90%] mx-auto max-w-screen-xl">
            <p className="text-center text-black-eske-80 mb-8 text-lg">
              Explora nuestros artículos sobre política, estrategia y análisis
              electoral
            </p>

            {/* Barra de herramientas (Filtros, Búsqueda, Ordenamiento) */}
            <BlogToolbar />

            {/* Contador de posts */}
            <div className="mb-8 text-center">
              {totalPosts === 0 ? (
                <p className="text-gray-600 text-sm">
                  No se encontraron artículos con los filtros seleccionados
                </p>
              ) : (
                <p className="text-gray-600 text-sm">
                  Mostrando{" "}
                  <span className="font-semibold text-bluegreen-eske">
                    {totalPosts}
                  </span>{" "}
                  {totalPosts === 1 ? "artículo" : "artículos"}
                  {searchTerm && (
                    <span className="text-gray-700">
                      {" "}
                      para <span className="font-medium">"{searchTerm}"</span>
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* ✅ LAYOUT CON SIDEBAR: Posts (izquierda) + Sidebar (derecha) */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Columna principal - Posts */}
              <div className="flex-1 lg:w-2/3">
                {resolvedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-24 w-24 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-xl text-gray-eske-60 mb-2">
                      No se encontraron resultados
                    </p>
                    <p className="text-gray-500 mb-4">
                      Intenta ajustar los filtros o términos de búsqueda
                    </p>
                    <Link
                      href="/blog"
                      className="inline-block px-6 py-2 bg-bluegreen-eske text-white-eske rounded-lg hover:bg-bluegreen-eske-70 transition-colors duration-300"
                    >
                      Limpiar filtros
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Grid de posts - 2 columnas en desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {resolvedPosts.map(
                        ({
                          id,
                          title,
                          date,
                          excerpt,
                          slug,
                          author,
                          featureImage,
                          views,
                        }) => (
                          <div
                            key={id}
                            className="flex flex-col items-center text-center bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
                          >
                            {featureImage && (
                              <img
                                src={featureImage}
                                alt={`Imagen destacada para ${title}`}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                              />
                            )}

                            <h3 className="text-xl text-bluegreen-eske-60 font-semibold mb-2 hover:text-bluegreen-eske transition-colors duration-300">
                              <Link href={`/blog/${slug}`}>{title}</Link>
                            </h3>

                            <div
                              className="text-[16px] font-light text-gray-eske-90 mb-4 line-clamp-3"
                              dangerouslySetInnerHTML={{ __html: excerpt }}
                            />

                            <div className="flex justify-between w-full text-sm text-gray-700 mb-4 px-2">
                              <small className="text-gray-eske-60">
                                {date.toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </small>
                              <small className="text-bluegreen-eske font-medium">
                                {author}
                              </small>
                            </div>

                            {/* Mostrar vistas si está ordenado por popularidad */}
                            {sortBy === "popular" && (
                              <div className="w-full text-xs text-gray-500 mb-2 flex items-center justify-center gap-1">
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
                                {views} {views === 1 ? "vista" : "vistas"}
                              </div>
                            )}

                            <Link
                              href={`/blog/${slug}`}
                              className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px]"
                            >
                              Leer completo →
                            </Link>
                          </div>
                        )
                      )}
                    </div>

                    {/* Componente de Paginación */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      categoryFilter={selectedCategory}
                      searchQuery={searchTerm}
                      sortBy={sortBy}
                    />
                  </>
                )}
              </div>

              {/* ✅ Sidebar - Oculto en móvil, visible en desktop */}
              <aside className="hidden lg:block lg:w-1/3">
                <Sidebar
                  popularPosts={popularPosts}
                  categoryCounts={categoryCounts}
                  tags={allTags}
                />
              </aside>
            </div>

            {/* ✅ Sidebar para móvil - Al final del contenido */}
            <div className="lg:hidden mt-12">
              <Sidebar
                popularPosts={popularPosts}
                categoryCounts={categoryCounts}
                tags={allTags}
              />
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">
            Ocurrió un error al cargar los posts.
          </p>
          <p className="text-gray-600">
            Por favor, inténtalo de nuevo más tarde.
          </p>
        </div>
      </div>
    );
  }
}