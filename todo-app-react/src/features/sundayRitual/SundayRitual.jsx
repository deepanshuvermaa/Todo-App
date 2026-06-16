import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

// ── Helpers ──────────────────────────────────────────────────────────
const toSundayDate = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
};

const addWeeks = (dateStr, n) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n * 7);
  return d.toISOString().split('T')[0];
};

const formatDisplay = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const TODAY_SUNDAY = toSundayDate();

const makeId = () => Math.random().toString(36).slice(2, 9);

const emptySession = () => ({
  monthlyGoal: '',
  magicHabits: '',
  completedAt: null,
  wins: ['', '', ''],
  lessons: ['', '', ''],
  stars: ['', '', ''],
  work: '',
  personal: '',
  wealth: '',
  relationships: '',
  monday: [{ id: makeId(), text: '', done: false }],
  tuesday: [{ id: makeId(), text: '', done: false }],
  wednesday: [{ id: makeId(), text: '', done: false }],
  thursday: [{ id: makeId(), text: '', done: false }],
  fyf: '',
  updatedAt: new Date().toISOString(),
});

const buildStreakData = (rituals) => {
  const now = new Date();
  const history = [];
  for (let i = 25; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() - i * 7);
    const key = d.toISOString().split('T')[0];
    if (key > TODAY_SUNDAY) continue;
    history.push({ date: key, completed: !!(rituals[key]?.completedAt) });
  }

  let streak = 0;
  let missed = 0;
  // Count streak from most-recent backwards (skip current if not yet done)
  const past = history.filter(h => h.date < TODAY_SUNDAY);
  for (let i = past.length - 1; i >= 0; i--) {
    if (past[i].completed) { streak++; } else { break; }
  }
  missed = past.filter(h => !h.completed).length;
  const total = past.filter(h => h.completed).length;
  const rate = past.length > 0 ? Math.round((total / past.length) * 100) : 0;
  return { streak, missed, total, rate, history };
};

// ── Section label ─────────────────────────────────────────────────────
const SectionLabel = ({ emoji, label, hint }) => (
  <div className="flex items-center gap-3 mt-2">
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2.5 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {emoji} {label}
    </span>
    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    <span className="text-xs text-gray-400 dark:text-gray-600">{hint}</span>
  </div>
);

// ── Fill pips ─────────────────────────────────────────────────────────
const FillPips = ({ filled, total, color = 'bg-blue-500' }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i < filled ? color : 'bg-gray-200 dark:bg-gray-700'}`} />
    ))}
    <span className="text-[10px] text-gray-400 dark:text-gray-600 ml-1">{filled}/{total}</span>
  </div>
);

// ── Tile card ─────────────────────────────────────────────────────────
const Tile = ({ onClick, children, className = '' }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm cursor-pointer p-4 group ${className}`}
  >
    {children}
  </motion.div>
);

// ── Modal ─────────────────────────────────────────────────────────────
const Modal = ({ open, title, icon, onClose, onSave, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Bullet list editor (wins / lessons / stars) ───────────────────────
const BulletEditor = ({ items, onChange, placeholder, bulletColor }) => {
  const add = () => onChange([...items, '']);
  const update = (i, val) => { const a = [...items]; a[i] = val; onChange(a); };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={`text-xs font-bold flex-shrink-0 ${bulletColor}`}>◆</span>
          <input
            autoFocus={i === items.length - 1 && item === ''}
            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={placeholder}
            value={item}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); add(); }
              if (e.key === 'Backspace' && item === '' && items.length > 1) { e.preventDefault(); remove(i); }
            }}
          />
          {items.length > 1 && (
            <button onClick={() => remove(i)} className="flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add another
      </button>
    </div>
  );
};

