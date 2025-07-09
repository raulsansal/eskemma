// app/blog/admin/blog/edit/[id]/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Importar las funciones del cliente
import { getPostData, updatePost } from '@/lib/client/posts.client';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  
  // Resolver params de forma asíncrona
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Estado para manejar los valores del formulario
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Solo ejecutar si tenemos un ID válido
    if (!id) return;
    
    // Obtener los datos actuales del post
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const postData = await getPostData(id);
        setFormData({
          title: postData.title || '',
          date: postData.date || new Date().toISOString().split('T')[0],
          content: postData.content || '',
        });
      } catch (error) {
        console.error('Error al obtener los datos del post:', error);
        alert('Ocurrió un error al cargar los datos del post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Función para guardar los cambios
  const handleSave = async () => {
    if (!id) return;
    
    try {
      setSaving(true);
      await updatePost(id, {
        title: formData.title,
        date: formData.date,
        content: formData.content,
      });

      alert('Post actualizado exitosamente.');
      router.push('/blog/admin/blog');
    } catch (error) {
      console.error('Error al actualizar el post:', error);
      alert('Ocurrió un error al actualizar el post.');
    } finally {
      setSaving(false);
    }
  };

  if (!id || loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Editar Post</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Título */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Título:
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
                borderRadius: '4px'
              }}
            />
          </label>
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Fecha:
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
                borderRadius: '4px'
              }}
            />
          </label>
        </div>

        {/* Contenido */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Contenido (Markdown):
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
                fontFamily: 'monospace'
              }}
            />
          </label>
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
              cursor: saving ? 'not-allowed' : 'pointer'
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
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}