// app/blog/[slug]/ResourcesCard.tsx
import { DownloadableResource } from "@/types/post.types";
import DownloadableResources from "./DownloadableResources";

interface ResourcesCardProps {
  resources: DownloadableResource[];
  category: string;
  className?: string;
}

/**
 * Componente reutilizable para mostrar recursos descargables
 * Se usa tanto en sidebar (desktop) como en contenido principal (mobile)
 */
export default function ResourcesCard({
  resources,
  category,
  className = "",
}: ResourcesCardProps) {
  if (resources.length === 0) return null;

  return (
    <div className={className}>
      <DownloadableResources resources={resources} category={category} />
    </div>
  );
}