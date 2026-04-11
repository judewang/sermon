import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Validates the Bearer token in the Authorization header using timing-safe comparison.
 * Returns true if the token matches UPLOAD_SECRET, false otherwise.
 */
export function validateSecret(request: Request): boolean {
	const authHeader = request.headers.get("authorization");
	if (!authHeader?.startsWith("Bearer ")) return false;
	const token = authHeader.slice(7);
	if (token.length !== env.UPLOAD_SECRET.length) return false;
	const encoder = new TextEncoder();
	const a = encoder.encode(token);
	const b = encoder.encode(env.UPLOAD_SECRET);
	return timingSafeEqual(new Uint8Array(a), new Uint8Array(b));
}
