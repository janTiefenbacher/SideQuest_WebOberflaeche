-- Post Reports Admin Policy (RLS)
-- Admins dürfen post_reports lesen und den Status aktualisieren.

drop policy if exists "Admins manage post_reports" on public.post_reports;

create policy "Admins manage post_reports"
on public.post_reports
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
