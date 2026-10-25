import React, { useState, useMemo } from 'react';
import {
  PinNumber,
  UserPersonalConfig,
  PracticeDrillRecord,
  AppSettings,
} from '../types/bowling';
import { getTranslation } from '../utils/i18n';
import { BallVisual } from './BallVisual';
import {
  Target,
  Check,
  X,
  RotateCcw,
  Save,
  ArrowLeft,
  Flame,
  Sparkles,
  TrendingUp,
  CircleDot,
  History,
  Info,
  Calendar,
  Award,
  Building2,
  Droplets,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPinCrashSound, playGutterSound, playSpareSound } from '../utils/audio';

interface PracticeDrillViewProps {
  userConfig: UserPersonalConfig;
  practiceDrills: PracticeDrillRecord[];
  onSaveDrills: (drills: PracticeDrillRecord[]) => void;
  settings: AppSettings;
  onBackToHome: () => void;
  initialPins?: number[];
  onNotification?: (msg: string) => void;
  onSessionStateChange?: (hasActiveAttempts: boolean) => void;
}

interface DrillPreset {
  id: string;
  name: string;
  pins: PinNumber[];
  category: 'split' | 'single' | 'cluster';
  difficulty: 'Легко' | 'Средне' | 'Сложно' | 'Экстрим';
  description: string;
}

const DRILL_PRESETS: DrillPreset[] = [
  {
    id: 'split_7_10',
    name: 'Сплит 7-10 (Bedposts)',
    pins: [7, 10],
    category: 'split',
    difficulty: 'Экстрим',
    description: 'Самый знаменитый и сложный сплит в боулинге. Добивается через отскок кегли от задней стенки или желоба.',
  },
  {
    id: 'single_10',
    name: '10-я кегля (Правый угол)',
    pins: [10],
    category: 'single',
    difficulty: 'Средне',
    description: 'Главный враг правши при броске на страйк. Отработка прямого броска пластиковым шаром через третью стрелку.',
  },
  {
    id: 'single_7',
    name: '7-я кегля (Левый угол)',
    pins: [7],
    category: 'single',
    difficulty: 'Средне',
    description: 'Угловая левая кегля. Отработка точной диагональной траектории справа налево.',
  },
  {
    id: 'split_2_8_10',
    name: 'Сплит 2-8-10',
    pins: [2, 8, 10],
    category: 'split',
    difficulty: 'Сложно',
    description: 'Спящая 8-я кегля за 2-й плюс далекая 10-я. Требуется направить 2-ю кеглю направо.',
  },
  {
    id: 'split_4_7_10',
    name: 'Сплит 4-7-10 (Sour Apple)',
    pins: [4, 7, 10],
    category: 'split',
    difficulty: 'Сложно',
    description: 'Классический угловой сплит. Необходим перевод 4-й кегли через весь пиндек.',
  },
  {
    id: 'baby_split_3_10',
    name: 'Бэби-сплит 3-10',
    pins: [3, 10],
    category: 'split',
    difficulty: 'Легко',
    description: 'Мягкое скольжение между кеглями с касанием обеих стенок.',
  },
  {
    id: 'baby_split_2_7',
    name: 'Бэби-сплит 2-7',
    pins: [2, 7],
    category: 'split',
    difficulty: 'Легко',
    description: 'Левый бэби-сплит, отличное упражнение для отработки точности прихода.',
  },
  {
    id: 'bucket_2_4_5_8',
    name: 'Bucket (Ведро 2-4-5-8)',
    pins: [2, 4, 5, 8],
    category: 'cluster',
    difficulty: 'Средне',
    description: 'Четыре кегли ромбом. Требуется точное попадание в центр кармана связки.',
  },
  {
    id: 'washout_1_2_4_10',
    name: 'Washout (1-2-4-10)',
    pins: [1, 2, 4, 10],
    category: 'split',
    difficulty: 'Сложно',
    description: 'Головная кегля на месте, но 10-я осталась стоять. Нужно срезать 1-ю кеглю в угол.',
  },
  {
    id: 'greek_church_4_6_7_8_10',
    name: 'Греческая церковь (4-6-7-8-10)',
    pins: [4, 6, 7, 8, 10],
    category: 'split',
    difficulty: 'Экстрим',
    description: 'Редкий тяжелый сплит из пяти кеглей с обеих сторон дорожки.',
  },
];

