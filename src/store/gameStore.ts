import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, User, Quest, FitnessData } from '../types';

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
  
  // Quest Actions
  setQuests: (quests: Quest[]) => void;
  updateQuestProgress: (questId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  
  // Fitness Actions
  updateFitnessData: (data: FitnessData) => void;
  addWorkout: (workout: any) => void;
  
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
          if (!state.character) return state;
          
          const newExp = state.character.experience + amount;
          const expToNext = state.character.experienceToNext;
          
          if (newExp >= expToNext) {
            // Level up!
            const newLevel = state.character.level + 1;
            const newExpToNext = Math.floor(expToNext * 1.5); // Exponential growth
            
            return {
              character: {
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
              }
            };
          }
          
          return {
            character: {
              ...state.character,
              experience: newExp,
            }
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