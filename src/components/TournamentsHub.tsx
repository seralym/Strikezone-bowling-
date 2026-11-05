import React, { useState } from 'react';
import {
  SavedTournament,
  TournamentStage,
  TournamentFormatType,
  UserPersonalConfig,
  TournamentConfig,
  AppSettings,
  MatchRecord,
  OilPattern,
} from '../types/bowling';
import { getTranslation } from '../utils/i18n';
import { computeTournamentSummary, isMatchInTournament } from '../utils/bowlingEngine';
import { toggleMatchIncludeInStats } from '../utils/storage';
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
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Clock,
  CheckCircle2,
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
  onUpdateMatches?: (matches: MatchRecord[]) => void;
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
  onUpdateMatches,
}) => {
  const t = getTranslation(settings.language);

  // Filter: 'all' | 'series' | 'single' | 'active' | 'completed'
  const [filter, setFilter] = useState<'all' | 'series' | 'single' | 'active' | 'completed'>('all');

  // Accordion expansion states
  // tournamentId -> boolean (expanded stages)
  const [expandedTournaments, setExpandedTournaments] = useState<Record<string, boolean>>({});
  // stageId -> boolean (expanded games in stage)
  const [expandedStageGames, setExpandedStageGames] = useState<Record<string, boolean>>({});
  // tournamentId -> boolean (expanded games for single tournament)
  const [expandedSingleGames, setExpandedSingleGames] = useState<Record<string, boolean>>({});

  // Modal State for Add / Edit Tournament
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Tournament Form Fields
  const [name, setName] = useState<string>('');
  const [tournamentType, setTournamentType] = useState<TournamentFormatType>('single');
  const [season, setSeason] = useState<string>('');
  const [includeInStats, setIncludeInStats] = useState<boolean>(true);
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

  // Modal State for Stage Add / Edit
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [stageTournamentId, setStageTournamentId] = useState<string | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageName, setStageName] = useState<string>('');
  const [stageStartDate, setStageStartDate] = useState<string>('');
  const [stageEndDate, setStageEndDate] = useState<string>('');
  const [stageCenterId, setStageCenterId] = useState<string>('');
  const [stageCenterMode, setStageCenterMode] = useState<'preset' | 'custom'>('preset');
  const [stageCustomCenter, setStageCustomCenter] = useState<string>('');
  const [stageOilPatternId, setStageOilPatternId] = useState<string>('');
  const [stageOilPatternMode, setStageOilPatternMode] = useState<'preset' | 'custom'>('preset');
  const [stageCustomOilPattern, setStageCustomOilPattern] = useState<string>('');
  const [stageLaneNumber, setStageLaneNumber] = useState<number | ''>('');
  const [stageIncludeInStats, setStageIncludeInStats] = useState<boolean>(true);
  const [stageNotes, setStageNotes] = useState<string>('');

  // Modal State for Tournament Completion
  const [completingTournament, setCompletingTournament] = useState<SavedTournament | null>(null);
  const [completionPlacement, setCompletionPlacement] = useState<string>('');
  const [completionNotes, setCompletionNotes] = useState<string>('');

  // Modal State for Tournament Detail & Stats
  const [selectedDetailTournament, setSelectedDetailTournament] = useState<SavedTournament | null>(null);

  // Oil Pattern Modal State for creating new pattern with screenshot/photo
  const [isNewPatternModalOpen, setIsNewPatternModalOpen] = useState(false);
  const [viewingPattern, setViewingPattern] = useState<OilPattern | null>(null);

  const currentFormPattern = userConfig.oilPatterns.find((p) => p.id === oilPatternId);

  // Toggle stage accordion expansion
  const toggleTournamentExpand = (id: string) => {
    setExpandedTournaments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStageGamesExpand = (stageId: string) => {
    setExpandedStageGames((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const toggleSingleGamesExpand = (tournId: string) => {
    setExpandedSingleGames((prev) => ({ ...prev, [tournId]: !prev[tournId] }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setTournamentType('single');
    setSeason(new Date().getFullYear().toString());
    setIncludeInStats(true);
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
    setTournamentType(tourn.tournamentType || (tourn.stages && tourn.stages.length > 0 ? 'series' : 'single'));
    setSeason(tourn.season || (tourn.startDate ? new Date(tourn.startDate).getFullYear().toString() : new Date().getFullYear().toString()));
    setIncludeInStats(tourn.includeInStats !== false);
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

  const handleSaveTournament = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const isSeriesTourn = tournamentType === 'series';
    const finalTournamentName =
      name.trim() ||
      (isSeriesTourn
        ? `Серия турниров ${season ? `(${season})` : ''}`
        : `Турнир от ${startDate || new Date().toLocaleDateString('ru-RU')}`);

    const center = userConfig.centers.find((c) => c.id === centerId) || userConfig.centers[0];
    const pattern = userConfig.oilPatterns.find((p) => p.id === oilPatternId) || userConfig.oilPatterns[0];
    const ball = userConfig.balls.find((b) => b.id === ballId) || userConfig.balls[0];

    if (editingId) {
      // Edit existing
      const updated = savedTournaments.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            name: finalTournamentName,
            tournamentType,
            season: isSeriesTourn ? (season.trim() || item.season || new Date().getFullYear().toString()) : undefined,
            includeInStats,
            // If series, center and oil pattern are determined per stage
            centerId: isSeriesTourn ? item.centerId : centerId,
            centerName: isSeriesTourn ? item.centerName : (center ? center.name : item.centerName),
            startDate: isSeriesTourn ? item.startDate : startDate,
            endDate: isSeriesTourn ? item.endDate : endDate,
            oilPatternId: isSeriesTourn ? item.oilPatternId : oilPatternId,
            oilPatternName: isSeriesTourn ? item.oilPatternName : (pattern ? pattern.name : item.oilPatternName),
            ballId: isSeriesTourn ? item.ballId : ballId,
            ballName: isSeriesTourn ? item.ballName : (ball ? ball.name : item.ballName),
            laneNumber: isSeriesTourn ? item.laneNumber : (typeof laneNumber === 'number' ? laneNumber : undefined),
            format: format.trim(),
            isRegular,
            notes: notes.trim(),
          };
        }
        return item;
      });
      onSaveTournaments(updated);
      if (onNotification) onNotification(isSeriesTourn ? 'Серия турниров обновлена' : 'Турнир успешно обновлён');
    } else {
      // Create new
      const newTournament: SavedTournament = isSeriesTourn
        ? {
            id: `tourn_${Date.now()}`,
            name: finalTournamentName,
            tournamentType: 'series',
            season: season.trim() || new Date().getFullYear().toString(),
            includeInStats,
            stages: [], // empty stages list, user will add each stage with its own center, dates and pattern
            isRegular,
            status: 'active',
            notes: notes.trim(),
            createdAt: new Date().toISOString(),
          }
        : {
            id: `tourn_${Date.now()}`,
            name: finalTournamentName,
            tournamentType: 'single',
            includeInStats,
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
      if (onNotification) {
        onNotification(
          isSeriesTourn
            ? 'Серия турниров создана! Добавьте этапы с индивидуальными параметрами клубов и масла.'
            : 'Новый турнир добавлен в список'
        );
      }
      if (isSeriesTourn) {
        setExpandedTournaments((prev) => ({ ...prev, [newTournament.id]: true }));
      }
    }

    setIsModalOpen(false);
  };

  const handleDeleteTournament = (id: string) => {
    if (window.confirm('Удалить этот турнир из списка? Сыгранные игры сохранятся в истории матчей.')) {
      const updated = savedTournaments.filter((t) => t.id !== id);
      onSaveTournaments(updated);
      if (onNotification) onNotification('Турнир удалён из списка');
    }
  };

  // Toggle Tournament Stats Exclusion
  const handleToggleTournamentStats = (tournId: string) => {
    const updated = savedTournaments.map((t) => {
      if (t.id === tournId) {
        const nextVal = !(t.includeInStats !== false);
        return { ...t, includeInStats: nextVal };
      }
      return t;
    });
    onSaveTournaments(updated);
    const target = updated.find((t) => t.id === tournId);
    if (onNotification) {
      onNotification(
        target?.includeInStats !== false
          ? `Турнир «${target?.name}» включён в зачёт общей статистики`
          : `Турнир «${target?.name}» исключён из общей статистики (вне зачёта)`
      );
    }
  };

  // Stage Modal Management
  const openAddStageModal = (tournament: SavedTournament) => {
    setStageTournamentId(tournament.id);
    setEditingStageId(null);
    const nextNum = (tournament.stages?.length || 0) + 1;
    setStageName(`${nextNum}-й этап`);
    setStageStartDate(new Date().toISOString().slice(0, 10));
    setStageEndDate(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10));

    // Default center from userConfig if available
    if (userConfig.centers.length > 0) {
      setStageCenterMode('preset');
      setStageCenterId(userConfig.activeCenterId || userConfig.centers[0]?.id || '');
      setStageCustomCenter('');
    } else {
      setStageCenterMode('custom');
      setStageCenterId('');
      setStageCustomCenter('');
    }

    // Default oil pattern from userConfig if available
    if (userConfig.oilPatterns.length > 0) {
      setStageOilPatternMode('preset');
      setStageOilPatternId(userConfig.activeOilPatternId || userConfig.oilPatterns[0]?.id || '');
      setStageCustomOilPattern('');
    } else {
      setStageOilPatternMode('custom');
      setStageOilPatternId('');
      setStageCustomOilPattern('');
    }

    setStageLaneNumber(3);
    setStageIncludeInStats(true);
    setStageNotes('');
    setIsStageModalOpen(true);
  };

  const openEditStageModal = (tournamentId: string, stage: TournamentStage) => {
    setStageTournamentId(tournamentId);
    setEditingStageId(stage.id);
    setStageName(stage.name);
    setStageStartDate(stage.startDate || new Date().toISOString().slice(0, 10));
    setStageEndDate(stage.endDate || stage.startDate || new Date().toISOString().slice(0, 10));

    // Center preset vs custom detection
    const centerMatch = userConfig.centers.find((c) => c.id === stage.centerId);
    if (centerMatch) {
      setStageCenterMode('preset');
      setStageCenterId(stage.centerId || '');
      setStageCustomCenter('');
    } else if (stage.centerName) {
      setStageCenterMode('custom');
      setStageCenterId('');
      setStageCustomCenter(stage.centerName);
    } else {
      setStageCenterMode(userConfig.centers.length > 0 ? 'preset' : 'custom');
      setStageCenterId(userConfig.centers[0]?.id || '');
      setStageCustomCenter('');
    }

    // Oil pattern preset vs custom detection
    const patternMatch = userConfig.oilPatterns.find((p) => p.id === stage.oilPatternId);
    if (patternMatch) {
      setStageOilPatternMode('preset');
      setStageOilPatternId(stage.oilPatternId || '');
      setStageCustomOilPattern('');
    } else if (stage.oilPatternName) {
      setStageOilPatternMode('custom');
      setStageOilPatternId('');
      setStageCustomOilPattern(stage.oilPatternName);
    } else {
      setStageOilPatternMode(userConfig.oilPatterns.length > 0 ? 'preset' : 'custom');
      setStageOilPatternId(userConfig.oilPatterns[0]?.id || '');
      setStageCustomOilPattern('');
    }

    setStageLaneNumber(typeof stage.laneNumber === 'number' ? stage.laneNumber : '');
    setStageIncludeInStats(stage.includeInStats !== false);
    setStageNotes(stage.notes || '');
    setIsStageModalOpen(true);
  };

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageTournamentId) return;

    const centerPreset = userConfig.centers.find((c) => c.id === stageCenterId);
    const finalCenterName =
      stageCenterMode === 'custom'
        ? stageCustomCenter.trim() || 'Пользовательский клуб'
        : (centerPreset?.name || 'Основной клуб');
    const finalCenterId = stageCenterMode === 'custom' ? '' : stageCenterId;

    const patternPreset = userConfig.oilPatterns.find((p) => p.id === stageOilPatternId);
    const finalOilName =
      stageOilPatternMode === 'custom'
        ? stageCustomOilPattern.trim() || 'Пользовательское масло'
        : (patternPreset?.name || 'Стандартное масло');
    const finalOilId = stageOilPatternMode === 'custom' ? '' : stageOilPatternId;

    const updated = savedTournaments.map((t) => {
      if (t.id === stageTournamentId) {
        const currentStages = t.stages || [];
        if (editingStageId) {
          // Edit existing stage
          const nextStages = currentStages.map((s) => {
            if (s.id === editingStageId) {
              return {
                ...s,
                name: stageName.trim() || 'Этап',
                startDate: stageStartDate,
                endDate: stageEndDate,
                centerId: finalCenterId,
                centerName: finalCenterName,
                oilPatternId: finalOilId,
                oilPatternName: finalOilName,
                laneNumber: typeof stageLaneNumber === 'number' ? stageLaneNumber : undefined,
                includeInStats: stageIncludeInStats,
                notes: stageNotes.trim() || undefined,
              };
            }
            return s;
          });
          return { ...t, stages: nextStages };
        } else {
          // Add new stage
          const newStage: TournamentStage = {
            id: `stg_${Date.now()}`,
            name: stageName.trim() || `${currentStages.length + 1}-й этап`,
            startDate: stageStartDate,
            endDate: stageEndDate,
            centerId: finalCenterId,
            centerName: finalCenterName,
            oilPatternId: finalOilId,
            oilPatternName: finalOilName,
            laneNumber: typeof stageLaneNumber === 'number' ? stageLaneNumber : undefined,
            includeInStats: stageIncludeInStats,
            status: 'active',
            notes: stageNotes.trim() || undefined,
          };
          return { ...t, stages: [...currentStages, newStage] };
        }
      }
      return t;
    });

    onSaveTournaments(updated);
    setIsStageModalOpen(false);
    if (onNotification) onNotification(editingStageId ? 'Параметры этапа обновлены' : 'Новый этап добавлен в турнир');
    setExpandedTournaments((prev) => ({ ...prev, [stageTournamentId]: true }));
  };

  const handleDeleteStage = (tournamentId: string, stageId: string, stageTitle: string) => {
    if (window.confirm(`Удалить этап «${stageTitle}»? Сыгранные в нём игры останутся в истории.`)) {
      const updated = savedTournaments.map((t) => {
        if (t.id === tournamentId && t.stages) {
          return { ...t, stages: t.stages.filter((s) => s.id !== stageId) };
        }
        return t;
      });
      onSaveTournaments(updated);
      if (onNotification) onNotification(`Этап «${stageTitle}» удалён`);
    }
  };

  const handleToggleStageStats = (tournamentId: string, stageId: string) => {
    const updated = savedTournaments.map((t) => {
      if (t.id === tournamentId && t.stages) {
        const nextStages = t.stages.map((s) => {
          if (s.id === stageId) {
            return { ...s, includeInStats: !(s.includeInStats !== false) };
          }
          return s;
        });
        return { ...t, stages: nextStages };
      }
      return t;
    });
    onSaveTournaments(updated);
    if (onNotification) onNotification('Статус учёта этапа в статистике изменён');
  };

  // Toggle single game/match stats inclusion
  const handleToggleMatchStats = (matchId: string) => {
    const updated = toggleMatchIncludeInStats(matchId);
    if (onUpdateMatches) onUpdateMatches(updated);
    if (onNotification) onNotification('Статус учёта игры в статистике изменён');
  };

  // Select for active play (single or specific stage)
  const handleSelectForActivePlay = (tourn: SavedTournament, stage?: TournamentStage) => {
    const isSeries = tourn.tournamentType === 'series' || (tourn.stages && tourn.stages.length > 0);

    const activeCenterId = stage ? (stage.centerId || '') : (tourn.centerId || userConfig.centers[0]?.id || '');
    const center = userConfig.centers.find((c) => c.id === activeCenterId);
    const finalCenterName =
      stage?.centerName ||
      (center ? center.name : (tourn.centerName || 'Основной клуб'));

    const activePatternId = stage ? (stage.oilPatternId || '') : (tourn.oilPatternId || userConfig.oilPatterns[0]?.id || '');
    const pattern = userConfig.oilPatterns.find((p) => p.id === activePatternId);
    const finalPatternName =
      stage?.oilPatternName ||
      (pattern ? pattern.name : (tourn.oilPatternName || 'Стандартное масло'));

    const config: TournamentConfig = {
      tournamentId: tourn.id,
      tournamentName: tourn.name,
      tournamentType: tourn.tournamentType || (isSeries ? 'series' : 'single'),
      stageId: stage?.id,
      stageName: stage?.name,
      centerId: activeCenterId,
      centerName: finalCenterName,
      startDate: stage?.startDate || tourn.startDate || new Date().toISOString().slice(0, 10),
      endDate: stage?.endDate || tourn.endDate || tourn.startDate || new Date().toISOString().slice(0, 10),
      oilPatternId: activePatternId,
      oilPatternName: finalPatternName,
      ballId: tourn.ballId || userConfig.balls[0]?.id || '',
      ballName: tourn.ballName || 'Основной шар',
      laneNumber: stage?.laneNumber ?? tourn.laneNumber,
      includeInStats: (tourn.includeInStats !== false) && (stage ? stage.includeInStats !== false : true),
    };

    onSelectActiveTournament(config);
    if (onNotification) {
      onNotification(
        stage
          ? `Выбран этап «${stage.name}» серии «${tourn.name}»!`
          : `Турнир «${tourn.name}» выбран в качестве активного!`
      );
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
    if (filter === 'series') return t.tournamentType === 'series' || (t.stages && t.stages.length > 0);
    if (filter === 'single') return t.tournamentType === 'single' || (!t.stages || t.stages.length === 0);
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
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Главная</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-100 font-display flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>Турниры и серии с этапами</span>
            </h1>
            <p className="text-xs text-stone-400">
              Управляйте одиночными кубками и многоэтапными сезонами, настраивайте зачёт статистики и записывайте игры
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Создать турнир / Серию</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-stone-900 border border-stone-800 w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Все ({savedTournaments.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('series')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            filter === 'series'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Серии с этапами ({savedTournaments.filter((t) => t.tournamentType === 'series' || (t.stages && t.stages.length > 0)).length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('single')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'single'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Одиночные ({savedTournaments.filter((t) => t.tournamentType !== 'series' && (!t.stages || t.stages.length === 0)).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
        <div className="rounded-2xl bg-stone-900/50 border border-stone-800 p-8 sm:p-12 text-center text-stone-400 space-y-3">
          <Trophy className="w-10 h-10 mx-auto text-stone-600" />
          <h4 className="text-base font-bold text-stone-200">Турниров в данной категории не найдено</h4>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Создайте одиночный турнир или годовую серию с отдельными этапами, чтобы вести статистику соревнований
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Создать соревнование
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTournaments.map((tourn) => {
            const isCurrentlyActive = activeTournament?.tournamentId === tourn.id;
            const stats = computeTournamentSummary(tourn, matches);
            const isSeries = tourn.tournamentType === 'series' || (tourn.stages && tourn.stages.length > 0);
            const stagesCount = tourn.stages?.length || 0;
            const isExpanded = !!expandedTournaments[tourn.id];
            const isTournInStats = tourn.includeInStats !== false;

            return (
              <div
                key={tourn.id}
                className={`rounded-2xl bg-stone-900/90 border transition-all p-5 space-y-4 shadow-md ${
                  !isTournInStats ? 'opacity-85 border-dashed border-stone-700 bg-stone-900/50' : 'border-stone-800 hover:border-stone-700'
                } ${
                  isCurrentlyActive
                    ? 'ring-1 ring-amber-500/40 border-amber-500/50 shadow-amber-500/10'
                    : ''
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Format Badge */}
                      {isSeries ? (
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider bg-cyan-950/80 border border-cyan-700/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Layers className="w-3 h-3 text-cyan-400" />
                          <span>Серия ({stagesCount} {stagesCount === 1 ? 'этап' : stagesCount > 4 ? 'этапов' : 'этапа'})</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider bg-stone-800 border border-stone-700 px-2 py-0.5 rounded-md">
                          Одиночный турнир
                        </span>
                      )}

                      {/* Regular Badge */}
                      {tourn.isRegular && (
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          ⭐ Регулярный
                        </span>
                      )}

                      {/* Status Badge */}
                      {tourn.status === 'completed' ? (
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>Завершён {tourn.finalPlacement ? `· ${tourn.finalPlacement}` : ''}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          Активный
                        </span>
                      )}

                      {/* Active in play */}
                      {isCurrentlyActive && (
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>В игре {activeTournament?.stageName ? `(${activeTournament.stageName})` : ''}</span>
                        </span>
                      )}

                      {/* Stats inclusion indicator button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTournamentStats(tourn.id);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer border ${
                          isTournInStats
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/60'
                            : 'bg-amber-950/60 text-amber-400 border-amber-600/40 hover:bg-amber-900/60'
                        }`}
                        title={isTournInStats ? 'Турнир учитывается в общей статистике. Нажмите, чтобы исключить.' : 'Турнир исключён из общей статистики (вне зачёта). Нажмите, чтобы включить.'}
                      >
                        {isTournInStats ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>В зачёте</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-amber-400" />
                            <span>Вне зачёта</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h3
                      onClick={() => setSelectedDetailTournament(tourn)}
                      className="text-lg sm:text-xl font-extrabold text-stone-100 font-display hover:text-amber-400 transition-colors cursor-pointer truncate"
                      title="Нажмите для детальной аналитики турнира"
                    >
                      {tourn.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(tourn)}
                      className="p-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 transition-colors cursor-pointer"
                      title="Редактировать параметры турнира"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTournament(tourn.id)}
                      className="p-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-500 hover:text-red-400 hover:border-red-950/50 transition-colors cursor-pointer"
                      title="Удалить турнир"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Overall season summary metrics strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-stone-950/90 border border-stone-800/80 text-xs text-center">
                  <div className="p-1.5">
                    <span className="text-[10px] text-stone-500 uppercase block font-semibold">Игр всего</span>
                    <span className="font-mono font-bold text-stone-100 text-sm sm:text-base">{stats.gamesPlayed}</span>
                  </div>
                  <div className="p-1.5">
                    <span className="text-[10px] text-stone-500 uppercase block font-semibold">Ср. счёт</span>
                    <span className="font-mono font-bold text-amber-400 text-sm sm:text-base">{stats.averageScore || '—'}</span>
                  </div>
                  <div className="p-1.5">
                    <span className="text-[10px] text-stone-500 uppercase block font-semibold">Рекорд</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">{stats.highScore || '—'}</span>
                  </div>
                  <div className="p-1.5">
                    <span className="text-[10px] text-stone-500 uppercase block font-semibold">Сумма очков</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm sm:text-base">{stats.totalPinfall}</span>
                  </div>
                </div>

                {/* Dates & Default conditions */}
                {isSeries ? (
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-400">
                    <span className="flex items-center gap-1.5 text-stone-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Сезон / Год: <strong className="text-amber-300 font-bold">{tourn.season || '2026'}</strong></span>
                    </span>
                    <span className="text-stone-700">·</span>
                    <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md text-[11px]">
                      <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>Клубы и натирка масла: индивидуально по каждому этапу</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1.5 text-stone-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {tourn.startDate ? new Date(tourn.startDate).toLocaleDateString('ru-RU') : '—'}
                        {' — '}
                        {tourn.endDate ? new Date(tourn.endDate).toLocaleDateString('ru-RU') : '—'}
                      </span>
                    </span>
                    <span className="text-stone-700">·</span>
                    <span className="flex items-center gap-1.5 text-stone-300">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{tourn.centerName || 'Центр не указан'}</span>
                    </span>
                    <span className="text-stone-700">·</span>
                    <span className="flex items-center gap-1.5 text-stone-300">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{tourn.oilPatternName || 'Масло не указано'}</span>
                    </span>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* HIERARCHICAL STAGE EXPANSION (FOR SERIES TOURNAMENTS) */}
                {/* ========================================================================= */}
                {isSeries && (
                  <div className="pt-2 border-t border-stone-800/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTournamentExpand(tourn.id)}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer py-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>
                          {isExpanded ? 'Скрыть этапы' : `Показать этапы (${stagesCount})`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openAddStageModal(tourn)}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-amber-400" />
                        <span>Добавить этап</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2.5 pl-2 sm:pl-3 border-l-2 border-amber-500/30">
                        {(!tourn.stages || tourn.stages.length === 0) ? (
                          <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-xs text-stone-400 text-center">
                            Этапы ещё не добавлены. Нажмите «Добавить этап», чтобы внести 1-й этап серии с индивидуальным клубом и натиркой масла.
                          </div>
                        ) : (
                          tourn.stages.map((stage) => {
                            const stageMatches = matches.filter((m) => isMatchInTournament(m, tourn, stage.id));
                            const stageSummary = computeTournamentSummary(tourn, matches, undefined, stage.id);
                            const isStageActiveInPlay = activeTournament?.tournamentId === tourn.id && activeTournament?.stageId === stage.id;
                            const isStageInStats = stage.includeInStats !== false;
                            const areStageGamesOpen = !!expandedStageGames[stage.id];

                            // Matching pattern for oil diagram preview
                            const matchingStagePattern = userConfig.oilPatterns.find(
                              (p) =>
                                (stage.oilPatternId && p.id === stage.oilPatternId) ||
                                (stage.oilPatternName && p.name.toLowerCase() === stage.oilPatternName.toLowerCase())
                            );

                            return (
                              <div
                                key={stage.id}
                                className={`p-3.5 rounded-xl bg-stone-950/90 border transition-all space-y-2.5 ${
                                  !isStageInStats ? 'opacity-85 border-dashed border-stone-700' : 'border-stone-800/80 hover:border-stone-700'
                                } ${isStageActiveInPlay ? 'ring-1 ring-amber-400/40 border-amber-500/50' : ''}`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <span className="font-extrabold text-stone-100 text-sm">
                                      {stage.name}
                                    </span>

                                    {/* Stage Stats toggle */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStageStats(tourn.id, stage.id)}
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border cursor-pointer ${
                                        isStageInStats
                                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                                          : 'bg-amber-950/60 text-amber-400 border-amber-600/40'
                                      }`}
                                      title={isStageInStats ? 'Этап учитывается в общей статистике' : 'Этап исключён из общей статистики (вне зачёта)'}
                                    >
                                      {isStageInStats ? <Eye className="w-2.5 h-2.5 text-emerald-400" /> : <EyeOff className="w-2.5 h-2.5 text-amber-400" />}
                                      <span>{isStageInStats ? 'В зачёте' : 'Вне зачёта'}</span>
                                    </button>

                                    {stage.startDate && (
                                      <span className="text-[11px] text-stone-400 font-mono">
                                        ({new Date(stage.startDate).toLocaleDateString('ru-RU')})
                                      </span>
                                    )}

                                    {isStageActiveInPlay && (
                                      <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
                                        Активный в игре
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                    <button
                                      type="button"
                                      onClick={() => handleSelectForActivePlay(tourn, stage)}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                                    >
                                      <Play className="w-3 h-3 fill-current" />
                                      <span>Играть этап</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => openEditStageModal(tourn.id, stage)}
                                      className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 cursor-pointer"
                                      title="Редактировать этап"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStage(tourn.id, stage.id, stage.name)}
                                      className="p-1 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 cursor-pointer"
                                      title="Удалить этап"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Stage conditions & metrics strip */}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 bg-stone-900/70 p-2.5 rounded-xl border border-stone-800/80">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="flex items-center gap-1.5 text-stone-300">
                                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span>Клуб: <strong className="text-stone-100">{stage.centerName || 'Не указан'}</strong></span>
                                    </span>
                                    <span className="text-stone-700">·</span>
                                    <span className="flex items-center gap-1.5 text-cyan-300">
                                      <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                      <span>Масло: <strong className="text-cyan-300 font-semibold">{stage.oilPatternName || 'Не указано'}</strong></span>
                                    </span>

                                    {/* Quick diagram preview button */}
                                    {matchingStagePattern?.imageUrl && (
                                      <button
                                        type="button"
                                        onClick={() => setViewingPattern(matchingStagePattern)}
                                        className="px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-700/60 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                        title="Посмотреть схему масла этапа"
                                      >
                                        <ImageIcon className="w-3 h-3" />
                                        <span>Схема</span>
                                      </button>
                                    )}

                                    {stage.laneNumber && (
                                      <>
                                        <span className="text-stone-700">·</span>
                                        <span className="text-stone-300">
                                          Дорожка: <strong className="text-stone-100 font-mono">{stage.laneNumber}</strong>
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 font-mono text-[11px] bg-stone-950/80 px-2 py-1 rounded-lg border border-stone-800">
                                    <span>Игр: <strong className="text-stone-100">{stageSummary.gamesPlayed}</strong></span>
                                    <span>Ср: <strong className="text-amber-400">{stageSummary.averageScore || '—'}</strong></span>
                                    <span>Рекорд: <strong className="text-emerald-400">{stageSummary.highScore || '—'}</strong></span>
                                  </div>
                                </div>

                                {/* Stage games toggle */}
                                {stageMatches.length > 0 && (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => toggleStageGamesExpand(stage.id)}
                                      className="text-[11px] font-bold text-stone-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                                    >
                                      {areStageGamesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      <span>Сыгранные игры этапа ({stageMatches.length})</span>
                                    </button>

                                    {areStageGamesOpen && (
                                      <div className="mt-2 space-y-1.5 pl-2 border-l border-stone-800">
                                        {stageMatches.map((m, mIdx) => {
                                          const p = m?.players?.[0];
                                          const isGameInStats = m.includeInStats !== false;
                                          return (
                                            <div
                                              key={m.id}
                                              className={`p-2 rounded-lg bg-stone-900/90 border flex items-center justify-between text-xs ${
                                                !isGameInStats ? 'opacity-70 border-dashed border-stone-700' : 'border-stone-800'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2 min-w-0">
                                                <span className="font-mono text-stone-500 text-[10px]">#{mIdx + 1}</span>
                                                <span className="font-mono font-bold text-amber-400">{p?.totalScore || 0} очков</span>
                                                <span className="text-[11px] text-stone-400 truncate">
                                                  {new Date(m.date).toLocaleDateString('ru-RU')}
                                                </span>
                                              </div>

                                              <button
                                                type="button"
                                                onClick={() => handleToggleMatchStats(m.id)}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border cursor-pointer ${
                                                  isGameInStats
                                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                                                    : 'bg-amber-950/60 text-amber-400 border-amber-600/40'
                                                }`}
                                                title={isGameInStats ? 'Игра учитывается в статистике' : 'Игра исключена из статистики'}
                                              >
                                                {isGameInStats ? <Eye className="w-2.5 h-2.5 text-emerald-400" /> : <EyeOff className="w-2.5 h-2.5 text-amber-400" />}
                                                <span>{isGameInStats ? 'В зачёте' : 'Вне зачёта'}</span>
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Single tournament games list */}
                {!isSeries && stats.gamesPlayed > 0 && (
                  <div className="pt-2 border-t border-stone-800/80">
                    <button
                      type="button"
                      onClick={() => toggleSingleGamesExpand(tourn.id)}
                      className="text-xs font-bold text-stone-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                    >
                      {expandedSingleGames[tourn.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>Сыгранные игры турнира ({stats.gamesPlayed})</span>
                    </button>

                    {expandedSingleGames[tourn.id] && (
                      <div className="mt-2 space-y-1.5 pl-2 border-l border-stone-800">
                        {stats.matches.map((m, mIdx) => {
                          const p = m?.players?.[0];
                          const isGameInStats = m.includeInStats !== false;
                          return (
                            <div
                              key={m.id}
                              className={`p-2 rounded-lg bg-stone-950/90 border flex items-center justify-between text-xs ${
                                !isGameInStats ? 'opacity-70 border-dashed border-stone-700' : 'border-stone-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-stone-500 text-[10px]">#{mIdx + 1}</span>
                                <span className="font-mono font-bold text-amber-400">{p?.totalScore || 0} очков</span>
                                <span className="text-[11px] text-stone-400 truncate">
                                  {new Date(m.date).toLocaleDateString('ru-RU')} {m.laneNumber ? `· Дор. ${m.laneNumber}` : ''}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleToggleMatchStats(m.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border cursor-pointer ${
                                  isGameInStats
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                                    : 'bg-amber-950/60 text-amber-400 border-amber-600/40'
                                }`}
                                title={isGameInStats ? 'Игра учитывается в статистике' : 'Игра исключена из статистики'}
                              >
                                {isGameInStats ? <Eye className="w-2.5 h-2.5 text-emerald-400" /> : <EyeOff className="w-2.5 h-2.5 text-amber-400" />}
                                <span>{isGameInStats ? 'В зачёте' : 'Вне зачёта'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Action buttons */}
                <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailTournament(tourn)}
                    className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
                    title="Посмотреть статистику и все игры этого турнира"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Статистика ({stats.gamesPlayed})</span>
                  </button>

                  {tourn.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenCompleteModal(tourn)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
                      title="Редактировать итоги или занятое место"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Итоги</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenCompleteModal(tourn)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-stone-800 hover:bg-emerald-950/40 text-stone-300 hover:text-emerald-300 border border-stone-700 hover:border-emerald-500/40 flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
                      title="Завершить турнир и внести занятое место"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Завершить</span>
                    </button>
                  )}

                  {!isSeries && (
                    tourn.status !== 'completed' ? (
                      <button
                        type="button"
                        onClick={() => handleSelectForActivePlay(tourn)}
                        className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
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
                        className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 transition-colors cursor-pointer"
                        title="Возобновить турнир"
                      >
                        Возобновить
                      </button>
                    )
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
                <span>{editingId ? 'Редактировать соревнование' : 'Создать турнир или серию'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTournament} className="space-y-4 text-xs">
              {/* FORMAT SWITCHER: SINGLE VS SERIES */}
              <div>
                <label className="block uppercase font-bold text-stone-300 mb-1.5">
                  Формат соревнования:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-stone-950 border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setTournamentType('single')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tournamentType === 'single'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Одиночный турнир</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTournamentType('series')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tournamentType === 'series'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Серия / С этапами</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  {tournamentType === 'series'
                    ? 'Годовой чемпионат или кубок: можно создавать отдельные этапы (1-й, 2-й, финал) со своими датами и маслом'
                    : 'Разовый чемпионат или турнирный день с одной программой масла'}
                </p>
              </div>

              {/* ========================================================================= */}
              {/* SERIES TOURNAMENT FORM FIELDS */}
              {/* ========================================================================= */}
              {tournamentType === 'series' ? (
                <>
                  {/* Series Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block uppercase font-semibold text-stone-400">
                        Название серии / чемпионата *
                      </label>
                      <span className="text-[10px] text-stone-500 font-normal">Опционально</span>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Например: Чемпионат области 2026 или Годовой кубок лиги"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Season / Year */}
                  <div>
                    <label className="block uppercase font-semibold text-stone-400 mb-1">
                      Год / Сезон проведения
                    </label>
                    <input
                      type="text"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      placeholder="Например: 2026 или Сезон 2025/2026"
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  {/* Information Banner for Series */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-200 text-xs flex items-start gap-3">
                    <Layers className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold block text-stone-100">
                        Индивидуальные параметры для каждого этапа
                      </span>
                      <span className="text-[11px] text-stone-300 block leading-relaxed">
                        В серии боулинг-центр, программа масла и даты проведения задаются индивидуально для каждого конкретного этапа, так как этапы могут проходить в разных клубах и на разном масле.
                      </span>
                    </div>
                  </div>

                  {/* STATS INCLUSION TOGGLE */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInStats}
                      onChange={(e) => setIncludeInStats(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        {includeInStats ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="font-bold text-stone-200">
                          Учитывать серию в общей статистике
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 block mt-0.5">
                        {includeInStats
                          ? 'Игры этапов серии пойдут в расчёт общего среднего счёта и рекордов'
                          : 'Игры этапов останутся в истории серии, но будут помечены «Вне зачёта»'}
                      </span>
                    </div>
                  </label>

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
                        ⭐ Регулярная серия / Чемпионат
                      </span>
                      <span className="text-[11px] text-stone-400 block">
                        Отметить как постоянное регулярное соревнование
                      </span>
                    </div>
                  </label>

                  {/* Notes */}
                  <div>
                    <label className="block uppercase font-semibold text-stone-400 mb-1">
                      Заметки / Регламент серии
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Регламент серии, начисление очков, условия выхода в финал"
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              ) : (
                /* ========================================================================= */
                /* SINGLE TOURNAMENT FORM FIELDS */
                /* ========================================================================= */
                <>
                  {/* Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block uppercase font-semibold text-stone-400">
                        Название турнира
                      </label>
                      <span className="text-[10px] text-stone-500 font-normal">Опционально</span>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Необязательно (по умолчанию Турнир от даты)"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* STATS INCLUSION TOGGLE */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInStats}
                      onChange={(e) => setIncludeInStats(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        {includeInStats ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="font-bold text-stone-200">
                          Учитывать в общей статистике
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 block mt-0.5">
                        {includeInStats
                          ? 'Игры турнира будут учитываться в основном среднем счёте игрока и рекордах'
                          : 'Игры турнира останутся в истории, но не будут влиять на общий зачёт (вне зачёта)'}
                      </span>
                    </div>
                  </label>

                  {/* Dates: Start & End */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block uppercase font-semibold text-stone-400 mb-1">
                        Дата начала
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block uppercase font-semibold text-stone-400 mb-1">
                        Дата окончания
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Center */}
                  <div>
                    <label className="block uppercase font-semibold text-stone-400 mb-1">
                      Основной боулинг-центр *
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
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
                        Формат регламента
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
                        Соревнование или лига, в которой я играю на постоянной основе
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
                </>
              )}

              {/* Buttons */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {editingId ? 'Сохранить изменения' : 'Создать соревнование'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT STAGE IN SERIES */}
      {/* ========================================================================= */}
      {isStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base sm:text-lg font-bold text-stone-100 font-display flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <span>{editingStageId ? 'Редактировать этап' : 'Добавить этап серии'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsStageModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="space-y-3.5 text-xs">
              <div>
                <label className="block uppercase font-bold text-stone-400 mb-1">
                  Название этапа *
                </label>
                <input
                  type="text"
                  required
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="Например: 1-й этап (Январь), Полуфинал, Финал"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block uppercase font-semibold text-stone-400 mb-1">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={stageStartDate}
                    onChange={(e) => setStageStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block uppercase font-semibold text-stone-400 mb-1">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={stageEndDate}
                    onChange={(e) => setStageEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Stage Bowling Center (Preset vs Custom) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block uppercase font-semibold text-stone-400">
                    Боулинг-центр этапа *
                  </label>
                  <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setStageCenterMode('preset')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        stageCenterMode === 'preset'
                          ? 'bg-amber-500 text-stone-950'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Из базы ({userConfig.centers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageCenterMode('custom')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        stageCenterMode === 'custom'
                          ? 'bg-amber-500 text-stone-950'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Вручную
                    </button>
                  </div>
                </div>

                {stageCenterMode === 'preset' ? (
                  userConfig.centers.length > 0 ? (
                    <select
                      value={stageCenterId}
                      onChange={(e) => setStageCenterId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    >
                      {userConfig.centers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.city ? `(${c.city})` : ''} · {c.surface || 'Синтетика'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2 text-stone-400 text-xs">
                      <span>В базе пока нет сохранённых клубов</span>
                      <button
                        type="button"
                        onClick={() => setStageCenterMode('custom')}
                        className="text-amber-400 font-bold hover:underline cursor-pointer"
                      >
                        Ввести вручную
                      </button>
                    </div>
                  )
                ) : (
                  <input
                    type="text"
                    required
                    value={stageCustomCenter}
                    onChange={(e) => setStageCustomCenter(e.target.value)}
                    placeholder="Например: Боулинг-клуб «Колумбия», ТРЦ Арена"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              {/* Stage Oil Pattern (Preset vs Custom) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block uppercase font-semibold text-stone-400">
                      Программа масла этапа *
                    </label>
                    {stageOilPatternMode === 'preset' && (
                      <button
                        type="button"
                        onClick={() => setIsNewPatternModalOpen(true)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                        title="Добавить новую программу масла и прикрепить фото диаграммы"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>+ С фото</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setStageOilPatternMode('preset')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        stageOilPatternMode === 'preset'
                          ? 'bg-amber-500 text-stone-950'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Из базы ({userConfig.oilPatterns.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageOilPatternMode('custom')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        stageOilPatternMode === 'custom'
                          ? 'bg-amber-500 text-stone-950'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Вручную
                    </button>
                  </div>
                </div>

                {stageOilPatternMode === 'preset' ? (
                  <div className="space-y-1.5">
                    <select
                      value={stageOilPatternId}
                      onChange={(e) => setStageOilPatternId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    >
                      {userConfig.oilPatterns.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.lengthFt} ft) [{p.category}] {p.competitionName ? `· ${p.competitionName}` : ''}
                        </option>
                      ))}
                    </select>

                    {/* Quick view diagram button if selected pattern has image */}
                    {(() => {
                      const selectedPattern = userConfig.oilPatterns.find((p) => p.id === stageOilPatternId);
                      if (selectedPattern?.imageUrl) {
                        return (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300">
                            <span className="flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Прикреплена диаграмма ({selectedPattern.name})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewingPattern(selectedPattern)}
                              className="font-bold underline hover:text-white cursor-pointer"
                            >
                              Смотреть схему
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={stageCustomOilPattern}
                    onChange={(e) => setStageCustomOilPattern(e.target.value)}
                    placeholder="Например: Kegel Route 66 (45ft) или Brunswick Main Street"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              {/* Lane number */}
              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1">
                  Номер дорожки
                </label>
                <input
                  type="number"
                  min={1}
                  max={64}
                  value={stageLaneNumber}
                  onChange={(e) => setStageLaneNumber(e.target.value ? parseInt(e.target.value, 10) : '')}
                  placeholder="Опционально"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Stage include in stats */}
              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stageIncludeInStats}
                  onChange={(e) => setStageIncludeInStats(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
                />
                <div>
                  <span className="font-bold text-stone-200 block text-xs">
                    Учитывать этап в общей статистике
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    Позволяет при необходимости исключить конкретный квалификационный этап из общих подсчётов
                  </span>
                </div>
              </label>

              {/* Stage notes */}
              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1">
                  Заметки к этапу
                </label>
                <input
                  type="text"
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="Особенности этапа, регламент, призы"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {editingStageId ? 'Сохранить этап' : 'Добавить этап'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TOURNAMENT COMPLETION */}
      {/* ========================================================================= */}
      {completingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base sm:text-lg font-bold text-stone-100 font-display flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Завершение турнира</span>
              </h3>
              <button
                type="button"
                onClick={() => setCompletingTournament(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-stone-400 mb-1">
                  Занятое место / Результат:
                </label>
                <input
                  type="text"
                  value={completionPlacement}
                  onChange={(e) => setCompletionPlacement(e.target.value)}
                  placeholder="Например: 1-е место 🥇, Топ-8, 3-е место 🥉"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-stone-400 mb-1">
                  Итоги и комментарий:
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Как прошёл турнир, выводы по дорожкам, шарам и тактике..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingTournament(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Завершить соревнование
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tournament Detail Modal */}
      <TournamentDetailModal
        tournament={selectedDetailTournament}
        isOpen={!!selectedDetailTournament}
        onClose={() => setSelectedDetailTournament(null)}
        matches={matches}
        onStartPlay={(t, stageId) => {
          const stage = t.stages?.find((s) => s.id === stageId);
          handleSelectForActivePlay(t, stage);
        }}
        onEdit={(t) => openEditModal(t)}
        onCompleteTournament={(t) => handleOpenCompleteModal(t)}
        oilPatterns={userConfig.oilPatterns}
        onUpdateMatches={onUpdateMatches}
        onToggleTournamentStats={handleToggleTournamentStats}
      />

      {/* New Oil Pattern modal */}
      <OilPatternModal
        isOpen={isNewPatternModalOpen}
        onClose={() => setIsNewPatternModalOpen(false)}
        onSave={(newPattern) => {
          if (onUpdateUserConfig) {
            onUpdateUserConfig({
              ...userConfig,
              oilPatterns: [newPattern, ...userConfig.oilPatterns],
            });
            setOilPatternId(newPattern.id);
            setStageOilPatternId(newPattern.id);
            setStageOilPatternMode('preset');
            if (onNotification) onNotification(`Программа «${newPattern.name}» добавлена с диаграммой!`);
          }
        }}
        initialPattern={null}
      />

      {/* Diagram Viewer Modal */}
      <OilDiagramViewerModal
        pattern={viewingPattern}
        isOpen={!!viewingPattern}
        onClose={() => setViewingPattern(null)}
      />
    </div>
  );
};
