// app/blog/admin/components/CommentFilters.tsx
"use client";

interface CommentFiltersProps {
  statusFilter: "all" | "pending" | "approved" | "rejected";
  onStatusChange: (status: "all" | "pending" | "approved" | "rejected") => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function CommentFilters({
  statusFilter,
  onStatusChange,
  searchTerm,
  onSearchChange,
  counts,
}: CommentFiltersProps) {
  const filters = [
    { id: "all", label: "Todos", count: counts.all, color: "bg-gray-eske-60" },
    { id: "pending", label: "Pendientes", count: counts.pending, color: "bg-yellow-eske" },
    { id: "approved", label: "Aprobados", count: counts.approved, color: "bg-green-eske" },
    { id: "rejected", label: "Rechazados", count: counts.rejected, color: "bg-red-eske" },
  ];

  return (
    <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 p-6">
      <div className="space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por contenido o autor..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
          />
        </div>

        {/* Filtros de Estado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filters.map((filter) => {
            const isActive = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => onStatusChange(filter.id as any)}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                  isActive
                    ? `${filter.color} text-white border-transparent shadow-md`
                    : "bg-white border-gray-eske-30 text-gray-700 hover:border-gray-eske-60"
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-600"}`}>
                    {filter.label}
                  </p>
                  <p className={`text-2xl font-bold ${isActive ? "text-white" : "text-gray-800"}`}>
                    {filter.count}
                  </p>
                </div>
                {isActive && (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}