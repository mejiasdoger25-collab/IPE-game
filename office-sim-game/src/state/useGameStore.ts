/**
 * src/state/useGameStore.ts
 * Authoritative global game state managed by Zustand.
 * Adheres strictly to:
 * - RPG Pattern 1: Derived stats from base attributes (recomputed, never stored as mutable truth)
 * - Save-Systems Pattern 1: Authoritative serializable state snapshot with versioning
 */

import { create } from 'zustand';
import type {
  FiveCMetrics,
  FiveCKey,
  TimeTool,
  CanonicalTimeTool,
  IEClimateTier,
  InteractableType,
  ActiveInteractable,
  ActiveModal,
  StrikeLevel,
  SprintNumber,
  EndingType,
  StatModifier,
  SkinConfig,
  GameStateSnapshot,
  KanbanTask,
} from '../types/game';
import { INITIAL_TASKS } from '../data/tasks';
import {
  clamp,
  calculateICE,
  calculateTeamVelocity,
  calculateNegotiationProbability,
  getIEClimate,
  normalizeTimeTool,
  evaluateEnding,
} from '../utils/mathEngine';

// Re-export types for backward compatibility with storyNodes.ts and UI components
export type { FiveCMetrics, TimeTool, CanonicalTimeTool, ActiveInteractable, ActiveModal, InteractableType };

export const SAVE_VERSION = 1;

export const DEFAULT_SKIN_CONFIG: SkinConfig = {
  skinId: 'default_junior',
  name: 'Junior Fullstack Dev',
  layers: {
    body: 'base_body',
    hair: { sprite: 'hair_messy', tint: '#4A2E1B' },
    top: { sprite: 'shirt_hoodie', tint: '#2563EB' },
    bottom: { sprite: 'pants_jeans', tint: '#374151' },
    accessory: 'none',
  },
};

export const INITIAL_FIVE_C: FiveCMetrics = {
  compromiso: 50,
  confianza: 50,
  coordinacion: 50,
  comunicacion: 50,
  complementariedad: 50,
};

export interface GameStoreState {
  // Base authoritative attributes
  emotionalIntelligence: number; // [0, 100], starts at 50
  fiveCs: FiveCMetrics;          // Each [0, 100], starts at 50
  strikes: StrikeLevel;          // 0 | 1 | 2 | 3
  currentSprint: SprintNumber;   // 1 | 2 | 3
  dayTimeMinutes: number;        // 540 (09:00) to 1080 (18:00)
  isPaused: boolean;
  pomodoroActive: boolean;
  pomodoroMinutesRemaining: number;
  temporalMasteryPoints: number;
  unlockedTools: CanonicalTimeTool[];

  // Modifiers layer (RPG Pattern 1)
  activeModifiers: StatModifier[];

  // Phaser <-> React interaction bridge
  activeInteractable: ActiveInteractable | null;
  activeModal: ActiveModal;

  // Environment & narrative flags
  flags: Record<string, boolean | string | number>;
  ending: EndingType | null;
  technicalDebt: number;
  currentMapKey: string;
  skinConfig: SkinConfig;
  highStress: boolean;
  davidSupervising: boolean;
  tasks: KanbanTask[];

  // Actions
  updateIE: (delta: number) => void;
  updateFiveC: (delta: Partial<FiveCMetrics>) => void;
  addStrike: () => void;
  advanceTime: (minutes: number) => void;
  setDayTime: (minutes: number) => void;
  setSprint: (sprint: SprintNumber) => void;
  togglePause: (isPaused?: boolean) => void;
  startPomodoro: () => void;
  stopPomodoro: () => void;
  tickPomodoro: (minutes: number) => void;
  unlockTool: (tool: TimeTool) => void;
  unlockToolWithPoints: (tool: CanonicalTimeTool, cost?: number) => boolean;
  addTemporalMasteryPoints: (points: number) => void;
  advanceTask: (taskId: string) => void;
  updateTask: (taskId: string, partial: Partial<KanbanTask>) => void;
  setActiveInteractable: (interactable: ActiveInteractable | null) => void;
  setActiveModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  setFlag: (key: string, value: boolean | string | number) => void;
  addTechnicalDebt: (amount: number) => void;
  addModifier: (mod: StatModifier) => void;
  removeModifier: (id: string) => void;
  clearExpiredModifiers: () => void;
  triggerEnding: (ending: EndingType) => void;
  setSkinConfig: (config: SkinConfig) => void;
  setCurrentMapKey: (mapKey: string) => void;

