import { PinNumber, Roll, Frame, PlayerGame, MatchRecord, BowlerProfileStats } from '../types/bowling';

export const ALL_PINS: PinNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Check if the standing pins configuration qualifies as a split.
 * Definition:
 * 1. Pin 1 (Headpin) is NOT standing (is knocked down).
 * 2. At least two pins are standing.
 * 3. At least one intermediate column/pin between standing pins is knocked down.
 */
export function checkIsSplit(standingPins: PinNumber[]): { isSplit: boolean; name?: string } {
  if (standingPins.includes(1)) {
    return { isSplit: false };
  }
  if (standingPins.length < 2 || standingPins.length > 7) {
    return { isSplit: false };
  }

  const set = new Set(standingPins);

  // Notable known splits
  if (set.has(7) && set.has(10) && standingPins.length === 2) {
    return { isSplit: true, name: '7-10 ("Snake Eyes")' };
  }
  if (set.has(4) && set.has(6) && set.has(7) && set.has(10) && standingPins.length === 4) {
    return { isSplit: true, name: '4-6-7-10 ("Big Four")' };
  }
  if (set.has(7) && set.has(9) && standingPins.length === 2) {
    return { isSplit: true, name: '7-9 Сплит' };
  }
  if (set.has(8) && set.has(10) && standingPins.length === 2) {
    return { isSplit: true, name: '8-10 Сплит' };
  }
  if (set.has(5) && set.has(7) && standingPins.length === 2) {
    return { isSplit: true, name: '5-7 Сплит' };
  }
  if (set.has(5) && set.has(10) && standingPins.length === 2) {
    return { isSplit: true, name: '5-10 Сплит' };
  }
  if (set.has(2) && set.has(7) && standingPins.length === 2) {
    return { isSplit: true, name: '2-7 ("Baby Split")' };
  }
  if (set.has(3) && set.has(10) && standingPins.length === 2) {
    return { isSplit: true, name: '3-10 ("Baby Split")' };
  }
  if (set.has(4) && set.has(9) && standingPins.length === 2) {
    return { isSplit: true, name: '4-9 Сплит' };
  }
  if (set.has(6) && set.has(8) && standingPins.length === 2) {
    return { isSplit: true, name: '6-8 Сплит' };
  }
  if (set.has(2) && set.has(4) && set.has(8) && set.has(10)) {
    return { isSplit: true, name: '2-4-8-10 Сплит' };
  }
  if (set.has(3) && set.has(6) && set.has(7) && set.has(9)) {
    return { isSplit: true, name: '3-6-7-9 Сплит' };
  }

  // Geometric column-based split check (pins mapped to lateral columns: 0 to 6)
  // Pin columns: 7 (col 0), 4 (col 1), 2/8 (col 2), 1/5 (col 3), 3/9 (col 4), 6 (col 5), 10 (col 6)
  const pinCols: Record<PinNumber, number> = {
    7: 0,
    4: 1,
    2: 2,
    8: 2,
    1: 3,
    5: 3,
    3: 4,
    9: 4,
    6: 5,
    10: 6,
  };

  const occupiedCols = new Set<number>();
  standingPins.forEach((p) => occupiedCols.add(pinCols[p]));

  const sortedCols = Array.from(occupiedCols).sort((a, b) => a - b);
  // If there is an empty column between two occupied columns
  for (let i = 0; i < sortedCols.length - 1; i++) {
    if (sortedCols[i + 1] - sortedCols[i] > 1) {
      return { isSplit: true, name: `Сплит (${standingPins.join('-')})` };
    }
  }

  return { isSplit: false };
}

/**
 * Create a fresh, empty 10-frame game for a player
 */
export function createEmptyPlayerGame(playerName: string, id?: string): PlayerGame {
  const frames: Frame[] = Array.from({ length: 10 }, (_, i) => ({
    frameNumber: i + 1,
    rolls: [],
    score: null,
    isStrike: false,
    isSpare: false,
    isOpen: false,
    isSplit: false,
  }));

  return {
    id: id || 'player_' + Math.random().toString(36).substring(2, 9),
    playerName: playerName.trim() || 'Игрок 1',
    frames,
    totalScore: 0,
    maxPossibleScore: 300,
    strikesCount: 0,
    sparesCount: 0,
    openFramesCount: 0,
    splitsCount: 0,
    splitsConvertedCount: 0,
    isFinished: false,
  };
}

