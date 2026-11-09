import { LaneTransitionRule } from '../types/bowling';

export interface LaneTransitionOptions {
  customStep?: number;
  seedNumber?: number;
  seedParity?: 'even' | 'odd';
  totalLanes?: number;
  laneMin?: number;
  laneMax?: number;
}

export interface TransitionRuleDefinition {
  value: LaneTransitionRule;
  label: string;
  shortLabel: string;
  description: string;
  iconType: 'none' | 'pairs' | 'right' | 'left' | 'seed' | 'custom';
}

export const TRANSITION_RULES: TransitionRuleDefinition[] = [
  {
    value: 'none',
    label: 'Без перехода (на той же дорожке / паре)',
    shortLabel: 'Без перехода',
    description: 'Оставаться на той же дорожке на протяжении всей серии',
    iconType: 'none',
  },
  {
    value: 'pairs',
    label: 'В паре (чет ⇄ нечет, напр. 1 ⇄ 2)',
    shortLabel: 'В паре ⇄',
    description: 'Чередование внутри пары дорожек (1 ⇄ 2, 3 ⇄ 4, 5 ⇄ 6...)',
    iconType: 'pairs',
  },
  {
    value: 'shift_plus_1',
    label: 'На одну дорожку вправо (+1)',
    shortLabel: 'Вправо +1 →',
    description: 'Сдвиг на 1 дорожку вправо после каждой партии',
    iconType: 'right',
  },
  {
    value: 'shift_minus_1',
    label: 'На одну дорожку влево (-1)',
    shortLabel: 'Влево -1 ←',
    description: 'Сдвиг на 1 дорожку влево после каждой партии',
    iconType: 'left',
  },
  {
    value: 'seed_even_left_odd_right',
    label: 'По посеву: Чётный — влево, Нечётный — вправо',
    shortLabel: 'Посев (Чёт ← / Нечёт →)',
    description: 'Игроки с чётным посевом смещаются влево, с нечётным — вправо',
    iconType: 'seed',
  },
  {
    value: 'seed_even_right_odd_left',
    label: 'По посеву: Чётный — вправо, Нечётный — влево',
    shortLabel: 'Посев (Чёт → / Нечёт ←)',
    description: 'Игроки с чётным посевом смещаются вправо, с нечётным — влево',
    iconType: 'seed',
  },
  {
    value: 'custom_step',
    label: 'Произвольный шаг (указать количество дорожек)',
    shortLabel: 'Свой шаг',
    description: 'Сдвиг на заданное количество дорожек (влево или вправо)',
    iconType: 'custom',
  },
  {
    value: 'shift_plus_2',
    label: 'Сдвиг через пару вправо (+2 дорожки)',
    shortLabel: '+2 вправо',
    description: 'Смещение на 2 дорожки вправо',
    iconType: 'right',
  },
  {
    value: 'shift_minus_2',
    label: 'Сдвиг через пару влево (-2 дорожки)',
    shortLabel: '-2 влево',
    description: 'Смещение на 2 дорожки влево',
    iconType: 'left',
  },
  {
    value: 'shift_plus_4',
    label: 'Сдвиг на 4 дорожки вправо (+4)',
    shortLabel: '+4 вправо',
    description: 'Смещение на 4 дорожки вправо',
    iconType: 'right',
  },
];

/**
 * Calculates the next lane according to the specified rule, seed/step options,
 * and circular wrapping within the active lane range [laneMin..laneMax].
 */
export function calculateNextLane(
  currentLane: number,
  rule: LaneTransitionRule | undefined,
  options?: LaneTransitionOptions
): number {
  if (!currentLane || currentLane < 1) currentLane = 1;
  if (!rule || rule === 'none') return currentLane;

  const minLane = Math.max(1, options?.laneMin ?? 1);
  const maxLane = Math.max(
    minLane,
    options?.laneMax ?? (options?.totalLanes ? options.totalLanes : Math.max(currentLane, 24))
  );
  const span = maxLane - minLane + 1;

  // Helper to wrap lane cleanly within [minLane, maxLane]
  const wrap = (lane: number): number => {
    if (span <= 1) return minLane;
    const offset = lane - minLane;
    const wrappedOffset = ((offset % span) + span) % span;
    return minLane + wrappedOffset;
  };

  if (rule === 'pairs') {
    // Alternating within a pair: 1 ⇄ 2, 3 ⇄ 4, etc.
    const isOdd = currentLane % 2 === 1;
    const candidate = isOdd ? currentLane + 1 : currentLane - 1;
    return wrap(candidate);
  }

  let delta = 0;

  if (rule === 'shift_plus_1') {
    delta = 1;
  } else if (rule === 'shift_minus_1') {
    delta = -1;
  } else if (rule === 'shift_plus_2') {
    delta = 2;
  } else if (rule === 'shift_minus_2') {
    delta = -2;
  } else if (rule === 'shift_plus_4') {
    delta = 4;
  } else if (rule === 'custom_step') {
    delta = options?.customStep ?? 2;
  } else if (rule === 'seed_even_left_odd_right') {
    const isEven = options?.seedParity
      ? options.seedParity === 'even'
      : options?.seedNumber
      ? options.seedNumber % 2 === 0
      : false;
    const step = Math.abs(options?.customStep || 1);
    delta = isEven ? -step : step;
  } else if (rule === 'seed_even_right_odd_left') {
    const isEven = options?.seedParity
      ? options.seedParity === 'even'
      : options?.seedNumber
      ? options.seedNumber % 2 === 0
      : false;
    const step = Math.abs(options?.customStep || 1);
    delta = isEven ? step : -step;
  }

  return wrap(currentLane + delta);
}

/**
 * Generates a short, badge-ready string for cards and summaries.
 */
export function formatTransitionRuleBadge(
  rule: LaneTransitionRule | undefined,
  options?: LaneTransitionOptions
): string {
  if (!rule || rule === 'none') {
    return 'Без перехода';
  }
  if (rule === 'pairs') {
    return '⇄ В паре';
  }
  if (rule === 'shift_plus_1') {
    return '→ +1 вправо';
  }
  if (rule === 'shift_minus_1') {
    return '← -1 влево';
  }
  if (rule === 'shift_plus_2') {
    return '→ +2 вправо';
  }
  if (rule === 'shift_minus_2') {
    return '← -2 влево';
  }
  if (rule === 'shift_plus_4') {
    return '→ +4 вправо';
  }
  if (rule === 'custom_step') {
    const s = options?.customStep ?? 2;
    return `${s > 0 ? '→ +' : '← '}${s} дор.`;
  }
  if (rule === 'seed_even_left_odd_right') {
    if (options?.seedNumber) {
      const isEven = options.seedNumber % 2 === 0;
      return `Посев #${options.seedNumber} (${isEven ? '← влево' : '→ вправо'})`;
    }
    if (options?.seedParity) {
      return `Посев: ${options.seedParity === 'even' ? 'Чётный ←' : 'Нечётный →'}`;
    }
    return 'Посев (Чёт ← / Нечёт →)';
  }
  if (rule === 'seed_even_right_odd_left') {
    if (options?.seedNumber) {
      const isEven = options.seedNumber % 2 === 0;
      return `Посев #${options.seedNumber} (${isEven ? '→ вправо' : '← влево'})`;
    }
    if (options?.seedParity) {
      return `Посев: ${options.seedParity === 'even' ? 'Чётный →' : 'Нечётный ←'}`;
    }
    return 'Посев (Чёт → / Нечёт ←)';
  }
  return 'Смена дорожек';
}
