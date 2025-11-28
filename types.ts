
export enum Rarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  MYTHICAL = 'Mythical'
}

export enum StatType {
  STR = 'Strength', // Physical tasks
  INT = 'Intelligence', // Learning/Coding
  VIT = 'Vitality', // Health/Fitness
  AGI = 'Agility', // Speed/Efficiency
  LUCK = 'Luck', // Random events
  CHA = 'Charisma' // Social/Leadership
}

export enum Language {
  VI = 'vi',
  EN = 'en',
  JP = 'jp',
  CN = 'cn'
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: string; // F -> S
  rarity: Rarity;
  expReward: number;
  goldReward: number;
  statRewards: Partial<Record<StatType, number>>;
  isCompleted: boolean;
  type: 'Main' | 'Side' | 'Daily' | 'Sudden'; // Main = Roadmap, Side/Daily = User added
  realLifeTask: string;
}

export interface RoadmapTask {
  title: string;
  description: string;
  estimatedDays: number;
  difficulty: string;
  expReward: number;
}

export interface RoadmapPhase {
  phaseName: string;
  description: string;
  tasks: RoadmapTask[];
}

export interface Roadmap {
  goalName: string;
  totalDurationString: string;
  phases: RoadmapPhase[];
}

export interface PlayerStats {
  name: string;
  age: number;
  gender: string;
  profession: string;
  level: number;
  currentExp: number;
  maxExp: number;
  gold: number;
  title: string;
  isPremium: boolean;
  attributes: Record<StatType, number>;
}

export interface SystemLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'gain' | 'alert' | 'narrative';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
}