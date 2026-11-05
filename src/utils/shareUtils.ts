import {
  BowlingBall,
  OilPattern,
  UserPersonalConfig,
  MatchRecord,
  SavedTournament,
  PracticeDrillRecord,
  BowlingNote,
  AppSettings,
} from '../types/bowling';
import {
  loadSavedMatches,
  saveMatches,
  loadUserPersonalConfig,
  saveUserPersonalConfig,
  saveSavedBalls,
  loadSavedTournaments,
  saveSavedTournaments,
  loadPracticeDrills,
  savePracticeDrills,
  loadSavedNotes,
  saveNotes,
  loadAppSettings,
  saveAppSettings,
} from './storage';

/**
 * Sanitizes a string for safe use in file names
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * Shares a JSON file via Web Share API if supported with files,
 * or triggers a standard browser download.
 */
export async function shareOrDownloadJson(
  filename: string,
  dataObject: any,
  shareTitle?: string,
  shareText?: string
): Promise<{ sharedViaApi: boolean }> {
  const jsonStr = JSON.stringify(dataObject, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });

  // Check if Web Share API with files is supported (mobile browsers, Android, iOS Safari 15+)
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare
  ) {
    try {
      const file = new File([blob], filename, { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: shareTitle || filename,
          text: shareText || 'Поделиться данными StrikeZone Bowling Tracker',
          files: [file],
        });
        return { sharedViaApi: true };
      }
    } catch (err: any) {
      // User aborted share (AbortError) or share failed, fallback to download if not user cancel
      if (err.name === 'AbortError') {
        return { sharedViaApi: true };
      }
      console.warn('Web Share failed, falling back to download', err);
    }
  }

  // Fallback: programmatic <a> download
  triggerBlobDownload(blob, filename);
  return { sharedViaApi: false };
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

// =========================================================================
// 1. SINGLE ITEM EXPORT / SHARE
// =========================================================================

export async function shareSingleBall(ball: BowlingBall): Promise<{ sharedViaApi: boolean }> {
  const cleanBrand = sanitizeFileName(ball.brand || 'Custom');
  const cleanName = sanitizeFileName(ball.name || 'Ball');
  const filename = `Ball_${cleanBrand}_${cleanName}_${ball.weightLbs}lbs.json`;

  const payload = {
    format: 'strikezone_single_ball',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    ball: {
      ...ball,
    },
  };

  return shareOrDownloadJson(
    filename,
    payload,
    `Шар для боулинга: ${ball.name} (${ball.brand})`,
    `Характеристики, сверловка и параметры шара «${ball.name}» (${ball.weightLbs} lbs)`
  );
}

export async function shareSingleOilPattern(pattern: OilPattern): Promise<{ sharedViaApi: boolean }> {
  const cleanName = sanitizeFileName(pattern.name || 'Pattern');
  const filename = `Oil_Pattern_${cleanName}_${pattern.lengthFt}ft.json`;

  const payload = {
    format: 'strikezone_single_oil_pattern',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    pattern: {
      ...pattern,
    },
  };

  return shareOrDownloadJson(
    filename,
    payload,
    `Программа масла: ${pattern.name} (${pattern.lengthFt} ft)`,
    `Схема нанесения и профиль масла «${pattern.name}» (${pattern.lengthFt} ft)`
  );
}

// =========================================================================
// 2. SECTION EXPORT
// =========================================================================

export async function shareAllBalls(balls: BowlingBall[]): Promise<{ sharedViaApi: boolean }> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `Arsenal_All_Balls_${dateStr}.json`;

  const payload = {
    format: 'strikezone_balls_export',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    count: balls.length,
    balls,
  };

  return shareOrDownloadJson(
    filename,
    payload,
    `Арсенал шаров (${balls.length} шт.)`,
    `Полный арсенал шаров для боулинга со сверловками и параметрами (${balls.length} моделей)`
  );
}

export async function shareAllOilPatterns(patterns: OilPattern[]): Promise<{ sharedViaApi: boolean }> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `Oil_Patterns_Catalog_${dateStr}.json`;

  const payload = {
    format: 'strikezone_oil_patterns_export',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    count: patterns.length,
    patterns,
  };

  return shareOrDownloadJson(
    filename,
    payload,
    `Каталог программ масел (${patterns.length} шт.)`,
    `База программ нанесения масла с диаграммами и параметрами (${patterns.length} профилей)`
  );
}

// =========================================================================
// 3. SMART IMPORT / MERGE PARSER
// =========================================================================

