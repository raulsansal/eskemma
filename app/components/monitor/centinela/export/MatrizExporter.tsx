// app/components/monitor/centinela/export/MatrizExporter.tsx
"use client";

import type { CentinelaFeed } from "@/types/centinela.types";

interface MatrizExporterProps {
  feed: CentinelaFeed;
}

export default function MatrizExporter({ feed }: MatrizExporterProps) {
  void feed;
  return (
    <div className="p-4 bg-white-eske dark:bg-[#18324A] rounded-lg border border-gray-100 dark:border-white/10 text-gray-400 dark:text-[#6D8294] text-sm">
      [ MatrizExporter — pendiente ]
    </div>
  );
}
