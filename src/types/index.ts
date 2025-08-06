// Core Game Types
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  sportCategory: SportCategory;
  stats: CharacterStats;
  equipment: Equipment;
  cosmetics: Cosmetic[];
  avatar: Avatar;
  avatarUrl?: string; // Ready Player Me 3D avatar URL
  rpmUserId?: string; // Ready Player Me user ID for avatar management
  createdAt: Date;
  lastActive: Date;
}

export interface CharacterStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  agility: number;
  endurance: number;
  intelligence: number;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  accessories: Item[];
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  stats: Partial<CharacterStats>;
  description: string;
  icon: string;
}

export interface Avatar {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  outfit: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiresAt?: Date;
}

export interface FitnessData {
  steps: number;
  calories: number;
  activeMinutes: number;
  workouts: Workout[];
  date: Date;
}

export interface Workout {
  id: string;
  type: WorkoutType;
  duration: number; // in minutes
  intensity: WorkoutIntensity;
  caloriesBurned: number;
  completedAt: Date;
}

// Enums
export enum SportCategory {
  BASKETBALL = 'basketball',
  SOCCER = 'soccer',
  RUNNER = 'runner',
  CYCLIST = 'cyclist',
  SWIMMER = 'swimmer',
  TENNIS = 'tennis',
  GYM = 'gym',
  YOGA = 'yoga',
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum QuestType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SPECIAL = 'special',
  STORY = 'story',
}

export enum QuestDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXTREME = 'extreme',
}

export enum WorkoutType {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  FLEXIBILITY = 'flexibility',
  SPORTS = 'sports',
  WALKING = 'walking',
  RUNNING = 'running',
  CYCLING = 'cycling',
}

export enum WorkoutIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  EXTREME = 'extreme',
}

// Utility Types
export interface QuestRequirement {
  type: 'steps' | 'calories' | 'workout' | 'activeMinutes';
  amount: number;
  workoutType?: WorkoutType;
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'cosmetic';
  amount?: number;
  itemId?: string;
}

export interface Cosmetic {
  id: string;
  name: string;
  type: 'skin' | 'hair' | 'outfit' | 'accessory';
  unlocked: boolean;
  unlockedAt?: Date;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CharacterCreation: undefined;
  CharacterCustomization: undefined;
  ReadyPlayerMe: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Character: undefined;
  Quests: undefined;
  Social: undefined;
};