// app/components/monitor/centinela/export/MatrizExporter.tsx
"use client";

import type { CentinelaFeed } from "@/types/centinela.types";

interface MatrizExporterProps {
  feed: CentinelaFeed;
}

export default function MatrizExporter({ feed }: MatrizExporterProps) {
  void feed;
  return (
    <div className="p-4 bg-white-eske rounded-lg border border-gray-100 text-gray-400 text-sm">
      [ MatrizExporter — pendiente ]
    </div>
  );
}