export const PracticeDrillView: React.FC<PracticeDrillViewProps> = ({
  userConfig,
  practiceDrills,
  onSaveDrills,
  settings,
  onBackToHome,
  initialPins,
  onNotification,
  onSessionStateChange,
}) => {
  const t = getTranslation(settings.language);

  // Sub-tab: Active Practice vs Past History
  const [activeTab, setActiveTab] = useState<'drill' | 'history'>('drill');

  // Selected target pins on the deck
  const [targetPins, setTargetPins] = useState<PinNumber[]>(() => {
    if (initialPins && initialPins.length > 0) {
      return initialPins as PinNumber[];
    }
    return [7, 10]; // Default: 7-10 Split
  });

  // Name of the current drill
  const [drillName, setDrillName] = useState<string>('Сплит 7-10');

  // Selected bowling center for practice
  const [selectedCenterId, setSelectedCenterId] = useState<string>(
    userConfig.activeCenterId || userConfig.centers[0]?.id || ''
  );

  // Selected oil pattern for practice
  const [selectedOilPatternId, setSelectedOilPatternId] = useState<string>(
    userConfig.activeOilPatternId || userConfig.oilPatterns[0]?.id || ''
  );

  // Selected ball from arsenal
  const [selectedBallId, setSelectedBallId] = useState<string>(
    userConfig.activeBallId || userConfig.balls[0]?.id || ''
  );

  // Live session counters
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [convertedCount, setConvertedCount] = useState<number>(0);
  const [missedCount, setMissedCount] = useState<number>(0);
  const [rollHistory, setRollHistory] = useState<{ id: number; success: boolean; time: string }[]>([]);
  const [notes, setNotes] = useState<string>('');

  // Selected entities
  const selectedCenter = useMemo(
    () => userConfig.centers.find((c) => c.id === selectedCenterId) || userConfig.centers[0],
    [userConfig.centers, selectedCenterId]
  );

  const selectedOilPattern = useMemo(
    () => userConfig.oilPatterns.find((p) => p.id === selectedOilPatternId) || userConfig.oilPatterns[0],
    [userConfig.oilPatterns, selectedOilPatternId]
  );

  const selectedBall = useMemo(
    () => userConfig.balls.find((b) => b.id === selectedBallId) || userConfig.balls[0],
    [userConfig.balls, selectedBallId]
  );

  // Notify parent component about active practice session
  React.useEffect(() => {
    if (onSessionStateChange) {
      onSessionStateChange(attemptsCount > 0);
    }
  }, [attemptsCount, onSessionStateChange]);

  // Calculate live conversion rate
  const conversionRate = attemptsCount > 0 ? Math.round((convertedCount / attemptsCount) * 100) : 0;

  // Toggle individual pin selection
  const handleTogglePin = (pin: PinNumber) => {
    setTargetPins((prev) => {
      const next = prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin].sort((a, b) => a - b);
      // Auto update name if custom
      setDrillName(`Кегли: [${next.join(', ')}]`);
      return next;
    });
  };

  // Select a preset
  const handleSelectPreset = (preset: DrillPreset) => {
    setTargetPins(preset.pins);
    setDrillName(preset.name);
  };

  // Select all pins
  const handleSelectAllPins = () => {
    setTargetPins([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    setDrillName('Все 10 кеглей (Страйк)');
  };

  // Clear pin selection
  const handleClearPins = () => {
    setTargetPins([]);
    setDrillName('Свой расклад');
  };

  // Record a roll: SUCCESS / CONVERTED
  const handleRecordSuccess = () => {
    if (targetPins.length === 0) return;

    if (settings.soundEnabled) {
      playSpareSound();
      playPinCrashSound(1.2);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#f59e0b', '#ffffff'],
      });
    } catch (e) {
      // ignore
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAttemptsCount((prev) => prev + 1);
    setConvertedCount((prev) => prev + 1);
    setRollHistory((prev) => [
      { id: Date.now(), success: true, time: timeStr },
      ...prev.slice(0, 24),
    ]);
  };

  // Record a roll: MISSED
  const handleRecordMiss = () => {
    if (targetPins.length === 0) return;

    if (settings.soundEnabled) {
      playGutterSound();
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAttemptsCount((prev) => prev + 1);
    setMissedCount((prev) => prev + 1);
    setRollHistory((prev) => [
      { id: Date.now(), success: false, time: timeStr },
      ...prev.slice(0, 24),
    ]);
  };

  // Reset live session
  const handleResetSession = () => {
    setAttemptsCount(0);
    setConvertedCount(0);
    setMissedCount(0);
    setRollHistory([]);
  };

  // Save current drill session into persistent statistics
  const handleSaveToStatistics = () => {
    if (attemptsCount === 0) {
      if (onNotification) onNotification('Сделайте хотя бы 1 бросок перед сохранением');
      return;
    }

    const newRecord: PracticeDrillRecord = {
      id: `drill_${Date.now()}`,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      drillName: drillName || `Отработка [${targetPins.join(', ')}]`,
      targetPins,
      attemptsCount,
      convertedCount,
      missedCount,
      conversionRate,
      centerId: selectedCenter?.id,
      centerName: selectedCenter?.name,
      oilPatternId: selectedOilPattern?.id,
      oilPatternName: selectedOilPattern?.name,
      ballUsedId: selectedBall?.id,
      ballUsedName: selectedBall?.name,
      notes: notes.trim(),
    };

    const updated = [newRecord, ...practiceDrills];
    onSaveDrills(updated);

    if (onNotification) {
      onNotification(
        `Тренировка «${drillName}» (${conversionRate}%) сохранена! Клуб: ${selectedCenter?.name || '—'}, Масло: ${selectedOilPattern?.name || '—'}`
      );
    }

    // Reset counters after saving
    setAttemptsCount(0);
    setConvertedCount(0);
    setMissedCount(0);
    setRollHistory([]);

    // Switch to history tab to show the recorded drill
    setActiveTab('history');
  };

  // 10-pin triangle rows:
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Главная</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-100 font-display flex items-center gap-2">
              <Target className="w-6 h-6 text-amber-400" />
              <span>Практика и отработка кеглей</span>
            </h1>
            <p className="text-xs text-stone-400">
              Выставляйте любую комбинацию сплитов или угловых кеглей и фиксируйте точность бросков
            </p>
          </div>
        </div>

        {/* View toggle tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-900 border border-stone-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('drill')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'drill'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Интерактивная дорожка
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>История ({practiceDrills.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE PRACTICE DRILL */}
      {/* ========================================================================= */}
      {activeTab === 'drill' && (
        <div className="space-y-6">
          {/* Preset Chips Bar */}
          <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Популярные сплиты и тренировочные расклады:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPins}
                  className="text-[11px] text-stone-400 hover:text-amber-300 transition-colors"
                >
                  Все 10
                </button>
                <span className="text-stone-700">·</span>
                <button
                  type="button"
                  onClick={handleClearPins}
                  className="text-[11px] text-stone-400 hover:text-red-400 transition-colors"
                >
                  Очистить
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {DRILL_PRESETS.map((preset) => {
                const isSelected =
                  targetPins.length === preset.pins.length &&
                  preset.pins.every((p) => targetPins.includes(p));

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20 font-bold'
                        : 'bg-stone-950/70 text-stone-300 border-stone-800 hover:border-amber-500/50 hover:bg-stone-900'
                    }`}
                  >
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TRAINING VENUE & SETUP (БОУЛИНГ-ЦЕНТР, ПРОГРАММА МАСЛА, ШАР) */}
          {/* ========================================================================= */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-800/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                  Условия тренировки (Клуб, Масло & Шар)
                </h3>
              </div>
              <span className="text-[11px] text-stone-400">
                Параметры сохраняются в статистику бросков
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {/* 1. Боулинг-центр */}
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Боулинг-центр</span>
                  </span>
                  {selectedCenter?.lanesCount && (
                    <span className="text-[10px] text-stone-400 font-mono font-normal">
                      {selectedCenter.lanesCount} дор.
                    </span>
                  )}
                </label>
                <select
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {userConfig.centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
                {selectedCenter && (
                  <div className="text-[10px] text-stone-400 truncate">
                    {selectedCenter.address ? `${selectedCenter.address} · ` : ''}{selectedCenter.surface || 'Синтетика'}
                  </div>
                )}
              </div>

              {/* 2. Программа масла */}
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Программа масла</span>
                  </span>
                  {selectedOilPattern?.lengthFt && (
                    <span className="text-[10px] text-cyan-300 font-mono font-bold">
                      {selectedOilPattern.lengthFt} ft
                    </span>
                  )}
                </label>
                <select
                  value={selectedOilPatternId}
                  onChange={(e) => setSelectedOilPatternId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {userConfig.oilPatterns.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.lengthFt} ft · {p.category})
                    </option>
                  ))}
                </select>
                {selectedOilPattern && (
                  <div className="text-[10px] text-stone-400 truncate flex items-center gap-1.5">
                    <span>{selectedOilPattern.category}</span>
                    {selectedOilPattern.volumeMl && <span>· {selectedOilPattern.volumeMl} мл</span>}
                    {selectedOilPattern.imageUrl && <span className="text-cyan-400 font-medium">· 📊 диаграмма</span>}
                  </div>
                )}
              </div>

              {/* 3. Шар для броска */}
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CircleDot className="w-3.5 h-3.5" />
                    <span>Шар для отработки</span>
                  </span>
                  {selectedBall?.weightLbs && (
                    <span className="text-[10px] text-stone-400 font-mono font-normal">
                      {selectedBall.weightLbs} lbs
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  {selectedBall && (
                    <BallVisual
                      primaryColor={selectedBall.primaryColor || selectedBall.color}
                      secondaryColor={selectedBall.secondaryColor}
                      accentColor={selectedBall.accentColor}
                      brand={selectedBall.brand}
                      coverstock={selectedBall.coverstock}
                      size="sm"
                    />
                  )}
                  <select
                    value={selectedBallId}
                    onChange={(e) => setSelectedBallId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {userConfig.balls.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.weightLbs} lbs)
                      </option>
                    ))}
                  </select>
                </div>
                {selectedBall && (
                  <div className="text-[10px] text-stone-400 truncate">
                    {selectedBall.brand} · {selectedBall.coverstock}
                    {selectedBall.drillingLayout ? ` · ${selectedBall.drillingLayout}` : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main 2-Column Workout Area: Pin Deck (Left) & Controls/Counters (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Pin Deck (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 border border-stone-800 p-5 sm:p-7 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              {/* Synthetic lane lines effect */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Интерактивный пиндек
                    </span>
                    <h2 className="text-lg font-bold text-stone-100 font-display">
                      {drillName}
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    {targetPins.length} {targetPins.length === 1 ? 'кегля' : 'кегли'}
                  </span>
                </div>

                <p className="text-xs text-stone-400 mb-6">
                  Нажимайте на кегли на дорожке, чтобы включить или выключить их в тренировке.
                </p>

                {/* Pin Deck Triangular Layout */}
                <div className="my-6 flex flex-col items-center justify-center space-y-4 sm:space-y-5">
                  {pinRows.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center justify-center gap-4 sm:gap-6">
                      {row.map((pin) => {
                        const isStanding = targetPins.includes(pin);

                        return (
                          <button
                            key={pin}
                            type="button"
                            onClick={() => handleTogglePin(pin)}
                            className={`relative w-12 h-14 sm:w-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all transform active:scale-90 select-none shadow-lg ${
                              isStanding
                                ? 'bg-gradient-to-b from-stone-100 to-stone-200 text-stone-950 border-2 border-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/30 scale-105'
                                : 'bg-stone-900/60 text-stone-600 border border-stone-800 hover:border-stone-700 opacity-40 hover:opacity-70'
                            }`}
                            title={`Кегля №${pin} (${isStanding ? 'Стоит' : 'Сбита'})`}
                          >
                            {/* Bowling pin red stripes */}
                            {isStanding && (
                              <div className="absolute top-2 w-7 sm:w-9 h-1 rounded-full bg-red-600" />
                            )}

                            <span className="font-extrabold text-base sm:text-xl font-mono">
                              {pin}
                            </span>

                            {isStanding && (
                              <span className="text-[9px] font-bold text-amber-800 uppercase tracking-tighter mt-0.5">
                                Стоит
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pin Selection Footer Quick Helper */}
              <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                <span>Нажмите на кеглю, чтобы изменить расклад</span>
                <span className="text-stone-300 font-mono">
                  [{targetPins.sort((a, b) => a - b).join(', ')}]
                </span>
              </div>
            </div>

            {/* Right Column: Throw Actions & Live Counters (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Active Conditions Summary Pill */}
              <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-3.5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  {selectedBall && (
                    <BallVisual
                      primaryColor={selectedBall.primaryColor || selectedBall.color}
                      secondaryColor={selectedBall.secondaryColor}
                      accentColor={selectedBall.accentColor}
                      brand={selectedBall.brand}
                      coverstock={selectedBall.coverstock}
                      size="sm"
                    />
                  )}
                  <div className="truncate">
                    <span className="font-bold text-stone-200 block truncate">
                      {selectedBall?.name || 'Шар'}
                    </span>
                    <span className="text-[11px] text-stone-400 block truncate">
                      {selectedCenter?.name || 'Центр'} · {selectedOilPattern?.name || 'Масло'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-[10px] font-mono font-bold text-amber-400">
                    {targetPins.length} {targetPins.length === 1 ? 'кегля' : 'кегли'}
                  </span>
                </div>
              </div>

              {/* Big Interactive Action Buttons: СБИЛ / НЕ СБИЛ */}
              <div className="rounded-3xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  Результат броска:
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleRecordSuccess}
                    className="py-4 px-4 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1.5 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
                  >
                    <Check className="w-7 h-7 stroke-[3]" />
                    <span>СБИЛ!</span>
                    <span className="text-[10px] text-emerald-950/80 font-bold uppercase">
                      Успешное добивание
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRecordMiss}
                    className="py-4 px-4 rounded-2xl bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1.5 shadow-xl shadow-red-600/25 active:scale-95 transition-all"
                  >
                    <X className="w-7 h-7 stroke-[3]" />
                    <span>НЕ СБИЛ</span>
                    <span className="text-[10px] text-red-200/80 font-bold uppercase">
                      Промах / Мимо
                    </span>
                  </button>
                </div>

                {/* Live Session Counters Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-800/80 text-center">
                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                      Бросков
                    </span>
                    <span className="text-lg font-black font-mono text-stone-100">
                      {attemptsCount}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block">
                      Сбито
                    </span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {convertedCount}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-[10px] uppercase tracking-wider text-red-400 font-semibold block">
                      Промахов
                    </span>
                    <span className="text-lg font-black font-mono text-red-400">
                      {missedCount}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                      Точность
                    </span>
                    <span className="text-lg font-black font-mono text-amber-400">
                      {conversionRate}%
                    </span>
                  </div>
                </div>

                {/* Roll history strip */}
                {rollHistory.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-stone-800">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>Последние попытки:</span>
                      <button
                        type="button"
                        onClick={handleResetSession}
                        className="text-stone-500 hover:text-stone-300 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Сбросить счётчик</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {rollHistory.map((r) => (
                        <span
                          key={r.id}
                          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs font-mono shadow-sm ${
                            r.success
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                          title={`${r.success ? 'Сбил' : 'Промах'} в ${r.time}`}
                        >
                          {r.success ? '✓' : '✕'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Input */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                    Заметка к тренировке (опционально):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Например: целился в 3 стрелку, сместился влево на 2 доски"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSaveToStatistics}
                  disabled={attemptsCount === 0}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    attemptsCount > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95 shadow-amber-500/20 cursor-pointer'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить в статистику игрока</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRACTICE HISTORY LOG */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-100 font-display">
                История тренировочных сессий
              </h2>
              <p className="text-xs text-stone-400">
                Все зафиксированные тренировки сплитов и кеглей
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('drill')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all"
            >
              + Новая тренировка
            </button>
          </div>

          {practiceDrills.length === 0 ? (
            <div className="rounded-2xl bg-stone-900/50 border border-stone-800 p-8 text-center text-stone-400">
              Пока нет сохранённых тренировок. Перейдите во вкладку «Интерактивная дорожка» и зафиксируйте свои броски.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {practiceDrills.map((drill) => (
                <div
                  key={drill.id}
                  className="rounded-2xl bg-stone-900 border border-stone-800 p-4 space-y-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-stone-100 text-sm">
                        {drill.drillName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{new Date(drill.date).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>Кегли: [{drill.targetPins.join(', ')}]</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black font-mono text-amber-400">
                        {drill.conversionRate}%
                      </span>
                      <span className="block text-[10px] text-stone-400 uppercase">
                        реализация
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-800/80 text-center text-xs">
                    <div className="p-2 rounded-lg bg-stone-950">
                      <span className="text-stone-400 text-[10px] block">Бросков</span>
                      <span className="font-bold text-stone-200 font-mono">{drill.attemptsCount}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-950">
                      <span className="text-emerald-400 text-[10px] block">Сбито</span>
                      <span className="font-bold text-emerald-400 font-mono">{drill.convertedCount}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-950">
                      <span className="text-red-400 text-[10px] block">Промахов</span>
                      <span className="font-bold text-red-400 font-mono">{drill.missedCount}</span>
                    </div>
                  </div>

                  {/* Drill Equipment & Venue Badges */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-stone-400">
                    {drill.centerName && (
                      <div className="flex items-center gap-1 text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[11px]">
                        <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{drill.centerName}</span>
                      </div>
                    )}
                    {drill.oilPatternName && (
                      <div className="flex items-center gap-1 text-cyan-400/90 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md text-[11px]">
                        <Droplets className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{drill.oilPatternName}</span>
                      </div>
                    )}
                    {drill.ballUsedName && (
                      <div className="flex items-center gap-1 text-amber-400/90 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md text-[11px]">
                        <CircleDot className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{drill.ballUsedName}</span>
                      </div>
                    )}
                  </div>

                  {drill.notes && (
                    <p className="text-xs text-stone-400 italic bg-stone-950/60 p-2 rounded-lg border border-stone-800/60">
                      «{drill.notes}»
                    </p>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetPins(drill.targetPins);
                        setDrillName(drill.drillName);
                        setActiveTab('drill');
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Повторить эту тренировку →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
