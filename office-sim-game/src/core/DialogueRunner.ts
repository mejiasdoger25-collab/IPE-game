/**
 * src/core/DialogueRunner.ts
 * Sandboxed dialogue graph runner for Sprint Cero / DevLife RPG.
 * Follows:
 * - skills/dialogue-systems/SKILL.md: Safe state mutations on transition, preventing double deltas
 * - skills/visual-novel/SKILL.md: Dynamic IE branching, internal monologues, and visual feedback toasts
 */

import { useGameStore } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import { STORY_NODES, type StoryNode, type DialogueOption } from '../data/storyNodes';

export interface DialogueFeedbackDelta {
  label: string;
  value: number;
  isPositive: boolean;
}

export interface ChoiceExecutionResult {
  consequenceText: string;
  nextNodeId: string | null;
  deltas: DialogueFeedbackDelta[];
  unlockedTool?: string;
  causedStrike?: number;
}

export class DialogueRunner {
  // Set to prevent double-applying deltas if a node transition is repeated
  private static appliedTransitions = new Set<string>();

  /**
   * Retrieves the current story node by ID.
   */
  public static getNode(nodeId: string): StoryNode | null {
    return STORY_NODES[nodeId] || null;
  }

  /**
   * Resolves dynamic speaker text based on the player's current Emotional Intelligence (IE).
   * - high: IE >= 60
   * - normal: IE 40 - 59
   * - low: IE < 40
   */
  public static getSpeakerLine(node: StoryNode): string {
    const ie = useGameStore.getState().getEffectiveIE();
    if (ie >= 60) return node.dialogueByIE.high;
    if (ie >= 40) return node.dialogueByIE.normal;
    return node.dialogueByIE.low;
  }

  /**
   * Checks if an emotional self-regulation pre-step is required
   * (e.g. entering conflict scene 2.2 with IE < 40 or active OPEN_CONFLICT_BACKEND flag).
   */
  public static isSelfRegulationRequired(node: StoryNode): boolean {
    if (node.id !== 'scene_2_2_meeting_war') return false;
    const game = useGameStore.getState();
    const ie = game.getEffectiveIE();
    const hasConflict = Boolean(game.flags['OPEN_CONFLICT_BACKEND']);
    return ie < 40 || hasConflict;
  }

  /**
   * Executes a dialogue option, safely mutating state, unlocking tools, and triggering events.
   */
  public static executeOption(
    nodeId: string,
    option: DialogueOption
  ): ChoiceExecutionResult {
    const transitionKey = `${nodeId}->${option.id}`;
    const game = useGameStore.getState();
    const quests = useQuestStore.getState();

    const deltas: DialogueFeedbackDelta[] = [];

    // Guard against double applying state mutations
    if (!this.appliedTransitions.has(transitionKey)) {
      this.appliedTransitions.add(transitionKey);

      // 1. IE Delta
      if (option.ieDelta !== 0) {
        game.updateIE(option.ieDelta);
        deltas.push({
          label: 'Inteligencia Emocional (IE)',
          value: option.ieDelta,
          isPositive: option.ieDelta > 0,
        });
      }

      // 2. 5 Cs Deltas
      if (option.fiveCDelta) {
        game.updateFiveC(option.fiveCDelta);
        Object.entries(option.fiveCDelta).forEach(([key, val]) => {
          if (val && val !== 0) {
            deltas.push({
              label: `C: ${key.toUpperCase()}`,
              value: val,
              isPositive: val > 0,
            });
          }
        });
      }

      // 3. Workday Time Cost
      if (option.timeCostMinutes > 0) {
        game.advanceTime(option.timeCostMinutes);
      }

      // 4. Flags
      if (option.setsFlag) {
        game.setFlag(option.setsFlag, true);
      }

      // 5. Tool Unlocks
      if (option.unlocksTool) {
        game.unlockTool(option.unlocksTool);
      }

      // 6. Strikes
      if (option.causesStrike && option.causesStrike > 0) {
        for (let i = 0; i < option.causesStrike; i++) {
          game.addStrike();
        }
      }

      // 7. Ending Evaluation Trigger
      if (option.triggersEndingEvaluation) {
        const ending = game.evaluateCurrentEnding();
        game.triggerEnding(ending);
      }

      // 8. Record choice and trigger Quest Event Machine
      quests.recordDialogueChoice(nodeId, option.id);
      quests.onGameEvent({
        type: 'DIALOGUE_COMPLETE',
        payload: {
          nodeId,
          optionId: option.id,
          styleTag: option.styleTag,
        },
      });
    }

    return {
      consequenceText: option.consequenceText,
      nextNodeId: option.nextNodeId || null,
      deltas,
      unlockedTool: option.unlocksTool,
      causedStrike: option.causesStrike,
    };
  }

  /**
   * Resets transition cache upon new game or reload
   */
  public static resetTransitions(): void {
    this.appliedTransitions.clear();
  }
}
