//app//blog/edit/[id]/page.tsx

"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as React from "react"; // Importar React explícitamente para usar React.use()
import { useAuth } from "@/context/AuthContext";
import { getPostData, updatePost, createPost } from "@/lib/client/posts.client";
import { uploadFeaturedImage } from "@/firebase/storageUtils";

// Interfaces para los datos
interface BasePostData {
  title: string;
  date: Date;
  content: string;
  tags?: string[]; // Tags opcionales (valor predeterminado: [])
  status: "draft" | "published";
  featureImage?: string; // Imagen destacada (opcional)
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

interface PostData extends BasePostData {
  id: string;
  author: {
    uid: string;
    displayName: string;
    email: string;
  };
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  // Estados locales
  const [formData, setFormData] = useState<BasePostData>({
    title: "",
    date: new Date(),
    content: "",
    tags: [], // Valor predeterminado: array vacío
    status: "draft",
    featureImage: "", // Inicializar como cadena vacía
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { user, debugUserToken } = useAuth(); // Importamos debugUserToken desde el contexto

  // Cargar datos del post
  useEffect(() => {
    if (id && id !== "new") {
      const fetchPostData = async () => {
        try {
          setLoading(true);
          const postData: PostData | null = await getPostData(id);
          if (!postData) {
            console.error("Post no encontrado");
            return;
          }

          setFormData({
            ...postData,
            tags: postData.tags || [], // Asignar valor predeterminado si tags no está presente
            date: postData.date ? new Date(postData.date) : new Date(),
          });
        } catch (error) {
          console.error("Error al obtener los datos del post:", error);
          alert("Ocurrió un error al cargar los datos del post.");
        } finally {
          setLoading(false);
        }
      };
      fetchPostData();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Manejar cambios en los tags
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setFormData((prev) => ({ ...prev, tags: tags || [] })); // Asegurar que tags sea un array
  };

  // Manejar la subida de la imagen destacada
  const handleFeatureImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const downloadURL = await uploadFeaturedImage(file, id);
      setFormData((prev) => ({ ...prev, featureImage: downloadURL }));
    } catch (error) {
      console.error("Error al subir la imagen destacada:", error);
      alert("Ocurrió un error al subir la imagen destacada.");
    }
  };

  // Guardar el post
  const handleSave = async () => {
    if (!user) {
      alert("Debes iniciar sesión para guardar posts");
      return;
    }
    if (!formData.title || !formData.content || !formData.slug) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
    try {
      setSaving(true);
      const postBaseData = {
        title: formData.title,
        content: formData.content,
        slug: formData.slug,
        status: formData.status,
        author: {
          uid: user.uid,
          displayName: user.displayName || "Admin",
          email: user.email || "",
        },
        date: formData.date.toISOString(), // Convertir Date a string antes de enviarlo
        featureImage: formData.featureImage || undefined,
        tags: formData.tags || [], // Asegurar que tags sea un array
      };
      if (id === "new") {
        await createPost(postBaseData);
      } else {
        await updatePost(id, {
          ...postBaseData,
          likes: 0, // Valor por defecto
          views: 0, // Valor por defecto
        });
      }
      alert("Post guardado exitosamente.");
      router.push("/blog/admin/blog");
    } catch (error) {
      console.error("Error al guardar el post:", error);
      alert("Ocurrió un error al guardar el post.");
    } finally {
      setSaving(false);
    }
  };

  // Función para manejar el clic en el botón de depuración
  const handleDebugToken = async () => {
    if (!debugUserToken) {
      console.warn("La función debugUserToken no está disponible.");
      return;
    }
    try {
      await debugUserToken();
      alert("Revisa la consola para ver los claims del token.");
    } catch (error) {
      console.error("Error al depurar el token:", error);
      alert("Ocurrió un error al depurar el token.");
    }
  };

  // Mostrar loading mientras se resuelven los params o se cargan los datos
  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Botón de Depuración */}
      <div style={{ marginBottom: "20px" }}>
        <button
          type="button"
          onClick={handleDebugToken}
          style={{
            padding: "10px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Depurar Token del Usuario
        </button>
      </div>

      {/* Formulario de edición */}
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Título */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Fecha:</label>
          <input
            type="date"
            name="date"
            value={formData.date.toISOString().split("T")[0]}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                date: new Date(e.target.value),
              }));
            }}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Contenido */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Contenido:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              height: "150px",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Tags:</label>
          <input
            type="text"
            name="tags"
            value={formData.tags?.join(", ") || ""}
            onChange={handleTagsChange}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Imagen Destacada */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Imagen Destacada:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFeatureImageUpload}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          />
          {formData.featureImage && (
            <img
              src={formData.featureImage}
              alt="Imagen Destacada"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                marginTop: "10px",
                borderRadius: "4px",
              }}
            />
          )}
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 20px",
              backgroundColor: saving ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/blog/admin/blog")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}