"use client";

import { useState, FormEvent } from "react";

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
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message.");
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:gap-2">
          <span className="text-[12px] sm:text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
            Name
          </span>

          <input
            type="text"
            name="name"
            required
            placeholder="Your name"
            disabled={status === "submitting"}
            className="rounded-xl border border-line/80 bg-surface-alt/50 px-3.5 py-2.5 sm:px-4 sm:py-3 text-[14px] sm:text-[15px] text-ink outline-none transition-all focus:border-ink dark:focus:border-white focus:bg-surface-card dark:focus:bg-surface-dark-card disabled:cursor-not-allowed disabled:opacity-60 dark:border-line-dark/80 dark:bg-surface-dark-alt/50 dark:text-ink-dark"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:gap-2">
          <span className="text-[12px] sm:text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
            Email
          </span>

          <input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            disabled={status === "submitting"}
            className="rounded-xl border border-line/80 bg-surface-alt/50 px-3.5 py-2.5 sm:px-4 sm:py-3 text-[14px] sm:text-[15px] text-ink outline-none transition-all focus:border-ink dark:focus:border-white focus:bg-surface-card dark:focus:bg-surface-dark-card disabled:cursor-not-allowed disabled:opacity-60 dark:border-line-dark/80 dark:bg-surface-dark-alt/50 dark:text-ink-dark"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 sm:gap-2">
        <span className="text-[12px] sm:text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
          Message
        </span>

        <textarea
          name="message"
          required
          rows={4}
          placeholder="What are you building?"
          disabled={status === "submitting"}
          className="resize-none rounded-xl border border-line/80 bg-surface-alt/50 px-3.5 py-2.5 sm:px-4 sm:py-3 text-[14px] sm:text-[15px] text-ink outline-none transition-all focus:border-ink dark:focus:border-white focus:bg-surface-card dark:focus:bg-surface-dark-card disabled:cursor-not-allowed disabled:opacity-60 dark:border-line-dark/80 dark:bg-surface-dark-alt/50 dark:text-ink-dark"
        />
      </label>

      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4 pt-1">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="self-start w-fit inline-flex items-center justify-center rounded-full bg-ink px-4 sm:px-6 py-2 sm:py-2.5 text-[12.5px] sm:text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_-18px_rgba(0,0,0,0.45)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:bg-white dark:text-black"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>

        {status === "success" && (
          <span className="text-[14px] text-green-600 dark:text-green-400">
            Message sent successfully. I&apos;ll be in touch shortly.
          </span>
        )}

        {status === "error" && (
          <span className="text-[14px] text-red-500">
            Something went wrong. Please try again or email me directly.
          </span>
        )}
      </div>
    </form>
  );
}