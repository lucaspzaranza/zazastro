// src/app/api/nominatim/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  if (!q)
    return NextResponse.json({ error: "missing q param" }, { status: 400 });

  const params = new URLSearchParams({
    q,
    format: "json",
    addressdetails: "1",
    limit: "5",
    email: process.env.NOMINATIM_EMAIL || "",
  });
  const target = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  const response = await fetch(target, {
    headers: {
      "User-Agent":
        process.env.NOMINATIM_USER_AGENT ||
        `Zazastro/1.0 (${
          process.env.NOMINATIM_EMAIL || "lucaszaranza@gmail.com"
        })`,
      Referer: process.env.NOMINATIM_REFERER || "",
    },
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
}
