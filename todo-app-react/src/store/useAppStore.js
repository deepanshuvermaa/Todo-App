/**
 * Main App Store - Zustand state management
 * Mirrors the original TodoApp class functionality
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import StorageAdapter from '@/core/storage/StorageAdapter';
import { supabaseService } from '@/services/SupabaseService';

const storage = new StorageAdapter();

const useAppStore = create(
  devtools(
    subscribeWithSelector(
        (set, get) => {
          // Helper: merge two arrays by 'id', keeping items from both sides
          // For items with the same id, prefer the one with the newer timestamp
          const mergeById = (localArr, cloudArr) => {
            if (!cloudArr || cloudArr.length === 0) return localArr || [];
            if (!localArr || localArr.length === 0) return cloudArr;
            const map = new Map();
            localArr.forEach(item => { if (item && item.id) map.set(item.id, item); });
            cloudArr.forEach(item => {
              if (!item || !item.id) return;
              const existing = map.get(item.id);
              if (!existing) {
                map.set(item.id, item);
              } else {
                // Prefer newer timestamp
                const cloudTime = item.updatedAt || item.createdAt || '';
                const localTime = existing.updatedAt || existing.createdAt || '';
                if (cloudTime >= localTime) {
                  map.set(item.id, item);
                }
              }
            });
            return Array.from(map.values());
          };

          return ({
          // Core State
          tasks: [],
          expenses: [],
          notes: [],
          habits: [],
          habitHistory: {},
          meals: [],
          callReminders: [],
          completedCallReminders: [],
          bucketList: [],
          visionBoard: [], // Pinterest-style vision board images
          journalEntries: [],
          quotes: [],
          streakData: {},
          alarms: [],
          movies: [],
          links: [],
          // Trash bin — soft deleted items
          trash: [],

          // Budget (needs explicit load in initialize)
          budget: null,
          budgetAlerts: [],

          // Engagement and Location
          engagementStats: {},
          locationReminders: [],

          // Onboarding and Rollover
          onboardingCompleted: false,
          lastRolloverDate: null,

          // UI State
          currentDate: new Date().toISOString(), // stored as ISO string to survive Zustand persist serialization
          currentView: 'dashboard',
          darkMode: false,
          isLoading: false,
          syncStatus: 'idle', // idle, syncing, success, failed, offline

          // Auth & Sync State
          isAuthenticated: false,
          userEmail: null,
          userId: null,
          syncStatus: 'idle', // idle, syncing, success, failed, offline
          lastSyncTime: null,
          // Race guard: prevents concurrent syncs
          _syncInProgress: false,
          _realtimeSubscribed: false,
          _syncDebounce: null,

          // Actions - Core Functions
          initialize: async () => {
            // Guard against double-initialization (React StrictMode calls twice in dev)
            if (get().isLoading) return;
            set({ isLoading: true });

            try {
              // Load all data from storage in parallel
              const [
                tasks, expenses, notes, habits, habitHistory, meals,
                callReminders, completedCallReminders, bucketList, visionBoard,
                journalEntries, quotes, streakData, alarms, movies, links,
                darkMode, userEmail, sheetId, sheetUrl, budget, trash,
                engagementStats, locationReminders, onboardingCompleted, lastRolloverDate
              ] = await Promise.all([
                storage.get('tasks'),
                storage.get('expenses'),
                storage.get('notes'),
                storage.get('habits'),
                storage.get('habitHistory'),
                storage.get('meals'),
                storage.get('callReminders'),
                storage.get('completedCallReminders'),
                storage.get('bucketList'),
                storage.get('visionBoard'),
                storage.get('journalEntries'),
                storage.get('quotes'),
                storage.get('streakData'),
                storage.get('alarms'),
                storage.get('movies'),
                storage.get('links'),
                storage.get('darkMode'),
                storage.get('userEmail'),
                storage.get('userSheetId'),
                storage.get('userSheetUrl'),
                storage.get('expenseBudget'),   // H6: budget must be loaded here
                storage.get('trash'),
                storage.get('engagementStats'),
                storage.get('locationReminders'),
                storage.get('onboardingCompleted'),
                storage.get('lastRolloverDate'),
              ]);

              // H1: dark mode — unify: stored as boolean in storage, toggle also stores boolean
              // If legacy string value found, convert it
              const darkModeValue = typeof darkMode === 'boolean'
                ? darkMode
                : darkMode === 'enabled';

              set({
                tasks: tasks || [],
                expenses: expenses || [],
                notes: notes || [],
                habits: habits || [],
                habitHistory: habitHistory || {},
                meals: meals || [],
                callReminders: callReminders || [],
                completedCallReminders: completedCallReminders || [],
                bucketList: bucketList || [],
                visionBoard: visionBoard || [],
                journalEntries: journalEntries || [],
                quotes: quotes || [],
                streakData: streakData || {},
                alarms: alarms || [],
                movies: movies || [],
                links: links || [],
                trash: trash || [],
                budget: budget || null,
                budgetAlerts: [],
                engagementStats: engagementStats || {},
                locationReminders: locationReminders || [],
                onboardingCompleted: onboardingCompleted || false,
                lastRolloverDate: lastRolloverDate || null,
                darkMode: darkModeValue,
                currentDate: new Date().toISOString(),
                userEmail: userEmail && userEmail !== 'undefined' ? userEmail : null,
                isLoading: false
              });

              // Apply dark mode class to DOM
              if (darkModeValue) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }

              // Restore Supabase session
              const { user, error: sessionError } = await supabaseService.restoreSession();
              if (user && !sessionError) {
                set({
                  isAuthenticated: true,
                  userEmail: user.email,
                  userId: user.id
                });

                // Pull data from cloud
                await get().pullFromCloud();

                // Setup realtime subscriptions
                get().setupRealtimeSync();
              }

              // Setup network handlers (online/offline detection)
              get().setupNetworkHandlers();

              // Flush pending sync when user leaves/hides the page
              const flushPendingSync = () => {
                const currentState = get();
                if (currentState._syncDebounce) {
                  clearTimeout(currentState._syncDebounce);
                  set({ _syncDebounce: null });
                  if (navigator.onLine && currentState.isAuthenticated) {
                    currentState.syncToCloud();
                  }
                }
              };

              document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                  flushPendingSync();
                }
              });

              window.addEventListener('beforeunload', flushPendingSync);

              // Check and perform daily rollover
              get().checkAndPerformRollover();

              // F1: Generate today's recurring task instances
              get().processRecurringTasks();

              // F4: Refresh overdue flags on all tasks
              get().refreshOverdueStatus();

            } catch (error) {
              console.error('Failed to initialize app:', error);
              set({ isLoading: false });
            }
          },

          // Task Management
          addTask: async (taskData) => {
            // Handle both string and object inputs for backward compatibility
            const isString = typeof taskData === 'string';
            const todayStr = new Date().toISOString().split('T')[0];

            const newTask = {
              id: Date.now().toString(),
              text: isString ? taskData : taskData.text,
              date: isString ? todayStr : (taskData.date || todayStr),
              time: isString ? null : taskData.time,
              priority: isString ? 'medium' : (taskData.priority || 'medium'),
              duration: isString ? null : taskData.duration,
              location: isString ? null : taskData.location,
              tags: isString ? [] : (taskData.tags || []),
              category: isString ? null : taskData.category,
              completed: false,
              createdAt: new Date().toISOString(),
              // F1: Recurring task fields
              // recurrence: null | 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'weekends' | { type:'custom', days:[0..6] }
              recurrence: isString ? null : (taskData.recurrence || null),
              recurrenceEnd: isString ? null : (taskData.recurrenceEnd || null), // ISO date string when recurrence stops
              parentTaskId: isString ? null : (taskData.parentTaskId || null),   // links recurrence instances to original
            };

            // F4: Overdue detection — flag if date is in the past and not completed
            if (newTask.date < todayStr && !newTask.completed) {
              newTask.isOverdue = true;
            }

            const tasks = [...get().tasks, newTask];
            set({ tasks });
            await storage.set('tasks', tasks);

            // Queue for sync
            get().queuePendingChange('tasks', newTask);

            return newTask;
          },

          updateTask: async (taskId, updates) => {
            const tasks = get().tasks.map(task =>
              task.id === taskId ? { ...task, ...updates } : task
            );

            set({ tasks });
            await storage.set('tasks', tasks);

            // Queue for sync
            get().queuePendingChange('tasks', { id: taskId, ...updates });
          },

          deleteTask: async (taskId) => {
            const task = get().tasks.find(t => t.id === taskId);
            if (!task) return;

            // Soft delete: move to trash instead of permanent delete
            const tasks = get().tasks.filter(t => t.id !== taskId);
            const trash = [...get().trash, {
              ...task,
              deletedAt: new Date().toISOString(),
              deletedFrom: 'tasks'
            }];
            set({ tasks, trash });
            await storage.set('tasks', tasks);
            await storage.set('trash', trash);
            get().queuePendingChange('tasks', { id: taskId, deleted: true });
          },

          restoreFromTrash: async (itemId) => {
            const item = get().trash.find(i => i.id === itemId);
            if (!item) return;

            const trash = get().trash.filter(i => i.id !== itemId);
            const { deletedAt, deletedFrom, ...restored } = item;

            if (deletedFrom === 'tasks') {
              const tasks = [...get().tasks, restored];
              set({ tasks, trash });
              await storage.set('tasks', tasks);
            } else if (deletedFrom === 'notes') {
              const notes = [...get().notes, restored];
              set({ notes, trash });
              await storage.set('notes', notes);
            } else if (deletedFrom === 'expenses') {
              const expenses = [...get().expenses, restored];
              set({ expenses, trash });
              await storage.set('expenses', expenses);
            }
            await storage.set('trash', trash);
          },

          permanentlyDelete: async (itemId) => {
            const trash = get().trash.filter(i => i.id !== itemId);
            set({ trash });
            await storage.set('trash', trash);
          },

          emptyTrash: async () => {
            set({ trash: [] });
            await storage.set('trash', []);
          },

          toggleTask: async (taskId) => {
            const task = get().tasks.find(t => t.id === taskId);
            if (!task) return;

            const updates = {
              completed: !task.completed,
              completedDate: !task.completed ? new Date().toISOString() : null
            };

            await get().updateTask(taskId, updates);
          },

          // Daily Rollover (matches original app.js)
          checkAndPerformRollover: async () => {
            const today = new Date().toISOString().split('T')[0];
            const lastRollover = await storage.get('lastRolloverDate');

            if (lastRollover !== today) {
              await get().performDailyRollover();
              await storage.set('lastRolloverDate', today);
            }
          },

          performDailyRollover: async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const tasks = get().tasks;
            const yesterdayTasks = tasks.filter(task => task.date === yesterdayStr);
            const incompleteTasks = yesterdayTasks.filter(task => !task.completed);

            if (incompleteTasks.length > 0) {
              // Mark incomplete tasks as "not done"
              const updatedTasks = tasks.map(task => {
                if (task.date === yesterdayStr && !task.completed) {
                  return { ...task, notDone: true };
                }
                return task;
              });

              set({ tasks: updatedTasks });
              await storage.set('tasks', updatedTasks);

              // Sync if connected
              if (get().isAuthenticated && get().sheetId) {
                get().syncToSheets();
              }
            }
          },

          // F1: Generate recurring task instances for today if not already generated
          processRecurringTasks: async () => {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const todayDay = today.getDay(); // 0=Sun, 6=Sat

            const tasks = get().tasks;
            // Find master recurring tasks (those with recurrence and no parentTaskId)
            const recurringMasters = tasks.filter(t =>
              t.recurrence && !t.parentTaskId && !t.completed
            );

            const newInstances = [];

            for (const master of recurringMasters) {
              // Check if recurrence has ended
              if (master.recurrenceEnd && todayStr > master.recurrenceEnd) continue;

              // Check if an instance for today already exists
              const alreadyExists = tasks.some(t =>
                t.parentTaskId === master.id && t.date === todayStr
              );
              if (alreadyExists) continue;

              // Check if this recurrence fires today
              let shouldCreate = false;
              const r = master.recurrence;
              if (r === 'daily') {
                shouldCreate = true;
              } else if (r === 'weekly') {
                // Same weekday as the master task's original date
                const masterDay = new Date(master.date).getDay();
                shouldCreate = todayDay === masterDay;
              } else if (r === 'monthly') {
                // Same day of month as the master
                const masterDayOfMonth = new Date(master.date).getDate();
                shouldCreate = today.getDate() === masterDayOfMonth;
              } else if (r === 'weekdays') {
                shouldCreate = todayDay >= 1 && todayDay <= 5;
              } else if (r === 'weekends') {
                shouldCreate = todayDay === 0 || todayDay === 6;
              } else if (r && typeof r === 'object' && Array.isArray(r.days)) {
                shouldCreate = r.days.includes(todayDay);
              }

              if (shouldCreate) {
                newInstances.push({
                  ...master,
                  id: `${master.id}_${todayStr}`,
                  date: todayStr,
                  completed: false,
                  parentTaskId: master.id,
                  createdAt: new Date().toISOString(),
                  isOverdue: false,
                });
              }
            }

            if (newInstances.length > 0) {
              const updatedTasks = [...tasks, ...newInstances];
              set({ tasks: updatedTasks });
              await storage.set('tasks', updatedTasks);
            }
          },

          // F13: Pre-task reminders — notify 15 minutes before tasks with a set time
          checkPreTaskReminders: () => {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const tasks = get().tasks;

            tasks.forEach(task => {
              if (!task.time || task.completed || task.date !== todayStr) return;
              const [h, m] = task.time.split(':').map(Number);
              const taskTime = new Date();
              taskTime.setHours(h, m, 0, 0);
              const diffMs = taskTime - now;
              const diffMin = Math.floor(diffMs / 60_000);

              if (diffMin >= 14 && diffMin <= 15 && diffMs > 0) {
                const remindedSet = get()._remindedTaskIds || new Set();
                const key = `${task.id}_${todayStr}`;
                if (remindedSet.has(key)) return;

                new Notification(`Coming up in 15 min: ${task.text}`, {
                  body: `Scheduled at ${task.time}${task.location ? ` · ${task.location}` : ''}`,
                  icon: '/todo-app/vite.svg',
                });

                remindedSet.add(key);
                set({ _remindedTaskIds: remindedSet });
              }
            });
          },

          // F4: Compute overdue status for all tasks (call on load and each day change)
          refreshOverdueStatus: async () => {
            const todayStr = new Date().toISOString().split('T')[0];
            const tasks = get().tasks.map(task => ({
              ...task,
              isOverdue: !task.completed && task.date < todayStr
            }));
            set({ tasks });
            await storage.set('tasks', tasks);
          },

          // Expense Management
          addExpense: async (expense) => {
            const newExpense = {
              id: Date.now().toString(),
              ...expense,
              date: expense.date || new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            const expenses = [...get().expenses, newExpense];
            set({ expenses });
            await storage.set('expenses', expenses);
            await get().syncToCloud();

            return newExpense;
          },

          updateExpense: async (id, updates) => {
            const expenses = get().expenses.map(expense =>
              expense.id === id ? { ...expense, ...updates, updatedAt: new Date().toISOString() } : expense
            );
            set({ expenses });
            await storage.set('expenses', expenses);
            await get().syncToCloud();
          },

          deleteExpense: async (id) => {
            const expenses = get().expenses.filter(expense => expense.id !== id);
            set({ expenses });
            await storage.set('expenses', expenses);
            await get().syncToCloud();
          },

          // Budget Management
          budget: null,
          budgetAlerts: [],

          setBudget: async (budgetData) => {
            set({ budget: budgetData });
            await storage.set('expenseBudget', budgetData);
          },

          // Habit Management
          addHabit: async (habit) => {
            const newHabit = {
              id: Date.now().toString(),
              ...habit,
              createdAt: new Date().toISOString()
            };

            const habits = [...get().habits, newHabit];
            set({ habits });
            await storage.set('habits', habits);

            get().queuePendingChange('habits', newHabit);
            return newHabit;
          },

          updateHabit: async (id, updates) => {
            const habits = get().habits.map(habit =>
              habit.id === id ? { ...habit, ...updates } : habit
            );
            set({ habits });
            await storage.set('habits', habits);
            get().queuePendingChange('habits', { id, ...updates });
          },

          deleteHabit: async (id) => {
            const habits = get().habits.filter(habit => habit.id !== id);
            const habitHistory = { ...get().habitHistory };
            delete habitHistory[id];

            set({ habits, habitHistory });
            await storage.set('habits', habits);
            await storage.set('habitHistory', habitHistory);
            get().queuePendingChange('habits', { id, deleted: true });
          },

          toggleHabitDay: async (habitId, date) => {
            const habitHistory = { ...get().habitHistory };
            if (!habitHistory[habitId]) {
              habitHistory[habitId] = {};
            }

            if (habitHistory[habitId][date]) {
              delete habitHistory[habitId][date];
            } else {
              habitHistory[habitId][date] = true;
            }

            set({ habitHistory });
            await storage.set('habitHistory', habitHistory);
            get().queuePendingChange('habitHistory', { habitId, date, value: habitHistory[habitId][date] });
          },

          // Meal Management
          addMeal: async (meal) => {
            const newMeal = {
              id: Date.now().toString(),
              ...meal,
              date: meal.date || new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString()
            };

            const meals = [...get().meals, newMeal];
            set({ meals });
            await storage.set('meals', meals);

            get().queuePendingChange('meals', newMeal);
            return newMeal;
          },

          updateMeal: async (id, updates) => {
            const meals = get().meals.map(meal =>
              meal.id === id ? { ...meal, ...updates } : meal
            );
            set({ meals });
            await storage.set('meals', meals);
            get().queuePendingChange('meals', { id, ...updates });
          },

          deleteMeal: async (id) => {
            const meals = get().meals.filter(meal => meal.id !== id);
            set({ meals });
            await storage.set('meals', meals);
            get().queuePendingChange('meals', { id, deleted: true });
          },

          // Call Reminders Management
          addCallReminder: async (reminder) => {
            const newReminder = {
              id: Date.now().toString(),
              ...reminder,
              createdAt: new Date().toISOString()
            };

            const callReminders = [...get().callReminders, newReminder];
            set({ callReminders });
            await storage.set('callReminders', callReminders);

            get().queuePendingChange('callReminders', newReminder);
            return newReminder;
          },

          updateCallReminder: async (id, updates) => {
            const callReminders = get().callReminders.map(reminder =>
              reminder.id === id ? { ...reminder, ...updates } : reminder
            );
            set({ callReminders });
            await storage.set('callReminders', callReminders);
            get().queuePendingChange('callReminders', { id, ...updates });
          },

          deleteCallReminder: async (id) => {
            const callReminders = get().callReminders.filter(reminder => reminder.id !== id);
            set({ callReminders });
            await storage.set('callReminders', callReminders);
            get().queuePendingChange('callReminders', { id, deleted: true });
          },

          completeCallReminder: async (id) => {
            const reminder = get().callReminders.find(r => r.id === id);
            if (!reminder) return;

            const completedReminder = {
              ...reminder,
              completedDate: new Date().toISOString()
            };

            const callReminders = get().callReminders.filter(r => r.id !== id);
            const completedCallReminders = [...get().completedCallReminders, completedReminder];

            set({ callReminders, completedCallReminders });
            await storage.set('callReminders', callReminders);
            await storage.set('completedCallReminders', completedCallReminders);

            get().queuePendingChange('completedCallReminders', completedReminder);
          },

          // Journal Management
          addJournalEntry: async (entry) => {
            const newEntry = {
              id: Date.now().toString(),
              ...entry,
              createdAt: new Date().toISOString()
            };

            const journalEntries = [...get().journalEntries, newEntry];
            set({ journalEntries });
            await storage.set('journalEntries', journalEntries);

            get().queuePendingChange('journalEntries', newEntry);
            return newEntry;
          },

          updateJournalEntry: async (id, updates) => {
            const journalEntries = get().journalEntries.map(entry =>
              entry.id === id ? { ...entry, ...updates } : entry
            );
            set({ journalEntries });
            await storage.set('journalEntries', journalEntries);
            get().queuePendingChange('journalEntries', { id, ...updates });
          },

          deleteJournalEntry: async (id) => {
            const journalEntries = get().journalEntries.filter(entry => entry.id !== id);
            set({ journalEntries });
            await storage.set('journalEntries', journalEntries);
            get().queuePendingChange('journalEntries', { id, deleted: true });
          },

          // Bucket List Management
          addBucketItem: async (item) => {
            const newItem = {
              id: Date.now().toString(),
              ...item,
              createdAt: new Date().toISOString(),
              status: item.status || 'not-started',
              progress: item.progress || 0
            };

            const bucketList = [...get().bucketList, newItem];
            set({ bucketList });
            await storage.set('bucketList', bucketList);

            get().queuePendingChange('bucketList', newItem);
            return newItem;
          },

          updateBucketItem: async (id, updates) => {
            const bucketList = get().bucketList.map(item =>
              item.id === id ? { ...item, ...updates } : item
            );
            set({ bucketList });
            await storage.set('bucketList', bucketList);
            get().queuePendingChange('bucketList', { id, ...updates });
          },

          deleteBucketItem: async (id) => {
            const bucketList = get().bucketList.filter(item => item.id !== id);
            set({ bucketList });
            await storage.set('bucketList', bucketList);
            get().queuePendingChange('bucketList', { id, deleted: true });
          },

          // Vision Board Management
          addVisionImage: async (image) => {
            const newImage = {
              id: Date.now().toString(),
              ...image,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            const visionBoard = [...get().visionBoard, newImage];
            set({ visionBoard });
            await storage.set('visionBoard', visionBoard);

            get().queuePendingChange('visionBoard', newImage);
            return newImage;
          },

          updateVisionImage: async (id, updates) => {
            const visionBoard = get().visionBoard.map(image =>
              image.id === id
                ? { ...image, ...updates, updatedAt: new Date().toISOString() }
                : image
            );
            set({ visionBoard });
            await storage.set('visionBoard', visionBoard);
            get().queuePendingChange('visionBoard', { id, ...updates });
          },

          deleteVisionImage: async (id) => {
            const visionBoard = get().visionBoard.filter(image => image.id !== id);
            set({ visionBoard });
            await storage.set('visionBoard', visionBoard);
            get().queuePendingChange('visionBoard', { id, deleted: true });
          },

          togglePinVisionImage: async (id) => {
            const image = get().visionBoard.find(img => img.id === id);
            if (!image) return;

            const updates = { isPinned: !image.isPinned };
            await get().updateVisionImage(id, updates);
          },

          // Quotes Management
          addQuote: async (quote) => {
            const newQuote = {
              id: Date.now().toString(),
              ...quote,
              createdAt: new Date().toISOString()
            };

            const quotes = [...get().quotes, newQuote];
            set({ quotes });
            await storage.set('quotes', quotes);

            get().queuePendingChange('quotes', newQuote);
            return newQuote;
          },

          updateQuote: async (id, updates) => {
            const quotes = get().quotes.map(quote =>
              quote.id === id ? { ...quote, ...updates } : quote
            );
            set({ quotes });
            await storage.set('quotes', quotes);
            get().queuePendingChange('quotes', { id, ...updates });
          },

          deleteQuote: async (id) => {
            const quotes = get().quotes.filter(quote => quote.id !== id);
            set({ quotes });
            await storage.set('quotes', quotes);
            get().queuePendingChange('quotes', { id, deleted: true });
          },

          // Notes Management
          addNote: async (note) => {
            const newNote = {
              id: Date.now().toString(),
              ...note,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            const notes = [...get().notes, newNote];
            set({ notes });
            await storage.set('notes', notes);

            get().queuePendingChange('notes', newNote);
            return newNote;
          },

          updateNote: async (id, updates) => {
            const notes = get().notes.map(note =>
              note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
            );
            set({ notes });
            await storage.set('notes', notes);
            get().queuePendingChange('notes', { id, ...updates });
          },

          deleteNote: async (id) => {
            const notes = get().notes.filter(note => note.id !== id);
            set({ notes });
            await storage.set('notes', notes);
            get().queuePendingChange('notes', { id, deleted: true });
          },

          // Dark Mode — stores boolean (not string) to stay in sync with Zustand persist
          toggleDarkMode: async () => {
            const darkMode = !get().darkMode;
            set({ darkMode });
            // Store as boolean — initialize() reads it as boolean too
            await storage.set('darkMode', darkMode);

            // Apply to DOM
            if (darkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          },

          // Network & Sync — uses named handlers so they can be removed on cleanup
          _networkHandlersRegistered: false,
          setupNetworkHandlers: () => {
            // Guard: only register once — avoids duplicates in React StrictMode
            if (get()._networkHandlersRegistered) return;

            const onOnline = () => {
              set({ syncStatus: 'pending' });
              get().processPendingChanges();
            };
            const onOffline = () => {
              set({ syncStatus: 'offline' });
            };

            window.addEventListener('online', onOnline);
            window.addEventListener('offline', onOffline);

            set({
              _networkHandlersRegistered: true,
              _cleanupNetworkHandlers: () => {
                window.removeEventListener('online', onOnline);
                window.removeEventListener('offline', onOffline);
              }
            });

            // Initial check
            if (!navigator.onLine) {
              set({ syncStatus: 'offline' });
            }
          },

          queuePendingChange: () => {
            // Debounced sync to cloud (replaces old Google Sheets queueing)
            // Clear existing timeout if any
            if (get()._syncDebounce) {
              clearTimeout(get()._syncDebounce);
            }

            // Set new 500ms debounce timeout
            const timeout = setTimeout(() => {
              if (navigator.onLine && get().isAuthenticated) {
                get().syncToCloud();
              }
              set({ _syncDebounce: null });
            }, 500);

            set({ _syncDebounce: timeout });
          },

          // Google Sheets Authentication
          initializeGoogleSheets: async () => {
            try {
              await googleSheetsService.initialize();
              console.log('Google Sheets service initialized');
            } catch (error) {
              console.error('Failed to initialize Google Sheets:', error);
            }
          },

          signInToGoogle: async () => {
            try {
              set({ syncStatus: 'syncing', lastSyncError: null });

              const user = await googleSheetsService.signIn();
              const authState = googleSheetsService.getAuthState();

              if (!authState.isSignedIn || !authState.sheetId) {
                throw new Error('Authentication succeeded but sheet setup failed');
              }

              set({
                isAuthenticated: true,
                userEmail: user?.email,
                sheetId: authState.sheetId,
                sheetUrl: googleSheetsService.getSheetUrl(),
                syncStatus: 'idle'
              });

              // Save auth state to storage
              await storage.set('userEmail', user?.email);
              await storage.set('userSheetId', authState.sheetId);
              await storage.set('userSheetUrl', googleSheetsService.getSheetUrl());

              // Perform initial sync to upload all offline data to the sheet
              try {
                console.log('📤 Starting initial sync of offline data to Google Sheets...');
                const syncSuccess = await get().syncToSheets();
                if (syncSuccess) {
                  console.log('✅ Initial sync completed - all offline data uploaded to sheet');
                } else {
                  console.warn('⚠️ Initial sync returned false but no error thrown');
                }
              } catch (syncError) {
                console.error('❌ Initial sync failed:', syncError);
                set({
                  syncStatus: 'failed',
                  lastSyncError: syncError.message
                });
                // Don't throw - authentication was successful, user can manually retry sync
              }

              return user;
            } catch (error) {
              console.error('❌ Google sign-in failed:', error);
              set({
                syncStatus: 'failed',
                lastSyncError: error.message,
                isAuthenticated: false,
                userEmail: null,
                sheetId: null,
                sheetUrl: null
              });
              throw error;
            }
          },

          signOutFromGoogle: async () => {
            try {
              await googleSheetsService.signOut();

              set({
                isAuthenticated: false,
                userEmail: null,
                sheetId: null,
                sheetUrl: null,
                syncStatus: 'idle'
              });

              // Clear auth state from storage
              await storage.remove('userEmail');
              await storage.remove('userSheetId');
              await storage.remove('userSheetUrl');

            } catch (error) {
              console.error('Google sign-out failed:', error);
            }
          },

          // Google Sheets Sync
          syncToSheets: async () => {
            const authState = googleSheetsService.getAuthState();
            if (!authState.isSignedIn) {
              const error = 'Not authenticated with Google Sheets';
              console.warn('⚠️', error);
              set({ lastSyncError: error });
              return false;
            }

            try {
              set({ syncStatus: 'syncing', lastSyncError: null });
              const state = get();

              // Define data mapping for different sheets
              const dataMappings = [
                {
                  sheetName: 'Tasks',
                  data: state.tasks,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'text', type: 'string' },
                    { key: 'completed', type: 'boolean' },
                    { key: 'date', type: 'string' },
                    { key: 'priority', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Expenses',
                  data: state.expenses,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'description', type: 'string' },
                    { key: 'amount', type: 'number' },
                    { key: 'category', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Notes',
                  data: state.notes,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'title', type: 'string' },
                    { key: 'content', type: 'string' },
                    { key: 'folder', type: 'string' },
                    { key: 'tags', type: 'object' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Habits',
                  data: state.habits,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'name', type: 'string' },
                    { key: 'description', type: 'string' },
                    { key: 'color', type: 'string' },
                    { key: 'streak', type: 'number' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'HabitHistory',
                  data: Object.entries(state.habitHistory).flatMap(([habitId, dates]) =>
                    Object.entries(dates).map(([date, completed]) => ({
                      habitId,
                      date,
                      completed: completed ? 'TRUE' : 'FALSE',
                      createdAt: new Date().toISOString()
                    }))
                  ),
                  headers: [
                    { key: 'habitId', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'completed', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Meals',
                  data: state.meals,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'name', type: 'string' },
                    { key: 'calories', type: 'number' },
                    { key: 'date', type: 'string' },
                    { key: 'type', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Reminders',
                  data: state.callReminders,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'person', type: 'string' },
                    { key: 'phone', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'note', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'CompletedReminders',
                  data: state.completedCallReminders,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'person', type: 'string' },
                    { key: 'phone', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'note', type: 'string' },
                    { key: 'completedDate', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Journal',
                  data: state.journalEntries,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'mood', type: 'string' },
                    { key: 'entry', type: 'string' },
                    { key: 'gratitude', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'BucketList',
                  data: state.bucketList,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'title', type: 'string' },
                    { key: 'description', type: 'string' },
                    { key: 'status', type: 'string' },
                    { key: 'category', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'VisionBoard',
                  data: state.visionBoard,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'title', type: 'string' },
                    { key: 'description', type: 'string' },
                    { key: 'category', type: 'string' },
                    { key: 'tags', type: 'object' },
                    { key: 'imageData', type: 'string' },
                    { key: 'frame', type: 'string' },
                    { key: 'isPinned', type: 'boolean' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Quotes',
                  data: state.quotes,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'text', type: 'string' },
                    { key: 'author', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Alarms',
                  data: state.alarms,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'name', type: 'string' },
                    { key: 'time', type: 'string' },
                    { key: 'enabled', type: 'boolean' },
                    { key: 'repeat', type: 'object' },
                    { key: 'days', type: 'object' },
                    { key: 'sound', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Movies',
                  data: state.movies,
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'title', type: 'string' },
                    { key: 'year', type: 'string' },
                    { key: 'rating', type: 'string' },
                    { key: 'watched', type: 'boolean' },
                    { key: 'poster', type: 'string' },
                    { key: 'notes', type: 'string' },
                    { key: 'addedAt', type: 'string' }
                  ]
                }
              ];

              // Sync each data type
              console.log(`📊 Syncing ${dataMappings.length} data types to Google Sheets...`);
              let syncedCount = 0;
              for (const mapping of dataMappings) {
                const itemCount = mapping.data?.length || 0;
                console.log(`  → ${mapping.sheetName}: ${itemCount} items`);
                await googleSheetsService.syncDataToSheet(
                  mapping.sheetName,
                  mapping.data,
                  mapping.headers
                );
                syncedCount++;
              }
              console.log(`✅ Synced ${syncedCount}/${dataMappings.length} sheets successfully`);

              set({
                syncStatus: 'success',
                lastSyncTime: new Date().toISOString(),
                lastSyncError: null
              });

              await storage.set('lastSyncTime', new Date().toISOString());
              console.log('✅ All data synced to Google Sheets successfully');
              return true;

            } catch (error) {
              console.error('❌ Failed to sync to Google Sheets:', error);
              set({
                syncStatus: 'failed',
                lastSyncError: error.message || 'Unknown sync error'
              });
              return false;
            }
          },

          syncFromSheets: async () => {
            const authState = googleSheetsService.getAuthState();
            if (!authState.isSignedIn) {
              console.warn('Not authenticated with Google Sheets');
              return false;
            }

            try {
              set({ syncStatus: 'syncing' });

              // Define data mapping for different sheets
              const dataMappings = [
                {
                  sheetName: 'Tasks',
                  stateKey: 'tasks',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'text', type: 'string' },
                    { key: 'completed', type: 'boolean' },
                    { key: 'date', type: 'string' },
                    { key: 'priority', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Expenses',
                  stateKey: 'expenses',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'description', type: 'string' },
                    { key: 'amount', type: 'number' },
                    { key: 'category', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Notes',
                  stateKey: 'notes',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'title', type: 'string' },
                    { key: 'content', type: 'string' },
                    { key: 'folder', type: 'string' },
                    { key: 'tags', type: 'object' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Habits',
                  stateKey: 'habits',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'name', type: 'string' },
                    { key: 'description', type: 'string' },
                    { key: 'color', type: 'string' },
                    { key: 'streak', type: 'number' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'HabitHistory',
                  stateKey: 'habitHistory',
                  headers: [
                    { key: 'habitId', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'completed', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ],
                  transform: (data) => {
                    // Transform flat array back to nested object
                    const history = {};
                    data.forEach(item => {
                      if (!history[item.habitId]) {
                        history[item.habitId] = {};
                      }
                      history[item.habitId][item.date] = item.completed === 'TRUE';
                    });
                    return history;
                  }
                },
                {
                  sheetName: 'Meals',
                  stateKey: 'meals',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'name', type: 'string' },
                    { key: 'calories', type: 'number' },
                    { key: 'date', type: 'string' },
                    { key: 'type', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Reminders',
                  stateKey: 'callReminders',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'person', type: 'string' },
                    { key: 'phone', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'note', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'CompletedReminders',
                  stateKey: 'completedCallReminders',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'person', type: 'string' },
                    { key: 'phone', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'note', type: 'string' },
                    { key: 'completedDate', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Journal',
                  stateKey: 'journalEntries',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'date', type: 'string' },
                    { key: 'mood', type: 'string' },
                    { key: 'entry', type: 'string' },
                    { key: 'gratitude', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'BucketList',
                  stateKey: 'bucketList',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'title', type: 'string' },
                    { key: 'description', type: 'string' },
                    { key: 'status', type: 'string' },
                    { key: 'category', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'VisionBoard',
                  stateKey: 'visionBoard',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'title', type: 'string' },
                    { key: 'description', type: 'string' },
                    { key: 'category', type: 'string' },
                    { key: 'tags', type: 'object' },
                    { key: 'imageData', type: 'string' },
                    { key: 'frame', type: 'string' },
                    { key: 'isPinned', type: 'boolean' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Quotes',
                  stateKey: 'quotes',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'text', type: 'string' },
                    { key: 'author', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Alarms',
                  stateKey: 'alarms',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'name', type: 'string' },
                    { key: 'time', type: 'string' },
                    { key: 'enabled', type: 'boolean' },
                    { key: 'repeat', type: 'object' },
                    { key: 'days', type: 'object' },
                    { key: 'sound', type: 'string' },
                    { key: 'createdAt', type: 'string' }
                  ]
                },
                {
                  sheetName: 'Movies',
                  stateKey: 'movies',
                  headers: [
                    { key: 'id', type: 'string' },
                    { key: 'title', type: 'string' },
                    { key: 'year', type: 'string' },
                    { key: 'rating', type: 'string' },
                    { key: 'watched', type: 'boolean' },
                    { key: 'poster', type: 'string' },
                    { key: 'notes', type: 'string' },
                    { key: 'addedAt', type: 'string' }
                  ]
                }
              ];

              const updateData = {};

              // Load each data type
              for (const mapping of dataMappings) {
                const data = await googleSheetsService.loadDataFromSheet(
                  mapping.sheetName,
                  mapping.headers
                );
                // Apply transform if defined (for HabitHistory)
                updateData[mapping.stateKey] = mapping.transform ? mapping.transform(data) : data;
              }

              // Update state with loaded data
              set({
                ...updateData,
                syncStatus: 'success',
                lastSyncTime: new Date().toISOString()
              });

              // Save to local storage
              for (const [key, value] of Object.entries(updateData)) {
                await storage.set(key, value);
              }
              await storage.set('lastSyncTime', new Date().toISOString());

              console.log('✅ All data loaded from Google Sheets successfully');
              return true;

            } catch (error) {
              console.error('Failed to sync from Google Sheets:', error);
              set({ syncStatus: 'failed' });
              return false;
            }
          },

          // Migration from legacy app
          // IMPORTANT: This must NOT call initialize() — that would create an infinite loop.
          // Instead it writes migrated data directly and marks migration done.
          migrateFromLegacy: async () => {
            console.log('Starting migration from legacy app...');

            const legacyData = {};
            const keys = [
              'tasks', 'expenses', 'notes', 'habits', 'habitHistory',
              'meals', 'callReminders', 'completedCallReminders',
              'bucketList', 'journalEntries', 'quotes', 'streakData',
              'darkMode', 'userEmail', 'userSheetId', 'userSheetUrl'
            ];

            // Collect all legacy data
            for (const key of keys) {
              const value = localStorage.getItem(key);
              if (value) {
                legacyData[key] = value;
              }
            }

            // Migrate using storage adapter (writes to todo_ prefixed keys)
            if (Object.keys(legacyData).length > 0) {
              await storage.migrate(legacyData);

              // Parse and apply migrated data directly to store — no re-initialization
              const parsedUpdates = {};
              const arrayKeys = ['tasks', 'expenses', 'notes', 'habits', 'meals',
                'callReminders', 'completedCallReminders', 'bucketList', 'journalEntries', 'quotes'];
              for (const key of arrayKeys) {
                if (legacyData[key]) {
                  try { parsedUpdates[key] = JSON.parse(legacyData[key]); } catch (_) { /* skip invalid */ }
                }
              }
              if (legacyData.habitHistory) {
                try { parsedUpdates.habitHistory = JSON.parse(legacyData.habitHistory); } catch (_) { /* skip */ }
              }
              if (legacyData.darkMode) {
                parsedUpdates.darkMode = legacyData.darkMode === 'enabled';
              }

              set(parsedUpdates);

              // Mark migration as complete so needsMigration() returns false
              localStorage.setItem('todo_migrationCompleted', new Date().toISOString());
              console.log('Migration completed successfully');
            }
          },

          // Alarm Management
          addAlarm: async (alarm) => {
            const newAlarm = {
              id: Date.now().toString(),
              ...alarm,
              createdAt: new Date().toISOString()
            };

            const alarms = [...get().alarms, newAlarm];
            set({ alarms });
            await storage.set('alarms', alarms);

            get().queuePendingChange('alarms', newAlarm);
            return newAlarm;
          },

          updateAlarm: async (id, updates) => {
            const alarms = get().alarms.map(alarm =>
              alarm.id === id ? { ...alarm, ...updates } : alarm
            );
            set({ alarms });
            await storage.set('alarms', alarms);
            get().queuePendingChange('alarms', { id, ...updates });
          },

          deleteAlarm: async (id) => {
            const alarms = get().alarms.filter(alarm => alarm.id !== id);
            set({ alarms });
            await storage.set('alarms', alarms);
            get().queuePendingChange('alarms', { id, deleted: true });
          },

          // Movie Management
          addMovie: async (movie) => {
            const newMovie = {
              id: movie.id || Date.now().toString(),
              ...movie,
              addedAt: new Date().toISOString()
            };

            const movies = [...get().movies, newMovie];
            set({ movies });
            await storage.set('movies', movies);

            get().queuePendingChange('movies', newMovie);
            return newMovie;
          },

          updateMovie: async (id, updates) => {
            const movies = get().movies.map(movie =>
              movie.id === id ? { ...movie, ...updates } : movie
            );
            set({ movies });
            await storage.set('movies', movies);
            get().queuePendingChange('movies', { id, ...updates });
          },

          deleteMovie: async (id) => {
            const movies = get().movies.filter(movie => movie.id !== id);
            set({ movies });
            await storage.set('movies', movies);
            get().queuePendingChange('movies', { id, deleted: true });
          },

          // Link Management
          addLink: async (linkData) => {
            const newLink = {
              id: Date.now(),
              ...linkData,
              createdAt: new Date().toISOString()
            };

            const links = [...get().links, newLink];
            set({ links });
            await storage.set('links', links);
            get().queuePendingChange('links', newLink);

            return newLink;
          },

          updateLink: async (linkId, updates) => {
            const links = get().links.map(link =>
              link.id === linkId ? { ...link, ...updates } : link
            );

            set({ links });
            await storage.set('links', links);
            get().queuePendingChange('links', { id: linkId, ...updates });
          },

          deleteLink: async (linkId) => {
            const links = get().links.filter(link => link.id !== linkId);
            set({ links });
            await storage.set('links', links);
            get().queuePendingChange('links', { id: linkId, deleted: true });
          },

          // View Management
          setCurrentView: (view) => {
            set({ currentView: view });
          },

          // Metrics Calculation (mirrors original app)
          getMetrics: () => {
            const tasks = get().tasks;
            const todayStr = new Date().toISOString().split('T')[0];
            const todayTasks = tasks.filter(task => task.date === todayStr);

            return {
              total: todayTasks.length,
              completed: todayTasks.filter(t => t.completed).length,
              pending: todayTasks.filter(t => !t.completed).length,
              completionRate: todayTasks.length > 0
                ? Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100)
                : 0
            };
          },

          // Supabase Auth Methods
          signInWithEmail: async (email, password) => {
            try {
              set({ syncStatus: 'syncing' });
              const { user, error } = await supabaseService.signInWithEmail(email, password);

              if (error) {
                set({ syncStatus: 'failed' });
                throw new Error(error);
              }

              set({
                isAuthenticated: true,
                userEmail: user.email,
                userId: user.id,
                syncStatus: 'idle'
              });

              await storage.set('userEmail', user.email);
              await storage.set('userId', user.id);

              // Pull data from cloud on login
              await get().pullFromCloud();

              // Setup realtime sync
              get().setupRealtimeSync();

              return user;
            } catch (error) {
              console.error('Sign in failed:', error);
              set({ syncStatus: 'failed', isAuthenticated: false });
              throw error;
            }
          },

          signInWithMagicLink: async (email) => {
            try {
              set({ syncStatus: 'syncing' });
              const { success, error } = await supabaseService.signInWithMagicLink(email);

              if (error) {
                set({ syncStatus: 'failed' });
                throw new Error(error);
              }

              set({ syncStatus: 'idle' });
              return { success: true };
            } catch (error) {
              console.error('Magic link sign in failed:', error);
              set({ syncStatus: 'failed' });
              throw error;
            }
          },

          signOut: async () => {
            try {
              supabaseService.unsubscribeFromChanges();
              const { error } = await supabaseService.signOut();

              if (error) throw error;

              set({
                isAuthenticated: false,
                userEmail: null,
                userId: null,
                syncStatus: 'idle'
              });

              await storage.remove('userEmail');
              await storage.remove('userId');
            } catch (error) {
              console.error('Sign out failed:', error);
            }
          },

          // Cloud Sync Methods
          syncToCloud: async () => {
            const state = get();
            if (!state.isAuthenticated || !state.userId) return;
            if (state._syncInProgress) return;

            set({ _syncInProgress: true, syncStatus: 'syncing' });

            try {
              const dataToSync = {
                tasks: state.tasks,
                expenses: state.expenses,
                notes: state.notes,
                habits: state.habits,
                habitHistory: state.habitHistory,
                meals: state.meals,
                callReminders: state.callReminders,
                completedCallReminders: state.completedCallReminders,
                bucketList: state.bucketList,
                visionBoard: state.visionBoard,
                journalEntries: state.journalEntries,
                quotes: state.quotes,
                streakData: state.streakData,
                alarms: state.alarms,
                movies: state.movies,
                trash: state.trash,
                budget: state.budget,
                budgetAlerts: state.budgetAlerts,
                darkMode: state.darkMode,
                links: state.links || [],
                engagementStats: state.engagementStats || {},
                locationReminders: state.locationReminders || [],
                lastRolloverDate: state.lastRolloverDate || null,
                onboardingCompleted: state.onboardingCompleted || false
              };

              const { success, error } = await supabaseService.pushDataToCloud(dataToSync, state.userId);

              if (error) throw error;

              set({
                _syncInProgress: false,
                syncStatus: 'success',
                lastSyncTime: new Date().toISOString()
              });

              return true;
            } catch (error) {
              console.error('Sync to cloud failed:', error);
              set({ _syncInProgress: false, syncStatus: 'failed' });
              return false;
            }
          },

          pullFromCloud: async () => {
            const state = get();
            if (!state.isAuthenticated || !state.userId) return;

            try {
              set({ syncStatus: 'syncing' });
              const { data, error } = await supabaseService.pullDataFromCloud(state.userId);

              if (error) throw error;

              if (data) {
                // Merge arrays by id to prevent local-only items from being lost
                const mergedTasks = mergeById(state.tasks, data.tasks);
                const mergedExpenses = mergeById(state.expenses, data.expenses);
                const mergedNotes = mergeById(state.notes, data.notes);
                const mergedHabits = mergeById(state.habits, data.habits);
                const mergedMeals = mergeById(state.meals, data.meals);
                const mergedCallReminders = mergeById(state.callReminders, data.callReminders);
                const mergedCompletedCallReminders = mergeById(state.completedCallReminders, data.completedCallReminders);
                const mergedBucketList = mergeById(state.bucketList, data.bucketList);
                const mergedVisionBoard = mergeById(state.visionBoard, data.visionBoard);
                const mergedJournalEntries = mergeById(state.journalEntries, data.journalEntries);
                const mergedQuotes = mergeById(state.quotes, data.quotes);
                const mergedAlarms = mergeById(state.alarms, data.alarms);
                const mergedMovies = mergeById(state.movies, data.movies);
                const mergedTrash = mergeById(state.trash, data.trash);
                const mergedBudgetAlerts = mergeById(state.budgetAlerts, data.budgetAlerts);
                const mergedLinks = mergeById(state.links, data.links);
                const mergedLocationReminders = mergeById(state.locationReminders, data.locationReminders);
                const mergedHabitHistory = { ...(state.habitHistory || {}), ...(data.habitHistory || {}) };
                const mergedStreakData = { ...(state.streakData || {}), ...(data.streakData || {}) };
                const mergedEngagementStats = { ...(state.engagementStats || {}), ...(data.engagementStats || {}) };

                set({
                  tasks: mergedTasks,
                  expenses: mergedExpenses,
                  notes: mergedNotes,
                  habits: mergedHabits,
                  habitHistory: mergedHabitHistory,
                  meals: mergedMeals,
                  callReminders: mergedCallReminders,
                  completedCallReminders: mergedCompletedCallReminders,
                  bucketList: mergedBucketList,
                  visionBoard: mergedVisionBoard,
                  journalEntries: mergedJournalEntries,
                  quotes: mergedQuotes,
                  streakData: mergedStreakData,
                  alarms: mergedAlarms,
                  movies: mergedMovies,
                  trash: mergedTrash,
                  budget: data.budget !== undefined ? data.budget : state.budget,
                  budgetAlerts: mergedBudgetAlerts,
                  darkMode: data.darkMode !== undefined ? data.darkMode : state.darkMode,
                  links: mergedLinks,
                  engagementStats: mergedEngagementStats,
                  locationReminders: mergedLocationReminders,
                  lastRolloverDate: data.lastRolloverDate || state.lastRolloverDate,
                  onboardingCompleted: data.onboardingCompleted || state.onboardingCompleted,
                  syncStatus: 'success',
                  lastSyncTime: new Date().toISOString()
                });

                // Persist merged data to local storage
                await storage.setBatch({
                  tasks: mergedTasks,
                  expenses: mergedExpenses,
                  notes: mergedNotes,
                  habits: mergedHabits,
                  habitHistory: mergedHabitHistory,
                  meals: mergedMeals,
                  callReminders: mergedCallReminders,
                  completedCallReminders: mergedCompletedCallReminders,
                  bucketList: mergedBucketList,
                  visionBoard: mergedVisionBoard,
                  journalEntries: mergedJournalEntries,
                  quotes: mergedQuotes,
                  streakData: mergedStreakData,
                  alarms: mergedAlarms,
                  movies: mergedMovies,
                  trash: mergedTrash,
                  budget: data.budget !== undefined ? data.budget : state.budget,
                  budgetAlerts: mergedBudgetAlerts,
                  darkMode: data.darkMode !== undefined ? data.darkMode : state.darkMode,
                  links: mergedLinks,
                  engagementStats: mergedEngagementStats,
                  locationReminders: mergedLocationReminders
                });
              }
            } catch (error) {
              console.error('Pull from cloud failed:', error);
              set({ syncStatus: 'failed' });
            }
          },

          setupRealtimeSync: () => {
            const state = get();
            if (!state.isAuthenticated || !state.userId || state._realtimeSubscribed) return;

            try {
              supabaseService.subscribeToChanges(state.userId, (data) => {
                // Merge cloud changes with local state using id-based merge
                const currentState = get();
                set({
                  tasks: mergeById(currentState.tasks, data.tasks),
                  expenses: mergeById(currentState.expenses, data.expenses),
                  notes: mergeById(currentState.notes, data.notes),
                  habits: mergeById(currentState.habits, data.habits),
                  habitHistory: { ...(currentState.habitHistory || {}), ...(data.habitHistory || {}) },
                  meals: mergeById(currentState.meals, data.meals),
                  callReminders: mergeById(currentState.callReminders, data.callReminders),
                  completedCallReminders: mergeById(currentState.completedCallReminders, data.completedCallReminders),
                  bucketList: mergeById(currentState.bucketList, data.bucketList),
                  visionBoard: mergeById(currentState.visionBoard, data.visionBoard),
                  journalEntries: mergeById(currentState.journalEntries, data.journalEntries),
                  quotes: mergeById(currentState.quotes, data.quotes),
                  streakData: { ...(currentState.streakData || {}), ...(data.streakData || {}) },
                  alarms: mergeById(currentState.alarms, data.alarms),
                  movies: mergeById(currentState.movies, data.movies),
                  trash: mergeById(currentState.trash, data.trash),
                  budget: data.budget !== undefined ? data.budget : currentState.budget,
                  budgetAlerts: mergeById(currentState.budgetAlerts, data.budgetAlerts),
                  darkMode: data.darkMode !== undefined ? data.darkMode : currentState.darkMode,
                  links: mergeById(currentState.links, data.links),
                  engagementStats: { ...(currentState.engagementStats || {}), ...(data.engagementStats || {}) },
                  locationReminders: mergeById(currentState.locationReminders, data.locationReminders)
                });
              });

              set({ _realtimeSubscribed: true });
            } catch (error) {
              console.error('Setup realtime sync failed:', error);
            }
          }
        })}
    )
  )
);

export default useAppStore;