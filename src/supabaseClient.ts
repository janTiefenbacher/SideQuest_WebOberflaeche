import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined;

if (!supabaseUrl || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] VITE_SUPABASE_URL oder VITE_SUPABASE_ANON_KEY ist nicht gesetzt. Bitte . konfigurieren.'
  );
}

// Für das Admin-Panel kannst du lokal (DEV) optional den Service-Role-Key nutzen,
// um RLS-Einschränkungen zu umgehen. Niemals in einer öffentlichen/Production-Web-App verwenden!
const useServiceRoleInDev = import.meta.env.DEV && !!serviceKey;
const keyToUse = useServiceRoleInDev ? serviceKey : anonKey;

export const supabase = createClient(supabaseUrl ?? '', keyToUse ?? '');

