// app/public/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Obtener el token del query string
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  
  // Construir URL de destino con el token
  const url = new URL("/newsletter/confirm", request.url);
  if (token) {
    url.searchParams.set("token", token);
  }
  url.searchParams.set("public", "true");
  
  const response = NextResponse.redirect(url);
  
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Clear-Site-Data", '"cookies"');
  
  return response;
}