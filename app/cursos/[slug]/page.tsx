// app/cursos/[slug]/page.tsx
// ============================================================
// PÁGINA DINÁMICA PARA CURSOS Y TALLERES
// CORREGIDO: Ruta de importación actualizada a lib/cursos/taller/
// ============================================================

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TALLER_DIAGNOSTICO } from "@/lib/cursos/taller/diagnostico-electoral/config";
import { canAccessCourse } from "@/utils/courseAccessUtils";

// Mapa de slugs a configuraciones de cursos
const COURSE_CONFIGS: Record<string, any> = {
  "taller-diagnostico-electoral": TALLER_DIAGNOSTICO,
  // Aquí se agregarán más cursos en el futuro
};

export default function CursoPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();
  
  const course = COURSE_CONFIGS[slug];
  
  if (!course) {
    return (
      <main className="min-h-screen bg-white-eske flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-eske-80 mb-4">
            Curso no encontrado
          </h1>
          <Link href="/cursos" className="text-bluegreen-eske hover:underline">
            ← Volver a cursos
          </Link>
        </div>
      </main>
    );
  }

  const userRole = user?.role || null;
  const hasAccess = canAccessCourse(userRole, course.requiredRole);
  
  const stats = {
    estudiantes: 156,
    modulos: course.modules.length,
    sesiones: course.modules.reduce((acc: number, m: any) => acc + m.sessions.length, 0),
    horas: Math.round(course.estimatedDuration / 60),
  };

  // Si es el taller de diagnóstico, mostrar el contenido completo
  if (slug === "taller-diagnostico-electoral") {
    return (
      <main className="min-h-screen bg-white-eske">
        {/* Hero Section */}
        <section className="relative bg-linear-to-br from-blue-eske-900 to-bluegreen-eske text-white py-20 px-4">
          <div className="w-[90%] mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <span className="inline-block bg-yellow-eske text-blue-eske-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                🚀 TALLER PRÁCTICO
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {course.hero.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-6">
                {course.hero.subtitle}
              </p>
              <p className="text-lg text-gray-300 mb-8">
                {course.hero.description}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">{stats.estudiantes}+</div>
                  <div className="text-sm text-gray-300">Estudiantes</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">{stats.modulos}</div>
                  <div className="text-sm text-gray-300">Módulos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">{stats.sesiones}</div>
                  <div className="text-sm text-gray-300">Sesiones</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">{stats.horas}h</div>
                  <div className="text-sm text-gray-300">Contenido</div>
                </div>
              </div>
              
              {/* CTA */}
              {hasAccess ? (
                <Link
                  href="/cursos/taller-diagnostico-electoral/modulo/modulo-1-fundamentos/sesion/sesion-1-1-que-es-una-eleccion"
                  className="inline-block bg-yellow-eske hover:bg-yellow-eske/90 text-blue-eske-900 font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
                >
                  Comenzar taller →
                </Link>
              ) : (
                <div className="space-y-4">
                  <button
                    disabled
                    className="inline-block bg-gray-eske-30 text-gray-eske-70 font-semibold px-8 py-4 rounded-lg cursor-not-allowed text-lg"
                  >
                    Acceso restringido
                  </button>
                  <p className="text-gray-300 text-sm">
                    Este taller requiere una suscripción activa. 
                    {!user && " Inicia sesión para continuar."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="py-16 px-4 bg-gray-eske-10">
          <div className="w-[90%] mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              ¿Qué aprenderás en este taller?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {course.hero.features.map((feature: string, index: number) => (
                <div key={index} className="bg-white-eske p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-bluegreen-eske/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-bluegreen-eske" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature}</h3>
                  <p className="text-gray-eske-70">
                    {index === 0 && "Sube tus propios datasets y trabaja con ellos durante todo el taller."}
                    {index === 1 && "Ejercicios con código real que puedes ejecutar directamente en el navegador."}
                    {index === 2 && "Conecta con APIs de Twitter, Google Civic Info y datos públicos."}
                    {index === 3 && "Obtén una certificación al completar todos los módulos y ejercicios."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Módulos del taller */}
        <section className="py-16 px-4">
          <div className="w-[90%] mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-4">
              Estructura del taller
            </h2>
            <p className="text-center text-gray-eske-70 mb-12 max-w-2xl mx-auto">
              6 módulos diseñados para llevarte desde los fundamentos hasta la práctica avanzada del diagnóstico electoral.
            </p>
            
            <div className="space-y-6">
              {course.modules.map((module: any, index: number) => (
                <div key={module.id} className="border border-gray-eske-30 rounded-lg overflow-hidden">
                  <div className="bg-gray-eske-10 p-4 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-eske-70">Módulo {index + 1}</span>
                      <h3 className="text-xl font-semibold">{module.title}</h3>
                      <p className="text-gray-eske-70 text-sm mt-1">{module.description}</p>
                    </div>
                    <div className="text-sm text-gray-eske-70">
                      {module.sessions.length} sesiones · {Math.round(module.estimatedDuration / 60)}h
                    </div>
                  </div>
                  <div className="p-4 bg-white-eske">
                    <div className="grid md:grid-cols-2 gap-2">
                      {module.sessions.map((session: any) => (
                        <div key={session.id} className="text-sm text-gray-eske-80 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-bluegreen-eske rounded-full"></span>
                          {session.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-bluegreen-eske text-white py-16 px-4">
          <div className="w-[90%] mx-auto max-w-7xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para dominar el diagnóstico electoral?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Únete a más de 150 profesionales que ya están aprendiendo con este taller práctico.
            </p>
            
            {hasAccess ? (
              <Link
                href="/cursos/taller-diagnostico-electoral/modulo/modulo-1-fundamentos/sesion/sesion-1-1-que-es-una-eleccion"
                className="inline-block bg-yellow-eske hover:bg-yellow-eske/90 text-blue-eske-900 font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                Comenzar ahora →
              </Link>
            ) : (
              <Link
                href="/suscripciones"
                className="inline-block bg-yellow-eske hover:bg-yellow-eske/90 text-blue-eske-900 font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                Ver planes de suscripción
              </Link>
            )}
          </div>
        </section>
      </main>
    );
  }

  // Para otros cursos (futuros)
  return (
    <main className="min-h-screen bg-white-eske">
      <div className="w-[90%] mx-auto max-w-7xl py-16">
        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
        <p className="text-lg text-gray-eske-70">{course.description}</p>
        {/* Template para otros cursos */}
      </div>
    </main>
  );
}