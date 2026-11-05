import React, { useState, useRef } from 'react';
import { OilPattern, UserPersonalConfig } from '../types/bowling';
import { OilPatternModal } from './OilPatternModal';
import { OilDiagramViewerModal } from './OilDiagramViewerModal';
import {
  Droplets,
  Plus,
  Edit3,
  Trash2,
  Image as ImageIcon,
  ZoomIn,
  Layers,
  Sparkles,
  Calendar,
  Share2,
  Download,
  Upload,
} from 'lucide-react';
import {
  shareSingleOilPattern,
  shareAllOilPatterns,
  parseImportFileContent,
  mergeImportedOilPatterns,
} from '../utils/shareUtils';

interface OilPatternsManagerProps {
  userConfig: UserPersonalConfig;
  onUpdateConfig: (newConfig: UserPersonalConfig) => void;
  onNotification?: (msg: string) => void;
}

export const OilPatternsManager: React.FC<OilPatternsManagerProps> = ({
  userConfig,
  onUpdateConfig,
  onNotification,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<OilPattern | null>(null);
  const [viewingDiagramPattern, setViewingDiagramPattern] = useState<OilPattern | null>(null);

  const patterns = userConfig.oilPatterns || [];

  const handleOpenAdd = () => {
    setEditingPattern(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (pattern: OilPattern) => {
    setEditingPattern(pattern);
    setIsAddEditModalOpen(true);
  };

  const handleSavePattern = (savedPattern: OilPattern) => {
    let updated: OilPattern[];
    if (editingPattern) {
      updated = patterns.map((p) => (p.id === savedPattern.id ? savedPattern : p));
      if (onNotification) onNotification(`Программа «${savedPattern.name}» обновлена`);
    } else {
      updated = [savedPattern, ...patterns];
      if (onNotification) onNotification(`Программа «${savedPattern.name}» успешно добавлена`);
    }

    onUpdateConfig({
      ...userConfig,
      oilPatterns: updated,
    });
  };

  const handleSharePattern = async (pattern: OilPattern) => {
    try {
      const { sharedViaApi } = await shareSingleOilPattern(pattern);
      if (onNotification) {
        onNotification(
          sharedViaApi
            ? `Программа «${pattern.name}» отправлена`
            : `Файл программы «${pattern.name}» скачан`
        );
      }
    } catch (e) {
      console.error(e);
      if (onNotification) onNotification('Не удалось выгрузить программу');
    }
  };

  const handleExportAll = async () => {
    if (patterns.length === 0) {
      if (onNotification) onNotification('Каталог программ пуст');
      return;
    }
    try {
      const { sharedViaApi } = await shareAllOilPatterns(patterns);
      if (onNotification) {
        onNotification(
          sharedViaApi
            ? `Каталог масел (${patterns.length} шт.) отправлен`
            : `Каталог масел (${patterns.length} шт.) успешно выгружен в файл`
        );
      }
    } catch (e) {
      console.error(e);
      if (onNotification) onNotification('Не удалось выгрузить каталог');
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const parsed = parseImportFileContent(content);
      let incomingPatterns: OilPattern[] = [];

      if (parsed.patterns && parsed.patterns.length > 0) {
        incomingPatterns = parsed.patterns;
      } else if (parsed.backupData?.userConfig?.oilPatterns) {
        incomingPatterns = parsed.backupData.userConfig.oilPatterns;
      } else {
        if (onNotification) {
          onNotification('Выбранный файл не содержит программ нанесения масла');
        }
        return;
      }

      const { updatedPatterns, addedCount } = mergeImportedOilPatterns(patterns, incomingPatterns);
      onUpdateConfig({
        ...userConfig,
        oilPatterns: updatedPatterns,
      });

      if (onNotification) {
        onNotification(
          addedCount === 1
            ? `Программа «${incomingPatterns[0].name}» со скриншотом добавлена!`
            : `Успешно импортировано программ масла: ${addedCount} шт.`
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeletePattern = (id: string, name: string) => {
    if (patterns.length <= 1) {
      if (onNotification) onNotification('В арсенале должна оставаться хотя бы одна программа масла');
      return;
    }
    const updated = patterns.filter((p) => p.id !== id);
    onUpdateConfig({
      ...userConfig,
      oilPatterns: updated,
    });
    if (onNotification) onNotification(`Программа «${name}» удалена`);
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json,text/plain,*/*"
        onChange={handleImportFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-800">
        <div>
          <h3 className="text-xl font-extrabold text-stone-100 font-display flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <span>Программы нанесения масла и диаграммы</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Каталог масляных профилей дорожек с прикреплёнными скриншотами и диаграммами нанесения
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
            title="Добавить программы из .json файла"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Импорт из файла</span>
          </button>

          <button
            type="button"
            onClick={handleExportAll}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
            title="Выгрузить весь каталог масел со скриншотами в файл"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Выгрузить весь раздел</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleOpenAdd();
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить программу масла</span>
          </button>
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patterns.map((p) => {
          const hasImage = !!p.imageUrl;

          return (
            <div
              key={p.id}
              className="rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all shadow-sm"
            >
              <div className="space-y-3">
                {/* Title & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          p.category === 'Sport'
                            ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                            : p.category === 'Challenge'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {p.category}
                      </span>
                      {hasImage && (
                        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>Скриншот диаграммы</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-stone-100 font-display mt-1">
                      {p.name}
                    </h4>
                    {p.competitionName && (
                      <div className="text-xs text-stone-400 mt-0.5">{p.competitionName}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSharePattern(p);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-cyan-400 hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Поделиться / Выгрузить программу в файл"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenEdit(p);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Редактировать"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeletePattern(p.id, p.name);
                      }}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Specs Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 text-xs text-center">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Длина</span>
                    <span className="font-mono font-bold text-cyan-300">{p.lengthFt} ft</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Объём</span>
                    <span className="font-mono font-bold text-stone-200">
                      {p.volumeMl ? `${p.volumeMl} mL` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Ratio</span>
                    <span className="font-mono font-bold text-amber-300">
                      {p.ratio || '—'}
                    </span>
                  </div>
                </div>

                {/* Screenshot / Diagram Preview */}
                {hasImage ? (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      setViewingDiagramPattern(p);
                    }}
                    className="relative group rounded-xl overflow-hidden border border-stone-800 bg-black cursor-pointer max-h-36 flex items-center justify-center transition-all hover:border-cyan-500/60"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="max-h-36 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs backdrop-blur-[2px]">
                      <ZoomIn className="w-4 h-4 text-cyan-400" />
                      <span>Открыть диаграмму</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenEdit(p);
                    }}
                    className="w-full p-2.5 rounded-xl border border-dashed border-stone-800 hover:border-amber-500/40 text-stone-400 hover:text-amber-300 text-xs flex items-center justify-center gap-1.5 transition-colors bg-stone-950/40 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>+ Прикрепить скриншот диаграммы</span>
                  </button>
                )}

                {/* Notes */}
                {p.notes && (
                  <p className="text-xs text-stone-400 line-clamp-2">
                    {p.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                {hasImage ? (
                  <button
                    type="button"
                    onClick={() => setViewingDiagramPattern(p)}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Посмотреть диаграмму</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Редактировать параметры</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Pattern Modal */}
      <OilPatternModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSavePattern}
        initialPattern={editingPattern}
      />

      {/* Full Diagram Screenshot Viewer Modal */}
      <OilDiagramViewerModal
        pattern={viewingDiagramPattern}
        isOpen={!!viewingDiagramPattern}
        onClose={() => setViewingDiagramPattern(null)}
        allPatterns={patterns}
        onSelectPattern={(nextPattern) => setViewingDiagramPattern(nextPattern)}
      />
    </div>
  );
};
