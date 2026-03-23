## SideQuest Admin Weboberfläche

React/Vite Admin-Frontend, um deine SideQuest-App über Supabase zu managen:

- **Reports & Tickets** (Tabelle `post_reports` + zugehörige `posts`/`profiles`)
- **Quest-Verwaltung** (`quest_templates`, `daily_quests`, `user_quest_stats`)
- **Übersicht/Dashboard** mit Kennzahlen

### Setup

1. Abhängigkeiten installieren:

```bash
npm install
```

2. Supabase-Verbindung konfigurieren (`.env.local` im Projektordner anlegen):

```bash
VITE_SUPABASE_URL='https://adcutkrypgdtlaqaxvqo.supabase.co';
VITE_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkY3V0a3J5cGdkdGxhcWF4dnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODY0NzAsImV4cCI6MjA3MzI2MjQ3MH0.rNZdeby6C4yScBE-_elUdBDcpSkAc-r7lsH3NSfs_HU';
```

3. Dev-Server starten:

```bash
npm run dev
```

### RLS / Admin Zugriff (wichtig)

In deinem DB-Schema ist `quest_templates` mit RLS geschützt, aber es gibt in dem von dir geposteten Teil keine Policy für Insert/Update. Deshalb kann das UI beim Hinzufügen/Bearbeiten blockiert werden.

Führe daher dieses SQL in deinem Supabase SQL Editor aus:

- `supabase/quest_templates_admin_policy.sql`

Danach sollte „Anlegen“ und „Bearbeiten“ in der UI funktionieren.

### Optional: Dev ohne RLS-Policies (nur lokal)

Wenn du im Dev wirklich schnell arbeiten willst, kannst du zusätzlich in deiner `.env.local` setzen:

```bash
VITE_SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
```

Dann nutzt das Admin-UI im DEV automatisch diesen Key (RLS aus, nur lokal). In Production bitte NICHT verwenden.

### DEV-Notfall (öffnet RLS komplett)
Wenn du nur schnell testen willst, ob es wirklich „nur“ an RLS liegt:

- `supabase/quest_templates_dev_open_policy.sql`

Danach sollte das UI Inserts/Updates erlauben, auch ohne Login/Admin-Claims.
Wieder rückgängig machen, sobald es läuft.

