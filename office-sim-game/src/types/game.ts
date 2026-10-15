/**
 * src/types/game.ts
 * Strict TypeScript interfaces and type definitions for Sprint Cero / DevLife RPG.
 * Zero untyped variables across Phaser, React, and Zustand stores.
 */

// ==========================================
// 1. CORE PSYCHOLOGICAL METRICS & THE 5 Cs
// ==========================================

export interface FiveCMetrics {
  compromiso: number;       // C1: Commitment [0, 100]
  confianza: number;        // C2: Psychological safety / trust [0, 100]
  coordinacion: number;     // C3: Synchronization and workflow [0, 100]
  comunicacion: number;     // C4: Clarity and assertiveness [0, 100]
  complementariedad: number;// C5: Synergistic skill matching [0, 100]
}

export type FiveCKey = keyof FiveCMetrics;

export type IEClimateTier =
  | 'EMPATHIC_SYNERGY'     // IE 75 - 100: +25% negotiation ease, spontaneous bug warnings
  | 'PROFESSIONAL_CLIMATE'  // IE 35 - 74: Neutral standard workplace atmosphere
  | 'HOSTILE_ENVIRONMENT';  // IE 0 - 34: Cold/harsh responses, strict PR rejections, hidden bugs

// Canonical uppercase tools
export type CanonicalTimeTool = 'POMODORO' | 'EISENHOWER' | 'PARETO' | 'GANTT';

// Flexible union for existing codebase compatibility (storyNodes.ts and EisenhowerMatrix.tsx)
export type TimeTool = CanonicalTimeTool | 'pomodoro' | 'eisenhower' | 'pareto' | 'gantt';
export type ProductivityTool = CanonicalTimeTool;

// ==========================================
// 2. TIME, WORKDAY & STRIKES
// ==========================================

export type SprintNumber = 1 | 2 | 3;
export type StrikeLevel = 0 | 1 | 2 | 3;

export interface WorkdayClockState {
  currentSprint: SprintNumber;
  dayTimeMinutes: number; // 540 (09:00) to 1080 (18:00)
  isPaused: boolean;
  pomodoroActive: boolean;
  pomodoroMinutesRemaining: number;
}

// ==========================================
// 3. PHASER <-> REACT INTERACTION BRIDGE
// ==========================================

export type InteractableType =
  | 'WORKSTATION'
  | 'SCRUM_BOARD'
  | 'NPC_SPAWN'
  | 'COFFEE_MACHINE'
  | 'MEETING_ROOM';

export interface ActiveInteractable {
  type: InteractableType | null;
  id: string | null;
  label: string | null;
  dialogueNodeId?: string | null;
}

export type ActiveModal =
  | 'NONE'
  | 'DIALOGUE'
  | 'WORKSTATION'
  | 'SCRUM_BOARD'
  | 'SKIN_CUSTOMIZER'
  | 'SPRINT_RETRO'
  | 'SETTINGS'
  | 'ENDING';

// ==========================================
// 4. STAT MODIFIERS LAYER (RPG Pattern 1)
// ==========================================

export interface StatModifier {
  id: string;
  target: FiveCKey | 'emotionalIntelligence' | 'velocity';
  type: 'flat' | 'percent';
  value: number;
  durationMinutes?: number;
  source: string;
}

// ==========================================
// 5. NARRATIVE, DIALOGUE & ENDINGS
// ==========================================

export type CommunicationStyle =
  | 'ASSERTIVE'
  | 'PASSIVE'
  | 'AGGRESSIVE'
  | 'ACTIVE_LISTENING'
  | 'EMPATHY'
  | 'INTEGRATIVE_NEGOTIATION'
  | 'INDIVIDUALIST'
  | 'SCAPEGOAT'
  | 'SHARED_LEADERSHIP';

