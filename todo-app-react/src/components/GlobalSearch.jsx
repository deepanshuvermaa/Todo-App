import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

/**
 * GlobalSearch — Ctrl+K / Cmd+K opens an omnibar that searches across
 * tasks, notes, expenses, habits, journal entries, and bucket list items.
 */
const GlobalSearch = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const { tasks, notes, expenses, habits, journalEntries, bucketList, setCurrentView } = useAppStore();

  // Safe string content extractor for Notion notes
  const extractNoteText = (content) => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    try {
      const blocks = Array.isArray(content) ? content : JSON.parse(content);
      return Array.isArray(blocks) ? blocks.map(b => b.content || '').join(' ') : '';
    } catch { return ''; }
  };

  const search = useCallback((q) => {
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    const found = [];

    // Tasks
    tasks.forEach(t => {
      if ((t.text || '').toLowerCase().includes(lower)) {
        found.push({ type: 'task', icon: '✓', label: t.text, sub: `${t.date}${t.isOverdue ? ' • Overdue' : ''}${t.recurrence ? ' • Recurring' : ''}`, view: 'tasks', item: t });
      }
    });

    // Notes
    notes.forEach(n => {
      if ((n.title || '').toLowerCase().includes(lower) || extractNoteText(n.content).toLowerCase().includes(lower)) {
        found.push({ type: 'note', icon: '📝', label: n.title || 'Untitled Note', sub: n.folder || 'Notes', view: 'notes', item: n });
      }
    });

    // Expenses
    expenses.forEach(e => {
      if ((e.description || '').toLowerCase().includes(lower)) {
        found.push({ type: 'expense', icon: '💰', label: e.description, sub: `${e.category} • ₹${e.amount}`, view: 'expenses', item: e });
      }
    });

    // Habits
    habits.forEach(h => {
      if ((h.name || '').toLowerCase().includes(lower)) {
        found.push({ type: 'habit', icon: '🔥', label: h.name, sub: h.description || 'Habit', view: 'habits', item: h });
      }
    });

    // Journal
    journalEntries.forEach(j => {
      if ((j.entry || '').toLowerCase().includes(lower) || (j.gratitude || '').toLowerCase().includes(lower)) {
        found.push({ type: 'journal', icon: '📖', label: `Journal — ${j.date}`, sub: (j.entry || '').slice(0, 60), view: 'journal', item: j });
      }
    });

    // Bucket List
    bucketList.forEach(b => {
      if ((b.title || '').toLowerCase().includes(lower)) {
        found.push({ type: 'bucket', icon: '🪣', label: b.title, sub: `${b.category || ''} • ${b.status}`, view: 'bucket', item: b });
      }
    });

    setResults(found.slice(0, 20)); // cap at 20 results
    setSelectedIndex(0);
  }, [tasks, notes, expenses, habits, journalEntries, bucketList]);

  useEffect(() => { search(query); }, [query, search]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (result) => {
    if (onNavigate) onNavigate(result.view);
    else setCurrentView(result.view);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, notes, expenses, habits..."
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white text-lg placeholder-gray-400"
              aria-label="Global search"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono border border-gray-200 dark:border-gray-600 rounded text-gray-400">ESC</kbd>
          </div>

          {/* Results */}
          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, idx) => (
                <button
                  key={`${result.type}-${result.item.id}`}
                  onClick={() => handleSelect(result)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    idx === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">{result.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.sub}</div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 capitalize">{result.type}</span>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-2">🔍</div>
              <div>No results for "{query}"</div>
            </div>
          ) : (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400 mb-2 uppercase font-medium tracking-wide">Quick actions</p>
              <div className="flex flex-wrap gap-2">
                {['tasks', 'notes', 'expenses', 'habits', 'journal'].map(view => (
                  <button
                    key={view}
                    onClick={() => { if (onNavigate) onNavigate(view); else setCurrentView(view); onClose(); }}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg capitalize transition-colors"
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex gap-4 text-xs text-gray-400">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">ESC</kbd> close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalSearch;
