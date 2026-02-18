import React, { useState, useMemo } from 'react';
import useAppStore from '@/store/useAppStore';
import JournalEntry from './JournalEntry';
import JournalCalendar from './JournalCalendar';
import JournalStats from './JournalStats';
import ConfirmDialog from '@/components/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const DailyJournal = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('write'); // write, calendar, insights
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [confirmState, setConfirmState] = useState(null);

  // Get entry for selected date
  const currentEntry = useMemo(() => {
    return journalEntries.find(entry => entry.date === selectedDate) || null;
  }, [journalEntries, selectedDate]);

  // Filter entries for search and mood
  const filteredEntries = useMemo(() => {
    let entries = [...journalEntries];

    if (searchTerm) {
      entries = entries.filter(entry => 
        entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.gratitude?.some(item => item.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterMood !== 'all') {
      entries = entries.filter(entry => entry.mood === filterMood);
    }

    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [journalEntries, searchTerm, filterMood]);

  // Calculate streak function (moved before stats)
  const calculateStreak = (entries) => {
    if (entries.length === 0) return 0;

    const sortedEntries = entries
      .map(e => e.date)
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 1;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if there's an entry for today or yesterday
    const latestEntry = new Date(sortedEntries[0]);
    const daysDiff = Math.floor((today - latestEntry) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) return 0; // Streak broken

    // Count consecutive days
    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = new Date(sortedEntries[i - 1]);
      const prevDate = new Date(sortedEntries[i]);
      const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalEntries = journalEntries.length;
    const currentStreak = calculateStreak(journalEntries);
    const moodCounts = {};
    let totalWords = 0;
    let gratitudeItems = 0;

    journalEntries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
      if (entry.content) {
        totalWords += entry.content.split(' ').length;
      }
      if (entry.gratitude) {
        gratitudeItems += entry.gratitude.length;
      }
    });

    const avgWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

    // Find most common mood
    let dominantMood = 'neutral';
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    });

    return {
      totalEntries,
      currentStreak,
      avgWords,
      dominantMood,
      moodCounts,
      gratitudeItems
    };
  }, [journalEntries]);

  const handleSaveEntry = async (entryData) => {
    if (currentEntry) {
      await updateJournalEntry(currentEntry.id, entryData);
    } else {
      await addJournalEntry({
        ...entryData,
        date: selectedDate
      });
    }
  };

  const handleDeleteEntry = () => {
    if (!currentEntry) return;
    setConfirmState({
      message: 'Delete this journal entry?',
      detail: 'This journal entry will be permanently deleted and cannot be recovered.',
      confirmLabel: 'Delete Entry',
      danger: true,
      onConfirm: () => deleteJournalEntry(currentEntry.id),
    });
  };

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="daily-journal">
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
      {/* Header */}
      <div className="mb-6">
        {/* Centered Title */}
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4">Daily Journal</h2>

        {/* Controls Row */}
        <div className="flex justify-center mb-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('write')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${viewMode === 'write' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Write
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('insights')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${viewMode === 'insights' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Insights
            </button>
          </div>
        </div>

        {/* Search Bar (for calendar/insights view) */}
        {viewMode !== 'write' && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
        )}

        {/* Date Navigation (for write view) */}
        {viewMode === 'write' && (
          <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">{formatDate(selectedDate)}</h3>
              <p className="text-sm text-gray-500">{selectedDate}</p>
            </div>

            <button
              onClick={() => handleDateChange(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              disabled={selectedDate >= new Date().toISOString().split('T')[0]}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <JournalStats stats={stats} />
      </div>

      {/* Main Content */}
      {viewMode === 'write' && (
        <JournalEntry
          entry={currentEntry}
          date={selectedDate}
          onSave={handleSaveEntry}
          onDelete={currentEntry ? handleDeleteEntry : null}
        />
      )}

      {viewMode === 'calendar' && (
        <JournalCalendar
          entries={filteredEntries}
          onDateSelect={(date) => {
            setSelectedDate(date);
            setViewMode('write');
          }}
        />
      )}

      {viewMode === 'insights' && (
        <div className="space-y-6">
          {/* Mood Filter */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilterMood('all')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filterMood === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              All Moods
            </button>
            {['amazing', 'good', 'okay', 'bad', 'terrible'].map(mood => (
              <button
                key={mood}
                onClick={() => setFilterMood(mood)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  filterMood === mood ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </button>
            ))}
          </div>

          {/* Entries List */}
          <AnimatePresence>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {formatDate(entry.date)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.mood && (
                          <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                        )}
                        {entry.weather && (
                          <span className="text-sm text-gray-500">{entry.weather}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDate(entry.date);
                        setViewMode('write');
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </div>

                  {entry.content && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                      {entry.content}
                    </p>
                  )}

                  {entry.gratitude && entry.gratitude.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Grateful for:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        {entry.gratitude.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">No entries found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const getMoodEmoji = (mood) => {
  const moods = {
    amazing: '😄',
    good: '😊',
    okay: '😐',
    bad: '😟',
    terrible: '😢'
  };
  return moods[mood] || '😐';
};

export default DailyJournal;