// ── Task list editor (monday – thursday) ─────────────────────────────
const TaskEditor = ({ tasks, onChange }) => {
  const add = () => onChange([...tasks, { id: makeId(), text: '', done: false }]);
  const update = (id, patch) => onChange(tasks.map(t => t.id === id ? { ...t, ...patch } : t));
  const remove = (id) => { if (tasks.length > 1) onChange(tasks.filter(t => t.id !== id)); };

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => (
        <div key={task.id} className="flex items-center gap-2">
          <button
            onClick={() => update(task.id, { done: !task.done })}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              task.done
                ? 'bg-blue-600 border-blue-600'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            {task.done && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <input
            autoFocus={i === tasks.length - 1 && task.text === ''}
            className={`flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              task.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
            }`}
            placeholder={`Task ${i + 1}...`}
            value={task.text}
            onChange={(e) => update(task.id, { text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); add(); }
              if (e.key === 'Backspace' && task.text === '' && tasks.length > 1) {
                e.preventDefault(); remove(task.id);
              }
            }}
          />
          <button
            onClick={() => remove(task.id)}
            className="flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add task
      </button>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────
const SundayRitual = () => {
  const { sundayRituals, saveSundayRitual } = useAppStore();
  const [currentSunday, setCurrentSunday] = useState(TODAY_SUNDAY);
  const [modal, setModal] = useState(null); // { type, draft }
  const [savingMeta, setSavingMeta] = useState(false);

  const session = useMemo(
    () => ({ ...emptySession(), ...(sundayRituals[currentSunday] || {}) }),
    [sundayRituals, currentSunday]
  );

  const { streak, missed, total, rate, history } = useMemo(
    () => buildStreakData(sundayRituals),
    [sundayRituals]
  );

  const isCurrentWeek = currentSunday === TODAY_SUNDAY;
  const isFuture = currentSunday > TODAY_SUNDAY;

  // ── Save a field patch to the store ──
  const save = useCallback(async (patch) => {
    await saveSundayRitual(currentSunday, { ...session, ...patch, updatedAt: new Date().toISOString() });
  }, [saveSundayRitual, currentSunday, session]);

  // ── Mark complete ──
  const markComplete = async () => {
    await save({ completedAt: session.completedAt ? null : new Date().toISOString() });
  };

  // ── Metadata inline save ──
  const handleMetaBlur = (field, value) => save({ [field]: value });

  // ── Modal helpers ──
  const openModal = (type) => {
    const draftMap = {
      wins: session.wins,
      lessons: session.lessons,
      stars: session.stars,
      work: session.work,
      personal: session.personal,
      wealth: session.wealth,
      relationships: session.relationships,
      monday: session.monday,
      tuesday: session.tuesday,
      wednesday: session.wednesday,
      thursday: session.thursday,
      fyf: session.fyf,
    };
    setModal({ type, draft: draftMap[type] });
  };

  const closeModal = () => setModal(null);

  const saveModal = async () => {
    if (!modal) return;
    await save({ [modal.type]: modal.draft });
    closeModal();
  };

  const updateDraft = (val) => setModal(m => ({ ...m, draft: val }));

  // ── Tile summary helpers ──
  const bulletsFilled = (arr) => arr.filter(s => s.trim()).length;
  const tasksDone = (arr) => arr.filter(t => t.done).length;
  const hasText = (s) => s && s.trim().length > 0;

  // ── Modal content by type ──
  const modalConfig = {
    wins:          { icon: '💎', title: 'Diamond / Wins', hint: 'Your biggest wins this past week. Press Enter to add a new line.' },
    lessons:       { icon: '🪨', title: 'Rocks / Lessons', hint: 'What did you learn? What went wrong? Be honest.' },
    stars:         { icon: '⭐', title: 'Stars / Excited for...', hint: 'What are you genuinely looking forward to this week?' },
    work:          { icon: '💼', title: 'Work Focus', hint: 'Your professional goals and priorities for the week.' },
    personal:      { icon: '🧘', title: 'Personal Focus', hint: 'Self-care, hobbies, and personal development.' },
    wealth:        { icon: '💰', title: 'Wealth Focus', hint: 'Financial goals, investments, or budget intentions.' },
    relationships: { icon: '❤️', title: 'Relationships Focus', hint: 'Intentional time for people who matter.' },
    monday:        { icon: '📅', title: 'Monday — Tasks', hint: 'All your tasks for Monday. Check them off as you go.' },
    tuesday:       { icon: '📅', title: 'Tuesday — Tasks', hint: 'All your tasks for Tuesday.' },
    wednesday:     { icon: '📅', title: 'Wednesday — Tasks', hint: 'All your tasks for Wednesday.' },
    thursday:      { icon: '📅', title: 'Thursday — Tasks', hint: 'All your tasks for Thursday.' },
    fyf:           { icon: '🎯', title: 'FYF Targets', hint: 'What must you hit by end of week? Make them measurable.' },
  };

  const isBulletType = (t) => ['wins', 'lessons', 'stars'].includes(t);
  const isTaskType = (t) => ['monday', 'tuesday', 'wednesday', 'thursday'].includes(t);
  const isTextType = (t) => ['work', 'personal', 'wealth', 'relationships', 'fyf'].includes(t);

  const bulletColors = { wins: 'text-yellow-500', lessons: 'text-blue-500', stars: 'text-green-500' };

  const weekNav = (dir) => {
    const next = addWeeks(currentSunday, dir);
    if (next > TODAY_SUNDAY) return;
    setCurrentSunday(next);
  };

  // ── Day tile mini display ──
  const DayTile = ({ day, label }) => {
    const tasks = session[day];
    const done = tasksDone(tasks);
    const total = tasks.filter(t => t.text.trim()).length;
    return (
      <Tile onClick={() => !isFuture && openModal(day)}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
            {isFuture ? 'locked' : 'edit'}
          </span>
        </div>
        <div className="space-y-2">
          {tasks.slice(0, 4).map((t, i) => (
            <div key={t.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                t.done ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {t.done && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-xs truncate ${
                t.done ? 'line-through text-gray-400 dark:text-gray-500' :
                t.text ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600 italic'
              }`}>
                {t.text || 'Add a task...'}
              </span>
            </div>
          ))}
          {tasks.length > 4 && (
            <p className="text-xs text-gray-400 dark:text-gray-600">+{tasks.length - 4} more</p>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-600 mb-1">
            <span>Progress</span><span>{done}/{total || '–'}</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </Tile>
    );
  };

  return (
    <div className="sunday-ritual space-y-5 pb-6">

      {/* ── Hero header — matches Dashboard style exactly ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white p-5 glass-card"
        style={{ backgroundColor: 'rgb(48, 61, 89)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold">Sunday Ritual ☀️</h1>
            </div>
            <p className="text-sm text-white/70">Your weekly system for staying ahead. Fill this out every Sunday morning.</p>
          </div>

          {/* Streak + week nav */}
          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center border border-white/20">
              <div className="text-lg font-bold text-orange-300">🔥 {streak}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">streak</div>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center border border-white/20">
              <div className="text-lg font-bold text-green-300">{total}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">completed</div>
            </div>
            {missed > 0 && (
              <div className="bg-white/10 rounded-lg px-3 py-2 text-center border border-white/20">
                <div className="text-lg font-bold text-red-300">⚠️ {missed}</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wider">missed</div>
              </div>
            )}

            {/* Week navigator */}
            <div className="bg-white/10 border border-white/20 rounded-lg flex items-center">
              <button
                onClick={() => weekNav(-1)}
                className="px-3 py-2 hover:bg-white/10 rounded-l-lg text-white/70 hover:text-white transition-colors"
              >
                ‹
              </button>
              <span className="px-3 py-2 text-sm font-semibold min-w-[110px] text-center">
                {formatDisplay(currentSunday)}
              </span>
              <button
                onClick={() => weekNav(1)}
                disabled={isCurrentWeek}
                className={`px-3 py-2 rounded-r-lg transition-colors ${
                  isCurrentWeek
                    ? 'text-white/20 cursor-not-allowed'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Metadata row */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 uppercase tracking-wider whitespace-nowrap">Monthly Goal</span>
            <input
              defaultValue={session.monthlyGoal}
              key={currentSunday + '-mg'}
              onBlur={(e) => handleMetaBlur('monthlyGoal', e.target.value)}
              disabled={isFuture}
              placeholder="What's your big goal this month?"
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:border-white/40 focus:outline-none w-52 disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 uppercase tracking-wider whitespace-nowrap">Magic Habits</span>
            <input
              defaultValue={session.magicHabits}
              key={currentSunday + '-mh'}
              onBlur={(e) => handleMetaBlur('magicHabits', e.target.value)}
              disabled={isFuture}
              placeholder="e.g. Gym · Read · Code"
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:border-white/40 focus:outline-none w-44 disabled:opacity-50"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {session.completedAt ? (
              <span className="flex items-center gap-1.5 bg-green-500/20 text-green-300 border border-green-400/30 rounded-lg px-3 py-1.5 text-xs font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </span>
            ) : (
              isCurrentWeek && (
                <button
                  onClick={markComplete}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  Mark Complete
                </button>
              )
            )}
            {session.completedAt && isCurrentWeek && (
              <button onClick={markComplete} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                Undo
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Row 1: Review ── */}
      <SectionLabel emoji="🔍" label="Review / Preview" hint="Look back · leap forward" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Wins */}
        <Tile onClick={() => !isFuture && openModal('wins')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💎</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Diamond / Wins</span>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
              {isFuture ? 'locked' : 'click to edit'}
            </span>
          </div>
          <ul className="space-y-2 mb-3 min-h-[60px]">
            {session.wins.filter(w => w.trim()).slice(0, 3).map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-yellow-500 mt-0.5 text-xs font-bold flex-shrink-0">◆</span>{w}
              </li>
            ))}
            {!session.wins.some(w => w.trim()) && (
              <li className="text-sm text-gray-400 dark:text-gray-600 italic">Click to add your wins...</li>
            )}
          </ul>
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <FillPips filled={bulletsFilled(session.wins)} total={session.wins.length} color="bg-yellow-400" />
          </div>
        </Tile>

        {/* Lessons */}
        <Tile onClick={() => !isFuture && openModal('lessons')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪨</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Rocks / Lessons</span>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
              {isFuture ? 'locked' : 'click to edit'}
            </span>
          </div>
          <ul className="space-y-2 mb-3 min-h-[60px]">
            {session.lessons.filter(l => l.trim()).slice(0, 3).map((l, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-blue-500 mt-0.5 text-xs flex-shrink-0">●</span>{l}
              </li>
            ))}
            {!session.lessons.some(l => l.trim()) && (
              <li className="text-sm text-gray-400 dark:text-gray-600 italic">Click to add lessons learned...</li>
            )}
          </ul>
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <FillPips filled={bulletsFilled(session.lessons)} total={session.lessons.length} color="bg-blue-500" />
          </div>
        </Tile>

        {/* Stars */}
        <Tile onClick={() => !isFuture && openModal('stars')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Stars / Excited for...</span>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
              {isFuture ? 'locked' : 'click to edit'}
            </span>
          </div>
          <ul className="space-y-2 mb-3 min-h-[60px]">
            {session.stars.filter(s => s.trim()).slice(0, 3).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mt-0.5 text-xs flex-shrink-0">★</span>{s}
              </li>
            ))}
            {!session.stars.some(s => s.trim()) && (
              <li className="text-sm text-gray-400 dark:text-gray-600 italic">Click to add what excites you...</li>
            )}
          </ul>
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <FillPips filled={bulletsFilled(session.stars)} total={session.stars.length} color="bg-green-500" />
          </div>
        </Tile>
      </div>

      {/* ── Row 2: Focus ── */}
      <SectionLabel emoji="🎯" label="Win the Week — Focus" hint="Balance across all life areas" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        {[
          { key: 'work',          icon: '💼', label: 'Work',          empty: 'Click to set your work focus...' },
          { key: 'personal',      icon: '🧘', label: 'Personal',      empty: 'Click to set your personal focus...' },
          { key: 'wealth',        icon: '💰', label: 'Wealth',        empty: 'Click to set your wealth focus...' },
          { key: 'relationships', icon: '❤️', label: 'Relationships', empty: 'Click to set relationship goals...' },
        ].map(({ key, icon, label, empty }) => (
          <Tile key={key} onClick={() => !isFuture && openModal(key)} className="min-h-[120px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</span>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
                {isFuture ? 'locked' : 'edit'}
              </span>
            </div>
            {hasText(session[key]) ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">{session[key]}</p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-600 italic">{empty}</p>
            )}
          </Tile>
        ))}
      </div>

      {/* ── Row 3: Execution ── */}
      <SectionLabel emoji="⚡" label="Daily Execution" hint="No limit — add as many tasks as you need" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <DayTile day="monday"    label="Monday"    />
        <DayTile day="tuesday"   label="Tuesday"   />
        <DayTile day="wednesday" label="Wednesday" />
        <DayTile day="thursday"  label="Thursday"  />

        {/* FYF Targets */}
        <Tile onClick={() => !isFuture && openModal('fyf')} className="border-blue-200 dark:border-blue-900/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">FYF Targets</span>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
              {isFuture ? 'locked' : 'edit'}
            </span>
          </div>
          {hasText(session.fyf) ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-5">{session.fyf}</p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-600 italic">
              Set measurable end-of-week targets here...
            </p>
          )}
        </Tile>
      </div>

      {/* ── Streak history ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🔥</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Sunday Ritual History</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />Done
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" />Missed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-600" />Upcoming
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-3 items-end">
          {history.map((h) => {
            const isSelected = h.date === currentSunday;
            const isToday = h.date === TODAY_SUNDAY;
            const isFut = h.date > TODAY_SUNDAY;
            return (
              <button
                key={h.date}
                onClick={() => setCurrentSunday(h.date)}
                className="flex flex-col items-center gap-1 focus:outline-none"
                title={`${formatDisplay(h.date)}${h.completed ? ' — Completed' : isFut ? '' : ' — Missed'}`}
              >
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full transition-all ${
                    isFut
                      ? 'bg-gray-200 dark:bg-gray-600 opacity-40'
                      : h.completed
                        ? 'bg-green-500'
                        : 'bg-red-400'
                  } ${isSelected ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-blue-500 scale-125' : ''}`}
                />
                <span className={`text-[9px] ${isSelected ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-600'}`}>
                  {new Date(h.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: streak,    label: 'Current streak', color: 'text-orange-500' },
            { val: total,     label: 'Total completed', color: 'text-green-500' },
            { val: missed,    label: 'Missed',          color: 'text-red-400' },
            { val: `${rate}%`, label: 'Completion rate', color: 'text-blue-600 dark:text-blue-400' },
          ].map(({ val, label, color }) => (
            <div key={label} className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
              <p className={`text-2xl font-bold ${color}`}>{val}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <Modal
          open={!!modal}
          icon={modalConfig[modal.type]?.icon}
          title={modalConfig[modal.type]?.title}
          onClose={closeModal}
          onSave={saveModal}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{modalConfig[modal.type]?.hint}</p>

          {isBulletType(modal.type) && (
            <BulletEditor
              items={modal.draft}
              onChange={updateDraft}
              placeholder={
                modal.type === 'wins' ? 'Add a win...' :
                modal.type === 'lessons' ? 'Add a lesson...' :
                'Add something exciting...'
              }
              bulletColor={bulletColors[modal.type]}
            />
          )}

          {isTaskType(modal.type) && (
            <TaskEditor tasks={modal.draft} onChange={updateDraft} />
          )}

          {isTextType(modal.type) && (
            <textarea
              autoFocus
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-36"
              placeholder={
                modal.type === 'work' ? 'e.g. Ship Sunday Ritual feature, prep client pitch...' :
                modal.type === 'personal' ? 'e.g. Gym every day, read 30 min, sleep by 11pm...' :
                modal.type === 'wealth' ? 'e.g. Review monthly budget, add to SIP...' :
                modal.type === 'relationships' ? 'e.g. Call parents Sunday, coffee with Arjun...' :
                'e.g. Ship feature to prod, close 1 deal, read 100 pages...'
              }
              value={modal.draft}
              onChange={(e) => updateDraft(e.target.value)}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default SundayRitual;
