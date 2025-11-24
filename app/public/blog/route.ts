// app/public/blog/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL("/blog", request.url);
  url.searchParams.set("public", "true");
  
  const response = NextResponse.redirect(url);
  
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Clear-Site-Data", '"cookies"');
  
  return response;
}