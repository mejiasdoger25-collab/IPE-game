/**
 * src/tests/testMathEngine.ts
 * Standalone verification for mathematical formulas from Section 6 and Section 3 of the Bible.
 */

import {
  clamp,
  calculateICE,
  calculateTeamVelocity,
  calculateNegotiationProbability,
  getIEClimate,
  evaluateEnding,
} from '../utils/mathEngine';
import type { FiveCMetrics } from '../types/game';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log('=== RUNNING SECTION 6 MATHEMATICAL FORMULA TESTS ===\n');

// 1. Clamping Tests
assert(clamp(50) === 50, 'clamp(50) returns 50');
assert(clamp(-10) === 0, 'clamp(-10) clamps to 0');
assert(clamp(150) === 100, 'clamp(150) clamps to 100');

// 2. Global Team Cohesion Index (ICE)
const neutralCs: FiveCMetrics = {
  compromiso: 50,
  confianza: 50,
  coordinacion: 50,
  comunicacion: 50,
  complementariedad: 50,
};
assert(calculateICE(neutralCs) === 50, 'ICE with all 50s equals 50');

const lowCs: FiveCMetrics = {
  compromiso: 20,
  confianza: 20,
  coordinacion: 20,
  comunicacion: 20,
  complementariedad: 20,
};
assert(calculateICE(lowCs) === 20, 'ICE with all 20s equals 20');

const highCs: FiveCMetrics = {
  compromiso: 90,
  confianza: 90,
  coordinacion: 90,
  comunicacion: 90,
  complementariedad: 90,
};
assert(calculateICE(highCs) === 90, 'ICE with all 90s equals 90');

// 3. Team Development Velocity Multiplier (V_equipo)
// V_equipo = 1 + ((ICE - 50) / 100) * 0.5
assert(calculateTeamVelocity(50) === 1.0, 'V_equipo at ICE 50 equals 1.0 (100% normal speed)');
assert(calculateTeamVelocity(20) === 0.85, 'V_equipo at ICE 20 equals 0.85 (15% slower, penalty from low synergy)');
assert(calculateTeamVelocity(90) === 1.20, 'V_equipo at ICE 90 equals 1.20 (20% faster, bonus from high synergy)');
assert(calculateTeamVelocity(0) === 0.75, 'V_equipo at ICE 0 equals 0.75');
assert(calculateTeamVelocity(100) === 1.25, 'V_equipo at ICE 100 equals 1.25');

// 4. Negotiation Success Modifier (P_negociacion)
// P = Base + 0.3*IE + 0.2*Com + Bonus_Herramientas (25)
const baseNegotiation = 20;
const probWithoutTool = calculateNegotiationProbability(baseNegotiation, 50, 50, false);
// 20 + 0.3*50 (15) + 0.2*50 (10) + 0 = 45
assert(probWithoutTool === 45, `P_negociacion without tools = 45 (got ${probWithoutTool})`);

const probWithTool = calculateNegotiationProbability(baseNegotiation, 50, 50, true);
// 20 + 15 + 10 + 25 = 70
assert(probWithTool === 70, `P_negociacion with tools bonus = 70 (got ${probWithTool})`);

// 5. IE Climate Tiers
assert(getIEClimate(80) === 'EMPATHIC_SYNERGY', 'IE 80 is EMPATHIC_SYNERGY');
assert(getIEClimate(75) === 'EMPATHIC_SYNERGY', 'IE 75 is EMPATHIC_SYNERGY');
assert(getIEClimate(50) === 'PROFESSIONAL_CLIMATE', 'IE 50 is PROFESSIONAL_CLIMATE');
assert(getIEClimate(35) === 'PROFESSIONAL_CLIMATE', 'IE 35 is PROFESSIONAL_CLIMATE');
assert(getIEClimate(34) === 'HOSTILE_ENVIRONMENT', 'IE 34 is HOSTILE_ENVIRONMENT');
assert(getIEClimate(10) === 'HOSTILE_ENVIRONMENT', 'IE 10 is HOSTILE_ENVIRONMENT');

// 6. Ending Evaluations
const firedEnding = evaluateEnding({
  strikes: 3,
  ie: 50,
  fiveCs: neutralCs,
  unlockedTools: [],
  flags: {},
});
assert(firedEnding === 'FIRED_GAME_OVER', 'Strike 3 triggers FIRED_GAME_OVER');

const loneWolfEnding = evaluateEnding({
  strikes: 0,
  ie: 30,
  fiveCs: lowCs,
  unlockedTools: ['POMODORO'],
  flags: {},
});
assert(loneWolfEnding === 'BURNOUT_SOLITARY_WOLF', 'Low IE & Low 5Cs with 0 strikes triggers BURNOUT_SOLITARY_WOLF');

const techLeadEnding = evaluateEnding({
  strikes: 0,
  ie: 85,
  fiveCs: {
    compromiso: 80,
    confianza: 80,
    coordinacion: 80,
    comunicacion: 80,
    complementariedad: 80,
  },
  unlockedTools: ['POMODORO', 'EISENHOWER', 'PARETO', 'GANTT'],
  flags: {},
});
assert(techLeadEnding === 'TECH_LEAD_EXCELLENCE', 'High IE, 5Cs >= 75 and all 4 tools triggers TECH_LEAD_EXCELLENCE');

const cofoundersEnding = evaluateEnding({
  strikes: 0,
  ie: 95,
  fiveCs: {
    compromiso: 95,
    confianza: 95,
    coordinacion: 90,
    comunicacion: 90,
    complementariedad: 95,
  },
  unlockedTools: ['POMODORO', 'EISENHOWER', 'PARETO', 'GANTT'],
  flags: { stood_firm_against_david: true },
});
assert(cofoundersEnding === 'STARTUP_COFOUNDERS', 'Super high 5Cs + firm stance triggers STARTUP_COFOUNDERS');

console.log('\n=== ALL SECTION 6 MATHEMATICAL FORMULA TESTS PASSED SUCCESSFULLY! ===\n');