/**
 * Determine what pins are standing before the next roll in the active frame
 */
export function getStandingPinsForNextRoll(frame: Frame): PinNumber[] {
  const frameIdx = frame.frameNumber - 1;

  if (frameIdx < 9) {
    // Frames 1 to 9
    if (frame.rolls.length === 0) {
      return [...ALL_PINS];
    }
    // After roll 1 (if not strike)
    const roll1 = frame.rolls[0];
    return [...roll1.standingAfter];
  } else {
    // Frame 10
    if (frame.rolls.length === 0) {
      return [...ALL_PINS];
    }
    if (frame.rolls.length === 1) {
      const roll1 = frame.rolls[0];
      if (roll1.pinsKnocked === 10) {
        // Strike on roll 1: reset full rack for roll 2
        return [...ALL_PINS];
      }
      return [...roll1.standingAfter];
    }
    if (frame.rolls.length === 2) {
      const roll1 = frame.rolls[0];
      const roll2 = frame.rolls[1];
      // If roll 1 was strike and roll 2 was strike: fresh rack
      if (roll1.pinsKnocked === 10 && roll2.pinsKnocked === 10) {
        return [...ALL_PINS];
      }
      // If spare on roll 2: fresh rack for roll 3
      if (roll1.pinsKnocked !== 10 && roll1.pinsKnocked + roll2.pinsKnocked === 10) {
        return [...ALL_PINS];
      }
      // If roll 1 was strike and roll 2 was not strike: pins left from roll 2
      if (roll1.pinsKnocked === 10 && roll2.pinsKnocked < 10) {
        return [...roll2.standingAfter];
      }
    }
    return [];
  }
}

/**
 * Check if the active frame is finished
 */
export function isFrameComplete(frame: Frame): boolean {
  const frameIdx = frame.frameNumber - 1;
  if (frameIdx < 9) {
    if (frame.rolls.length === 0) return false;
    if (frame.rolls[0].pinsKnocked === 10) return true; // Strike
    return frame.rolls.length >= 2; // 2 rolls done
  } else {
    // 10th frame
    if (frame.rolls.length < 2) return false;
    const roll1 = frame.rolls[0];
    const roll2 = frame.rolls[1];
    const earnedBonus = roll1.pinsKnocked === 10 || roll1.pinsKnocked + roll2.pinsKnocked === 10;
    if (earnedBonus) {
      return frame.rolls.length >= 3;
    }
    return true; // No strike or spare in 10th, game ends on roll 2
  }
}

/**
 * Re-calculate scores for all frames and aggregate game statistics
 */
