import React from 'react';
import { PlayerGame, Frame, Roll } from '../types/bowling';
import { isFrameComplete } from '../utils/bowlingEngine';
import { CircleDot, Droplets, Building2 } from 'lucide-react';

interface ScoreBoardProps {
  players: PlayerGame[];
  activePlayerIndex?: number;
  onSelectPlayer?: (index: number) => void;
  compact?: boolean;
  matchInfo?: {
    centerName?: string;
    oilPatternName?: string;
    ballName?: string;
    laneNumber?: number;
    competitionName?: string;
  };
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  activePlayerIndex = 0,
  onSelectPlayer,
  compact = false,
  matchInfo,
}) => {
  return (
    <div className="w-full max-w-full min-w-0 space-y-3">
      {players.map((player, pIdx) => {
        const isActive = pIdx === activePlayerIndex;

        // Current active frame for this player
        const activeFrameIdx = player.frames.findIndex((f) => !isFrameComplete(f));
        const effectiveFrameIdx = activeFrameIdx === -1 ? 9 : activeFrameIdx;

        return (
          <div
            key={player.id}
            onClick={() => onSelectPlayer && onSelectPlayer(pIdx)}
            className={`w-full max-w-full min-w-0 rounded-2xl border transition-all overflow-hidden ${
              isActive
                ? 'bg-stone-900/90 border-amber-500/40 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20'
                : 'bg-stone-900/40 border-stone-800 hover:border-stone-700 opacity-80 hover:opacity-100 cursor-pointer'
            }`}
          >
            {/* Player info strip */}
            {!compact ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-stone-950/70 border-b border-stone-800/80">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                      isActive
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 shadow'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {player.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-100 text-sm sm:text-base">
                        {player.playerName}
                      </span>
                      {isActive && (
                        <span className="text-[11px] font-medium text-amber-400">
                          {player.isFinished ? 'Матч завершён' : 'На дорожке'}
                        </span>
                      )}
                    </div>

                    {/* Conditions & equipment tags */}
                    {matchInfo && (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mt-1">
                        {matchInfo.centerName && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Building2 className="w-3 h-3" />
                            <span>{matchInfo.centerName}</span>
                          </span>
                        )}
                        {matchInfo.oilPatternName && (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Droplets className="w-3 h-3" />
                            <span>{matchInfo.oilPatternName}</span>
                          </span>
                        )}
                        {matchInfo.ballName && (
                          <span className="flex items-center gap-1 text-amber-300">
                            <CircleDot className="w-3 h-3" />
                            <span>{matchInfo.ballName}</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                      <span>Страйки: {player.strikesCount}</span>
                      <span className="text-stone-600">·</span>
                      <span>Спэары: {player.sparesCount}</span>
                      {player.splitsCount > 0 && (
                        <>
                          <span className="text-stone-600">·</span>
                          <span className="text-red-400">Сплиты: {player.splitsCount}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total & Max Potential */}
                <div className="text-left sm:text-right">
                  <div className="flex items-baseline gap-1.5 sm:justify-end">
                    <span className="text-xs uppercase text-stone-400 font-medium">Счёт:</span>
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
                      {player.totalScore}
                    </span>
                  </div>
                  {!player.isFinished && (
                    <div className="text-[11px] text-stone-400">
                      Максимум:{' '}
                      <span className="font-mono font-semibold text-stone-300">
                        {player.maxPossibleScore}
                      </span>
                    </div>
                  )}
                  {player.isFinished && (
                    <div className="text-[11px] text-emerald-400 font-medium">
                      Игра завершена
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Compact Minimal Scoreboard Bar */
              <div className="flex items-center justify-between px-3.5 py-2 bg-stone-950/80 border-b border-stone-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-400 font-display text-sm">
                    {player.isFinished ? 'Матч завершён' : `Фрейм ${effectiveFrameIdx + 1}`}
                  </span>
                  <div className="flex items-center gap-2 text-stone-400">
                    <span className="text-amber-400/90 font-mono font-semibold">
                      {player.strikesCount} X
                    </span>
                    <span>·</span>
                    <span className="text-emerald-400/90 font-mono font-semibold">
                      {player.sparesCount} /
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!player.isFinished && (
                    <span className="text-stone-400 text-[11px]">
                      Макс:{' '}
                      <strong className="font-mono text-stone-200">
                        {player.maxPossibleScore}
                      </strong>
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] uppercase text-stone-400">Счёт:</span>
                    <span className="text-xl font-black font-mono text-amber-400 tabular-nums">
                      {player.totalScore}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Traditional Bowling Grid (10 Frames) */}
            <div className="w-full max-w-full overflow-x-auto scrollbar-thin overscroll-x-contain touch-pan-x">
              <div className="min-w-[680px] grid grid-cols-10 divide-x divide-stone-800 border-t border-stone-800/40">
                {player.frames.map((frame, fIdx) => {
                  const isCurrentThrowFrame = isActive && fIdx === effectiveFrameIdx && !player.isFinished;
                  const isTenthFrame = fIdx === 9;

                  return (
                    <div
                      key={frame.frameNumber}
                      className={`relative flex flex-col justify-between ${
                        isCurrentThrowFrame
                          ? 'bg-amber-500/10 ring-1 ring-inset ring-amber-500/60'
                          : fIdx % 2 === 0
                          ? 'bg-stone-900/30'
                          : 'bg-stone-900/10'
                      }`}
                    >
                      {/* Frame Header Number */}
                      <div className="px-1.5 py-1 text-center border-b border-stone-800 text-[11px] font-semibold text-stone-400">
                        {frame.frameNumber}
                      </div>

                      {/* Roll boxes */}
                      {isTenthFrame ? (
                        <div className="grid grid-cols-3 divide-x divide-stone-800 h-9 border-b border-stone-800/80">
                          <RollBox roll={frame.rolls[0]} isSplit={frame.isSplit} />
                          <RollBox roll={frame.rolls[1]} />
                          <RollBox roll={frame.rolls[2]} />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 divide-x divide-stone-800 h-9 border-b border-stone-800/80">
                          <RollBox roll={frame.rolls[0]} isSplit={frame.isSplit} />
                          <RollBox roll={frame.rolls[1]} />
                        </div>
                      )}

                      {/* Cumulative Score Box */}
                      <div className="h-10 flex items-center justify-center font-mono text-base font-bold text-stone-200 tabular-nums">
                        {frame.score !== null ? frame.score : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface RollBoxProps {
  roll?: Roll;
  isSplit?: boolean;
}

const RollBox: React.FC<RollBoxProps> = ({ roll, isSplit }) => {
  if (!roll) {
    return <div className="h-full flex items-center justify-center" />;
  }

  const val = roll.displayValue;
  const isStrike = val === 'X';
  const isSpare = val === '/';
  const isFoul = val === 'F';
  const isGutter = val === '-';

  return (
    <div className="h-full flex items-center justify-center text-xs font-bold font-mono">
      {isSplit && !isStrike ? (
        // Red circle for split roll
        <span className="w-5 h-5 rounded-full border border-red-500 bg-red-950/60 text-red-300 flex items-center justify-center text-[11px]">
          {val}
        </span>
      ) : isStrike ? (
        <span className="text-amber-400 font-extrabold text-sm">{val}</span>
      ) : isSpare ? (
        <span className="text-emerald-400 font-extrabold text-sm">{val}</span>
      ) : isFoul ? (
        <span className="text-red-400">{val}</span>
      ) : isGutter ? (
        <span className="text-stone-500">{val}</span>
      ) : (
        <span className="text-stone-300">{val}</span>
      )}
    </div>
  );
};