  // Derived selectors (RPG Pattern 1 - recomputed dynamically)
  getEffectiveIE: () => number;
  getEffectiveFiveCs: () => FiveCMetrics;
  getICE: () => number;
  getTeamVelocity: () => number;
  getIEClimate: () => IEClimateTier;
  getNegotiationProbability: (baseOption: number, hasToolBonus?: boolean) => number;
  evaluateCurrentEnding: () => EndingType;

  // Save/Load snapshots (Save-Systems Pattern 1)
  captureSnapshot: () => GameStateSnapshot;
  loadSnapshot: (snapshot: GameStateSnapshot) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Initial state
  emotionalIntelligence: 50,
  fiveCs: { ...INITIAL_FIVE_C },
  strikes: 0,
  currentSprint: 1,
  dayTimeMinutes: 540, // 09:00
  isPaused: false,
  pomodoroActive: false,
  pomodoroMinutesRemaining: 0,
  temporalMasteryPoints: 0,
  unlockedTools: [],
  activeModifiers: [],
  activeInteractable: null,
  activeModal: 'NONE',
  flags: {},
  ending: null,
  technicalDebt: 0,
  currentMapKey: 'startup',
  skinConfig: { ...DEFAULT_SKIN_CONFIG },
  highStress: false,
  davidSupervising: false,
  tasks: INITIAL_TASKS.map((t) => ({ ...t })),

  // Actions
  updateIE: (delta) =>
    set((state) => ({
      emotionalIntelligence: clamp(state.emotionalIntelligence + delta),
    })),

  updateFiveC: (delta) =>
    set((state) => ({
      fiveCs: {
        compromiso: clamp(state.fiveCs.compromiso + (delta.compromiso ?? 0)),
        confianza: clamp(state.fiveCs.confianza + (delta.confianza ?? 0)),
        coordinacion: clamp(state.fiveCs.coordinacion + (delta.coordinacion ?? 0)),
        comunicacion: clamp(state.fiveCs.comunicacion + (delta.comunicacion ?? 0)),
        complementariedad: clamp(
          state.fiveCs.complementariedad + (delta.complementariedad ?? 0)
        ),
      },
    })),

  addStrike: () =>
    set((state) => {
      const nextStrikes = Math.min(state.strikes + 1, 3) as StrikeLevel;
      const updatedFiveCs = { ...state.fiveCs };
      let highStress = state.highStress;
      let davidSupervising = state.davidSupervising;
      let ending = state.ending;
      let activeModal = state.activeModal;

      if (nextStrikes === 1) {
        // Strike 1 (Warning): -15 confianza (C2) and -15 compromiso (C1)
        updatedFiveCs.confianza = clamp(updatedFiveCs.confianza - 15);
        updatedFiveCs.compromiso = clamp(updatedFiveCs.compromiso - 15);
      } else if (nextStrikes === 2) {
        // Strike 2 (Improvement Plan / Micromanagement): David's desk proximity supervision
        highStress = true;
        davidSupervising = true;
      } else if (nextStrikes === 3) {
        // Strike 3 (Firing threshold): Immediately triggers Ending 1
        ending = 'FIRED_GAME_OVER';
        activeModal = 'ENDING';
      }

      return {
        strikes: nextStrikes,
        fiveCs: updatedFiveCs,
        highStress,
        davidSupervising,
        ending,
        activeModal,
      };
    }),

  advanceTime: (minutes) =>
    set((state) => {
      if (state.isPaused) return state;
      const newMinutes = Math.min(state.dayTimeMinutes + minutes, 1080); // clamp to 18:00
      let pomodoroRemaining = state.pomodoroMinutesRemaining;
      let pomodoroActive = state.pomodoroActive;

      if (pomodoroActive) {
        pomodoroRemaining = Math.max(pomodoroRemaining - minutes, 0);
        if (pomodoroRemaining === 0) {
          pomodoroActive = false;
        }
      }

      return {
        dayTimeMinutes: newMinutes,
        pomodoroMinutesRemaining: pomodoroRemaining,
        pomodoroActive,
      };
    }),

  setDayTime: (minutes) =>
    set(() => ({
      dayTimeMinutes: clamp(minutes, 540, 1080),
    })),

  setSprint: (sprint) =>
    set(() => ({
      currentSprint: sprint,
      dayTimeMinutes: 540,
    })),

  togglePause: (isPaused) =>
    set((state) => ({
      isPaused: isPaused !== undefined ? isPaused : !state.isPaused,
    })),

  startPomodoro: () =>
    set(() => ({
      pomodoroActive: true,
      pomodoroMinutesRemaining: 25,
    })),

