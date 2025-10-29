// utils/generateAlternativeUserName.ts

import { isUserNameAvailable } from "./userUtils"; // Importar la función para verificar disponibilidad

/**
 * Genera un nombre de usuario alternativo agregando un número incremental
 * hasta encontrar uno disponible.
 *
 * @param baseUserName - El nombre de usuario base (sin números adicionales).
 * @returns Un nombre de usuario único disponible.
 */
export const generateAlternativeUserName = async (
  baseUserName: string
): Promise<string> => {
  let counter = 1; // Inicializar el contador para generar alternativas
  let alternativeUserName = `${baseUserName}${counter}`; // Nombre alternativo inicial

  // Iterar hasta encontrar un nombre de usuario disponible
  while (!(await isUserNameAvailable(alternativeUserName))) {
    counter++; // Incrementar el contador
    alternativeUserName = `${baseUserName}${counter}`; // Construir el nuevo nombre alternativo
  }

  return alternativeUserName; // Retornar el nombre de usuario disponible
};