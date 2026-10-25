import React, { useState } from 'react';
import { SavedTournament, MatchRecord, Frame, OilPattern } from '../types/bowling';
import { computeTournamentSummary } from '../utils/bowlingEngine';
import { ScoreBoard } from './ScoreBoard';
import { OilDiagramViewerModal } from './OilDiagramViewerModal';
import {
  Trophy,
  X,
  Play,
  Edit3,
  Calendar,
  Building2,
  Droplets,
  CircleDot,
  TrendingUp,
  Target,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  ZoomIn,
  Image as ImageIcon,
} from 'lucide-react';

interface TournamentDetailModalProps {
  tournament: SavedTournament | null;
  isOpen: boolean;
  onClose: () => void;
  matches: MatchRecord[];
  onStartPlay: (tournament: SavedTournament) => void;
  onEdit: (tournament: SavedTournament) => void;
  onCompleteTournament?: (tournament: SavedTournament) => void;
  oilPatterns?: OilPattern[];
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({
  tournament,
  isOpen,
  onClose,
  matches,
  onStartPlay,
  onEdit,
  onCompleteTournament,
  oilPatterns,
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [viewingDiagram, setViewingDiagram] = useState<OilPattern | null>(null);

  if (!isOpen || !tournament) return null;

  const stats = computeTournamentSummary(tournament, matches);
  const tournamentPattern = oilPatterns?.find(
    (p) => p.id === tournament.oilPatternId || p.name === tournament.oilPatternName
  );
  const tournMatches = [...stats.matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // SVG Chart Dimensions for Score Progression
  const chartWidth = 640;
  const chartHeight = 160;
  const padding = { top: 15, right: 25, bottom: 25, left: 35 };

  // Chronological order for chart
  const chronMatches = [...tournMatches].reverse();
  const scores = chronMatches.map((m) => m.players[0]?.totalScore || 0);
  const minScore = scores.length > 0 ? Math.min(80, Math.floor(Math.min(...scores) / 20) * 20) : 80;
  const maxScore = scores.length > 0 ? Math.max(260, Math.ceil(Math.max(...scores) / 20) * 20) : 300;

  const points = chronMatches.map((m, idx) => {
    const score = m.players[0]?.totalScore || 0;
    const x =
      chronMatches.length === 1
        ? chartWidth / 2
        : padding.left +
          (idx / (chronMatches.length - 1)) * (chartWidth - padding.left - padding.right);
    const y =
      padding.top +
      ((maxScore - score) / (maxScore - minScore)) * (chartHeight - padding.top - padding.bottom);
    return { x, y, score, match: m };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  const avgY =
    padding.top +
    ((maxScore - stats.averageScore) / (maxScore - minScore)) *
      (chartHeight - padding.top - padding.bottom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl space-y-6 p-4 sm:p-6 text-stone-100">
        {/* ========================================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {tournament.isRegular && (
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                    ⭐ Регулярная лига
                  </span>
                )}
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  {tournament.status === 'completed'
                    ? 'Завершён'
                    : tournament.status === 'upcoming'
                    ? 'Предстоящий'
                    : 'Активный турнир'}
                </span>
                {tournament.format && (
                  <span className="text-[10px] font-medium text-stone-300 bg-stone-800 px-2 py-0.5 rounded-md">
                    {tournament.format}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                {tournament.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(tournament)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              title="Редактировать турнир"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* QUICK METADATA STRIP & PRIMARY ACTION BUTTON */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-300 flex-1">
            <div className="flex items-center gap-2 truncate">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-stone-400 block">Период:</span>
                <span className="font-semibold text-stone-200">
                  {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : '—'}
                  {' — '}
                  {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-stone-400 block">Центр:</span>
                <span className="font-semibold text-stone-200 truncate block">
                  {tournament.centerName || 'Любой'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 truncate">
              <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-stone-400 block">Масло:</span>
                <span className="font-semibold text-stone-200 truncate block">
                  {tournament.oilPatternName || 'Стандарт'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 truncate">
              <CircleDot className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-stone-400 block">Шар / Дорожка:</span>
                <span className="font-semibold text-stone-200 truncate block">
                  {tournament.ballName || 'Основной'}
                  {tournament.laneNumber ? ` · Дор. ${tournament.laneNumber}` : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onCompleteTournament && (
              <button
                type="button"
                onClick={() => onCompleteTournament(tournament)}
                className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>{tournament.status === 'completed' ? 'Итоги / Место' : 'Завершить турнир'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onStartPlay(tournament);
              }}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Играть партию в турнире</span>
            </button>
          </div>
        </div>

        {/* Completion Banner (if completed) */}
        {tournament.status === 'completed' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-lg shrink-0">
                🏆
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-amber-400 block tracking-wider">
                  Турнир успешно завершён {tournament.finalPlacement ? `· ${tournament.finalPlacement}` : ''}
                </span>
                {tournament.completionNotes ? (
                  <p className="text-xs text-stone-300 italic mt-0.5">
                    «{tournament.completionNotes}»
                  </p>
                ) : (
                  <span className="text-xs text-stone-400">Итоговые результаты зафиксированы в истории</span>
                )}
              </div>
            </div>

            {onCompleteTournament && (
              <button
                type="button"
                onClick={() => onCompleteTournament(tournament)}
                className="text-xs font-semibold text-amber-400 hover:underline shrink-0 self-start sm:self-auto"
              >
                Изменить итоги →
              </button>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* OIL PATTERN DIAGRAM CARD (IF IMAGE ATTACHED) */}
        {/* ========================================================================= */}
        {tournamentPattern?.imageUrl && (
          <div className="p-4 rounded-2xl bg-cyan-950/25 border border-cyan-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                onClick={() => setViewingDiagram(tournamentPattern)}
                className="relative group cursor-pointer w-20 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-black border border-cyan-700/60 shrink-0 flex items-center justify-center shadow-md hover:border-cyan-400 transition-all"
                title="Нажмите, чтобы развернуть диаграмму во весь экран"
              >
                <img
                  src={tournamentPattern.imageUrl}
                  alt={tournamentPattern.name}
                  className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-cyan-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ZoomIn className="w-5 h-5 text-cyan-300 drop-shadow" />
                </div>
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span>Схема нанесения масла</span>
                  </span>
                  <span className="text-xs text-stone-300 font-mono">
                    {tournamentPattern.lengthFt} ft
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white truncate">
                  {tournamentPattern.name}
                </h4>
                <p className="text-xs text-stone-400">
                  {tournamentPattern.category.toUpperCase()}
                  {tournamentPattern.volumeMl ? ` · ${tournamentPattern.volumeMl} мл` : ''}
                  {tournamentPattern.ratio ? ` · Коэффициент ${tournamentPattern.ratio}` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewingDiagram(tournamentPattern)}
              className="px-4 py-2 rounded-xl bg-cyan-900/50 hover:bg-cyan-800/70 border border-cyan-700/60 text-cyan-200 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <ZoomIn className="w-4 h-4" />
              <span>Смотреть диаграмму масла</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* KPI CARDS (TOURNAMENT SPECIFIC STATS) */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Сводная статистика турнира</span>
            </h3>
            <span className="text-xs text-stone-400">
              Показатели рассчитаны только для партий этого турнира
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Games Played */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
              <div className="text-[11px] text-stone-400 font-medium">Сыграно игр</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-stone-100 mt-1">
                {stats.gamesPlayed}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">
                Всего кеглей: <strong className="text-amber-400">{stats.totalPinfall}</strong>
              </div>
            </div>

            {/* 2. Average Score */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/30">
              <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>Средний счёт</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1">
                {stats.averageScore || '—'}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">Средний за партию</div>
            </div>

            {/* 3. High Score */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
              <div className="text-[11px] text-stone-400 font-medium">Рекорд турнира</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-stone-100 mt-1">
                {stats.highScore || '—'}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">
                Минимум: <span className="font-mono text-stone-300">{stats.lowScore || '—'}</span>
              </div>
            </div>

            {/* 4. Strikes & Spares */}
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
              <div className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Страйки / Спэры</span>
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-stone-100 mt-1.5 flex items-center gap-2">
                <span className="text-amber-400">{stats.strikeRate}%</span>
                <span className="text-stone-600">/</span>
                <span className="text-cyan-400">{stats.spareRate}%</span>
              </div>
              <div className="text-[10px] text-stone-400 mt-1">
                Чистых партий: <strong className="text-emerald-400">{stats.cleanGamesCount}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCORE PROGRESSION CHART (IF >= 2 GAMES) */}
        {/* ========================================================================= */}
        {chronMatches.length >= 2 && (
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Динамика счёта в турнире</span>
              </span>
              <span className="text-stone-400">
                Средняя линия: <strong className="text-amber-400 font-mono">{stats.averageScore}</strong>
              </span>
            </div>

            <div className="relative overflow-x-auto py-1">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-36 sm:h-40 overflow-visible"
              >
                {/* Background grid horizontal lines */}
                {[minScore, Math.round((minScore + maxScore) / 2), maxScore].map((val) => {
                  const y =
                    padding.top +
                    ((maxScore - val) / (maxScore - minScore)) *
                      (chartHeight - padding.top - padding.bottom);
                  return (
                    <g key={val}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#292524"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 6}
                        y={y + 3}
                        fill="#78716c"
                        fontSize="9"
                        textAnchor="end"
                        className="font-mono"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Average Score Line */}
                <line
                  x1={padding.left}
                  y1={avgY}
                  x2={chartWidth - padding.right}
                  y2={avgY}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />

                {/* Progression Polyline */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  points={polylineStr}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      className="fill-amber-400 stroke-stone-950 stroke-2"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      fill="#f59e0b"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      {pt.score}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LIST OF ALL GAMES IN THIS TOURNAMENT */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Сыгранные игры турнира ({tournMatches.length})
            </h3>
            {tournMatches.length > 0 && (
              <span className="text-[11px] text-stone-400">Нажмите на игру, чтобы развернуть фреймы</span>
            )}
          </div>

          {tournMatches.length === 0 ? (
            <div className="rounded-2xl bg-stone-950/60 border border-stone-800 p-8 text-center space-y-3">
              <Trophy className="w-10 h-10 text-stone-600 mx-auto" />
              <div className="text-sm font-semibold text-stone-300">
                В этом турнире пока нет сыгранных игр
              </div>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Все игры, сыгранные при активном статусе данного турнира, будут автоматически сохраняться
                сюда с детальной статистикой.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartPlay(tournament);
                }}
                className="mt-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Начать первую партию в турнире</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tournMatches.map((m, idx) => {
                const player = m.players[0];
                const score = player?.totalScore || 0;
                const isExpanded = expandedMatchId === m.id;
                const isClean = player && player.isFinished && player.openFramesCount === 0;

                return (
                  <div
                    key={m.id}
                    className="rounded-2xl bg-stone-950/90 border border-stone-800 hover:border-stone-700 transition-all overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedMatchId(isExpanded ? null : m.id)}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          #{tournMatches.length - idx}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-100 text-sm truncate">
                              {m.title || `Партия #${tournMatches.length - idx}`}
                            </span>
                            {isClean && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Clean Game</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                            <span>{new Date(m.date).toLocaleDateString()}</span>
                            <span>·</span>
                            <span>{new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {m.ballName && (
                              <>
                                <span>·</span>
                                <span className="text-stone-300">{m.ballName}</span>
                              </>
                            )}
                            {m.laneNumber && (
                              <>
                                <span>·</span>
                                <span>Дор. {m.laneNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-black font-mono text-amber-400 tabular-nums">
                            {score}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {player?.strikesCount || 0}X · {player?.sparesCount || 0}/
                          </div>
                        </div>

                        <div className="text-stone-500">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Frame Details */}
                    {isExpanded && player && (
                      <div className="p-4 pt-2 border-t border-stone-800/80 bg-stone-900/60 animate-in fade-in duration-150">
                        <div className="text-xs font-semibold text-stone-300 mb-2 flex items-center justify-between">
                          <span>Фреймы партии:</span>
                          <span className="text-stone-400 text-[11px]">
                            {player.strikesCount} страйков · {player.sparesCount} спэров · {player.openFramesCount} открытых
                          </span>
                        </div>
                        <ScoreBoard players={[player]} compact />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Oil Pattern Diagram Lightbox Viewer */}
      <OilDiagramViewerModal
        isOpen={!!viewingDiagram}
        onClose={() => setViewingDiagram(null)}
        pattern={viewingDiagram}
      />
    </div>
  );
};
