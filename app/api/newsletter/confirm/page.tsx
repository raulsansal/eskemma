// app/newsletter/confirm/page.tsx
import { Suspense } from "react";
import ConfirmContent from "../../../newsletter/confirm/ConfirmContent";

export default function NewsletterConfirmPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}