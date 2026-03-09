import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">SideQuest Admin</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end className="nav-link">
            Übersicht
          </NavLink>
          <NavLink to="/reports" className="nav-link">
            Reports & Tickets
          </NavLink>
          <div className="nav-section-label">Quests</div>
          <NavLink to="/quests/templates" className="nav-link">
            Quest-Vorlagen
          </NavLink>
          <NavLink to="/quests/daily" className="nav-link">
            Daily Quests
          </NavLink>
          <NavLink to="/users/stats" className="nav-link">
            User-Stats
          </NavLink>
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="topbar-title">Moderation & Quest-Management</div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

