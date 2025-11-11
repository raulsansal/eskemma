// app/admin/setup-claims/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SetupClaimsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSetAdminClaim = async () => {
    if (!user?.uid) {
      setResult('❌ No hay usuario logueado');
      return;
    }

    setLoading(true);
    setResult('⏳ Asignando Custom Claim...');

    try {
      console.log('🔵 Enviando solicitud para UID:', user.uid);
      
      const response = await fetch('/api/admin/set-admin-claim', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid }),
      });

      console.log('🔵 Response status:', response.status);
      console.log('🔵 Response headers:', Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type');
      console.log('🔵 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Respuesta no es JSON:', text.substring(0, 200));
        setResult(`❌ Error: La API no retornó JSON. Status: ${response.status}\n\nRespuesta: ${text.substring(0, 200)}...`);
        return;
      }

      const data = await response.json();
      console.log('🔵 Response data:', data);

      if (response.ok) {
        setResult(`✅ ${data.message}\n\n🔄 IMPORTANTE:\n1. Debes cerrar sesión COMPLETAMENTE\n2. Volver a iniciar sesión\n3. Solo así los cambios surtirán efecto`);
      } else {
        setResult(`❌ Error: ${data.error}\n\nDetalles: ${data.details || 'No disponible'}`);
      }
    } catch (error) {
      console.error('❌ Error en handleSetAdminClaim:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px', 
          textAlign: 'center',
          color: '#333',
        }}>
          🔐 Configurar Admin Claims
        </h1>
        
        {user ? (
          <>
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #dee2e6',
            }}>
              <p style={{ marginBottom: '10px', fontSize: '14px' }}>
                <strong>Usuario logueado:</strong> {user.email}
              </p>
              <p style={{ 
                fontSize: '11px', 
                color: '#666', 
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                marginTop: '8px',
              }}>
                <strong>UID:</strong> {user.uid}
              </p>
            </div>
            
            <button
              onClick={handleSetAdminClaim}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              {loading ? '⏳ Procesando...' : '🚀 Asignar rol de Admin'}
            </button>

            <button
              onClick={handleLogout}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#ccc' : '#dc3545',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              🚪 Cerrar Sesión
            </button>
            
            {result && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
                border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '4px',
              }}>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '13px',
                  margin: 0,
                  color: result.includes('✅') ? '#155724' : '#721c24',
                  fontFamily: 'monospace',
                }}>
                  {result}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#dc3545', fontSize: '16px' }}>
              ❌ Por favor, inicia sesión primero
            </p>
            <button
              onClick={() => router.push('/login')}
              style={{
                marginTop: '20px',
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Ir a Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}