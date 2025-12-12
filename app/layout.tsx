// app/layout.tsx
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
    <html lang="es"><body className={`${arimo.variable} ${ptSans.variable} ${philosopher.variable} min-h-screen`}>
      <Layout>{children}</Layout>
      <ClientOnlyBanner />
    </body></html>
  );
}