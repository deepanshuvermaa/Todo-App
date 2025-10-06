/**
 * Main App Store - Zustand state management
 * Mirrors the original TodoApp class functionality
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import StorageAdapter from '@/core/storage/StorageAdapter';
import googleSheetsService from '@/services/GoogleSheetsService';

const storage = new StorageAdapter();

const useAppStore = create(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
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

          // UI State
          currentDate: new Date(),
          currentView: 'dashboard',
          darkMode: false,
          isLoading: false,
          syncStatus: 'idle', // idle, syncing, success, failed, offline

          // Auth & Sync State
          isAuthenticated: false,
          userEmail: null,
          sheetId: null,
          sheetUrl: null,
          lastSyncTime: null,
          lastSyncError: null,
          pendingChanges: [],

          // Actions - Core Functions
          initialize: async () => {
            set({ isLoading: true });

            try {
              // Load all data from storage
              const [
                tasks,
                expenses,
                notes,
                habits,
                habitHistory,
                meals,
                callReminders,
                completedCallReminders,
                bucketList,
                visionBoard,
                journalEntries,
                quotes,
                streakData,
                alarms,
                movies,
                darkMode,
                userEmail,
                sheetId,
                sheetUrl
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
                storage.get('darkMode'),
                storage.get('userEmail'),
                storage.get('userSheetId'),
                storage.get('userSheetUrl')
              ]);

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
                darkMode: darkMode === 'enabled',
                userEmail,
                sheetId,
                sheetUrl,
                isLoading: false
              });

              // Check for migration needs
              if (await storage.needsMigration()) {
                await get().migrateFromLegacy();
              }

              // Initialize Google Sheets if not already done
              get().initializeGoogleSheets();

              // Setup network handlers
              get().setupNetworkHandlers();

              // Check and perform daily rollover
              get().checkAndPerformRollover();

              // Check for existing Google auth
              if (userEmail && sheetId) {
                set({
                  isAuthenticated: true,
                  userEmail,
                  sheetId,
                  sheetUrl
                });
              }

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
              createdAt: new Date().toISOString()
            };

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
            const tasks = get().tasks.filter(task => task.id !== taskId);
            set({ tasks });
            await storage.set('tasks', tasks);

            // Queue for sync
            get().queuePendingChange('tasks', { id: taskId, deleted: true });
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

          // Expense Management
          addExpense: async (expense) => {
            const newExpense = {
              id: Date.now().toString(),
              ...expense,
              date: expense.date || new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString()
            };

            const expenses = [...get().expenses, newExpense];
            set({ expenses });
            await storage.set('expenses', expenses);

            get().queuePendingChange('expenses', newExpense);
            return newExpense;
          },

          updateExpense: async (id, updates) => {
            const expenses = get().expenses.map(expense =>
              expense.id === id ? { ...expense, ...updates } : expense
            );
            set({ expenses });
            await storage.set('expenses', expenses);
            get().queuePendingChange('expenses', { id, ...updates });
          },

          deleteExpense: async (id) => {
            const expenses = get().expenses.filter(expense => expense.id !== id);
            set({ expenses });
            await storage.set('expenses', expenses);
            get().queuePendingChange('expenses', { id, deleted: true });
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

          // Dark Mode
          toggleDarkMode: async () => {
            const darkMode = !get().darkMode;
            set({ darkMode });
            await storage.set('darkMode', darkMode ? 'enabled' : 'disabled');

            // Apply to DOM
            if (darkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          },

          // Network & Sync
          setupNetworkHandlers: () => {
            window.addEventListener('online', () => {
              set({ syncStatus: 'pending' });
              get().processPendingChanges();
            });

            window.addEventListener('offline', () => {
              set({ syncStatus: 'offline' });
            });

            // Initial check
            if (!navigator.onLine) {
              set({ syncStatus: 'offline' });
            }
          },

          queuePendingChange: (type, data) => {
            const pendingChanges = [...get().pendingChanges, {
              type,
              data,
              timestamp: new Date().toISOString()
            }];

            set({ pendingChanges });
            storage.set('pendingChanges', pendingChanges);

            // Try to sync immediately if online
            if (navigator.onLine && get().isAuthenticated) {
              get().processPendingChanges();
            }
          },

          processPendingChanges: async () => {
            const pendingChanges = get().pendingChanges;
            if (pendingChanges.length === 0) return;

            if (!navigator.onLine || !get().isAuthenticated) {
              return;
            }

            set({ syncStatus: 'syncing' });

            try {
              // Process changes (will integrate with Google Sheets sync)
              await get().syncToSheets();

              // Clear pending changes
              set({ pendingChanges: [] });
              await storage.set('pendingChanges', []);

              set({ syncStatus: 'success', lastSyncTime: new Date() });
            } catch (error) {
              console.error('Failed to process pending changes:', error);
              set({ syncStatus: 'failed' });
            }
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

            // Migrate using storage adapter
            if (Object.keys(legacyData).length > 0) {
              await storage.migrate(legacyData);
              await get().initialize(); // Reload with migrated data
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
          }
        }),
        {
          name: 'todo-app-storage',
          storage: {
            getItem: async (name) => {
              const value = await storage.get(name);
              return value ? JSON.stringify(value) : null;
            },
            setItem: async (name, value) => {
              try {
                const parsed = typeof value === 'string' ? JSON.parse(value) : value;
                await storage.set(name, parsed);
              } catch (error) {
                console.error('Storage setItem error:', error);
                await storage.set(name, value);
              }
            },
            removeItem: async (name) => {
              await storage.remove(name);
            }
          },
          partialize: (state) => ({
            // Only persist data, not UI state
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
            darkMode: state.darkMode,
            userEmail: state.userEmail,
            sheetId: state.sheetId,
            sheetUrl: state.sheetUrl,
            lastSyncTime: state.lastSyncTime
          })
        }
      )
    )
  )
);

export default useAppStore;