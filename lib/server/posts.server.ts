// lib/server/posts.server.ts
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

/**
 * Interfaz para representar un post en Firestore.
 */
export interface Post {
  id?: string;
  title: string;
  content: string;
  category: string;
  featureImage?: string | null;
  author: {
    uid: string;
    displayName: string;
    email: string;
  };
  tags?: string[];
  slug: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  likes?: number;
  views?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

/**
 * Obtiene todos los posts ordenados por fecha.
 */
export async function getSortedPostsData(): Promise<Post[]> {
  const postsRef = collection(db, "posts");
  const q = query(
    postsRef,
    where("status", "==", "published"),
    orderBy("updatedAt", "desc")
  );
  const querySnapshot = await getDocs(q);

  const posts: Post[] = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "Sin título",
      content: data.content || "",
      category: data.category || "tactica",
      featureImage: data.featureImage || undefined,
      author: data.author || {
        uid: "",
        displayName: "Desconocido",
        email: "",
      },
      tags: data.tags || [],
      slug: data.slug || "",
      status: data.status || "draft",
      createdAt: data.createdAt
        ? new Date(data.createdAt.toDate())
        : new Date(),
      updatedAt: data.updatedAt
        ? new Date(data.updatedAt.toDate())
        : new Date(),
      likes: data.likes || 0,
      views: data.views || 0,
      metaTitle: data.metaTitle || data.title || "Sin título",
      metaDescription:
        data.metaDescription || data.content?.substring(0, 160) || "",
      keywords: data.keywords || [],
    };
  });

  return posts;
}

/**
 * Obtiene posts paginados
 */
export async function getPaginatedPosts(
  page: number = 1,
  postsPerPage: number = 6
): Promise<{ posts: Post[]; totalPages: number; totalPosts: number }> {
  const postsRef = collection(db, "posts");
  const q = query(
    postsRef,
    where("status", "==", "published"),
    orderBy("updatedAt", "desc")
  );

  const querySnapshot = await getDocs(q);

  const allPosts: Post[] = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "Sin título",
      content: data.content || "",
      category: data.category || "tactica",
      featureImage: data.featureImage || undefined,
      author: data.author || {
        uid: "",
        displayName: "Desconocido",
        email: "",
      },
      tags: data.tags || [],
      slug: data.slug || "",
      status: data.status || "draft",
      createdAt: data.createdAt
        ? new Date(data.createdAt.toDate())
        : new Date(),
      updatedAt: data.updatedAt
        ? new Date(data.updatedAt.toDate())
        : new Date(),
      likes: data.likes || 0,
      views: data.views || 0,
      metaTitle: data.metaTitle || data.title || "Sin título",
      metaDescription:
        data.metaDescription || data.content?.substring(0, 160) || "",
      keywords: data.keywords || [],
    };
  });

  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    totalPages,
    totalPosts,
  };
}

/**
 * Obtiene posts paginados con filtro por categoría
 */
export async function getPaginatedPostsByCategory(
  page: number = 1,
  postsPerPage: number = 6,
  category: string | null = null
): Promise<{ posts: Post[]; totalPages: number; totalPosts: number }> {
  const postsRef = collection(db, "posts");

  const q = query(
    postsRef,
    where("status", "==", "published"),
    orderBy("updatedAt", "desc")
  );

  const querySnapshot = await getDocs(q);

  let allPosts: Post[] = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "Sin título",
      content: data.content || "",
      category: data.category || "tactica",
      featureImage: data.featureImage || undefined,
      author: data.author || {
        uid: "",
        displayName: "Desconocido",
        email: "",
      },
      tags: data.tags || [],
      slug: data.slug || "",
      status: data.status || "draft",
      createdAt: data.createdAt
        ? new Date(data.createdAt.toDate())
        : new Date(),
      updatedAt: data.updatedAt
        ? new Date(data.updatedAt.toDate())
        : new Date(),
      likes: data.likes || 0,
      views: data.views || 0,
      metaTitle: data.metaTitle || data.title || "Sin título",
      metaDescription:
        data.metaDescription || data.content?.substring(0, 160) || "",
      keywords: data.keywords || [],
    };
  });

  if (category && category !== "todos") {
    allPosts = allPosts.filter((post) => post.category === category);
  }

  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    totalPages,
    totalPosts,
  };
}

