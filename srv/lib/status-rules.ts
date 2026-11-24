/**
 * Status rules agreed with the villagers (see docs/villager-requirements.md).
 *
 * Pure functions without CAP: the services call them from their after('READ') handlers, and
 * later apps (Rowan's overview) reuse exactly the same rules.
 */

/** Maren's pipe status: `alarm` = drop everything, `visit` = plan a visit this week. */
export type PipeStatus = 'alarm' | 'visit' | 'ok';

/** Tobin's stock status: `critical` = panic, `low` = nervous. */
export type StockStatus = 'critical' | 'low' | 'ok';

/** Maren Holt: exactly on a threshold (80 %, 40 PSI) still counts as fine, so the checks are strict `<`. */
export const PIPE_THRESHOLDS = {
  alarmFlowPercent: 50,
  alarmPressure: 25,
  visitFlowPercent: 80,
  visitPressure: 40,
} as const;

/** CAP may return Decimals as strings — turn any numeric input into a number, or null. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

/** Current flow as a percentage of what the pipe normally carries (unrounded). */
export function flowPercent(currentFlowRate: number | null, nominalFlowRate: number | null): number | null {
  if (currentFlowRate === null || nominalFlowRate === null || nominalFlowRate <= 0) return null;
  return (currentFlowRate / nominalFlowRate) * 100;
}

/**
 * Maren Holt: flow below 50 % or pressure under 25 PSI → alarm;
 * flow below 80 % or pressure under 40 PSI → visit; otherwise ok.
 * One bad reading is enough. Returns null when neither reading is known.
 */
export function pipeStatus(flowPct: number | null, pressure: number | null): PipeStatus | null {
  if (flowPct === null && pressure === null) return null;
  const below = (value: number | null, limit: number): boolean => value !== null && value < limit;
  if (below(flowPct, PIPE_THRESHOLDS.alarmFlowPercent) || below(pressure, PIPE_THRESHOLDS.alarmPressure)) {
    return 'alarm';
  }
  if (below(flowPct, PIPE_THRESHOLDS.visitFlowPercent) || below(pressure, PIPE_THRESHOLDS.visitPressure)) {
    return 'visit';
  }
  return 'ok';
}

/**
 * Tobin Reyes: below half of the minimum level → critical; below the minimum level → low; otherwise ok.
 * Returns null when one of the inputs is unknown.
 */
export function stockStatus(currentQuantity: number | null, minStockLevel: number | null): StockStatus | null {
  if (currentQuantity === null || minStockLevel === null) return null;
  if (currentQuantity < minStockLevel / 2) return 'critical';
  if (currentQuantity < minStockLevel) return 'low';
  return 'ok';
}
