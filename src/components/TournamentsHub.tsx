import React, { useState } from 'react';
import {
  SavedTournament,
  UserPersonalConfig,
  TournamentConfig,
  AppSettings,
  MatchRecord,
  OilPattern,
} from '../types/bowling';
import { getTranslation } from '../utils/i18n';
import { computeTournamentSummary } from '../utils/bowlingEngine';
import { TournamentDetailModal } from './TournamentDetailModal';
import { OilPatternModal } from './OilPatternModal';
import { OilDiagramViewerModal } from './OilDiagramViewerModal';
import {
  Trophy,
  Plus,
  Calendar,
  Building2,
  Droplets,
  CircleDot,
  Edit3,
  Trash2,
  Check,
  X,
  Play,
  ArrowLeft,
  Sparkles,
  Filter,
  Layers,
  BarChart3,
  Award,
  ZoomIn,
  Image as ImageIcon,
} from 'lucide-react';

interface TournamentsHubProps {
  savedTournaments: SavedTournament[];
  onSaveTournaments: (tournaments: SavedTournament[]) => void;
  activeTournament?: TournamentConfig | null;
  onSelectActiveTournament: (tournament: TournamentConfig) => void;
  userConfig: UserPersonalConfig;
  onUpdateUserConfig?: (newConfig: UserPersonalConfig) => void;
  settings: AppSettings;
  onBackToHome: () => void;
  onNotification?: (msg: string) => void;
  matches?: MatchRecord[];
}

