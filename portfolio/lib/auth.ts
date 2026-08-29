"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

export async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });
  return error ? error.message : null;
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}

export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return { session, loading };
}
