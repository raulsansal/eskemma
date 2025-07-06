// app/blog/page.tsx

import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function BlogPage() {
  // Usar getSortedPostsData para obtener una lista de posts
  const posts = getSortedPostsData();

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