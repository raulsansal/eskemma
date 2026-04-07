"use client";

import { useState } from "react";
import type { UserRole } from "@/types/subscription.types";
import type { SefixTabId } from "@/types/sefix.types";
import SefixHeroSection from "./SefixHeroSection";
import TabNav from "./components/TabNav";
import LnePanel from "./components/LnePanel";
import EleccionesFedPanel from "./components/EleccionesFedPanel";
import UnderConstructionPage from "@/app/components/UnderConstructionPage";

interface SefixDashboardProps {
  role: UserRole | null;
}

export default function SefixDashboard({ role: _role }: SefixDashboardProps) {
  const [activeTab, setActiveTab] = useState<SefixTabId>("lne");

  return (
    <main className="min-h-screen bg-white-eske">
      <SefixHeroSection />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Paneles de contenido */}
      {activeTab === "lne" && <LnePanel />}
      {activeTab === "elecciones_fed" && <EleccionesFedPanel />}
      {activeTab === "elecciones_loc" && (
        <section
          id="sefix-panel-elecciones_loc"
          role="tabpanel"
          aria-labelledby="sefix-tab-elecciones_loc"
        >
          <UnderConstructionPage title="Elecciones Locales" />
        </section>
      )}
      {activeTab === "geo" && (
        <section
          id="sefix-panel-geo"
          role="tabpanel"
          aria-labelledby="sefix-tab-geo"
        >
          <UnderConstructionPage title="Visualización Geográfica" />
        </section>
      )}
      {activeTab === "geoestadisticos" && (
        <section
          id="sefix-panel-geoestadisticos"
          role="tabpanel"
          aria-labelledby="sefix-tab-geoestadisticos"
        >
          <UnderConstructionPage title="Estadísticos Geoelectorales" />
        </section>
      )}
      {activeTab === "otros" && (
        <section
          id="sefix-panel-otros"
          role="tabpanel"
          aria-labelledby="sefix-tab-otros"
        >
          <UnderConstructionPage title="Otros Estadísticos" />
        </section>
      )}
    </main>
  );
}
