import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieItem = {
  name: string;
  value: string;
  options?: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2];
};

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://eckdybswbcbhqidgwfkl.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVja2R5YnN3YmNiaHFpZGd3ZmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NzgzNTksImV4cCI6MjEwOTI1NDM1OX0.ph2nqVEeAvWIFx-SlbTQVuomk2OOmkBjEkMwvMFbMdg';

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component; session refresh is handled in middleware
          }
        },
      },
    }
  );
}
