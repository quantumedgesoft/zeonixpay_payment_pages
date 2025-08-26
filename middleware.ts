import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;


  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/404";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/payment/callback-redirect")) {
    if (!searchParams.has("invoice_payment_id")) {
      const url = req.nextUrl.clone();
      url.pathname = "/404";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/payment") {
    if (!searchParams.has("invoice_payment_id")) {
      const url = req.nextUrl.clone();
      url.pathname = "/404";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",         
    "/payment",
    "/success",
    "/payment/callback-redirect",
  ],
};
