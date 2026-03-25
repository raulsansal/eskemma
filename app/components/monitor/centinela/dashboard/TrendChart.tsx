// app/components/monitor/centinela/dashboard/TrendChart.tsx
"use client";

interface TrendChartProps {
  data: unknown[];
  label: string;
}

export default function TrendChart({ data, label }: TrendChartProps) {
  void data;
  return (
    <div className="p-4 bg-white-eske rounded-lg border border-gray-100 text-gray-400 text-sm">
      [ TrendChart — {label} — pendiente ]
    </div>
  );
}
