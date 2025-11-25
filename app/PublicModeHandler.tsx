// app/PublicModeHandler.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function PublicModeHandler() {
  const searchParams = useSearchParams();
  const isPublicMode = searchParams.get("public") === "true";
  const { logout } = useAuth();

  useEffect(() => {
    if (isPublicMode) {
      logout();
    }
  }, [isPublicMode, logout]);

  return null; // No renderiza nada
}