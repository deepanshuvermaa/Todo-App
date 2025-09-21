import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAppStore from '@/store/useAppStore';
import Sidebar from './components/Sidebar';
import TaskManager from '@/features/tasks/TaskManager';
import ExpenseManager from '@/features/expenses/ExpenseManager';
import NotesManager from '@/features/notes/NotesManager';
import HabitTracker from '@/features/habits/HabitTracker';
import MealTracker from '@/features/meals/MealTracker';
import AlarmManager from '@/features/alarms/AlarmManager';
import SimpleMovieRecommendations from '@/features/movies/SimpleMovieRecommendations';
import CallReminders from '@/features/reminders/CallReminders';
import DailyJournal from '@/features/journal/DailyJournal';
import BucketList from '@/features/bucket/BucketList';
import Dashboard from '@/features/dashboard/Dashboard';
import Settings from '@/features/settings/Settings';
import VoiceCommands from '@/features/voice/VoiceCommands';
import TextExtraction from '@/features/ocr/TextExtraction';
import LinkManager from '@/features/links/LinkManager';
import History from '@/features/history/History';
import About from '@/features/about/About';
import GlobalVoiceButton from './components/GlobalVoiceButton';
import MigrationPrompt from './components/MigrationPrompt';
import LoadingScreen from './components/LoadingScreen';
import './index.css';

function App() {
  const {
    initialize,
    isLoading,
    darkMode
  } = useAppStore();

  const [showMigration, setShowMigration] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show sidebar by default on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Initialize app on mount
    initialize();

    // Check if migration is needed
    checkMigration();
  }, []);

  // Apply dark mode on initial load and when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const checkMigration = async () => {
    // Check if old app data exists
    if (typeof localStorage !== 'undefined') {
      const hasOldData = localStorage.getItem('tasks') !== null;
      const hasMigrated = localStorage.getItem('todo_migrationCompleted') !== null;

      if (hasOldData && !hasMigrated) {
        setShowMigration(true);
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (showMigration) {
    return <MigrationPrompt onComplete={() => setShowMigration(false)} />;
  }

  return (
    <Router>
      <div className="app min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex h-screen relative">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
            {/* Mobile Header */}
            <header className="md:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  LIFE
                </h1>
                <GlobalVoiceButton />
              </div>
            </header>

            {/* Desktop Header with Global Voice Button */}
            <header className="hidden md:block bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div></div> {/* Spacer */}
                <GlobalVoiceButton />
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="p-4 md:p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tasks" element={<TaskManager />} />
                  <Route path="/expenses" element={<ExpenseManager />} />
                  <Route path="/notes" element={<NotesManager />} />
                  <Route path="/habits" element={<HabitTracker />} />
                  <Route path="/meals" element={<MealTracker />} />
                  <Route path="/alarms" element={<AlarmManager />} />
                  <Route path="/movies" element={<SimpleMovieRecommendations />} />
                  <Route path="/journal" element={<DailyJournal />} />
                  <Route path="/reminders" element={<CallReminders />} />
                  <Route path="/bucket" element={<BucketList />} />
                  <Route path="/voice" element={<VoiceCommands />} />
                  <Route path="/ocr" element={<TextExtraction />} />
                  <Route path="/links" element={<LinkManager />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}


export default App;
