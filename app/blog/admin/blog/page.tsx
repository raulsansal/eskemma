// app/blog/admin/blog/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPosts, deletePost } from '@/lib/client/posts.client';

interface PostData {
  id: string;
  title: string;
  date: Date;
  status: 'draft' | 'published';
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
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error al obtener los posts:', error);
        alert('Ocurrió un error al cargar los posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Definir handleDelete antes del JSX
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
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Gestión de Posts</h1>
      <Link href="/blog/admin/blog/edit/new">
        <button style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Crear Nuevo Post
        </button>
      </Link>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h3>{post.title}</h3>
            <p>
              <strong>Estado:</strong> {post.status} |{' '}
              <strong>Fecha:</strong> {new Date(post.date).toLocaleDateString()}
            </p>
            <div>
              <Link href={`/blog/admin/blog/edit/${post.id}`}>
                <button style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Editar
                </button>
              </Link>
              <button
                onClick={() => handleDelete(post.id)}
                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}