import {
  MatchRecord,
  PlayerGame,
  BowlingBall,
  OilPattern,
  BowlingCenter,
  UserPersonalConfig,
  TournamentConfig,
  AppSettings,
  AppTheme,
  SavedTournament,
  PracticeDrillRecord,
  BowlingNote,
} from '../types/bowling';
import { createEmptyPlayerGame, recordRoll } from './bowlingEngine';

const STORAGE_KEY_MATCHES = 'strikezone_matches_v1';
const STORAGE_KEY_ACTIVE_MATCH = 'strikezone_active_match_v1';
const STORAGE_KEY_SOUND_MUTED = 'strikezone_sound_muted';
const STORAGE_KEY_USER_CONFIG = 'strikezone_user_config_v1';
const STORAGE_KEY_SAVED_TOURNAMENTS = 'strikezone_saved_tournaments_v1';
const STORAGE_KEY_PRACTICE_DRILLS = 'strikezone_practice_drills_v1';
const STORAGE_KEY_NOTES = 'strikezone_bowler_notes_v1';

export const DEFAULT_BALLS: BowlingBall[] = [];

export const KEGEL_SAMPLE_DIAGRAM_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 580" width="900" height="580" style="background:%230c0a09;font-family:sans-serif;">
  <rect width="900" height="580" fill="%230c0a09"/>
  <!-- Header -->
  <rect x="24" y="20" width="852" height="70" rx="12" fill="%231c1917" stroke="%23292524" stroke-width="2"/>
  <text x="44" y="52" fill="%23f59e0b" font-size="20" font-weight="900" letter-spacing="1">KEGEL OIL PATTERN GRAPH &amp; SCHEMATIC</text>
  <text x="44" y="74" fill="%23a8a29e" font-size="13">Main Street (41 ft) · Challenge Category · Volume: 19.3 mL · Ratio: 3.6:1</text>
  <rect x="740" y="35" width="116" height="40" rx="8" fill="%2306b6d4" fill-opacity="0.2" stroke="%2306b6d4"/>
  <text x="798" y="60" fill="%2322d3ee" font-size="13" font-weight="700" text-anchor="middle">41 FT PATTERN</text>

  <!-- Lane Board Distribution (1 to 39) -->
  <rect x="24" y="105" width="540" height="450" rx="12" fill="%23171717" stroke="%23292524"/>
  <text x="44" y="135" fill="%23f4f4f5" font-size="14" font-weight="700">COMPOSITE OIL GRAPH (Boards 1-39)</text>
  <text x="44" y="153" fill="%2371717a" font-size="11">Units of oil across lane cross-section</text>

  <!-- Grid lines -->
  <line x1="50" y1="360" x2="530" y2="360" stroke="%2327272a" stroke-width="1"/>
  <line x1="50" y1="300" x2="530" y2="300" stroke="%2327272a" stroke-width="1"/>
  <line x1="50" y1="240" x2="530" y2="240" stroke="%2327272a" stroke-width="1"/>
  <line x1="50" y1="180" x2="530" y2="180" stroke="%2327272a" stroke-width="1"/>

  <text x="35" y="364" fill="%2371717a" font-size="10" text-anchor="end">20u</text>
  <text x="35" y="304" fill="%2371717a" font-size="10" text-anchor="end">40u</text>
  <text x="35" y="244" fill="%2371717a" font-size="10" text-anchor="end">60u</text>
  <text x="35" y="184" fill="%2371717a" font-size="10" text-anchor="end">80u</text>

  <!-- Oil Profile Curve (Crown) -->
  <path d="M 50 400 C 130 395, 170 380, 210 270 C 250 170, 290 160, 290 160 C 290 160, 330 170, 370 270 C 410 380, 450 395, 530 400 Z" fill="url(%23oilGrad)" opacity="0.85" stroke="%2306b6d4" stroke-width="2"/>

  <!-- Board markers -->
  <line x1="50" y1="410" x2="530" y2="410" stroke="%233f3f46" stroke-width="1.5"/>
  <text x="50" y="430" fill="%23a1a1aa" font-size="11" text-anchor="middle">1L</text>
  <text x="110" y="430" fill="%23a1a1aa" font-size="11" text-anchor="middle">5</text>
  <text x="170" y="430" fill="%23a1a1aa" font-size="11" text-anchor="middle">10</text>
  <text x="230" y="430" fill="%23a1a1aa" font-size="11" text-anchor="middle">15</text>
  <text x="290" y="430" fill="%23f59e0b" font-weight="700" font-size="12" text-anchor="middle">20 (Центр)</text>
  <text x="350" y="430" fill="%23a1a1aa" font-size="11" text-anchor="middle">15</text>
  <text x="410" y="430" fill="%23a1a1aa" font-size="11" text-anchor="middle">10</text>
  <text x="470" y="430" fill="%23a1a1aa" font-size="11" text-anchor="middle">5</text>
  <text x="530" y="430" fill="%23a1a1aa" font-size="11" text-anchor="middle">1R</text>

  <!-- Spec labels bottom -->
  <rect x="50" y="460" width="480" height="75" rx="8" fill="%23262626"/>
  <text x="70" y="488" fill="%23a8a29e" font-size="12">Forward Oil (Вперёд): <tspan fill="%2322d3ee" font-weight="700">8.50 mL</tspan></text>
  <text x="70" y="515" fill="%23a8a29e" font-size="12">Reverse Oil (Назад): <tspan fill="%23f59e0b" font-weight="700">10.80 mL</tspan></text>
  <text x="310" y="488" fill="%23a8a29e" font-size="12">Total Volume: <tspan fill="%2310b981" font-weight="700">19.30 mL</tspan></text>
  <text x="310" y="515" fill="%23a8a29e" font-size="12">Track Ratio: <tspan fill="%23ec4899" font-weight="700">3.6:1 Challenge</tspan></text>

  <!-- 3D Lane Overhead Schematic -->
  <rect x="580" y="105" width="296" height="450" rx="12" fill="%23171717" stroke="%23292524"/>
  <text x="600" y="135" fill="%23f4f4f5" font-size="14" font-weight="700">LANE TOP VIEW (60 ft)</text>
  <text x="600" y="153" fill="%2371717a" font-size="11">Oil taper from foul line to 41 ft</text>

  <!-- Lane board simulation -->
  <rect x="630" y="175" width="196" height="340" rx="4" fill="%23422006" stroke="%2378350f" stroke-width="2"/>
  <!-- Arrows line -->
  <line x1="630" y1="230" x2="826" y2="230" stroke="%23b45309" stroke-dasharray="4,4"/>
  <text x="635" y="225" fill="%23d97706" font-size="9">Стрелки (15 ft)</text>

  <!-- Oil Zone Gradient -->
  <rect x="634" y="179" width="188" height="240" fill="url(%23laneOilGrad)" opacity="0.9"/>
  <!-- Oil cut off line at 41 ft -->
  <line x1="630" y1="419" x2="826" y2="419" stroke="%2306b6d4" stroke-width="2.5"/>
  <text x="728" y="435" fill="%2322d3ee" font-size="11" font-weight="bold" text-anchor="middle">Буфер / Конец масла (41 ft)</text>

  <!-- Dry backend -->
  <rect x="634" y="420" width="188" height="92" fill="%2378350f" opacity="0.3"/>
  <text x="728" y="475" fill="%23fde047" font-size="12" font-weight="bold" text-anchor="middle">СУХОЙ БЭКЭНД (41-60 ft)</text>
  <text x="728" y="495" fill="%23cbd5e1" font-size="10" text-anchor="middle">Зона резкого брейкпоинта</text>

  <defs>
    <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="%2306b6d4" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="%230284c7" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="%230369a1" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="laneOilGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="%230284c7" stop-opacity="0.95"/>
      <stop offset="70%" stop-color="%230369a1" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="%23082f49" stop-opacity="0.2"/>
    </linearGradient>
  </defs>
