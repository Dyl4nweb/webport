"use client";

import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";

function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    // Play a friendly "ding" sound
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Silently ignore if audio is blocked by browser policies
  }
}

export default function ReminderPoller() {
  useEffect(() => {
    // Check reminders immediately on mount
    checkReminders();
    
    // Then poll every 30 seconds
    const interval = setInterval(() => {
      checkReminders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function checkReminders() {
    try {
      const supabase = getSupabase();
      
      const { data, error } = await supabase
        .from("admin_todos")
        .select("*")
        .eq("is_completed", false)
        .eq("notified", false)
        .not("remind_at", "is", null)
        .lte("remind_at", new Date().toISOString());

      if (error) {
        console.error("Reminder check error:", error.message);
        return;
      }

      if (data && data.length > 0) {
        for (const todo of data) {
          playNotificationSound();
          
          toast.info("Varex Reminder", {
            description: todo.task,
            duration: 15000, // 15 seconds
          });

          // Delete task from DB since it has already reminded the user
          await supabase.from("admin_todos").delete().eq("id", todo.id);
        }
      }
    } catch (e) {
      console.error("Reminder poller error:", e);
    }
  }

  return null;
}
