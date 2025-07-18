// app/blog/admin/blog/edit/[id]/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as React from 'react'; // Importar React explícitamente para usar React.use()
import { useAuth } from '@/context/AuthContext';

// Importar las funciones del cliente
import { getPostData, updatePost, createPost } from '@/lib/client/posts.client';
import { uploadMedia } from '@/firebase/storageUtils';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published',
    featureImage: '',
    slug: '', // Agregado para cumplir con las reglas de Firestore
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Desempaquetar params usando React.use()
  const { id } = React.use(params);

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
            date: postData.date || new Date().toISOString().split('T')[0],
            content: postData.content || '',
            tags: postData.tags || [],
            status: postData.status || 'draft',
            featureImage: postData.featureImage || '',
            slug: postData.slug || '', // Asegurar que el slug esté presente
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

    // Generar automáticamente el slug cuando el título cambia
    if (name === 'title') {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim());
    setFormData((prev) => ({ ...prev, tags }));
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
    if (!formData.title || !formData.content || !formData.slug) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      setSaving(true);

      const postData = {
        ...formData,
        author: {
          uid: user.uid,
          displayName: user.displayName || 'Admin',
          email: user.email,
        },
        updatedAt: new Date(),
      };

      if (id === 'new') {
        await createPost(postData);
      } else {
        await updatePost(id, postData);
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
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{id === 'new' ? 'Crear Nuevo Post' : 'Editar Post'}</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Título */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Fecha:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Contenido */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contenido (Markdown):</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={15}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          />
        </div>

        {/* Etiquetas */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Etiquetas (separadas por comas):</label>
          <input
            type="text"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="Ej. tecnología, diseño, arte"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Estado del post */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Estado:</label>
          <select
            name="status"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' }))
            }
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        {/* Imagen Destacada */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Imagen Destacada:</label>
          <input
            type="file"
            onChange={handleFeatureImageUpload}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          {formData.featureImage && (
            <img
              src={formData.featureImage}
              alt="Imagen Destacada"
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'cover',
                marginTop: '10px',
                borderRadius: '4px',
              }}
            />
          )}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 20px',
              backgroundColor: saving ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/blog/admin/blog')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}