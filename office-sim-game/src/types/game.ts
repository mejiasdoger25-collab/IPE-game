/**
 * src/types/game.ts
 * Strict TypeScript interfaces and type definitions for Sprint Cero / DevLife RPG.
 */

// ==========================================
// 1. CORE PSYCHOLOGICAL METRICS, 5 Cs & AFFINITIES
// ==========================================

export interface FiveCMetrics {
  compromiso: number;        // C1: Commitment [0, 100]
  confianza: number;         // C2: Psychological safety / trust [0, 100]
  coordinacion: number;      // C3: Synchronization and workflow [0, 100]
  comunicacion: number;      // C4: Clarity and assertiveness [0, 100]
  complementariedad: number; // C5: Synergistic skill matching [0, 100]
}

export type FiveCKey = keyof FiveCMetrics;

export type NPCKey = 'elena' | 'david' | 'marcos' | 'sofia' | 'lucas';

export interface NPCAffinities {
  elena: number;  // Agile / Transparencia [0, 100]
  david: number;  // Negocio / Asertividad [0, 100]
  marcos: number; // Técnico / Lógica [0, 100]
  sofia: number;  // Diseño / Empatía [0, 100]
  lucas: number;  // Junior / Mentoría [0, 100]
}

export interface StatChangeToast {
  id: string;
  statKey: string;
  label: string;
  delta: number;
  newValue: number;
  category: 'IE' | '5C' | 'STRESS' | 'TIME' | 'AFFINITY';
  /** Invertir semántica visual para el Estrés (subir estrés es negativo) */
  isBeneficial: boolean;
  timestamp: number;
}

export interface InterruptionRecord {
  nodeId: string;
  title: string;
  speaker: string;
  act: SprintNumber;
  timeLostMinutes: number;
  optionChosen: string;
}

export type IEClimateTier =
  | 'EMPATHIC_SYNERGY'
  | 'PROFESSIONAL_CLIMATE'
  | 'HOSTILE_ENVIRONMENT';

export type CanonicalTimeTool = 'POMODORO' | 'EISENHOWER' | 'PARETO' | 'GANTT';
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
// 4. STAT MODIFIERS LAYER
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
  | 'FIRED_GAME_OVER'
  | 'BURNOUT_SOLITARY_WOLF'
  | 'EXPLOITED_PEOPLE_PLEASER'
  | 'SOLID_DEVELOPER'
  | 'TECH_LEAD_EXCELLENCE'
  | 'STARTUP_COFOUNDERS';

// ==========================================
// 6. QUEST & OBJECTIVE SYSTEM
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
  progressPercent: number;
  estimatedMinutes: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  technicalDebtRisk: number;
  assignedNpc?: string;
}

// ==========================================
// 8. CUSTOM SKINS & ASSET PIPELINE
// ==========================================

export interface SkinLayerItem {
  sprite: string;
  tint?: string;
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
// 9. SERIALIZATION & SAVES
// ==========================================

export interface GameStateSnapshot {
  emotionalIntelligence: number;
  fiveCs: FiveCMetrics;
  affinities?: NPCAffinities;
  teamStress?: number;
  timeManagement?: number;
  interruptionHistory?: InterruptionRecord[];
  triggeredInterruptions?: string[];
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