export type ImportedContentType =
  | 'single_ball'
  | 'balls_list'
  | 'single_pattern'
  | 'patterns_list'
  | 'full_backup'
  | 'unknown';

export interface ParsedImportResult {
  type: ImportedContentType;
  balls?: BowlingBall[];
  patterns?: OilPattern[];
  backupData?: any;
  title: string;
}

export function parseImportFileContent(rawJson: string): ParsedImportResult {
  try {
    const data = JSON.parse(rawJson);

    // Full App Backup format
    if (data.format === 'strikezone_full_backup' || (data.matches && data.userConfig)) {
      return {
        type: 'full_backup',
        backupData: data,
        title: 'Полный бэкап дневника боулинга',
      };
    }

    // Single ball format
    if (data.format === 'strikezone_single_ball' && data.ball && data.ball.name) {
      return {
        type: 'single_ball',
        balls: [data.ball],
        title: `Шар «${data.ball.name}»`,
      };
    }

    // Multi-balls export format
    if (data.format === 'strikezone_balls_export' && Array.isArray(data.balls)) {
      return {
        type: 'balls_list',
        balls: data.balls,
        title: `Арсенал шаров (${data.balls.length} шт.)`,
      };
    }

    // Raw array of balls
    if (Array.isArray(data) && data.length > 0 && data[0].coverstock && data[0].name) {
      return {
        type: 'balls_list',
        balls: data,
        title: `Список шаров (${data.length} шт.)`,
      };
    }

    // Single oil pattern format
    if (data.format === 'strikezone_single_oil_pattern' && data.pattern && data.pattern.name) {
      return {
        type: 'single_pattern',
        patterns: [data.pattern],
        title: `Программа масла «${data.pattern.name}»`,
      };
    }

    // Multi-patterns export format
    if (data.format === 'strikezone_oil_patterns_export' && Array.isArray(data.patterns)) {
      return {
        type: 'patterns_list',
        patterns: data.patterns,
        title: `Каталог масел (${data.patterns.length} шт.)`,
      };
    }

    // Raw array of oil patterns
    if (Array.isArray(data) && data.length > 0 && typeof data[0].lengthFt === 'number' && data[0].name) {
      return {
        type: 'patterns_list',
        patterns: data,
        title: `Список программ масла (${data.length} шт.)`,
      };
    }

    // Direct single ball object
    if (data.coverstock && data.name && (data.brand || data.weightLbs)) {
      return {
        type: 'single_ball',
        balls: [data],
        title: `Шар «${data.name}»`,
      };
    }

    // Direct single pattern object
    if (typeof data.lengthFt === 'number' && data.name && data.category) {
      return {
        type: 'single_pattern',
        patterns: [data],
        title: `Программа масла «${data.name}»`,
      };
    }

    return { type: 'unknown', title: 'Неизвестный формат данных' };
  } catch (e) {
    console.error('Failed to parse import JSON', e);
    return { type: 'unknown', title: 'Некорректный JSON файл' };
  }
}

/**
 * Merges incoming balls into the user's personal arsenal.
 * Replaces or avoids ID collisions by generating fresh IDs for duplicates.
 */
