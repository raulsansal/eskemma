// lib/client/posts.client.ts

import { collection, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

interface CreatePostData {
  title: string;
  content: string;
  slug: string;
  status: 'draft' | 'published';
  author: { uid: string; displayName: string; email: string };
  featureImage?: string;
  tags?: string[];
  date?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

interface UpdatePostData extends CreatePostData {
  likes?: number;
  views?: number;
}

export async function createPost(newPostData: CreatePostData) {
  try {
    const postsCollection = collection(db, "posts");
    const newPostRef = doc(postsCollection);
    
    await setDoc(newPostRef, {
      ...newPostData,
      likes: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      date: newPostData.date ? new Date(newPostData.date) : new Date(),
    });

    return { id: newPostRef.id };
  } catch (error) {
    console.error('Error al crear el post:', error);
    throw new Error('Error al crear el post');
  }
}

export async function updatePost(
  postId: string, 
  updatedPostData: UpdatePostData
) {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      ...updatedPostData,
      updatedAt: new Date(),
      date: updatedPostData.date ? new Date(updatedPostData.date) : new Date(),
    });
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    throw new Error('Error al actualizar el post');
  }
}

export async function getPostData(postId: string) {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      return null;
    }

    const data = postSnapshot.data();
    
    return {
      id: postSnapshot.id,
      title: data.title,
      content: data.content,
      slug: data.slug,
      status: data.status,
      author: data.author,
      featureImage: data.featureImage || '',
      tags: data.tags || [],
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      likes: data.likes || 0,
      views: data.views || 0,
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.content?.substring(0, 160),
      keywords: data.keywords || data.tags || [],
    };
  } catch (error) {
    console.error("Error al obtener los datos del post:", error);
    throw error;
  }  
}

export async function getPosts() {
  try {
    const postsCollection = collection(db, "posts");
    const querySnapshot = await getDocs(postsCollection);

    const posts: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        title: data.title,
        date: data.date?.toDate(),
        status: data.status,
      });
    });

    return posts;
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    throw new Error("Ocurrió un error al cargar los posts.");
  }
}

export async function deletePost(postId: string) {
  try {
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error("Error al eliminar el post:", error);
    throw new Error("Ocurrió un error al eliminar el post.");
  }
}