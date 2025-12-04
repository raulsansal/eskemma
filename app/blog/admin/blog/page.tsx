// app/blog/admin/blog/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPosts, deletePost } from '@/lib/client/posts.client';

// ✅ Importar el tipo correcto desde el archivo que lo define
// NO usar PostData de types/post.types.ts porque es diferente
interface PostData {
  id: string;
  title: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await getPosts();
        
        // ✅ Mapear solo los campos que necesitamos
        const simplifiedPosts: PostData[] = fetchedPosts.map((post) => ({
          id: post.id,
          title: post.title,
          status: post.status,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        }));
        
        setPosts(simplifiedPosts);
      } catch (error) {
        console.error('Error al obtener los posts:', error);
        alert('Ocurrió un error al cargar los posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este post?')) return;

    try {
      await deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      alert('Post eliminado exitosamente.');
    } catch (error) {
      console.error('Error al eliminar el post:', error);
      alert('Ocurrió un error al eliminar el post.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bluegreen-eske mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header con botón */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Posts</h2>
          <p className="text-gray-600 mt-1">Administra todos tus artículos del blog</p>
        </div>
        <Link href="/blog/admin/blog/edit/new">
          <button className="flex items-center gap-2 px-6 py-3 bg-bluegreen-eske text-white rounded-lg hover:bg-bluegreen-eske-70 transition-colors font-semibold shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Nuevo Post
          </button>
        </Link>
      </div>

      {/* Lista de posts */}
      {posts.length === 0 ? (
        <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 p-12 text-center">
          <svg
            className="w-20 h-20 mx-auto mb-4 text-gray-eske-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No hay posts aún</h3>
          <p className="text-gray-600 mb-6">Comienza creando tu primer artículo</p>
          <Link href="/blog/admin/blog/edit/new">
            <button className="px-6 py-3 bg-bluegreen-eske text-white rounded-lg hover:bg-bluegreen-eske-70 transition-colors font-semibold">
              Crear Primer Post
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white-eske rounded-lg shadow-md border border-gray-eske-30 p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(post.updatedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.status === 'published'
                          ? 'bg-green-eske-20 text-green-eske-80'
                          : 'bg-yellow-eske-20 text-yellow-eske-80'
                      }`}
                    >
                      {post.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/blog/admin/blog/edit/${post.id}`}>
                    <button className="px-4 py-2 bg-blue-eske text-white rounded-lg hover:bg-blue-eske-70 transition-colors font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-4 py-2 bg-red-eske text-white rounded-lg hover:bg-red-eske-70 transition-colors font-semibold flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}