/**
 * Obtiene posts paginados con filtros avanzados
 */
export async function getFilteredPosts(
  page: number = 1,
  postsPerPage: number = 6,
  category: string | null = null,
  searchTerm: string | null = null,
  sortBy: "newest" | "oldest" | "popular" = "newest"
): Promise<{ posts: Post[]; totalPages: number; totalPosts: number }> {
  const postsRef = collection(db, "posts");

  const q = query(
    postsRef,
    where("status", "==", "published"),
    orderBy("updatedAt", "desc")
  );

  const querySnapshot = await getDocs(q);

  let allPosts: Post[] = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "Sin título",
      content: data.content || "",
      category: data.category || "tactica",
      featureImage: data.featureImage || undefined,
      author: data.author || {
        uid: "",
        displayName: "Desconocido",
        email: "",
      },
      tags: data.tags || [],
      slug: data.slug || "",
      status: data.status || "draft",
      createdAt: data.createdAt
        ? new Date(data.createdAt.toDate())
        : new Date(),
      updatedAt: data.updatedAt
        ? new Date(data.updatedAt.toDate())
        : new Date(),
      likes: data.likes || 0,
      views: data.views || 0,
      metaTitle: data.metaTitle || data.title || "Sin título",
      metaDescription:
        data.metaDescription || data.content?.substring(0, 160) || "",
      keywords: data.keywords || [],
    };
  });

  if (category && category !== "todos") {
    allPosts = allPosts.filter((post) => post.category === category);
  }

  if (searchTerm && searchTerm.trim() !== "") {
    const searchLower = searchTerm.toLowerCase().trim();
    allPosts = allPosts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(searchLower);
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      const authorMatch = post.author?.displayName
        .toLowerCase()
        .includes(searchLower);
      return titleMatch || contentMatch || authorMatch;
    });
  }

  switch (sortBy) {
    case "oldest":
      allPosts.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
      break;
    case "popular":
      allPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case "newest":
    default:
      allPosts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      break;
  }

  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    totalPages,
    totalPosts,
  };
}

/**
 * Obtiene los slugs de todos los posts para generar rutas dinámicas.
 */
export async function getAllPostIds(): Promise<Array<{ slug: string }>> {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("status", "==", "published"));
  const querySnapshot = await getDocs(q);

  const posts = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const slug = data.slug || "";

    console.log("Post ID:", doc.id, "Slug:", slug);

    return {
      slug: slug,
    };
  });

  const validPosts = posts.filter(
    (post) => post.slug && post.slug.trim() !== ""
  );

  console.log("Posts válidos con slug:", validPosts);

  return validPosts;
}

/**
 * Obtiene los datos de un post específico por slug.
 */
export async function getPostData(slug: string): Promise<Post | null> {
  console.log("Buscando post con slug:", slug);

  const postsRef = collection(db, "posts");
  const q = query(
    postsRef,
    where("slug", "==", slug),
    where("status", "==", "published")
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.warn(`No se encontró ningún post con el slug: ${slug}`);

    try {
      const docRef = doc(db, "posts", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(
          "Se encontró un documento con ese ID, pero el slug real es:",
          data.slug
        );
        console.log("Datos del documento:", data);
      }
    } catch (error) {
      console.log("No es un ID válido de documento");
    }

    return null;
  }

  const docData = querySnapshot.docs[0].data();
  console.log("Post encontrado:", docData.title, "con slug:", docData.slug);

  return {
    id: querySnapshot.docs[0].id,
    title: docData.title || "Sin título",
    content: docData.content || "",
    category: docData.category || "tactica",
    featureImage: docData.featureImage || undefined,
    author: docData.author || {
      uid: "",
      displayName: "Desconocido",
      email: "",
    },
    tags: docData.tags || [],
    slug: docData.slug || "",
    status: docData.status || "draft",
    createdAt: docData.createdAt
      ? new Date(docData.createdAt.toDate())
      : new Date(),
    updatedAt: docData.updatedAt
      ? new Date(docData.updatedAt.toDate())
      : new Date(),
    likes: docData.likes || 0,
    views: docData.views || 0,
    metaTitle: docData.metaTitle || docData.title || "Sin título",
    metaDescription:
      docData.metaDescription || docData.content?.substring(0, 160) || "",
    keywords: docData.keywords || [],
  };
}

