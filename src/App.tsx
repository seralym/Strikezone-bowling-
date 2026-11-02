/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  MatchRecord,
  PlayerGame,
  PinNumber,
  UserPersonalConfig,
  TournamentConfig,
  AppSettings,
  Roll,
  Frame,
} from './types/bowling';
import {
  createEmptyPlayerGame,
  getStandingPinsForNextRoll,
  isFrameComplete,
  recordRoll,
  undoLastRoll,
  checkIsSplit,
  calculateGameScores,
  ALL_PINS,
} from './utils/bowlingEngine';
import {
  loadSavedMatches,
  saveMatches,
  addMatchToHistory,
  deleteMatchFromHistory,
  loadActiveMatch,
  saveActiveMatch,
  loadActiveTournament,
  saveActiveTournament,
  exportMatchesToJson,
  importMatchesFromJson,
  loadUserPersonalConfig,
  saveUserPersonalConfig,
  loadAppSettings,
  saveAppSettings,
  loadSavedTournaments,
  saveSavedTournaments,
  loadPracticeDrills,
  savePracticeDrills,
} from './utils/storage';
import {
  playPinCrashSound,
  playSinglePinSound,
  playSpareSound,
  playGutterSound,
  setSoundMuted,
} from './utils/audio';
import { getTranslation } from './utils/i18n';
import {
  MainAppView,
  SavedTournament,
  PracticeDrillRecord,
} from './types/bowling';

import { DrawerMenu } from './components/DrawerMenu';
import { HomeScreen } from './components/HomeScreen';
import { PracticeDrillView } from './components/PracticeDrillView';
import { TournamentsHub } from './components/TournamentsHub';
import { ArsenalManager } from './components/ArsenalManager';
import { CentersManager } from './components/CentersManager';
import { OilPatternsManager } from './components/OilPatternsManager';
import { PlayerProfile } from './components/PlayerProfile';
import { BowlingNotes } from './components/BowlingNotes';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { SettingsView } from './components/SettingsView';
import { TournamentSetupModal } from './components/TournamentSetupModal';
import { GameChoiceModal } from './components/GameChoiceModal';
import { ScoreBoard } from './components/ScoreBoard';
import { PinDeck } from './components/PinDeck';
import { Controls } from './components/Controls';
import { FrameEditModal } from './components/FrameEditModal';