  stopPomodoro: () =>
    set(() => ({
      pomodoroActive: false,
      pomodoroMinutesRemaining: 0,
    })),

  tickPomodoro: (minutes) =>
    set((state) => {
      if (!state.pomodoroActive) return state;
      const rem = Math.max(state.pomodoroMinutesRemaining - minutes, 0);
      return {
        pomodoroMinutesRemaining: rem,
        pomodoroActive: rem > 0,
      };
    }),

  unlockTool: (tool) =>
    set((state) => {
      const canonical = normalizeTimeTool(tool);
      if (state.unlockedTools.includes(canonical)) return state;
      return {
        unlockedTools: [...state.unlockedTools, canonical],
      };
    }),

  unlockToolWithPoints: (tool, cost = 50) => {
    const state = get();
    const canonical = normalizeTimeTool(tool);
    if (state.unlockedTools.includes(canonical)) return true;
    if (state.temporalMasteryPoints >= cost) {
      set({
        temporalMasteryPoints: state.temporalMasteryPoints - cost,
        unlockedTools: [...state.unlockedTools, canonical],
      });
      return true;
    }
    return false;
  },

  advanceTask: (taskId) => {
    const state = get();
    const velocity = state.getTeamVelocity();
    const pomodoroActive = state.pomodoroActive;
    const fiveCs = state.fiveCs;

    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId) return t;

        // If in TODO, move to IN_PROGRESS
        if (t.status === 'TODO') {
          return { ...t, status: 'IN_PROGRESS', progressPercent: 25 };
        }

        // If in IN_PROGRESS, advance progress
        if (t.status === 'IN_PROGRESS') {
          const step = Math.round(25 * velocity * (pomodoroActive ? 1.3 : 1.0));
          const nextProgress = Math.min(t.progressPercent + step, 100);
          state.advanceTime(20);

          if (nextProgress >= 100) {
            return { ...t, status: 'CODE_REVIEW', progressPercent: 100 };
          }
          return { ...t, progressPercent: nextProgress };
        }

        // If in CODE_REVIEW, check approval
        if (t.status === 'CODE_REVIEW') {
          if (fiveCs.complementariedad >= 40) {
            state.advanceTime(15);
            return { ...t, status: 'DONE' };
          } else {
            state.addTechnicalDebt(15);
            state.advanceTime(30);
            return { ...t, status: 'DONE' };
          }
        }

