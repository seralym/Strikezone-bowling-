import React, { useState } from 'react';
import { UserPersonalConfig } from '../types/bowling';
import { X, CircleDot, Droplets, Building2 } from 'lucide-react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  userConfig: UserPersonalConfig;
  onStartGame: (config: {
    title: string;
    laneNumber?: number;
    centerId?: string;
    centerName?: string;
    oilPatternId?: string;
    oilPatternName?: string;
    ballId?: string;
    ballName?: string;
  }) => void;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  userConfig,
  onStartGame,
}) => {
  const [title, setTitle] = useState('Одиночная тренировка');
  const [laneNumber, setLaneNumber] = useState<number | ''>(1);
  const [selectedCenterId, setSelectedCenterId] = useState<string>(
    userConfig.activeCenterId || userConfig.centers[0]?.id || ''
  );
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    userConfig.activeOilPatternId || userConfig.oilPatterns[0]?.id || ''
  );
  const [selectedBallId, setSelectedBallId] = useState<string>(
    userConfig.activeBallId ||
      userConfig.balls.find((b) => b.isPrimaryStrikeBall)?.id ||
      userConfig.balls[0]?.id ||
      ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const center = userConfig.centers.find((c) => c.id === selectedCenterId);
    const pattern = userConfig.oilPatterns.find((p) => p.id === selectedPatternId);
    const ball = userConfig.balls.find((b) => b.id === selectedBallId);

    onStartGame({
      title: title.trim() || 'Игра в боулинг',
      laneNumber: typeof laneNumber === 'number' ? laneNumber : undefined,
      centerId: center?.id,
      centerName: center?.name,
      oilPatternId: pattern?.id,
      oilPatternName: pattern?.name,
      ballId: ball?.id,
      ballName: ball?.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-xl font-bold text-stone-100 font-display">
              Новая персональная игра
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Игрок: <span className="text-amber-400 font-semibold">{userConfig.name}</span> · Выберите условия игры
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Match Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Название партии / Соревнование
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Квалификация, 1-я игра"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Bowling Center Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Боулинг-центр</span>
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

          {/* Lane Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Номер дорожки
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={laneNumber}
              onChange={(e) => setLaneNumber(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="Номер дорожки"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Oil Pattern Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Программа кондиционирования (Масло)</span>
            </label>
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
          </div>

          {/* Ball Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              <CircleDot className="w-3.5 h-3.5 text-amber-400" />
              <span>Основной шар для игры</span>
            </label>
            <select
              value={selectedBallId}
              onChange={(e) => setSelectedBallId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            >
              {userConfig.balls.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.brand}, {b.weightLbs}#, {b.coverstock}) {b.isPrimaryStrikeBall ? '★ Страйковый' : b.isSpareBall ? 'Спэровый' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-stone-400 hover:text-stone-200 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Выйти на дорожку
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
