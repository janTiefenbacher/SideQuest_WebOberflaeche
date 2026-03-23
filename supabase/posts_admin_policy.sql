-- Posts Admin Policy (RLS)
-- Admins dürfen alle Posts lesen und bei Bedarf löschen (Moderation).

drop policy if exists "Admins manage posts" on public.posts;

create policy "Admins manage posts"
on public.posts
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
