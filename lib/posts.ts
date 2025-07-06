//lib/posts.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// Importar remark y remark-html estáticamente
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content', 'blog');

export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);

  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      id,
      title: matterResult.data.title ?? 'Sin título',
      date: matterResult.data.date ?? 'Fecha desconocida',
      ...matterResult.data,
    };
  });

  return allPostsData.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => ({
    params: {
      slug: fileName.replace(/\.md$/, ''),
    },
  }));
}

export async function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  // Convertir Markdown a HTML usando remark
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    title: matterResult.data.title ?? 'Sin título',
    date: matterResult.data.date ?? 'Fecha desconocida',
    ...matterResult.data,
  };
}