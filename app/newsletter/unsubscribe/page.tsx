// app/newsletter/unsubscribe/page.tsx
import { Suspense } from "react";
import UnsubscribeContent from "./UnsubscribeContent";

export const metadata = {
  title: "Cancelar suscripción - El Baúl de Fouché",
  description: "Cancelar suscripción al newsletter de Eskemma",
};

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bluegreen-eske"></div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
