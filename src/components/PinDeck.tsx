import React, { useRef, useCallback, useEffect } from 'react';
import { PinNumber } from '../types/bowling';
import { Hand, Check } from 'lucide-react';

interface PinDeckProps {
  standingBefore: PinNumber[];
  selectedToKnock: PinNumber[];
  onTogglePin: (pin: PinNumber) => void;
  onKnockAll: () => void;
  onKnockNone: () => void;
  onConfirmRoll?: () => void;
  isSplit: boolean;
  splitName?: string;
  disabled?: boolean;
}

export const PinDeck: React.FC<PinDeckProps> = ({
  standingBefore,
  selectedToKnock,
  onTogglePin,
  onKnockAll,
  onKnockNone,
  onConfirmRoll,
  isSplit,
  splitName,
  disabled = false,
}) => {
  // Pin layout rows in standard bowling:
  // Row 4 (back row): 7, 8, 9, 10
  // Row 3: 4, 5, 6
  // Row 2: 2, 3
  // Row 1 (head pin): 1
  const pinRows: PinNumber[][] = [
    [7, 8, 9, 10],
    [4, 5, 6],
    [2, 3],
    [1],
  ];

  const knockedCount = selectedToKnock.length;
  const totalStanding = standingBefore.length;

  // Swipe gesture tracking refs
  const isSwipingRef = useRef(false);
  const swipedPinsInCurrentGestureRef = useRef<Set<number>>(new Set());
  const pyramidContainerRef = useRef<HTMLDivElement>(null);
  const lastPinToggleTimeRef = useRef<{ [pin: number]: number }>({});

  // Debounced pin toggle to eliminate ghost un-toggling from mobile synthetic click events
  const safeTogglePin = useCallback(
    (pinVal: PinNumber) => {
      if (disabled || !standingBefore.includes(pinVal)) return;

      const now = Date.now();
      const last = lastPinToggleTimeRef.current[pinVal] || 0;
      if (now - last < 320) {
        return; // Suppress duplicate toggle from subsequent synthesized click
      }
      lastPinToggleTimeRef.current[pinVal] = now;

      onTogglePin(pinVal);

      // Tactile vibration feedback on touch devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(12);
        } catch {
          // Ignore vibration restrictions
        }
      }
    },
    [disabled, standingBefore, onTogglePin]
  );

  // Proximity finder: finds the nearest standing pin to a touch/click point within a generous radius
  const findNearestStandingPin = useCallback(
    (clientX: number, clientY: number, maxRadius = 60): PinNumber | null => {
      // 1. Direct hit on pin button element via elementFromPoint
      const element = document.elementFromPoint(clientX, clientY);
      const directButton = element?.closest('[data-pin-number]');
      if (directButton) {
        const val = Number(directButton.getAttribute('data-pin-number')) as PinNumber;
        if (standingBefore.includes(val)) {
          return val;
        }
      }

      // 2. High-precision proximity search across standing pins
      let bestPin: PinNumber | null = null;
      let minDistance = maxRadius;

      for (const pin of standingBefore) {
        const el = document.querySelector(`[data-pin-number="${pin}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dist = Math.hypot(clientX - centerX, clientY - centerY);
          if (dist < minDistance) {
            minDistance = dist;
            bestPin = pin;
          }
        }
      }
      return bestPin;
    },
    [standingBefore]
  );

  // Check if coordinates fall strictly inside the pin pyramid plus one pin width margin from its edges.
  // All interactions outside this expanded zone are ignored by pin touch logic and interpreted as page scrolling.
  const isPointInPyramidZone = useCallback((clientX: number, clientY: number): boolean => {
    // 1. Calculate the bounding envelope of all 10 pins
    const pinElements = document.querySelectorAll<HTMLElement>('[data-pin-number]');
    if (pinElements.length > 0) {
      let minLeft = Infinity;
      let maxRight = -Infinity;
      let minTop = Infinity;
      let maxBottom = -Infinity;
      let totalWidth = 0;
      let count = 0;

      pinElements.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          if (r.left < minLeft) minLeft = r.left;
          if (r.right > maxRight) maxRight = r.right;
          if (r.top < minTop) minTop = r.top;
          if (r.bottom > maxBottom) maxBottom = r.bottom;
          totalWidth += r.width;
          count++;
        }
      });

      if (count > 0) {
        const avgPinWidth = totalWidth / count;
        // Bounded strictly by pyramid edges + 1 pin width margin
        const zoneLeft = minLeft - avgPinWidth;
        const zoneRight = maxRight + avgPinWidth;
        const zoneTop = minTop - avgPinWidth;
        const zoneBottom = maxBottom + avgPinWidth;

        return (
          clientX >= zoneLeft &&
          clientX <= zoneRight &&
          clientY >= zoneTop &&
          clientY <= zoneBottom
        );
      }
    }

    // 2. Safe fallback to container rect with 36px (1 pin width) margin
    const container = pyramidContainerRef.current?.getBoundingClientRect();
    if (!container) return false;
    const pinWidth = 36;
    return (
      clientX >= container.left - pinWidth &&
      clientX <= container.right + pinWidth &&
      clientY >= container.top - pinWidth &&
      clientY <= container.bottom + pinWidth
    );
  }, []);

  // Helper to process a touch / pointer coordinate and toggle the underlying or nearest standing pin
  const handlePointIntersection = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return;
      if (!isPointInPyramidZone(clientX, clientY)) return;

      const pinVal = findNearestStandingPin(clientX, clientY, 55);
      if (!pinVal) return;

      // Only toggle if standing and not already handled in this single continuous gesture
      if (standingBefore.includes(pinVal) && !swipedPinsInCurrentGestureRef.current.has(pinVal)) {
        swipedPinsInCurrentGestureRef.current.add(pinVal);
        safeTogglePin(pinVal);
      }
    },
    [disabled, isPointInPyramidZone, findNearestStandingPin, standingBefore, safeTogglePin]
  );

  // Native non-passive touch listeners attached directly to the pyramid element
  // Blocks scroll ONLY when interacting inside the pyramid + 1 pin width zone
  useEffect(() => {
    const el = pyramidContainerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (disabled || e.touches.length === 0) return;
      const touch = e.touches[0];
      if (!isPointInPyramidZone(touch.clientX, touch.clientY)) {
        // Outside the expanded pyramid zone: do NOT prevent default, leave to browser page scroll
        isSwipingRef.current = false;
        return;
      }
      isSwipingRef.current = true;
      swipedPinsInCurrentGestureRef.current.clear();
      handlePointIntersection(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isSwipingRef.current || disabled || e.touches.length === 0) return;
      const touch = e.touches[0];
      if (!isPointInPyramidZone(touch.clientX, touch.clientY)) {
        // Drifted outside the pyramid + 1 pin width zone: stop pin gesture
        isSwipingRef.current = false;
        return;
      }
      if (e.cancelable) {
        e.preventDefault(); // Block page scroll strictly inside the pyramid + 1 pin width margin!
      }
      handlePointIntersection(touch.clientX, touch.clientY);
    };

    const onTouchEnd = () => {
      isSwipingRef.current = false;
      swipedPinsInCurrentGestureRef.current.clear();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [disabled, isPointInPyramidZone, handlePointIntersection]);

  // Pointer drag handlers (desktop mouse drag or stylus)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || e.pointerType === 'touch') return; // Handled by TouchEvent for mobile
    if (!isPointInPyramidZone(e.clientX, e.clientY)) return;
    isSwipingRef.current = true;
    swipedPinsInCurrentGestureRef.current.clear();
    handlePointIntersection(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSwipingRef.current || disabled || e.pointerType === 'touch') return;
    if (!isPointInPyramidZone(e.clientX, e.clientY)) {
      isSwipingRef.current = false;
      return;
    }
    if (e.buttons === 1) {
      handlePointIntersection(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    isSwipingRef.current = false;
    swipedPinsInCurrentGestureRef.current.clear();
  };

  return (
    <div
      className="relative w-full max-w-xl sm:max-w-2xl mx-auto rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-stone-800 p-3.5 sm:p-6 shadow-2xl overflow-hidden select-none touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Subtle wood lane board background overlay */}
      <div className="absolute inset-0 bg-lane-wood opacity-40 pointer-events-none" />

      {/* Decorative foul line indicator at top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600/30 via-red-500 to-red-600/30" />

      {/* Split alert bar (when applicable) */}
      {isSplit && (
        <div className="relative mb-3 flex items-center justify-between pb-2 border-b border-stone-800/80">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold animate-pulse">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />
            <span>{splitName || 'Сплит! Сложная комбинация кеглей'}</span>
          </div>
        </div>
      )}

      {/* Swipe touch indicator badge with scroll available hint */}
      <div className="relative flex items-center justify-center gap-1.5 mb-2 text-[11px] text-stone-400 font-medium">
        <Hand className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Выбор кеглей в зоне пирамиды (отступ 1 кегля) · Скролл страницы активен вокруг</span>
      </div>

      {/* Outer wrapper: full width with pan-y touch-action so all outer zones scroll the page */}
      <div
        className="relative flex flex-col items-center justify-center py-1 sm:py-2 select-none w-full touch-pan-y"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Pin Pyramid Interactive Zone: bounded strictly to pyramid with 1 pin width padding */}
        <div
          ref={pyramidContainerRef}
          className="pin-deck-pyramid-zone relative inline-flex flex-col items-center justify-center p-3.5 sm:p-4 select-none touch-none mx-auto"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {pinRows.map((row, rowIdx) => {
            // Large spacing intervals tailored to each row
            const gapClass =
              rowIdx === 0
                ? 'gap-7 xs:gap-9 sm:gap-13 md:gap-16'
                : rowIdx === 1
                ? 'gap-8 xs:gap-11 sm:gap-14 md:gap-18'
                : rowIdx === 2
                ? 'gap-9 xs:gap-12 sm:gap-16 md:gap-20'
                : 'gap-0';

            return (
              <div
                key={rowIdx}
                className={`flex items-center justify-center ${gapClass} my-2 xs:my-3 sm:my-4 select-none`}
              >
              {row.map((pin) => {
                const isStandingBefore = standingBefore.includes(pin);
                const isKnockedNow = selectedToKnock.includes(pin);

                // State logic:
                // - Standing & selected to knock: highlighted with down animation
                // - Standing & not selected: ultra-high contrast glossy white slender pin
                // - Already knocked: faint / greyed out
                return (
                  <button
                    key={pin}
                    type="button"
                    data-pin-number={pin}
                    disabled={!isStandingBefore || disabled}
                    onClick={(e) => {
                      e.preventDefault();
                      safeTogglePin(pin);
                    }}
                    style={{ touchAction: 'none' }}
                    className={`group relative flex flex-col items-center justify-center p-2 sm:p-2.5 -m-1 sm:-m-1.5 transition-all duration-200 focus:outline-none select-none ${
                      !isStandingBefore
                        ? 'opacity-20 cursor-not-allowed scale-90'
                        : disabled
                        ? 'cursor-not-allowed'
                        : 'cursor-pointer hover:scale-105 active:scale-95'
                    }`}
                    aria-label={`Кегля номер ${pin}`}
                  >
                    {/* Slender Narrow Bowling Pin Graphic */}
                    <div
                      className={`relative w-8 h-16 xs:w-9 xs:h-18 sm:w-10 sm:h-21 rounded-t-full rounded-b-xl flex flex-col items-center justify-between py-1 px-0.5 transition-all ${
                        !isStandingBefore
                          ? 'bg-stone-900 border border-stone-800 text-stone-600 shadow-none'
                          : isKnockedNow
                          ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-200 text-stone-950 shadow-xl shadow-amber-500/50 ring-2 ring-amber-400/80 scale-95 translate-y-1'
                          : 'bg-white border-2 border-stone-100 text-stone-950 shadow-2xl shadow-black/70 ring-1 ring-stone-900/60 hover:border-amber-400 hover:ring-amber-500/40'
                      }`}
                    >
                      {/* Slender rounded head */}
                      <div
                        className={`w-3.5 h-2 rounded-full transition-colors ${
                          isKnockedNow
                            ? 'bg-amber-200'
                            : isStandingBefore
                            ? 'bg-stone-200'
                            : 'bg-stone-800'
                        }`}
                      />

                      {/* Iconic dual red neck stripes for standing pins */}
                      {isStandingBefore && !isKnockedNow && (
                        <div className="w-full flex flex-col items-center gap-0.5 my-0.5 px-0.5">
                          <div className="w-full h-0.5 bg-red-600 rounded-full" />
                          <div className="w-full h-0.5 bg-red-600 rounded-full" />
                        </div>
                      )}

                      {/* Pin Number - Clear font, centered on belly */}
                      <span
                        className={`text-xs xs:text-sm sm:text-base font-black font-mono tracking-tight leading-none ${
                          isKnockedNow
                            ? 'text-stone-950'
                            : isStandingBefore
                            ? 'text-stone-950'
                            : 'text-stone-600'
                        }`}
                      >
                        {pin}
                      </span>

                      {/* Narrow base anchor */}
                      <div
                        className={`w-4 sm:w-5 h-1 rounded-full ${
                          isKnockedNow
                            ? 'bg-amber-700/60'
                            : isStandingBefore
                            ? 'bg-stone-300'
                            : 'bg-stone-950'
                        }`}
                      />
                    </div>

                    {/* Knocked down badge */}
                    {isKnockedNow && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-300 text-stone-950 rounded-full flex items-center justify-center text-[10px] font-black shadow-md border border-stone-900">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
        </div>
      </div>

      {/* Quick Select Deck Controls */}
      <div className="relative mt-3 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span>Сбито сейчас:</span>
          <span className="font-mono text-amber-400 font-bold text-sm">
            {knockedCount}
          </span>
          <span className="text-stone-600">/</span>
          <span>Останется:</span>
          <span className="font-mono text-stone-300 font-semibold text-sm">
            {totalStanding - knockedCount}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={disabled || knockedCount === 0}
            onClick={(e) => {
              e.preventDefault();
              onKnockNone();
            }}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Сбросить (0)
          </button>
          <button
            type="button"
            disabled={disabled || totalStanding === 0 || knockedCount === totalStanding}
            onClick={(e) => {
              e.preventDefault();
              onKnockAll();
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
          >
            {totalStanding === 10 ? 'Все 10 (Страйк)' : `Все (${totalStanding})`}
          </button>
          {onConfirmRoll && (
            <button
              type="button"
              disabled={disabled || knockedCount === 0}
              onClick={(e) => {
                e.preventDefault();
                onConfirmRoll();
              }}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title="Зафиксировать бросок с выбранными кеглями"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Зафиксировать бросок{knockedCount > 0 ? ` (${knockedCount})` : ''}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
