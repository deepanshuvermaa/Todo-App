import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = ({ currentView, onViewChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
    { id: 'tasks', label: 'Tasks', icon: '✓', path: '/tasks' },
    { id: 'expenses', label: 'Expenses', icon: '💰', path: '/expenses' },
    { id: 'notes', label: 'Notes', icon: '📝', path: '/notes' },
    { id: 'habits', label: 'Habits', icon: '🎯', path: '/habits' },
    { id: 'meals', label: 'Meals', icon: '🍽️', path: '/meals' },
    { id: 'alarms', label: 'Alarms', icon: '⏰', path: '/alarms' },
    { id: 'movies', label: 'Movies', icon: '🎬', path: '/movies' },
    { id: 'journal', label: 'Journal', icon: '📖', path: '/journal' },
    { id: 'reminders', label: 'Reminders', icon: '📞', path: '/reminders' },
    { id: 'bucket', label: 'Bucket List', icon: '🎯', path: '/bucket' }
  ];

  const handleTabClick = (tab) => {
    if (tab.path === '/') {
      onViewChange('dashboard');
    } else {
      onViewChange(tab.id);
    }
    navigate(tab.path);
  };

  const isActive = (tab) => {
    if (tab.path === '/') {
      return location.pathname === '/' && currentView === 'dashboard';
    }
    return location.pathname === tab.path;
  };

  return (
    <nav className="mt-4">
      <div className="flex space-x-2 overflow-x-auto pb-2 nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`nav-tab ${isActive(tab) ? 'active' : ''}`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;