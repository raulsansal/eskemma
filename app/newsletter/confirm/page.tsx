// app/newsletter/confirm/page.tsx
import { Suspense } from "react";
import ConfirmContent from "./ConfirmContent";

export default function NewsletterConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-eske-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bluegreen-eske"></div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}