import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] VITE_SUPABASE_URL oder VITE_SUPABASE_ANON_KEY ist nicht gesetzt. Bitte .env.local konfigurieren.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');