export type EndingType =
  | 'FIRED_GAME_OVER'            // Strike 3 limit reached
  | 'BURNOUT_SOLITARY_WOLF'      // Strikes = 0, ICE < 35, IE < 35
  | 'EXPLOITED_PEOPLE_PLEASER'    // Accepted scope creep with 0 assertiveness
  | 'SOLID_DEVELOPER'            // Balanced survivor: IE 40-74, ICE 45-74, 2+ tools
  | 'TECH_LEAD_EXCELLENCE'       // IE >= 75, all 5Cs >= 75, all 4 tools
  | 'STARTUP_COFOUNDERS';         // 5Cs >= 90, stood firm against David's abuse

// ==========================================
// 6. QUEST & OBJECTIVE SYSTEM (RPG Pattern 3)
// ==========================================

export type QuestState = 'available' | 'active' | 'complete' | 'failed' | 'turned_in';

export type ObjectiveType =
  | 'INTERACTION'
  | 'DIALOGUE_CHOICE'
  | 'TOOL_USE'
  | 'TIMER_SURVIVAL'
  | 'CODE_REVIEW'
  | 'CUSTOM';

export interface QuestObjective {
  id: string;
  description: string;
  done: boolean;
  count: number;
  needed: number;
  type: ObjectiveType;
  metadata?: Record<string, unknown>;
}

export interface QuestRewards {
  temporalMasteryPoints?: number;
  toolUnlock?: CanonicalTimeTool;
  ieBonus?: number;
  fiveCBonus?: Partial<FiveCMetrics>;
}

export interface Quest {
  id: string;
  act: SprintNumber;
  title: string;
  description: string;
  state: QuestState;
  objectives: QuestObjective[];
  rewards?: QuestRewards;
}

export type QuestEventType =
  | 'INTERACT'
  | 'DIALOGUE_COMPLETE'
  | 'TOOL_COMPLETED'
  | 'TIME_PASSED'
  | 'STRIKE_ISSUED'
  | 'TASK_DONE'
  | 'CUSTOM';

export interface QuestEvent {
  type: QuestEventType;
  payload: Record<string, unknown>;
}

// ==========================================
// 7. KANBAN & SPRINT TASKS
// ==========================================

export type KanbanStatus = 'TODO' | 'IN_PROGRESS' | 'CODE_REVIEW' | 'DONE';

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  act: SprintNumber;
  status: KanbanStatus;
  progressPercent: number; // 0 to 100
  estimatedMinutes: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  technicalDebtRisk: number; // 0 to 100
  assignedNpc?: string;
}

// ==========================================
// 8. CUSTOM SKINS & ASSET PIPELINE (Phase 2)
// ==========================================

export interface SkinLayerItem {
  sprite: string;
  tint?: string; // Hex color code e.g. '#4A2E1B'
}

export interface SkinConfig {
  skinId: string;
  name: string;
  unlockCondition?: {
    metric: FiveCKey | 'emotionalIntelligence' | 'temporalMasteryPoints';
    min: number;
  };
  layers: {
    body: string;
    eyes?: string;
    hair?: SkinLayerItem;
    top?: SkinLayerItem;
    bottom?: SkinLayerItem;
    accessory?: string;
  };
}

// ==========================================
// 9. SERIALIZATION & SAVES (Save Pattern 1)
// ==========================================

export interface GameStateSnapshot {
  emotionalIntelligence: number;
  fiveCs: FiveCMetrics;
  strikes: StrikeLevel;
  currentSprint: SprintNumber;
  dayTimeMinutes: number;
  temporalMasteryPoints: number;
  unlockedTools: CanonicalTimeTool[];
  flags: Record<string, boolean | string | number>;
  activeModifiers: StatModifier[];
  ending: EndingType | null;
  skinConfig: SkinConfig;
  currentMapKey: string;
  technicalDebt: number;
  tasks?: KanbanTask[];
}

export interface QuestStateSnapshot {
  quests: Record<string, Quest>;
  activeQuestId: string | null;
  activeStoryNodeId: string | null;
  completedStoryNodeIds: string[];
  dialogueHistory: Array<{ nodeId: string; optionId: string; timestamp: number }>;
}

export interface GameSaveData {
  version: number;
  timestamp: number;
  slotId: string;
  game: GameStateSnapshot;
  quests: QuestStateSnapshot;
}