export function calculateGameScores(game: PlayerGame): PlayerGame {
  const updatedFrames: Frame[] = game.frames.map((f) => ({
    ...f,
    rolls: [...f.rolls],
  }));

  // Flatten all rolls with their frame info to calculate strike/spare bonuses
  const flatRolls: { frameIdx: number; rollIdx: number; pins: number }[] = [];
  updatedFrames.forEach((frame, fIdx) => {
    frame.rolls.forEach((roll, rIdx) => {
      flatRolls.push({
        frameIdx: fIdx,
        rollIdx: rIdx,
        pins: roll.pinsKnocked,
      });
    });
  });

  let runningTotal = 0;
  let strikes = 0;
  let spares = 0;
  let openFrames = 0;
  let splits = 0;
  let splitsConverted = 0;

  for (let fIdx = 0; fIdx < 10; fIdx++) {
    const frame = updatedFrames[fIdx];
    const rolls = frame.rolls;

    frame.isStrike = false;
    frame.isSpare = false;
    frame.isOpen = false;
    frame.score = null;

    if (fIdx < 9) {
      // Frames 1 to 9
      if (rolls.length === 0) {
        continue;
      }

      if (rolls[0].pinsKnocked === 10) {
        frame.isStrike = true;
        strikes++;

        // Find index of this strike in flatRolls
        const strikeFlatIdx = flatRolls.findIndex((r) => r.frameIdx === fIdx && r.rollIdx === 0);
        // Bonus needs next 2 rolls
        if (strikeFlatIdx !== -1 && flatRolls.length >= strikeFlatIdx + 3) {
          const nextRoll1 = flatRolls[strikeFlatIdx + 1].pins;
          const nextRoll2 = flatRolls[strikeFlatIdx + 2].pins;
          runningTotal += 10 + nextRoll1 + nextRoll2;
          frame.score = runningTotal;
        }
      } else if (rolls.length >= 2) {
        const sum = rolls[0].pinsKnocked + rolls[1].pinsKnocked;
        if (sum === 10) {
          frame.isSpare = true;
          spares++;

          // Bonus needs next 1 roll
          const spareFlatIdx = flatRolls.findIndex((r) => r.frameIdx === fIdx && r.rollIdx === 1);
          if (spareFlatIdx !== -1 && flatRolls.length >= spareFlatIdx + 2) {
            const nextRoll = flatRolls[spareFlatIdx + 1].pins;
            runningTotal += 10 + nextRoll;
            frame.score = runningTotal;
          }
        } else {
          frame.isOpen = true;
          openFrames++;
          runningTotal += sum;
          frame.score = runningTotal;
        }
      }

      // Check split on roll 1
      if (rolls.length > 0 && rolls[0].pinsKnocked < 10) {
        const splitCheck = checkIsSplit(rolls[0].standingAfter);
        frame.isSplit = splitCheck.isSplit;
        frame.splitName = splitCheck.name;
        if (splitCheck.isSplit) {
          splits++;
          if (rolls.length >= 2 && rolls[0].pinsKnocked + rolls[1].pinsKnocked === 10) {
            splitsConverted++;
          }
        }
      }
    } else {
      // Frame 10
      if (rolls.length === 0) continue;

      if (rolls[0].pinsKnocked === 10) {
        frame.isStrike = true;
        strikes++;
      } else {
        const splitCheck = checkIsSplit(rolls[0].standingAfter);
        frame.isSplit = splitCheck.isSplit;
        frame.splitName = splitCheck.name;
        if (splitCheck.isSplit) {
          splits++;
        }
      }

      if (rolls.length >= 2) {
        if (rolls[0].pinsKnocked !== 10 && rolls[0].pinsKnocked + rolls[1].pinsKnocked === 10) {
          frame.isSpare = true;
          spares++;
          if (frame.isSplit) {
            splitsConverted++;
          }
        } else if (rolls[0].pinsKnocked !== 10) {
          frame.isOpen = true;
          openFrames++;
        }
        if (rolls[1].pinsKnocked === 10 && rolls[0].pinsKnocked === 10) {
          strikes++;
        }
      }

      if (rolls.length === 3) {
        if (rolls[2].pinsKnocked === 10) {
          strikes++;
        }
      }

      if (isFrameComplete(frame)) {
        const frameTotal = rolls.reduce((acc, r) => acc + r.pinsKnocked, 0);
        runningTotal += frameTotal;
        frame.score = runningTotal;
      }
    }
  }

  // Calculate projected maximum possible score from this state
  const maxPossibleScore = calculateMaxPossibleScore(updatedFrames);

  // Check if entire game is finished
  const isFinished = updatedFrames.every((f) => isFrameComplete(f));

  // Determine current active total score (either final score or last known cumulative + un-scored completed frames estimate)
  const currentTotal = updatedFrames[9].score ?? runningTotal;

  return {
    ...game,
    frames: updatedFrames,
    totalScore: currentTotal,
    maxPossibleScore,
    strikesCount: strikes,
    sparesCount: spares,
    openFramesCount: openFrames,
    splitsCount: splits,
    splitsConvertedCount: splitsConverted,
    isFinished,
  };
}

/**
 * Calculates the maximum possible score achievable assuming strikes on all future rolls
 */
