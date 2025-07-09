// lib/posts.ts

if (typeof window !== 'undefined') {
  throw new Error('Este archivo solo debe ser importado en el servidor.');
}

import { getSortedPostsData as serverGetSortedPostsData } from './server/posts.server';
import { getAllPostIds as serverGetAllPostIds } from './server/posts.server';
import { getPostData as serverGetPostData } from './server/posts.server';
import { updatePost as serverUpdatePost } from './server/posts.server';

export function getSortedPostsData() {
  return serverGetSortedPostsData();
}

export function getAllPostIds() {
  return serverGetAllPostIds();
}

export async function getPostData(slug: string) {
  return serverGetPostData(slug);
}

export function updatePost(slug: string, updatedData: { title: string; date: string; content: string }) {
  return serverUpdatePost(slug, updatedData);
}