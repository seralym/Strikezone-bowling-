import React, { useState, useRef, useEffect } from 'react';
import { OilPattern } from '../types/bowling';
import {
  X,
  Droplets,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  Eye,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface OilPatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pattern: OilPattern) => void;
  initialPattern?: OilPattern | null;
}

export const OilPatternModal: React.FC<OilPatternModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPattern,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'House' | 'Challenge' | 'Sport'>('House');
  const [lengthFt, setLengthFt] = useState<number>(41);
  const [volumeMl, setVolumeMl] = useState<number | ''>(22.4);
  const [ratio, setRatio] = useState<string>('8.5:1');
  const [competitionName, setCompetitionName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Screenshot / Photo state
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageName, setImageName] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (initialPattern) {
      setName(initialPattern.name);
      setCategory(initialPattern.category);
      setLengthFt(initialPattern.lengthFt);
      setVolumeMl(typeof initialPattern.volumeMl === 'number' ? initialPattern.volumeMl : '');
      setRatio(initialPattern.ratio || '');
      setCompetitionName(initialPattern.competitionName || '');
      setNotes(initialPattern.notes || '');
      setImageUrl(initialPattern.imageUrl);
      setImageName(initialPattern.imageName);
    } else {
      setName('');
      setCategory('House');
      setLengthFt(41);
      setVolumeMl(22.4);
      setRatio('8.5:1');
      setCompetitionName('');
      setNotes('');
      setImageUrl(undefined);
      setImageName(undefined);
    }
    setErrorMsg(null);
  }, [initialPattern, isOpen]);

  // Support pasting screenshot from clipboard (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file, `screenshot_${Date.now()}.png`);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  // Process & compress uploaded image file to Data URL
  const processImageFile = (file: File, fallbackName?: string) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Пожалуйста, выберите файл изображения (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      // Compress and resize using off-screen image & canvas
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          setImageUrl(compressedDataUrl);
          setImageName(file.name || fallbackName || 'диаграмма_масла.jpg');
        } else {
          setImageUrl(rawDataUrl);
          setImageName(file.name || fallbackName || 'диаграмма_масла.png');
        }
      };
      img.onerror = () => {
        setImageUrl(rawDataUrl);
        setImageName(file.name || fallbackName || 'диаграмма_масла.png');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setImageName(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Укажите название программы масла');
      return;
    }

    const newPattern: OilPattern = {
      id: initialPattern?.id || `pattern_${Date.now()}`,
      name: name.trim(),
      category,
      lengthFt: Number(lengthFt) || 41,
      volumeMl: typeof volumeMl === 'number' && volumeMl > 0 ? volumeMl : undefined,
      ratio: ratio.trim() || undefined,
      competitionName: competitionName.trim() || undefined,
      notes: notes.trim() || undefined,
      imageUrl,
      imageName,
    };

    onSave(newPattern);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl space-y-4 p-5 sm:p-6 max-h-[95vh] overflow-y-auto text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100 font-display">
                {initialPattern ? 'Редактировать программу масла' : 'Новая программа масла'}
              </h3>
              <p className="text-xs text-stone-400">
                Характеристики профиля и скриншот диаграммы нанесения
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Название программы масла *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Kegel Main Street, House 41, PBA Shark"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 2. Category & Length */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Категория *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="House">House (Домашняя)</option>
                <option value="Challenge">Challenge (Турнирная)</option>
                <option value="Sport">Sport (Спортивная PBA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Длина (футы) *
              </label>
              <input
                type="number"
                required
                min={25}
                max={55}
                value={lengthFt}
                onChange={(e) => setLengthFt(Number(e.target.value))}
                placeholder="41"
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* 3. Volume & Ratio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Объём (мл / mL)
              </label>
              <input
                type="number"
                step="0.1"
                min={10}
                max={40}
                value={volumeMl}
                onChange={(e) => setVolumeMl(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="24.5"
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Соотношение (Ratio)
              </label>
              <input
                type="text"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                placeholder="3.5:1 или 8.5:1"
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* 4. Competition / Tournament name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Турнир / Серия (опционально)
            </label>
            <input
              type="text"
              value={competitionName}
              onChange={(e) => setCompetitionName(e.target.value)}
              placeholder="Например: Кубок Города 2026, Лига понедельника"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 5. ATTACH SCREENSHOT / PHOTO OF OIL DIAGRAM */}
          <div className="space-y-2 pt-1 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Фотография или скриншот диаграммы масла</span>
              </label>
              {imageUrl && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
                  ✓ Прикреплено
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 leading-tight">
              Прикрепите скриншот диаграммы нанесения масла (схема дорожки, профиль Kegel, PBA или фото из регламента турнира). Можно также вставить из буфера обмена (Ctrl+V).
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Upload Zone / Drop Area */}
            {!imageUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group ${
                  isDragging
                    ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
                    : 'border-stone-800 hover:border-amber-500/50 bg-stone-950/60 hover:bg-stone-950'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-200">
                    Нажмите для выбора файла или перетащите скриншот сюда
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Поддерживаются PNG, JPG, WebP (или нажмите Ctrl+V для вставки)
                  </div>
                </div>
              </div>
            ) : (
              /* Attached Image Preview Card */
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black/60 border border-stone-800/80 flex items-center justify-center max-h-48">
                  <img
                    src={imageUrl}
                    alt="Скриншот диаграммы масла"
                    className="max-h-48 w-auto object-contain rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-stone-300 truncate mr-2">
                    <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate text-[11px] font-mono">{imageName || 'диаграмма_масла.png'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-[11px] font-medium transition-colors"
                    >
                      Заменить
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-950/60 text-stone-400 hover:text-red-400 transition-colors"
                      title="Удалить скриншот"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Заметки по прохождению дорожки
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Особенности перехода масла, точка брейкпоинта, подходящие шары"
              className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialPattern ? 'Сохранить изменения' : 'Добавить программу масла'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
