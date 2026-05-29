import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const locale = request.cookies.get("locale")?.value;
  if (!locale) {
    response.cookies.set("locale", "pt");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};