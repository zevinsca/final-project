import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const pathname = req.nextUrl.pathname;

  if (!accessToken && pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Redirect ke login jika tidak ada token
  if (!accessToken) {
    return NextResponse.redirect(`${req.nextUrl.origin}/auth/login`);
  }
  const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
  if (!secret || secret.trim() === "") {
    console.error("🚨 Secret Code is not defined or empty!");
    return new NextResponse("Server misconfiguration: Secret Code missing", {
      status: 500,
    });
  }

  let payload;
  try {
    const verified = await jwtVerify(
      accessToken,
      new TextEncoder().encode(secret)
    );
    payload = verified.payload;
  } catch (err) {
    console.error("Secret Code verification failed:", err);
    return NextResponse.redirect(`${req.nextUrl.origin}/auth/login`);
  }

  const role = payload?.role;

  if (
    (role === "SUPER_ADMIN" && pathname.startsWith("/dashboard/admin")) ||
    (role === "USER" && pathname.startsWith("/dashboard/user")) ||
    (role === "STORE_ADMIN" && pathname.startsWith("/dashboard/admin-store"))
  ) {
    return NextResponse.next();
  } else {
    return new NextResponse("Forbidden access", { status: 403 });
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
