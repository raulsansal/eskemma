// app/blog/admin/blog/edit/[id]/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { getPostData, updatePost, createPost } from "@/lib/client/posts.client";
import { uploadFeaturedImage, uploadSecondaryImage } from "@/firebase/storageUtils";
import { PostData } from "@/types/post.types";
import { CATEGORIES } from "@/lib/constants/categories";
import TagInput from "@/app/blog/admin/components/TagInput";
import SEOPreview from "@/app/blog/admin/components/SEOPreview";

// Interfaces para los datos
interface BasePostData {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  status: "draft" | "published";
  featureImage?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Convertir texto a slug con acentos correctos
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [formData, setFormData] = useState<BasePostData>({
    title: "",
    content: "",
    category: "tactica",
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
            category: postData.category || "tactica",
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
        slug: prev.slug === "" || id === "new" ? generateSlug(value) : prev.slug,
      }));
    } else if (name === "slug") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Regenerar slug desde el título
  const handleRegenerateSlug = () => {
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(prev.title),
    }));
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
        category: formData.category,
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bluegreen-eske mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6"> {/* ✅ Cambió de max-w-4xl a max-w-7xl */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {id === "new" ? "Crear Nuevo Post" : "Editar Post"}
      </h1>

      {/* ✅ NUEVO: Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ✅ Columna principal - Formulario (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-white-eske rounded-xl shadow-md p-6">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título <span className="text-red-eske">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
                  placeholder="Título del post"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug (URL) <span className="text-red-eske">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="flex-1 px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
                    placeholder="slug-del-post"
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="px-4 py-2 bg-blue-eske text-white rounded-lg hover:bg-blue-eske-70 transition-colors font-semibold whitespace-nowrap"
                    title="Regenerar slug desde el título"
                  >
                    🔄 Regenerar
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Se genera automáticamente desde el título, pero puedes editarlo manualmente
                </p>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría <span className="text-red-eske">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contenido <span className="text-red-eske">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent font-mono text-sm"
                  placeholder="Contenido en Markdown..."
                />
                <p className="text-xs text-gray-600 mt-1">
                  Usa Markdown para formatear el contenido
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (Etiquetas)
                </label>
                <TagInput
                  value={formData.tags || []}
                  onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Palabras clave (SEO)
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords?.join(", ") || ""}
                  onChange={handleKeywordsChange}
                  placeholder="política, estrategia, campaña"
                  className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Separadas por comas para SEO
                </p>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Title (SEO)
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="Por defecto usa el título del post"
                  className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description (SEO)
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  maxLength={160}
                  placeholder="Descripción para SEO (max 160 caracteres)"
                  className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formData.metaDescription?.length || 0}/160 caracteres
                </p>
              </div>

              {/* Imagen Destacada */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagen Destacada
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeatureImageUpload}
                  className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bluegreen-eske file:text-white hover:file:bg-bluegreen-eske-70"
                />
                {formData.featureImage && (
                  <div className="mt-3">
                    <img
                      src={formData.featureImage}
                      alt="Imagen Destacada"
                      className="w-full max-w-md h-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* Imágenes Secundarias */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imágenes Secundarias
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSecondaryImageUpload}
                  className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-eske file:text-white hover:file:bg-blue-eske-70"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Se insertará en Markdown en el contenido
                </p>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4 border-t border-gray-eske-30">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-bluegreen-eske text-white rounded-lg hover:bg-bluegreen-eske-70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-md"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/blog/admin/blog")}
                  className="px-6 py-3 bg-gray-eske-40 text-gray-800 rounded-lg hover:bg-gray-eske-60 transition-colors font-semibold shadow-md"
                >
                  Cancelar
                </button>
              </div>

              {/* Botón Debug */}
              {typeof debugUserToken === "function" && (
                <div className="pt-4 border-t border-gray-eske-30">
                  <button
                    type="button"
                    onClick={handleDebugToken}
                    className="w-full px-4 py-2 bg-green-eske text-white rounded-lg hover:bg-green-eske-70 transition-colors text-sm font-medium"
                  >
                    🔍 Depurar Token del Usuario
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ✅ NUEVA: Columna lateral - SEO Preview (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* SEO Preview */}
            <SEOPreview
              title={formData.metaTitle || formData.title}
              description={formData.metaDescription || formData.content.substring(0, 160)}
              imageUrl={formData.featureImage}
              slug={formData.slug}
            />

            {/* Tips de SEO */}
            <div className="bg-blue-eske-10 rounded-xl p-4 border border-blue-eske-30">
              <h4 className="text-sm font-bold text-blue-eske mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Tips de SEO
              </h4>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-bluegreen-eske mt-0.5">•</span>
                  <span>Usa títulos descriptivos de 50-60 caracteres</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-bluegreen-eske mt-0.5">•</span>
                  <span>Meta descripción ideal: 150-160 caracteres</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-bluegreen-eske mt-0.5">•</span>
                  <span>Incluye palabras clave en título y descripción</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-bluegreen-eske mt-0.5">•</span>
                  <span>La imagen destacada debe ser 1200x630px para redes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-bluegreen-eske mt-0.5">•</span>
                  <span>Slug debe ser corto, descriptivo y sin acentos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}