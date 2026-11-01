import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { OilPattern } from '../types/bowling';
import {
  X,
  Droplets,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface OilDiagramViewerModalProps {
  pattern: OilPattern | null;
  isOpen: boolean;
  onClose: () => void;
  allPatterns?: OilPattern[];
  onSelectPattern?: (pattern: OilPattern) => void;
}

export const OilDiagramViewerModal: React.FC<OilDiagramViewerModalProps> = ({
  pattern,
  isOpen,
  onClose,
  allPatterns,
  onSelectPattern,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPosX: number; initialPosY: number }>({
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
  });
  const hasDraggedRef = useRef<boolean>(false);

  // List of all patterns that have screenshots
  const patternsWithImages = useMemo(() => {
    if (allPatterns && allPatterns.length > 0) {
      const filtered = allPatterns.filter((p) => !!p.imageUrl);
      if (filtered.length > 0) return filtered;
    }
    return pattern && pattern.imageUrl ? [pattern] : [];
  }, [allPatterns, pattern]);

  const currentIndex = useMemo(() => {
    if (!pattern) return 0;
    const idx = patternsWithImages.findIndex((p) => p.id === pattern.id);
    return idx !== -1 ? idx : 0;
  }, [pattern, patternsWithImages]);

  const hasMultiple = patternsWithImages.length > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple || !onSelectPattern) return;
    const prevIdx = (currentIndex - 1 + patternsWithImages.length) % patternsWithImages.length;
    onSelectPattern(patternsWithImages[prevIdx]);
  }, [hasMultiple, onSelectPattern, currentIndex, patternsWithImages]);

  const handleNext = useCallback(() => {
    if (!hasMultiple || !onSelectPattern) return;
    const nextIdx = (currentIndex + 1) % patternsWithImages.length;
    onSelectPattern(patternsWithImages[nextIdx]);
  }, [hasMultiple, onSelectPattern, currentIndex, patternsWithImages]);

  // Reset scale, rotation, and pan position whenever a new pattern is opened or modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, pattern]);

  // Native non-passive wheel event listener for fluid mouse/trackpad scroll-to-zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      setScale((prev) => {
        const next = Number((prev * zoomFactor).toFixed(2));
        return Math.min(Math.max(next, 0.4), 6.0);
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

  // Handle ESC and Arrow keys for navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

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
    setScale((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 6.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Number((prev - 0.35).toFixed(2)), 0.4));
  };

  const handleResetZoom = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Pointer drag handlers for panning around screen
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedRef.current = true;
    }
    setPosition({
      x: Math.round(dragStartRef.current.initialPosX + dx),
      y: Math.round(dragStartRef.current.initialPosY + dy),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Click on image toggles zoom if not dragged: 1x -> 1.8x -> 3.2x -> 1x
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;
    setScale((prev) => {
      if (prev < 1.3) return 1.8;
      if (prev < 2.5) return 3.2;
      return 1;
    });
    if (scale >= 2.5) {
      setPosition({ x: 0, y: 0 });
    }
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
              {hasMultiple && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentIndex + 1} из {patternsWithImages.length}
                </span>
              )}
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

      {/* Main Fullscreen Canvas Area with Wheel Zoom and Pan Drag */}
      <div
        ref={viewportRef}
        className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center bg-stone-950 p-2 sm:p-6 select-none touch-none"
      >
        {/* Floating Left Arrow Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-2xl bg-stone-900/90 hover:bg-amber-500 hover:text-stone-950 text-stone-200 border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
            title="Предыдущая диаграмма масла (стрелка влево ←)"
            aria-label="Предыдущая диаграмма масла"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Center Diagram Image with Pan Drag & Scroll Zoom */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleImageClick}
          className={`relative flex items-center justify-center origin-center select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            touchAction: 'none',
          }}
          title="Скролл колёсиком мыши — зум, зажмите для перемещения, клик — быстрый зум"
        >
          <img
            src={pattern.imageUrl}
            alt={`Диаграмма нанесения масла ${pattern.name}`}
            draggable={false}
            className="max-w-[92vw] max-h-[82vh] rounded-2xl object-contain shadow-2xl border border-stone-800/80 bg-black/90 pointer-events-none select-none"
          />
        </div>

        {/* Floating Right Arrow Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-2xl bg-stone-900/90 hover:bg-amber-500 hover:text-stone-950 text-stone-200 border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
            title="Следующая диаграмма масла (стрелка вправо →)"
            aria-label="Следующая диаграмма масла"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Floating bottom guidance badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none px-4 py-2 rounded-full bg-stone-900/90 border border-stone-700/60 text-[11px] text-stone-200 backdrop-blur-md shadow-2xl flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Колёсико мыши: зум · Перетаскивание для перемещения{hasMultiple ? ' · Стрелки ← / →' : ''}</span>
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
