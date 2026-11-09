import React from 'react';
import { LaneTransitionRule } from '../types/bowling';
import { TRANSITION_RULES } from '../utils/laneTransition';
import { Shuffle, ArrowRightLeft, Hash, Repeat } from 'lucide-react';

export interface LaneTransitionSettingsProps {
  rule: LaneTransitionRule;
  onChangeRule: (rule: LaneTransitionRule) => void;
  seedNumber?: number | '';
  onChangeSeedNumber?: (seed: number | '') => void;
  seedParity?: 'even' | 'odd';
  onChangeSeedParity?: (parity: 'even' | 'odd') => void;
  customStep?: number;
  onChangeCustomStep?: (step: number) => void;
  laneMin?: number | '';
  onChangeLaneMin?: (min: number | '') => void;
  laneMax?: number | '';
  onChangeLaneMax?: (max: number | '') => void;
  totalLanes?: number | '';
  onChangeTotalLanes?: (total: number | '') => void;
  defaultMaxLanes?: number;
}

export const LaneTransitionSettings: React.FC<LaneTransitionSettingsProps> = ({
  rule,
  onChangeRule,
  seedNumber = '',
  onChangeSeedNumber,
  seedParity = 'even',
  onChangeSeedParity,
  customStep = 2,
  onChangeCustomStep,
  laneMin = 1,
  onChangeLaneMin,
  laneMax = 24,
  onChangeLaneMax,
  defaultMaxLanes = 24,
}) => {
  const isSeedRule =
    rule === 'seed_even_left_odd_right' || rule === 'seed_even_right_odd_left';
  const isCustomStep = rule === 'custom_step';

  const effectiveSeedParity =
    typeof seedNumber === 'number' && seedNumber > 0
      ? seedNumber % 2 === 0
        ? 'even'
        : 'odd'
      : seedParity;

  const handleSeedNumberChange = (valStr: string) => {
    if (!onChangeSeedNumber) return;
    if (!valStr) {
      onChangeSeedNumber('');
      return;
    }
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      onChangeSeedNumber(val);
      if (onChangeSeedParity) {
        onChangeSeedParity(val % 2 === 0 ? 'even' : 'odd');
      }
    }
  };

  const handleParityClick = (parity: 'even' | 'odd') => {
    if (onChangeSeedParity) onChangeSeedParity(parity);
    if (onChangeSeedNumber && typeof seedNumber === 'number' && seedNumber > 0) {
      // If current seed doesn't match parity, adjust by 1
      if ((parity === 'even' && seedNumber % 2 !== 0) || (parity === 'odd' && seedNumber % 2 === 0)) {
        onChangeSeedNumber(seedNumber + 1);
      }
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Shuffle className="w-3.5 h-3.5 text-amber-400" />
          <span>Регламент перехода по дорожкам</span>
        </label>
        <span className="text-[10px] text-stone-500 font-medium">После каждой партии</span>
      </div>

      {/* Main Select */}
      <select
        value={rule}
        onChange={(e) => onChangeRule(e.target.value as LaneTransitionRule)}
        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
      >
        {TRANSITION_RULES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Seed Options if Seed-based transition */}
      {isSeedRule && (
        <div className="p-3 rounded-lg bg-stone-900/90 border border-amber-500/30 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-200 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span>Номер посева / жребия</span>
            </span>
            <span className="text-[11px] text-amber-300 font-mono">
              {effectiveSeedParity === 'even' ? 'Чётный' : 'Нечётный'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                min={1}
                max={999}
                value={seedNumber}
                onChange={(e) => handleSeedNumberChange(e.target.value)}
                placeholder="Ваш номер (напр. 14)"
                className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleParityClick('even')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveSeedParity === 'even'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                Чётный
              </button>
              <button
                type="button"
                onClick={() => handleParityClick('odd')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveSeedParity === 'odd'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                Нечётный
              </button>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 bg-stone-950/60 p-2 rounded-lg border border-stone-800/60 flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {rule === 'seed_even_left_odd_right'
                ? effectiveSeedParity === 'even'
                  ? 'С чётным посевом смещение идёт ВЛЕВО (-1 дорожка)'
                  : 'С нечётным посевом смещение идёт ВПРАВО (+1 дорожка)'
                : effectiveSeedParity === 'even'
                ? 'С чётным посевом смещение идёт ВПРАВО (+1 дорожка)'
                : 'С нечётным посевом смещение идёт ВЛЕВО (-1 дорожка)'}
            </span>
          </div>
        </div>
      )}

      {/* Custom step input */}
      {isCustomStep && (
        <div className="p-3 rounded-lg bg-stone-900/90 border border-stone-800 space-y-2 animate-in fade-in duration-200">
          <label className="block text-xs font-bold text-stone-200">
            Шаг смещения по дорожкам (+ вправо / - влево)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customStep}
              onChange={(e) => onChangeCustomStep && onChangeCustomStep(parseInt(e.target.value, 10) || 0)}
              className="w-24 px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-1 flex-wrap">
              {[1, 2, 4, -1, -2, -4].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => onChangeCustomStep && onChangeCustomStep(step)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    customStep === step
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {step > 0 ? `+${step}` : step}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Circular wrapping range (Дорожки клуба с ... по ...) */}
      {rule !== 'none' && (
        <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-stone-300 flex items-center gap-1">
              <Repeat className="w-3 h-3 text-cyan-400" />
              <span>Задействованные дорожки (зацикливание переходов)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-stone-500 block mb-0.5">С дорожки №</span>
              <input
                type="number"
                min={1}
                max={128}
                value={laneMin}
                onChange={(e) => onChangeLaneMin && onChangeLaneMin(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="1"
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <span className="text-[10px] text-stone-500 block mb-0.5">По дорожку №</span>
              <input
                type="number"
                min={1}
                max={128}
                value={laneMax}
                onChange={(e) => onChangeLaneMax && onChangeLaneMax(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder={String(defaultMaxLanes)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <p className="text-[10px] text-stone-500">
            При переходе за пределы диапазона расчёт зациклится (напр. с {laneMax || defaultMaxLanes}-й на {laneMin || 1}-ю).
          </p>
        </div>
      )}
    </div>
  );
};
