// app/blog/page.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSortedPostsData } from '@/lib/posts';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]); // Estado para almacenar los posts
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const sortedPosts = await getSortedPostsData(); // Esperar la resolución de la promesa
        setPosts(sortedPosts); // Actualizar el estado con los posts
      } catch (error) {
        console.error('Error al obtener los posts:', error);
        alert('Ocurrió un error al cargar los posts.');
      } finally {
        setLoading(false); // Finalizar la carga
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>El Baúl de Fouché</h1>
      <ul>
        {posts.map(({ id, title, date }) => (
          <li key={id}>
            <Link href={`/blog/${id}`}>
              <h2>{title}</h2>
            </Link>
            <small>{date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}