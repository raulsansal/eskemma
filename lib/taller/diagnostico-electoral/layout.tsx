// app/taller/diagnostico-electoral/layout.tsx
// ============================================================
// LAYOUT ESPECÍFICO DEL TALLER
// Incluye sidebar de navegación y header con progreso
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import WorkshopSidebar from "./components/WorkshopSidebar";
import WorkshopHeader from "./components/WorkshopHeader";
import { getWorkshopProgress, startWorkshop } from "@/lib/taller/firebaseWorkshop";
import type { UserWorkshopProgress } from "@/types/firestore.types";

const WORKSHOP_ID = "taller-diagnostico-electoral";

export default function TallerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserWorkshopProgress | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Cargar progreso del usuario
  useEffect(() => {
    async function loadProgress() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let userProgress = await getWorkshopProgress(user.uid);
        
        // Si no hay progreso, iniciarlo automáticamente al entrar al layout
        if (!userProgress) {
          await startWorkshop(user.uid);
          userProgress = await getWorkshopProgress(user.uid);
        }
        
        setProgress(userProgress);
      } catch (error) {
        console.error("Error al cargar progreso:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user]);

  // Toggle sidebar en móvil
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Si no hay usuario, mostrar solo el contenido (sin sidebar)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-eske-10">
        <WorkshopHeader 
          progress={null}
          onMenuClick={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />
        <div className="pt-16">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-eske-10 flex">
      {/* Sidebar */}
      <WorkshopSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        progress={progress}
        currentPath={typeof window !== "undefined" ? window.location.pathname : ""}
      />

      {/* Contenido principal */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
        <WorkshopHeader 
          progress={progress}
          onMenuClick={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />
        
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </div>

      {/* Overlay para móvil cuando sidebar está abierto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}