export const TournamentsHub: React.FC<TournamentsHubProps> = ({
  savedTournaments,
  onSaveTournaments,
  activeTournament,
  onSelectActiveTournament,
  userConfig,
  onUpdateUserConfig,
  settings,
  onBackToHome,
  onNotification,
  matches = [],
}) => {
  const t = getTranslation(settings.language);

  // Filter: 'all' | 'regular' | 'active' | 'completed'
  const [filter, setFilter] = useState<'all' | 'regular' | 'active' | 'completed'>('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal State for Tournament Completion
  const [completingTournament, setCompletingTournament] = useState<SavedTournament | null>(null);
  const [completionPlacement, setCompletionPlacement] = useState<string>('');
  const [completionNotes, setCompletionNotes] = useState<string>('');

  // Modal State for Tournament Detail & Stats
  const [selectedDetailTournament, setSelectedDetailTournament] = useState<SavedTournament | null>(null);

  // Oil Pattern Modal State for creating new pattern with screenshot/photo
  const [isNewPatternModalOpen, setIsNewPatternModalOpen] = useState(false);
  const [viewingPattern, setViewingPattern] = useState<OilPattern | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [centerId, setCenterId] = useState<string>(userConfig.centers[0]?.id || '');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [oilPatternId, setOilPatternId] = useState<string>(userConfig.oilPatterns[0]?.id || '');
  const [ballId, setBallId] = useState<string>(userConfig.balls[0]?.id || '');
  const [laneNumber, setLaneNumber] = useState<number | ''>(4);
  const [format, setFormat] = useState<string>('Клубная лига / 4 игры в зачёт');
  const [isRegular, setIsRegular] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const currentFormPattern = userConfig.oilPatterns.find((p) => p.id === oilPatternId);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setCenterId(userConfig.activeCenterId || userConfig.centers[0]?.id || '');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10));
    setOilPatternId(userConfig.activeOilPatternId || userConfig.oilPatterns[0]?.id || '');
    setBallId(userConfig.activeBallId || userConfig.balls[0]?.id || '');
    setLaneNumber(4);
    setFormat('Регулярная лига');
    setIsRegular(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (tourn: SavedTournament) => {
    setEditingId(tourn.id);
    setName(tourn.name);
    setCenterId(tourn.centerId || userConfig.centers[0]?.id || '');
    setStartDate(tourn.startDate || new Date().toISOString().slice(0, 10));
    setEndDate(tourn.endDate || tourn.startDate || new Date().toISOString().slice(0, 10));
    setOilPatternId(tourn.oilPatternId || userConfig.oilPatterns[0]?.id || '');
    setBallId(tourn.ballId || userConfig.balls[0]?.id || '');
    setLaneNumber(typeof tourn.laneNumber === 'number' ? tourn.laneNumber : 4);
    setFormat(tourn.format || '');
    setIsRegular(!!tourn.isRegular);
    setNotes(tourn.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveTournament = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const center = userConfig.centers.find((c) => c.id === centerId);
    const pattern = userConfig.oilPatterns.find((p) => p.id === oilPatternId);
    const ball = userConfig.balls.find((b) => b.id === ballId);

    if (editingId) {
      // Edit existing
      const updated = savedTournaments.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            name: name.trim(),
            centerId,
            centerName: center ? center.name : item.centerName,
            startDate,
            endDate,
            oilPatternId,
            oilPatternName: pattern ? pattern.name : item.oilPatternName,
            ballId,
            ballName: ball ? ball.name : item.ballName,
            laneNumber: typeof laneNumber === 'number' ? laneNumber : undefined,
            format: format.trim(),
            isRegular,
            notes: notes.trim(),
          };
        }
        return item;
      });
      onSaveTournaments(updated);
      if (onNotification) onNotification('Турнир успешно обновлён');
    } else {
      // Create new
      const newTournament: SavedTournament = {
        id: `tourn_${Date.now()}`,
        name: name.trim(),
        centerId,
        centerName: center ? center.name : 'Основной центр',
        startDate,
        endDate,
        oilPatternId,
        oilPatternName: pattern ? pattern.name : 'Стандартное масло',
        ballId,
        ballName: ball ? ball.name : 'Основной шар',
        laneNumber: typeof laneNumber === 'number' ? laneNumber : undefined,
        format: format.trim(),
        isRegular,
        status: 'active',
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };
      onSaveTournaments([newTournament, ...savedTournaments]);
      if (onNotification) onNotification('Новый турнир добавлен в список');
    }

    setIsModalOpen(false);
  };

  const handleDeleteTournament = (id: string) => {
    const updated = savedTournaments.filter((t) => t.id !== id);
    onSaveTournaments(updated);
    if (onNotification) onNotification('Турнир удалён из списка');
  };

  const handleSelectForActivePlay = (tourn: SavedTournament) => {
    const config: TournamentConfig = {
      tournamentId: tourn.id,
      tournamentName: tourn.name,
      centerId: tourn.centerId || userConfig.centers[0]?.id || '',
      centerName: tourn.centerName || 'Основной центр',
      startDate: tourn.startDate || new Date().toISOString().slice(0, 10),
      endDate: tourn.endDate || tourn.startDate || new Date().toISOString().slice(0, 10),
      oilPatternId: tourn.oilPatternId || userConfig.oilPatterns[0]?.id || '',
      oilPatternName: tourn.oilPatternName || 'Стандартное масло',
      ballId: tourn.ballId || userConfig.balls[0]?.id || '',
      ballName: tourn.ballName || 'Основной шар',
      laneNumber: tourn.laneNumber,
    };

    onSelectActiveTournament(config);
    if (onNotification) {
      onNotification(`Турнир «${tourn.name}» выбран в качестве активного!`);
    }
  };

  const handleOpenCompleteModal = (tourn: SavedTournament) => {
    setCompletingTournament(tourn);
    setCompletionPlacement(tourn.finalPlacement || '');
    setCompletionNotes(tourn.completionNotes || '');
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTournament) return;
    const updated = savedTournaments.map((t) =>
      t.id === completingTournament.id
        ? {
            ...t,
            status: 'completed' as const,
            finalPlacement: completionPlacement.trim() || undefined,
            completionNotes: completionNotes.trim() || undefined,
            completedAt: t.completedAt || new Date().toISOString(),
          }
        : t
    );
    onSaveTournaments(updated);
    if (onNotification) {
      onNotification(`Турнир «${completingTournament.name}» успешно завершён! 🏆`);
    }
    setCompletingTournament(null);
  };

  const handleReopenTournament = (tourn: SavedTournament) => {
    const updated = savedTournaments.map((t) =>
      t.id === tourn.id
        ? {
            ...t,
            status: 'active' as const,
          }
        : t
    );
    onSaveTournaments(updated);
    if (onNotification) {
      onNotification(`Турнир «${tourn.name}» возобновлён`);
    }
  };

  // Filter tournaments
  const filteredTournaments = savedTournaments.filter((t) => {
    if (filter === 'regular') return t.isRegular;
    if (filter === 'active') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Главная</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-100 font-display flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>Турниры и регулярные лиги</span>
            </h1>
            <p className="text-xs text-stone-400">
              Сохраняйте турниры, в которых вы регулярно играете, добавляйте новые и выбирайте для текущей игры
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить турнир</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-stone-900 border border-stone-800 w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Все ({savedTournaments.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('regular')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'regular'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          ⭐ Регулярные ({savedTournaments.filter((t) => t.isRegular).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'active'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Активные ({savedTournaments.filter((t) => t.status !== 'completed').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'completed'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          🏆 Завершённые ({savedTournaments.filter((t) => t.status === 'completed').length})
        </button>
      </div>

      {/* Tournaments List Grid */}
      {filteredTournaments.length === 0 ? (
        <div className="rounded-2xl bg-stone-900/50 border border-stone-800 p-8 text-center text-stone-400">
          Турниров в данной категории не найдено. Нажмите кнопку «Добавить турнир», чтобы создать новое соревнование.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTournaments.map((tourn) => {
            const isCurrentlyActive = activeTournament?.tournamentName === tourn.name;
            const stats = computeTournamentSummary(tourn, matches);

            return (
              <div
                key={tourn.id}
                className={`rounded-2xl bg-stone-900 border transition-all p-5 flex flex-col justify-between space-y-4 ${
                  isCurrentlyActive
                    ? 'border-amber-500/60 ring-1 ring-amber-500/30 shadow-xl shadow-amber-500/10'
                    : 'border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {tourn.status === 'completed' ? (
                          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>Завершён {tourn.finalPlacement ? `(${tourn.finalPlacement})` : ''}</span>
                          </span>
                        ) : (
                          tourn.isRegular && (
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                              ⭐ Регулярный
                            </span>
                          )
                        )}
                        {isCurrentlyActive && tourn.status !== 'completed' && (
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            ✓ Активен в игре
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setSelectedDetailTournament(tourn)}
                        className="text-base sm:text-lg font-bold text-stone-100 font-display mt-1.5 hover:text-amber-400 transition-colors cursor-pointer"
                        title="Нажмите, чтобы открыть подробную статистику турнира"
                      >
                        {tourn.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(tourn)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                        title="Редактировать турнир"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTournament(tourn.id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
                        title="Удалить турнир"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Date range & format */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1 text-stone-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {tourn.startDate ? new Date(tourn.startDate).toLocaleDateString() : '—'}
                        {' — '}
                        {tourn.endDate ? new Date(tourn.endDate).toLocaleDateString() : '—'}
                      </span>
                    </span>
                    {tourn.format && (
                      <>
                        <span className="text-stone-700">·</span>
                        <span className="text-stone-300">{tourn.format}</span>
                      </>
                    )}
                  </div>

                  {/* Specs & Conditions tags */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 text-xs text-stone-300">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{tourn.centerName || 'Центр не указан'}</span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 truncate">
                      <div className="flex items-center gap-1.5 truncate min-w-0">
                        <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{tourn.oilPatternName || 'Масло не указано'}</span>
                      </div>
                      {(() => {
                        const pat = userConfig.oilPatterns.find(
                          (p) => p.id === tourn.oilPatternId || p.name === tourn.oilPatternName
                        );
                        if (!pat?.imageUrl) return null;
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingPattern(pat);
                            }}
                            className="p-1 rounded-md text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/80 shrink-0 transition-colors"
                            title="Открыть диаграмму масла турнира"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <CircleDot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{tourn.ballName || 'Шар не выбран'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-stone-400">
                      <span>Дорожка: <strong className="text-stone-200">{tourn.laneNumber || 'Любая'}</strong></span>
                    </div>
                  </div>

                  {/* Quick Tournament Statistics Summary Strip */}
                  <div
                    onClick={() => setSelectedDetailTournament(tourn)}
                    className="p-2.5 rounded-xl bg-stone-950/90 border border-stone-800 hover:border-amber-500/40 cursor-pointer transition-colors flex items-center justify-between gap-2 text-xs"
                    title="Открыть подробную статистику турнира"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-stone-400">Игр:</span>
                      <span className="font-bold font-mono text-stone-100">{stats.gamesPlayed}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-stone-400">Ср. счёт:</span>
                      <span className="font-bold font-mono text-amber-400">{stats.averageScore || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-stone-400">Рекорд:</span>
                      <span className="font-bold font-mono text-emerald-400">{stats.highScore || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-semibold">
                      <span>Подробнее →</span>
                    </div>
                  </div>

                  {/* Completion recap block */}
                  {tourn.completionNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Итоги турнира {tourn.finalPlacement ? `· ${tourn.finalPlacement}` : ''}:
                      </span>
                      <p className="italic text-stone-200">{tourn.completionNotes}</p>
                    </div>
                  )}

                  {tourn.notes && !tourn.completionNotes && (
                    <p className="text-xs text-stone-400 line-clamp-2">
                      {tourn.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Action buttons */}
                <div className="pt-3 border-t border-stone-800/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailTournament(tourn)}
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    title="Посмотреть статистику и все игры этого турнира"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Статистика ({stats.gamesPlayed})</span>
                  </button>

                  {tourn.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenCompleteModal(tourn)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                      title="Редактировать итоги или занятое место"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Итоги</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenCompleteModal(tourn)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-stone-800 hover:bg-emerald-950/40 text-stone-300 hover:text-emerald-300 border border-stone-700 hover:border-emerald-500/40 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                      title="Завершить турнир и внести занятое место"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Завершить</span>
                    </button>
                  )}

                  {tourn.status !== 'completed' ? (
                    <button
                      type="button"
                      onClick={() => handleSelectForActivePlay(tourn)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                        isCurrentlyActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCurrentlyActive ? 'В игре' : 'Выбрать'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReopenTournament(tourn)}
                      className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 transition-colors"
                      title="Возобновить турнир"
                    >
                      Возобновить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TOURNAMENT */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-lg font-bold text-stone-100 font-display flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>{editingId ? 'Редактировать турнир' : 'Добавить новый турнир'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTournament} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1">
                  Название турнира / лиги *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Городская лига боулинга"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dates: Start & End */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-semibold text-stone-400 mb-1">
                    Дата начала *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block uppercase font-semibold text-stone-400 mb-1">
                    Дата окончания *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Center */}
              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1">
                  Боулинг-центр *
                </label>
                <select
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                >
                  {userConfig.centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.city ? `(${c.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Oil Pattern & Ball */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block uppercase font-semibold text-stone-400">
                      Программа масла *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsNewPatternModalOpen(true)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                      title="Добавить новую программу масла и прикрепить фото диаграммы"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ С фото</span>
                    </button>
                  </div>
                  <select
                    value={oilPatternId}
                    onChange={(e) => setOilPatternId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {userConfig.oilPatterns.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.lengthFt} ft)
                      </option>
                    ))}
                  </select>

                  {/* Thumbnail preview if selected pattern has diagram image */}
                  {currentFormPattern?.imageUrl && (
                    <div
                      onClick={() => setViewingPattern(currentFormPattern)}
                      className="mt-1.5 p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 hover:border-cyan-500/60 cursor-pointer flex items-center justify-between gap-1.5 text-[11px] transition-colors"
                      title="Нажмите, чтобы развернуть скриншот диаграммы"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <img
                          src={currentFormPattern.imageUrl}
                          alt={currentFormPattern.name}
                          className="w-5 h-5 rounded object-contain bg-black border border-stone-800 shrink-0"
                        />
                        <span className="truncate text-stone-300">
                          Диаграмма: <strong className="text-cyan-300">{currentFormPattern.name}</strong>
                        </span>
                      </div>
                      <span className="text-cyan-400 text-[10px] font-semibold shrink-0 flex items-center gap-0.5">
                        <ZoomIn className="w-3 h-3" />
                        <span>Открыть</span>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block uppercase font-semibold text-stone-400 mb-1">
                    Основной шар *
                  </label>
                  <select
                    value={ballId}
                    onChange={(e) => setBallId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {userConfig.balls.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.weightLbs} lbs)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lane number & format */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-semibold text-stone-400 mb-1">
                    Номер дорожки
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={64}
                    value={laneNumber}
                    onChange={(e) => setLaneNumber(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-stone-400 mb-1">
                    Формат турнира
                  </label>
                  <input
                    type="text"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="Например: 4 игры в зачёт"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Regular tournament toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRegular}
                  onChange={(e) => setIsRegular(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
                />
                <div>
                  <span className="font-bold text-stone-200 block">
                    ⭐ Регулярный турнир
                  </span>
                  <span className="text-[11px] text-stone-400 block">
                    Турнир или лига, в которой я играю регулярно на постоянной основе
                  </span>
                </div>
              </label>

              {/* Notes */}
              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1">
                  Заметки / Регламент
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Дополнительные условия, гандикапы, время старта"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  {editingId ? 'Сохранить изменения' : 'Создать турнир'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPLETE TOURNAMENT (FINAL PLACEMENT & RECAP COMMENTARY) */}
      {/* ========================================================================= */}
      {completingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Фиксация результатов
                  </span>
                  <h3 className="text-base font-bold text-stone-100 font-display">
                    Завершить турнир «{completingTournament.name}»
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCompletingTournament(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-4 text-xs">
              {/* Optional Field 1: Final Placement */}
              <div>
                <label className="block uppercase font-semibold text-stone-300 mb-1.5">
                  Занятое место (опционально):
                </label>
                <input
                  type="text"
                  value={completionPlacement}
                  onChange={(e) => setCompletionPlacement(e.target.value)}
                  placeholder="Например: 1-е место 🥇, 2-е место, Топ-8, Финалист"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
                />

                {/* Quick place suggestions */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-stone-500">Быстрый выбор:</span>
                  {['1-е место 🥇', '2-е место 🥈', '3-е место 🥉', 'Топ-8', 'Топ-16', 'Финал'].map((place) => (
                    <button
                      key={place}
                      type="button"
                      onClick={() => setCompletionPlacement(place)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                        completionPlacement === place
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                          : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {place}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Field 2: Recap Commentary */}
              <div>
                <label className="block uppercase font-semibold text-stone-300 mb-1.5">
                  Комментарий и итоги турнира (опционально):
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Как играло масло, переходы по дорожкам, удачные шары, выводы на будущее..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingTournament(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Сохранить и завершить турнир</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TOURNAMENT DETAILS & COMPREHENSIVE STATISTICS */}
      {/* ========================================================================= */}
      <TournamentDetailModal
        tournament={selectedDetailTournament}
        isOpen={!!selectedDetailTournament}
        onClose={() => setSelectedDetailTournament(null)}
        matches={matches}
        oilPatterns={userConfig.oilPatterns}
        onStartPlay={(tourn) => {
          handleSelectForActivePlay(tourn);
        }}
        onEdit={(tourn) => {
          setSelectedDetailTournament(null);
          openEditModal(tourn);
        }}
        onCompleteTournament={(tourn) => {
          setSelectedDetailTournament(null);
          handleOpenCompleteModal(tourn);
        }}
      />

      {/* Modal to add a new oil pattern with screenshot/photo */}
      <OilPatternModal
        isOpen={isNewPatternModalOpen}
        onClose={() => setIsNewPatternModalOpen(false)}
        onSave={(newPattern) => {
          if (onUpdateUserConfig) {
            onUpdateUserConfig({
              ...userConfig,
              oilPatterns: [newPattern, ...userConfig.oilPatterns],
              activeOilPatternId: newPattern.id,
            });
          }
          setOilPatternId(newPattern.id);
          setIsNewPatternModalOpen(false);
          if (onNotification) {
            onNotification(`Программа масла "${newPattern.name}" сохранена`);
          }
        }}
        initialPattern={null}
      />

      {/* Lightbox viewer for oil diagram screenshot */}
      <OilDiagramViewerModal
        isOpen={!!viewingPattern}
        onClose={() => setViewingPattern(null)}
        pattern={viewingPattern}
      />
    </div>
  );
};