export function mergeImportedBalls(
  existingBalls: BowlingBall[],
  incomingBalls: BowlingBall[]
): { updatedBalls: BowlingBall[]; addedCount: number; names: string[] } {
  const existingIds = new Set(existingBalls.map((b) => b.id));
  const newBalls: BowlingBall[] = [];
  const addedNames: string[] = [];

  for (const rawBall of incomingBalls) {
    if (!rawBall || !rawBall.name) continue;

    let targetId = rawBall.id;
    // Generate new unique ID if ID is missing or already taken
    if (!targetId || existingIds.has(targetId)) {
      targetId = `ball_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    const formattedBall: BowlingBall = {
      ...rawBall,
      id: targetId,
      name: rawBall.name.trim(),
      brand: rawBall.brand || 'Custom',
      weightLbs: rawBall.weightLbs || 15,
      coverstock: rawBall.coverstock || 'Solid',
      color: rawBall.color || rawBall.primaryColor || '#b91c1c',
      isPrimaryStrikeBall: false, // Don't override user's main ball
      isSpareBall: !!rawBall.isSpareBall,
    };

    existingIds.add(targetId);
    newBalls.push(formattedBall);
    addedNames.push(formattedBall.name);
  }

  const updatedBalls = [...existingBalls, ...newBalls];
  return { updatedBalls, addedCount: newBalls.length, names: addedNames };
}

/**
 * Merges incoming oil patterns into user's personal config.
 * Replaces or avoids ID collisions.
 */
export function mergeImportedOilPatterns(
  existingPatterns: OilPattern[],
  incomingPatterns: OilPattern[]
): { updatedPatterns: OilPattern[]; addedCount: number; names: string[] } {
  const existingIds = new Set(existingPatterns.map((p) => p.id));
  const newPatterns: OilPattern[] = [];
  const addedNames: string[] = [];

  for (const rawPattern of incomingPatterns) {
    if (!rawPattern || !rawPattern.name) continue;

    let targetId = rawPattern.id;
    if (!targetId || existingIds.has(targetId)) {
      targetId = `oil_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    const formattedPattern: OilPattern = {
      ...rawPattern,
      id: targetId,
      name: rawPattern.name.trim(),
      category: rawPattern.category || 'House',
      lengthFt: rawPattern.lengthFt || 41,
    };

    existingIds.add(targetId);
    newPatterns.push(formattedPattern);
    addedNames.push(formattedPattern.name);
  }

  const updatedPatterns = [...existingPatterns, ...newPatterns];
  return { updatedPatterns, addedCount: newPatterns.length, names: addedNames };
}

// =========================================================================
// 4. FULL BACKUP & RESTORATION
// =========================================================================

export interface FullAppBackupPayload {
  format: 'strikezone_full_backup';
  version: '2.0';
  exportedAt: string;
  appName: string;
  userConfig: UserPersonalConfig;
  matches: MatchRecord[];
  savedTournaments: SavedTournament[];
  practiceDrills: PracticeDrillRecord[];
  notes: BowlingNote[];
  settings: AppSettings;
}

export function generateFullAppBackup(): { filename: string; payload: FullAppBackupPayload } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `Bowling_Diary_Backup_${dateStr}.json`;

  const payload: FullAppBackupPayload = {
    format: 'strikezone_full_backup',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    appName: 'StrikeZone Bowling Tracker',
    userConfig: loadUserPersonalConfig(),
    matches: loadSavedMatches(),
    savedTournaments: loadSavedTournaments(),
    practiceDrills: loadPracticeDrills(),
    notes: loadSavedNotes(),
    settings: loadAppSettings(),
  };

  return { filename, payload };
}

export function downloadFullAppBackup(): void {
  const { filename, payload } = generateFullAppBackup();
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerBlobDownload(blob, filename);
}

/**
 * Restores all application data from a full backup file.
 * Mode:
 * - 'replace': Overwrites current localStorage completely with backup data
 * - 'merge': Merges items without duplicating existing records
 */
