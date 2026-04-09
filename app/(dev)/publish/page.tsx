import { Form } from "@/components/form";
import { Submit } from "@/components/submit";

export default function UploadForm() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-8 sm:py-16 md:p-24">
      <div className="z-10 w-full max-w-5xl font-mono text-sm">
        <Form>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <input
              type="file"
              name="file"
              className="w-full cursor-pointer text-sm file:mr-4 file:cursor-pointer file:rounded file:border file:px-3 file:py-1.5 file:text-sm"
            />
            <Submit />
          </div>
        </Form>
      </div>
    </main>
  );
}
