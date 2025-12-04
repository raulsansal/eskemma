// app/blog/admin/components/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          <div className={`${color} text-white p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-4xl font-bold text-gray-800">
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Decorative bottom bar */}
      <div className={`h-1 ${color}`}></div>
    </div>
  );
}