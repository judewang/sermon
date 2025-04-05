import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default async function LanguageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko" suppressHydrationWarning>
			<body className={inter.className}>{children}</body>
		</html>
	);
}
