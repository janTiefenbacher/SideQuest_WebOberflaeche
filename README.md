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

Fertig – das UI greift automatisch auf die in der Frage gegebene Supabase-Struktur zu.

