import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://eckdybswbcbhqidgwfkl.supabase.co';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVja2R5YnN3YmNiaHFpZGd3ZmtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzY3ODM1OSwiZXhwIjoyMTA5MjU0MzU5fQ.uuJ5GWQ-9U_dBA3u0t4jaqOkKlihruNQ7LjRkTcFlZ0';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL and Service Role Key are required for admin operations.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
