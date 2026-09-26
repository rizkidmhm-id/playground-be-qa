import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, corsPreflight } from "./lib/cors";

export function proxy(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return corsPreflight();
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders())) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
