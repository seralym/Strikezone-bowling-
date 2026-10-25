import React, { useEffect, useRef } from 'react';
import {
  X,
  Target,
  Settings,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  Globe,
  Home,
  BookOpen,
} from 'lucide-react';
import {
  UserPersonalConfig,
  TournamentConfig,
  AppLanguage,
  AppSettings,
  MainAppView,
} from '../types/bowling';
import { getTranslation } from '../utils/i18n';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: MainAppView;
  onSelectView: (view: MainAppView) => void;
  onSelectCurrentGame: () => void;
  onStartNewGame: () => void;
  onOpenNewTournament: () => void;
  userConfig: UserPersonalConfig;
  activeTournament?: TournamentConfig | null;
  activeSessionInfo?: {
    hasActive: boolean;
    title: string;
    subtitle: string;
    type: 'tournament' | 'practice' | 'game' | 'none';
  };
  settings: AppSettings;
  onToggleSound: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  onSelectCurrentGame,
  onStartNewGame,
  onOpenNewTournament,
  userConfig,
  activeTournament,
  activeSessionInfo,
  settings,
  onToggleSound,
}) => {
  const t = getTranslation(settings.language);
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle swipe left inside drawer to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;
    if (deltaX < -50) {
      onClose();
    }
    touchStartXRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Container */}
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 w-84 max-w-[85vw] h-full bg-stone-950 border-r border-stone-800 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-250 select-none"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center font-black text-stone-950 text-xl shadow-md shadow-amber-500/20">
                🎳
              </div>
              <div>
                <span className="font-extrabold text-stone-100 text-lg font-display tracking-tight block">
                  {t.menuTitle}
                </span>
                <span className="text-[11px] text-stone-400 block">
                  {t.menuSubtitle}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-900 transition-colors"
              aria-label="Закрыть меню"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Player Quick Card (Clicking jumps to profile) */}
          <div
            onClick={() => {
              onSelectView('profile');
              onClose();
            }}
            className="mt-4 p-3 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/50 hover:bg-stone-900 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                {userConfig.avatarUrl ? (
                  <img
                    src={userConfig.avatarUrl}
                    alt={userConfig.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userConfig.name ? userConfig.name.charAt(0).toUpperCase() : 'B'
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                  {userConfig.name}
                </div>
                <div className="text-[11px] text-stone-400 group-hover:text-amber-400/90 transition-colors">
                  {t.playerProfile}
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Navigation Items (Home, Practice, Game, Tournaments, Arsenal, Profile, Settings) */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {/* 1. ГЛАВНАЯ (ТИТУЛЬНЫЙ ЭКРАН) */}
          <button
            type="button"
            onClick={() => {
              onSelectView('home');
              onClose();
            }}
            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all text-left ${
              activeView === 'home'
                ? 'bg-amber-500/15 border border-amber-500/40 text-stone-100 shadow-sm'
                : 'text-stone-300 hover:bg-stone-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  activeView === 'home'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-amber-400'
                }`}
              >
                <Home className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Главная</div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Быстрый доступ ко всем функциям
                </div>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                activeView === 'home' ? 'text-amber-400 translate-x-0.5' : 'text-stone-600'
              }`}
            />
          </button>

          {/* 2. ПРАКТИКА */}
          <button
            type="button"
            onClick={() => {
              onSelectView('practice');
              onClose();
            }}
            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all text-left ${
              activeView === 'practice'
                ? 'bg-amber-500/15 border border-amber-500/40 text-stone-100 shadow-sm'
                : 'text-stone-300 hover:bg-stone-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  activeView === 'practice'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-amber-400'
                }`}
              >
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Практика</div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Отработка сплитов (7-10) и кеглей со статистикой
                </div>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                activeView === 'practice' ? 'text-amber-400 translate-x-0.5' : 'text-stone-600'
              }`}
            />
          </button>

          {/* 3. ТЕКУЩАЯ ИГРА (ПЕРЕХОД К АКТИВНОЙ СЕССИИ ИЛИ ВЫБОР РЕЖИМА) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectCurrentGame();
            }}
            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all text-left ${
              activeView === 'game' || (activeSessionInfo?.hasActive && activeSessionInfo.type === 'practice' && activeView === 'practice')
                ? 'bg-amber-500/15 border border-amber-500/40 text-stone-100 shadow-sm'
                : 'text-stone-300 hover:bg-stone-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-lg relative shrink-0 ${
                  activeView === 'game'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : activeSessionInfo?.hasActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-stone-900 text-emerald-400'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {activeSessionInfo?.hasActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-stone-950 animate-pulse" />
                )}
              </div>
              <div className="min-w-0 truncate">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">Текущая игра</span>
                  {activeSessionInfo?.hasActive && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Активна
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                  {activeSessionInfo?.subtitle || 'Классическая игра из 10 фреймов'}
                </div>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform shrink-0 ${
                activeView === 'game' ? 'text-amber-400 translate-x-0.5' : 'text-stone-600'
              }`}
            />
          </button>

          <div className="h-px bg-stone-800/80 my-2" />

          {/* 4. ТУРНИРЫ */}
          <button
            type="button"
            onClick={() => {
              onSelectView('tournaments');
              onClose();
            }}
            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all text-left ${
              activeView === 'tournaments'
                ? 'bg-amber-500/15 border border-amber-500/40 text-stone-100 shadow-sm'
                : 'text-stone-300 hover:bg-stone-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  activeView === 'tournaments'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-amber-400'
                }`}
              >
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Турниры и лиги</div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Регулярные турниры, центры, масло и даты
                </div>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                activeView === 'tournaments' ? 'text-amber-400 translate-x-0.5' : 'text-stone-600'
              }`}
            />
          </button>


          {/* 6. ЗАМЕТКИ */}
          <button
            type="button"
            onClick={() => {
              onSelectView('notes');
              onClose();
            }}
            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all text-left ${
              activeView === 'notes'
                ? 'bg-amber-500/15 border border-amber-500/40 text-stone-100 shadow-sm'
                : 'text-stone-300 hover:bg-stone-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  activeView === 'notes'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-cyan-400'
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Заметки</div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Дневник боулера, наблюдения и разбор игр
                </div>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                activeView === 'notes' ? 'text-amber-400 translate-x-0.5' : 'text-stone-600'
              }`}
            />
          </button>

          {/* 7. НАСТРОЙКИ */}
          <button
            type="button"
            onClick={() => {
              onSelectView('settings');
              onClose();
            }}
            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all text-left ${
              activeView === 'settings'
                ? 'bg-amber-500/15 border border-amber-500/40 text-stone-100 shadow-sm'
                : 'text-stone-300 hover:bg-stone-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  activeView === 'settings'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-purple-400'
                }`}
              >
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">{t.settings}</div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Звук, тема оформления и выбор языка (6 языков)
                </div>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                activeView === 'settings' ? 'text-amber-400 translate-x-0.5' : 'text-stone-600'
              }`}
            />
          </button>
        </div>

        {/* Drawer Bottom Controls */}
        <div className="p-4 border-t border-stone-800 space-y-2 bg-stone-950">
          {/* Quick Sound Switch */}
          <button
            type="button"
            onClick={onToggleSound}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-900 text-stone-300 hover:text-stone-100 hover:bg-stone-800 text-xs font-semibold transition-colors flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-500" />
              )}
              <span>{t.soundEffects}</span>
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                settings.soundEnabled
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'bg-stone-800 text-stone-500'
              }`}
            >
              {settings.soundEnabled ? t.soundOn : t.soundOff}
            </span>
          </button>

          {/* Current language tag */}
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Язык: {settings.language.toUpperCase()}</span>
            </span>
            <span className="font-mono text-stone-400">v1.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
