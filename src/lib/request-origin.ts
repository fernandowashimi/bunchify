import type { NextRequest } from "next/server";

export function requestOrigin(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    ?.trim();
  const proto = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(/:$/, ""))
    .split(",")[0]
    ?.trim();

  if (!host || !proto) return request.nextUrl.origin;
  return `${proto}://${host}`;
}

export function requestHost(request: NextRequest) {
  return new URL(requestOrigin(request)).host;
}
