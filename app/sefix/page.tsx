// app/sefix/page.tsx
import { Metadata } from "next";
import { getServerSession } from "@/lib/server/session.server";
import SefixDashboard from "./SefixDashboard";

export const metadata: Metadata = {
  title: "SEFIX — Dashboard de datos electorales - México | Eskemma",
  description:
    "Dashboard de análisis del Padrón Electoral, Lista Nominal y resultados electorales de México. Datos oficiales INE.",
};

export default async function SefixPage() {
  const session = await getServerSession();
  return <SefixDashboard role={session?.role ?? null} />;
}
