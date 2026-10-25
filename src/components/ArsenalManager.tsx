import React, { useState } from 'react';
import { BowlingBall, UserPersonalConfig } from '../types/bowling';
import {
  Plus,
  Trash2,
  Edit2,
  CircleDot,
  Sparkles,
  Check,
  X,
  Target,
  Search,
  Star,
  Layers,
  Wrench,
  Droplets,
  Palette,
  Sliders,
  Gauge,
} from 'lucide-react';
import { BallVisual } from './BallVisual';
import {
  BALL_CATALOG,
  BALL_BRANDS,
  CatalogBallPreset,
  createBallFromPreset,
} from '../data/ballCatalog';

const BRAND_OPTIONS = [
  'Storm',
  'Brunswick',
  'Hammer',
  'Roto Grip',
  '900 Global',
  'Motiv',
  'Ebonite',
  'DV8',
  'Columbia 300',
  'Track',
  'Другой бренд',
] as const;

const OIL_OPTIONS = [
  'Heavy',
  'Medium-Heavy',
  'Medium',
  'Medium-Light',
  'Light-Medium',
  'Dry',
  'Short',
] as const;

const COMMON_FINISHES = [
  '2000 Siaair',
  '3000 Abralon',
  '4000 Abralon',
  'Reacta Gloss',
  'Crown Factory Polish',
  '500 / 1000 / 2000 Siaair',
  '5500-grit LSP',
  '1500 Grit Polished',
];

const COLOR_SWATCH_PRESETS = [
  { name: 'Phaze Dark (Красный / Синий)', p: '#7f1d1d', s: '#1e3a8a', a: '#f59e0b' },
  { name: 'Black Widow (Черный / Алый)', p: '#171717', s: '#991b1b', a: '#ef4444' },
  { name: 'Venom Neon (Лайм / Розовый)', p: '#84cc16', s: '#ec4899', a: '#a3e635' },
  { name: 'Purple Hammer (Уретан)', p: '#581c87', s: '#7e22ce', a: '#c084fc' },
  { name: 'Ice Storm (Лазурный / Белый)', p: '#0284c7', s: '#f8fafc', a: '#38bdf8' },
  { name: 'Obsidian Gold (Черный / Золото)', p: '#18181b', s: '#d97706', a: '#fbbf24' },
  { name: 'Emerald Wave (Изумруд / Нефрит)', p: '#064e3b', s: '#059669', a: '#34d399' },
  { name: 'Deep Royal (Кобальт / Серебро)', p: '#1e3a8a', s: '#64748b', a: '#93c5fd' },
];

interface ArsenalManagerProps {
  userConfig: UserPersonalConfig;
  onUpdateConfig: (newConfig: UserPersonalConfig) => void;
  onNotification?: (msg: string) => void;
}