export function restoreFullAppBackup(
  backup: FullAppBackupPayload | any,
  mode: 'replace' | 'merge'
): {
  success: boolean;
  message: string;
  restoredStats: {
    matchesCount: number;
    tournamentsCount: number;
    ballsCount: number;
    patternsCount: number;
  };
} {
  try {
    const currentConfig = loadUserPersonalConfig();
    const currentMatches = loadSavedMatches();
    const currentTournaments = loadSavedTournaments();
    const currentDrills = loadPracticeDrills();
    const currentNotes = loadSavedNotes();

    const rawConfig = backup.userConfig || currentConfig;
    const resolvedBackupBalls: BowlingBall[] = Array.isArray(rawConfig.balls)
      ? rawConfig.balls
      : Array.isArray((backup as any).balls)
      ? (backup as any).balls
      : [];

    const backupConfig: UserPersonalConfig = {
      ...currentConfig,
      ...rawConfig,
      balls: resolvedBackupBalls.map((b) => ({
        ...b,
        weightLbs: b.weightLbs || 15,
        coverstock: b.coverstock || 'Solid',
        color: b.color || b.primaryColor || '#b91c1c',
        primaryColor: b.primaryColor || b.color || '#b91c1c',
      })),
      oilPatterns: Array.isArray(rawConfig.oilPatterns) ? rawConfig.oilPatterns : [],
      centers: Array.isArray(rawConfig.centers) ? rawConfig.centers : [],
    };

    const rawMatches = Array.isArray(backup.matches) ? backup.matches : [];
    const backupMatches: MatchRecord[] = rawMatches.map((m: any) => ({
      ...m,
      players: Array.isArray(m.players) ? m.players : [],
      includeInStats: m.includeInStats !== false,
      tournamentType: m.tournamentType || 'single',
    }));

    const rawTournaments: any[] = Array.isArray(backup.savedTournaments)
      ? backup.savedTournaments
      : Array.isArray(backup.tournaments)
      ? backup.tournaments
      : [];
    const backupTournaments: SavedTournament[] = rawTournaments.map((t: any) => ({
      ...t,
      stages: Array.isArray(t.stages) ? t.stages : [],
      tournamentType: t.tournamentType || (Array.isArray(t.stages) && t.stages.length > 0 ? 'series' : 'single'),
      includeInStats: t.includeInStats !== false,
    }));

    const backupDrills: PracticeDrillRecord[] = Array.isArray(backup.practiceDrills) ? backup.practiceDrills : [];
    const backupNotes: BowlingNote[] = Array.isArray(backup.notes) ? backup.notes : [];
    const backupSettings: AppSettings = backup.settings || loadAppSettings();

    if (mode === 'replace') {
      // 1. Total replacement
      saveUserPersonalConfig(backupConfig);
      saveSavedBalls(backupConfig.balls || []);
      saveMatches(backupMatches);
      saveSavedTournaments(backupTournaments);
      savePracticeDrills(backupDrills);
      saveNotes(backupNotes);
      saveAppSettings(backupSettings);

      return {
        success: true,
        message: 'Полное восстановление успешно завершено!',
        restoredStats: {
          matchesCount: backupMatches.length,
          tournamentsCount: backupTournaments.length,
          ballsCount: backupConfig.balls?.length || 0,
          patternsCount: backupConfig.oilPatterns?.length || 0,
        },
      };
    } else {
      // 2. Intelligent merge
      // A. Matches (deduplicate by id)
      const matchMap = new Map<string, MatchRecord>();
      for (const m of currentMatches) matchMap.set(m.id, m);
      for (const m of backupMatches) {
        if (!matchMap.has(m.id)) {
          matchMap.set(m.id, m);
        }
      }
      const mergedMatches = Array.from(matchMap.values());
      saveMatches(mergedMatches);

      // B. Tournaments (deduplicate by id)
      const tournMap = new Map<string, SavedTournament>();
      for (const t of currentTournaments) tournMap.set(t.id, t);
      for (const t of backupTournaments) {
        if (!tournMap.has(t.id)) {
          tournMap.set(t.id, t);
        }
      }
      const mergedTournaments = Array.from(tournMap.values());
      saveSavedTournaments(mergedTournaments);

      // C. Practice Drills
      const drillMap = new Map<string, PracticeDrillRecord>();
      for (const d of currentDrills) drillMap.set(d.id, d);
      for (const d of backupDrills) {
        if (!drillMap.has(d.id)) {
          drillMap.set(d.id, d);
        }
      }
      savePracticeDrills(Array.from(drillMap.values()));

      // D. Notes
      const noteMap = new Map<string, BowlingNote>();
      for (const n of currentNotes) noteMap.set(n.id, n);
      for (const n of backupNotes) {
        if (!noteMap.has(n.id)) {
          noteMap.set(n.id, n);
        }
      }
      saveNotes(Array.from(noteMap.values()));

      // E. User Config (merge balls, patterns, centers)
      const mergedBallsResult = mergeImportedBalls(currentConfig.balls || [], backupConfig.balls || []);
      const mergedPatternsResult = mergeImportedOilPatterns(
        currentConfig.oilPatterns || [],
        backupConfig.oilPatterns || []
      );

      // Centers merge
      const centerMap = new Map<string, any>();
      for (const c of currentConfig.centers || []) centerMap.set(c.id, c);
      for (const c of backupConfig.centers || []) {
        if (!centerMap.has(c.id)) centerMap.set(c.id, c);
      }

      const mergedConfig: UserPersonalConfig = {
        ...currentConfig,
        balls: mergedBallsResult.updatedBalls,
        oilPatterns: mergedPatternsResult.updatedPatterns,
        centers: Array.from(centerMap.values()),
        activeBallId: currentConfig.activeBallId || mergedBallsResult.updatedBalls[0]?.id,
        activeOilPatternId: currentConfig.activeOilPatternId || mergedPatternsResult.updatedPatterns[0]?.id,
      };

      saveUserPersonalConfig(mergedConfig);
      saveSavedBalls(mergedConfig.balls);

      return {
        success: true,
        message: 'Данные успешно объединены!',
        restoredStats: {
          matchesCount: mergedMatches.length,
          tournamentsCount: mergedTournaments.length,
          ballsCount: mergedConfig.balls.length,
          patternsCount: mergedConfig.oilPatterns.length,
        },
      };
    }
  } catch (err: any) {
    console.error('Failed to restore backup', err);
    return {
      success: false,
      message: err?.message || 'Ошибка при чтении или сохранении бэкапа',
      restoredStats: { matchesCount: 0, tournamentsCount: 0, ballsCount: 0, patternsCount: 0 },
    };
  }
}
