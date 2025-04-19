import { env } from '@/lib/env';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	metadataBase: new URL(env.BASE_URL),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