function calculateMaxPossibleScore(frames: Frame[]): number {
  // Clone rolls and simulate strikes for all remaining rolls
  const simulatedFrames: { rolls: number[] }[] = frames.map((f) => ({
    rolls: f.rolls.map((r) => r.pinsKnocked),
  }));

  for (let fIdx = 0; fIdx < 10; fIdx++) {
    const f = simulatedFrames[fIdx];
    if (fIdx < 9) {
      if (f.rolls.length === 0) {
        f.rolls = [10]; // Simulated strike
      } else if (f.rolls.length === 1 && f.rolls[0] < 10) {
        f.rolls.push(10 - f.rolls[0]); // Simulated spare pickup
      }
    } else {
      // 10th frame
      while (f.rolls.length < 3) {
        if (f.rolls.length === 0) {
          f.rolls.push(10);
        } else if (f.rolls.length === 1) {
          f.rolls.push(10);
        } else {
          // 3rd roll
          const earned = f.rolls[0] === 10 || f.rolls[0] + f.rolls[1] >= 10;
          if (earned) {
            f.rolls.push(10);
          } else {
            break;
          }
        }
      }
    }
  }

  // Calculate score on simulated frames
  const flat: number[] = [];
  simulatedFrames.forEach((f) => f.rolls.forEach((p) => flat.push(p)));

  let score = 0;
  let rollIdx = 0;
  for (let f = 0; f < 9; f++) {
    if (flat[rollIdx] === 10) {
      score += 10 + (flat[rollIdx + 1] ?? 0) + (flat[rollIdx + 2] ?? 0);
      rollIdx += 1;
    } else if ((flat[rollIdx] ?? 0) + (flat[rollIdx + 1] ?? 0) === 10) {
      score += 10 + (flat[rollIdx + 2] ?? 0);
      rollIdx += 2;
    } else {
      score += (flat[rollIdx] ?? 0) + (flat[rollIdx + 1] ?? 0);
      rollIdx += 2;
    }
  }

  // 10th frame: sum of remaining rolls
  while (rollIdx < flat.length) {
    score += flat[rollIdx];
    rollIdx++;
  }

  return Math.min(300, score);
}

/**
 * Add a roll to the active player's game
 */
export function recordRoll(
  game: PlayerGame,
  pinsHit: PinNumber[],
  isFoul: boolean = false
): PlayerGame {
  // Find current active frame
  let activeFrameIdx = game.frames.findIndex((f) => !isFrameComplete(f));
  if (activeFrameIdx === -1) {
    return game; // Game already complete
  }

  const frame = game.frames[activeFrameIdx];
  const standingBefore = getStandingPinsForNextRoll(frame);

  // Filter pins hit to only those that were actually standing
  const validPinsHit = isFoul ? [] : pinsHit.filter((p) => standingBefore.includes(p));
  const pinsKnocked = isFoul ? 0 : validPinsHit.length;

  const standingAfter = standingBefore.filter((p) => !validPinsHit.includes(p));

  // Determine display symbol
  let displayValue = pinsKnocked.toString();
  if (isFoul) {
    displayValue = 'F';
  } else if (activeFrameIdx < 9) {
    if (frame.rolls.length === 0 && pinsKnocked === 10) {
      displayValue = 'X';
    } else if (frame.rolls.length === 1) {
      const prev = frame.rolls[0].pinsKnocked;
      if (prev + pinsKnocked === 10) {
        displayValue = '/';
      } else if (pinsKnocked === 0) {
        displayValue = '-';
      }
    } else if (pinsKnocked === 0) {
      displayValue = '-';
    }
  } else {
    // 10th frame symbols
    if (frame.rolls.length === 0) {
      displayValue = pinsKnocked === 10 ? 'X' : pinsKnocked === 0 ? '-' : pinsKnocked.toString();
    } else if (frame.rolls.length === 1) {
      const roll1 = frame.rolls[0].pinsKnocked;
      if (roll1 === 10) {
        displayValue = pinsKnocked === 10 ? 'X' : pinsKnocked === 0 ? '-' : pinsKnocked.toString();
      } else if (roll1 + pinsKnocked === 10) {
        displayValue = '/';
      } else {
        displayValue = pinsKnocked === 0 ? '-' : pinsKnocked.toString();
      }
    } else if (frame.rolls.length === 2) {
      const roll1 = frame.rolls[0].pinsKnocked;
      const roll2 = frame.rolls[1].pinsKnocked;
      if (roll2 === 10 || roll1 + roll2 === 10) {
        displayValue = pinsKnocked === 10 ? 'X' : pinsKnocked === 0 ? '-' : pinsKnocked.toString();
      } else if (roll1 === 10 && roll2 < 10 && roll2 + pinsKnocked === 10) {
        displayValue = '/';
      } else {
        displayValue = pinsKnocked === 0 ? '-' : pinsKnocked.toString();
      }
    }
  }

  const newRoll: Roll = {
    pinsKnocked,
    pinsHit: validPinsHit,
    standingAfter,
    isFoul,
    displayValue,
    timestamp: Date.now(),
  };

  const updatedFrames = game.frames.map((f, idx) => {
    if (idx === activeFrameIdx) {
      return {
        ...f,
        rolls: [...f.rolls, newRoll],
      };
    }
    return f;
  });

  return calculateGameScores({
    ...game,
    frames: updatedFrames,
  });
}

