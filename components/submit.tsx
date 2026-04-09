"use client";

import { useFormStatus } from "react-dom";

export function Submit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded border px-4 py-2 sm:w-auto"
    >
      {pending ? "Uploading..." : "Upload"}
    </button>
  );
}
