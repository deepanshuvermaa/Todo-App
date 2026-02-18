import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '@/store/useAppStore';
import {
  TaskIcon,
  CheckIcon,
  MoneyIcon,
  NoteIcon,
  HabitIcon,
  MealIcon,
  JournalIcon,
  ReminderIcon,
  DreamIcon,
  CaloriesIcon,
  SunnyIcon,
  GreetingIcon,
  DashboardIcon,
  VoiceIcon,
  TextExtractIcon,
  LinkIcon,
  HistoryIcon,
  AboutIcon,
  SettingsIcon,
  MoonIcon,
  GoogleIcon,
  SignOutIcon
} from '@/components/icons/Icons';

const Sidebar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Icon mapping function
  const getIcon = (iconId) => {
    const iconMap = {
      'dashboard': <DashboardIcon className="w-5 h-5" />,
      'tasks': <TaskIcon className="w-5 h-5" />,
      'expenses': <MoneyIcon className="w-5 h-5" />,
      'notes': <NoteIcon className="w-5 h-5" />,
      'habits': <HabitIcon className="w-5 h-5" />,
      'meals': <MealIcon className="w-5 h-5" />,
      'alarms': <span className="text-lg">⏰</span>,
      'movies': <span className="text-lg">🎬</span>,
      'journal': <JournalIcon className="w-5 h-5" />,
      'reminders': <ReminderIcon className="w-5 h-5" />,
      'bucket': <DreamIcon className="w-5 h-5" />,
      'voice': <VoiceIcon className="w-5 h-5" />,
      'ocr': <TextExtractIcon className="w-5 h-5" />,
      'links': <LinkIcon className="w-5 h-5" />,
      'history': <HistoryIcon className="w-5 h-5" />,
      'about': <AboutIcon className="w-5 h-5" />,
      'settings': <SettingsIcon className="w-5 h-5" />
    };
    return iconMap[iconId] || <TaskIcon className="w-5 h-5" />;
  };
  const {
    tasks,
    expenses,
    notes,
    habits,
    habitHistory,
    meals,
    callReminders,
    bucketList,
    journalEntries,
    darkMode,
    toggleDarkMode,
    syncStatus,
    signInToGoogle,
    signOutFromGoogle,
    isAuthenticated,
    userEmail
  } = useAppStore();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/',
      count: null
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'tasks',
      path: '/tasks',
      count: tasks.filter(t => !t.completed && t.date === new Date().toISOString().split('T')[0]).length
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: 'expenses',
      path: '/expenses',
      count: expenses.length
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: 'notes',
      path: '/notes',
      count: notes.length
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: 'habits',
      path: '/habits',
      count: habits.length
    },
    {
      id: 'meals',
      label: 'Meals',
      icon: 'meals',
      path: '/meals',
      count: meals.filter(m => m.date === new Date().toISOString().split('T')[0]).length
    },
    {
      id: 'alarms',
      label: 'Alarms',
      icon: 'alarms',
      path: '/alarms',
      count: null
    },
    {
      id: 'movies',
      label: 'Movies',
      icon: 'movies',
      path: '/movies',
      count: null
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: 'journal',
      path: '/journal',
      count: journalEntries.length
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: 'reminders',
      path: '/reminders',
      count: callReminders.length
    },
    {
      id: 'bucket',
      label: 'Bucket List',
      icon: 'bucket',
      path: '/bucket',
      count: bucketList.filter(b => b.status !== 'completed').length
    },
    {
      id: 'voice',
      label: 'Voice Commands',
      icon: 'voice',
      path: '/voice',
      count: null
    },
    {
      id: 'ocr',
      label: 'Text Extract',
      icon: 'ocr',
      path: '/ocr',
      count: null
    },
    {
      id: 'links',
      label: 'Link Manager',
      icon: 'links',
      path: '/links',
      count: null
    },
    {
      id: 'history',
      label: 'History',
      icon: 'history',
      path: '/history',
      count: null
    },
    {
      id: 'about',
      label: 'About',
      icon: 'about',
      path: '/about',
      count: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      path: '/settings',
      count: null
    }
  ];

  const handleNavigation = (item) => {
    navigate(item.path);
    if (window.innerWidth < 768) {
      onToggle(); // Close sidebar on mobile after navigation
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing': return 'Syncing...';
      case 'success': return 'Synced';
      case 'failed': return 'Sync failed';
      case 'offline': return 'Offline';
      default: return 'Ready';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onToggle}
            aria-hidden="true"
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : window.innerWidth >= 768 ? 0 : -320
        }}
        transition={{
          type: "tween",
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="fixed md:sticky top-0 left-0 h-full md:h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 w-80 md:w-64"
        style={{
          willChange: 'transform'
        }}
        aria-label="Main navigation"
        aria-hidden={!isOpen && window.innerWidth < 768}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                LIFE
              </h1>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle();
                }}
                aria-label="Close navigation menu"
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            {isAuthenticated && userEmail && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 truncate">
                  {userEmail}
                </p>
                <div className={`text-xs ${getSyncStatusColor()} flex items-center gap-1`}>
                  <div className={`w-2 h-2 rounded-full ${
                    syncStatus === 'syncing' ? 'animate-pulse bg-blue-500' :
                    syncStatus === 'success' ? 'bg-green-500' :
                    syncStatus === 'failed' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  {getSyncStatusText()}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-2" aria-label="Application sections">
            <div className="space-y-1" role="list">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  role="listitem"
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  aria-label={item.count !== null && item.count > 0 ? `${item.label} (${item.count})` : item.label}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3" aria-hidden="true">
                    {getIcon(item.icon)}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count !== null && item.count > 0 && (
                    <span aria-hidden="true" className={`px-2 py-1 text-xs rounded-full ${
                      isActive(item.path)
                        ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={darkMode}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <SunnyIcon className="w-5 h-5" aria-hidden="true" /> : <MoonIcon className="w-5 h-5" aria-hidden="true" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Google Sync */}
            {isAuthenticated ? (
              <button
                onClick={signOutFromGoogle}
                aria-label="Sign out from Google"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <SignOutIcon className="w-5 h-5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={signInToGoogle}
                aria-label="Connect Google Sheets for sync"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <GoogleIcon className="w-5 h-5" aria-hidden="true" />
                <span>Connect Google</span>
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;