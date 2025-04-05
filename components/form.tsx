'use client';

import { convertDocument } from '@/actions/convert-document';
import { type PropsWithChildren, useActionState } from 'react';

export function Form({ children }: Readonly<PropsWithChildren>) {
	const [_, formAction] = useActionState(convertDocument, null);

	return <form action={formAction}>{children}</form>;
}
