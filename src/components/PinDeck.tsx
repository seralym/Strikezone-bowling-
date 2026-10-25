import React from 'react';
import { PinNumber } from '../types/bowling';
import { ALL_PINS } from '../utils/bowlingEngine';

interface PinDeckProps {
  standingBefore: PinNumber[];
  selectedToKnock: PinNumber[];
  onTogglePin: (pin: PinNumber) => void;
  onKnockAll: () => void;
  onKnockNone: () => void;
  isSplit: boolean;
  splitName?: string;
  disabled?: boolean;
}

export const PinDeck: React.FC<PinDeckProps> = ({
  standingBefore,
  selectedToKnock,
  onTogglePin,
  onKnockAll,
  onKnockNone,
  isSplit,
  splitName,
  disabled = false,
}) => {
  // Pin layout rows in bowling:
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

  const knockedCount = selectedToKnock.length;
  const totalStanding = standingBefore.length;

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-stone-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
      {/* Subtle wood lane board background overlay */}
      <div className="absolute inset-0 bg-lane-wood opacity-40 pointer-events-none" />

      {/* Decorative foul line indicator at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600/30 via-red-500 to-red-600/30" />

      {/* Split alert bar (when applicable) */}
      {isSplit && (
        <div className="relative mb-3 flex items-center justify-between pb-2 border-b border-stone-800/80">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold animate-pulse">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />
            <span>{splitName || 'Сплит! Сложная комбинация кеглей'}</span>
          </div>
        </div>
      )}

      {/* Pin Deck Visualization */}
      <div className="relative flex flex-col items-center justify-center py-2 sm:py-3 select-none">
        {pinRows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-center justify-center gap-4 sm:gap-8 my-1.5 sm:my-2"
          >
            {row.map((pin) => {
              const isStandingBefore = standingBefore.includes(pin);
              const isKnockedNow = selectedToKnock.includes(pin);

              // State logic:
              // - If already knocked in previous roll: faint / greyed out
              // - If standing & selected to knock: highlighted with down animation
              // - If standing & not selected: ultra-high contrast glossy white active pin
              return (
                <button
                  key={pin}
                  type="button"
                  disabled={!isStandingBefore || disabled}
                  onClick={() => onTogglePin(pin)}
                  className={`group relative flex flex-col items-center justify-center transition-all duration-200 focus:outline-none ${
                    !isStandingBefore
                      ? 'opacity-20 cursor-not-allowed scale-90'
                      : disabled
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:scale-105 active:scale-95'
                  }`}
                  aria-label={`Кегля номер ${pin}`}
                >
                  {/* Pin Graphic */}
                  <div
                    className={`relative w-11 h-15 sm:w-14 sm:h-19 rounded-t-full rounded-b-2xl flex flex-col items-center justify-between py-1.5 px-1 transition-all ${
                      !isStandingBefore
                        ? 'bg-stone-900 border border-stone-800 text-stone-600 shadow-none'
                        : isKnockedNow
                        ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-200 text-stone-950 shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/60 scale-95 translate-y-1'
                        : 'bg-white border-2 border-stone-100 text-stone-950 shadow-xl shadow-black/40 ring-2 ring-stone-950/80 hover:border-amber-400 hover:ring-amber-500/30'
                    }`}
                  >
                    {/* Head / top highlight */}
                    <div
                      className={`w-4 h-2 rounded-full transition-colors ${
                        isKnockedNow
                          ? 'bg-amber-200'
                          : isStandingBefore
                          ? 'bg-stone-200'
                          : 'bg-stone-800'
                      }`}
                    />

                    {/* Vivid dual red bowling neck stripes for standing pins */}
                    {isStandingBefore && !isKnockedNow && (
                      <div className="w-full flex flex-col items-center gap-0.5 my-0.5 px-0.5">
                        <div className="w-full h-1 bg-red-600 rounded-full shadow-xs" />
                        <div className="w-full h-1 bg-red-600 rounded-full shadow-xs" />
                      </div>
                    )}

                    {/* Pin Number - Extra Bold & Ultra Readable */}
                    <span
                      className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                        isKnockedNow
                          ? 'text-stone-950 font-black'
                          : isStandingBefore
                          ? 'text-stone-950 drop-shadow-xs font-black'
                          : 'text-stone-600'
                      }`}
                    >
                      {pin}
                    </span>

                    {/* Base shadow anchor */}
                    <div
                      className={`w-6 h-1.5 rounded-full ${
                        isKnockedNow
                          ? 'bg-amber-700/60'
                          : isStandingBefore
                          ? 'bg-stone-300'
                          : 'bg-stone-950'
                      }`}
                    />
                  </div>

                  {/* Knocked down badge */}
                  {isKnockedNow && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-300 text-stone-950 rounded-full flex items-center justify-center text-[10px] font-black shadow-md border border-stone-900">
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Quick Select Deck Controls */}
      <div className="relative mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span>Сбито сейчас:</span>
          <span className="font-mono text-amber-400 font-bold text-sm">
            {knockedCount}
          </span>
          <span className="text-stone-600">/</span>
          <span>Останется:</span>
          <span className="font-mono text-stone-300 font-semibold text-sm">
            {totalStanding - knockedCount}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || knockedCount === 0}
            onClick={onKnockNone}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Сбросить выбор (0)
          </button>
          <button
            type="button"
            disabled={disabled || totalStanding === 0 || knockedCount === totalStanding}
            onClick={onKnockAll}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {totalStanding === 10 ? 'Все 10 (Страйк)' : `Все оставшиеся (${totalStanding})`}
          </button>
        </div>
      </div>
    </div>
  );
};
