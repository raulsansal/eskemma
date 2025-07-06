import { redirect } from 'next/navigation';

export default function NewPostPage() {
  async function createPost(formData: FormData) {
    'use server';

    const title = formData.get('title');
    const content = formData.get('content');

    if (!title || !content) return;

    // Guardar el post como archivo Markdown
    const newPost = `---
title: "${title}"
date: "${new Date().toISOString().split('T')[0]}"
author: "Admin"
tags: []
---

${content}`;

    const fs = require('fs');
    const path = require('path');
    const postsDirectory = path.join(process.cwd(), 'content', 'blog');
    const fileName = `${Date.now()}.md`;
    fs.writeFileSync(path.join(postsDirectory, fileName), newPost);

    redirect('/blog');
  }

  return (
    <form action={createPost}>
      <h1>Crear Nuevo Post</h1>
      <label>
        Título:
        <input type="text" name="title" required />
      </label>
      <label>
        Contenido (Markdown):
        <textarea name="content" required />
      </label>
      <button type="submit">Guardar</button>
    </form>
  );
}