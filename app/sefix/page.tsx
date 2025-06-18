'use client'; // Indica que es un Client Component

import React from 'react';

export default function SefixPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white-eske">
      {/* Contenido principal */}
      <main className="flex-1 bg-white-eske overflow-y-auto">                    

        {/* Iframe para el dashboard */}
        <div className="mt-6 relative aspect-video">
          <iframe
            src="http://127.0.0.1:7680" // Reemplaza con la dirección IP o URL correcta
            title="Dashboard de Shiny"
            className="w-full h-full border-none rounded-lg shadow-md"
            allowFullScreen
          ></iframe>
        </div>
      </main>
    </div>
  );
}