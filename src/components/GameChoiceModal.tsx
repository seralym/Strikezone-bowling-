import React, { useEffect } from 'react';
import {
  X,
  Target,
  RotateCcw,
  Trophy,
  Sparkles,
  ChevronRight,
  Play,
} from 'lucide-react';

interface GameChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: () => void;
  onStartNewGame: () => void;
  onOpenNewTournament: () => void;
}

export const GameChoiceModal: React.FC<GameChoiceModalProps> = ({
  isOpen,
  onClose,
  onStartPractice,
  onStartNewGame,
  onOpenNewTournament,
}) => {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-6 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 z-10 overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 relative">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Активных сессий не найдено</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-100 font-display">
              Выберите режим игры
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Сейчас нет незавершённых партий или тренировок. Что вы хотите запустить?
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Choice Cards */}
        <div className="space-y-3 relative">
          {/* Option 1: Начать практику */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartPractice();
            }}
            className="w-full p-4 rounded-2xl bg-stone-950/80 hover:bg-amber-500/10 border border-stone-800 hover:border-amber-500/50 transition-all text-left group flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:shadow-amber-500/5"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                    Начать практику
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono">
                    Тренировка
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">
                  Отработка сложных сплитов (7-10, угловые) с выбором центра, масла и шара
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>

          {/* Option 2: Новая игра */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartNewGame();
            }}
            className="w-full p-4 rounded-2xl bg-stone-950/80 hover:bg-emerald-500/10 border border-stone-800 hover:border-emerald-500/50 transition-all text-left group flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:shadow-emerald-500/5"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                    Новая игра
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                    10 фреймов
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">
                  Классическая одиночная партия из 10 фреймов с подсчётом очков и страйков
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>

          {/* Option 3: Новый турнир */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNewTournament();
            }}
            className="w-full p-4 rounded-2xl bg-stone-950/80 hover:bg-purple-500/10 border border-stone-800 hover:border-purple-500/50 transition-all text-left group flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:shadow-purple-500/5"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-stone-100 group-hover:text-purple-300 transition-colors">
                    Новый турнир
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold font-mono">
                    Турнир / Лига
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">
                  Создать турнир или лигу с фиксацией дат, клуба, программы масла и шара
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-semibold hover:bg-stone-800/60 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
