// app/moddulo/onboarding/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al hub mientras se construye el onboarding
    router.replace("/moddulo");
  }, [router]);

  return null;
}
