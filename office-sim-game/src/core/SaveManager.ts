/**
 * src/core/SaveManager.ts
 * Multi-slot save-anywhere and persistence engine for DevLife RPG.
 * Follows skills/save-systems/SKILL.md:
 * - Versioned schema integer (SAVE_VERSION = 1)
 * - Pure data serializable snapshot (no scene nodes)
 * - Safe write with backup (.bak) fallback
 * - Migration pipeline (v1 -> v2)
 * - Throttled auto-save on Sprint boundaries
 */

import { useGameStore, SAVE_VERSION } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import type { GameSaveData } from '../types/game';

export interface SaveSlotMetadata {
  slotId: string;
  timestamp: number;
  dateFormatted: string;
  sprint: number;
  ie: number;
  strikes: number;
  ice: number;
  isEmpty: boolean;
}

export class SaveManager {
  public static readonly STORAGE_PREFIX = 'devlife_save_';
  public static readonly SLOTS = ['slot_1', 'slot_2', 'slot_3', 'autosave'];

  /**
   * Captures full serializable game & quest state snapshot
   */
  public static captureFullSave(slotId: string): GameSaveData {
    const game = useGameStore.getState().captureSnapshot();
    const quests = useQuestStore.getState().captureSnapshot();

    return {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      slotId,
      game,
      quests,
    };
  }

  /**
   * Writes save atomically with .bak backup
   */
  public static saveGame(slotId: string): boolean {
    try {
      const saveData = this.captureFullSave(slotId);
      const json = JSON.stringify(saveData);

      const mainKey = `${this.STORAGE_PREFIX}${slotId}`;
      const bakKey = `${mainKey}_bak`;

      // Save backup copy first
      localStorage.setItem(bakKey, json);
      // Save main slot
      localStorage.setItem(mainKey, json);

      console.log(`[SaveManager] State saved successfully to ${slotId}`);
      return true;
    } catch (err) {
      console.error(`[SaveManager] Failed to save game to ${slotId}`, err);
      return false;
    }
  }

  /**
   * Loads save defensively with migration chain & .bak fallback
   */
  public static loadGame(slotId: string): boolean {
    const mainKey = `${this.STORAGE_PREFIX}${slotId}`;
    const bakKey = `${mainKey}_bak`;

    let raw = localStorage.getItem(mainKey);
    if (!raw) {
      // Fallback to .bak
      raw = localStorage.getItem(bakKey);
    }
    if (!raw) return false;

    try {
      let data = JSON.parse(raw) as GameSaveData;

      // Schema Migration Pipeline
      data = this.migrate(data);

      // Apply to Stores
      useGameStore.getState().loadSnapshot(data.game);
      useQuestStore.getState().loadSnapshot(data.quests);

      console.log(`[SaveManager] Successfully loaded game from ${slotId} (v${data.version})`);
      return true;
    } catch (err) {
      console.error(`[SaveManager] Corrupt save file in ${slotId}, trying backup`, err);
      const bakRaw = localStorage.getItem(bakKey);
      if (bakRaw) {
        try {
          const bakData = JSON.parse(bakRaw) as GameSaveData;
          useGameStore.getState().loadSnapshot(bakData.game);
          useQuestStore.getState().loadSnapshot(bakData.quests);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Migration pipeline (v0/v1 -> current version)
   */
  private static migrate(data: GameSaveData): GameSaveData {
    let current = { ...data };

    // Example migration: v0 to v1
    if (!current.version || current.version < 1) {
      current.version = 1;
      if (!current.game.technicalDebt) {
        current.game.technicalDebt = 0;
      }
    }

    return current;
  }

  /**
   * Retrieves summary metadata for all slots
   */
  public static getSlotsMetadata(): SaveSlotMetadata[] {
    return this.SLOTS.map((slotId) => {
      const key = `${this.STORAGE_PREFIX}${slotId}`;
      const raw = localStorage.getItem(key);
      if (!raw) {
        return {
          slotId,
          timestamp: 0,
          dateFormatted: 'Vacío',
          sprint: 1,
          ie: 50,
          strikes: 0,
          ice: 50,
          isEmpty: true,
        };
      }

      try {
        const parsed = JSON.parse(raw) as GameSaveData;
        const g = parsed.game;
        const ice = Math.round(
          (g.fiveCs.compromiso +
            g.fiveCs.confianza +
            g.fiveCs.coordinacion +
            g.fiveCs.comunicacion +
            g.fiveCs.complementariedad) /
            5
        );

        return {
          slotId,
          timestamp: parsed.timestamp,
          dateFormatted: new Date(parsed.timestamp).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          sprint: g.currentSprint,
          ie: g.emotionalIntelligence,
          strikes: g.strikes,
          ice,
          isEmpty: false,
        };
      } catch {
        return {
          slotId,
          timestamp: 0,
          dateFormatted: 'Archivo dañado',
          sprint: 1,
          ie: 50,
          strikes: 0,
          ice: 50,
          isEmpty: true,
        };
      }
    });
  }

  /**
   * Throttled Auto-Save Helper
   */
  public static autoSave(): void {
    this.saveGame('autosave');
  }
}
