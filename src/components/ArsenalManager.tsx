import React, { useState, useRef } from 'react';
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
  AlertTriangle,
  Archive,
  Share2,
  Download,
  Upload,
  Image as ImageIcon,
  ZoomIn,
} from 'lucide-react';
import { BallVisual } from './BallVisual';
import {
  BALL_CATALOG,
  BALL_BRANDS,
  CatalogBallPreset,
  createBallFromPreset,
  getBallWeightSpec,
} from '../data/ballCatalog';
import { saveSavedBalls, saveUserPersonalConfig } from '../utils/storage';
import { compressImage, getImageSizeKb } from '../utils/imageCompressor';
import {
  shareSingleBall,
  shareAllBalls,
  parseImportFileContent,
  mergeImportedBalls,
} from '../utils/shareUtils';

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
  const [catalogEraFilter, setCatalogEraFilter] = useState<'all' | 'modern' | 'archived' | 'banned'>('all');

  // Weight selected per catalog card: presetId -> weightLbs (defaults to 15)
  const [catalogCardWeights, setCatalogCardWeights] = useState<Record<string, number>>({});
  const getCardWeight = (presetId: string) => catalogCardWeights[presetId] || 15;
  const setCardWeight = (presetId: string, weight: number) => {
    setCatalogCardWeights((prev) => ({ ...prev, [presetId]: weight }));
  };

  // Modals state
  const [isBallModalOpen, setIsBallModalOpen] = useState(false);
  const [editingBall, setEditingBall] = useState<BowlingBall | null>(null);
  const [previewPhotoBall, setPreviewPhotoBall] = useState<BowlingBall | null>(null);

  // File and image upload refs
  const importFileRef = useRef<HTMLInputElement>(null);
  const ballImageInputRef = useRef<HTMLInputElement>(null);
  const presetImageInputRef = useRef<HTMLInputElement>(null);
  const [isCompressingBallImage, setIsCompressingBallImage] = useState(false);

  // Preset Add Modal state
  const [activePresetToAdd, setActivePresetToAdd] = useState<CatalogBallPreset | null>(null);
  const [presetWeight, setPresetWeight] = useState<number>(15);
  const [presetIsPrimary, setPresetIsPrimary] = useState<boolean>(false);
  const [presetIsSpare, setPresetIsSpare] = useState<boolean>(false);
  const [presetDrillingLayout, setPresetDrillingLayout] = useState<string>('Pin Up 4x4x2');
  const [presetPinToPap, setPresetPinToPap] = useState<string>('4.5"');
  const [presetDrillingNotes, setPresetDrillingNotes] = useState<string>('');
  const [presetImageUrl, setPresetImageUrl] = useState<string>('');
  const [presetImageName, setPresetImageName] = useState<string>('');

  // Manual Ball Form state with full catalog specs and photo attachment
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
    imageUrl?: string;
    imageName?: string;
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
    imageUrl: '',
    imageName: '',
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
      imageUrl: '',
      imageName: '',
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
      imageUrl: ball.imageUrl || '',
      imageName: ball.imageName || '',
    });
    setIsBallModalOpen(true);
  };

  const handleSaveBall = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const trimmedName = ballForm.name.trim();
    if (!trimmedName) {
      if (onNotification) {
        onNotification('Пожалуйста, укажите название модели шара');
      }
      return;
    }

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
    let targetBallId = '';

    if (editingBall) {
      targetBallId = editingBall.id;
      updatedBalls = updatedBalls.map((b) =>
        b.id === editingBall.id
          ? {
              ...b,
              name: trimmedName,
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
              imageUrl: ballForm.imageUrl?.trim() || undefined,
              imageName: ballForm.imageName?.trim() || undefined,
            }
          : b
      );

      if (ballForm.isPrimaryStrikeBall) {
        updatedBalls = updatedBalls.map((b) =>
          b.id === editingBall.id ? b : { ...b, isPrimaryStrikeBall: false }
        );
      }
      if (ballForm.isSpareBall) {
        updatedBalls = updatedBalls.map((b) =>
          b.id === editingBall.id ? b : { ...b, isSpareBall: false }
        );
      }

      if (onNotification) onNotification(`Шар «${trimmedName}» успешно обновлен`);
    } else {
      const isFirstBall = updatedBalls.length === 0;
      const shouldBePrimary = ballForm.isPrimaryStrikeBall || isFirstBall;
      targetBallId = 'ball_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

      const newBall: BowlingBall = {
        id: targetBallId,
        name: trimmedName,
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
        isPrimaryStrikeBall: shouldBePrimary,
        isSpareBall: shouldBePrimary ? false : ballForm.isSpareBall,
        drillingLayout: ballForm.drillingLayout.trim() || undefined,
        pinToPapDistance: ballForm.pinToPapDistance.trim() || undefined,
        drillingNotes: ballForm.drillingNotes.trim() || undefined,
        notes: ballForm.notes.trim() || undefined,
        imageUrl: ballForm.imageUrl?.trim() || undefined,
        imageName: ballForm.imageName?.trim() || undefined,
      };

      if (shouldBePrimary) {
        updatedBalls = updatedBalls.map((b) => ({ ...b, isPrimaryStrikeBall: false }));
      }
      if (newBall.isSpareBall) {
        updatedBalls = updatedBalls.map((b) => ({ ...b, isSpareBall: false }));
      }

      updatedBalls.push(newBall);
      if (onNotification) onNotification(`Шар «${newBall.name}» добавлен в арсенал`);
    }

    const nextActiveBallId = ballForm.isPrimaryStrikeBall
      ? targetBallId
      : (userConfig.activeBallId || targetBallId);

    const updatedConfig: UserPersonalConfig = {
      ...userConfig,
      balls: updatedBalls,
      activeBallId: nextActiveBallId,
    };

    // Save directly to localStorage for immediate persistent safety
    saveSavedBalls(updatedBalls);
    saveUserPersonalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);

    setIsBallModalOpen(false);
    setBallSubView('my_bag');
  };

  const handleDeleteBall = (ballId: string, ballName: string) => {
    if (window.confirm(`Удалить шар «${ballName}» из вашего арсенала?`)) {
      const updated = userConfig.balls.filter((b) => b.id !== ballId);
      const nextActiveBallId =
        userConfig.activeBallId === ballId
          ? (updated[0]?.id || undefined)
          : userConfig.activeBallId;

      const updatedConfig: UserPersonalConfig = {
        ...userConfig,
        balls: updated,
        activeBallId: nextActiveBallId,
      };

      saveSavedBalls(updated);
      saveUserPersonalConfig(updatedConfig);
      onUpdateConfig(updatedConfig);
      if (onNotification) onNotification(`Шар «${ballName}» удалён`);
    }
  };

  const handleOpenAddPresetModal = (preset: CatalogBallPreset, initialWeight = 15) => {
    setActivePresetToAdd(preset);
    setPresetWeight(initialWeight);
    setPresetIsPrimary(userConfig.balls.length === 0);
    setPresetIsSpare(false);
    setPresetDrillingLayout('Pin Up 4x4x2');
    setPresetPinToPap('4.5"');
    setPresetDrillingNotes('');
    setPresetImageUrl('');
    setPresetImageName('');
  };

  const handleAddPresetConfirm = () => {
    if (!activePresetToAdd) return;
    const isFirstBall = userConfig.balls.length === 0;
    const shouldBePrimary = presetIsPrimary || isFirstBall;
    const baseNewBall = createBallFromPreset(
      activePresetToAdd,
      presetWeight,
      shouldBePrimary,
      presetIsSpare,
      presetDrillingLayout,
      presetPinToPap,
      presetDrillingNotes
    );
    const newBall: BowlingBall = {
      ...baseNewBall,
      imageUrl: presetImageUrl.trim() || undefined,
      imageName: presetImageName.trim() || undefined,
    };

    let updatedBalls = [...userConfig.balls];
    if (shouldBePrimary) {
      updatedBalls = updatedBalls.map((b) => ({ ...b, isPrimaryStrikeBall: false }));
    }
    if (presetIsSpare) {
      updatedBalls = updatedBalls.map((b) => ({ ...b, isSpareBall: false }));
    }
    updatedBalls.push(newBall);

    const nextActiveBallId = shouldBePrimary ? newBall.id : (userConfig.activeBallId || newBall.id);

    const updatedConfig: UserPersonalConfig = {
      ...userConfig,
      balls: updatedBalls,
      activeBallId: nextActiveBallId,
    };

    saveSavedBalls(updatedBalls);
    saveUserPersonalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);

    if (onNotification) onNotification(`Шар «${newBall.name}» добавлен в арсенал`);
    setActivePresetToAdd(null);
    setBallSubView('my_bag');
  };

  // Share single ball (.json)
  const handleShareSingleBall = async (ball: BowlingBall) => {
    try {
      const res = await shareSingleBall(ball);
      if (onNotification) {
        onNotification(
          res.sharedViaApi
            ? `Шар «${ball.name}» отправлен через меню шеринга`
            : `Карточка «${ball.name}» выгружена в файл .json`
        );
      }
    } catch (e) {
      console.error(e);
      if (onNotification) onNotification('Не удалось выгрузить данные шара');
    }
  };

  // Share all balls in the arsenal (.json)
  const handleShareAllBalls = async () => {
    if (userConfig.balls.length === 0) {
      if (onNotification) onNotification('В арсенале пока нет шаров для выгрузки');
      return;
    }
    try {
      const res = await shareAllBalls(userConfig.balls);
      if (onNotification) {
        onNotification(
          res.sharedViaApi
            ? `Арсенал (${userConfig.balls.length} шаров) отправлен`
            : `Арсенал (${userConfig.balls.length} шаров) выгружен в .json`
        );
      }
    } catch (e) {
      console.error(e);
      if (onNotification) onNotification('Не удалось выгрузить арсенал');
    }
  };

  // Import balls from .json file (Merge mode)
  const handleImportBallsFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const parsed = parseImportFileContent(content);
      let incomingBalls: BowlingBall[] = [];

      if (parsed.balls && parsed.balls.length > 0) {
        incomingBalls = parsed.balls;
      } else if (parsed.backupData?.userConfig?.balls) {
        incomingBalls = parsed.backupData.userConfig.balls;
      } else {
        if (onNotification) {
          onNotification('Выбранный файл не содержит данных шаров для боулинга');
        }
        return;
      }

      const { updatedBalls, addedCount, names } = mergeImportedBalls(userConfig.balls, incomingBalls);
      const updatedConfig: UserPersonalConfig = {
        ...userConfig,
        balls: updatedBalls,
        activeBallId: userConfig.activeBallId || updatedBalls[0]?.id,
      };

      saveSavedBalls(updatedBalls);
      saveUserPersonalConfig(updatedConfig);
      onUpdateConfig(updatedConfig);

      if (onNotification) {
        if (addedCount === 1) {
          onNotification(`Шар «${names[0]}» со сверловкой и фото добавлен в арсенал!`);
        } else {
          onNotification(`Успешно импортировано шаров: ${addedCount} шт.`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Universal image / drilling photo processor with Canvas compression & direct fallback
  const handleProcessBallImage = async (file: File, isPreset: boolean = false) => {
    try {
      setIsCompressingBallImage(true);
      let dataUrl = await compressImage(file, 1000, 0.7);

      if (!dataUrl) {
        // Fallback: direct FileReader
        dataUrl = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = (e) => res((e.target?.result as string) || '');
          reader.onerror = () => res('');
          reader.readAsDataURL(file);
        });
      }

      if (!dataUrl) {
        if (onNotification) onNotification('Не удалось прикрепить файл');
        return;
      }

      const sizeKb = getImageSizeKb(dataUrl);

      if (isPreset) {
        setPresetImageUrl(dataUrl);
        setPresetImageName(file.name);
      } else {
        setBallForm((prev) => ({
          ...prev,
          imageUrl: dataUrl,
          imageName: file.name,
        }));
      }

      if (onNotification) {
        onNotification(`Фото прикреплено (~${sizeKb} КБ)`);
      }
    } catch (err) {
      console.warn('Direct fallback for ball photo', err);
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const raw = (e.target?.result as string) || '';
          if (raw) {
            if (isPreset) {
              setPresetImageUrl(raw);
              setPresetImageName(file.name);
            } else {
              setBallForm((prev) => ({
                ...prev,
                imageUrl: raw,
                imageName: file.name,
              }));
            }
            if (onNotification) onNotification('Фото успешно прикреплено');
          }
        };
        reader.readAsDataURL(file);
      } catch (e) {
        console.error(e);
        if (onNotification) onNotification('Не удалось сохранить фото');
      }
    } finally {
      setIsCompressingBallImage(false);
    }
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

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Hidden file input for ball import */}
          <input
            ref={importFileRef}
            type="file"
            accept=".json,application/json,text/plain,*/*"
            onChange={handleImportBallsFromFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => importFileRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
            title="Добавить шары из .json файла (импорт слиянием)"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Импорт из файла</span>
          </button>

          <button
            type="button"
            onClick={handleShareAllBalls}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
            title="Выгрузить весь арсенал со сверловками и фото в .json"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Выгрузить весь раздел</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleOpenAddBall();
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать шар вручную</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation inside Arsenal: My Bag vs Top Brands Catalog */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setBallSubView('my_bag');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
            onClick={(e) => {
              e.preventDefault();
              setBallSubView('catalog');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
                  onClick={(e) => {
                    e.preventDefault();
                    setBallSubView('catalog');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Выбрать шар из каталога
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenAddBall();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs cursor-pointer"
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
                          onClick={(e) => {
                            e.preventDefault();
                            handleShareSingleBall(ball);
                          }}
                          className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                          title="Поделиться / Выгрузить шар в файл (.json)"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenEditBall(ball);
                          }}
                          className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                          title="Редактировать параметры шара"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteBall(ball.id, ball.name);
                          }}
                          className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Удалить шар"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Ball / Drilling photo thumbnail preview */}
                    {ball.imageUrl && (
                      <div className="mt-2.5 p-2 rounded-xl bg-stone-950/80 border border-stone-800/80 flex items-center justify-between gap-2.5">
                        <div
                          onClick={() => setPreviewPhotoBall(ball)}
                          className="flex items-center gap-2.5 cursor-pointer group/photo min-w-0"
                          title="Нажмите, чтобы просмотреть фото"
                        >
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-stone-900 border border-stone-700 shrink-0">
                            <img
                              src={ball.imageUrl}
                              alt={ball.name}
                              className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/25 group-hover/photo:bg-transparent flex items-center justify-center transition-colors">
                              <ZoomIn className="w-3.5 h-3.5 text-white/90 drop-shadow" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                              Фото / Схема сверловки
                            </span>
                            <span className="text-xs text-stone-300 font-medium truncate block">
                              {ball.imageName || 'Фотография шара'}
                            </span>
                            <span className="text-[9px] text-stone-500 font-mono">
                              ~{getImageSizeKb(ball.imageUrl)} КБ (оптимизировано)
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewPhotoBall(ball)}
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold shrink-0 cursor-pointer"
                          title="Увеличить фото"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

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

                    {/* TTX Specifications Grid for ball.weightLbs: RG, Diff, MB, Oil */}
                    {(ball.rg !== undefined || ball.diff !== undefined || ball.mb !== undefined || ball.recommendedOil) && (
                      <div className="mt-2 p-2.5 rounded-xl bg-stone-950/90 border border-stone-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                          <span>ТТХ для {ball.weightLbs || 15} lbs</span>
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
          <div className="space-y-2.5 p-3 rounded-2xl bg-stone-900 border border-stone-800">
            {/* Top row: Brand Tabs & Search Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Brand Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {BALL_BRANDS.map((brandName) => (
                  <button
                    key={brandName}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCatalogBrand(brandName);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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

            {/* Bottom row: Category filter toggle (All / Modern / Archived / Banned) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/80">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider hidden sm:inline">
                  Категории:
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCatalogEraFilter('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogEraFilter === 'all'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  Все ({BALL_CATALOG.length})
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCatalogEraFilter('modern');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogEraFilter === 'modern'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  Активные ({BALL_CATALOG.filter((b) => !b.isArchived && !b.isBanned).length})
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCatalogEraFilter('archived');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    catalogEraFilter === 'archived'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-950 text-amber-400 border border-amber-500/30 hover:border-amber-500/60'
                  }`}
                >
                  <Archive className="w-3 h-3 text-amber-400" />
                  <span>Пенсионеры ({BALL_CATALOG.filter((b) => b.isArchived && !b.isBanned).length})</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCatalogEraFilter('banned');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    catalogEraFilter === 'banned'
                      ? 'bg-red-500 text-stone-950 shadow-xs'
                      : 'bg-stone-950 text-red-400 border border-red-500/30 hover:border-red-500/60'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span>Запрещенные USBC/PBA ({BALL_CATALOG.filter((b) => b.isBanned).length})</span>
                </button>
              </div>

              <span className="text-[11px] text-stone-500 font-mono">
                {BALL_CATALOG.filter((p) => {
                  if (catalogBrand !== 'Все' && p.brand !== catalogBrand) return false;
                  if (catalogEraFilter === 'modern' && (p.isArchived || p.isBanned)) return false;
                  if (catalogEraFilter === 'archived' && (!p.isArchived || p.isBanned)) return false;
                  if (catalogEraFilter === 'banned' && !p.isBanned) return false;
                  return true;
                }).length} моделей (отсортированы от новинок к старым)
              </span>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BALL_CATALOG
              .filter((preset) => {
                if (catalogBrand !== 'Все' && preset.brand !== catalogBrand) return false;
                if (catalogEraFilter === 'modern' && (preset.isArchived || preset.isBanned)) return false;
                if (catalogEraFilter === 'archived' && (!preset.isArchived || preset.isBanned)) return false;
                if (catalogEraFilter === 'banned' && !preset.isBanned) return false;
                if (catalogSearch.trim()) {
                  const q = catalogSearch.toLowerCase();
                  return (
                    preset.name.toLowerCase().includes(q) ||
                    preset.brand.toLowerCase().includes(q) ||
                    preset.coverstockName.toLowerCase().includes(q) ||
                    String(preset.releaseYear).includes(q)
                  );
                }
                return true;
              })
              .map((preset) => {
                const countInArsenal = userConfig.balls.filter(
                  (b) => b.presetId === preset.id || b.name === `${preset.brand} ${preset.name}`
                ).length;
                const currentWeight = getCardWeight(preset.id);
                const spec = getBallWeightSpec(preset, currentWeight);

                return (
                  <div
                    key={preset.id}
                    className={`rounded-3xl bg-stone-900/90 border p-5 space-y-3.5 transition-all shadow-xl flex flex-col justify-between group ${
                      preset.isBanned
                        ? 'border-red-900/50 hover:border-red-500/60'
                        : preset.isArchived
                        ? 'border-stone-800 hover:border-amber-500/30'
                        : 'border-stone-800 hover:border-amber-500/50'
                    }`}
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
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block shrink-0">
                                {preset.brand}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-stone-950 border border-stone-800 text-stone-300 shrink-0">
                                {preset.releaseYear} г.
                              </span>
                              {preset.isArchived && !preset.isBanned && (
                                <span
                                  className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0"
                                  title="Модель снята с производства и находится в архиве бренда"
                                >
                                  <Archive className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                  <span>Пенсионер</span>
                                </span>
                              )}
                              {preset.isBanned && (
                                <span
                                  className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-950/90 text-red-300 border border-red-500/50 flex items-center gap-1 shrink-0"
                                  title={preset.bannedReason}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 text-red-400 shrink-0" />
                                  <span>{preset.bannedReason?.includes('PBA') ? 'Запрещён PBA' : 'Запрещён'}</span>
                                </span>
                              )}
                            </div>
                            {countInArsenal > 0 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
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

                      {/* Weight Selector on Card */}
                      <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800/80">
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                          Вес:
                        </span>
                        <div className="flex items-center gap-1">
                          {[12, 13, 14, 15, 16].map((w) => {
                            const isSelected = currentWeight === w;
                            return (
                              <button
                                key={w}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCardWeight(preset.id, w);
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500 text-stone-950 shadow-xs ring-1 ring-amber-400'
                                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
                                }`}
                                title={`Показать характеристики для ${w} lbs`}
                              >
                                {w}
                              </button>
                            );
                          })}
                          <span className="text-[10px] text-stone-500 font-mono ml-0.5">lbs</span>
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

                      {/* Core row: Dynamically reflects spec.coreName and spec.coreType for selected weight */}
                      <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                            Ядро ({currentWeight} lbs)
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-md font-mono font-bold text-[10px] ${
                              spec.coreType === 'Asymmetrical'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {spec.coreType === 'Asymmetrical' ? 'Asym (Асимметрик)' : 'Sym (Симметрик)'}
                          </span>
                        </div>
                        <div className="font-bold text-stone-200 text-xs truncate" title={spec.coreName}>
                          {spec.coreName}
                        </div>
                      </div>

                      {/* TTX Specifications: Dynamically for currentWeight (RG, Diff, MB, Oil) */}
                      <div className="p-2.5 rounded-xl bg-stone-950/90 border border-stone-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                          <span>ТТХ для {spec.weightLbs} lbs</span>
                          <span className="text-stone-500 font-mono font-normal">Спецификация</span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">RG</span>
                            <span className="font-mono font-bold text-amber-400 text-xs">{spec.rg.toFixed(2)}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">Diff</span>
                            <span className="font-mono font-bold text-amber-400 text-xs">{spec.diff.toFixed(3)}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800/80">
                            <span className="text-[9px] text-stone-500 block uppercase font-medium">MB</span>
                            <span className="font-mono font-bold text-purple-300 text-xs">
                              {spec.mb !== undefined ? spec.mb.toFixed(3) : '—'}
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

                      {preset.isBanned && (
                        <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-start gap-2 shadow-inner">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-bold text-red-300 text-[11px] block">Официальный запрет USBC / PBA</span>
                            <p className="text-[10px] text-red-200/90 leading-tight">{preset.bannedReason}</p>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-stone-400 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    {/* "+ В арсенал" Action Button */}
                    <div className="pt-3 border-t border-stone-800/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenAddPresetModal(preset, currentWeight);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>+ В арсенал ({currentWeight} lbs)</span>
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-amber-400">
                      {activePresetToAdd.brand}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-stone-950 border border-stone-800 text-stone-300">
                      {activePresetToAdd.releaseYear} г.
                    </span>
                    {activePresetToAdd.isArchived && !activePresetToAdd.isBanned && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Archive className="w-2.5 h-2.5 text-amber-400" />
                        <span>Пенсионер</span>
                      </span>
                    )}
                    {activePresetToAdd.isBanned && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-950/90 text-red-300 border border-red-500/50 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                        <span>{activePresetToAdd.bannedReason?.includes('PBA') ? 'Запрещён PBA' : 'Запрещён USBC'}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-stone-100 font-display">
                    {activePresetToAdd.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePresetToAdd(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activePresetToAdd.isBanned && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <strong className="text-red-300 font-bold block">Внимание: Шар запрещён к официальным турнирам</strong>
                  <p className="text-[11px] text-red-200/90">{activePresetToAdd.bannedReason}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Select Weight */}
              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1.5">
                  Вес шара (в фунтах):
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[12, 13, 14, 15, 16].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPresetWeight(w);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
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

              {/* Dynamic TTX & Core Preview for chosen presetWeight */}
              {(() => {
                const modalSpec = getBallWeightSpec(activePresetToAdd, presetWeight);
                return (
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                        Заводские ТТХ для {modalSpec.weightLbs} lbs
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          modalSpec.coreType === 'Asymmetrical'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {modalSpec.coreType === 'Asymmetrical' ? 'Asym (Асимметрик)' : 'Sym (Симметрик)'}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-300">
                      <span className="text-stone-500 uppercase text-[9px] block">Ядро:</span>
                      <span className="font-semibold text-stone-200">{modalSpec.coreName}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                      <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                        <span className="text-[9px] text-stone-500 block uppercase">RG</span>
                        <span className="font-mono font-bold text-amber-400 text-xs">{modalSpec.rg.toFixed(2)}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                        <span className="text-[9px] text-stone-500 block uppercase">Diff</span>
                        <span className="font-mono font-bold text-amber-400 text-xs">{modalSpec.diff.toFixed(3)}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                        <span className="text-[9px] text-stone-500 block uppercase">Int. Diff (MB)</span>
                        <span className="font-mono font-bold text-purple-300 text-xs">
                          {modalSpec.mb !== undefined ? modalSpec.mb.toFixed(3) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

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

                {/* Photo attachment for preset ball / drilling layout */}
                <div className="pt-2 border-t border-stone-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="uppercase text-[10px] text-stone-400 font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Фото шара или схема сверловки (необязательно):</span>
                    </label>
                    {presetImageUrl && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ~{getImageSizeKb(presetImageUrl)} КБ
                      </span>
                    )}
                  </div>

                  <input
                    ref={presetImageInputRef}
                    type="file"
                    accept="image/*,.heic,.heif,.webp,.bmp,.svg,.tiff,.avif,.pdf,*/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProcessBallImage(file, true);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  {presetImageUrl ? (
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-900 border border-stone-700">
                      <img
                        src={presetImageUrl}
                        alt="Drilling Layout"
                        className="w-12 h-12 rounded-lg object-cover border border-stone-600 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-stone-200 font-medium truncate">
                          {presetImageName || 'Фото сверловки'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <button
                            type="button"
                            onClick={() => presetImageInputRef.current?.click()}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                          >
                            Заменить
                          </button>
                          <span className="text-stone-600">·</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPresetImageUrl('');
                              setPresetImageName('');
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => presetImageInputRef.current?.click()}
                      disabled={isCompressingBallImage}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-700 hover:border-amber-500/60 bg-stone-900/60 hover:bg-stone-900 flex items-center justify-center gap-2 transition-all cursor-pointer text-stone-400 hover:text-stone-200 text-xs disabled:opacity-50"
                    >
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>{isCompressingBallImage ? 'Сжатие фото...' : 'Прикрепить фото шара или сверловки'}</span>
                    </button>
                  )}
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
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePresetToAdd(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddPresetConfirm();
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-500/20 cursor-pointer"
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
                onClick={(e) => {
                  e.preventDefault();
                  setIsBallModalOpen(false);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveBall(e);
              }}
              className="space-y-4 text-xs"
            >
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
                        onClick={(e) => {
                          e.preventDefault();
                          setBallForm({ ...ballForm, weightLbs: w });
                        }}
                        className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
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
                        onClick={(e) => {
                          e.preventDefault();
                          setBallForm({ ...ballForm, coverstock: type });
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border text-center cursor-pointer ${
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
                        onClick={(e) => {
                          e.preventDefault();
                          setBallForm({ ...ballForm, finish: f });
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors cursor-pointer ${
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
                        onClick={(e) => {
                          e.preventDefault();
                          setBallForm({ ...ballForm, coreType: 'Symmetrical' });
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          ballForm.coreType === 'Symmetrical'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                        }`}
                      >
                        <span>Sym (Симметрик)</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setBallForm({ ...ballForm, coreType: 'Asymmetrical' });
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
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
                        onClick={(e) => {
                          e.preventDefault();
                          setBallForm({
                            ...ballForm,
                            primaryColor: p.p,
                            secondaryColor: p.s,
                            accentColor: p.a,
                          });
                        }}
                        className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-left transition-all flex items-center gap-2 group cursor-pointer"
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

              {/* SECTION 7: BALL & DRILLING PHOTO */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>7. Фотография шара и сетки сверловки</span>
                  </span>
                  {ballForm.imageUrl && (
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ~{getImageSizeKb(ballForm.imageUrl)} КБ (сжато Canvas)
                    </span>
                  )}
                </div>

                <input
                  ref={ballImageInputRef}
                  type="file"
                  accept="image/*,.heic,.heif,.webp,.bmp,.svg,.tiff,.avif,.pdf,*/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessBallImage(file, false);
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                {ballForm.imageUrl ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <img
                      src={ballForm.imageUrl}
                      alt="Ball Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-stone-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-200 truncate">
                        {ballForm.imageName || 'Фотография шара'}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Сжато через Canvas до 1000px · ~{getImageSizeKb(ballForm.imageUrl)} КБ
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => ballImageInputRef.current?.click()}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                        >
                          Заменить фото
                        </button>
                        <span className="text-stone-600">·</span>
                        <button
                          type="button"
                          onClick={() => setBallForm((prev) => ({ ...prev, imageUrl: '', imageName: '' }))}
                          className="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => ballImageInputRef.current?.click()}
                    disabled={isCompressingBallImage}
                    className="w-full py-3.5 px-3 rounded-xl border border-dashed border-stone-700 hover:border-amber-500/60 bg-stone-900/60 hover:bg-stone-900 flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer disabled:opacity-50"
                  >
                    <ImageIcon className="w-5 h-5 text-stone-400" />
                    <span className="text-xs font-semibold text-stone-300">
                      {isCompressingBallImage ? 'Сжатие фото через Canvas...' : 'Прикрепить фото шара или схемы сверловки'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Автоматическое сжатие до 1000px (~100–180 КБ) для быстрой работы localStorage
                    </span>
                  </button>
                )}
              </div>

              {/* SECTION 8: ROLE & NOTES */}
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
                  onClick={(e) => {
                    e.preventDefault();
                    setIsBallModalOpen(false);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-stone-200 rounded-xl cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveBall(e);
                  }}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  {editingBall ? 'Сохранить изменения' : 'Добавить шар в арсенал'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PHOTO PREVIEW MODAL */}
      {previewPhotoBall && previewPhotoBall.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewPhotoBall(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div>
                <h4 className="font-bold text-stone-100 text-sm sm:text-base">
                  {previewPhotoBall.name}
                </h4>
                <p className="text-xs text-stone-400">
                  {previewPhotoBall.brand} · {previewPhotoBall.weightLbs} lbs · {previewPhotoBall.drillingLayout || 'Фото сверловки'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhotoBall(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center max-h-[65vh]">
              <img
                src={previewPhotoBall.imageUrl}
                alt={previewPhotoBall.name}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
              <span>Размер: ~{getImageSizeKb(previewPhotoBall.imageUrl)} КБ (оптимизировано)</span>
              <button
                type="button"
                onClick={() => handleShareSingleBall(previewPhotoBall)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Поделиться карточкой шара</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
