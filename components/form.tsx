"use client";

import { convertDocxToHtml } from "@/actions/convert";
import { PropsWithChildren } from "react";
import { useFormState } from "react-dom";

export function Form({ children }: Readonly<PropsWithChildren>) {
  const [_, formAction] = useFormState(convertDocxToHtml, null);

  return <form action={formAction}>{children}</form>;
}
