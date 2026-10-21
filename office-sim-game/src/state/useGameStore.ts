/**
 * src/state/useGameStore.ts
 * Authoritative global game state managed by Zustand (Zero circular dependencies).
 */

import { create } from 'zustand';
import type {
  FiveCMetrics,
  FiveCKey,
  NPCAffinities,
  NPCKey,
  StatChangeToast,
  InterruptionRecord,
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
import { ACT_INTERRUPTIONS } from '../data/storyNodes';
import {
  clamp,
  calculateICE,
  calculateTeamVelocity,
  calculateNegotiationProbability,
  getIEClimate,
  normalizeTimeTool,
  evaluateEnding,
} from '../utils/mathEngine';

export type {
  FiveCMetrics,
  TimeTool,
  CanonicalTimeTool,
  ActiveInteractable,
  ActiveModal,
  InteractableType,
};

export const SAVE_VERSION = 2;

export const DEFAULT_SKIN_CONFIG: SkinConfig = {
  skinId: 'default_junior',
  name: 'Junior Fullstack Dev',
  layers: {
    body: 'skin_light',
    hair: { sprite: 'hair_spiky', tint: '#3B2314' },
    top: { sprite: 'shirt_hoodie', tint: '#2563EB' },
    bottom: { sprite: 'pants_jeans', tint: '#1E293B' },
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

export const INITIAL_AFFINITIES: NPCAffinities = {
  elena: 50,
  david: 50,
  marcos: 50,
  sofia: 50,
  lucas: 50,
};

const FIVE_C_LABELS: Record<FiveCKey, string> = {
  compromiso: 'Compromiso',
  confianza: 'Confianza',
  coordinacion: 'Coordinación',
  comunicacion: 'Comunicación',
  complementariedad: 'Complement.',
};

const NPC_LABELS: Record<NPCKey, string> = {
  elena: 'Afinidad Elena',
  david: 'Afinidad David',
  marcos: 'Afinidad Marcos',
  sofia: 'Afinidad Sofía',
  lucas: 'Afinidad Lucas',
};

function makeStatToast(
  statKey: string,
  label: string,
  delta: number,
  newValue: number,
  category: StatChangeToast['category'],
  isBeneficial: boolean
): StatChangeToast {
  return {
    id: `${statKey}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    statKey,
    label,
    delta: Math.round(delta),
    newValue: Math.round(newValue),
    category,
    isBeneficial,
    timestamp: Date.now(),
  };
}

export interface GameStoreState {
  emotionalIntelligence: number;
  fiveCs: FiveCMetrics;
  affinities: NPCAffinities;
  teamStress: number;
  timeManagement: number;

  recentStatChanges: StatChangeToast[];
  interruptionHistory: InterruptionRecord[];
  triggeredInterruptions: string[];
  pendingInterruptionNodeId: string | null;

  strikes: StrikeLevel;
  currentSprint: SprintNumber;
  dayTimeMinutes: number;
  isPaused: boolean;
  pomodoroActive: boolean;
  pomodoroMinutesRemaining: number;
  temporalMasteryPoints: number;
  unlockedTools: CanonicalTimeTool[];

  activeModifiers: StatModifier[];
  activeInteractable: ActiveInteractable | null;
  activeModal: ActiveModal;

  flags: Record<string, boolean | string | number>;
  ending: EndingType | null;
  technicalDebt: number;
  currentMapKey: string;
  skinConfig: SkinConfig;
  highStress: boolean;
  davidSupervising: boolean;
  tasks: KanbanTask[];

  updateIE: (delta: number) => void;
  updateFiveC: (delta: Partial<FiveCMetrics>) => void;
  updateAffinities: (delta: Partial<NPCAffinities>) => void;
  updateStress: (delta: number) => void;
  updateTimeManagement: (delta: number) => void;
  recordInterruption: (record: InterruptionRecord) => void;
  triggerNextSprintInterruption: () => string | null;
  clearPendingInterruption: () => void;
  dismissStatChange: (id: string) => void;

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

  getEffectiveIE: () => number;
  getEffectiveFiveCs: () => FiveCMetrics;
  getICE: () => number;
  getAverageAffinity: () => number;
  getTeamVelocity: () => number;
  getIEClimate: () => IEClimateTier;
  getNegotiationProbability: (baseOption: number, hasToolBonus?: boolean) => number;
  evaluateCurrentEnding: () => EndingType;

  captureSnapshot: () => GameStateSnapshot;
  loadSnapshot: (snapshot: GameStateSnapshot) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  emotionalIntelligence: 50,
  fiveCs: { ...INITIAL_FIVE_C },
  affinities: { ...INITIAL_AFFINITIES },
  teamStress: 50,
  timeManagement: 50,
  recentStatChanges: [],
  interruptionHistory: [],
  triggeredInterruptions: [],
  pendingInterruptionNodeId: null,

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

  updateIE: (delta) =>
    set((state) => {
      if (!delta) return state;
      const next = clamp(state.emotionalIntelligence + delta);
      const actualDelta = next - state.emotionalIntelligence;
      if (actualDelta === 0) return state;
      const toast = makeStatToast(
        'ie',
        'Empatía / IE',
        actualDelta,
        next,
        'IE',
        actualDelta > 0
      );
      return {
        emotionalIntelligence: next,
        recentStatChanges: [toast, ...state.recentStatChanges].slice(0, 14),
      };
    }),

  updateFiveC: (delta) =>
    set((state) => {
      const nextFiveCs = { ...state.fiveCs };
      const newToasts: StatChangeToast[] = [];

      (Object.keys(delta) as FiveCKey[]).forEach((key) => {
        const d = delta[key] ?? 0;
        if (d !== 0) {
          const updated = clamp(state.fiveCs[key] + d);
          const realDelta = updated - state.fiveCs[key];
          nextFiveCs[key] = updated;
          if (realDelta !== 0) {
            newToasts.push(
              makeStatToast(
                `5c_${key}`,
                FIVE_C_LABELS[key],
                realDelta,
                updated,
                '5C',
                realDelta > 0
              )
            );
          }
        }
      });

      if (newToasts.length === 0) return state;
      return {
        fiveCs: nextFiveCs,
        recentStatChanges: [...newToasts, ...state.recentStatChanges].slice(0, 14),
      };
    }),

  updateAffinities: (delta) =>
    set((state) => {
      const nextAff = { ...state.affinities };
      const newToasts: StatChangeToast[] = [];

      (Object.keys(delta) as NPCKey[]).forEach((npc) => {
        const d = delta[npc] ?? 0;
        if (d !== 0) {
          const updated = clamp(state.affinities[npc] + d);
          const realDelta = updated - state.affinities[npc];
          nextAff[npc] = updated;
          if (realDelta !== 0) {
            newToasts.push(
              makeStatToast(
                `aff_${npc}`,
                NPC_LABELS[npc],
                realDelta,
                updated,
                'AFFINITY',
                realDelta > 0
              )
            );
          }
        }
      });

      if (newToasts.length === 0) return state;
      return {
        affinities: nextAff,
        recentStatChanges: [...newToasts, ...state.recentStatChanges].slice(0, 14),
      };
    }),

  updateStress: (delta) =>
    set((state) => {
      if (!delta) return state;
      const next = clamp(state.teamStress + delta);
      const realDelta = next - state.teamStress;
      if (realDelta === 0) return state;
      const toast = makeStatToast(
        'stress',
        'Estrés Equipo',
        realDelta,
        next,
        'STRESS',
        realDelta < 0
      );
      return {
        teamStress: next,
        highStress: next >= 75,
        recentStatChanges: [toast, ...state.recentStatChanges].slice(0, 14),
      };
    }),

  updateTimeManagement: (delta) =>
    set((state) => {
      if (!delta) return state;
      const next = clamp(state.timeManagement + delta);
      const realDelta = next - state.timeManagement;
      if (realDelta === 0) return state;
      const toast = makeStatToast(
        'time_mgmt',
        'Gestión Tiempo',
        realDelta,
        next,
        'TIME',
        realDelta > 0
      );
      return {
        timeManagement: next,
        recentStatChanges: [toast, ...state.recentStatChanges].slice(0, 14),
      };
    }),

  recordInterruption: (record) =>
    set((state) => ({
      interruptionHistory: [...state.interruptionHistory, record],
      triggeredInterruptions: Array.from(
        new Set([...state.triggeredInterruptions, record.nodeId])
      ),
    })),

  triggerNextSprintInterruption: () => {
    const state = get();
    const pool = ACT_INTERRUPTIONS[state.currentSprint] || [];
    const nextNodeId = pool.find((id) => !state.triggeredInterruptions.includes(id));
    if (!nextNodeId) return null;

    set((s) => ({
      triggeredInterruptions: [...s.triggeredInterruptions, nextNodeId],
      pendingInterruptionNodeId: nextNodeId,
      activeModal: 'DIALOGUE',
    }));
    return nextNodeId;
  },

  clearPendingInterruption: () =>
    set(() => ({
      pendingInterruptionNodeId: null,
    })),

  dismissStatChange: (id) =>
    set((state) => ({
      recentStatChanges: state.recentStatChanges.filter((item) => item.id !== id),
    })),

  addStrike: () =>
    set((state) => {
      const nextStrikes = Math.min(state.strikes + 1, 3) as StrikeLevel;
      const updatedFiveCs = { ...state.fiveCs };
      const newToasts: StatChangeToast[] = [];
      let highStress = state.highStress;
      let davidSupervising = state.davidSupervising;
      let ending = state.ending;
      let activeModal = state.activeModal;
      const nextStress = clamp(state.teamStress + 15);
      const nextTimeMgmt = clamp(state.timeManagement - 15);

      newToasts.push(
        makeStatToast('stress', 'Estrés Equipo', 15, nextStress, 'STRESS', false),
        makeStatToast('time_mgmt', 'Gestión Tiempo', -15, nextTimeMgmt, 'TIME', false)
      );

      if (nextStrikes === 1) {
        updatedFiveCs.confianza = clamp(updatedFiveCs.confianza - 15);
        updatedFiveCs.compromiso = clamp(updatedFiveCs.compromiso - 15);
        newToasts.push(
          makeStatToast('5c_confianza', 'Confianza', -15, updatedFiveCs.confianza, '5C', false),
          makeStatToast('5c_compromiso', 'Compromiso', -15, updatedFiveCs.compromiso, '5C', false)
        );
      } else if (nextStrikes === 2) {
        highStress = true;
        davidSupervising = true;
      } else if (nextStrikes === 3) {
        ending = 'FIRED_GAME_OVER';
        activeModal = 'ENDING';
      }

      return {
        strikes: nextStrikes,
        fiveCs: updatedFiveCs,
        teamStress: nextStress,
        timeManagement: nextTimeMgmt,
        recentStatChanges: [...newToasts, ...state.recentStatChanges].slice(0, 14),
        highStress,
        davidSupervising,
        ending,
        activeModal,
      };
    }),

  advanceTime: (minutes) =>
    set((state) => {
      if (state.isPaused) return state;
      const sprintPressure = state.currentSprint === 1 ? 1 : state.currentSprint === 2 ? 1.15 : 1.25;
      const scaledMinutes = minutes <= 2 ? Math.max(1, Math.round(minutes * sprintPressure)) : minutes;
      const newMinutes = Math.min(state.dayTimeMinutes + scaledMinutes, 1080);

      let pomodoroRemaining = state.pomodoroMinutesRemaining;
      let pomodoroActive = state.pomodoroActive;

      if (pomodoroActive) {
        pomodoroRemaining = Math.max(pomodoroRemaining - scaledMinutes, 0);
        if (pomodoroRemaining === 0) {
          pomodoroActive = false;
        }
      }

      let nextTimeManagement = state.timeManagement;
      const newToasts: StatChangeToast[] = [];
      if (scaledMinutes >= 35 && !pomodoroActive) {
        nextTimeManagement = clamp(state.timeManagement - 4);
        if (nextTimeManagement !== state.timeManagement) {
          newToasts.push(
            makeStatToast('time_mgmt', 'Gestión Tiempo', -4, nextTimeManagement, 'TIME', false)
          );
        }
      }

      return {
        dayTimeMinutes: newMinutes,
        pomodoroMinutesRemaining: pomodoroRemaining,
        pomodoroActive,
        timeManagement: nextTimeManagement,
        recentStatChanges:
          newToasts.length > 0
            ? [...newToasts, ...state.recentStatChanges].slice(0, 14)
            : state.recentStatChanges,
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
    const baseStep = state.currentSprint === 1 ? 28 : state.currentSprint === 2 ? 22 : 20;

    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        if (t.status === 'TODO') {
          return { ...t, status: 'IN_PROGRESS', progressPercent: 25 };
        }
        if (t.status === 'IN_PROGRESS') {
          const step = Math.round(baseStep * velocity * (pomodoroActive ? 1.3 : 1.0));
          const nextProgress = Math.min(t.progressPercent + step, 100);
          state.advanceTime(18);
          if (nextProgress >= 100) {
            return { ...t, status: 'CODE_REVIEW', progressPercent: 100 };
          }
          return { ...t, progressPercent: nextProgress };
        }
        if (t.status === 'CODE_REVIEW') {
          state.updateTimeManagement(4);
          if (fiveCs.complementariedad >= 40) {
            state.advanceTime(15);
            return { ...t, status: 'DONE' };
          } else {
            state.addTechnicalDebt(15);
            state.advanceTime(25);
            return { ...t, status: 'DONE' };
          }
        }
        return t;
      }),
    }));

    const updatedState = get();
    const inProgressCount = updatedState.tasks.filter(
      (t) => t.act === updatedState.currentSprint && t.status === 'IN_PROGRESS'
    ).length;

    if (
      updatedState.currentSprint === 1 &&
      inProgressCount >= 3 &&
      !updatedState.triggeredInterruptions.includes('act1_int5_elena')
    ) {
      set((s) => ({
        triggeredInterruptions: [...s.triggeredInterruptions, 'act1_int5_elena'],
        pendingInterruptionNodeId: 'act1_int5_elena',
        activeModal: 'DIALOGUE',
      }));
      return;
    }

    const remaining = (ACT_INTERRUPTIONS[updatedState.currentSprint] || []).filter(
      (id) => !updatedState.triggeredInterruptions.includes(id)
    );
    if (remaining.length > 0 && Math.random() < 0.65) {
      updatedState.triggerNextSprintInterruption();
    }
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

  getAverageAffinity: () => {
    const a = get().affinities;
    return Math.round((a.elena + a.david + a.marcos + a.sofia + a.lucas) / 5);
  },

  getTeamVelocity: () => {
    const ice = get().getICE();
    let velocity = calculateTeamVelocity(ice);
    const state = get();
    if (state.pomodoroActive) {
      velocity *= 1.3;
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
    return calculateNegotiationProbability(baseOption, ie, fiveCs.comunicacion, hasToolBonus);
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

  captureSnapshot: (): GameStateSnapshot => {
    const state = get();
    return {
      emotionalIntelligence: state.emotionalIntelligence,
      fiveCs: { ...state.fiveCs },
      affinities: { ...state.affinities },
      teamStress: state.teamStress,
      timeManagement: state.timeManagement,
      interruptionHistory: [...state.interruptionHistory],
      triggeredInterruptions: [...state.triggeredInterruptions],
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
      affinities: snapshot.affinities ? { ...snapshot.affinities } : { ...INITIAL_AFFINITIES },
      teamStress: snapshot.teamStress ?? 50,
      timeManagement: snapshot.timeManagement ?? 50,
      interruptionHistory: snapshot.interruptionHistory ?? [],
      triggeredInterruptions: snapshot.triggeredInterruptions ?? [],
      pendingInterruptionNodeId: null,
      recentStatChanges: [],
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
      affinities: { ...INITIAL_AFFINITIES },
      teamStress: 50,
      timeManagement: 50,
      recentStatChanges: [],
      interruptionHistory: [],
      triggeredInterruptions: [],
      pendingInterruptionNodeId: null,
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