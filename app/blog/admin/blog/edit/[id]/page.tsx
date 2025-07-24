// app/blog/admin/blog/edit/[id]/page.tsx

'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPostData, updatePost, createPost } from '@/lib/client/posts.client';
import { uploadMedia } from '@/firebase/storageUtils';

// Interfaces para los datos
interface BasePostData {
  title: string;
  date: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
  featureImage: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

interface FormData extends BasePostData {
  // Propiedades específicas del formulario si son necesarias
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
  // Resolvemos los parámetros usando React.use()
  const { id } = use(params);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    tags: [],
    status: 'draft',
    featureImage: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Cargar datos del post
  useEffect(() => {
    if (id && id !== 'new') {
      const fetchPostData = async () => {
        try {
          setLoading(true);
          const postData = await getPostData(id);
          
          if (!postData) {
            console.error('Post no encontrado');
            return;
          }
          
          setFormData({
            title: postData.title || '',
            date: postData.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            content: postData.content || '',
            tags: postData.tags || [],
            status: postData.status || 'draft',
            featureImage: postData.featureImage || '',
            slug: postData.slug || '',
            metaTitle: postData.metaTitle || postData.title || '',
            metaDescription: postData.metaDescription || postData.content?.substring(0, 160) || '',
            keywords: postData.keywords || postData.tags || [],
          });
        } catch (error) {
          console.error('Error al obtener los datos del post:', error);
          alert('Ocurrió un error al cargar los datos del post.');
        } finally {
          setLoading(false);
        }
      };
      fetchPostData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        metaTitle: prev.metaTitle || value,
      }));
    } else if (name === 'content') {
      setFormData((prev) => ({
        ...prev,
        content: value,
        metaDescription: prev.metaDescription || value.substring(0, 160),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim());
    setFormData((prev) => ({ 
      ...prev, 
      tags,
      keywords: tags // Actualizar keywords automáticamente
    }));
  };

  const handleFeatureImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const downloadURL = await uploadMedia(file, `posts/${id}`);
      setFormData((prev) => ({ ...prev, featureImage: downloadURL }));
    } catch (error) {
      console.error('Error al subir la imagen destacada:', error);
      alert('Ocurrió un error al subir la imagen destacada.');
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar posts');
      return;
    }

    if (!formData.title || !formData.content || !formData.slug) {
      alert('Por favor, completa todos los campos obligatorios.');
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
          displayName: user.displayName || 'Admin',
          email: user.email || '',
        },
        featureImage: formData.featureImage,
        tags: formData.tags,
        date: formData.date,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords,
      };

      if (id === 'new') {
        await createPost(postBaseData);
        router.push('/blog/admin/blog'); // Redirige a la página de gestión de posts
      } else {
        await updatePost(id, {
          ...postBaseData,
          likes: 0, // Valor por defecto
          views: 0, // Valor por defecto
        });
        router.push('/blog/admin/blog'); // Redirige a la página de gestión de posts
      }
      
      alert('Post guardado exitosamente.');
      router.push('/blog/admin/blog');
    } catch (error) {
      console.error('Error al guardar el post:', error);
      alert('Ocurrió un error al guardar el post.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="editor-container">
      <h1>{id === 'new' ? 'Crear Nuevo Post' : 'Editar Post'}</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Título */}
        <div className="form-group">
          <label>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Fecha */}
        <div className="form-group">
          <label>Fecha:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Contenido */}
        <div className="form-group">
          <label>Contenido (Markdown):</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={15}
            className="markdown-editor"
          />
        </div>

        {/* Etiquetas */}
        <div className="form-group">
          <label>Etiquetas (separadas por comas):</label>
          <input
            type="text"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="Ej. tecnología, diseño, arte"
          />
        </div>

        {/* Estado del post */}
        <div className="form-group">
          <label>Estado:</label>
          <select
            name="status"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' }))
            }
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        {/* Imagen Destacada */}
        <div className="form-group">
          <label>Imagen Destacada:</label>
          <input
            type="file"
            onChange={handleFeatureImageUpload}
            accept="image/*"
          />
          {formData.featureImage && (
            <img
              src={formData.featureImage}
              alt="Imagen Destacada"
              className="featured-image-preview"
            />
          )}
        </div>

        {/* Meta Título */}
        <div className="form-group">
          <label>Meta Título (SEO):</label>
          <input
            type="text"
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleInputChange}
          />
        </div>

        {/* Meta Descripción */}
        <div className="form-group">
          <label>Meta Descripción (SEO):</label>
          <textarea
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="save-button"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/blog/admin/blog')}
            className="cancel-button"
          >
            Cancelar
          </button>
        </div>
      </form>

      <style jsx>{`
        .editor-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        input[type="text"],
        input[type="date"],
        textarea,
        select {
          width: 100%;
          padding: 8px;
          margin-top: 5px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        }
        textarea {
          min-height: 200px;
        }
        .markdown-editor {
          font-family: monospace;
        }
        .featured-image-preview {
          width: 150px;
          height: 150px;
          object-fit: cover;
          margin-top: 10px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .save-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .save-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .cancel-button {
          padding: 10px 20px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .loading {
          padding: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}