</svg>`;

export const DEFAULT_OIL_PATTERNS: OilPattern[] = [];

export const DEFAULT_CENTERS: BowlingCenter[] = [];

export const DEFAULT_USER_CONFIG: UserPersonalConfig = {
  name: 'Игрок',
  style: 'Правша',
  hand: 'Правша',
  avatarColor: '#f59e0b',
  bio: '',
  balls: [],
  oilPatterns: [],
  centers: [],
  activeBallId: undefined,
  activeOilPatternId: undefined,
  activeCenterId: undefined,
};

export function loadUserPersonalConfig(): UserPersonalConfig {
  if (typeof window === 'undefined') return DEFAULT_USER_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_CONFIG);
    if (!raw) {
      saveUserPersonalConfig(DEFAULT_USER_CONFIG);
      return DEFAULT_USER_CONFIG;
    }
    const parsed = JSON.parse(raw);
    const resolvedStyle = parsed.style || (parsed.hand === 'Левша' ? 'Левша' : 'Правша');

    return {
      ...DEFAULT_USER_CONFIG,
      ...parsed,
      style: resolvedStyle,
      balls: Array.isArray(parsed.balls) ? parsed.balls : [],
      oilPatterns: Array.isArray(parsed.oilPatterns) ? parsed.oilPatterns : [],
      centers: Array.isArray(parsed.centers) ? parsed.centers : [],
    };
  } catch (err) {
    console.error('Failed to load user config', err);
    return DEFAULT_USER_CONFIG;
  }
}

export function saveUserPersonalConfig(config: UserPersonalConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_USER_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save user config', err);
  }
}

export function loadSavedMatches(): MatchRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCHES);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Deduplicate by match ID to guarantee every match has a unique key
    const seen = new Set<string>();
    const deduplicated: MatchRecord[] = [];
    for (const item of parsed) {
      if (item && item.id) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          deduplicated.push(item);
        }
      }
    }

    if (deduplicated.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(deduplicated));
    }

    return deduplicated;
  } catch (err) {
    console.error('Failed to load matches from localStorage', err);
    return [];
  }
}

export function saveMatches(matches: MatchRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Ensure strict uniqueness of IDs
    const seen = new Set<string>();
    const deduplicated = matches.filter((m) => {
      if (!m || !m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(deduplicated));
  } catch (err) {
    console.error('Failed to save matches', err);
  }
}

export function addMatchToHistory(match: MatchRecord): MatchRecord[] {
  const current = loadSavedMatches();
  // If match with this ID already exists, update it in place; otherwise add to beginning
  const existingIdx = current.findIndex((m) => m.id === match.id);
  let updated: MatchRecord[];
  if (existingIdx !== -1) {
    updated = current.map((m, idx) => (idx === existingIdx ? match : m));
  } else {
    updated = [match, ...current];
  }
  saveMatches(updated);
  return updated;
}

export function deleteMatchFromHistory(matchId: string): MatchRecord[] {
  const current = loadSavedMatches();
  const updated = current.filter((m) => m.id !== matchId);
  saveMatches(updated);
  return updated;
}

export function loadActiveMatch(): MatchRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_MATCH);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load active match', err);
    return null;
  }
}

export function saveActiveMatch(match: MatchRecord | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (match === null) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_MATCH);
    } else {
      localStorage.setItem(STORAGE_KEY_ACTIVE_MATCH, JSON.stringify(match));
    }
  } catch (err) {
    console.error('Failed to save active match', err);
  }
}

export function exportMatchesToJson(): string {
  const matches = loadSavedMatches();
  const userConfig = loadUserPersonalConfig();
  const tournaments = loadSavedTournaments();
  const practiceDrills = loadPracticeDrills();
  const notes = loadSavedNotes();
  const settings = loadAppSettings();
  return JSON.stringify(
    {
      appName: 'StrikeZone Bowling Tracker',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      userConfig,
      matches,
      tournaments,
      practiceDrills,
      notes,
      settings,
    },
    null,
    2
  );
}

export function importMatchesFromJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.matches && Array.isArray(parsed.matches)) {
      saveMatches(parsed.matches);
      if (parsed.userConfig) {
        saveUserPersonalConfig(parsed.userConfig);
      }
      if (parsed.tournaments && Array.isArray(parsed.tournaments)) {
        saveSavedTournaments(parsed.tournaments);
      }
      if (parsed.practiceDrills && Array.isArray(parsed.practiceDrills)) {
        savePracticeDrills(parsed.practiceDrills);
      }
      if (parsed.notes && Array.isArray(parsed.notes)) {
        saveNotes(parsed.notes);
      }
      if (parsed.settings) {
        saveAppSettings(parsed.settings);
      }
      return true;
    } else if (Array.isArray(parsed)) {
      saveMatches(parsed);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}

export function loadSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_SOUND_MUTED) === 'true';
}

export function saveSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SOUND_MUTED, muted ? 'true' : 'false');
}

const STORAGE_KEY_ACTIVE_TOURNAMENT = 'strikezone_active_tournament_v1';

export function loadActiveTournament(): TournamentConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_TOURNAMENT);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load active tournament', err);
    return null;
  }
}

export function saveActiveTournament(tournament: TournamentConfig | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (tournament === null) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_TOURNAMENT);
    } else {
      localStorage.setItem(STORAGE_KEY_ACTIVE_TOURNAMENT, JSON.stringify(tournament));
    }
  } catch (err) {
    console.error('Failed to save active tournament', err);
  }
}

const STORAGE_KEY_SETTINGS = 'strikezone_settings_v1';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  soundEnabled: true,
  theme: 'dark',
  language: 'ru',
};

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      const muted = localStorage.getItem(STORAGE_KEY_SOUND_MUTED) === 'true';
      return {
        ...DEFAULT_APP_SETTINGS,
        soundEnabled: !muted,
      };
    }
    const parsed = JSON.parse(raw);
    const validTheme: AppTheme = parsed.theme === 'light' ? 'light' : 'dark';
    return {
      ...DEFAULT_APP_SETTINGS,
      ...parsed,
      theme: validTheme,
    };
  } catch (err) {
    console.error('Failed to load app settings', err);
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEY_SOUND_MUTED, settings.soundEnabled ? 'false' : 'true');
  } catch (err) {
    console.error('Failed to save app settings', err);
  }
}

// =========================================================================
// SAVED TOURNAMENTS (Regular leagues, tournaments, custom events)
// =========================================================================

export const DEFAULT_SAVED_TOURNAMENTS: SavedTournament[] = [];

export function loadSavedTournaments(): SavedTournament[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_TOURNAMENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load saved tournaments', e);
    return [];
  }
}

export function saveSavedTournaments(tournaments: SavedTournament[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_TOURNAMENTS, JSON.stringify(tournaments));
  } catch (e) {
    console.error('Failed to save saved tournaments', e);
  }
}

// =========================================================================
// PRACTICE DRILLS (Spare & Split Drill Records)
// =========================================================================

export const DEFAULT_PRACTICE_DRILLS: PracticeDrillRecord[] = [];

export function loadPracticeDrills(): PracticeDrillRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRACTICE_DRILLS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load practice drills', e);
    return [];
  }
}

export function savePracticeDrills(drills: PracticeDrillRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PRACTICE_DRILLS, JSON.stringify(drills));
  } catch (e) {
    console.error('Failed to save practice drills', e);
  }
}

export const DEFAULT_NOTES: BowlingNote[] = [];

export function loadSavedNotes(): BowlingNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load bowling notes', e);
    return [];
  }
}

export function saveNotes(notes: BowlingNote[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save bowling notes', e);
  }
}

export function addOrUpdateNote(note: BowlingNote): BowlingNote[] {
  const current = loadSavedNotes();
  const existingIdx = current.findIndex((n) => n.id === note.id);
  let updated: BowlingNote[];
  if (existingIdx !== -1) {
    updated = current.map((n, i) => (i === existingIdx ? { ...note, updatedAt: Date.now() } : n));
  } else {
    updated = [{ ...note, createdAt: Date.now(), updatedAt: Date.now() }, ...current];
  }
  saveNotes(updated);
  return updated;
}

export function deleteNote(noteId: string): BowlingNote[] {
  const current = loadSavedNotes();
  const updated = current.filter((n) => n.id !== noteId);
  saveNotes(updated);
  return updated;
}



