import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de imágenes externas
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Permite imágenes desde Unsplash
        port: "",
        pathname: "/**", // Permite cualquier ruta dentro del host
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com", // Permite imágenes desde Unsplash Plus
        port: "",
        pathname: "/**", // Permite cualquier ruta dentro del host
      },
    ],
  },
};

export default nextConfig;