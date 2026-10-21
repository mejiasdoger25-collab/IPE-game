/**
 * src/core/DialogueRunner.ts
 * Motor de diálogo con memoria persistente de decisiones para evitar que los NPCs
 * repitan preguntas ya respondidas y mantener la repercusión en la partida.
 */

import { useGameStore } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import { STORY_NODES, type StoryNode, type DialogueOption } from '../data/storyNodes';
import type { SprintNumber } from '../types/game';

export interface DialogueFeedbackDelta {
  label: string;
  value: number;
  isPositive: boolean;
}

export interface ChoiceExecutionResult {
  consequenceText: string;
  nextNodeId: string | null;
  returnModal?: 'WORKSTATION' | 'NONE';
  deltas: DialogueFeedbackDelta[];
  unlockedTool?: string;
  causedStrike?: number;
}

export class DialogueRunner {
  private static appliedTransitions = new Set<string>();

  public static getNode(nodeId: string): StoryNode | null {
    return STORY_NODES[nodeId] || null;
  }

  /**
   * Comprueba si un nodo de historia ya fue respondido anteriormente por el jugador
   */
  public static isNodeCompleted(nodeId: string): boolean {
    const quests = useQuestStore.getState();
    return quests.completedStoryNodeIds.includes(nodeId);
  }

  /**
   * Obtiene la opción que el jugador eligió en ese nodo para recordar su repercusión
   */
  public static getRecordedOption(nodeId: string): DialogueOption | null {
    const quests = useQuestStore.getState();
    const node = STORY_NODES[nodeId];
    if (!node) return null;

    const historyEntry = [...quests.dialogueHistory]
      .reverse()
      .find((h) => h.nodeId === nodeId);

    if (!historyEntry) return null;
    return node.options.find((o) => o.id === historyEntry.optionId) || null;
  }

  /**
   * Resuelve dinámicamente qué nodo de diálogo corresponde a cada NPC según el Sprint actual
   * y qué eventos aún no han sido respondidos.
   */
  public static resolveDynamicNodeForNPC(npcId: string, sprint: SprintNumber): string {
    const completed = useQuestStore.getState().completedStoryNodeIds;

    const candidatesByNpc: Record<string, Record<SprintNumber, string[]>> = {
      elena_scrum: {
        1: ['act1_daily', 'act1_int5_elena', 'scene_1_1_daily'],
        2: ['act2_daily'],
        3: ['act3_daily', 'act3_int1_bug'],
      },
      lucas_junior: {
        1: ['act1_int1_lucas', 'scene_1_1_daily'],
        2: ['act2_int3_lucas'],
        3: ['act3_int4_lucas'],
      },
      marcos_senior: {
        1: ['act1_int2_marcos', 'scene_1_2_marcos_pr'],
        2: ['act2_int4_marcos', 'act2_int1_conflict'],
        3: ['act3_int2_marcos'],
      },
      sofia_ux: {
        1: ['act1_int3_sofia'],
        2: ['act2_int1_conflict', 'scene_2_2_meeting_war'],
        3: ['act3_int3_sofia'],
      },
      david_po: {
        1: ['act1_int4_david'],
        2: ['act2_daily', 'act2_int2_david', 'scene_2_1_david_scope'],
        3: ['act3_int5_david', 'scene_3_1_black_friday'],
      },
    };

    const list = candidatesByNpc[npcId]?.[sprint] || ['act1_daily'];
    // Devuelve el primer nodo pendiente de este Sprint; si todos están hechos, devuelve el último para mostrar su repercusión
    const firstPending = list.find((id) => !completed.includes(id));
    return firstPending || list[list.length - 1];
  }

  public static getSpeakerLine(node: StoryNode): string {
    const ie = useGameStore.getState().getEffectiveIE();
    if (ie >= 60) return node.dialogueByIE.high;
    if (ie >= 40) return node.dialogueByIE.normal;
    return node.dialogueByIE.low;
  }

