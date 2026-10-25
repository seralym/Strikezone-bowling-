export type PinNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface BowlingBall {
  id: string;
  name: string;
  brand: string;
  weightLbs: number;
  coverstock: 'Solid' | 'Pearl' | 'Hybrid' | 'Urethane' | 'Plastic';
  isPrimaryStrikeBall: boolean;
  isSpareBall: boolean;
  color: string;
  notes?: string;
  // Ball visual properties & specs:
  presetId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  finish?: string;
  coreType?: 'Symmetrical' | 'Asymmetrical';
  coreName?: string;
  coverstockName?: string;
  rg?: number;
  diff?: number;
  mb?: number; // Mass bias / intermediate differential (for Asym)
  recommendedOil?: string;
  // Drilling parameters & layout:
  drillingLayout?: string; // e.g. "Pin Up 4x4x2", "Dual Angle 60° x 4" x 35°", "2LS #1"
  pinToPapDistance?: string; // e.g. "4.5 inches"
  drillingNotes?: string; // e.g. "Thumb pitch 1/4 reverse, Switch Grip sleeve"
}

export interface OilPattern {
  id: string;
  name: string;
  competitionName?: string;
  lengthFt: number; // e.g. 41 ft
  category: 'House' | 'Sport' | 'Challenge';
  volumeMl?: number; // e.g. 24.5 mL
  ratio?: string; // e.g. "8.5:1", "3:1", "1:1"
  notes?: string;
  imageUrl?: string; // Base64 data URL or image URL for oil pattern diagram / chart screenshot
  imageName?: string;
}

export interface BowlingCenter {
  id: string;
  name: string;
  city?: string;
  address?: string;
  lanesCount?: number;
  surface?: 'Синтетика (Synthetic)' | 'Дерево (Wood)';
}

export interface Roll {
  pinsKnocked: number; // 0..10
  pinsHit: PinNumber[]; // specific pins knocked down on this roll
  standingAfter: PinNumber[]; // pins remaining standing after this roll
  isFoul: boolean;
  displayValue: string; // 'X', '/', '9', '-', 'F'
  timestamp: number;
  ballUsedId?: string;
  ballUsedName?: string;
}

export interface Frame {
  frameNumber: number; // 1 to 10
  rolls: Roll[];
  score: number | null; // Cumulative score up to this frame (null if pending bonus rolls)
  isStrike: boolean;
  isSpare: boolean;
  isOpen: boolean;
  isSplit: boolean;
  splitName?: string;
}

export interface PlayerGame {
  id: string;
  playerName: string;
  frames: Frame[];
  totalScore: number;
  maxPossibleScore: number;
  strikesCount: number;
  sparesCount: number;
  openFramesCount: number;
  splitsCount: number;
  splitsConvertedCount: number;
  isFinished: boolean;
}

export interface MatchRecord {
  id: string;
  date: string; // ISO string
  title?: string;
  competitionName?: string;
  tournamentId?: string;
  tournamentName?: string;
  tournamentStartDate?: string;
  tournamentEndDate?: string;
  laneNumber?: number;
  centerId?: string;
  centerName?: string;
  oilPatternId?: string;
  oilPatternName?: string;
  ballId?: string;
  ballName?: string;
  // Strictly personal app for the single user:
  players: PlayerGame[]; // kept as 1-element array for backward compatibility
  notes?: string;
}

export interface TournamentConfig {
  tournamentId?: string;
  tournamentName: string;
  centerId: string;
  centerName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  oilPatternId: string;
  oilPatternName: string;
  ballId: string;
  ballName: string;
  laneNumber?: number;
}

export type BowlerStyle =
  | 'Правша'
  | 'Левша'
  | 'Двурукий правша'
  | 'Двурукий левша'
  | 'Двурукий игрок';

export type AppLanguage = 'ru' | 'en' | 'de' | 'fr' | 'es' | 'pt';

export type AppTheme = 'dark' | 'obsidian' | 'retro' | 'slate';

export interface AppSettings {
  soundEnabled: boolean;
  theme: AppTheme;
  language: AppLanguage;
}

export interface BowlerProfileStats {
  playerName: string;
  gamesPlayed: number;
  averageScore: number;
  highScore: number;
  lowScore: number;
  totalPinfall: number;
  strikeRate: number; // percentage 0-100
  spareRate: number; // percentage 0-100
  cleanGameRate: number; // percentage 0-100
  openFrameRate: number; // percentage 0-100
  splitConversionRate: number; // percentage 0-100
  scoreHistory: { date: string; score: number; matchId: string }[];
  frameAverageScores: number[]; // 10 items (avg score per frame)
  scoreBuckets: { range: string; count: number; percentage: number }[];
  pinLeaveHeatmap: { pin: PinNumber; leavesCount: number; leavePercentage: number }[];
  commonLeaves: { pins: PinNumber[]; name: string; count: number; convertedCount: number }[];
  ballStats?: { ballName: string; games: number; averageScore: number; highScore: number }[];
  patternStats?: { patternName: string; games: number; averageScore: number; highScore: number }[];
  centerStats?: { centerName: string; games: number; averageScore: number; highScore: number }[];
}

export interface UserPersonalConfig {
  name: string;
  style: BowlerStyle;
  hand?: string; // legacy backward compatibility
  avatarColor?: string;
  avatarUrl?: string; // Profile photo Data URL
  bio?: string;
  balls: BowlingBall[];
  oilPatterns: OilPattern[];
  centers: BowlingCenter[];
  activeBallId?: string;
  activeOilPatternId?: string;
  activeCenterId?: string;
}

export type MainAppView =
  | 'home'
  | 'game'
  | 'practice'
  | 'tournaments'
  | 'arsenal'
  | 'centers'
  | 'patterns'
  | 'profile'
  | 'notes'
  | 'settings';

export interface BowlingNote {
  id: string;
  title: string;
  content: string;
  category: 'Тренировка' | 'Турнир' | 'Техника и хват' | 'Шары и арсенал' | 'Паттерн масла' | 'Общее';
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  tags?: string[];
  relatedBallId?: string;
  relatedOilPatternId?: string;
  relatedCenterId?: string;
}

export interface SavedTournament {
  id: string;
  name: string;
  centerId?: string;
  centerName?: string;
  startDate?: string;
  endDate?: string;
  oilPatternId?: string;
  oilPatternName?: string;
  ballId?: string;
  ballName?: string;
  laneNumber?: number;
  format?: string;
  isRegular?: boolean;
  status?: 'active' | 'upcoming' | 'completed';
  notes?: string;
  createdAt?: string;
  // Completion / Final recap fields:
  finalPlacement?: string; // e.g. "1-е место 🥇", "Топ-8", "3-е место 🥉"
  completionNotes?: string; // Summary / commentary on the tournament
  completedAt?: string; // ISO date string
}

export interface PracticeDrillRecord {
  id: string;
  date: string;
  timestamp: number;
  drillName: string;
  targetPins: PinNumber[];
  attemptsCount: number;
  convertedCount: number;
  missedCount: number;
  conversionRate: number; // 0..100
  centerId?: string;
  centerName?: string;
  oilPatternId?: string;
  oilPatternName?: string;
  ballUsedId?: string;
  ballUsedName?: string;
  notes?: string;
}


