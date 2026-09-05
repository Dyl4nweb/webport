"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useConfirm } from "@/lib/admin/confirm-context";

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

interface AdminNote {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState("");
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("admin_notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim() || saving) return;

    try {
      setSaving(true);
      const supabase = getSupabase();
      const { error } = await supabase
        .from("admin_notes")
        .insert({ content: newNote.trim() });

      if (error) throw error;
      setNewNote("");
      await fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(id: string) {
    const ok = await confirm({
      title: "Delete Note",
      message: "Are you sure you want to delete this note? This cannot be undone.",
      confirmLabel: "Delete Note"
    });
    if (!ok) return;

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("admin_notes").delete().eq("id", id);
      if (error) throw error;
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      console.error(e.message);
    }
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col sm:h-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink dark:text-ink-dark">
            Notes
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-secondary dark:text-ink-dark-secondary">
            Your personal scratchpad. Varex AI can also take notes for you here.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-4">
        {/* New Note Form */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleAddNote}
            className="flex flex-col gap-3 rounded-apple-2xl border border-line/60 bg-surface-card p-4 shadow-sm dark:border-line-dark/60 dark:bg-surface-dark-card"
          >
            <h2 className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Quick Note
            </h2>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write something down..."
              disabled={saving}
              className="admin-scrollbar min-h-[120px] w-full resize-y rounded-xl border border-line bg-surface p-3 text-[13.5px] text-ink placeholder:text-ink-secondary/60 focus:border-accent focus:outline-none dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-accent-dark"
            />
            <button
              type="submit"
              disabled={!newNote.trim() || saving}
              className="mt-1 inline-flex h-9 items-center justify-center rounded-apple-sm bg-ink px-4 text-[13px] font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-ink-dark dark:text-surface-dark"
            >
              {saving ? "Saving..." : "Save Note"}
            </button>
          </form>
        </div>

        {/* Notes Grid */}
        <div className="md:col-span-2 xl:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-r-transparent dark:border-accent-dark" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-apple-2xl border border-dashed border-line p-12 text-center dark:border-line-dark">
              <p className="text-[14px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                No notes found.
              </p>
              <p className="mt-1 text-[13px] text-ink-secondary/70 dark:text-ink-dark-secondary/70">
                You can ask Varex AI to take a note for you.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative flex flex-col justify-between gap-4 rounded-apple-xl border border-line/60 bg-surface-card p-4 shadow-sm transition-all hover:border-line hover:shadow-md dark:border-line-dark/60 dark:bg-surface-dark-card dark:hover:border-line-dark"
                >
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink dark:text-ink-dark">
                    {note.content}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-line/50 pt-3 dark:border-line-dark/50">
                    <span className="text-[11px] font-medium text-ink-secondary/70 dark:text-ink-dark-secondary/70">
                      {getRelativeTime(note.created_at)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded bg-red-500/10 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                      title="Delete Note"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
