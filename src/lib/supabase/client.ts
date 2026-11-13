import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://eckdybswbcbhqidgwfkl.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVja2R5YnN3YmNiaHFpZGd3ZmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NzgzNTksImV4cCI6MjEwOTI1NDM1OX0.ph2nqVEeAvWIFx-SlbTQVuomk2OOmkBjEkMwvMFbMdg';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
