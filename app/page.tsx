"use client";

import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File>();
  const [html, setHtml] = useState<string>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    try {
      const data = new FormData();
      data.set("file", file);

      const res = await fetch("/api/docx-to-html", {
        method: "POST",
        body: data,
      });
      // handle the error
      if (!res.ok) throw new Error(await res.text());

      const { html } = await res.json();

      setHtml(html);
    } catch (e: any) {
      // Handle errors here
      console.error(e);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {html ? (
          <article dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <form onSubmit={onSubmit}>
            <input
              type="file"
              name="file"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
            <input type="submit" value="Upload" />
          </form>
        )}
      </div>
    </main>
  );
}
