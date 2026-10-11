export type Language = 'en' | 'bn' | 'hi' | 'as';

export type MultilingualText = {
  en: string;
  bn: string;
  hi: string;
  as?: string;
};

export interface Quote {
  text: string;
  subtext: string;
  source?: string;
}

export interface PromptCard {
  icon: string;
  text: string;
}

export interface CardItem {
  id: string;
  iconName: string;
  title: string;
  description: string;
  tag?: string;
}

export interface MemoryCard {
  id: number;
  pairId: string;
  name: MultilingualText;
  symbol: string;
  category: string;
  description: MultilingualText;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface ReminderItem {
  id: string;
  time: string;
  title: MultilingualText;
  subtitle?: MultilingualText;
  category: 'medicine' | 'hydration' | 'activity' | 'appointment';
  completed: boolean;
  icon: string;
}

export interface GameScoreRecord {
  id: string;
  timestamp: number;
  dateFormatted: string;
  gameType: string;
  score: number;
  matches: number;
  moves: number;
  accuracy: number;
  timeSpentSec: number;
  difficulty: string;
  language: Language;
}

export type CognitiveGameId =
  | 'cultural-match'
  | 'pattern-harmony'
  | 'daily-association'
  | 'my-home'
  | 'sort-it-out'
  | 'who-is-this';

export interface MyHomeLevelConfig {
  level: number;
  item: {
    symbol: string;
    name: MultilingualText;
    hint: MultilingualText;
  };
  correctRoomId: string;
  rooms: {
    id: string;
    symbol: string;
    name: MultilingualText;
  }[];
  explanation: MultilingualText;
}

export interface SortItem {
  id: string;
  symbol: string;
  name: MultilingualText;
  categoryId: string;
}

export interface SortCategory {
  id: string;
  symbol: string;
  name: MultilingualText;
}

export interface SortItOutLevelConfig {
  level: number;
  title: MultilingualText;
  description: MultilingualText;
  categories: SortCategory[];
  items: SortItem[];
}

export interface WhoIsThisLevelConfig {
  level: number;
  roleId: string;
  name: MultilingualText;
  relationTitle: MultilingualText;
  avatarSymbol: string;
  clue: MultilingualText;
  options: {
    id: string;
    symbol: string;
    label: MultilingualText;
  }[];
  warmNote: MultilingualText;
}

export interface GardenFlower {
  day: number;
  flowerName: MultilingualText;
  symbol: string;
  color: string;
  meaning: MultilingualText;
  bloomed: boolean;
  unlockedAt?: string;
}

export interface GameLevelStatus {
  level: number;
  unlocked: boolean;
  stars: number; // 0 to 3
  bestScore: number;
}

export interface CulturalItemDefinition {
  pairId: string;
  name: MultilingualText;
  symbol: string;
  category: string;
  description: MultilingualText;
}

export interface AssociationQuestion {
  id: string;
  title: MultilingualText;
  prompt: MultilingualText;
  culturalContext: MultilingualText;
  correctOptionId: string;
  options: {
    id: string;
    symbol: string;
    label: MultilingualText;
    detail: MultilingualText;
  }[];
}
