-- Profiles RLS Policy
--
-- WICHTIG: Policies auf der profiles-Tabelle dürfen NICHT profiles selbst
-- abfragen (z.B. per EXISTS auf profiles), da das eine Endlosrekursion
-- verursacht und die Query ewig hängt.
--
-- Korrekt: auth.uid() = id  (direkte Supabase-Funktion, kein Sub-Select auf profiles)

-- RLS aktivieren falls noch nicht geschehen
alter table public.profiles enable row level security;

-- Jeder angemeldete User darf seine eigene Zeile lesen (nicht-rekursiv)
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

-- Alle authentifizierten User dürfen alle Profile lesen
-- (benötigt für Reporter-Username in ReportsPage; Admin-Panel ist sowieso login-geschützt)
create policy "Authenticated users can read all profiles"
on public.profiles
for select
using (auth.role() = 'authenticated');