/**
 * Undo the last roll in the game
 */
export function undoLastRoll(game: PlayerGame): PlayerGame {
  // Find the last frame that has at least 1 roll
  let targetFrameIdx = -1;
  for (let i = 9; i >= 0; i--) {
    if (game.frames[i].rolls.length > 0) {
      targetFrameIdx = i;
      break;
    }
  }

  if (targetFrameIdx === -1) {
    return game; // Nothing to undo
  }

  const updatedFrames = game.frames.map((f, idx) => {
    if (idx === targetFrameIdx) {
      return {
        ...f,
        rolls: f.rolls.slice(0, -1),
        score: null,
      };
    }
    return f;
  });

  return calculateGameScores({
    ...game,
    frames: updatedFrames,
    isFinished: false,
  });
}

/**
 * Compute aggregate statistics across an array of saved matches for a bowler
 */
export function computeBowlerStats(
  matches: MatchRecord[],
  targetPlayerName?: string
): BowlerProfileStats {
  const allGames: PlayerGame[] = [];

  matches.forEach((m) => {
    m.players.forEach((p) => {
      if (!targetPlayerName || p.playerName.toLowerCase() === targetPlayerName.toLowerCase()) {
        allGames.push(p);
      }
    });
  });

  const gamesPlayed = allGames.length;
  if (gamesPlayed === 0) {
    return {
      playerName: targetPlayerName || 'Все игроки',
      gamesPlayed: 0,
      averageScore: 0,
      highScore: 0,
      lowScore: 0,
      totalPinfall: 0,
      strikeRate: 0,
      spareRate: 0,
      cleanGameRate: 0,
      openFrameRate: 0,
      splitConversionRate: 0,
      scoreHistory: [],
      frameAverageScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      scoreBuckets: [
        { range: '<100', count: 0, percentage: 0 },
        { range: '100-149', count: 0, percentage: 0 },
        { range: '150-179', count: 0, percentage: 0 },
        { range: '180-219', count: 0, percentage: 0 },
        { range: '220-259', count: 0, percentage: 0 },
        { range: '260-300', count: 0, percentage: 0 },
      ],
      pinLeaveHeatmap: ALL_PINS.map((p) => ({ pin: p, leavesCount: 0, leavePercentage: 0 })),
      commonLeaves: [],
    };
  }

  const totalPinfall = allGames.reduce((acc, g) => acc + g.totalScore, 0);
  const averageScore = Math.round((totalPinfall / gamesPlayed) * 10) / 10;
  const highScore = Math.max(...allGames.map((g) => g.totalScore));
  const lowScore = Math.min(...allGames.map((g) => g.totalScore));

  let totalStrikes = 0;
  let totalSpares = 0;
  let totalCleanGames = 0;
  let totalOpenFrames = 0;
  let totalSplits = 0;
  let totalSplitsConverted = 0;
  let totalFirstRolls = 0;

  const pinLeavesCounter: Record<PinNumber, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
  };

  const frameScoresSum = Array(10).fill(0);
  const frameScoresCount = Array(10).fill(0);

  const leavePatterns: Record<string, { pins: PinNumber[]; name: string; count: number; converted: number }> = {};

  allGames.forEach((g) => {
    totalStrikes += g.strikesCount;
    totalSpares += g.sparesCount;
    totalOpenFrames += g.openFramesCount;
    totalSplits += g.splitsCount;
    totalSplitsConverted += g.splitsConvertedCount;

    if (g.openFramesCount === 0 && g.isFinished) {
      totalCleanGames++;
    }

    g.frames.forEach((f, fIdx) => {
      if (f.score !== null) {
        frameScoresSum[fIdx] += f.score;
        frameScoresCount[fIdx]++;
      }

      // Check pin leaves on first roll
      if (f.rolls.length > 0) {
        const roll1 = f.rolls[0];
        if (roll1.pinsKnocked < 10) {
          totalFirstRolls++;
          roll1.standingAfter.forEach((p) => {
            pinLeavesCounter[p]++;
          });

          // Track specific leave combination
          const sorted = [...roll1.standingAfter].sort((a, b) => a - b);
          const key = sorted.join('-');
          if (!leavePatterns[key]) {
            leavePatterns[key] = {
              pins: sorted,
              name: f.splitName || `Кегли: ${sorted.join(', ')}`,
              count: 0,
              converted: 0,
            };
          }
          leavePatterns[key].count++;
          if (f.isSpare) {
            leavePatterns[key].converted++;
          }
        }
      }
    });
  });

  const totalPossibleFrames = gamesPlayed * 10;
  const strikeRate = totalPossibleFrames > 0 ? Math.round((totalStrikes / (totalPossibleFrames * 1.1)) * 1000) / 10 : 0;
  const spareRate = totalOpenFrames + totalSpares > 0 ? Math.round((totalSpares / (totalOpenFrames + totalSpares)) * 1000) / 10 : 0;
  const cleanGameRate = Math.round((totalCleanGames / gamesPlayed) * 1000) / 10;
  const openFrameRate = totalPossibleFrames > 0 ? Math.round((totalOpenFrames / totalPossibleFrames) * 1000) / 10 : 0;
  const splitConversionRate = totalSplits > 0 ? Math.round((totalSplitsConverted / totalSplits) * 1000) / 10 : 0;

  // Score progression history
  const scoreHistory = matches
    .flatMap((m) =>
      m.players
        .filter((p) => !targetPlayerName || p.playerName.toLowerCase() === targetPlayerName.toLowerCase())
        .map((p) => ({
          date: m.date,
          score: p.totalScore,
          matchId: m.id,
        }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Score distribution buckets
  const buckets = [
    { range: '<100', min: 0, max: 99, count: 0 },
    { range: '100-149', min: 100, max: 149, count: 0 },
    { range: '150-179', min: 150, max: 179, count: 0 },
    { range: '180-219', min: 180, max: 219, count: 0 },
    { range: '220-259', min: 220, max: 259, count: 0 },
    { range: '260-300', min: 260, max: 300, count: 0 },
  ];

  allGames.forEach((g) => {
    const s = g.totalScore;
    const b = buckets.find((bucket) => s >= bucket.min && s <= bucket.max);
    if (b) b.count++;
  });

  const scoreBuckets = buckets.map((b) => ({
    range: b.range,
    count: b.count,
    percentage: Math.round((b.count / gamesPlayed) * 100),
  }));

  const frameAverageScores = frameScoresSum.map((sum, i) => {
    const count = frameScoresCount[i];
    return count > 0 ? Math.round(sum / count) : 0;
  });

  const pinLeaveHeatmap = ALL_PINS.map((pin) => {
    const count = pinLeavesCounter[pin];
    return {
      pin,
      leavesCount: count,
      leavePercentage: totalFirstRolls > 0 ? Math.round((count / totalFirstRolls) * 100) : 0,
    };
  });

  const commonLeaves = Object.values(leavePatterns)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((l) => ({
      pins: l.pins,
      name: l.name,
      count: l.count,
      convertedCount: l.converted,
    }));

  // Compute stats grouped by Ball
  const ballMap: Record<string, { games: number; total: number; high: number }> = {};
  const patternMap: Record<string, { games: number; total: number; high: number }> = {};
  const centerMap: Record<string, { games: number; total: number; high: number }> = {};

  matches.forEach((m) => {
    const game = m.players[0];
    if (!game) return;
    const score = game.totalScore;

    if (m.ballName) {
      if (!ballMap[m.ballName]) ballMap[m.ballName] = { games: 0, total: 0, high: 0 };
      ballMap[m.ballName].games++;
      ballMap[m.ballName].total += score;
      ballMap[m.ballName].high = Math.max(ballMap[m.ballName].high, score);
    }

    if (m.oilPatternName) {
      if (!patternMap[m.oilPatternName]) patternMap[m.oilPatternName] = { games: 0, total: 0, high: 0 };
      patternMap[m.oilPatternName].games++;
      patternMap[m.oilPatternName].total += score;
      patternMap[m.oilPatternName].high = Math.max(patternMap[m.oilPatternName].high, score);
    }

    if (m.centerName) {
      if (!centerMap[m.centerName]) centerMap[m.centerName] = { games: 0, total: 0, high: 0 };
      centerMap[m.centerName].games++;
      centerMap[m.centerName].total += score;
      centerMap[m.centerName].high = Math.max(centerMap[m.centerName].high, score);
    }
  });

  const ballStats = Object.entries(ballMap).map(([ballName, d]) => ({
    ballName,
    games: d.games,
    averageScore: Math.round((d.total / d.games) * 10) / 10,
    highScore: d.high,
  }));

  const patternStats = Object.entries(patternMap).map(([patternName, d]) => ({
    patternName,
    games: d.games,
    averageScore: Math.round((d.total / d.games) * 10) / 10,
    highScore: d.high,
  }));

  const centerStats = Object.entries(centerMap).map(([centerName, d]) => ({
    centerName,
    games: d.games,
    averageScore: Math.round((d.total / d.games) * 10) / 10,
    highScore: d.high,
  }));

  return {
    playerName: targetPlayerName || 'Сергей',
    gamesPlayed,
    averageScore,
    highScore,
    lowScore,
    totalPinfall,
    strikeRate: Math.min(100, strikeRate),
    spareRate: Math.min(100, spareRate),
    cleanGameRate,
    openFrameRate,
    splitConversionRate,
    scoreHistory,
    frameAverageScores,
    scoreBuckets,
    pinLeaveHeatmap,
    commonLeaves,
    ballStats,
    patternStats,
    centerStats,
  };
}

/**
 * Check if a match belongs to a specified tournament (by ID or tournament name)
 */
export function isMatchInTournament(
  match: MatchRecord,
  tourn: { id?: string; name: string }
): boolean {
  if (tourn.id && match.tournamentId && match.tournamentId === tourn.id) {
    return true;
  }
  const tName = (tourn.name || '').trim().toLowerCase();
  if (!tName) return false;

  const matchTourn = (match.tournamentName || '').trim().toLowerCase();
  if (matchTourn && (matchTourn === tName || matchTourn.includes(tName) || tName.includes(matchTourn))) {
    return true;
  }

  const matchComp = (match.competitionName || '').trim().toLowerCase();
  if (matchComp && (matchComp === tName || matchComp.includes(tName) || tName.includes(matchComp))) {
    return true;
  }

  const matchTitle = (match.title || '').trim().toLowerCase();
  if (matchTitle && (matchTitle === tName || matchTitle.includes(tName) || tName.includes(matchTitle))) {
    return true;
  }

  return false;
}

export interface TournamentSummaryStats {
  tournamentId: string;
  tournamentName: string;
  gamesPlayed: number;
  averageScore: number;
  highScore: number;
  lowScore: number;
  totalPinfall: number;
  strikeRate: number;
  spareRate: number;
  cleanGamesCount: number;
  cleanGamesRate: number;
  splitConversionRate: number;
  matches: MatchRecord[];
}

/**
 * Compute aggregate statistics strictly for a specific tournament
 */
export function computeTournamentSummary(
  tourn: { id?: string; name: string },
  matches: MatchRecord[],
  targetPlayerName?: string
): TournamentSummaryStats {
  const tournMatches = matches.filter((m) => isMatchInTournament(m, tourn));
  const stats = computeBowlerStats(tournMatches, targetPlayerName);
  const cleanGames = tournMatches.filter((m) => {
    const p = m.players[0];
    return p && p.isFinished && p.openFramesCount === 0;
  }).length;

  return {
    tournamentId: tourn.id || '',
    tournamentName: tourn.name,
    gamesPlayed: stats.gamesPlayed,
    averageScore: stats.averageScore,
    highScore: stats.highScore,
    lowScore: stats.lowScore,
    totalPinfall: stats.totalPinfall,
    strikeRate: stats.strikeRate,
    spareRate: stats.spareRate,
    cleanGamesCount: cleanGames,
    cleanGamesRate: stats.cleanGameRate,
    splitConversionRate: stats.splitConversionRate,
    matches: tournMatches,
  };
}

