/**
 * src/utils/mathEngine.ts
 * Pure mathematical functions for Section 6 and Section 3 of the Narrative & Mechanics Bible.
 * Unit-testable, deterministic, zero side-effects.
 */

import type {
  FiveCMetrics,
  IEClimateTier,
  EndingType,
  TimeTool,
  CanonicalTimeTool,
} from '../types/game';

/**
 * Clamps a numerical value within [min, max], default [0, 100].
 */
export function clamp(value: number, min = 0, max = 100): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalizes tool names between lowercase and canonical uppercase representations.
 */
export function normalizeTimeTool(tool: TimeTool): CanonicalTimeTool {
  const upper = tool.toUpperCase();
  if (upper === 'POMODORO' || upper === 'EISENHOWER' || upper === 'PARETO' || upper === 'GANTT') {
    return upper as CanonicalTimeTool;
  }
  return 'POMODORO';
}

/**
 * Global Team Cohesion Index (ICE):
 * ICE = (C_Compromiso + C_Confianza + C_Coordinacion + C_Comunicacion + C_Complementariedad) / 5
 */
export function calculateICE(fiveCs: FiveCMetrics): number {
  const sum =
    clamp(fiveCs.compromiso) +
    clamp(fiveCs.confianza) +
    clamp(fiveCs.coordinacion) +
    clamp(fiveCs.comunicacion) +
    clamp(fiveCs.complementariedad);
  const rawIce = sum / 5;
  return Number(rawIce.toFixed(2));
}

/**
 * Team Development Velocity Multiplier (V_equipo):
 * V_equipo = 1 + ((ICE - 50) / 100) * 0.5
 *
 * Examples:
 * - ICE = 50 -> 1.0 (100% normal velocity)
 * - ICE = 20 -> 0.85 (15% slower due to friction and incompatibility)
 * - ICE = 90 -> 1.20 (20% faster due to team synergy)
 */
export function calculateTeamVelocity(ice: number): number {
  const clampedIce = clamp(ice);
  const velocity = 1 + ((clampedIce - 50) / 100) * 0.5;
  return Number(velocity.toFixed(3));
}

/**
 * Negotiation Success Probability Modifier (P_negociacion):
 * P_negociacion = Base_opcion + (0.3 * IE) + (0.2 * C_Comunicacion) + Bonus_Herramientas
 * Where Bonus_Herramientas = 25 when backed by productivity tools, else 0.
 */
export function calculateNegotiationProbability(
  baseOption: number,
  ie: number,
  comunicacion: number,
  hasToolBonus: boolean
): number {
  const clampedIE = clamp(ie);
  const clampedCom = clamp(comunicacion);
  const toolBonus = hasToolBonus ? 25 : 0;
  const rawProb = baseOption + 0.3 * clampedIE + 0.2 * clampedCom + toolBonus;
  return clamp(Number(rawProb.toFixed(2)), 0, 100);
}

/**
 * IE Climate Tier selector:
 * - 75 - 100: "EMPATHIC_SYNERGY" (+25% negotiation ease, spontaneous bug warnings)
 * - 35 - 74:  "PROFESSIONAL_CLIMATE" (Standard workplace)
 * - 0 - 34:   "HOSTILE_ENVIRONMENT" (Harsh responses, strict PR rejections, hidden bugs)
 */
export function getIEClimate(ie: number): IEClimateTier {
  const clampedIE = clamp(ie);
  if (clampedIE >= 75) return 'EMPATHIC_SYNERGY';
  if (clampedIE >= 35) return 'PROFESSIONAL_CLIMATE';
  return 'HOSTILE_ENVIRONMENT';
}

/**
 * Evaluates game state against the 6 endings defined in Section 5 of the narrative bible.
 */
export function evaluateEnding(params: {
  strikes: number;
  ie: number;
  fiveCs: FiveCMetrics;
  unlockedTools: string[];
  flags: Record<string, boolean | string | number>;
}): EndingType {
  const { strikes, ie, fiveCs, unlockedTools, flags } = params;
  const ice = calculateICE(fiveCs);

  // Ending 1: Fired for Incompetence & Procrastination (3 strikes)
  if (strikes >= 3) {
    return 'FIRED_GAME_OVER';
  }

  const normalizedTools = new Set(unlockedTools.map((t) => t.toUpperCase()));
  const hasAllTools =
    normalizedTools.has('POMODORO') &&
    normalizedTools.has('EISENHOWER') &&
    normalizedTools.has('PARETO') &&
    normalizedTools.has('GANTT');

  const stoodFirmAgainstDavid =
    Boolean(flags['stood_firm_against_david']) ||
    Boolean(flags['stood_firm_david']) ||
    Boolean(flags['gantt_synced']) && Boolean(flags['used_eisenhower_correctly']);

  // Ending 6: Startup Co-Founders (Secret Ending: 5Cs >= 90 & stood firm against bad commercial practices)
  if (
    fiveCs.confianza >= 90 &&
    fiveCs.compromiso >= 90 &&
    fiveCs.complementariedad >= 90 &&
    stoodFirmAgainstDavid
  ) {
    return 'STARTUP_COFOUNDERS';
  }

  // Ending 5: Tech Lead Excellence (True Ending: IE >= 75, all 5Cs >= 75, all 4 tools)
  if (
    ie >= 75 &&
    fiveCs.compromiso >= 75 &&
    fiveCs.confianza >= 75 &&
    fiveCs.coordinacion >= 75 &&
    fiveCs.comunicacion >= 75 &&
    fiveCs.complementariedad >= 75 &&
    hasAllTools
  ) {
    return 'TECH_LEAD_EXCELLENCE';
  }

  // Ending 2: Burned-Out "Lone Wolf" (Strikes = 0, but rejected teamwork: ICE < 35 and IE < 35)
  if (strikes === 0 && ice < 35 && ie < 35) {
    return 'BURNOUT_SOLITARY_WOLF';
  }

  // Ending 3: Exploited People-Pleaser (Accepted scope creep without assertiveness/tools)
  if (Boolean(flags['accepted_all_scope_creep']) || (ie >= 50 && ice < 45 && !hasAllTools)) {
    return 'EXPLOITED_PEOPLE_PLEASER';
  }

  // Ending 4: Solid Developer (Balanced survivor standard)
  return 'SOLID_DEVELOPER';
}
