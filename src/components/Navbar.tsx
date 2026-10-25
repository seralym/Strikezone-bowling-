import React from 'react';
import { Volume2, VolumeX, Plus } from 'lucide-react';

export type NavTab = 'game' | 'arsenal' | 'profile' | 'history' | 'rules';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewGameClick: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onNewGameClick,
  isSoundMuted,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single text wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('game')}
          className="flex items-center gap-2 text-left focus:outline-none shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-stone-950 font-mono text-base shadow-sm">
            🎳
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-stone-100 font-display whitespace-nowrap">
            StrikeZone
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="flex items-center gap-1 sm:gap-5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => onSelectTab('game')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 rounded-lg ${
              activeTab === 'game'
                ? 'text-amber-400 font-semibold bg-stone-900 sm:bg-transparent sm:underline sm:underline-offset-8'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Текущая игра
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('arsenal')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 rounded-lg ${
              activeTab === 'arsenal'
                ? 'text-amber-400 font-semibold bg-stone-900 sm:bg-transparent sm:underline sm:underline-offset-8'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Арсенал и масло
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('profile')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 rounded-lg ${
              activeTab === 'profile'
                ? 'text-amber-400 font-semibold bg-stone-900 sm:bg-transparent sm:underline sm:underline-offset-8'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Профиль и графики
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 rounded-lg ${
              activeTab === 'history'
                ? 'text-amber-400 font-semibold bg-stone-900 sm:bg-transparent sm:underline sm:underline-offset-8'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            История матчей
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('rules')}
            className={`hidden lg:block px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 rounded-lg ${
              activeTab === 'rules'
                ? 'text-amber-400 font-semibold bg-stone-900 sm:bg-transparent sm:underline sm:underline-offset-8'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Правила счёта
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleSoundHandler(isSoundMuted, onToggleSound)}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-900 transition-colors"
            title={isSoundMuted ? 'Включить звук' : 'Выключить звук'}
            aria-label="Звуковые эффекты"
          >
            {isSoundMuted ? (
              <VolumeX className="w-4 h-4 text-stone-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onNewGameClick}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold text-stone-950 bg-amber-500 rounded-xl hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10 active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Новая игра</span>
            <span className="sm:hidden">Игра</span>
          </button>
        </div>
      </div>
    </header>
  );
};

function toggleSoundHandler(_isSoundMuted: boolean, onToggleSound: () => void) {
  return () => onToggleSound();
}
