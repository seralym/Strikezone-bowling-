import React from 'react';
import { PinNumber, AppLanguage } from '../types/bowling';
import { getTranslation } from '../utils/i18n';
import { Undo2, CheckCircle2, RotateCcw } from 'lucide-react';

interface ControlsProps {
  standingPins: PinNumber[];
  selectedPins: PinNumber[];
  onConfirmPinSelection: () => void;
  onQuickCount: (count: number) => void;
  onStrike: () => void;
  onSpare: () => void;
  onFoul: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isGameFinished: boolean;
  onFinishAndSave: () => void;
  onNewGame: () => void;
  isFirstRollOfFrame: boolean;
  language?: AppLanguage;
}

export const Controls: React.FC<ControlsProps> = ({
  standingPins,
  selectedPins,
  onConfirmPinSelection,
  onQuickCount,
  onStrike,
  onSpare,
  onFoul,
  onUndo,
  canUndo,
  isGameFinished,
  onFinishAndSave,
  onNewGame,
  isFirstRollOfFrame,
  language = 'ru',
}) => {
  const t = getTranslation(language);
  const maxAvailable = standingPins.length;
  const isAllStanding = maxAvailable === 10;
  const hasSelection = selectedPins.length > 0;

  if (isGameFinished) {
    return (
      <div className="rounded-2xl bg-stone-900 border border-stone-800 p-6 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-stone-100 font-display">
            {t.gameCompletedTitle}
          </h3>
          <p className="text-sm text-stone-400 mt-1">
            {t.gameCompletedDesc}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onFinishAndSave}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 active:scale-95"
          >
            {t.saveGameToHistoryBtn}
          </button>
          <button
            type="button"
            onClick={onNewGame}
            className="px-5 py-2.5 rounded-xl bg-stone-800 text-stone-200 font-semibold hover:bg-stone-700 transition-colors active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.nextGameBtn}</span>
          </button>
          {canUndo && (
            <button
              type="button"
              onClick={onUndo}
              className="px-4 py-2.5 rounded-xl bg-stone-800/80 text-stone-400 hover:text-stone-200 text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <Undo2 className="w-4 h-4" />
              <span>{t.undoBtn}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary Action Button (If pins are selected on deck) */}
      {hasSelection && (
        <button
          type="button"
          onClick={onConfirmPinSelection}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-extrabold text-base shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 animate-in fade-in duration-150"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>
            {t.confirmThrowBtn}: {selectedPins.length} / {maxAvailable}
          </span>
        </button>
      )}

      {/* Second Panel: Quick Action Functions (Страйк, Спэр, Фол, Желоб) */}
      <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500/90">
            {t.quickFunctions}
          </span>

          {canUndo && (
            <button
              type="button"
              onClick={onUndo}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors flex items-center gap-1.5"
              title={t.undoBtn}
            >
              <Undo2 className="w-3.5 h-3.5 text-stone-400" />
              <span>{t.undoBtn}</span>
            </button>
          )}
        </div>

        {/* 4 Main Quick Function Buttons: Strike, Spare, Foul, Gutter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Strike button */}
          <button
            type="button"
            disabled={!isAllStanding}
            onClick={onStrike}
            className={`py-3.5 px-3 rounded-xl font-bold text-sm sm:text-base flex flex-col items-center justify-center transition-all ${
              isAllStanding
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-amber-300/40'
                : 'bg-stone-800/40 text-stone-600 cursor-not-allowed border border-stone-800'
            }`}
          >
            <span className="text-2xl font-black font-mono leading-none">X</span>
            <span className="text-xs mt-1">{t.strikeBtn}</span>
          </button>

          {/* Spare button */}
          <button
            type="button"
            disabled={isFirstRollOfFrame || maxAvailable === 0}
            onClick={onSpare}
            className={`py-3.5 px-3 rounded-xl font-bold text-sm sm:text-base flex flex-col items-center justify-center transition-all ${
              !isFirstRollOfFrame && maxAvailable > 0
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-emerald-300/40'
                : 'bg-stone-800/40 text-stone-600 cursor-not-allowed border border-stone-800'
            }`}
          >
            <span className="text-2xl font-black font-mono leading-none">/</span>
            <span className="text-xs mt-1">{t.spareBtn} ({maxAvailable})</span>
          </button>

          {/* Foul (Заступ) button */}
          <button
            type="button"
            onClick={onFoul}
            className="py-3.5 px-3 rounded-xl font-bold text-sm sm:text-base flex flex-col items-center justify-center bg-stone-900 border border-red-500/40 text-red-400 hover:bg-red-950/60 transition-all active:scale-[0.98]"
            title={t.foulBtn}
          >
            <span className="text-2xl font-black font-mono leading-none flex items-center gap-1">
              F
            </span>
            <span className="text-xs mt-1">{t.foulBtn}</span>
          </button>

          {/* Gutter / Miss (0) button */}
          <button
            type="button"
            onClick={() => onQuickCount(0)}
            className="py-3.5 px-3 rounded-xl font-bold text-sm sm:text-base flex flex-col items-center justify-center bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all active:scale-[0.98] border border-stone-700/50"
            title={t.gutterBtn}
          >
            <span className="text-2xl font-black font-mono leading-none">-</span>
            <span className="text-xs mt-1">{t.gutterBtn}</span>
          </button>
        </div>

        {/* Quick count buttons: 0 to maxAvailable */}
        <div className="pt-2 border-t border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase">
              {t.quickPinsCount}:
            </span>
            <span className="text-[11px] text-stone-500">
              {t.maxPins}: {maxAvailable}
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 sm:gap-2">
            {Array.from({ length: 11 }, (_, i) => i).map((count) => {
              const isAllowed = count <= maxAvailable;
              return (
                <button
                  key={count}
                  type="button"
                  disabled={!isAllowed}
                  onClick={() => onQuickCount(count)}
                  className={`h-11 sm:h-12 rounded-xl font-mono text-base font-bold transition-all flex items-center justify-center ${
                    isAllowed
                      ? 'bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-100 active:scale-95 border border-stone-700/60'
                      : 'bg-stone-900/40 text-stone-600 border border-stone-800/40 cursor-not-allowed'
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