  public static isSelfRegulationRequired(node: StoryNode): boolean {
    if (this.isNodeCompleted(node.id)) return false;
    if (node.id !== 'scene_2_2_meeting_war' && node.id !== 'act2_int1_conflict') return false;
    const game = useGameStore.getState();
    const ie = game.getEffectiveIE();
    const hasConflict = Boolean(game.flags['OPEN_CONFLICT_BACKEND']) || game.teamStress >= 70;
    return ie < 40 || hasConflict;
  }

  public static executeOption(
    nodeId: string,
    option: DialogueOption
  ): ChoiceExecutionResult {
    const game = useGameStore.getState();
    const quests = useQuestStore.getState();
    const currentNode = STORY_NODES[nodeId];

    const alreadyCompleted =
      this.appliedTransitions.has(nodeId) || quests.completedStoryNodeIds.includes(nodeId);

    const deltas: DialogueFeedbackDelta[] = [];

    if (!alreadyCompleted) {
      this.appliedTransitions.add(nodeId);

      // 1. IE Delta
      if (option.ieDelta !== 0) {
        game.updateIE(option.ieDelta);
        deltas.push({
          label: 'EMPATÍA (IE)',
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
              label: `5C ${key.toUpperCase()}`,
              value: val,
              isPositive: val > 0,
            });
          }
        });
      }

      // 3. NPC Affinities Deltas
      if (option.affinityDelta) {
        game.updateAffinities(option.affinityDelta);
        Object.entries(option.affinityDelta).forEach(([npc, val]) => {
          if (val && val !== 0) {
            deltas.push({
              label: `AFINIDAD ${npc.toUpperCase()}`,
              value: val,
              isPositive: val > 0,
            });
          }
        });
      }

      // 4. Barra de Estrés del Equipo
      if (option.stressDelta && option.stressDelta !== 0) {
        game.updateStress(option.stressDelta);
        deltas.push({
          label: 'ESTRÉS EQUIPO',
          value: option.stressDelta,
          isPositive: option.stressDelta < 0,
        });
      }

      // 5. Gestión del Tiempo
      if (option.timeManagementDelta && option.timeManagementDelta !== 0) {
        game.updateTimeManagement(option.timeManagementDelta);
        deltas.push({
          label: 'TIEMPO',
          value: option.timeManagementDelta,
          isPositive: option.timeManagementDelta > 0,
        });
      }

      // 6. Workday Time Cost
      if (option.timeCostMinutes > 0) {
        game.advanceTime(option.timeCostMinutes);
      }

      // 7. Registrar Interrupción o decisión de nodo
      if (currentNode?.isInterruption) {
        game.recordInterruption({
          nodeId,
          title: currentNode.title,
          speaker: currentNode.speaker,
          act: currentNode.act,
          timeLostMinutes: option.timeCostMinutes,
          optionChosen: option.styleTag,
        });
      } else {
        // También marcar nodos de Daily como procesados
        game.recordInterruption({
          nodeId,
          title: currentNode?.title || nodeId,
          speaker: currentNode?.speaker || 'Equipo',
          act: currentNode?.act || game.currentSprint,
          timeLostMinutes: option.timeCostMinutes,
          optionChosen: option.styleTag,
        });
      }

      // 8. Flags
      if (option.setsFlag) {
        game.setFlag(option.setsFlag, true);
      }

      // 9. Tool Unlocks
      if (option.unlocksTool) {
        game.unlockTool(option.unlocksTool);
      }

      // 10. Strikes
      if (option.causesStrike && option.causesStrike > 0) {
        for (let i = 0; i < option.causesStrike; i++) {
          game.addStrike();
        }
      }

      // 11. Ending Evaluation Trigger
      if (option.triggersEndingEvaluation) {
        const ending = game.evaluateCurrentEnding();
        game.triggerEnding(ending);
      }

      // 12. Record choice permanently in QuestStore
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
      returnModal: currentNode?.returnModal,
      deltas,
      unlockedTool: option.unlocksTool,
      causedStrike: option.causesStrike,
    };
  }

  public static resetTransitions(): void {
    this.appliedTransitions.clear();
  }
}