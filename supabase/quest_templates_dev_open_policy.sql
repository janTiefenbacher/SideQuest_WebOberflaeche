-- DEV ONLY: Öffnet quest_templates komplett für Insert/Update (RLS-Test)
-- Achtung: Das macht deine quest_templates änderbar für alle, die Requests machen.
-- Für Produktiv niemals verwenden.

drop policy if exists "DEV open quest_templates" on public.quest_templates;

create policy "DEV open quest_templates"
on public.quest_templates
for all
using (true)
with check (true);