        return t;
      }),
    }));
  },

  updateTask: (taskId, partial) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...partial } : t)),
    })),

  addTemporalMasteryPoints: (points) =>
    set((state) => ({
      temporalMasteryPoints: state.temporalMasteryPoints + points,
    })),

  setActiveInteractable: (interactable) =>
    set(() => ({
      activeInteractable: interactable,
    })),

  setActiveModal: (modal) =>
    set(() => ({
      activeModal: modal,
    })),

  closeModal: () =>
    set(() => ({
      activeModal: 'NONE',
    })),

  setFlag: (key, value) =>
    set((state) => ({
      flags: {
        ...state.flags,
        [key]: value,
      },
    })),

  addTechnicalDebt: (amount) =>
    set((state) => ({
      technicalDebt: Math.max(state.technicalDebt + amount, 0),
    })),

  addModifier: (mod) =>
    set((state) => ({
      activeModifiers: [...state.activeModifiers, mod],
    })),

  removeModifier: (id) =>
    set((state) => ({
      activeModifiers: state.activeModifiers.filter((m) => m.id !== id),
    })),

  clearExpiredModifiers: () =>
    set((state) => ({
      activeModifiers: state.activeModifiers.filter(
        (m) => m.durationMinutes === undefined || m.durationMinutes > 0
      ),
    })),

  triggerEnding: (ending) =>
    set(() => ({
      ending,
      activeModal: 'ENDING',
    })),

  setSkinConfig: (skinConfig) =>
    set(() => ({
      skinConfig,
    })),

  setCurrentMapKey: (currentMapKey) =>
    set(() => ({
      currentMapKey,
    })),

  // Derived selectors (Pattern 1: Recomputed on the fly)
  getEffectiveIE: () => {
    const state = get();
    let ie = state.emotionalIntelligence;
    for (const mod of state.activeModifiers) {
      if (mod.target === 'emotionalIntelligence') {
        if (mod.type === 'flat') ie += mod.value;
        else ie *= 1 + mod.value / 100;
      }
    }
    return clamp(Math.round(ie));
  },

  getEffectiveFiveCs: () => {
    const state = get();
    const result: FiveCMetrics = { ...state.fiveCs };
    for (const mod of state.activeModifiers) {
      if (mod.target in result) {
        const key = mod.target as FiveCKey;
        if (mod.type === 'flat') result[key] += mod.value;
        else result[key] *= 1 + mod.value / 100;
      }
    }
    return {
      compromiso: clamp(Math.round(result.compromiso)),
      confianza: clamp(Math.round(result.confianza)),
      coordinacion: clamp(Math.round(result.coordinacion)),
      comunicacion: clamp(Math.round(result.comunicacion)),
      complementariedad: clamp(Math.round(result.complementariedad)),
    };
  },

  getICE: () => {
    const effectiveFiveCs = get().getEffectiveFiveCs();
    return calculateICE(effectiveFiveCs);
  },

  getTeamVelocity: () => {
    const ice = get().getICE();
    let velocity = calculateTeamVelocity(ice);
    const state = get();
    if (state.pomodoroActive) {
      velocity *= 1.3; // +30% coding speed during pomodoro
    }
    return Number(velocity.toFixed(3));
  },

  getIEClimate: () => {
    const ie = get().getEffectiveIE();
    return getIEClimate(ie);
  },

  getNegotiationProbability: (baseOption: number, hasToolBonus = false) => {
    const state = get();
    const ie = state.getEffectiveIE();
    const fiveCs = state.getEffectiveFiveCs();
    return calculateNegotiationProbability(
      baseOption,
      ie,
      fiveCs.comunicacion,
      hasToolBonus
    );
  },

  evaluateCurrentEnding: () => {
    const state = get();
    return evaluateEnding({
      strikes: state.strikes,
      ie: state.getEffectiveIE(),
      fiveCs: state.getEffectiveFiveCs(),
      unlockedTools: state.unlockedTools,
      flags: state.flags,
    });
  },

  // Save/Load snapshots
  captureSnapshot: (): GameStateSnapshot => {
    const state = get();
    return {
      emotionalIntelligence: state.emotionalIntelligence,
      fiveCs: { ...state.fiveCs },
      strikes: state.strikes,
      currentSprint: state.currentSprint,
      dayTimeMinutes: state.dayTimeMinutes,
      temporalMasteryPoints: state.temporalMasteryPoints,
      unlockedTools: [...state.unlockedTools],
      flags: { ...state.flags },
      activeModifiers: [...state.activeModifiers],
      ending: state.ending,
      skinConfig: { ...state.skinConfig },
      currentMapKey: state.currentMapKey,
      technicalDebt: state.technicalDebt,
      tasks: state.tasks.map((t) => ({ ...t })),
    };
  },

  loadSnapshot: (snapshot: GameStateSnapshot) =>
    set(() => ({
      emotionalIntelligence: snapshot.emotionalIntelligence,
      fiveCs: { ...snapshot.fiveCs },
      strikes: snapshot.strikes,
      currentSprint: snapshot.currentSprint,
      dayTimeMinutes: snapshot.dayTimeMinutes,
      temporalMasteryPoints: snapshot.temporalMasteryPoints,
      unlockedTools: [...snapshot.unlockedTools],
      flags: { ...snapshot.flags },
      activeModifiers: [...snapshot.activeModifiers],
      ending: snapshot.ending,
      skinConfig: { ...snapshot.skinConfig },
      currentMapKey: snapshot.currentMapKey,
      technicalDebt: snapshot.technicalDebt,
      tasks: snapshot.tasks
        ? snapshot.tasks.map((t) => ({ ...t }))
        : INITIAL_TASKS.map((t) => ({ ...t })),
      activeModal: snapshot.ending ? 'ENDING' : 'NONE',
    })),

  resetGame: () =>
    set(() => ({
      emotionalIntelligence: 50,
      fiveCs: { ...INITIAL_FIVE_C },
      strikes: 0,
      currentSprint: 1,
      dayTimeMinutes: 540,
      isPaused: false,
      pomodoroActive: false,
      pomodoroMinutesRemaining: 0,
      temporalMasteryPoints: 0,
      unlockedTools: [],
      activeModifiers: [],
      activeInteractable: null,
      activeModal: 'NONE',
      flags: {},
      ending: null,
      technicalDebt: 0,
      currentMapKey: 'startup',
      skinConfig: { ...DEFAULT_SKIN_CONFIG },
      highStress: false,
      davidSupervising: false,
      tasks: INITIAL_TASKS.map((t) => ({ ...t })),
    })),
}));
