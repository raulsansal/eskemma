// scripts/seed-resources.ts
/**
 * Script temporal para agregar recursos a Firestore
 * Ejecutar: npx ts-node scripts/seed-resources.ts
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  // TUS CREDENCIALES DE FIREBASE
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleResources = [
  {
    title: "Guía de Estrategia Electoral 2024",
    description: "Manual completo de planificación estratégica para campañas políticas",
    category: "estrategia-electoral",
    fileType: "pdf",
    fileSize: "2.3 MB",
    thumbnail: "/resources/thumbnails/guia-estrategia.jpg",
    fileStoragePath: "resources/guia-estrategia-2024.pdf",
    isFree: true,
    price: 0,
    accessLevel: ["user", "basic", "premium", "grupal", "admin"],
    downloadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
  },
  {
    title: "Plantilla de Análisis de Redes Sociales",
    description: "Excel con fórmulas para analizar métricas de redes sociales",
    category: "comunicacion-politica",
    fileType: "xlsx",
    fileSize: "1.5 MB",
    fileStoragePath: "resources/plantilla-redes-sociales.xlsx",
    isFree: true,
    price: 0,
    accessLevel: ["user", "basic", "premium", "grupal", "admin"],
    downloadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
  },
  // Agrega más recursos según necesites
];

async function seedResources() {
  console.log("🌱 Iniciando seed de recursos...");

  for (const resource of sampleResources) {
    try {
      const docRef = await addDoc(collection(db, "resources"), resource);
      console.log(`✅ Recurso creado: ${resource.title} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Error al crear recurso: ${resource.title}`, error);
    }
  }

  console.log("✅ Seed completado");
}

seedResources();