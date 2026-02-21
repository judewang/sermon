import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLanguage } from "./lib/language-settings";

export function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Redirect root path to default language
	if (pathname === "/") {
		return NextResponse.redirect(new URL(`/${defaultLanguage}`, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
