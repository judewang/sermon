"use client";

import { convertDocument } from "@/actions/convert-document";
import type { PropsWithChildren } from "react";
import { useFormState } from "react-dom";

export function Form({ children }: Readonly<PropsWithChildren>) {
	const [_, formAction] = useFormState(convertDocument, null);

	return <form action={formAction}>{children}</form>;
}
