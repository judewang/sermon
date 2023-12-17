"use client";

import { useFormStatus } from "react-dom";

export function Submit() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload"}
    </button>
  );
}
