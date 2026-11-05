import React, { useState, useMemo } from 'react';
import {
  MatchRecord,
  BowlerProfileStats,
  PinNumber,
  UserPersonalConfig,
  SavedTournament,
  PracticeDrillRecord,
} from '../types/bowling';
import {
  computeBowlerStats,
  isMatchInTournament,
  computeTournamentSummary,
  isMatchIncludedInStats,
} from '../utils/bowlingEngine';
import {
  toggleMatchIncludeInStats,
  togglePracticeIncludeInStats,
} from '../utils/storage';
import {
  Trophy,
  TrendingUp,
  Target,
  Flame,
  ShieldAlert,
  CircleDot,
  Droplets,
  Building2,
  Globe,
  Filter,
  BarChart3,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Download,
  Calendar,
  Layers,
  Eye,
  EyeOff,
  Dumbbell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';

export type StatsTypeFilter = 'in_stats' | 'tournaments' | 'practices' | 'all';
export type StatsPeriodFilter = 'all' | 'month' | 'year' | 'custom';

interface ProfileStatsProps {
  matches: MatchRecord[];
  userConfig?: UserPersonalConfig;
  savedTournaments?: SavedTournament[];
  practiceDrills?: PracticeDrillRecord[];
  initialTournamentId?: string;
  onExportData?: () => void;
  onUpdateMatches?: (matches: MatchRecord[]) => void;
  onUpdatePractices?: (drills: PracticeDrillRecord[]) => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  matches,
  userConfig,
  savedTournaments = [],
  practiceDrills = [],
  initialTournamentId,
  onExportData,
  onUpdateMatches,
  onUpdatePractices,
}) => {
  // 1. Quick Chips / Type Filter
  const [typeFilter, setTypeFilter] = useState<StatsTypeFilter>(
    initialTournamentId ? 'tournaments' : 'in_stats'
  );

  // 2. Tournament & Stage Selection
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    initialTournamentId || 'all'
  );
  const [selectedStageId, setSelectedStageId] = useState<string>('all');

  // 3. Period Filter
  const [periodFilter, setPeriodFilter] = useState<StatsPeriodFilter>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // 4. UI controls
  const [isGamesListExpanded, setIsGamesListExpanded] = useState<boolean>(true);
  const [hoveredScorePoint, setHoveredScorePoint] = useState<{
    date: string;
    score: number;
    matchId: string;
  } | null>(null);
  const [selectedPinDetail, setSelectedPinDetail] = useState<PinNumber | null>(null);

  // Active tournament object if selected
  const activeTournament = useMemo(() => {
    if (selectedTournamentId === 'all') return null;
    return savedTournaments.find((t) => t.id === selectedTournamentId) || null;
  }, [selectedTournamentId, savedTournaments]);

  // When changing tournament, reset stage selection to 'all'
  const handleTournamentSelect = (tournId: string) => {
    setSelectedTournamentId(tournId);
    setSelectedStageId('all');
  };

  // Reset all filters to default: General (in stats), All time, All tournaments
  const handleResetFilters = () => {
    setTypeFilter('in_stats');
    setSelectedTournamentId('all');
    setSelectedStageId('all');
    setPeriodFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const isFiltered =
    typeFilter !== 'in_stats' ||
    selectedTournamentId !== 'all' ||
    selectedStageId !== 'all' ||
    periodFilter !== 'all';

  // Filter matches based on the selected slice
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // 1. Filter by Quick Type
      if (typeFilter === 'in_stats') {
        if (!isMatchIncludedInStats(m, savedTournaments)) return false;
      } else if (typeFilter === 'tournaments') {
        if (!m.tournamentId && !m.tournamentName) return false;
      } else if (typeFilter === 'practices') {
        // Practices mode is handled separately for drills, but any game marked as practice drill match will match here
        const isPracticeGame =
          m.title?.toLowerCase().includes('практика') ||
          m.title?.toLowerCase().includes('тренировк');
        if (!isPracticeGame) return false;
      }
      // 'all' includes every game

      // 2. Filter by Tournament & Stage (if specified)
      if (selectedTournamentId !== 'all') {
        if (!activeTournament) {
          if (m.tournamentId !== selectedTournamentId && m.tournamentName !== selectedTournamentId) {
            return false;
          }
        } else {
          const stageParam = selectedStageId === 'all' ? undefined : selectedStageId;
          if (!isMatchInTournament(m, activeTournament, stageParam)) {
            return false;
          }
        }
      }

      // 3. Filter by Period
      if (periodFilter !== 'all') {
        const matchTime = new Date(m.date).getTime();
        const now = Date.now();

        if (periodFilter === 'month') {
          // Last 30 days
          const thirtyDaysAgo = now - 30 * 24 * 3600 * 1000;
          if (matchTime < thirtyDaysAgo) return false;
        } else if (periodFilter === 'year') {
          // Current calendar year or last 365 days
          const oneYearAgo = now - 365 * 24 * 3600 * 1000;
          if (matchTime < oneYearAgo) return false;
        } else if (periodFilter === 'custom') {
          if (customStartDate) {
            const startMs = new Date(customStartDate).getTime();
            if (matchTime < startMs) return false;
          }
          if (customEndDate) {
            // End of selected day
            const endMs = new Date(customEndDate).getTime() + 24 * 3600 * 1000 - 1;
            if (matchTime > endMs) return false;
          }
        }
      }

      return true;
    });
  }, [
    matches,
    typeFilter,
    selectedTournamentId,
    selectedStageId,
    activeTournament,
    periodFilter,
    customStartDate,
    customEndDate,
    savedTournaments,
  ]);

  // Practice drills filtering (for 'practices' mode)
  const filteredPractices = useMemo(() => {
    return practiceDrills.filter((d) => {
      if (typeFilter === 'in_stats' && d.includeInStats === false) return false;

      if (periodFilter !== 'all') {
        const dTime = new Date(d.date).getTime();
        const now = Date.now();
        if (periodFilter === 'month') {
          if (dTime < now - 30 * 24 * 3600 * 1000) return false;
        } else if (periodFilter === 'year') {
          if (dTime < now - 365 * 24 * 3600 * 1000) return false;
        } else if (periodFilter === 'custom') {
          if (customStartDate && dTime < new Date(customStartDate).getTime()) return false;
          if (customEndDate && dTime > new Date(customEndDate).getTime() + 24 * 3600 * 1000 - 1) return false;
        }
      }
      return true;
    });
  }, [practiceDrills, typeFilter, periodFilter, customStartDate, customEndDate]);

  // Compute stats on the filtered slice
  const stats: BowlerProfileStats = useMemo(() => {
    return computeBowlerStats(filteredMatches, userConfig?.name);
  }, [filteredMatches, userConfig?.name]);

  // Tournaments breakdown for the overview table
  const tournamentSummaries = useMemo(() => {
    return savedTournaments.map((t) => ({
      tournament: t,
      summary: computeTournamentSummary(t, matches, userConfig?.name),
    }));
  }, [savedTournaments, matches, userConfig?.name]);

  // Practice stats summary
  const practiceSummary = useMemo(() => {
    const totalSessions = filteredPractices.length;
    const totalAttempts = filteredPractices.reduce((acc, d) => acc + (d.attemptsCount || 0), 0);
    const convertedAttempts = filteredPractices.reduce((acc, d) => acc + (d.convertedCount || 0), 0);
    const conversionRate = totalAttempts > 0 ? Math.round((convertedAttempts / totalAttempts) * 100) : 0;
    return { totalSessions, totalAttempts, convertedAttempts, conversionRate };
  }, [filteredPractices]);

  // Informational Summary Label
  const summaryLabel = useMemo(() => {
    const parts: string[] = [];

    if (typeFilter === 'in_stats') parts.push('Общая статистика (в зачёте)');
    else if (typeFilter === 'tournaments') parts.push('Турнирные игры');
    else if (typeFilter === 'practices') parts.push('Тренировочные практики');
    else parts.push('Все игры без исключения');

    if (activeTournament) {
      if (selectedStageId !== 'all') {
        const stage = activeTournament.stages?.find((s) => s.id === selectedStageId);
        parts.push(`${activeTournament.name} — ${stage?.name || 'Этап'}`);
      } else {
        parts.push(`${activeTournament.name} (все этапы)`);
      }
    }

    if (periodFilter === 'month') parts.push('за последний месяц');
    else if (periodFilter === 'year') parts.push('за последний год');
    else if (periodFilter === 'custom') {
      const s = customStartDate ? new Date(customStartDate).toLocaleDateString('ru-RU') : '...';
      const e = customEndDate ? new Date(customEndDate).toLocaleDateString('ru-RU') : '...';
      parts.push(`с ${s} по ${e}`);
    }

    const countText =
      typeFilter === 'practices'
        ? `учтено ${filteredPractices.length} сессий`
        : `учтено ${filteredMatches.length} ${filteredMatches.length === 1 ? 'игра' : 'игр'}`;

    return `${parts.join(' · ')} (${countText})`;
  }, [
    typeFilter,
    activeTournament,
    selectedStageId,
    periodFilter,
    customStartDate,
    customEndDate,
    filteredMatches.length,
    filteredPractices.length,
  ]);

  // SVG Chart Dimensions for Score Progression
  const chartWidth = 700;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const scores = stats.scoreHistory.map((s) => s.score);
  const minScore = scores.length > 0 ? Math.min(60, Math.floor(Math.min(...scores) / 20) * 20) : 60;
  const maxScore = scores.length > 0 ? Math.max(260, Math.ceil(Math.max(...scores) / 20) * 20) : 300;

  const points = stats.scoreHistory.map((item, idx) => {
    const x =
      stats.scoreHistory.length === 1
        ? chartWidth / 2
        : padding.left +
          (idx / (stats.scoreHistory.length - 1)) * (chartWidth - padding.left - padding.right);
    const y =
      padding.top +
      ((maxScore - item.score) / (maxScore - minScore)) *
        (chartHeight - padding.top - padding.bottom);
    return { x, y, item };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  const avgY =
    padding.top +
    ((maxScore - stats.averageScore) / (maxScore - minScore)) *
      (chartHeight - padding.top - padding.bottom);

  // Pin Leave Triangle Rows
  const pinRows: PinNumber[][] = [
    [7, 8, 9, 10],
    [4, 5, 6],
    [2, 3],
    [1],
  ];

  const getPinHeatColor = (pin: PinNumber) => {
    const item = stats.pinLeaveHeatmap.find((p) => p.pin === pin);
    const pct = item ? item.leavePercentage : 0;

    if (pct === 0) return 'bg-stone-800 border-stone-700 text-stone-500';
    if (pct < 15) return 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300';
    if (pct < 30) return 'bg-amber-950/80 border-amber-500 text-amber-300';
    return 'bg-red-950 border-red-500 text-red-200 shadow-md shadow-red-500/20';
  };

  // Toggle match inclusion handler
  const handleToggleMatch = (matchId: string) => {
    const updated = toggleMatchIncludeInStats(matchId);
    if (onUpdateMatches) onUpdateMatches(updated);
  };

  // Toggle practice drill inclusion handler
  const handleTogglePractice = (drillId: string) => {
    const updated = togglePracticeIncludeInStats(drillId);
    if (onUpdatePractices) onUpdatePractices(updated);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & EXPORT */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-display">
            Статистика и аналитика
          </h2>
          <div className="flex items-center gap-2 text-sm text-stone-400 mt-1">
            <span className="text-amber-400 font-bold">{userConfig?.name || 'Игрок'}</span>
            <span>·</span>
            <span>Сыграно игр: {matches.length}</span>
            <span>·</span>
            <span>Турниров: {savedTournaments.length}</span>
          </div>
        </div>

        {onExportData && (
          <button
            type="button"
            onClick={onExportData}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 transition-all font-semibold text-xs sm:text-sm flex items-center gap-2 active:scale-95 shadow-md self-start sm:self-auto cursor-pointer"
            title="Экспорт всех данных и статистики в JSON"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Экспорт в JSON</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. INTUITIVE TOP FILTER CONTROL PANEL (КАК ЗАПРОШЕНО) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl space-y-4">
        {/* Row 1: Section Title & Reset Filters */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Управление срезом данных
            </h3>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Сбросить все фильтры к общей статистике"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить фильтры</span>
            </button>
          )}
        </div>

        {/* Row 2: Quick Chips / Tabs */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            Категория данных
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Chip 1: Общая (в зачёте) */}
            <button
              type="button"
              onClick={() => setTypeFilter('in_stats')}
              className={`px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                typeFilter === 'in_stats'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Общая (в зачёте)</span>
            </button>

            {/* Chip 2: Турниры */}
            <button
              type="button"
              onClick={() => setTypeFilter('tournaments')}
              className={`px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                typeFilter === 'tournaments'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Турниры</span>
            </button>

            {/* Chip 3: Практики */}
            <button
              type="button"
              onClick={() => setTypeFilter('practices')}
              className={`px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                typeFilter === 'practices'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Практики</span>
            </button>

            {/* Chip 4: Все игры */}
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Все игры</span>
            </button>
          </div>
        </div>

        {/* Row 3: Tournament & Stage Selector + Period Filter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1 border-t border-stone-800/80">
          {/* Tournament & Stage Dropdowns (Takes 7 cols on desktop) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Турнир</span>
              </label>
              <select
                value={selectedTournamentId}
                onChange={(e) => handleTournamentSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">Все турниры</option>
                {savedTournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.isRegular ? '⭐' : ''} ({t.stages?.length ? `${t.stages.length} эт.` : 'одиноч.'})
                  </option>
                ))}
              </select>
            </div>

            {/* Dependent Stage Selector if active tournament has stages or is series */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Этап турнира</span>
              </label>
              {activeTournament && activeTournament.stages && activeTournament.stages.length > 0 ? (
                <select
                  value={selectedStageId}
                  onChange={(e) => setSelectedStageId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-cyan-800/60 text-cyan-200 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer animate-in fade-in duration-150"
                >
                  <option value="all">По всему турниру (все этапы)</option>
                  {activeTournament.stages.map((stage, idx) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name || `Этап ${idx + 1}`} {stage.includeInStats === false ? '· [Вне зачёта]' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-stone-950/40 border border-stone-800/50 text-stone-500 text-xs italic">
                  {selectedTournamentId === 'all'
                    ? 'Выберите конкретный турнир'
                    : 'Одиночный турнир (без этапов)'}
                </div>
              )}
            </div>
          </div>

          {/* Period Filter (Takes 5 cols on desktop) */}
          <div className="md:col-span-5 space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>Период</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setPeriodFilter('all')}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-colors cursor-pointer ${
                  periodFilter === 'all'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                Всё время
              </button>
              <button
                type="button"
                onClick={() => setPeriodFilter('month')}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-colors cursor-pointer ${
                  periodFilter === 'month'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                Месяц
              </button>
              <button
                type="button"
                onClick={() => setPeriodFilter('year')}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-colors cursor-pointer ${
                  periodFilter === 'year'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                Год
              </button>
              <button
                type="button"
                onClick={() => setPeriodFilter('custom')}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-colors cursor-pointer ${
                  periodFilter === 'custom'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                Период
              </button>
            </div>
          </div>
        </div>

        {/* Date pickers (if custom period selected) */}
        {periodFilter === 'custom' && (
          <div className="p-3 rounded-xl bg-stone-950/80 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">С даты:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">По дату:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Row 4: Informational Summary Strip */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-stone-400">Показана статистика: </span>
              <strong className="text-amber-200 font-semibold">{summaryLabel}</strong>
            </div>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Сбросить фильтры →
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. KPI CARDS (DYNMICALLY CALCULATED FOR THE ACTIVE SLICE) */}
      {/* ========================================================================= */}
      {typeFilter === 'practices' ? (
        /* Practice-Specific KPI Cards */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Сессий практики</span>
              <Dumbbell className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tabular-nums">
                {practiceSummary.totalSessions}
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-2">
              Всего попыток: <strong className="text-stone-200">{practiceSummary.totalAttempts}</strong>
            </div>
          </div>

          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Конверсия спэаров</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">
                {practiceSummary.conversionRate}%
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-2">
              Закрыто: {practiceSummary.convertedAttempts} из {practiceSummary.totalAttempts}
            </div>
          </div>

          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Взято сплитов</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-stone-100 tabular-nums">
                {stats.splitConversionRate}%
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-2">
              В тренировочных партиях
            </div>
          </div>

          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Тренировочных игр</span>
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400 tabular-nums">
                {filteredMatches.length}
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-2">
              Ср. счёт: <strong className="text-amber-400 font-mono">{stats.averageScore || '—'}</strong>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Games KPI Cards */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Average Score */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Средний счёт</span>
              <Target className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tabular-nums">
                {stats.averageScore || '—'}
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-2">
              За {stats.gamesPlayed} {stats.gamesPlayed === 1 ? 'игру' : 'игр'}
            </div>
          </div>

          {/* High Score */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Рекорд (High Game)</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-stone-100 tabular-nums">
                {stats.highScore || '—'}
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-2">
              Минимум: <span className="font-mono text-stone-300">{stats.lowScore || '—'}</span>
            </div>
          </div>

          {/* Strike Rate */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Процент страйков</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-stone-100 tabular-nums">
                  {stats.strikeRate}
                </span>
                <span className="text-base text-stone-400">%</span>
              </div>
            </div>
            <div className="text-xs text-stone-400 mt-2">
              Конверсия спэаров: <span className="font-mono text-stone-300">{stats.spareRate}%</span>
            </div>
          </div>

          {/* Clean Games */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Чистые игры (Clean)</span>
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">
                  {stats.cleanGameRate}
                </span>
                <span className="text-base text-stone-400">%</span>
              </div>
            </div>
            <div className="text-xs text-stone-400 mt-2">
              Открытые фреймы: <span className="font-mono text-stone-300">{stats.openFrameRate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ACCURACY & CONVERSION METRICS */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-stone-100 font-display flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            <span>Точность и реализация бросков</span>
          </h3>
          <span className="text-xs text-stone-400 font-mono">
            {stats.gamesPlayed} {stats.gamesPlayed === 1 ? 'партия' : 'партий'} в выборке
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80">
            <span className="text-stone-400 block font-medium">Конверсия спэаров</span>
            <span className="text-2xl font-black font-mono text-emerald-400 tabular-nums mt-1 block">
              {stats.spareRate}%
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              добивание оставшихся кеглей
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80">
            <span className="text-stone-400 block font-medium">Взятые сплиты</span>
            <span className="text-2xl font-black font-mono text-amber-400 tabular-nums mt-1 block">
              {stats.splitConversionRate}%
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              закрытые сложные расстановки
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80">
            <span className="text-stone-400 block font-medium">Доля страйков</span>
            <span className="text-2xl font-black font-mono text-stone-100 tabular-nums mt-1 block">
              {stats.strikeRate}%
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              от всех возможных фреймов
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80">
            <span className="text-stone-400 block font-medium">Открытые фреймы</span>
            <span className="text-2xl font-black font-mono text-stone-300 tabular-nums mt-1 block">
              {stats.openFrameRate}%
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              фреймы без страйка и спэара
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SCORE PROGRESSION TRENDLINE (CHART) */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-100 font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Динамика очков по играм</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Хронологический график каждого матча с линией среднего счёта
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 rounded-full" />
              <span>Счёт игры</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-stone-500" />
              <span>Среднее ({stats.averageScore})</span>
            </div>
          </div>
        </div>

        {stats.scoreHistory.length > 0 ? (
          <div className="relative overflow-x-auto">
            <div className="min-w-[500px]">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible select-none"
              >
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const val = Math.round(minScore + (maxScore - minScore) * (1 - pct));
                  const y =
                    padding.top + pct * (chartHeight - padding.top - padding.bottom);
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 4}
                        fill="#78716c"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Average line */}
                {stats.averageScore > 0 && (
                  <line
                    x1={padding.left}
                    y1={avgY}
                    x2={chartWidth - padding.right}
                    y2={avgY}
                    stroke="#a8a29e"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                )}

                {/* Area under curve */}
                {points.length > 1 && (
                  <path
                    d={`M ${points[0].x},${chartHeight - padding.bottom} L ${polylineStr
                      .split(' ')
                      .join(' L ')} L ${points[points.length - 1].x},${
                      chartHeight - padding.bottom
                    } Z`}
                    fill="url(#scoreGradientProfile)"
                    opacity="0.25"
                  />
                )}

                <defs>
                  <linearGradient id="scoreGradientProfile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Primary Polyline */}
                {points.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylineStr}
                  />
                )}

                {/* Data Points */}
                {points.map((p, idx) => {
                  const isHovered = hoveredScorePoint?.matchId === p.item.matchId;
                  const isHigh = p.item.score === stats.highScore;

                  return (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : isHigh ? 5 : 4}
                        fill={isHigh ? '#fbbf24' : '#1c1917'}
                        stroke="#f59e0b"
                        strokeWidth={isHovered ? 3 : 2}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredScorePoint(p.item)}
                        onMouseLeave={() => setHoveredScorePoint(null)}
                      />
                      <text
                        x={p.x}
                        y={chartHeight - 10}
                        fill="#78716c"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        #{idx + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip card */}
            {hoveredScorePoint && (
              <div className="mt-3 p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400">Дата игры: </span>
                  <span className="text-stone-200 font-medium">
                    {new Date(hoveredScorePoint.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400">Итоговый счёт:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {hoveredScorePoint.score}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-stone-500">
            Нет сохранённых матчей для отображения графика в выбранном срезе
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. PIN LEAVE HEATMAP & FRAME PERFORMANCE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap & Leave Analysis */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-stone-100 font-display flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>Тепловая карта остающихся кеглей</span>
              </h3>
              <span className="text-xs text-stone-400">1-й бросок</span>
            </div>
            <p className="text-xs text-stone-400 mb-6">
              Какие кегли вы чаще всего оставляете стоять после первого броска
            </p>

            {/* Pin triangle heatmap */}
            <div className="flex flex-col items-center justify-center py-4 bg-stone-950/70 rounded-xl border border-stone-800/80 mb-4">
              {pinRows.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center justify-center gap-4 sm:gap-6 my-2">
                  {row.map((pin) => {
                    const item = stats.pinLeaveHeatmap.find((p) => p.pin === pin);
                    const pct = item ? item.leavePercentage : 0;
                    const isSelected = selectedPinDetail === pin;

                    return (
                      <button
                        key={pin}
                        type="button"
                        onClick={() => setSelectedPinDetail(pin === selectedPinDetail ? null : pin)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold border transition-all cursor-pointer ${getPinHeatColor(
                          pin
                        )} ${isSelected ? 'ring-2 ring-white scale-110 z-10' : 'hover:scale-105'}`}
                      >
                        <span className="text-xs">{pin}</span>
                        <span className="text-[10px] opacity-80">{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {selectedPinDetail !== null && (
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-200">
                    Кегля #{selectedPinDetail}:
                  </span>
                  <span className="text-stone-400 ml-1">
                    оставалась {stats.pinLeaveHeatmap.find((p) => p.pin === selectedPinDetail)?.leavesCount || 0} раз
                  </span>
                </div>
                <div className="font-mono text-amber-400 font-bold">
                  {stats.pinLeaveHeatmap.find((p) => p.pin === selectedPinDetail)?.leavePercentage || 0}% от 1-х бросков
                </div>
              </div>
            )}
          </div>

          {stats.commonLeaves.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">
                Частые комбинации (Leaves)
              </span>
              <div className="space-y-1.5">
                {stats.commonLeaves.slice(0, 3).map((l, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-stone-950/40"
                  >
                    <span className="text-stone-300">{l.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-stone-400">{l.count} раз</span>
                      <span className="text-stone-600">·</span>
                      <span className="text-emerald-400 font-semibold">
                        {l.count > 0 ? Math.round((l.convertedCount / l.count) * 100) : 0}% спэаров
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Average Score by Frame */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-100 font-display mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Средний прогресс по фреймам (1–10)</span>
            </h3>
            <p className="text-xs text-stone-400 mb-6">
              Накопленный средний счёт игрока к каждому фрейму матча
            </p>

            <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
              {stats.frameAverageScores.map((score, fIdx) => (
                <div key={fIdx} className="flex flex-col items-center">
                  <div className="h-28 w-full flex items-end justify-center bg-stone-950/60 rounded-lg p-1 border border-stone-800/50">
                    <div
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded transition-all duration-300 hover:brightness-110"
                      style={{
                        height: `${Math.max(10, (score / Math.max(1, stats.averageScore)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-stone-400 mt-2 font-semibold font-mono">
                    #{fIdx + 1}
                  </span>
                  <span className="text-[11px] font-mono text-stone-200 font-bold tabular-nums">
                    {score || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. TOURNAMENT LEADERBOARD TABLE (IF GENERAL MODE) */}
      {/* ========================================================================= */}
      {selectedTournamentId === 'all' && tournamentSummaries.length > 0 && (
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-100 font-display flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Сводная таблица по всем турнирам</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Сравнение ваших результатов в турнирах и регулярных лигах
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300 min-w-[600px]">
              <thead>
                <tr className="border-b border-stone-800 text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  <th className="py-2.5 px-3">Турнир / Лига</th>
                  <th className="py-2.5 px-3 text-center">Игр</th>
                  <th className="py-2.5 px-3 text-right">Ср. счёт</th>
                  <th className="py-2.5 px-3 text-right">Рекорд</th>
                  <th className="py-2.5 px-3 text-right">Всего очков</th>
                  <th className="py-2.5 px-3 text-center">Страйки %</th>
                  <th className="py-2.5 px-3 text-center">Спэры %</th>
                  <th className="py-2.5 px-3 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-sans">
                {tournamentSummaries.map(({ tournament: t, summary }) => (
                  <tr key={t.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-100 flex items-center gap-1.5">
                        {t.isRegular && <span className="text-amber-400">⭐</span>}
                        <span>{t.name}</span>
                        {t.tournamentType === 'series' && (
                          <span className="text-[10px] text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-1 rounded">
                            серия
                          </span>
                        )}
                        {t.includeInStats === false && (
                          <span className="text-[9px] text-stone-500 uppercase border border-stone-700 px-1 rounded">
                            вне зачёта
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {t.centerName || 'Центр не указан'} · {t.oilPatternName || 'Масло'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {summary.gamesPlayed}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-amber-400">
                      {summary.averageScore || '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-100">
                      {summary.highScore || '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-stone-400">
                      {summary.totalPinfall}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-300">
                      {summary.strikeRate}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-cyan-300">
                      {summary.spareRate}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTournamentId(t.id);
                          setTypeFilter('tournaments');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-white font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Фильтр →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. GAMES IN CURRENT SLICE WITH 1-CLICK IN-STATS TOGGLES */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-sm">
        <div
          onClick={() => setIsGamesListExpanded(!isGamesListExpanded)}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-stone-900 hover:bg-stone-850 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <CircleDot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-100 font-display flex items-center gap-2">
                <span>Игры в текущем срезе</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 font-mono">
                  {filteredMatches.length}
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Нажимайте на бейдж «В зачёте» / «Вне зачёта» для мгновенного пересчёта статистики
              </p>
            </div>
          </div>

          <div className="text-stone-400">
            {isGamesListExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {isGamesListExpanded && (
          <div className="p-4 sm:p-5 pt-0 border-t border-stone-800/80 space-y-2.5 animate-in fade-in duration-150">
            {filteredMatches.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                В выбранном срезе нет партий
              </div>
            ) : (
              filteredMatches.map((m, idx) => {
                const player = m?.players?.[0];
                const score = player?.totalScore || 0;
                const isIncluded = isMatchIncludedInStats(m, savedTournaments);

                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                      !isIncluded
                        ? 'bg-stone-950/50 border border-dashed border-stone-800 opacity-75'
                        : 'bg-stone-950/80 border border-stone-800/80 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        #{filteredMatches.length - idx}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-stone-200 text-xs sm:text-sm truncate">
                            {m.title || 'Партия'}
                          </span>
                          {m.tournamentName && (
                            <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.2 rounded font-semibold truncate max-w-[150px]">
                              {m.tournamentName}
                            </span>
                          )}
                          {m.stageName && (
                            <span className="text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.2 rounded font-semibold truncate max-w-[120px]">
                              {m.stageName}
                            </span>
                          )}
                          {!isIncluded && (
                            <span className="text-[10px] text-stone-400 bg-stone-900 border border-stone-700 px-1.5 py-0.2 rounded font-mono">
                              Вне зачёта
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span>{new Date(m.date).toLocaleDateString('ru-RU')}</span>
                          {m.centerName && <span>· {m.centerName}</span>}
                          {m.oilPatternName && <span>· {m.oilPatternName}</span>}
                          {m.ballName && <span>· {m.ballName}</span>}
                          {m.laneNumber && <span>· Дор. {m.laneNumber}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* 1-click in-stats toggle button */}
                      <button
                        type="button"
                        onClick={() => handleToggleMatch(m.id)}
                        className={`p-1.5 sm:px-2 sm:py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          m.includeInStats !== false
                            ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60'
                            : 'bg-stone-900 border-dashed border-stone-700 text-stone-400 hover:text-stone-200'
                        }`}
                        title={
                          m.includeInStats !== false
                            ? 'В зачёте (нажмите, чтобы исключить)'
                            : 'Вне зачёта (нажмите, чтобы включить)'
                        }
                      >
                        {m.includeInStats !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline">В зачёте</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                            <span className="hidden sm:inline">Вне зачёта</span>
                          </>
                        )}
                      </button>

                      <div className="text-right">
                        <span className="font-mono font-black text-amber-400 text-base sm:text-lg tabular-nums">
                          {score}
                        </span>
                        <div className="text-[10px] text-stone-500">
                          {player?.strikesCount || 0}X · {player?.sparesCount || 0}/
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 9. PRACTICE DRILLS LIST (IF PRACTICES MODE ACTIVE) */}
      {/* ========================================================================= */}
      {typeFilter === 'practices' && (
        <div className="rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-amber-400" />
              <span>Журнал тренировочных заданий ({filteredPractices.length})</span>
            </h3>
            <span className="text-xs text-stone-400">Управление учётом заданий</span>
          </div>

          {filteredPractices.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              В выбранном периоде нет записей тренировок
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPractices.map((d) => (
                <div
                  key={d.id}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 ${
                    d.includeInStats === false
                      ? 'bg-stone-950/50 border border-dashed border-stone-800 opacity-75'
                      : 'bg-stone-950/80 border border-stone-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-200 text-xs">{d.drillName || 'Тренировка'}</span>
                      {d.includeInStats === false && (
                        <span className="text-[10px] text-stone-500 font-mono">[Вне зачёта]</span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {new Date(d.date).toLocaleDateString('ru-RU')} · Кегли: {d.targetPins?.join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePractice(d.id)}
                      className={`p-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 ${
                        d.includeInStats !== false
                          ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300'
                          : 'bg-stone-900 border-dashed border-stone-700 text-stone-500'
                      }`}
                    >
                      {d.includeInStats !== false ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>В зачёте</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                          <span>Вне зачёта</span>
                        </>
                      )}
                    </button>

                    <div className="text-right font-mono text-xs">
                      <span className="text-emerald-400 font-bold">
                        {d.convertedCount} / {d.attemptsCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. EQUIPMENT & CONDITION PERFORMANCE (BALLS, PATTERNS, CENTERS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-stone-800">
        {/* Ball Stats */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-stone-100 text-sm">По шарам</h4>
          </div>
          {stats.ballStats && stats.ballStats.length > 0 ? (
            <div className="space-y-2">
              {stats.ballStats.map((b, bIdx) => (
                <div
                  key={`${b.ballName}_${bIdx}`}
                  className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-stone-200 block">{b.ballName}</span>
                    <span className="text-[11px] text-stone-500">{b.games} игр</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400 tabular-nums block">
                      {b.averageScore} ср.
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">рекорд: {b.highScore}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500">Нет данных по шарам</p>
          )}
        </div>

        {/* Pattern Stats */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-stone-100 text-sm">По программам масла</h4>
          </div>
          {stats.patternStats && stats.patternStats.length > 0 ? (
            <div className="space-y-2">
              {stats.patternStats.map((p, pIdx) => (
                <div
                  key={`${p.patternName}_${pIdx}`}
                  className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-stone-200 block">{p.patternName}</span>
                    <span className="text-[11px] text-stone-500">{p.games} игр</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-cyan-400 tabular-nums block">
                      {p.averageScore} ср.
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">рекорд: {p.highScore}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500">Нет данных по программам масла</p>
          )}
        </div>

        {/* Center Stats */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-stone-100 text-sm">По боулинг-центрам</h4>
          </div>
          {stats.centerStats && stats.centerStats.length > 0 ? (
            <div className="space-y-2">
              {stats.centerStats.map((c, cIdx) => (
                <div
                  key={`${c.centerName}_${cIdx}`}
                  className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-stone-200 block">{c.centerName}</span>
                    <span className="text-[11px] text-stone-500">{c.games} игр</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 tabular-nums block">
                      {c.averageScore} ср.
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">рекорд: {c.highScore}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500">Нет данных по центрам</p>
          )}
        </div>
      </div>
    </div>
  );
};
