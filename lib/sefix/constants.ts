// lib/sefix/constants.ts
// Constantes compartidas entre cliente y servidor para el módulo Sefix.
// NO importar desde este archivo en lib/sefix/storage.ts para evitar
// dependencias circulares — storage.ts declara su propio ESTADO_MAP local.

// ============================================================
// ESTADOS DE LA REPÚBLICA MEXICANA (key normalizado → nombre oficial)
// ============================================================

export const ESTADO_MAP: Record<string, string> = {
  aguascalientes: "AGUASCALIENTES",
  baja_california: "BAJA CALIFORNIA",
  baja_california_sur: "BAJA CALIFORNIA SUR",
  campeche: "CAMPECHE",
  chiapas: "CHIAPAS",
  chihuahua: "CHIHUAHUA",
  coahuila: "COAHUILA",
  colima: "COLIMA",
  ciudad_de_mexico: "CIUDAD DE MEXICO",
  durango: "DURANGO",
  estado_de_mexico: "ESTADO DE MEXICO",
  guanajuato: "GUANAJUATO",
  guerrero: "GUERRERO",
  hidalgo: "HIDALGO",
  jalisco: "JALISCO",
  michoacan: "MICHOACAN",
  morelos: "MORELOS",
  nayarit: "NAYARIT",
  nuevo_leon: "NUEVO LEON",
  oaxaca: "OAXACA",
  puebla: "PUEBLA",
  queretaro: "QUERETARO",
  quintana_roo: "QUINTANA ROO",
  san_luis_potosi: "SAN LUIS POTOSI",
  sinaloa: "SINALOA",
  sonora: "SONORA",
  tabasco: "TABASCO",
  tamaulipas: "TAMAULIPAS",
  tlaxcala: "TLAXCALA",
  veracruz: "VERACRUZ",
  yucatan: "YUCATAN",
  zacatecas: "ZACATECAS",
};

export const ESTADOS_LIST = Object.entries(ESTADO_MAP)
  .map(([key, nombre]) => ({ key, nombre }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre));

// ============================================================
// COLORES DE PARTIDOS POLÍTICOS (identidad partidaria, NO design system)
// ============================================================

export const PARTY_COLORS: Record<string, string> = {
  PAN: "#003F8A",
  PRI: "#E01B22",
  PRD: "#FFCD00",
  PVEM: "#009A44",
  PT: "#C8102E",
  MC: "#F7941D",
  MORENA: "#8B0000",
  NA: "#4B0082",
  PES: "#800080",
  RSP: "#A0522D",
  FXM: "#006400",
  // Fallback para partidos no mapeados
  DEFAULT: "#6B7280",
};

// ============================================================
// CARGOS ELECTORALES
// ============================================================

export const CARGOS_LIST = [
  { key: "dip", label: "Diputados Federales" },
  { key: "sen", label: "Senadores" },
  { key: "pdte", label: "Presidencia" },
];
