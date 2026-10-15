/**
 * src/state/useQuestStore.ts
 * Quest, Story Node, and Objective state machine for DevLife RPG / Sprint Cero.
 * Follows RPG Pattern 3: Event-driven quest/objective updates from game events.
 */

import { create } from 'zustand';
import type {
  Quest,
  QuestState,
  QuestEvent,
  QuestStateSnapshot,
  SprintNumber,
} from '../types/game';
import { useGameStore } from './useGameStore';

export const INITIAL_QUESTS: Record<string, Quest> = {
  quest_sprint_1: {
    id: 'quest_sprint_1',
    act: 1,
    title: 'Acto 1: Autenticación y Panel de Usuario (FinTrack 2.0)',
    description:
      'Inicia el Sprint 1. Participa en la Daily Stand-up, ayuda a Lucas con su bloqueo de tokens y supera la revisión de código con Marcos.',
    state: 'active',
    objectives: [
      {
        id: 'obj_1_1_daily',
        description: 'Participar en la Daily Stand-up con Elena y Lucas',
        done: false,
        count: 0,
        needed: 1,
        type: 'DIALOGUE_CHOICE',
        metadata: { nodeId: 'scene_1_1_daily' },
      },
      {
        id: 'obj_1_2_code_review',
        description: 'Revisar la Pull Request en la mesa de Marcos',
        done: false,
        count: 0,
        needed: 1,
        type: 'DIALOGUE_CHOICE',
        metadata: { nodeId: 'scene_1_2_marcos_pr' },
      },
      {
        id: 'obj_1_3_pomodoro_code',
        description: 'Trabajar en tu puesto de trabajo con enfoque Pomodoro',
        done: false,
        count: 0,
        needed: 1,
        type: 'TOOL_USE',
        metadata: { tool: 'POMODORO' },
      },
    ],
    rewards: {
      temporalMasteryPoints: 50,
      toolUnlock: 'POMODORO',
      ieBonus: 15,
      fiveCBonus: { coordinacion: 15, confianza: 15 },
    },
  },
  quest_sprint_2: {
    id: 'quest_sprint_2',
    act: 2,
    title: 'Acto 2: Motor de Pagos y Tempestad de "Scope Creep"',
    description:
      'David pide funciones imposibles a última hora. Utiliza la Matriz de Eisenhower y la Ley de Pareto para negociar, y media la disputa en la sala de reuniones.',
    state: 'available',
    objectives: [
      {
        id: 'obj_2_1_david_negotiate',
        description: 'Negociar el alcance comercial en el despacho de David',
        done: false,
        count: 0,
        needed: 1,
        type: 'DIALOGUE_CHOICE',
        metadata: { nodeId: 'scene_2_1_david_scope' },
      },
      {
        id: 'obj_2_2_meeting_war',
        description: 'Mediar el conflicto entre Sofía (UX) y Marcos (Backend)',
        done: false,
        count: 0,
        needed: 1,
        type: 'DIALOGUE_CHOICE',
        metadata: { nodeId: 'scene_2_2_meeting_war' },
      },
      {
        id: 'obj_2_3_sync_gantt',
        description: 'Sincronizar las dependencias del equipo en el Diagrama de Gantt',
        done: false,
        count: 0,
        needed: 1,
        type: 'TOOL_USE',
        metadata: { tool: 'GANTT' },
      },
    ],
    rewards: {
      temporalMasteryPoints: 100,
      toolUnlock: 'GANTT',
      ieBonus: 25,
      fiveCBonus: { coordinacion: 25, complementariedad: 25 },
    },
  },
  quest_sprint_3: {
    id: 'quest_sprint_3',
    act: 3,
    title: 'Acto 3: Viernes Negro y Despliegue Crítico a Producción',
    description:
      'El servidor de pre-producción colapsa 90 minutos antes de la demo bancaria. Moviliza a todo el equipo con responsabilidad compartida.',
    state: 'available',
    objectives: [
      {
        id: 'obj_3_1_black_friday',
        description: 'Liderar la resolución del fallo crítico en el rack de servidores',
        done: false,
        count: 0,
        needed: 1,
        type: 'DIALOGUE_CHOICE',
        metadata: { nodeId: 'scene_3_1_black_friday' },
      },
      {
        id: 'obj_3_2_sprint_retrospective',
        description: 'Completar la retrospectiva del Sprint y conocer tu destino en NovaSoft',
        done: false,
        count: 0,
        needed: 1,
        type: 'INTERACTION',
        metadata: { target: 'SPRINT_RETRO' },
      },
    ],
    rewards: {
      temporalMasteryPoints: 200,
      ieBonus: 30,
    },
  },
};

export interface QuestStoreState {
  quests: Record<string, Quest>;
  activeQuestId: string | null;
  activeStoryNodeId: string | null;
  completedStoryNodeIds: string[];
  dialogueHistory: Array<{ nodeId: string; optionId: string; timestamp: number }>;

  // Actions
  startQuest: (questId: string) => void;
  advanceObjective: (questId: string, objectiveId: string, amount?: number) => void;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;
  turnInQuest: (questId: string) => void;
  onGameEvent: (event: QuestEvent) => void;
  setActiveStoryNode: (nodeId: string | null) => void;
  recordDialogueChoice: (nodeId: string, optionId: string) => void;

  // Snapshot Persistence
  captureSnapshot: () => QuestStateSnapshot;
  loadSnapshot: (snapshot: QuestStateSnapshot) => void;
  resetQuests: () => void;
}

