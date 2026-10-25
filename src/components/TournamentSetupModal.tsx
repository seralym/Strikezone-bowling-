import React, { useState } from 'react';
import { UserPersonalConfig, TournamentConfig, AppLanguage, OilPattern } from '../types/bowling';
import { getTranslation } from '../utils/i18n';
import { OilPatternModal } from './OilPatternModal';
import { OilDiagramViewerModal } from './OilDiagramViewerModal';
import {
  X,
  Trophy,
  Calendar,
  Building2,
  Droplets,
  CircleDot,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  ZoomIn,
} from 'lucide-react';

interface TournamentSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userConfig: UserPersonalConfig;
  onStartTournament: (config: TournamentConfig) => void;
  onAddNewPattern?: (newPattern: OilPattern) => void;
  initialValues?: Partial<TournamentConfig> | null;
  language?: AppLanguage;
}

export const TournamentSetupModal: React.FC<TournamentSetupModalProps> = ({
  isOpen,
  onClose,
  userConfig,
  onStartTournament,
  onAddNewPattern,
  initialValues,
  language = 'ru',
}) => {
  const t = getTranslation(language);
  const todayStr = new Date().toISOString().slice(0, 10);
  const nextDayStr = new Date(Date.now() + 2 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);

  const [tournamentName, setTournamentName] = useState(
    initialValues?.tournamentName || 'Городской турнир по боулингу'
  );
  const [selectedCenterId, setSelectedCenterId] = useState<string>(
    initialValues?.centerId ||
      userConfig.activeCenterId ||
      userConfig.centers[0]?.id ||
      ''
  );
  const [startDate, setStartDate] = useState(
    initialValues?.startDate || todayStr
  );
  const [endDate, setEndDate] = useState(
    initialValues?.endDate || nextDayStr
  );
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    initialValues?.oilPatternId ||
      userConfig.activeOilPatternId ||
      userConfig.oilPatterns[0]?.id ||
      ''
  );
  const [selectedBallId, setSelectedBallId] = useState<string>(
    initialValues?.ballId ||
      userConfig.activeBallId ||
      userConfig.balls.find((b) => b.isPrimaryStrikeBall)?.id ||
      userConfig.balls[0]?.id ||
      ''
  );
  const [laneNumber, setLaneNumber] = useState<number | ''>(
    initialValues?.laneNumber ?? 3
  );

  const [isNewPatternModalOpen, setIsNewPatternModalOpen] = useState(false);
  const [viewingPattern, setViewingPattern] = useState<OilPattern | null>(null);

  const selectedPattern = userConfig.oilPatterns.find((p) => p.id === selectedPatternId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const center = userConfig.centers.find((c) => c.id === selectedCenterId);
    const pattern = userConfig.oilPatterns.find((p) => p.id === selectedPatternId);
    const ball = userConfig.balls.find((b) => b.id === selectedBallId);

    const config: TournamentConfig = {
      tournamentName: tournamentName.trim() || 'Турнир по боулингу',
      centerId: selectedCenterId,
      centerName: center ? center.name : 'Основной центр',
      startDate: startDate || todayStr,
      endDate: endDate || startDate || todayStr,
      oilPatternId: selectedPatternId,
      oilPatternName: pattern ? pattern.name : 'Стандартное масло',
      ballId: selectedBallId,
      ballName: ball ? ball.name : 'Основной шар',
      laneNumber: typeof laneNumber === 'number' ? laneNumber : undefined,
    };

    onStartTournament(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 p-5 sm:p-6 shadow-2xl space-y-5 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-100 font-display">
                {t.tournamentModalTitle}
              </h3>
              <p className="text-xs text-stone-400">
                Игрок: <span className="text-amber-400 font-semibold">{userConfig.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Tournament Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              {t.tournamentNameInput}
            </label>
            <input
              type="text"
              required
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="Например: Чемпионат Федерации, Кубок Мастеров"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 2. Bowling Center */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.venueCenterSelect}</span>
            </label>
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            >
              {userConfig.centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.city ? `(${c.city})` : ''} · {c.surface || 'Синтетика'}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Tournament Dates (С какого по какое) */}
          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.tournamentDatesRange}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">
                  {t.startDateInput}
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">
                  {t.endDateInput}
                </label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Oil Pattern */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.oilPatternSelect}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsNewPatternModalOpen(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                title="Добавить новую программу масла и прикрепить скриншот диаграммы"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Новая с фото</span>
              </button>
            </div>
            <select
              value={selectedPatternId}
              onChange={(e) => setSelectedPatternId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            >
              {userConfig.oilPatterns.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.category}, {p.lengthFt} ft] {p.competitionName ? `— ${p.competitionName}` : ''}
                </option>
              ))}
            </select>

            {/* If selected pattern has screenshot diagram: quick preview button */}
            {selectedPattern?.imageUrl && (
              <div
                onClick={() => setViewingPattern(selectedPattern)}
                className="mt-2 p-2 rounded-xl bg-cyan-950/40 border border-cyan-800/40 hover:border-cyan-500/60 cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors"
                title="Нажмите, чтобы развернуть скриншот диаграммы"
              >
                <div className="flex items-center gap-2 truncate">
                  <img
                    src={selectedPattern.imageUrl}
                    alt={selectedPattern.name}
                    className="w-7 h-7 rounded-lg object-contain bg-black border border-stone-800 shrink-0"
                  />
                  <span className="truncate text-stone-200">
                    Скриншот диаграммы: <strong className="text-cyan-300">{selectedPattern.name}</strong>
                  </span>
                </div>
                <span className="text-cyan-400 text-[11px] font-semibold shrink-0 flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Открыть</span>
                </span>
              </div>
            )}
          </div>

          {/* 5. Ball Selection & Lane */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                <CircleDot className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.ballSelect}</span>
              </label>
              <select
                value={selectedBallId}
                onChange={(e) => setSelectedBallId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
              >
                {userConfig.balls.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.brand}, {b.weightLbs}#, {b.coverstock}) {b.isPrimaryStrikeBall ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                {t.laneNumberInput}
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={laneNumber}
                onChange={(e) =>
                  setLaneNumber(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                }
                placeholder="1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-stone-400 hover:text-stone-200 transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <span>{t.startTournamentBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Modal to add a new oil pattern with screenshot/photo */}
      <OilPatternModal
        isOpen={isNewPatternModalOpen}
        onClose={() => setIsNewPatternModalOpen(false)}
        onSave={(newPattern) => {
          if (onAddNewPattern) {
            onAddNewPattern(newPattern);
          }
          setSelectedPatternId(newPattern.id);
          setIsNewPatternModalOpen(false);
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
