// app/components/monitor/centinela/dashboard/RiskVectorWidget.tsx
"use client";

interface RiskVectorWidgetProps {
  vectorRiesgo: number;
  indicePresionSocial: number;
  indiceClimaInversion: number;
}

export default function RiskVectorWidget({
  vectorRiesgo,
  indicePresionSocial,
  indiceClimaInversion,
}: RiskVectorWidgetProps) {
  void vectorRiesgo;
  void indicePresionSocial;
  void indiceClimaInversion;
  return (
    <div className="p-4 bg-white-eske rounded-lg border border-gray-100 text-gray-400 text-sm">
      [ RiskVectorWidget — pendiente ]
    </div>
  );
}
