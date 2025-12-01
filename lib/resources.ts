// lib/resources.ts
if (typeof window !== "undefined") {
  throw new Error("Este archivo solo debe ser importado en el servidor.");
}

import {
  getResourcesByCategory as serverGetResourcesByCategory,
  getPopularResources as serverGetPopularResources,
} from "./server/resources.server";

export function getResourcesByCategory(category: string, limit: number = 3) {
  return serverGetResourcesByCategory(category, limit);
}

export function getPopularResources(limit: number = 3) {
  return serverGetPopularResources(limit);
}