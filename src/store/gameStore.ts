import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, User, Quest, FitnessData } from '../types';
import healthService, { HealthData } from '../services/healthService';
import authService from '../services/authService';
import firestoreService from '../services/firestoreService';

interface GameState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Character
  character: Character | null;
  
  // Game Data
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  
  // Fitness Data
  todaysFitnessData: FitnessData | null;
  fitnessHistory: FitnessData[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setCharacter: (character: Character | null) => void;
  updateCharacterStats: (stats: Partial<Character>) => void;
  addExperience: (amount: number) => void;
  levelUp: () => void;
  
  // Auth Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, username: string, sportCategory: any) => Promise<boolean>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  
  // Quest Actions
  setQuests: (quests: Quest[]) => void;
  updateQuestProgress: (questId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  
  // Fitness Actions
  updateFitnessData: (data: FitnessData) => void;
  addWorkout: (workout: any) => void;
  syncHealthData: () => Promise<void>;
  initializeHealthService: () => Promise<boolean>;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      character: null,
      quests: [],
      activeQuests: [],
      completedQuests: [],
      todaysFitnessData: null,
      fitnessHistory: [],
      isLoading: false,
      error: null,

      // User & Auth Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // Firebase Auth Integration
      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.initialize();
          if (user) {
            set({ user, isAuthenticated: true });
            // Load character data
            const character = await firestoreService.getCharacter(user.id);
            if (character) {
              set({ character });
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ error: 'Failed to initialize authentication' });
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.signIn(email, password);
          if (result.success && result.user) {
            set({ user: result.user, isAuthenticated: true });
            // Load character data
            const character = await firestoreService.getCharacter(result.user.id);
            if (character) {
              set({ character });
              // Load user quests
              const quests = await firestoreService.getUserQuests(result.user.id);
              get().setQuests(quests);
            }
            set({ isLoading: false });
            return true;
          } else {
            set({ error: result.error || 'Sign in failed', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Sign in failed', isLoading: false });
          return false;
        }
      },

      signUp: async (email: string, password: string, username: string, sportCategory: any) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.signUp(email, password, username, sportCategory);
          if (result.success && result.user) {
            set({ user: result.user, isAuthenticated: true });
            // Load character data
            const character = await firestoreService.getCharacter(result.user.id);
            if (character) {
              set({ character });
            }
            set({ isLoading: false });
            return true;
          } else {
            set({ error: result.error || 'Sign up failed', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Sign up failed', isLoading: false });
          return false;
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await authService.signOut();
          set({
            user: null,
            isAuthenticated: false,
            character: null,
            quests: [],
            activeQuests: [],
            completedQuests: [],
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Sign out failed', isLoading: false });
        }
      },
      
      // Character Actions
      setCharacter: (character) => set({ character }),
      
      updateCharacterStats: (stats) =>
        set((state) => ({
          character: state.character
            ? { ...state.character, ...stats }
            : null,
        })),

      addExperience: (amount) =>
        set((state) => {
          if (!state.character || !state.user) return state;
          
          const newExp = state.character.experience + amount;
          const expToNext = state.character.experienceToNext;
          
          let updatedCharacter;
          if (newExp >= expToNext) {
            // Level up!
            const newLevel = state.character.level + 1;
            const newExpToNext = Math.floor(expToNext * 1.5); // Exponential growth
            
            updatedCharacter = {
              ...state.character,
              level: newLevel,
              experience: newExp - expToNext,
              experienceToNext: newExpToNext,
              stats: {
                ...state.character.stats,
                maxHealth: state.character.stats.maxHealth + 10,
                maxMana: state.character.stats.maxMana + 5,
                strength: state.character.stats.strength + 1,
                agility: state.character.stats.agility + 1,
                endurance: state.character.stats.endurance + 1,
                intelligence: state.character.stats.intelligence + 1,
              }
            };
          } else {
            updatedCharacter = {
              ...state.character,
              experience: newExp,
            };
          }

          // Save character progress to Firebase (fire and forget)
          if (state.user.id) {
            firestoreService.updateCharacterXP(state.user.id, updatedCharacter.experience, updatedCharacter.level)
              .catch(error => console.error('Failed to save character progress to Firebase:', error));
          }
          
          return {
            character: updatedCharacter
          };
        }),

      levelUp: () => {
        const { addExperience } = get();
        addExperience(0); // Trigger level up check
      },

      // Quest Actions
      setQuests: (quests) => {
        const activeQuests = quests.filter(q => !q.isCompleted);
        const completedQuests = quests.filter(q => q.isCompleted);
        set({ quests, activeQuests, completedQuests });
      },

      updateQuestProgress: (questId, progress) =>
        set((state) => ({
          quests: state.quests.map(quest =>
            quest.id === questId
              ? { ...quest, progress: Math.min(progress, quest.maxProgress) }
              : quest
          ),
        })),

      completeQuest: (questId) =>
        set((state) => {
          const quest = state.quests.find(q => q.id === questId);
          if (!quest) return state;
          
          // Award rewards
          quest.rewards.forEach(reward => {
            if (reward.type === 'experience' && reward.amount) {
              get().addExperience(reward.amount);
            }
            // Handle other reward types...
          });
          
          return {
            quests: state.quests.map(q =>
              q.id === questId ? { ...q, isCompleted: true } : q
            ),
          };
        }),

      // Fitness Actions
      updateFitnessData: (data) =>
        set((state) => {
          // Ensure date is a proper Date object
          const normalizedData = {
            ...data,
            date: data.date instanceof Date ? data.date : new Date(data.date)
          };
          
          return {
            todaysFitnessData: normalizedData,
            fitnessHistory: [
              ...state.fitnessHistory.filter(d => {
                const existingDate = d.date instanceof Date ? d.date : new Date(d.date);
                return existingDate.toDateString() !== normalizedData.date.toDateString();
              }),
              normalizedData
            ].sort((a, b) => {
              const dateA = a.date instanceof Date ? a.date : new Date(a.date);
              const dateB = b.date instanceof Date ? b.date : new Date(b.date);
              return dateB.getTime() - dateA.getTime();
            }),
          };
        }),

      addWorkout: (workout) =>
        set((state) => {
          if (!state.todaysFitnessData) return state;
          
          const updatedData = {
            ...state.todaysFitnessData,
            workouts: [...state.todaysFitnessData.workouts, workout],
            activeMinutes: state.todaysFitnessData.activeMinutes + workout.duration,
            calories: state.todaysFitnessData.calories + workout.caloriesBurned,
          };
          
          return {
            todaysFitnessData: updatedData,
          };
        }),

      // Health Service Integration
      initializeHealthService: async () => {
        set({ isLoading: true });
        try {
          const success = await healthService.initialize();
          if (success) {
            await get().syncHealthData();
          }
          set({ isLoading: false });
          return success;
        } catch (error) {
          console.error('Failed to initialize health service:', error);
          set({ isLoading: false, error: 'Failed to initialize health tracking' });
          return false;
        }
      },

      syncHealthData: async () => {
        try {
          const healthData = await healthService.getTodaysData();
          const { user, character } = get();
          
          if (healthData && user) {
            // Convert HealthData to FitnessData format
            const fitnessData: FitnessData = {
              steps: healthData.steps,
              calories: healthData.calories,
              activeMinutes: healthData.activeMinutes,
              workouts: get().todaysFitnessData?.workouts || [],
              date: healthData.date,
            };
            
            // Update local state
            get().updateFitnessData(fitnessData);
            
            // Save fitness data to Firebase for this user
            if (user.id) {
              await firestoreService.saveFitnessData(user.id, fitnessData);
            }
            
            // Calculate and award XP based on new data
            if (character && user.id) {
              const xpGained = healthService.calculateXP(healthData);
              
              // Only award XP if it's more than what we already have today
              const today = new Date().toDateString();
              const lastXPKey = `last_xp_date_${user.id}`;
              const lastXPAmountKey = `last_xp_amount_${user.id}`;
              
              const lastXPDate = await AsyncStorage.getItem(lastXPKey);
              const lastXP = await AsyncStorage.getItem(lastXPAmountKey);
              
              if (lastXPDate !== today || !lastXP || xpGained > parseInt(lastXP)) {
                const newXP = xpGained - (lastXP ? parseInt(lastXP) : 0);
                if (newXP > 0) {
                  get().addExperience(newXP);
                  
                  // Save character progress to Firebase
                  const updatedCharacter = get().character;
                  if (updatedCharacter) {
                    await firestoreService.updateCharacterXP(user.id, updatedCharacter.experience, updatedCharacter.level);
                  }
                  
                  await AsyncStorage.setItem(lastXPKey, today);
                  await AsyncStorage.setItem(lastXPAmountKey, xpGained.toString());
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to sync health data:', error);
          set({ error: 'Failed to sync health data' });
        }
      },

      // UI Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'fitquest-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        character: state.character,
        completedQuests: state.completedQuests,
        fitnessHistory: state.fitnessHistory,
      }),
    }
  )
);