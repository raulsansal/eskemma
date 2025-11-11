//app/blog/admin/blog/edit/[id]/page.ts

"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { getPostData, updatePost, createPost } from "@/lib/client/posts.client";
import { uploadFeaturedImage, uploadSecondaryImage } from "@/firebase/storageUtils";
import { PostData } from "@/types/post.types";
import { CATEGORIES } from "@/lib/constants/categories"; // ✅ Importar categorías

// Interfaces para los datos
interface BasePostData {
  title: string;  
  content: string;
  category: string; // ✅ NUEVO
  tags?: string[];
  status: "draft" | "published";
  featureImage?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  // Estados locales
  const [formData, setFormData] = useState<BasePostData>({
    title: "",    
    content: "",
    category: "tactica", // ✅ Valor por defecto
    tags: [],
    status: "draft",
    featureImage: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { user, debugUserToken } = useAuth();

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
            category: postData.category || "tactica", // ✅ Asegurar categoría
            tags: postData.tags || [],            
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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
    setFormData((prev) => ({ ...prev, tags: tags || [] }));
  };

  // Manejar cambios en keywords
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(",").map((keyword) => keyword.trim());
    setFormData((prev) => ({ ...prev, keywords: keywords || [] }));
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

  // Manejar la subida de imágenes secundarias
  const handleSecondaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const downloadURL = await uploadSecondaryImage(file, id);
      const markdownImage = `![${file.name}](${downloadURL})`;
      setFormData((prev) => ({
        ...prev,
        content: `${prev.content}\n\n${markdownImage}`,
      }));
    } catch (error) {
      console.error("Error al subir la imagen secundaria:", error);
      alert("Ocurrió un error al subir la imagen secundaria.");
    }
  };

  // Guardar el post
  const handleSave = async () => {
    if (!user) {
      alert("Debes iniciar sesión para guardar posts");
      return;
    }
    if (!formData.title || !formData.content || !formData.slug || !formData.category) {
      alert("Por favor, completa todos los campos obligatorios (título, contenido, slug y categoría).");
      return;
    }
    try {
      setSaving(true);
      const postBaseData = {
        title: formData.title,
        content: formData.content,
        slug: formData.slug,
        category: formData.category, // ✅ Incluir categoría
        status: formData.status,
        author: {
          uid: user.uid,
          displayName: user.displayName || "Admin",
          email: user.email || "",
        },        
        featureImage: formData.featureImage || undefined,
        tags: formData.tags || [],
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || "",
        keywords: formData.keywords || [],
      };
      if (id === "new") {
        await createPost(postBaseData);
      } else {
        await updatePost(id, {
          ...postBaseData,
          likes: 0,
          views: 0,
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
          <label style={{ display: "block", marginBottom: "5px" }}>
            Título: <span style={{ color: "red" }}>*</span>
          </label>
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

        {/* ✅ NUEVO: Categoría */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Categoría: <span style={{ color: "red" }}>*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>        

        {/* Contenido */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Contenido: <span style={{ color: "red" }}>*</span>
          </label>
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
          <label style={{ display: "block", marginBottom: "5px" }}>
            Tags (separados por comas):
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags?.join(", ") || ""}
            onChange={handleTagsChange}
            placeholder="Ej: mensaje, storytelling, compol"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* ✅ NUEVO: Keywords (palabras clave para SEO) */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Palabras clave (separadas por comas):
          </label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords?.join(", ") || ""}
            onChange={handleKeywordsChange}
            placeholder="Ej: política, estrategia, campaña"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Meta Title */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Meta Title (SEO):
          </label>
          <input
            type="text"
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleChange}
            placeholder="Título para SEO (opcional, por defecto usa el título del post)"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Meta Description */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Meta Description (SEO):
          </label>
          <textarea
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleChange}
            placeholder="Descripción para SEO (opcional, max 160 caracteres)"
            style={{
              width: "100%",
              height: "60px",
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

        {/* Imágenes Secundarias */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Imágenes Secundarias:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleSecondaryImageUpload}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Estado (Draft/Published) */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Estado:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ddd",
            }}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
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