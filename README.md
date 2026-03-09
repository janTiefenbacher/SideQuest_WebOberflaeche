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
VITE_SUPABASE_URL=deine_supabase_url
VITE_SUPABASE_ANON_KEY=dein_supabase_key
```

3. Dev-Server starten:

```bash
npm run dev
```

Fertig – das UI greift automatisch auf die in der Frage gegebene Supabase-Struktur zu.

