import React from 'react';
import {
  UserPersonalConfig,
  TournamentConfig,
  AppSettings,
  MainAppView,
  SavedTournament,
  PracticeDrillRecord,
  MatchRecord,
} from '../types/bowling';
import { getTranslation } from '../utils/i18n';
import { BallVisual } from './BallVisual';
import {
  Target,
  Trophy,
  CircleDot,
  Settings,
  Sparkles,
  RotateCcw,
  Building2,
  Droplets,
  Volume2,
  VolumeX,
  MapPin,
  BookOpen,
} from 'lucide-react';

interface HomeScreenProps {
  userConfig: UserPersonalConfig;
  activeTournament?: TournamentConfig | null;
  savedTournaments: SavedTournament[];
  practiceDrills: PracticeDrillRecord[];
  matches: MatchRecord[];
  activeMatch: MatchRecord;
  settings: AppSettings;
  onNavigate: (view: MainAppView) => void;
  onQuickStartPractice: (presetPins?: number[]) => void;
  onStartClassicGame: () => void;
  onOpenTournamentModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userConfig,
  activeTournament,
  savedTournaments,
  practiceDrills,
  matches,
  activeMatch,
  settings,
  onNavigate,
  onQuickStartPractice,
  onStartClassicGame,
  onOpenTournamentModal,
}) => {
  const t = getTranslation(settings.language);

  // Count active regular tournaments
  const regularCount = savedTournaments.filter((t) => t.isRegular).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* 6 MAIN SECTION CARDS (ПРАКТИКА, ТУРНИРЫ, АРСЕНАЛ, ЦЕНТРЫ, МАСЛО, НАСТРОЙКИ) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* ========================================================================= */}
        {/* CARD 1: ПРАКТИКА (БЫВШЕЕ «БЫСТРОЕ НАЧАЛО / ПРАКТИКА») */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 p-5 sm:p-6 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">
                    Отработка бросков
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-100 font-display group-hover:text-amber-300 transition-colors">
                    Практика
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              Выставляйте любую комбинацию кеглей (сплит 7-10, угловые кегли 10 или 7, кастомный расклад) и оттачивайте точность с автоматической статистикой попаданий.
            </p>

            {/* Quick Preset Drill Buttons */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold block">
                Быстрый запуск отработки:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onQuickStartPractice([7, 10])}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-950/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-stone-800 hover:border-amber-500/40 text-xs font-medium transition-all"
                >
                  ⚡ Сплит 7-10
                </button>
                <button
                  type="button"
                  onClick={() => onQuickStartPractice([10])}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-950/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-stone-800 hover:border-amber-500/40 text-xs font-medium transition-all"
                >
                  🎯 10-я кегля
                </button>
                <button
                  type="button"
                  onClick={() => onQuickStartPractice([7])}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-950/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-stone-800 hover:border-amber-500/40 text-xs font-medium transition-all"
                >
                  🎯 7-я кегля
                </button>
                <button
                  type="button"
                  onClick={() => onQuickStartPractice([2, 8, 10])}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-950/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-stone-800 hover:border-amber-500/40 text-xs font-medium transition-all"
                >
                  ⚡ Сплит 2-8-10
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-stone-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('practice')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Target className="w-4 h-4" />
              <span>Открыть практику</span>
            </button>

            <button
              type="button"
              onClick={onStartClassicGame}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
              title="Начать классическую партию из 10 фреймов"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>10 фреймов</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: ТУРНИРЫ */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 p-5 sm:p-6 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">
                    Соревнования & Лиги
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-100 font-display group-hover:text-amber-300 transition-colors">
                    Турниры
                  </h3>
                </div>
              </div>

              {regularCount > 0 && (
                <span className="text-xs text-stone-400 font-medium">
                  {regularCount} регулярных
                </span>
              )}
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              Сохраняйте турниры и лиги, в которых вы регулярно играете, добавляйте новые соревнования, выбирайте боулинг-центр, даты и диаграмму масла.
            </p>

            {/* Tournament status preview */}
            <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 mb-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-medium">Активный турнир:</span>
                <span className="text-amber-400 font-bold truncate max-w-[140px]">
                  {activeTournament?.tournamentName || 'Не выбран'}
                </span>
              </div>
              {activeTournament && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400 pt-1 border-t border-stone-800">
                  <span className="flex items-center gap-1 text-emerald-400 truncate">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span>{activeTournament.centerName}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-stone-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('tournaments')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Trophy className="w-4 h-4" />
              <span>Все турниры</span>
            </button>

            <button
              type="button"
              onClick={onOpenTournamentModal}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
              title="Настроить активный турнир"
            >
              <span>+ Новый</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: АРСЕНАЛ ШАРОВ */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 p-5 sm:p-6 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform">
                  <CircleDot className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 block">
                    Экипировка & Сверление
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-100 font-display group-hover:text-cyan-300 transition-colors">
                    Арсенал шаров
                  </h3>
                </div>
              </div>

              <span className="text-xs text-stone-400 font-medium">
                {userConfig.balls.length} шаров
              </span>
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              Каталог мировых брендов: Storm, Hammer, Roto Grip, Motiv, Ebonite, Brunswick, 900 Global с параметрами сверления (Layout, Pin-to-PAP).
            </p>

            {/* Balls Visual Preview Strip */}
            <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 mb-4">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block mb-2">
                Шары в вашей сумке:
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {userConfig.balls.slice(0, 3).map((ball) => (
                  <div
                    key={ball.id}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-stone-900 border border-stone-800 shrink-0"
                  >
                    <BallVisual
                      primaryColor={ball.primaryColor || ball.color}
                      secondaryColor={ball.secondaryColor}
                      accentColor={ball.accentColor}
                      brand={ball.brand}
                      coverstock={ball.coverstock}
                      size="sm"
                      showHoles={true}
                    />
                    <div className="pr-1.5">
                      <div className="text-xs font-bold text-stone-200 truncate max-w-[80px]">
                        {ball.name}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {ball.weightLbs} lbs
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-stone-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('arsenal')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-cyan-500/20"
            >
              <CircleDot className="w-4 h-4" />
              <span>Открыть арсенал</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 4: БОУЛИНГ-ЦЕНТРЫ (ПЕРЕНЕСЕНО ИЗ АРСЕНАЛА) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-emerald-500/40 p-5 sm:p-6 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block">
                    Клубы & Дорожки
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-100 font-display group-hover:text-emerald-300 transition-colors">
                    Боулинг-центры
                  </h3>
                </div>
              </div>

              <span className="text-xs text-stone-400 font-medium">
                {userConfig.centers.length} центров
              </span>
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              База боулинг-центров и клубов с возможностью указать общее количество дорожек, адреса и тип покрытия (синтетика / дерево).
            </p>

            {/* Centers preview list */}
            <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 mb-4 space-y-2">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                Сохранённые центры:
              </span>
              <div className="space-y-1.5">
                {userConfig.centers.slice(0, 2).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs py-0.5">
                    <span className="font-semibold text-stone-200 truncate max-w-[170px]">{c.name}</span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {c.lanesCount ? `${c.lanesCount} дор.` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-stone-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('centers')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
            >
              <Building2 className="w-4 h-4" />
              <span>Управление центрами</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 5: ПРОГРАММЫ МАСЛА (ПЕРЕНЕСЕНО ИЗ АРСЕНАЛА) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-cyan-500/40 p-5 sm:p-6 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 block">
                    Паттерны & Диаграммы
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-100 font-display group-hover:text-cyan-300 transition-colors">
                    Программы масла
                  </h3>
                </div>
              </div>

              <span className="text-xs text-stone-400 font-medium">
                {userConfig.oilPatterns.length} программ
              </span>
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              Коллекция спортивных и хаус-профилей масла (Kegel, PBA, WTBA) с прикрепленными скриншотами графиков и диаграмм нанесения.
            </p>

            {/* Oil patterns preview */}
            <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 mb-4 space-y-2">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                Актуальные программы:
              </span>
              <div className="space-y-1.5">
                {userConfig.oilPatterns.slice(0, 2).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-0.5">
                    <span className="font-semibold text-stone-200 truncate max-w-[170px]">{p.name}</span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {p.lengthFt} ft
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-stone-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('patterns')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-cyan-500/20"
            >
              <Droplets className="w-4 h-4" />
              <span>Открыть программы масла</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 6: ЗАМЕТКИ БОУЛЕРА (ДНЕВНИК ТРЕНИРОВОК И НАБЛЮДЕНИЙ) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-cyan-500/40 p-5 sm:p-6 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 block">
                    Дневник боулера
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-100 font-display group-hover:text-cyan-300 transition-colors">
                    Заметки
                  </h3>
                </div>
              </div>

              <span className="text-xs text-stone-400 font-medium">
                Анализ & Планы
              </span>
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              Фиксируйте наблюдения по переходам масла, корректировки хвата, тайминга и выводы после турниров.
            </p>

            <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 mb-4 space-y-1.5 text-xs text-stone-300">
              <div className="flex items-center justify-between">
                <span>Категории:</span>
                <span className="font-mono text-cyan-400 text-[11px]">6 разделов</span>
              </div>
              <div className="flex items-center justify-between text-stone-400 text-[11px]">
                <span>Шаблоны:</span>
                <span className="text-stone-300">Тренировки, турниры, масло</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-stone-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('notes')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-cyan-500/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Открыть заметки</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 7: НАСТРОЙКИ (ЗВУК, ТЕМЫ, 6 ЯЗЫКОВ) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-purple-500/40 p-5 sm:p-6 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold shadow-md shadow-purple-500/10 group-hover:scale-105 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 block">
                    Конфигурация
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-100 font-display group-hover:text-purple-300 transition-colors">
                    {t.settings}
                  </h3>
                </div>
              </div>

              <span className="text-xs text-stone-400 font-medium uppercase font-mono">
                {settings.language}
              </span>
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-4">
              Управление звуковыми эффектами броска и падения кеглей, выбор визуальной темы оформления и переключение языка интерфейса.
            </p>

            {/* Settings preview indicators */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 mb-4 text-xs">
              <div className="flex items-center gap-2 text-stone-300">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-stone-500" />
                )}
                <span>Звуки: {settings.soundEnabled ? 'Вкл' : 'Выкл'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="capitalize truncate">Тема: {settings.theme}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-stone-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Перейти в настройки</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