/**
 * Actualiza un post existente o crea uno nuevo si no existe.
 */
export async function updatePost(postId: string, updatedData: Partial<Post>) {
  const postRef = doc(db, "posts", postId);
  const postSnapshot = await getDoc(postRef);

  if (!postSnapshot.exists()) {
    throw new Error("El post no existe.");
  }

  await updateDoc(postRef, {
    ...updatedData,
    updatedAt: new Date(),
  });
}

/**
 * Obtiene los posts más populares
 */
export async function getPopularPosts(limit: number = 5): Promise<Post[]> {
  const postsRef = collection(db, "posts");
  const q = query(
    postsRef,
    where("status", "==", "published"),
    orderBy("views", "desc")
  );

  const querySnapshot = await getDocs(q);

  const posts: Post[] = querySnapshot.docs.slice(0, limit).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "Sin título",
      content: data.content || "",
      category: data.category || "tactica",
      featureImage: data.featureImage || undefined,
      author: data.author || {
        uid: "",
        displayName: "Desconocido",
        email: "",
      },
      tags: data.tags || [],
      slug: data.slug || "",
      status: data.status || "draft",
      createdAt: data.createdAt
        ? new Date(data.createdAt.toDate())
        : new Date(),
      updatedAt: data.updatedAt
        ? new Date(data.updatedAt.toDate())
        : new Date(),
      likes: data.likes || 0,
      views: data.views || 0,
      metaTitle: data.metaTitle || data.title || "Sin título",
      metaDescription:
        data.metaDescription || data.content?.substring(0, 160) || "",
      keywords: data.keywords || [],
    };
  });

  return posts;
}

/**
 * Obtiene el conteo de posts por categoría
 */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("status", "==", "published"));
  const querySnapshot = await getDocs(q);

  const categoryCounts: Record<string, number> = {};

  querySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const category = data.category || "tactica";
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  return categoryCounts;
}

/**
 * Obtiene todos los tags únicos con su frecuencia
 */
export async function getAllTags(): Promise<Array<{ tag: string; count: number }>> {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("status", "==", "published"));
  const querySnapshot = await getDocs(q);

  const tagCounts: Record<string, number> = {};

  querySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const tags = data.tags || [];
    tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const tagsArray = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return tagsArray;
}

/**
 * Crea un nuevo post en Firestore.
 */
export async function createPost(postData: Omit<Post, "id">): Promise<string> {
  try {
    const postsRef = collection(db, "posts");
    const newPostRef = doc(postsRef);

    await setDoc(newPostRef, {
      ...postData,
      id: newPostRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: postData.likes || 0,
      views: postData.views || 0,
    });

    return newPostRef.id;
  } catch (error) {
    console.error("Error al crear el post:", error);
    throw new Error("Ocurrió un error al crear el post.");
  }
}

/**
 * Obtiene posts relacionados por categoría
 */
export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit: number = 3
) {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("category", "==", category),
      where("status", "==", "published"),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    const posts = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          slug: data.slug,
          title: data.title,
          category: data.category,
          featureImage: data.featureImage,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      })
      .filter((post) => post.slug !== currentSlug)
      .slice(0, limit);

    return posts;
  } catch (error) {
    console.error("Error al obtener posts relacionados:", error);
    return [];
  }
}

/**
 * Obtiene el post anterior y siguiente
 */
export async function getAdjacentPosts(currentSlug: string) {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("status", "==", "published"),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    const posts = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        slug: data.slug,
        title: data.title,
        category: data.category,
        featureImage: data.featureImage,
      };
    });

    const currentIndex = posts.findIndex((post) => post.slug === currentSlug);

    if (currentIndex === -1) {
      return { previous: null, next: null };
    }

    return {
      previous: currentIndex > 0 ? posts[currentIndex - 1] : null,
      next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    };
  } catch (error) {
    console.error("Error al obtener posts adyacentes:", error);
    return { previous: null, next: null };
  }
}