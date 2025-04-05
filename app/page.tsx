import { defaultLanguage } from "@/lib/language-settings";
import { redirect } from "next/navigation";

export default function HomePage() {
	redirect(`/${defaultLanguage}`);
}
