import type { Metadata } from "next";
import { Arimo, PT_Sans, Philosopher } from "next/font/google";
import "./globals.css";
import Layout from "./components/Layout";
import ClientOnlyBanner from "./components/legal/ClientOnlyBanner";

// Configura Arimo como fuente primaria
const arimo = Arimo({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-arimo",
});

// Configura PT Sans para captions
const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pt-sans",
});

// Configura Philosopher para títulos de posts en el blog
const philosopher = Philosopher({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-philosopher",
});

export const metadata: Metadata = {
  title: "Eskemma",
  description: "Un espacio digital para tu proyecto político",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${arimo.variable} ${ptSans.variable} ${philosopher.variable} min-h-screen`}
      >
        {/* NUEVO: Skip Link para accesibilidad */}
        <a
          href="#main-content"
          className="sr-only-focusable bg-bluegreen-eske text-white-eske px-6 py-3 rounded-lg font-semibold shadow-lg"
          style={{
            top: "5rem",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          Saltar al contenido principal
        </a>

        <Layout>{children}</Layout>
        <ClientOnlyBanner />
      </body>
    </html>
  );
}
