import React, { useState, useMemo } from 'react';
import {
  MatchRecord,
  BowlerProfileStats,
  PinNumber,
  UserPersonalConfig,
  SavedTournament,
} from '../types/bowling';
import {
  computeBowlerStats,
  isMatchInTournament,
  computeTournamentSummary,
} from '../utils/bowlingEngine';
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
} from 'lucide-react';

interface ProfileStatsProps {
  matches: MatchRecord[];
  userConfig?: UserPersonalConfig;
  savedTournaments?: SavedTournament[];
  initialTournamentId?: string;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  matches,
  userConfig,
  savedTournaments = [],
  initialTournamentId,
}) => {
  const [selectedTournamentFilter, setSelectedTournamentFilter] = useState<string>(
    initialTournamentId || 'all'
  );
  const [hoveredScorePoint, setHoveredScorePoint] = useState<{
    date: string;
    score: number;
    matchId: string;
  } | null>(null);

  const [selectedPinDetail, setSelectedPinDetail] = useState<PinNumber | null>(null);

  // Active tournament object if filtered
  const activeFilterTournament = useMemo(() => {
    if (selectedTournamentFilter === 'all' || selectedTournamentFilter === 'unassigned') return null;
    return savedTournaments.find((t) => t.id === selectedTournamentFilter) || null;
  }, [selectedTournamentFilter, savedTournaments]);

  // Filter matches based on selection
  const filteredMatches = useMemo(() => {
    if (selectedTournamentFilter === 'all') {
      return matches;
    }
    if (selectedTournamentFilter === 'unassigned') {
      return matches.filter((m) => !m.tournamentId && !m.tournamentName);
    }
    const tourn = savedTournaments.find((t) => t.id === selectedTournamentFilter);
    if (!tourn) {
      return matches.filter(
        (m) =>
          m.tournamentId === selectedTournamentFilter ||
          m.tournamentName === selectedTournamentFilter
      );
    }
    return matches.filter((m) => isMatchInTournament(m, tourn));
  }, [matches, selectedTournamentFilter, savedTournaments]);

  // Dynamic statistics computation
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

  // Average line Y coordinate
  const avgY =
    padding.top +
    ((maxScore - stats.averageScore) / (maxScore - minScore)) *
      (chartHeight - padding.top - padding.bottom);

  // Pin Leave Triangle Rows:
  // Row 4: 7, 8, 9, 10
  // Row 3: 4, 5, 6
  // Row 2: 2, 3
  // Row 1: 1
  const pinRows: PinNumber[][] = [
    [7, 8, 9, 10],
    [4, 5, 6],
    [2, 3],
    [1],
  ];

  // Helper to color pin based on leave percentage
  const getPinHeatColor = (pin: PinNumber) => {
    const item = stats.pinLeaveHeatmap.find((p) => p.pin === pin);
    const pct = item ? item.leavePercentage : 0;

    if (pct === 0) return 'bg-stone-800 border-stone-700 text-stone-500';
    if (pct < 15) return 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300';
    if (pct < 30) return 'bg-amber-950/80 border-amber-500 text-amber-300';
    return 'bg-red-950 border-red-500 text-red-200 shadow-md shadow-red-500/20';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Player Header - Strictly personal for the user */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-display">
            Профиль и статистика игрока
          </h2>
          <div className="flex items-center gap-2 text-sm text-stone-400 mt-1">
            <span className="text-amber-400 font-bold">{userConfig?.name || 'Игрок'}</span>
            <span>·</span>
            <span>Арсенал: {userConfig?.balls.length || 0} шаров</span>
            <span>·</span>
            <span>Программ масла: {userConfig?.oilPatterns.length || 0}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOURNAMENT VS GENERAL STATISTICS SELECTOR */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>Режим отображения статистики</span>
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Переключайтесь между общей статистикой по всем играм или статистикой отдельного турнира
            </p>
          </div>

          {selectedTournamentFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedTournamentFilter('all')}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить на общую</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Option 1: All games (Overall general stats) */}
          <button
            type="button"
            onClick={() => setSelectedTournamentFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
              selectedTournamentFilter === 'all'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🌐 Все игры (Общая: {matches.length})</span>
          </button>

          {/* Option 2..N: Each saved tournament */}
          {savedTournaments.map((t) => {
            const tournSummary = computeTournamentSummary(t, matches);
            const isSelected = selectedTournamentFilter === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTournamentFilter(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${isSelected ? 'text-stone-950' : 'text-amber-400'}`} />
                <span className="truncate max-w-[200px]">{t.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-stone-950 text-amber-400' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {tournSummary.gamesPlayed}
                </span>
              </button>
            );
          })}

          {/* Option N+1: Non-tournament games */}
          {matches.some((m) => !m.tournamentId && !m.tournamentName) && (
            <button
              type="button"
              onClick={() => setSelectedTournamentFilter('unassigned')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                selectedTournamentFilter === 'unassigned'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>🎯 Вне турниров</span>
            </button>
          )}
        </div>

        {/* Selected Filter Banner Feedback */}
        {activeFilterTournament && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2 min-w-0">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span>Показана статистика по турниру: </span>
                <strong className="text-white">{activeFilterTournament.name}</strong>
                <span className="text-stone-400 text-[11px] ml-2">
                  ({filteredMatches.length} сыгранных партий · Ср. счёт {stats.averageScore || '—'})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTournamentFilter('all')}
              className="text-[11px] text-amber-400 hover:underline shrink-0"
            >
              Вернуться ко всем играм
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
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

      {/* ========================================================================= */}
      {/* EFFICIENCY & CONVERSION METRICS (ТОЧНОСТЬ И РЕАЛИЗАЦИЯ БРОСКОВ) */}
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
      {/* TOURNAMENTS COMPARATIVE LEADERBOARD (VISIBLE IN GENERAL ALL-GAMES MODE) */}
      {/* ========================================================================= */}
      {selectedTournamentFilter === 'all' && tournamentSummaries.length > 0 && (
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
                        onClick={() => setSelectedTournamentFilter(t.id)}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-white font-semibold text-[11px] transition-colors"
                      >
                        Статистика →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Chart: Score Progression Trendline */}
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
                    fill="url(#scoreGradient)"
                    opacity="0.25"
                  />
                )}

                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
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
                      {/* X axis labels (game index) */}
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
            Нет сохранённых матчей для отображения графика
          </div>
        )}
      </div>

      {/* Two Columns: Pin Leave Heatmap + Frame Performance & Accuracy */}
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

            {/* Selected Pin Details Callout */}
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

          {/* Common leaves breakdown */}
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

        {/* Frame Performance & Accuracy Breakdown */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Average Score by Frame */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 shadow-sm">
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

      {/* Equipment & Condition Performance (Balls, Patterns, Centers) */}
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
