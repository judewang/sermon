import { convertDocument } from '@/actions/convert-document';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadButton } from '@/components/upload-button';

export default function UploadForm() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
			<form action={convertDocument}>
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>上傳檔案</CardTitle>
						<CardDescription>選擇您要上傳的 .docx 檔案。</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid w-full items-center gap-4">
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="file">檔案</Label>
								<Input id="file" type="file" name="file" accept=".docx" />
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<UploadButton />
					</CardFooter>
				</Card>
			</form>
		</main>
	);
}