export const useQuestStore = create<QuestStoreState>((set, get) => ({
  quests: { ...INITIAL_QUESTS },
  activeQuestId: 'quest_sprint_1',
  activeStoryNodeId: null,
  completedStoryNodeIds: [],
  dialogueHistory: [],

  startQuest: (questId) =>
    set((state) => {
      const target = state.quests[questId];
      if (!target || target.state === 'active') return state;
      return {
        quests: {
          ...state.quests,
          [questId]: { ...target, state: 'active' },
        },
        activeQuestId: questId,
      };
    }),

  advanceObjective: (questId, objectiveId, amount = 1) =>
    set((state) => {
      const quest = state.quests[questId];
      if (!quest || quest.state !== 'active') return state;

      let allDone = true;
      const updatedObjectives = quest.objectives.map((obj) => {
        if (obj.id === objectiveId && !obj.done) {
          const nextCount = obj.count + amount;
          const isDone = nextCount >= obj.needed;
          if (!isDone) allDone = false;
          return { ...obj, count: nextCount, done: isDone };
        }
        if (!obj.done) allDone = false;
        return obj;
      });

      const nextState: QuestState = allDone ? 'complete' : 'active';

      // Auto-grant rewards if complete
      if (allDone && quest.rewards) {
        const game = useGameStore.getState();
        if (quest.rewards.temporalMasteryPoints) {
          game.addTemporalMasteryPoints(quest.rewards.temporalMasteryPoints);
        }
        if (quest.rewards.toolUnlock) {
          game.unlockTool(quest.rewards.toolUnlock);
        }
        if (quest.rewards.ieBonus) {
          game.updateIE(quest.rewards.ieBonus);
        }
        if (quest.rewards.fiveCBonus) {
          game.updateFiveC(quest.rewards.fiveCBonus);
        }
      }

      return {
        quests: {
          ...state.quests,
          [questId]: {
            ...quest,
            objectives: updatedObjectives,
            state: nextState,
          },
        },
      };
    }),

  completeQuest: (questId) =>
    set((state) => {
      const quest = state.quests[questId];
      if (!quest) return state;
      return {
        quests: {
          ...state.quests,
          [questId]: { ...quest, state: 'complete' },
        },
      };
    }),

  failQuest: (questId) =>
    set((state) => {
      const quest = state.quests[questId];
      if (!quest) return state;
      return {
        quests: {
          ...state.quests,
          [questId]: { ...quest, state: 'failed' },
        },
      };
    }),

  turnInQuest: (questId) =>
    set((state) => {
      const quest = state.quests[questId];
      if (!quest || quest.state !== 'complete') return state;

      // Unlock next sprint quest if applicable
      const nextAct = (quest.act + 1) as SprintNumber;
      const nextQuestId = `quest_sprint_${nextAct}`;
      const nextQuest = state.quests[nextQuestId];

      const updatedQuests = {
        ...state.quests,
        [questId]: { ...quest, state: 'turned_in' as QuestState },
      };

      if (nextQuest) {
        updatedQuests[nextQuestId] = { ...nextQuest, state: 'active' };
        useGameStore.getState().setSprint(nextAct);
      }

      return {
        quests: updatedQuests,
        activeQuestId: nextQuest ? nextQuestId : null,
      };
    }),

  /**
   * Event-driven objective matcher (RPG Pattern 3)
   */
  onGameEvent: (event: QuestEvent) => {
    const state = get();
    Object.values(state.quests).forEach((quest) => {
      if (quest.state !== 'active') return;

      quest.objectives.forEach((obj) => {
        if (obj.done) return;

        let matched = false;
        if (event.type === 'DIALOGUE_COMPLETE' && obj.type === 'DIALOGUE_CHOICE') {
          if (obj.metadata?.nodeId === event.payload['nodeId']) {
            matched = true;
          }
        } else if (event.type === 'TOOL_COMPLETED' && obj.type === 'TOOL_USE') {
          if (obj.metadata?.tool === event.payload['tool']) {
            matched = true;
          }
        } else if (event.type === 'INTERACT' && obj.type === 'INTERACTION') {
          if (obj.metadata?.target === event.payload['target']) {
            matched = true;
          }
        }

        if (matched) {
          get().advanceObjective(quest.id, obj.id, 1);
        }
      });
    });
  },

  setActiveStoryNode: (nodeId) =>
    set(() => ({
      activeStoryNodeId: nodeId,
    })),

  recordDialogueChoice: (nodeId, optionId) =>
    set((state) => ({
      completedStoryNodeIds: Array.from(
        new Set([...state.completedStoryNodeIds, nodeId])
      ),
      dialogueHistory: [
        ...state.dialogueHistory,
        { nodeId, optionId, timestamp: Date.now() },
      ],
    })),

  captureSnapshot: (): QuestStateSnapshot => {
    const state = get();
    return {
      quests: JSON.parse(JSON.stringify(state.quests)),
      activeQuestId: state.activeQuestId,
      activeStoryNodeId: state.activeStoryNodeId,
      completedStoryNodeIds: [...state.completedStoryNodeIds],
      dialogueHistory: [...state.dialogueHistory],
    };
  },

  loadSnapshot: (snapshot: QuestStateSnapshot) =>
    set(() => ({
      quests: { ...snapshot.quests },
      activeQuestId: snapshot.activeQuestId,
      activeStoryNodeId: snapshot.activeStoryNodeId,
      completedStoryNodeIds: [...snapshot.completedStoryNodeIds],
      dialogueHistory: [...snapshot.dialogueHistory],
    })),

  resetQuests: () =>
    set(() => ({
      quests: { ...INITIAL_QUESTS },
      activeQuestId: 'quest_sprint_1',
      activeStoryNodeId: null,
      completedStoryNodeIds: [],
      dialogueHistory: [],
    })),
}));