export const ArsenalManager: React.FC<ArsenalManagerProps> = ({
  userConfig,
  onUpdateConfig,
  onNotification,
}) => {
  // Ball sub-view: 'my_bag' or 'catalog'
  const [ballSubView, setBallSubView] = useState<'my_bag' | 'catalog'>('my_bag');
  const [catalogBrand, setCatalogBrand] = useState<string>('Все');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Modals state
  const [isBallModalOpen, setIsBallModalOpen] = useState(false);
  const [editingBall, setEditingBall] = useState<BowlingBall | null>(null);

  // Preset Add Modal state
  const [activePresetToAdd, setActivePresetToAdd] = useState<CatalogBallPreset | null>(null);
  const [presetWeight, setPresetWeight] = useState<number>(15);
  const [presetIsPrimary, setPresetIsPrimary] = useState<boolean>(false);
  const [presetIsSpare, setPresetIsSpare] = useState<boolean>(false);
  const [presetDrillingLayout, setPresetDrillingLayout] = useState<string>('Pin Up 4x4x2');
  const [presetPinToPap, setPresetPinToPap] = useState<string>('4.5"');
  const [presetDrillingNotes, setPresetDrillingNotes] = useState<string>('');

  // Manual Ball Form state with full catalog specs
  const [ballForm, setBallForm] = useState<{
    name: string;
    brand: string;
    isCustomBrand: boolean;
    customBrand: string;
    weightLbs: number;
    coverstock: BowlingBall['coverstock'];
    coverstockName: string;
    finish: string;
    coreName: string;
    coreType: 'Symmetrical' | 'Asymmetrical';
    rg: number | '';
    diff: number | '';
    mb: number | '';
    recommendedOil: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    isPrimaryStrikeBall: boolean;
    isSpareBall: boolean;
    drillingLayout: string;
    pinToPapDistance: string;
    drillingNotes: string;
    notes: string;
  }>({
    name: '',
    brand: 'Storm',
    isCustomBrand: false,
    customBrand: '',
    weightLbs: 15,
    coverstock: 'Solid',
    coverstockName: '',
    finish: '3000 Abralon',
    coreName: '',
    coreType: 'Symmetrical',
    rg: 2.48,
    diff: 0.051,
    mb: '',
    recommendedOil: 'Medium-Heavy',
    primaryColor: '#b91c1c',
    secondaryColor: '#1e293b',
    accentColor: '#f97316',
    isPrimaryStrikeBall: false,
    isSpareBall: false,
    drillingLayout: 'Pin Up 4x4x2',
    pinToPapDistance: '4.5"',
    drillingNotes: '',
    notes: '',
  });

  const handleOpenAddBall = () => {
    setEditingBall(null);
    setBallForm({
      name: '',
      brand: 'Storm',
      isCustomBrand: false,
      customBrand: '',
      weightLbs: 15,
      coverstock: 'Solid',
      coverstockName: '',
      finish: '3000 Abralon',
      coreName: '',
      coreType: 'Symmetrical',
      rg: 2.48,
      diff: 0.051,
      mb: '',
      recommendedOil: 'Medium-Heavy',
      primaryColor: '#b91c1c',
      secondaryColor: '#1e293b',
      accentColor: '#f97316',
      isPrimaryStrikeBall: userConfig.balls.length === 0,
      isSpareBall: false,
      drillingLayout: 'Pin Up 4x4x2',
      pinToPapDistance: '4.5"',
      drillingNotes: '',
      notes: '',
    });
    setIsBallModalOpen(true);
  };

  const handleOpenEditBall = (ball: BowlingBall) => {
    setEditingBall(ball);
    const standardBrands: string[] = [
      'Storm',
      'Brunswick',
      'Hammer',
      'Roto Grip',
      '900 Global',
      'Motiv',
      'Ebonite',
      'DV8',
      'Columbia 300',
      'Track',
    ];
    const isStandard = standardBrands.includes(ball.brand);
    setBallForm({
      name: ball.name,
      brand: isStandard ? ball.brand : 'Другой бренд',
      isCustomBrand: !isStandard,
      customBrand: !isStandard ? ball.brand : '',
      weightLbs: ball.weightLbs,
      coverstock: ball.coverstock,
      coverstockName: ball.coverstockName || '',
      finish: ball.finish || '',
      coreName: ball.coreName || '',
      coreType: ball.coreType || 'Symmetrical',
      rg: typeof ball.rg === 'number' ? ball.rg : '',
      diff: typeof ball.diff === 'number' ? ball.diff : '',
      mb: typeof ball.mb === 'number' ? ball.mb : '',
      recommendedOil: ball.recommendedOil || 'Medium',
      primaryColor: ball.primaryColor || ball.color || '#b91c1c',
      secondaryColor: ball.secondaryColor || '',
      accentColor: ball.accentColor || '',
      isPrimaryStrikeBall: ball.isPrimaryStrikeBall,
      isSpareBall: ball.isSpareBall,
      drillingLayout: ball.drillingLayout || '',
      pinToPapDistance: ball.pinToPapDistance || '',
      drillingNotes: ball.drillingNotes || '',
      notes: ball.notes || '',
    });
    setIsBallModalOpen(true);
  };

  const handleSaveBall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ballForm.name.trim()) return;

    const finalBrand =
      ballForm.brand === 'Другой бренд' || ballForm.isCustomBrand
        ? ballForm.customBrand.trim() || 'Custom'
        : ballForm.brand;

    const parsedRg =
      ballForm.rg !== '' && !isNaN(Number(ballForm.rg))
        ? parseFloat(String(ballForm.rg))
        : undefined;
    const parsedDiff =
      ballForm.diff !== '' && !isNaN(Number(ballForm.diff))
        ? parseFloat(String(ballForm.diff))
        : undefined;
    const parsedMb =
      ballForm.coreType === 'Asymmetrical' &&
      ballForm.mb !== '' &&
      !isNaN(Number(ballForm.mb))
        ? parseFloat(String(ballForm.mb))
        : undefined;

    let updatedBalls = [...userConfig.balls];
    if (editingBall) {
      updatedBalls = updatedBalls.map((b) =>
        b.id === editingBall.id
          ? {
              ...b,
              name: ballForm.name.trim(),
              brand: finalBrand,
              weightLbs: ballForm.weightLbs,
              coverstock: ballForm.coverstock,
              coverstockName: ballForm.coverstockName.trim() || undefined,
              finish: ballForm.finish.trim() || undefined,
              coreName: ballForm.coreName.trim() || undefined,
              coreType: ballForm.coreType,
              rg: parsedRg,
              diff: parsedDiff,
              mb: parsedMb,
              recommendedOil: ballForm.recommendedOil.trim() || undefined,
              color: ballForm.primaryColor || '#b91c1c',
              primaryColor: ballForm.primaryColor || '#b91c1c',
              secondaryColor: ballForm.secondaryColor.trim() || undefined,
              accentColor: ballForm.accentColor.trim() || undefined,
              isPrimaryStrikeBall: ballForm.isPrimaryStrikeBall,
              isSpareBall: ballForm.isSpareBall,
              drillingLayout: ballForm.drillingLayout.trim() || undefined,
              pinToPapDistance: ballForm.pinToPapDistance.trim() || undefined,
              drillingNotes: ballForm.drillingNotes.trim() || undefined,
              notes: ballForm.notes.trim() || undefined,
            }
          : ballForm.isPrimaryStrikeBall
          ? { ...b, isPrimaryStrikeBall: false }
          : ballForm.isSpareBall
          ? { ...b, isSpareBall: false }
          : b
      );
      if (onNotification) onNotification(`Шар «${ballForm.name.trim()}» обновлен`);
    } else {
      const newBall: BowlingBall = {
        id: 'ball_' + Date.now(),
        name: ballForm.name.trim(),
        brand: finalBrand,
        weightLbs: ballForm.weightLbs,
        coverstock: ballForm.coverstock,
        coverstockName: ballForm.coverstockName.trim() || undefined,
        finish: ballForm.finish.trim() || undefined,
        coreName: ballForm.coreName.trim() || undefined,
        coreType: ballForm.coreType,
        rg: parsedRg,
        diff: parsedDiff,
        mb: parsedMb,
        recommendedOil: ballForm.recommendedOil.trim() || undefined,
        color: ballForm.primaryColor || '#b91c1c',
        primaryColor: ballForm.primaryColor || '#b91c1c',
        secondaryColor: ballForm.secondaryColor.trim() || undefined,
        accentColor: ballForm.accentColor.trim() || undefined,
        isPrimaryStrikeBall: ballForm.isPrimaryStrikeBall,
        isSpareBall: ballForm.isSpareBall,
        drillingLayout: ballForm.drillingLayout.trim() || undefined,
        pinToPapDistance: ballForm.pinToPapDistance.trim() || undefined,
        drillingNotes: ballForm.drillingNotes.trim() || undefined,
        notes: ballForm.notes.trim() || undefined,
      };
      if (newBall.isPrimaryStrikeBall) {
        updatedBalls = updatedBalls.map((b) => ({ ...b, isPrimaryStrikeBall: false }));
      }
      if (newBall.isSpareBall) {
        updatedBalls = updatedBalls.map((b) => ({ ...b, isSpareBall: false }));
      }
      updatedBalls.push(newBall);
      if (onNotification) onNotification(`Шар «${newBall.name}» добавлен в арсенал`);
    }

    onUpdateConfig({
      ...userConfig,
      balls: updatedBalls,
    });
    setIsBallModalOpen(false);
  };

  const handleDeleteBall = (ballId: string, ballName: string) => {
    if (window.confirm(`Удалить шар «${ballName}» из вашего арсенала?`)) {
      const updated = userConfig.balls.filter((b) => b.id !== ballId);
      onUpdateConfig({
        ...userConfig,
        balls: updated,
      });
      if (onNotification) onNotification(`Шар «${ballName}» удалён`);
    }
  };

  const handleOpenAddPresetModal = (preset: CatalogBallPreset) => {
    setActivePresetToAdd(preset);
    setPresetWeight(15);
    setPresetIsPrimary(userConfig.balls.length === 0);
    setPresetIsSpare(false);
    setPresetDrillingLayout('Pin Up 4x4x2');
    setPresetPinToPap('4.5"');
    setPresetDrillingNotes('');
  };

  const handleAddPresetConfirm = () => {
    if (!activePresetToAdd) return;
    const newBall = createBallFromPreset(
      activePresetToAdd,
      presetWeight,
      presetIsPrimary,
      presetIsSpare,
      presetDrillingLayout,
      presetPinToPap,
      presetDrillingNotes
    );
    let updatedBalls = [...userConfig.balls];
    if (presetIsPrimary) {
      updatedBalls = updatedBalls.map((b) => ({ ...b, isPrimaryStrikeBall: false }));
    }
    if (presetIsSpare) {
      updatedBalls = updatedBalls.map((b) => ({ ...b, isSpareBall: false }));
    }
    updatedBalls.push(newBall);
    onUpdateConfig({
      ...userConfig,
      balls: updatedBalls,
    });
    if (onNotification) onNotification(`Шар «${newBall.name}» добавлен в арсенал`);
    setActivePresetToAdd(null);
    setBallSubView('my_bag');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-display flex items-center gap-2.5">
            <CircleDot className="w-6 h-6 text-amber-400" />
            <span>Арсенал шаров боулера</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Персональный набор шаров с параметрами сверления (Layout, Pin-to-PAP) и каталог популярных мировых брендов
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddBall}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Создать шар вручную</span>
        </button>
      </div>

      {/* Sub-navigation inside Arsenal: My Bag vs Top Brands Catalog */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setBallSubView('my_bag')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              ballSubView === 'my_bag'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <CircleDot className="w-4 h-4" />
            <span>Мой арсенал ({userConfig.balls.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setBallSubView('catalog')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              ballSubView === 'catalog'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Каталог брендов</span>
          </button>
        </div>

        <span className="text-xs text-stone-400 px-3 hidden sm:inline">
          {ballSubView === 'my_bag'
            ? 'Нажмите «Каталог брендов» для быстрого добавления моделей'
            : 'Storm, Hammer, Roto Grip, Motiv, Brunswick, 900 Global, Track'}
        </span>
      </div>

      {/* VIEW A: MY BAG (USER BALLS) */}
      {ballSubView === 'my_bag' && (
        <div className="space-y-4">
          {userConfig.balls.length === 0 ? (
            <div className="rounded-2xl bg-stone-900/50 border border-stone-800 p-8 sm:p-12 text-center text-stone-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <CircleDot className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-stone-200">В вашем арсенале пока нет шаров</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Выберите готовую модель из каталога брендов или создайте свой шар вручную с персональными параметрами сверления.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBallSubView('catalog')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Выбрать шар из каталога
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddBall}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
                >
                  Создать вручную
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userConfig.balls.map((ball) => (
                <div
                  key={ball.id}
                  className="rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 p-5 space-y-3.5 transition-all relative overflow-hidden group shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* 3D Bowling Ball Visual */}
                        <BallVisual
                          primaryColor={ball.primaryColor || ball.color}
                          secondaryColor={ball.secondaryColor}
                          accentColor={ball.accentColor}
                          brand={ball.brand}
                          name={ball.name}
                          coverstock={ball.coverstock}
                          size="md"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-stone-100 text-base leading-tight truncate">
                            {ball.name}
                          </h4>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {ball.brand} · <span className="font-mono font-bold text-amber-400">{ball.weightLbs} lbs</span>
                          </p>
                          <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-950 border border-stone-800 text-stone-300">
                            {ball.coverstock}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBall(ball)}
                          className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                          title="Редактировать параметры шара"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBall(ball.id, ball.name)}
                          className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Удалить шар"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Drilling parameters card */}
                    {(ball.drillingLayout || ball.pinToPapDistance || ball.drillingNotes) && (
                      <div className="mt-3 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px] uppercase tracking-wider">
                          <Wrench className="w-3 h-3" />
                          <span>Параметры сверления (Drilling)</span>
                        </div>
                        {ball.drillingLayout && (
                          <div className="text-stone-300">
                            Схема: <strong className="text-white font-mono">{ball.drillingLayout}</strong>
                          </div>
                        )}
                        {ball.pinToPapDistance && (
                          <div className="text-stone-400 text-[11px]">
                            Pin to PAP: <span className="text-amber-400 font-mono font-bold">{ball.pinToPapDistance}</span>
                          </div>
                        )}
                        {ball.drillingNotes && (
                          <p className="text-[11px] text-stone-400 italic mt-0.5">
                            {ball.drillingNotes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Coverstock row: Name, Type, Finish */}
                    {(ball.coverstockName || ball.finish) && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Покрытие</span>
                          <span className="text-[10px] text-stone-300 font-medium">
                            {ball.coverstock}
                          </span>
                        </div>
                        {ball.coverstockName && (
                          <div className="font-bold text-stone-200 text-xs truncate">
                            {ball.coverstockName}
                          </div>
                        )}
                        {ball.finish && (
                          <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-0.5 border-t border-stone-800/60">
                            <span className="text-stone-500 text-[10px] uppercase">Финиш:</span>
                            <span className="text-stone-300 font-medium truncate">{ball.finish}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Core row: Name and Sym/Asym Type */}
                    {(ball.coreName || ball.coreType) && (
                      <div className="mt-2 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Ядро</span>
                          <span
                            className={`px-2 py-0.2 rounded-md font-mono font-bold text-[10px] ${
                              ball.coreType === 'Asymmetrical'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {ball.coreType === 'Asymmetrical' ? 'Asym (Асимметрик)' : 'Sym (Симметрик)'}
                          </span>
                        </div>
                        {ball.coreName && (
                          <div className="font-bold text-stone-200 text-xs truncate" title={ball.coreName}>
                            {ball.coreName}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TTX Specifications Grid for 15 lbs: RG, Diff, MB, Oil */}
                    {(ball.rg !== undefined || ball.diff !== undefined || ball.mb !== undefined || ball.recommendedOil) && (
                      <div className="mt-2 p-2.5 rounded-xl bg-stone-950/90 border border-stone-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                          <span>ТТХ для 15 lbs</span>
                          <span className="text-stone-500 font-mono font-normal">Спецификация</span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          <div className="p-1 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">RG</span>
                            <span className="font-mono font-bold text-amber-400 text-xs">
                              {ball.rg !== undefined ? ball.rg : '—'}
                            </span>
                          </div>
                          <div className="p-1 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">Diff</span>
                            <span className="font-mono font-bold text-amber-400 text-xs">
                              {ball.diff !== undefined ? ball.diff : '—'}
                            </span>
                          </div>
                          <div className="p-1 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">MB</span>
                            <span className="font-mono font-bold text-purple-300 text-xs">
                              {ball.mb !== undefined ? ball.mb : '—'}
                            </span>
                          </div>
                          <div className="p-1 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">Масло</span>
                            <span className="font-semibold text-cyan-400 text-[10px] truncate block" title={ball.recommendedOil || '—'}>
                              {ball.recommendedOil || '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badges / Roles */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                    {ball.isPrimaryStrikeBall && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        ★ Основной страйковый
                      </span>
                    )}
                    {ball.isSpareBall && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                        🎯 Спэровый шар
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW B: TOP BRANDS BALL CATALOG */}
      {ballSubView === 'catalog' && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-stone-900 border border-stone-800">
            {/* Brand Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {BALL_BRANDS.map((brandName) => (
                <button
                  key={brandName}
                  type="button"
                  onClick={() => setCatalogBrand(brandName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    catalogBrand === brandName
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  {brandName}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Поиск модели шара..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BALL_CATALOG
              .filter((preset) => {
                if (catalogBrand !== 'Все' && preset.brand !== catalogBrand) return false;
                if (catalogSearch.trim()) {
                  const q = catalogSearch.toLowerCase();
                  return (
                    preset.name.toLowerCase().includes(q) ||
                    preset.brand.toLowerCase().includes(q) ||
                    preset.coverstockName.toLowerCase().includes(q)
                  );
                }
                return true;
              })
              .map((preset) => {
                const countInArsenal = userConfig.balls.filter(
                  (b) => b.presetId === preset.id || b.name === `${preset.brand} ${preset.name}`
                ).length;

                return (
                  <div
                    key={preset.id}
                    className="rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/50 p-5 space-y-3.5 transition-all shadow-xl flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Ball Header: Realistic 3D Visual + Brand & Model */}
                      <div className="flex items-start gap-3.5">
                        <BallVisual
                          primaryColor={preset.primaryColor}
                          secondaryColor={preset.secondaryColor}
                          accentColor={preset.accentColor}
                          brand={preset.brand}
                          name={preset.name}
                          coverstock={preset.coverstock}
                          size="md"
                          className="group-hover:scale-105 transition-transform shrink-0 mt-0.5"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                              {preset.brand}
                            </span>
                            {countInArsenal > 0 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ✓ В арсенале {countInArsenal > 1 ? `(${countInArsenal})` : ''}
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-stone-100 text-base leading-tight font-display mt-0.5 truncate" title={preset.name}>
                            {preset.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-950 text-stone-300 font-semibold border border-stone-800">
                              {preset.coverstock}
                            </span>
                            <span className="text-[10px] text-stone-400 truncate">
                              {preset.coverstockName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Coverstock row: Name, Type, Finish */}
                      <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Покрытие</span>
                          <span className="text-[10px] text-stone-300 font-medium">
                            {preset.coverstock}
                          </span>
                        </div>
                        <div className="font-bold text-stone-200 text-xs truncate">
                          {preset.coverstockName}
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1 border-t border-stone-800/60">
                          <span className="text-stone-500 text-[10px] uppercase">Финиш:</span>
                          <span className="text-stone-300 font-medium truncate">{preset.finish}</span>
                        </div>
                      </div>

                      {/* Core row: Name and Sym/Asym Type */}
                      <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Ядро</span>
                          <span
                            className={`px-2 py-0.2 rounded-md font-mono font-bold text-[10px] ${
                              preset.coreType === 'Asymmetrical'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {preset.coreType === 'Asymmetrical' ? 'Asym (Асимметрик)' : 'Sym (Симметрик)'}
                          </span>
                        </div>
                        <div className="font-bold text-stone-200 text-xs truncate" title={preset.core}>
                          {preset.core}
                        </div>
                      </div>

                      {/* TTX Specifications for 15 lbs: RG, Diff, MB, Oil */}
                      <div className="p-2.5 rounded-xl bg-stone-950/90 border border-stone-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                          <span>ТТХ для 15 lbs</span>
                          <span className="text-stone-500 font-mono font-normal">Спецификация</span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">RG</span>
                            <span className="font-mono font-bold text-amber-400 text-xs">{preset.rg}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">Diff</span>
                            <span className="font-mono font-bold text-amber-400 text-xs">{preset.diff}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">MB</span>
                            <span className="font-mono font-bold text-purple-300 text-xs">
                              {preset.mb !== undefined ? preset.mb : '—'}
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">Масло</span>
                            <span className="font-semibold text-cyan-400 text-[10px] truncate block" title={preset.recommendedOil}>
                              {preset.recommendedOil}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    {/* "+ В арсенал" Action Button */}
                    <div className="pt-3 border-t border-stone-800/80">
                      <button
                        type="button"
                        onClick={() => handleOpenAddPresetModal(preset)}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>+ В арсенал</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODAL: ADD PRESET TO ARSENAL (PICK WEIGHT, ROLE & DRILLING LAYOUT) */}
      {activePresetToAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-stone-900 border border-stone-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <BallVisual
                  primaryColor={activePresetToAdd.primaryColor}
                  secondaryColor={activePresetToAdd.secondaryColor}
                  accentColor={activePresetToAdd.accentColor}
                  brand={activePresetToAdd.brand}
                  name={activePresetToAdd.name}
                  coverstock={activePresetToAdd.coverstock}
                  size="sm"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400">
                    {activePresetToAdd.brand}
                  </span>
                  <h3 className="text-base font-bold text-stone-100 font-display">
                    {activePresetToAdd.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePresetToAdd(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Weight */}
              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1.5">
                  Вес шара (в фунтах):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[13, 14, 15, 16].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setPresetWeight(w)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                        presetWeight === w
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {w} lbs
                    </button>
                  ))}
                </div>
              </div>

              {/* Drilling Parameters */}
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Параметры сверления шара (Drilling Layout)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Схема сверления (Layout):
                    </label>
                    <input
                      type="text"
                      value={presetDrillingLayout}
                      onChange={(e) => setPresetDrillingLayout(e.target.value)}
                      placeholder="Pin Up 4x4x2 / Dual Angle 50°x4”x35°"
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Расстояние Pin-to-PAP:
                    </label>
                    <input
                      type="text"
                      value={presetPinToPap}
                      onChange={(e) => setPresetPinToPap(e.target.value)}
                      placeholder="Например: 4.5”"
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                    Заметки по сверлению / питчи:
                  </label>
                  <input
                    type="text"
                    value={presetDrillingNotes}
                    onChange={(e) => setPresetDrillingNotes(e.target.value)}
                    placeholder="Питчи пальцев, Switch Grip, вес отверстия"
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Ball Role in Bag */}
              <div className="space-y-2">
                <label className="block uppercase font-semibold text-stone-400">
                  Назначение шара в арсенале:
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={presetIsPrimary}
                    onChange={(e) => {
                      setPresetIsPrimary(e.target.checked);
                      if (e.target.checked) setPresetIsSpare(false);
                    }}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
                  />
                  <span className="text-stone-200 font-medium">
                    ★ Основной страйковый шар
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={presetIsSpare}
                    onChange={(e) => {
                      setPresetIsSpare(e.target.checked);
                      if (e.target.checked) setPresetIsPrimary(false);
                    }}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
                  />
                  <span className="text-stone-200 font-medium">
                    🎯 Спэровый шар (для добивания)
                  </span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setActivePresetToAdd(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleAddPresetConfirm}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                >
                  Добавить в сумку
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BALL MANUALLY WITH FULL CATALOG SPECS */}
      {isBallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 p-5 sm:p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100 font-display">
                    {editingBall ? 'Редактировать характеристики шара' : 'Создать шар с характеристиками каталога'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Укажите ТТХ для 15 lbs (RG, Diff, MB, Масло), ядро, покрытие и разметку
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBallModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live 3D Visual Preview Bar */}
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center gap-4">
              <BallVisual
                primaryColor={ballForm.primaryColor}
                secondaryColor={ballForm.secondaryColor}
                accentColor={ballForm.accentColor}
                brand={ballForm.brand === 'Другой бренд' ? (ballForm.customBrand || 'Custom') : ballForm.brand}
                name={ballForm.name || 'Название шара'}
                coverstock={ballForm.coverstock}
                size="lg"
                className="shrink-0 drop-shadow-xl"
              />

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {ballForm.brand === 'Другой бренд' ? (ballForm.customBrand || 'Пользовательский') : ballForm.brand}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      ballForm.coreType === 'Asymmetrical'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {ballForm.coreType === 'Asymmetrical' ? 'Asym' : 'Sym'}
                  </span>
                </div>
                <h4 className="font-extrabold text-stone-100 text-base leading-tight truncate">
                  {ballForm.name || 'Новый шар'}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-400">
                  <span className="font-mono text-amber-300 font-bold">{ballForm.weightLbs} lbs</span>
                  <span>•</span>
                  <span className="text-stone-300">{ballForm.coverstock}</span>
                  {ballForm.coverstockName && (
                    <>
                      <span>•</span>
                      <span className="text-stone-400 truncate">{ballForm.coverstockName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveBall} className="space-y-4 text-xs">
              {/* SECTION 1: BRAND, MODEL & WEIGHT */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <CircleDot className="w-3.5 h-3.5" />
                  <span>1. Основная информация (Бренд, Модель, Вес)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Производитель (Бренд) *
                    </label>
                    <select
                      value={ballForm.brand}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBallForm({
                          ...ballForm,
                          brand: val,
                          isCustomBrand: val === 'Другой бренд',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      {BRAND_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>

                    {(ballForm.brand === 'Другой бренд' || ballForm.isCustomBrand) && (
                      <input
                        type="text"
                        required
                        value={ballForm.customBrand}
                        onChange={(e) => setBallForm({ ...ballForm, customBrand: e.target.value })}
                        placeholder="Введите название бренда..."
                        className="mt-2 w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-500/60 text-stone-100 text-xs focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Название модели шара *
                    </label>
                    <input
                      type="text"
                      required
                      value={ballForm.name}
                      onChange={(e) => setBallForm({ ...ballForm, name: e.target.value })}
                      placeholder="Например: Phaze II, Venom Shock, Crux..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-stone-400 mb-1.5 font-semibold">
                    Вес шара в фунтах (lbs):
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[12, 13, 14, 15, 16].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setBallForm({ ...ballForm, weightLbs: w })}
                        className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                          ballForm.weightLbs === w
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {w} lbs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 2: COVERSTOCK */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Покрытие шара (Coverstock)</span>
                </span>

                <div>
                  <label className="block uppercase text-[10px] text-stone-400 mb-1.5 font-semibold">
                    Тип покрытия:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {(['Solid', 'Pearl', 'Hybrid', 'Urethane', 'Plastic'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBallForm({ ...ballForm, coverstock: type })}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                          ballForm.coverstock === type
                            ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm'
                            : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Фирменное название покрытия:
                    </label>
                    <input
                      type="text"
                      value={ballForm.coverstockName}
                      onChange={(e) => setBallForm({ ...ballForm, coverstockName: e.target.value })}
                      placeholder="TX-16 Solid, HK22, NeX Solid, Microcell..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Заводской финиш (Обработка поверхности):
                    </label>
                    <input
                      type="text"
                      value={ballForm.finish}
                      onChange={(e) => setBallForm({ ...ballForm, finish: e.target.value })}
                      placeholder="3000 Abralon, 2000 Siaair, Reacta Gloss..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Common Finishes quick buttons */}
                <div>
                  <span className="text-[10px] text-stone-500 block mb-1">Быстрый выбор финиша:</span>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_FINISHES.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setBallForm({ ...ballForm, finish: f })}
                        className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors ${
                          ballForm.finish === f
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: CORE */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>3. Весовое ядро (Core)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Название ядра:
                    </label>
                    <input
                      type="text"
                      value={ballForm.coreName}
                      onChange={(e) => setBallForm({ ...ballForm, coreName: e.target.value })}
                      placeholder="Velocity Core, Gas Mask, Predator V2, Gear..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Тип ядра:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBallForm({ ...ballForm, coreType: 'Symmetrical' })}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                          ballForm.coreType === 'Symmetrical'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                        }`}
                      >
                        <span>Sym (Симметрик)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBallForm({ ...ballForm, coreType: 'Asymmetrical' })}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                          ballForm.coreType === 'Asymmetrical'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                        }`}
                      >
                        <span>Asym (Асимметрик)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: 15 LBS SPECIFICATIONS (RG, Diff, MB, Oil) */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>4. ТТХ для 15 lbs (Спецификация)</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">RG / Diff / MB / Масло</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* RG */}
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <label className="block text-[10px] uppercase text-stone-400 font-semibold mb-1">
                      RG (Радиус)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="2.40"
                      max="2.80"
                      value={ballForm.rg}
                      onChange={(e) =>
                        setBallForm({
                          ...ballForm,
                          rg: e.target.value === '' ? '' : parseFloat(e.target.value),
                        })
                      }
                      placeholder="2.48"
                      className="w-full px-2 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[9px] text-stone-500 mt-1 block">2.46 - 2.60</span>
                  </div>

                  {/* Diff */}
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <label className="block text-[10px] uppercase text-stone-400 font-semibold mb-1">
                      Diff (Дифференциал)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.000"
                      max="0.065"
                      value={ballForm.diff}
                      onChange={(e) =>
                        setBallForm({
                          ...ballForm,
                          diff: e.target.value === '' ? '' : parseFloat(e.target.value),
                        })
                      }
                      placeholder="0.051"
                      className="w-full px-2 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[9px] text-stone-500 mt-1 block">0.010 - 0.060</span>
                  </div>

                  {/* MB (Mass Bias / Intermediate Diff) */}
                  <div
                    className={`p-2.5 rounded-xl border ${
                      ballForm.coreType === 'Asymmetrical'
                        ? 'bg-purple-950/20 border-purple-500/40'
                        : 'bg-stone-900 border-stone-800 opacity-70'
                    }`}
                  >
                    <label className="block text-[10px] uppercase text-stone-400 font-semibold mb-1 flex items-center justify-between">
                      <span>MB (Bias)</span>
                      {ballForm.coreType === 'Asymmetrical' && (
                        <span className="text-[9px] text-purple-300 font-bold font-mono">Asym</span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.000"
                      max="0.035"
                      value={ballForm.mb}
                      onChange={(e) =>
                        setBallForm({
                          ...ballForm,
                          mb: e.target.value === '' ? '' : parseFloat(e.target.value),
                        })
                      }
                      placeholder={ballForm.coreType === 'Asymmetrical' ? '0.018' : '—'}
                      className="w-full px-2 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-purple-300 font-mono font-bold text-xs focus:outline-none focus:border-purple-400"
                    />
                    <span className="text-[9px] text-stone-500 mt-1 block">
                      {ballForm.coreType === 'Asymmetrical' ? '0.012 - 0.025' : 'Для Asym'}
                    </span>
                  </div>

                  {/* Recommended Oil */}
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <label className="block text-[10px] uppercase text-stone-400 font-semibold mb-1">
                      Условия масла
                    </label>
                    <select
                      value={ballForm.recommendedOil}
                      onChange={(e) => setBallForm({ ...ballForm, recommendedOil: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-cyan-400 font-semibold text-xs focus:outline-none focus:border-cyan-400"
                    >
                      {OIL_OPTIONS.map((oil) => (
                        <option key={oil} value={oil}>
                          {oil}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-stone-500 mt-1 block">Объем паттерна</span>
                  </div>
                </div>
              </div>

              {/* SECTION 5: BALL COLORS & VISUAL THEMES */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>5. Цвета и оформление шара (3D-визуализатор)</span>
                </span>

                {/* Preset Themes */}
                <div>
                  <span className="text-[10px] text-stone-500 block mb-1.5">
                    Готовые цветовые палитры:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {COLOR_SWATCH_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() =>
                          setBallForm({
                            ...ballForm,
                            primaryColor: p.p,
                            secondaryColor: p.s,
                            accentColor: p.a,
                          })
                        }
                        className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-left transition-all flex items-center gap-2 group"
                      >
                        <div className="flex -space-x-1.5 shrink-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-stone-950"
                            style={{ backgroundColor: p.p }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-stone-950"
                            style={{ backgroundColor: p.s }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-stone-950"
                            style={{ backgroundColor: p.a }}
                          />
                        </div>
                        <span className="text-[10px] text-stone-300 truncate group-hover:text-amber-300">
                          {p.name.split(' (')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 font-semibold mb-1">
                      Основной цвет:
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-stone-900 border border-stone-800">
                      <input
                        type="color"
                        value={ballForm.primaryColor}
                        onChange={(e) => setBallForm({ ...ballForm, primaryColor: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-[10px] text-stone-300">
                        {ballForm.primaryColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 font-semibold mb-1">
                      Цвет разводов:
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-stone-900 border border-stone-800">
                      <input
                        type="color"
                        value={ballForm.secondaryColor || '#1e293b'}
                        onChange={(e) =>
                          setBallForm({ ...ballForm, secondaryColor: e.target.value })
                        }
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-[10px] text-stone-300">
                        {ballForm.secondaryColor || '—'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 font-semibold mb-1">
                      Акцент / лого:
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-stone-900 border border-stone-800">
                      <input
                        type="color"
                        value={ballForm.accentColor || '#fb923c'}
                        onChange={(e) => setBallForm({ ...ballForm, accentColor: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-[10px] text-stone-300">
                        {ballForm.accentColor || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: DRILLING PARAMETERS */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>6. Параметры сверления (Layout & PAP)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Схема сверления (Layout):
                    </label>
                    <input
                      type="text"
                      value={ballForm.drillingLayout}
                      onChange={(e) => setBallForm({ ...ballForm, drillingLayout: e.target.value })}
                      placeholder="Pin Up 4x4x2 / 2LS #1 / 60°x4”x35°"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                      Расстояние Pin to PAP:
                    </label>
                    <input
                      type="text"
                      value={ballForm.pinToPapDistance}
                      onChange={(e) =>
                        setBallForm({ ...ballForm, pinToPapDistance: e.target.value })
                      }
                      placeholder="4.5” / 5”"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                    Заметки по сверлению / хвату:
                  </label>
                  <input
                    type="text"
                    value={ballForm.drillingNotes}
                    onChange={(e) => setBallForm({ ...ballForm, drillingNotes: e.target.value })}
                    placeholder="Питчи пальцев, Turbo Switch Grip, вкладыши 43/64"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 7: ROLE & NOTES */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-950 border border-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ballForm.isPrimaryStrikeBall}
                      onChange={(e) => {
                        setBallForm({
                          ...ballForm,
                          isPrimaryStrikeBall: e.target.checked,
                          isSpareBall: e.target.checked ? false : ballForm.isSpareBall,
                        });
                      }}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
                    />
                    <span className="text-stone-200 font-semibold">★ Основной страйковый шар</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-950 border border-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ballForm.isSpareBall}
                      onChange={(e) => {
                        setBallForm({
                          ...ballForm,
                          isSpareBall: e.target.checked,
                          isPrimaryStrikeBall: e.target.checked
                            ? false
                            : ballForm.isPrimaryStrikeBall,
                        });
                      }}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
                    />
                    <span className="text-stone-200 font-semibold">🎯 Спэровый шар (для добивания)</span>
                  </label>
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                    Личные заметки по шару:
                  </label>
                  <textarea
                    rows={2}
                    value={ballForm.notes}
                    onChange={(e) => setBallForm({ ...ballForm, notes: e.target.value })}
                    placeholder="Например: Любимый шар для длинных спортивных диаграмм, отличный переход во флип..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsBallModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-stone-200 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 active:scale-95"
                >
                  {editingBall ? 'Сохранить изменения' : 'Добавить шар в арсенал'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
