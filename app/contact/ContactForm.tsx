"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      // Replace with a real endpoint (Formspree, Resend, an API route, etc.)
      await new Promise((resolve) => setTimeout(resolve, 900));
      console.log("Contact form submission:", data);
      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
            Name
          </span>
          <input
            type="text"
            name="name"
            required
            placeholder="Your name"
            className="rounded-apple-sm border border-line bg-surface-card px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-accent dark:border-line-dark dark:bg-surface-dark-card dark:text-ink-dark dark:focus:border-accent-dark"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            className="rounded-apple-sm border border-line bg-surface-card px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-accent dark:border-line-dark dark:bg-surface-dark-card dark:text-ink-dark dark:focus:border-accent-dark"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="What are you building?"
          className="resize-none rounded-apple-sm border border-line bg-surface-card px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-accent dark:border-line-dark dark:bg-surface-dark-card dark:text-ink-dark dark:focus:border-accent-dark"
        />
      </label>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" className="min-w-[160px]">
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>

        {status === "success" && (
          <span className="text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            Thanks — I&apos;ll be in touch shortly.
          </span>
        )}
        {status === "error" && (
          <span className="text-[14px] text-red-500">
            Something went wrong. Please email me directly instead.
          </span>
        )}
      </div>
    </form>
  );
}