import {
  Menu,
  Trophy,
  Sparkles,
  RotateCcw,
  Save,
  CheckCircle2,
  Home,
  Target,
  CircleDot,
  ArrowLeft,
  Settings,
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<MainAppView>('home');
  const [prevViewBeforeSettings, setPrevViewBeforeSettings] = useState<MainAppView>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);

  // App settings (Sound, Theme, Language)
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());

  // User personal configuration (Name, Style, Balls, Patterns, Centers)
  const [userConfig, setUserConfig] = useState<UserPersonalConfig>(() => loadUserPersonalConfig());

  // Active Tournament configuration
  const [activeTournament, setActiveTournament] = useState<TournamentConfig | null>(() =>
    loadActiveTournament()
  );

  // Saved regular tournaments
  const [savedTournaments, setSavedTournaments] = useState<SavedTournament[]>(() =>
    loadSavedTournaments()
  );

  // Practice Drills history
  const [practiceDrills, setPracticeDrills] = useState<PracticeDrillRecord[]>(() =>
    loadPracticeDrills()
  );

  // Pre-configured pins for practice drill quick-start
  const [drillInitialPins, setDrillInitialPins] = useState<number[] | undefined>(undefined);

  // Matches history state
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  // Translations helper
  const t = getTranslation(settings.language);

  // Active in-progress match (strictly personal for the single bowler)
  const [activeMatch, setActiveMatch] = useState<MatchRecord>(() => {
    const saved = loadActiveMatch();
    if (saved) return saved;
    const cfg = loadUserPersonalConfig();
    const tournament = loadActiveTournament();
    const defaultPlayer = createEmptyPlayerGame(cfg.name);
    return {
      id: 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      title: tournament?.tournamentName || 'Тренировочный матч',
      tournamentName: tournament?.tournamentName,
      tournamentStartDate: tournament?.startDate,
      tournamentEndDate: tournament?.endDate,
      laneNumber: tournament?.laneNumber ?? 3,
      centerId: tournament?.centerId || cfg.centers[0]?.id,
      centerName: tournament?.centerName || cfg.centers[0]?.name,
      oilPatternId: tournament?.oilPatternId || cfg.oilPatterns[0]?.id,
      oilPatternName: tournament?.oilPatternName || cfg.oilPatterns[0]?.name,
      ballId: tournament?.ballId || cfg.balls[0]?.id,
      ballName: tournament?.ballName || cfg.balls[0]?.name,
      players: [defaultPlayer],
    };
  });

  // Pins selected on the interactive pin deck for current roll
  const [selectedPinsToKnock, setSelectedPinsToKnock] = useState<PinNumber[]>([]);

  // Notification / toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize sounds and load matches on mount
  useEffect(() => {
    setSoundMuted(!settings.soundEnabled);
    setMatches(loadSavedMatches());
  }, []);

  // Save active match whenever it changes
  useEffect(() => {
    saveActiveMatch(activeMatch);
  }, [activeMatch]);

  // Sync settings whenever they change
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
    setSoundMuted(!newSettings.soundEnabled);
  };

  const toggleSound = () => {
    const nextSound = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: nextSound };
    handleUpdateSettings(updated);
    showToast(nextSound ? t.soundOn : t.soundOff);
  };

  // Save user config whenever it changes
  const handleUpdateUserConfig = (newConfig: UserPersonalConfig) => {
    setUserConfig(newConfig);
    saveUserPersonalConfig(newConfig);
    // Also update player name on active match if needed
    if (activeMatch.players[0] && activeMatch.players[0].playerName !== newConfig.name) {
      setActiveMatch((prev) => ({
        ...prev,
        players: [{ ...prev.players[0], playerName: newConfig.name }],
      }));
    }
  };

  const handleSaveTournaments = (updated: SavedTournament[]) => {
    setSavedTournaments(updated);
    saveSavedTournaments(updated);
  };

  const handleSavePracticeDrills = (updated: PracticeDrillRecord[]) => {
    setPracticeDrills(updated);
    savePracticeDrills(updated);
  };

  const handleQuickStartPractice = (presetPins?: number[]) => {
    setDrillInitialPins(presetPins);
    setActiveView('practice');
  };

  const handleStartClassicGame = () => {
    setActiveView('game');
  };

  const handleSelectActiveTournamentFromHub = (tournament: TournamentConfig) => {
    setActiveTournament(tournament);
    saveActiveTournament(tournament);
    setActiveMatch((prev) => ({
      ...prev,
      tournamentId: tournament.tournamentId,
      tournamentName: tournament.tournamentName,
      tournamentStartDate: tournament.startDate,
      tournamentEndDate: tournament.endDate,
      centerId: tournament.centerId,
      centerName: tournament.centerName,
      oilPatternId: tournament.oilPatternId,
      oilPatternName: tournament.oilPatternName,
      ballId: tournament.ballId,
      ballName: tournament.ballName,
      laneNumber: tournament.laneNumber,
    }));
    setActiveView('game');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const toggleSettings = () => {
    if (activeView === 'settings') {
      setActiveView(prevViewBeforeSettings);
    } else {
      setPrevViewBeforeSettings(activeView);
      setActiveView('settings');
    }
  };

  const getCurrentLocationTitle = (): string => {
    if (activeView === 'settings') return t.settings;
    if (activeView === 'home') return 'Главная';
    if (activeView === 'practice') return 'Практика';
    if (activeView === 'tournaments') return 'Турниры';
    if (activeView === 'arsenal') return 'Арсенал';
    if (activeView === 'centers') return 'Боулинг-центры';
    if (activeView === 'patterns') return 'Программы масла';
    if (activeView === 'notes') return 'Заметки боулера';
    if (activeView === 'profile') return t.playerProfile;
    if (activeView === 'game') {
      return 'Новая игра';
    }
    return 'Главная';
  };

  // State for editing any played frame's score
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [isFrameEditModalOpen, setIsFrameEditModalOpen] = useState(false);

  // Safe reference to the user's personal game
  const activePlayer: PlayerGame = activeMatch.players[0] || createEmptyPlayerGame(userConfig.name);

  // Active player's current frame
  const currentFrameIdx = activePlayer.frames.findIndex((f) => !isFrameComplete(f));
  const activeFrame = currentFrameIdx !== -1 ? activePlayer.frames[currentFrameIdx] : null;

  // Standing pins for the current throw
  const standingPins = useMemo(() => {
    if (!activeFrame) return [];
    return getStandingPinsForNextRoll(activeFrame);
  }, [activeFrame]);

  // Is this the first roll of the active frame?
  const isFirstRollOfFrame = activeFrame ? activeFrame.rolls.length === 0 : true;

  // Check split on current pin configuration
  const currentSplitCheck = useMemo(() => {
    if (isFirstRollOfFrame || standingPins.length === 10 || standingPins.length === 0) {
      return { isSplit: false };
    }
    return checkIsSplit(standingPins);
  }, [standingPins, isFirstRollOfFrame]);

  // Check if entire match is finished
  const isMatchFinished = activePlayer.isFinished;

  // 1. Uncompleted tournament check
  const activeTournamentSaved = useMemo(() => {
    if (!activeTournament?.tournamentId) return null;
    return savedTournaments.find((t) => t.id === activeTournament.tournamentId) || null;
  }, [activeTournament, savedTournaments]);

  const hasActiveTournament = useMemo(() => {
    if (!activeTournament) return false;
    if (activeTournamentSaved?.status === 'completed' || !!activeTournamentSaved?.finalPlacement) {
      return false;
    }
    return true;
  }, [activeTournament, activeTournamentSaved]);

  // 2. Active in-progress game (rolls made, not completed)
  const hasActiveGameInProgress = useMemo(() => {
    return !activePlayer.isFinished && activePlayer.frames.some((f) => f.rolls.length > 0);
  }, [activePlayer]);

  // 3. Active practice session (has active attempts)
  const [hasActivePractice, setHasActivePractice] = useState(false);

  // Modal for when there is no active session:
  const [isGameChoiceModalOpen, setIsGameChoiceModalOpen] = useState(false);

  // Computed summary for the drawer menu button:
  const activeSessionInfo = useMemo(() => {
    if (hasActiveTournament && activeTournament) {
      return {
        hasActive: true,
        title: activeTournament.tournamentName,
        subtitle: `🏆 ${activeTournament.tournamentName}`,
        type: 'tournament' as const,
      };
    }
    if (hasActiveGameInProgress) {
      const frameNum = currentFrameIdx !== -1 ? currentFrameIdx + 1 : 10;
      return {
        hasActive: true,
        title: activeMatch.title || 'Текущая партия',
        subtitle: `🎳 Фрейм ${frameNum} · Счёт: ${activePlayer.totalScore}`,
        type: 'game' as const,
      };
    }
    if (hasActivePractice) {
      return {
        hasActive: true,
        title: 'Практика',
        subtitle: '🎯 Активная отработка бросков',
        type: 'practice' as const,
      };
    }
    return {
      hasActive: false,
      title: 'Текущая игра',
      subtitle: 'Нет активных игр · Начать',
      type: 'none' as const,
    };
  }, [
    hasActiveTournament,
    activeTournament,
    hasActiveGameInProgress,
    currentFrameIdx,
    activePlayer.totalScore,
    activeMatch.title,
    hasActivePractice,
  ]);

  // Handle click on "Текущая игра" in drawer menu
  const handleCurrentGameClick = () => {
    if (hasActiveTournament || hasActiveGameInProgress) {
      setActiveView('game');
      if (hasActiveTournament && activeTournament) {
        showToast(`🏆 ${activeTournament.tournamentName}`);
      } else {
        showToast('Возврат к текущей партии 🎳');
      }
    } else if (hasActivePractice) {
      setActiveView('practice');
      showToast('Возврат к активной тренировке 🎯');
    } else {
      setIsGameChoiceModalOpen(true);
    }
  };

  // Fire celebratory confetti
  const triggerCelebration = useCallback((type: 'strike' | 'turkey' | 'perfect' | 'match') => {
    try {
      if (type === 'strike') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ef4444'],
        });
      } else if (type === 'turkey' || type === 'perfect' || type === 'match') {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
        });
      }
    } catch (e) {
      console.warn('Confetti error', e);
    }
  }, []);

  // Toggle single pin selection on the interactive pin deck
  const handleTogglePin = (pin: PinNumber) => {
    setSelectedPinsToKnock((prev) =>
      prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin]
    );
  };

  const handleKnockAll = () => {
    setSelectedPinsToKnock([...standingPins]);
  };

  const handleKnockNone = () => {
    setSelectedPinsToKnock([]);
  };

  // Record roll logic
  const handleExecuteRoll = (pinsHit: PinNumber[], isFoul = false) => {
    if (!activeFrame) return;

    const count = isFoul ? 0 : pinsHit.length;

    // Audio feedback
    if (isFoul || count === 0) {
      playGutterSound();
    } else if (count === 10 && standingPins.length === 10) {
      playPinCrashSound(1.2);
    } else if (!isFirstRollOfFrame && count === standingPins.length) {
      playSpareSound();
    } else if (count >= 4) {
      playPinCrashSound(0.8);
    } else {
      playSinglePinSound();
    }

    // Execute roll in engine
    const updatedPlayer = recordRoll(activePlayer, pinsHit, isFoul);

    // Check celebration & alerts
    if (!isFoul) {
      if (count === 10 && standingPins.length === 10) {
        const strikes = updatedPlayer.strikesCount;
        if (strikes >= 3 && updatedPlayer.frames.slice(-3).every((f) => f.isStrike)) {
          showToast('🦃 ТУРЦИЯ! 3 страйка подряд!');
          triggerCelebration('turkey');
        } else {
          showToast('⚡ СТРАЙК! Все 10 кеглей!');
          triggerCelebration('strike');
        }
      } else if (!isFirstRollOfFrame && count === standingPins.length && count > 0) {
        showToast('🎯 СПЭР! Отличное добивание!');
      }
    } else {
      showToast('⚠️ Заступ за линию фола (Foul)');
    }

    const updatedMatch: MatchRecord = {
      ...activeMatch,
      players: [updatedPlayer],
    };

    setActiveMatch(updatedMatch);
    setSelectedPinsToKnock([]);

    // Check if match just completed
    if (updatedPlayer.isFinished) {
      triggerCelebration('match');
      showToast('🏆 Партия завершена! Сохраните результат.');
    }
  };

  const handleConfirmSelection = () => {
    handleExecuteRoll(selectedPinsToKnock, false);
  };

  const handleQuickCount = (count: number) => {
    if (count === 0) {
      handleExecuteRoll([], false);
      return;
    }
    const sortedStanding = [...standingPins].sort((a, b) => a - b);
    const chosenPins = sortedStanding.slice(0, count);
    handleExecuteRoll(chosenPins, false);
  };

  const handleStrike = () => {
    if (standingPins.length === 10) {
      handleExecuteRoll([...ALL_PINS], false);
    }
  };

  const handleSpare = () => {
    if (!isFirstRollOfFrame && standingPins.length > 0) {
      handleExecuteRoll([...standingPins], false);
    }
  };

  const handleFoul = () => {
    handleExecuteRoll([], true);
  };

  const handleUndo = () => {
    const updatedPlayer = undoLastRoll(activePlayer);
    setActiveMatch({
      ...activeMatch,
      players: [updatedPlayer],
    });
    setSelectedPinsToKnock([]);
    showToast(t.undoBtn);
  };

  // Start new tournament with chosen center, dates, oil pattern, ball, lane
  const handleStartTournament = (config: TournamentConfig) => {
    setActiveTournament(config);
    saveActiveTournament(config);

    const newPlayer = createEmptyPlayerGame(userConfig.name);
    const newMatch: MatchRecord = {
      id: 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      title: config.tournamentName,
      tournamentId: config.tournamentId,
      tournamentName: config.tournamentName,
      tournamentStartDate: config.startDate,
      tournamentEndDate: config.endDate,
      laneNumber: config.laneNumber,
      centerId: config.centerId,
      centerName: config.centerName,
      oilPatternId: config.oilPatternId,
      oilPatternName: config.oilPatternName,
      ballId: config.ballId,
      ballName: config.ballName,
      players: [newPlayer],
    };

    setActiveMatch(newMatch);
    setSelectedPinsToKnock([]);
    setActiveView('game');
    showToast(`🏆 ${config.tournamentName}`);
  };

  // Start fresh game with automated lane transition based on selected rule
  const handleStartNewGame = () => {
    let nextLane = activeMatch.laneNumber || activeTournament?.laneNumber;

    if (activeTournament && nextLane) {
      const rule = activeTournament.laneTransitionRule || 'pairs';
      if (rule === 'pairs') {
        // Alternating within a pair: 1 ⇄ 2, 3 ⇄ 4, 5 ⇄ 6, etc.
        nextLane = nextLane % 2 === 1 ? nextLane + 1 : nextLane - 1;
      } else if (rule === 'shift_plus_2') {
        nextLane = nextLane + 2;
      } else if (rule === 'shift_minus_2') {
        nextLane = Math.max(1, nextLane - 2);
      } else if (rule === 'shift_plus_1') {
        nextLane = nextLane + 1;
      } else if (rule === 'shift_plus_4') {
        nextLane = nextLane + 4;
      }

      const updatedTourney: TournamentConfig = {
        ...activeTournament,
        laneNumber: nextLane,
        currentGameNumber: (activeTournament.currentGameNumber || 1) + 1,
      };
      setActiveTournament(updatedTourney);
      saveActiveTournament(updatedTourney);
    }

    const newPlayer = createEmptyPlayerGame(userConfig.name);
    const newMatch: MatchRecord = {
      id: 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      title: activeTournament?.tournamentName || activeMatch.tournamentName || (activeMatch.title && activeMatch.title !== 'Тренировочный матч' ? activeMatch.title : 'Новая игра'),
      tournamentId: activeTournament?.tournamentId || activeMatch.tournamentId,
      tournamentName: activeTournament?.tournamentName || activeMatch.tournamentName,
      tournamentStartDate: activeTournament?.startDate || activeMatch.tournamentStartDate,
      tournamentEndDate: activeTournament?.endDate || activeMatch.tournamentEndDate,
      laneNumber: nextLane,
      centerId: activeTournament?.centerId || activeMatch.centerId,
      centerName: activeTournament?.centerName || activeMatch.centerName,
      oilPatternId: activeTournament?.oilPatternId || activeMatch.oilPatternId,
      oilPatternName: activeTournament?.oilPatternName || activeMatch.oilPatternName,
      ballId: activeTournament?.ballId || activeMatch.ballId,
      ballName: activeTournament?.ballName || activeMatch.ballName,
      players: [newPlayer],
    };
    setActiveMatch(newMatch);
    setSelectedPinsToKnock([]);
    setActiveView('game');

    if (nextLane && nextLane !== activeMatch.laneNumber) {
      showToast(`Партия начата · Переход на дорожку №${nextLane}`);
    } else {
      showToast('Следующая партия начата');
    }
  };

  // Finish current game / match early or on demand
  const handleFinishCurrentGame = () => {
    // If rolls have been made, finalize game scores, mark finished and allow saving or moving to next game
    if (activePlayer.frames.some((f) => f.rolls.length > 0)) {
      const updatedPlayer: PlayerGame = {
        ...activePlayer,
        isFinished: true,
      };
      const updatedMatch: MatchRecord = {
        ...activeMatch,
        players: [updatedPlayer],
      };
      setActiveMatch(updatedMatch);
      saveActiveMatch(updatedMatch);
      setSelectedPinsToKnock([]);
      showToast('Партия завершена');
    } else {
      setActiveView('home');
      showToast('Игра завершена');
    }
  };

  // Finish active tournament
  const handleFinishTournament = () => {
    // If the active match has rolls made, save it to history
    if (activePlayer.frames.some((f) => f.rolls.length > 0)) {
      const updated = addMatchToHistory(activeMatch);
      setMatches(updated);
    }

    if (activeTournament?.tournamentId) {
      const tourneys = loadSavedTournaments();
      const updated = tourneys.map((t) =>
        t.id === activeTournament.tournamentId ? { ...t, status: 'completed' as const } : t
      );
      setSavedTournaments(updated);
      saveSavedTournaments(updated);
    }

    setActiveTournament(null);
    saveActiveTournament(null);
    showToast('🏆 Турнир успешно завершён!');
    setActiveView('tournaments');
  };

  // Handle editing any frame in the current match
  const handleSaveEditedFrame = (frameIndex: number, newRolls: Roll[]) => {
    const currentFrames = [...activePlayer.frames];
    const targetFrame = currentFrames[frameIndex];
    if (!targetFrame) return;

    currentFrames[frameIndex] = {
      ...targetFrame,
      rolls: newRolls,
    };

    const recalculatedPlayer = calculateGameScores({
      ...activePlayer,
      frames: currentFrames,
    });

    const updatedMatch: MatchRecord = {
      ...activeMatch,
      players: [recalculatedPlayer],
    };

    setActiveMatch(updatedMatch);
    saveActiveMatch(updatedMatch);
    setSelectedPinsToKnock([]);
    showToast(`Фрейм ${frameIndex + 1} обновлён. Счёт: ${recalculatedPlayer.totalScore}`);
  };

  // Save current match to permanent history
  const handleSaveMatchToHistory = () => {
    const updated = addMatchToHistory(activeMatch);
    setMatches(updated);
    showToast(t.matchSavedToast);
    setActiveView('profile');
  };

  const handleExportMatches = () => {
    const jsonStr = exportMatchesToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strikezone_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Данные успешно экспортированы в JSON');
  };

  const handleImportMatches = (jsonStr: string) => {
    const success = importMatchesFromJson(jsonStr);
    if (success) {
      setMatches(loadSavedMatches());
      setUserConfig(loadUserPersonalConfig());
      setActiveTournament(loadActiveTournament());
      showToast('Данные успешно импортированы!');
    } else {
      showToast('Ошибка импорта: неверный формат JSON');
    }
  };

  const handleClearData = () => {
    localStorage.removeItem('strikezone_matches_v1');
    localStorage.removeItem('strikezone_saved_tournaments_v1');
    localStorage.removeItem('strikezone_practice_drills_v1');
    localStorage.removeItem('strikezone_notes_v1');
    setMatches([]);
    setSavedTournaments([]);
    setPracticeDrills([]);
    showToast('Все локальные данные очищены (чистая база)');
  };

  // Reset only statistics and game history, leaving profile, balls, oil patterns, centers intact
  const handleResetStats = () => {
    saveMatches([]);
    setMatches([]);
    savePracticeDrills([]);
    setPracticeDrills([]);
    const defaultPlayer = createEmptyPlayerGame(userConfig.name);
    const cleanMatch: MatchRecord = {
      id: 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      title: 'Одиночная игра',
      laneNumber: 1,
      centerId: userConfig.centers[0]?.id,
      centerName: userConfig.centers[0]?.name,
      oilPatternId: userConfig.oilPatterns[0]?.id,
      oilPatternName: userConfig.oilPatterns[0]?.name,
      ballId: userConfig.balls[0]?.id,
      ballName: userConfig.balls[0]?.name,
      players: [defaultPlayer],
    };
    setActiveMatch(cleanMatch);
    saveActiveMatch(cleanMatch);
    setSelectedPinsToKnock([]);
    showToast('Статистика и история игр успешно сброшены');
  };

  // Visual Theme class wrapper
  const themeClass = useMemo(() => {
    switch (settings.theme) {
      case 'light':
        return 'theme-light bg-slate-100 text-slate-900';
      case 'high-contrast-dark':
        return 'theme-high-contrast-dark bg-black text-white';
      case 'high-contrast-light':
        return 'theme-high-contrast-light bg-white text-black';
      case 'obsidian':
        return 'theme-obsidian bg-black text-cyan-50';
      case 'slate':
        return 'theme-slate bg-slate-950 text-slate-100';
      case 'dark':
      default:
        return 'theme-dark bg-stone-950 text-stone-100';
    }
  }, [settings.theme]);

  return (
    <div
      className={`w-full max-w-full overflow-x-hidden min-h-screen ${themeClass} flex flex-col font-sans select-none sm:select-auto transition-colors duration-200`}
    >
      {/* Slide-out Drawer Navigation (Opens on Menu button) */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          setIsDrawerOpen(false);
        }}
        onSelectCurrentGame={handleCurrentGameClick}
        onStartNewGame={handleStartNewGame}
        onOpenNewTournament={() => {
          setIsTournamentModalOpen(true);
          setIsDrawerOpen(false);
        }}
        userConfig={userConfig}
        activeTournament={activeTournament}
        activeSessionInfo={activeSessionInfo}
        settings={settings}
        onToggleSound={toggleSound}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-stone-900/95 border border-amber-500/50 text-amber-300 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200 flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sleek Ultra-Minimalist Top Header Bar (Strictly Location & Settings) */}
      <header className="sticky top-0 z-30 w-full max-w-full bg-stone-950/95 backdrop-blur-md border-b border-stone-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-0">
          {/* Left: Menu button + Current Location Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsDrawerOpen(true);
              }}
              className="p-1.5 sm:p-2 -ml-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800 transition-colors flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
              aria-label="Открыть меню"
              title={t.menuTitle}
            >
              <Menu className="w-5 h-5 text-amber-400" />
            </button>

            <h1 className="font-extrabold text-stone-100 text-sm sm:text-base font-display tracking-tight truncate min-w-0">
              {getCurrentLocationTitle()}
            </h1>
          </div>

          {/* Right: Settings button */}
          <div className="flex items-center gap-2 shrink-0">
            {activeView !== 'home' && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSettings();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  activeView === 'settings'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-800'
                }`}
                title={t.settings}
              >
                <Settings className={`w-4 h-4 ${activeView === 'settings' ? 'text-stone-950' : 'text-amber-400'}`} />
                <span className="hidden sm:inline">{t.settings}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-5 min-w-0 overflow-x-hidden">
        {/* PWA In-App Install Prompt Banner */}
        <PWAInstallBanner />

        {/* ========================================================================= */}
        {/* VIEW 0: HOME SCREEN (ТИТУЛЬНЫЙ ЛИСТ ПРИЛОЖЕНИЯ) */}
        {/* ========================================================================= */}
        {activeView === 'home' && (
          <HomeScreen
            userConfig={userConfig}
            activeTournament={activeTournament}
            savedTournaments={savedTournaments}
            practiceDrills={practiceDrills}
            matches={matches}
            activeMatch={activeMatch}
            settings={settings}
            onNavigate={(view) => setActiveView(view)}
            onQuickStartPractice={handleQuickStartPractice}
            onStartClassicGame={handleStartClassicGame}
            onOpenTournamentModal={() => setIsTournamentModalOpen(true)}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: PRACTICE DRILL (ОТРАБОТКА СПЛИТОВ 7-10 И КЕГЛЕЙ СО СТАТИСТИКОЙ) */}
        {/* ========================================================================= */}
        {activeView === 'practice' && (
          <PracticeDrillView
            userConfig={userConfig}
            practiceDrills={practiceDrills}
            onSaveDrills={handleSavePracticeDrills}
            settings={settings}
            onBackToHome={() => setActiveView('home')}
            initialPins={drillInitialPins}
            onNotification={showToast}
            onSessionStateChange={setHasActivePractice}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: TOURNAMENTS HUB (РЕГУЛЯРНЫЕ ТУРНИРЫ И ЛИГИ) */}
        {/* ========================================================================= */}
        {activeView === 'tournaments' && (
          <TournamentsHub
            savedTournaments={savedTournaments}
            onSaveTournaments={handleSaveTournaments}
            activeTournament={activeTournament}
            onSelectActiveTournament={handleSelectActiveTournamentFromHub}
            userConfig={userConfig}
            onUpdateUserConfig={handleUpdateUserConfig}
            settings={settings}
            onBackToHome={() => setActiveView('home')}
            onNotification={showToast}
            matches={matches}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: ARSENAL & BALL CATALOG (STORM, HAMMER, ROTO GRIP, MOTIV, EBONITE) */}
        {/* ========================================================================= */}
        {activeView === 'arsenal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView('home');
                }}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Главная</span>
              </button>
            </div>
            <ArsenalManager
              userConfig={userConfig}
              onUpdateConfig={handleUpdateUserConfig}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3B: BOWLING CENTERS (КОЛИЧЕСТВО ДОРОЖЕК, АДРЕСА, ПОКРЫТИЕ) */}
        {/* ========================================================================= */}
        {activeView === 'centers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView('home');
                }}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-emerald-500/40 text-stone-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                <span>Главная</span>
              </button>
            </div>
            <CentersManager
              userConfig={userConfig}
              onUpdateConfig={handleUpdateUserConfig}
              onNotification={showToast}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3C: OIL PATTERNS (ПРОГРАММЫ МАСЛА И СКРИНШОТЫ ДИАГРАММ) */}
        {/* ========================================================================= */}
        {activeView === 'patterns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView('home');
                }}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-cyan-500/40 text-stone-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Главная</span>
              </button>
            </div>
            <OilPatternsManager
              userConfig={userConfig}
              onUpdateConfig={handleUpdateUserConfig}
              onNotification={showToast}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: GAME SCREEN - STRICTLY 2 PRIMARY PANELS (PIN DECK & FAST CONTROLS) */}
        {/* ========================================================================= */}
        {activeView === 'game' && (
          <div className="space-y-3 sm:space-y-4">
            {/* Compact 10-Frame Score Strip with clickable frame editing */}
            <ScoreBoard
              players={[activePlayer]}
              activePlayerIndex={0}
              compact={true}
              onEditFrame={(_pIdx, fIdx) => {
                setEditingFrameIndex(fIdx);
                setIsFrameEditModalOpen(true);
              }}
              matchInfo={{
                centerName: activeMatch.centerName,
                oilPatternName: activeMatch.oilPatternName,
                ballName: activeMatch.ballName,
                laneNumber: activeMatch.laneNumber,
              }}
            />

            {/* Top Bar during play: Match/Tournament info and "Завершить" button */}
            {!isMatchFinished && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-stone-900/60 border border-stone-800">
                <div className="flex items-center gap-2 text-xs text-stone-300 min-w-0">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-stone-200">
                    Новая игра
                  </span>
                  {activeTournament ? (
                    <>
                      <span className="text-stone-500">·</span>
                      <span className="text-amber-400 font-semibold truncate max-w-[150px] sm:max-w-none">
                        {activeTournament.tournamentName || 'Турнир'}
                      </span>
                      <span className="text-stone-500">·</span>
                      <span className="text-stone-400 shrink-0">
                        Партия {activeTournament.currentGameNumber || 1}
                      </span>
                      <span className="text-stone-500">·</span>
                      <span className="text-stone-400 shrink-0">
                        Дорожка {activeMatch.laneNumber || activeTournament.laneNumber || 1}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-stone-500">·</span>
                      <span className="text-stone-400">
                        Дорожка {activeMatch.laneNumber || 1}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeTournament && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFinishTournament();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Завершить турнир целиком"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Завершить турнир</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleFinishCurrentGame();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-red-500/50 text-stone-300 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={activeTournament ? "Завершить текущую партию" : "Завершить текущую игру"}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Завершить</span>
                  </button>
                </div>
              </div>
            )}

            {/* THE TWO REQUESTED PANELS: */}
            {!isMatchFinished ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
                {/* 1. ПАНЕЛЬ С КЕГЛЯМИ (Interactive Pin Deck with Confirm Roll button in deck footer) */}
                <div className="lg:col-span-6 xl:col-span-7">
                  <PinDeck
                    standingBefore={standingPins}
                    selectedToKnock={selectedPinsToKnock}
                    onTogglePin={handleTogglePin}
                    onKnockAll={handleKnockAll}
                    onKnockNone={handleKnockNone}
                    onConfirmRoll={handleConfirmSelection}
                    isSplit={currentSplitCheck.isSplit}
                    splitName={currentSplitCheck.name}
                  />
                </div>

                {/* 2. ПАНЕЛЬ С БЫСТРЫМИ ФУНКЦИЯМИ (Controls: Страйк, Спэр, Фол, Желоб, Keypad) */}
                <div className="lg:col-span-6 xl:col-span-5 space-y-3">
                  {/* Current Turn Status strip */}
                  <div className="rounded-xl bg-stone-900/60 border border-stone-800 p-3 sm:p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                        {t.currentRoll}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-stone-100">
                        {t.frameLabel} {activeFrame?.frameNumber ?? 10}
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {isFirstRollOfFrame ? t.rollFirst : t.rollSecond}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-stone-400">{t.standingPinsCount}:</span>
                      <div className="text-2xl font-black font-mono text-amber-400">
                        {standingPins.length}
                      </div>
                    </div>
                  </div>

                  {/* Fast Action Buttons, Quick Keypad & Confirm */}
                  <Controls
                    standingPins={standingPins}
                    selectedPins={selectedPinsToKnock}
                    onConfirmPinSelection={handleConfirmSelection}
                    onQuickCount={handleQuickCount}
                    onStrike={handleStrike}
                    onSpare={handleSpare}
                    onFoul={handleFoul}
                    onUndo={handleUndo}
                    canUndo={activePlayer.frames.some((f) => f.rolls.length > 0)}
                    isGameFinished={isMatchFinished}
                    onFinishAndSave={handleSaveMatchToHistory}
                    onNewGame={handleStartNewGame}
                    onFinishGame={handleFinishCurrentGame}
                    isFirstRollOfFrame={isFirstRollOfFrame}
                    language={settings.language}
                  />
                </div>
              </div>
            ) : (
              /* When match is completed: Clean summary with the 3 requested buttons */
              <div className="rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 p-6 sm:p-8 text-center space-y-5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Trophy className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-display">
                    {t.gameCompletedTitle}
                  </h2>
                  <p className="text-stone-400 text-xs sm:text-sm max-w-md mx-auto">
                    {t.gameCompletedDesc}
                  </p>
                </div>

                {/* Score card summary */}
                <div className="inline-block p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 min-w-[240px] text-center shadow-lg">
                  <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    {t.finalScore}
                  </div>
                  <div className="text-5xl font-black font-mono text-amber-400 mt-2 tabular-nums">
                    {activePlayer.totalScore}
                  </div>
                  <div className="text-xs text-stone-400 mt-2">
                    {activePlayer.strikesCount} X · {activePlayer.sparesCount} / ·{' '}
                    {activePlayer.openFramesCount === 0 ? (
                      <span className="text-emerald-400 font-semibold">{t.cleanGameBadge}</span>
                    ) : (
                      `${activePlayer.openFramesCount} ${t.openFramesCount}`
                    )}
                  </div>
                </div>

                {/* The 3 requested post-game buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleStartNewGame();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Следующая партия</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveMatchToHistory();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-stone-800 text-stone-200 font-semibold hover:bg-stone-700 transition-all active:scale-95 text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Сохранить в историю</span>
                  </button>

                  {activeTournament ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFinishTournament();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-red-950/40 text-red-300 border border-red-800/60 font-semibold hover:bg-red-900/60 hover:text-red-100 transition-all active:scale-95 text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Завершить турнир</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveView('home');
                        showToast('Игра завершена');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-stone-800 text-stone-200 font-semibold hover:bg-stone-700 transition-all active:scale-95 text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Завершить</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PLAYER PROFILE (CONTAINS PERSONAL DATA, ARSENAL & STATISTICS)   */}
        {/* ========================================================================= */}
        {activeView === 'profile' && (
          <PlayerProfile
            userConfig={userConfig}
            onUpdateConfig={handleUpdateUserConfig}
            matches={matches}
            savedTournaments={savedTournaments}
            language={settings.language}
            onNotification={showToast}
            onExportData={handleExportMatches}
            onResetStats={handleResetStats}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW: BOWLING NOTES (ДНЕВНИК БОУЛЕРА, НАБЛЮДЕНИЯ И АНАЛИЗ) */}
        {/* ========================================================================= */}
        {activeView === 'notes' && (
          <BowlingNotes
            userConfig={userConfig}
            onNotification={showToast}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SETTINGS (SOUND, THEMES, 6-LANGUAGE SELECTOR, DATA MANAGEMENT)   */}
        {/* ========================================================================= */}
        {activeView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onExportData={handleExportMatches}
            onImportData={handleImportMatches}
            onClearData={handleClearData}
            onNotification={showToast}
          />
        )}
      </main>

      {/* Tournament Setup Modal (Select center, dates from-to, oil, ball, lane) */}
      <TournamentSetupModal
        isOpen={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        userConfig={userConfig}
        onStartTournament={handleStartTournament}
        onAddNewPattern={(newPattern) => {
          const updated = {
            ...userConfig,
            oilPatterns: [newPattern, ...userConfig.oilPatterns],
            activeOilPatternId: newPattern.id,
          };
          handleUpdateUserConfig(updated);
          showToast(`Программа масла "${newPattern.name}" добавлена`);
        }}
        language={settings.language}
        initialValues={
          activeTournament || {
            centerId: activeMatch.centerId,
            centerName: activeMatch.centerName,
            oilPatternId: activeMatch.oilPatternId,
            oilPatternName: activeMatch.oilPatternName,
            ballId: activeMatch.ballId,
            ballName: activeMatch.ballName,
            laneNumber: activeMatch.laneNumber,
          }
        }
      />

      {/* Frame Edit Modal for editing any frame's score */}
      {editingFrameIndex !== null && (
        <FrameEditModal
          isOpen={isFrameEditModalOpen}
          onClose={() => {
            setIsFrameEditModalOpen(false);
            setEditingFrameIndex(null);
          }}
          frame={activePlayer.frames[editingFrameIndex] || null}
          frameIndex={editingFrameIndex}
          playerName={activePlayer.playerName}
          onSaveFrame={handleSaveEditedFrame}
        />
      )}

      {/* Game Choice Modal (Shown when no active games exist) */}
      <GameChoiceModal
        isOpen={isGameChoiceModalOpen}
        onClose={() => setIsGameChoiceModalOpen(false)}
        onStartPractice={() => {
          setIsGameChoiceModalOpen(false);
          setActiveView('practice');
          showToast('Режим практики: выберите расклад, центр и масло 🎯');
        }}
        onStartNewGame={() => {
          setIsGameChoiceModalOpen(false);
          handleStartNewGame();
        }}
        onOpenNewTournament={() => {
          setIsGameChoiceModalOpen(false);
          setIsTournamentModalOpen(true);
        }}
      />
    </div>
  );
}
