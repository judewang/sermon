"use client";

import { convertDocxToHtml } from "@/actions/convert";
import { useFormState, useFormStatus } from "react-dom";

export default function UploadForm() {
  const [_, formAction] = useFormState(convertDocxToHtml, null);
  const { pending } = useFormStatus();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <form action={formAction}>
          <input type="file" name="file" />
          <button type="submit" disabled={pending}>
            {pending ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </main>
  );
}
