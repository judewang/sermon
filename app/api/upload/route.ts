import { validateSecret } from "@/lib/auth";
import { processUploadedFile } from "@/lib/upload";
import { NextResponse } from "next/server";

// Allow up to 60 seconds for document processing
export const maxDuration = 60;

/**
 * POST /api/upload
 * Accepts a multipart/form-data request with a "file" field (.docx only).
 * Requires Authorization: Bearer <UPLOAD_SECRET> header.
 */
export async function POST(request: Request) {
	// Validate Bearer token
	if (!validateSecret(request)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Parse form data
	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
	}

	const file = formData.get("file");

	if (!file || !(file instanceof File)) {
		return NextResponse.json({ error: "Missing file field" }, { status: 400 });
	}

	// Validate file extension
	const ext = file.name.split(".").pop()?.toLowerCase();
	if (ext !== "docx") {
		return NextResponse.json(
			{ error: "Only .docx files are supported" },
			{ status: 400 },
		);
	}

	const { key } = await processUploadedFile(file);

	return NextResponse.json({
		success: true,
		key,
		url: `/articles/${key}`,
	});
}
