import { supabase } from '../config/supabase';

class SupabaseService {
  constructor() {
    this.currentUser = null;
    this.subscription = null;
  }

  // Auth Methods
  async signUpWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + import.meta.env.VITE_BASE_URL
        }
      });

      if (error) throw error;

      // Create user_data row
      if (data.user) {
        await this.initializeUserData(data.user.id);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error.message };
    }
  }

  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error.message };
    }
  }

  async signInWithMagicLink(email) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + import.meta.env.VITE_BASE_URL
        }
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Magic link error:', error);
      return { success: false, error: error.message };
    }
  }

  async restoreSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session) {
        this.currentUser = data.session.user;
        return { user: data.session.user, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      console.error('Session restore error:', error);
      return { user: null, error: error.message };
    }
  }

  async signOut() {
    try {
      // Unsubscribe from realtime
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  }

  // Initialize user_data row on signup
  async initializeUserData(userId) {
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert(
          {
            user_id: userId,
            tasks: [],
            expenses: [],
            notes: [],
            habits: [],
            habit_history: {},
            meals: [],
            call_reminders: [],
            completed_call_reminders: [],
            bucket_list: [],
            vision_board: [],
            journal_entries: [],
            quotes: [],
            streak_data: {},
            alarms: [],
            movies: [],
            trash: [],
            budget: null,
            budget_alerts: [],
            dark_mode: false,
            links: [],
            engagement_stats: {},
            location_reminders: [],
            onboarding_completed: false
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Initialize user data error:', error);
    }
  }

  // Cloud Sync Methods
  async pushDataToCloud(allData, userId) {
    try {
      const { error } = await supabase
        .from('user_data')
        .update({
          tasks: allData.tasks || [],
          expenses: allData.expenses || [],
          notes: allData.notes || [],
          habits: allData.habits || [],
          habit_history: allData.habitHistory || {},
          meals: allData.meals || [],
          call_reminders: allData.callReminders || [],
          completed_call_reminders: allData.completedCallReminders || [],
          bucket_list: allData.bucketList || [],
          vision_board: allData.visionBoard || [],
          journal_entries: allData.journalEntries || [],
          quotes: allData.quotes || [],
          streak_data: allData.streakData || {},
          alarms: allData.alarms || [],
          movies: allData.movies || [],
          trash: allData.trash || [],
          budget: allData.budget || null,
          budget_alerts: allData.budgetAlerts || [],
          dark_mode: allData.darkMode || false,
          links: allData.links || [],
          engagement_stats: allData.engagementStats || {},
          location_reminders: allData.locationReminders || [],
          last_rollover_date: allData.lastRolloverDate || null,
          onboarding_completed: allData.onboardingCompleted || false
        })
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Push to cloud error:', error);
      return { success: false, error: error.message };
    }
  }

  async pullDataFromCloud(userId) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // If no data exists, initialize it
      if (!data) {
        await this.initializeUserData(userId);
        return { data: null, error: null };
      }

      // Transform snake_case to camelCase for state
      return {
        data: {
          tasks: data.tasks || [],
          expenses: data.expenses || [],
          notes: data.notes || [],
          habits: data.habits || [],
          habitHistory: data.habit_history || {},
          meals: data.meals || [],
          callReminders: data.call_reminders || [],
          completedCallReminders: data.completed_call_reminders || [],
          bucketList: data.bucket_list || [],
          visionBoard: data.vision_board || [],
          journalEntries: data.journal_entries || [],
          quotes: data.quotes || [],
          streakData: data.streak_data || {},
          alarms: data.alarms || [],
          movies: data.movies || [],
          trash: data.trash || [],
          budget: data.budget || null,
          budgetAlerts: data.budget_alerts || [],
          darkMode: data.dark_mode || false,
          links: data.links || [],
          engagementStats: data.engagement_stats || {},
          locationReminders: data.location_reminders || [],
          lastRolloverDate: data.last_rollover_date || null,
          onboardingCompleted: data.onboarding_completed || false,
          updatedAt: data.updated_at
        },
        error: null
      };
    } catch (error) {
      console.error('Pull from cloud error:', error);
      return { data: null, error: error.message };
    }
  }

  // Real-time Subscriptions
  subscribeToChanges(userId, callback) {
    try {
      this.subscription = supabase
        .channel(`public:user_data:user_id=eq.${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_data',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            // Transform data and notify callback
            if (payload.new) {
              const data = {
                tasks: payload.new.tasks || [],
                expenses: payload.new.expenses || [],
                notes: payload.new.notes || [],
                habits: payload.new.habits || [],
                habitHistory: payload.new.habit_history || {},
                meals: payload.new.meals || [],
                callReminders: payload.new.call_reminders || [],
                completedCallReminders: payload.new.completed_call_reminders || [],
                bucketList: payload.new.bucket_list || [],
                visionBoard: payload.new.vision_board || [],
                journalEntries: payload.new.journal_entries || [],
                quotes: payload.new.quotes || [],
                streakData: payload.new.streak_data || {},
                alarms: payload.new.alarms || [],
                movies: payload.new.movies || [],
                trash: payload.new.trash || [],
                budget: payload.new.budget || null,
                budgetAlerts: payload.new.budget_alerts || [],
                darkMode: payload.new.dark_mode || false,
                links: payload.new.links || [],
                engagementStats: payload.new.engagement_stats || {},
                locationReminders: payload.new.location_reminders || [],
                lastRolloverDate: payload.new.last_rollover_date || null,
                onboardingCompleted: payload.new.onboarding_completed || false
              };
              callback(data);
            }
          }
        )
        .subscribe();

      return { success: true };
    } catch (error) {
      console.error('Subscribe to changes error:', error);
      return { error: error.message };
    }
  }

  unsubscribeFromChanges() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}

export const supabaseService = new SupabaseService();
