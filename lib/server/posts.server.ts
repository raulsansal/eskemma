// lib/server/posts.server.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
  const processedContent = await import('remark').then(async (mod) => {
    const remark = mod.remark;
    const remarkHtml = (await import('remark-html')).default; // Importar el valor predeterminado
    return remark().use(remarkHtml).process(matterResult.content);
  });

  const contentHtml = processedContent.toString();

  return {
    slug,
    content: matterResult.content, // Agregar el contenido en formato Markdown
    contentHtml, // Contenido convertido a HTML
    title: matterResult.data.title ?? 'Sin título',
    date: matterResult.data.date ?? 'Fecha desconocida',
    ...matterResult.data,
  };
}

export function updatePost(
  slug: string,
  updatedData: { title: string; date: string; content: string }
) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const newContent = `---
title: "${updatedData.title}"
date: "${updatedData.date}"
author: "Admin"
tags: []
---

${updatedData.content}`;
  fs.writeFileSync(fullPath, newContent);
}