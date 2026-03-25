// app/components/monitor/centinela/dashboard/PESTLPanel.tsx
"use client";

import type { DimensionPESTL } from "@/types/centinela.types";

interface PESTLPanelProps {
  dimension: DimensionPESTL;
  title: string;
}

export default function PESTLPanel({ dimension, title }: PESTLPanelProps) {
  void dimension;
  return (
    <div className="p-4 bg-white-eske rounded-lg border border-gray-100 text-gray-400 text-sm">
      [ PESTLPanel — {title} — pendiente ]
    </div>
  );
}
