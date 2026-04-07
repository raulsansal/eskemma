"use client";

import EleccionesFedPanelContent from "./elecciones/EleccionesFedPanelContent";

export default function EleccionesFedPanel() {
  return (
    <section
      id="sefix-panel-elecciones_fed"
      role="tabpanel"
      aria-labelledby="sefix-tab-elecciones_fed"
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <EleccionesFedPanelContent />
      </div>
    </section>
  );
}
