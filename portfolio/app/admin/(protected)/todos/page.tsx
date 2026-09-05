"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

interface AdminTodo {
  id: string;
  task: string;
  is_completed: boolean;
  created_at: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<AdminTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("admin_todos")
        .select("*")
        .order("is_completed", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim() || saving) return;

    try {
      setSaving(true);
      const supabase = getSupabase();
      const { error } = await supabase
        .from("admin_todos")
        .insert({ task: newTask.trim() });

      if (error) throw error;
      setNewTask("");
      await fetchTodos();
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleComplete(id: string, currentStatus: boolean) {
    try {
      // Optimistic UI update
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_completed: !currentStatus } : t))
      );

      const supabase = getSupabase();
      const { error } = await supabase
        .from("admin_todos")
        .update({ is_completed: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        throw error;
      }
      
      // Re-fetch to guarantee sorting is applied correctly
      await fetchTodos();
    } catch (error) {
      console.error("Error toggling task:", error);
      // Revert on error
      await fetchTodos();
    }
  }

  async function handleDeleteTodo(id: string) {
    if (!confirm("Delete this task?")) return;
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("admin_todos").delete().eq("id", id);
      if (error) throw error;
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  const pendingCount = todos.filter((t) => !t.is_completed).length;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col sm:h-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink dark:text-ink-dark">
            Tasks
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-secondary dark:text-ink-dark-secondary">
            You have {pendingCount} pending {pendingCount === 1 ? "task" : "tasks"}.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-4">
        {/* Add Task Form */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleAddTodo}
            className="flex flex-col gap-3 rounded-apple-2xl border border-line/60 bg-surface-card p-4 shadow-sm dark:border-line-dark/60 dark:bg-surface-dark-card"
          >
            <h2 className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              New Task
            </h2>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              disabled={saving}
              className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-[13.5px] text-ink placeholder:text-ink-secondary/60 focus:border-accent focus:outline-none dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-accent-dark"
            />
            <button
              type="submit"
              disabled={!newTask.trim() || saving}
              className="mt-1 inline-flex h-9 items-center justify-center rounded-apple-sm bg-ink px-4 text-[13px] font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-ink-dark dark:text-surface-dark"
            >
              {saving ? "Adding..." : "Add Task"}
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="md:col-span-2 xl:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-r-transparent dark:border-accent-dark" />
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-apple-2xl border border-dashed border-line p-12 text-center dark:border-line-dark">
              <p className="text-[14px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                No tasks found.
              </p>
              <p className="mt-1 text-[13px] text-ink-secondary/70 dark:text-ink-dark-secondary/70">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group flex items-center justify-between gap-4 rounded-apple-xl border p-3 shadow-sm transition-all ${
                    todo.is_completed
                      ? "border-transparent bg-surface-card/40 opacity-70 dark:bg-surface-dark-card/40"
                      : "border-line/60 bg-surface-card hover:border-line dark:border-line-dark/60 dark:bg-surface-dark-card dark:hover:border-line-dark"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(todo.id, todo.is_completed)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        todo.is_completed
                          ? "border-accent bg-accent text-white dark:border-accent-dark dark:bg-accent-dark"
                          : "border-line text-transparent hover:border-accent dark:border-line-dark dark:hover:border-accent-dark"
                      }`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                    <span
                      className={`truncate text-[14px] ${
                        todo.is_completed
                          ? "text-ink-secondary line-through dark:text-ink-dark-secondary"
                          : "text-ink dark:text-ink-dark"
                      }`}
                    >
                      {todo.task}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-red-500/10 text-red-500 opacity-0 transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100"
                    title="Delete Task"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
