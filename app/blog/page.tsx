// app/blog/page.tsx
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
import Sidebar from "../components/componentsBlog/Sidebar";
import BlogContent from "./BlogContent";

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

    // Obtener datos para el sidebar
    const [popularPostsRaw, categoryCounts, allTags] = await Promise.all([
      getPopularPosts(5),
      getCategoryCounts(),
      getAllTags(),
    ]);

    // Procesar posts populares
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
              Explora nuestros artículos sobre estrategia, análisis
              electoral y comunicación política.
            </p>

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
                      para <span className="font-medium">&quot;{searchTerm}&quot;</span>
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Layout con Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Columna principal - Posts */}
              <div className="flex-1 lg:w-2/3">
                {/* ✅ Componente cliente con ViewToggle */}
                <BlogContent posts={resolvedPosts} sortBy={sortBy} />

                {/* Paginación */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  categoryFilter={selectedCategory}
                  searchQuery={searchTerm}
                  sortBy={sortBy}
                />
              </div>

              {/* Sidebar - Desktop */}
              <aside className="hidden lg:block lg:w-1/3">
                <Sidebar
                  popularPosts={popularPosts}
                  categoryCounts={categoryCounts}
                  tags={allTags}
                />
              </aside>
            </div>

            {/* Sidebar - Móvil */}
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