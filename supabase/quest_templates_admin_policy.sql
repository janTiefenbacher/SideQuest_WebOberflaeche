-- Quest Templates Admin Policy (RLS)
-- Ziel: Admin-User dürfen quest_templates insert/update/delete/selecten.
--
-- WICHTIG:
-- Dein Schema enthält role in public.profiles.role.
-- Daher prüfen wir hier admin über profiles.role (statt request.jwt.claims).

drop policy if exists "Admins manage quest_templates" on public.quest_templates;

create policy "Admins manage quest_templates"
on public.quest_templates
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

