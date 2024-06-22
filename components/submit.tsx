"use client";

import { useFormStatus } from "react-dom";

export function Submit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border px-4 py-2"
    >
      {pending ? "Uploading..." : "Upload"}
    </button>
  );
}
