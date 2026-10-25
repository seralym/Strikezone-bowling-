import React, { useState, useEffect, useRef } from 'react';
import { OilPattern } from '../types/bowling';
import {
  X,
  Droplets,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface OilDiagramViewerModalProps {
  pattern: OilPattern | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OilDiagramViewerModal: React.FC<OilDiagramViewerModalProps> = ({
  pattern,
  isOpen,
  onClose,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scale and rotation whenever a new pattern is opened
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen, pattern]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Listen to fullscreenchange
  useEffect(() => {
    const handleFsChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!isOpen || !pattern || !pattern.imageUrl) return null;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Number((prev - 0.35).toFixed(2)), 0.6));
  };

  const handleResetZoom = () => {
    setScale(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Tap on image toggles zoom: 1x -> 1.75x -> 2.5x -> 1x
  const handleImageTap = () => {
    setScale((prev) => {
      if (prev < 1.3) return 1.75;
      if (prev < 2.2) return 2.6;
      return 1;
    });
  };

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pattern.imageUrl!;
    link.download = `${pattern.name.replace(/\s+/g, '_')}_oil_diagram.png`;
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 w-screen h-screen bg-black/95 flex flex-col select-none overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <div className="px-4 py-2.5 sm:py-3 border-b border-stone-800 bg-stone-950/95 backdrop-blur-md flex items-center justify-between gap-3 z-20 shrink-0">
        {/* Left: Diagram Info & Specs */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  pattern.category === 'Sport'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : pattern.category === 'Challenge'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {pattern.category}
              </span>
              <span className="text-xs text-stone-300 font-mono font-bold">
                {pattern.lengthFt} ft
              </span>
              {pattern.volumeMl && (
                <span className="text-xs text-stone-400 font-mono hidden sm:inline">
                  · {pattern.volumeMl} mL
                </span>
              )}
              {pattern.ratio && (
                <span className="text-xs text-stone-400 font-mono hidden sm:inline">
                  · Ratio {pattern.ratio}
                </span>
              )}
            </div>

            <h2 className="text-sm sm:text-base font-bold text-white truncate font-display mt-0.5">
              {pattern.name} {pattern.competitionName ? `(${pattern.competitionName})` : ''}
            </h2>
          </div>
        </div>

        {/* Right: Controls (Zoom, Rotate, Fullscreen, Download, Close) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
            title="Уменьшить масштаб (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-mono font-semibold transition-colors"
            title="Сбросить масштаб (100%) и угол"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
            title="Увеличить масштаб (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
            title="Повернуть на 90° (для горизонтальных схем дорожек)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleBrowserFullscreen}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors hidden sm:flex"
            title="На весь экран"
          >
            {isBrowserFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
            title="Скачать файл диаграммы"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-red-600 text-stone-300 hover:text-white transition-colors ml-1"
            title="Закрыть просмотр (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Canvas Area */}
      <div className="flex-1 w-full h-full relative overflow-auto flex items-center justify-center bg-stone-950 p-2 sm:p-6 cursor-zoom-in">
        <div
          onClick={handleImageTap}
          className="transition-transform duration-200 ease-out flex items-center justify-center origin-center"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
          title="Нажмите на диаграмму для увеличения масштаба"
        >
          <img
            src={pattern.imageUrl}
            alt={`Диаграмма нанесения масла ${pattern.name}`}
            className="max-w-[92vw] max-h-[82vh] rounded-2xl object-contain shadow-2xl border border-stone-800/80 bg-black/90 pointer-events-auto"
          />
        </div>

        {/* Floating bottom guidance badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-700/60 text-[11px] text-stone-300 backdrop-blur-md shadow-xl flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span>Нажмите по диаграмме для зума · Доступен поворот на 90°</span>
        </div>
      </div>

      {/* Optional pattern notes footer */}
      {pattern.notes && (
        <div className="px-4 py-2 border-t border-stone-800/80 bg-stone-950/95 text-xs text-stone-400 shrink-0 flex items-center justify-between gap-4">
          <div className="truncate">
            <span className="text-stone-300 font-semibold mr-1.5">Заметки / Тактика:</span>
            <span>{pattern.notes}</span>
          </div>
          <span className="text-[11px] text-stone-500 shrink-0 font-mono">
            {pattern.lengthFt} ft · {pattern.category}
          </span>
        </div>
      )}
    </div>
  );
};
