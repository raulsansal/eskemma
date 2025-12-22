// app/blog/admin/components/QuickActions.tsx
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      title: "Crear Nuevo Post",
      description: "Escribe y publica un nuevo artículo",
      href: "/blog/admin/blog/edit/new",
      letter: "N",
      color: "bg-bluegreen-eske hover:bg-bluegreen-eske-70",
      gradient: "from-bluegreen-eske-80 to-bluegreen-eske-90",
      disabled: false,
    },
    {
      title: "Ver Todos los Posts",
      description: "Gestiona posts existentes",
      href: "/blog/admin/blog",
      letter: "P",
      color: "bg-blue-eske hover:bg-blue-eske-70",
      gradient: "from-blue-eske-80 to-blue-eske-90",
      disabled: false,
    },
    {
      title: "Ver Blog Público",
      description: "Vista previa del blog",
      href: "/blog",
      letter: "B",
      color: "bg-green-eske hover:bg-green-eske-70",
      gradient: "from-green-eske-80 to-green-eske-90",
      disabled: false,
    },
    {
      title: "Comentarios",
      description: "Modera y gestiona comentarios",
      href: "/blog/admin/comments",
      letter: "C",
      color: "bg-orange-eske hover:bg-orange-eske-70",
      gradient: "from-orange-eske-80 to-orange-eske-90",
      disabled: false,
    },
  ];

  return (
    <nav aria-label="Acciones rápidas del panel de administración">
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        role="list"
        aria-label="4 acciones rápidas disponibles"
      >
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.disabled ? "#" : action.href}
            className={`${action.color} text-white rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 focus-ring-primary ${
              action.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={(e) => action.disabled && e.preventDefault()}
            aria-label={`${action.title}: ${action.description}`}
            aria-disabled={action.disabled}
            role="listitem"
          >
            <div className="flex items-start justify-between mb-4">
              {/* Letra con gradiente oscuro y borde */}
              <div className="relative" aria-hidden="true">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center shadow-lg border-2 border-white border-opacity-20`}>
                  <span className="text-2xl font-black text-white tracking-tight">{action.letter}</span>
                </div>
                {/* Brillo superior sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-10 rounded-2xl pointer-events-none"></div>
              </div>
            </div>
            <h2 className="font-bold text-lg mb-1">{action.title}</h2>
            <p className="text-sm opacity-90">{action.description}</p>
          </Link>
        ))}
      </div>
    </nav>
  );
}

