// app/components/monitor/centinela/config/TerritorioSelector.tsx
"use client";

import type { Territorio } from "@/types/centinela.types";

interface TerritorioSelectorProps {
  value: Territorio;
  onChange: (territorio: Territorio) => void;
}

export default function TerritorioSelector({
  value,
  onChange,
}: TerritorioSelectorProps) {
  void value;
  void onChange;
  return (
    <div className="p-4 bg-white-eske rounded-lg border border-gray-100 text-gray-400 text-sm">
      [ TerritorioSelector — pendiente ]
    </div>
  );
}
