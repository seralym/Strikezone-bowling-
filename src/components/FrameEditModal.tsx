import React, { useState, useEffect } from 'react';
import { Frame, Roll } from '../types/bowling';
import { X, Check, Edit3, AlertCircle } from 'lucide-react';

interface FrameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  frame: Frame | null;
  frameIndex: number;
  playerName: string;
  onSaveFrame: (frameIndex: number, newRolls: Roll[]) => void;
}

export const FrameEditModal: React.FC<FrameEditModalProps> = ({
  isOpen,
  onClose,
  frame,
  frameIndex,
  playerName,
  onSaveFrame,
}) => {
  const isTenth = frameIndex === 9;

  const [roll1Pins, setRoll1Pins] = useState<number>(0);
  const [roll2Pins, setRoll2Pins] = useState<number | null>(null);
  const [roll3Pins, setRoll3Pins] = useState<number | null>(null);
  const [isFoul1, setIsFoul1] = useState(false);
  const [isFoul2, setIsFoul2] = useState(false);
  const [isFoul3, setIsFoul3] = useState(false);

  useEffect(() => {
    if (frame) {
      const r1 = frame.rolls[0];
      const r2 = frame.rolls[1];
      const r3 = frame.rolls[2];

      setRoll1Pins(r1 ? r1.pinsKnocked : 0);
      setIsFoul1(r1?.isFoul || false);

      setRoll2Pins(r2 !== undefined ? r2.pinsKnocked : null);
      setIsFoul2(r2?.isFoul || false);

      setRoll3Pins(r3 !== undefined ? r3.pinsKnocked : null);
      setIsFoul3(r3?.isFoul || false);
    }
  }, [frame]);

  if (!isOpen || !frame) return null;

  const handleSave = () => {
    const newRolls: Roll[] = [];

    // Roll 1
    const r1Display = isFoul1 ? 'F' : roll1Pins === 10 ? 'X' : roll1Pins === 0 ? '-' : String(roll1Pins);
    newRolls.push({
      pinsKnocked: isFoul1 ? 0 : roll1Pins,
      pinsHit: [],
      standingAfter: [],
      isFoul: isFoul1,
      displayValue: r1Display,
      timestamp: frame.rolls[0]?.timestamp || Date.now(),
    });

    if (!isTenth) {
      // Normal frames 1-9: if roll 1 is not a strike, roll 2 can exist
      if (roll1Pins < 10 || isFoul1) {
        if (roll2Pins !== null) {
          const isSp = !isFoul2 && roll1Pins + roll2Pins === 10;
          const r2Display = isFoul2 ? 'F' : isSp ? '/' : roll2Pins === 0 ? '-' : String(roll2Pins);
          newRolls.push({
            pinsKnocked: isFoul2 ? 0 : roll2Pins,
            pinsHit: [],
            standingAfter: [],
            isFoul: isFoul2,
            displayValue: r2Display,
            timestamp: frame.rolls[1]?.timestamp || Date.now(),
          });
        }
      }
    } else {
      // 10th frame
      if (roll2Pins !== null) {
        const isR2Strike = roll2Pins === 10 && (roll1Pins === 10 || isFoul1);
        const isR2Spare = !isFoul2 && roll1Pins < 10 && !isFoul1 && roll1Pins + roll2Pins === 10;
        const r2Display = isFoul2
          ? 'F'
          : isR2Strike
          ? 'X'
          : isR2Spare
          ? '/'
          : roll2Pins === 0
          ? '-'
          : String(roll2Pins);

        newRolls.push({
          pinsKnocked: isFoul2 ? 0 : roll2Pins,
          pinsHit: [],
          standingAfter: [],
          isFoul: isFoul2,
          displayValue: r2Display,
          timestamp: frame.rolls[1]?.timestamp || Date.now(),
        });

        // 10th frame 3rd roll
        if (roll3Pins !== null && (roll1Pins === 10 || isR2Spare || isR2Strike)) {
          const isR3Strike = roll3Pins === 10;
          const isR3Spare = !isFoul3 && isR2Strike && roll2Pins + roll3Pins === 10;
          const r3Display = isFoul3
            ? 'F'
            : isR3Strike
            ? 'X'
            : isR3Spare
            ? '/'
            : roll3Pins === 0
            ? '-'
            : String(roll3Pins);

          newRolls.push({
            pinsKnocked: isFoul3 ? 0 : roll3Pins,
            pinsHit: [],
            standingAfter: [],
            isFoul: isFoul3,
            displayValue: r3Display,
            timestamp: frame.rolls[2]?.timestamp || Date.now(),
          });
        }
      }
    }

    onSaveFrame(frameIndex, newRolls);
    onClose();
  };

  const maxRoll2 = !isTenth && roll1Pins < 10 ? 10 - roll1Pins : 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-100 font-display">
                Редактирование фрейма {frameIndex + 1}
              </h3>
              <p className="text-xs text-stone-400">
                Игрок: <span className="text-amber-400 font-semibold">{playerName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Roll 1 */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wide">
                Первый бросок (Roll 1)
              </span>
              <label className="flex items-center gap-1.5 text-xs text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFoul1}
                  onChange={(e) => setIsFoul1(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0"
                />
                <span>Заступ (Foul)</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={`r1-${num}`}
                  type="button"
                  onClick={() => {
                    setRoll1Pins(num);
                    if (num === 10 && !isTenth) {
                      setRoll2Pins(null);
                    } else if (roll2Pins !== null && !isTenth && roll2Pins > 10 - num) {
                      setRoll2Pins(10 - num);
                    }
                  }}
                  className={`w-9 h-9 rounded-lg font-mono text-sm font-bold transition-all cursor-pointer ${
                    roll1Pins === num
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {num === 10 ? 'X' : num === 0 ? '-' : num}
                </button>
              ))}
            </div>
          </div>

          {/* Roll 2 */}
          {(isTenth || roll1Pins < 10 || isFoul1) && (
            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300 uppercase tracking-wide">
                  Второй бросок (Roll 2)
                </span>
                <label className="flex items-center gap-1.5 text-xs text-stone-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFoul2}
                    onChange={(e) => setIsFoul2(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0"
                  />
                  <span>Заступ (Foul)</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setRoll2Pins(null)}
                  className={`px-2.5 h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    roll2Pins === null
                      ? 'bg-stone-700 text-stone-100 ring-1 ring-stone-500'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  Не сыгран
                </button>
                {Array.from({ length: maxRoll2 + 1 }, (_, idx) => idx).map((num) => {
                  const isSpare = !isTenth && roll1Pins + num === 10;
                  const isStrike = isTenth && num === 10;
                  return (
                    <button
                      key={`r2-${num}`}
                      type="button"
                      onClick={() => setRoll2Pins(num)}
                      className={`w-9 h-9 rounded-lg font-mono text-sm font-bold transition-all cursor-pointer ${
                        roll2Pins === num
                          ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/30'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {isSpare ? '/' : isStrike ? 'X' : num === 0 ? '-' : num}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Roll 3 for 10th frame */}
          {isTenth && (roll1Pins === 10 || (roll2Pins !== null && roll1Pins + roll2Pins >= 10)) && (
            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300 uppercase tracking-wide">
                  Третий бросок (Roll 3 - 10 фрейм)
                </span>
                <label className="flex items-center gap-1.5 text-xs text-stone-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFoul3}
                    onChange={(e) => setIsFoul3(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0"
                  />
                  <span>Заступ (Foul)</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setRoll3Pins(null)}
                  className={`px-2.5 h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    roll3Pins === null
                      ? 'bg-stone-700 text-stone-100 ring-1 ring-stone-500'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  Не сыгран
                </button>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={`r3-${num}`}
                    type="button"
                    onClick={() => setRoll3Pins(num)}
                    className={`w-9 h-9 rounded-lg font-mono text-sm font-bold transition-all cursor-pointer ${
                      roll3Pins === num
                        ? 'bg-cyan-500 text-stone-950 shadow-md shadow-cyan-500/30'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {num === 10 ? 'X' : num === 0 ? '-' : num}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-950/50 border border-stone-800/80 text-xs text-stone-400">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Сумма партии, спэары, страйки и бонусы автоматически пересчитаются по официальным правилам боулинга.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Применить изменения</span>
          </button>
        </div>
      </div>
    </div>
  );
};
