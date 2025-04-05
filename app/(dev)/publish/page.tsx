import { Form } from '@/components/form';
import { Submit } from '@/components/submit';

export default function UploadForm() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
				<Form>
					<input type="file" name="file" />
					<Submit />
				</Form>
			</div>
		</main>
	);
}
