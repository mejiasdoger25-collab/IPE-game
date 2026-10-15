/**
 * src/core/NPCController.ts
 * Controlador de IA para los 5 compañeros de oficina con Skins Pokémon 2D generadas por SkinBuilder.
 */

import Phaser from 'phaser';
import { useGameStore } from '../state/useGameStore';
import { NPCS } from '../data/npcs';
import { SkinBuilder } from './SkinBuilder';
import type { IEClimateTier } from '../types/game';

export type NPCState =
  | 'IDLE_WORK'
  | 'PATROL_WALK'
  | 'COFFEE_BREAK'
  | 'BOARD_CHECK'
  | 'PAUSED_NEAR_PLAYER'
  | 'DAVID_MICROMANAGING';

export interface Waypoint {
  x: number;
  y: number;
  waitTimeMs: number;
  state: NPCState;
  facing?: 'up' | 'down' | 'left' | 'right';
  actionName?: string;
}

export interface NPCAgent {
  id: string;
  name: string;
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  dialogueNodeId: string;
  waypoints: Waypoint[];
  currentWaypointIndex: number;
  state: NPCState;
  stateTimerMs: number;
  bubbleContainer: Phaser.GameObjects.Container;
  bubbleBg: Phaser.GameObjects.Graphics;
  bubbleText: Phaser.GameObjects.Text;
  bubbleTimerMs: number;
  nameTag: Phaser.GameObjects.Text;
  statusBadge?: Phaser.GameObjects.Text;
  baseDeskPos: { x: number; y: number };
}

export class NPCController {
  private scene: Phaser.Scene;
  private npcs: Map<string, NPCAgent> = new Map();
  private barkCycleTimerMs = 7000;
  private wallsColliderGroup?: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public preload(): void {
    // Las skins de los 5 NPCs se generan proceduralmente en alta calidad con SkinBuilder
  }

  public create(wallsGroup?: Phaser.Physics.Arcade.StaticGroup): void {
    this.wallsColliderGroup = wallsGroup;
    // Registrar las texturas y animaciones de los 5 NPCs (elena_scrum, david_po, etc.)
    SkinBuilder.registerAllNPCsInPhaser(this.scene);
    this.spawnAgents();
  }

  private spawnAgents(): void {
    const schedules: Record<
      string,
      {
        startPos: { x: number; y: number };
        deskPos: { x: number; y: number };
        dialogueNodeId: string;
        name: string;
        roleBadge: string;
        badgeColor: string;
        waypoints: Waypoint[];
      }
    > = {
      elena_scrum: {
        name: 'Elena',
        roleBadge: 'Scrum Master',
        badgeColor: '#EC4899',
        startPos: { x: 480, y: 135 },
        deskPos: { x: 480, y: 135 },
        dialogueNodeId: 'scene_1_1_daily',
        waypoints: [
          { x: 480, y: 135, waitTimeMs: 7000, state: 'BOARD_CHECK', facing: 'up', actionName: 'Revisando Pizarra Scrum' },
          { x: 384, y: 260, waitTimeMs: 5000, state: 'PATROL_WALK', facing: 'down', actionName: 'Apoyando a Lucas' },
          { x: 560, y: 490, waitTimeMs: 8000, state: 'IDLE_WORK', facing: 'down', actionName: 'En Sala de Reuniones' },
          { x: 480, y: 220, waitTimeMs: 4000, state: 'PATROL_WALK', facing: 'up', actionName: 'Coordinando Sprint' },
        ],
      },
      lucas_junior: {
        name: 'Lucas',
        roleBadge: 'Junior Dev',
        badgeColor: '#10B981',
        startPos: { x: 384, y: 245 },
        deskPos: { x: 384, y: 245 },
        dialogueNodeId: 'scene_1_1_daily',
        waypoints: [
          { x: 384, y: 245, waitTimeMs: 10000, state: 'IDLE_WORK', facing: 'up', actionName: 'Depurando tokens JWT' },
          { x: 140, y: 460, waitTimeMs: 6000, state: 'COFFEE_BREAK', facing: 'up', actionName: 'Tomando café nervioso' },
          { x: 640, y: 255, waitTimeMs: 5000, state: 'PATROL_WALK', facing: 'right', actionName: 'Consultando a Marcos' },
        ],
      },
      marcos_senior: {
        name: 'Marcos',
        roleBadge: 'Sr. Backend',
        badgeColor: '#EF4444',
        startPos: { x: 672, y: 245 },
        deskPos: { x: 672, y: 245 },
        dialogueNodeId: 'scene_1_2_marcos_pr',
        waypoints: [
          { x: 672, y: 245, waitTimeMs: 13000, state: 'IDLE_WORK', facing: 'up', actionName: 'Optimizando SQL' },
          { x: 160, y: 130, waitTimeMs: 7000, state: 'BOARD_CHECK', facing: 'up', actionName: 'Revisando Racks de Servidores' },
          { x: 140, y: 460, waitTimeMs: 4500, state: 'COFFEE_BREAK', facing: 'up', actionName: 'Espresso doble' },
        ],
      },
      sofia_ux: {
        name: 'Sofía',
        roleBadge: 'UX / UI',
        badgeColor: '#8B5CF6',
        startPos: { x: 528, y: 375 },
        deskPos: { x: 528, y: 375 },
        dialogueNodeId: 'scene_2_2_meeting_war',
        waypoints: [
          { x: 528, y: 375, waitTimeMs: 10000, state: 'IDLE_WORK', facing: 'up', actionName: 'Diseñando en Figma' },
          { x: 480, y: 135, waitTimeMs: 5000, state: 'BOARD_CHECK', facing: 'up', actionName: 'Viendo historias de usuario' },
          { x: 560, y: 490, waitTimeMs: 7000, state: 'IDLE_WORK', facing: 'down', actionName: 'Revisión de Diseño' },
        ],
      },
      david_po: {
        name: 'David',
        roleBadge: 'Product Owner',
        badgeColor: '#F59E0B',
        startPos: { x: 800, y: 150 },
        deskPos: { x: 800, y: 150 },
        dialogueNodeId: 'scene_2_1_david_scope',
        waypoints: [
          { x: 800, y: 150, waitTimeMs: 11000, state: 'IDLE_WORK', facing: 'down', actionName: 'Al teléfono con el Banco' },
          { x: 560, y: 490, waitTimeMs: 6000, state: 'PATROL_WALK', facing: 'down', actionName: 'Preparando Demo' },
          { x: 480, y: 135, waitTimeMs: 5000, state: 'BOARD_CHECK', facing: 'up', actionName: 'Metiendo presión al Sprint' },
        ],
      },
    };

    Object.entries(schedules).forEach(([id, config]) => {
      const sprite = this.scene.physics.add.sprite(
        config.startPos.x,
        config.startPos.y,
        id
      );
      sprite.setCollideWorldBounds(true);
      sprite.setImmovable(true);
      sprite.body.setSize(20, 18);
      sprite.body.setOffset(6, 12);
      sprite.play(`${id}-idle-down`);

      if (this.wallsColliderGroup) {
        this.scene.physics.add.collider(sprite, this.wallsColliderGroup);
      }

      // Etiqueta de nombre con estética RPG clásica
      const nameTag = this.scene.add.text(
        config.startPos.x,
        config.startPos.y - 22,
        `${config.name} · ${config.roleBadge}`,
        {
          fontFamily: 'Inter, monospace, sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#FFFFFF',
          backgroundColor: '#1E293BD9',
          padding: { x: 6, y: 2 },
        }
      );
      nameTag.setOrigin(0.5);
      nameTag.setDepth(config.startPos.y + 10);

      // Contenedor de bocadillo de diálogo flotante
      const bubbleContainer = this.scene.add.container(config.startPos.x, config.startPos.y - 44);
      bubbleContainer.setDepth(9998);
      bubbleContainer.setVisible(false);

      const bubbleBg = this.scene.add.graphics();
      const bubbleText = this.scene.add.text(0, 0, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '10px',
        color: '#0F172A',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 145 },
      });
      bubbleText.setOrigin(0.5);
      bubbleContainer.add([bubbleBg, bubbleText]);

      const agent: NPCAgent = {
        id,
        name: config.name,
        sprite,
        dialogueNodeId: config.dialogueNodeId,
        waypoints: config.waypoints,
        currentWaypointIndex: 0,
        state: 'IDLE_WORK',
        stateTimerMs: config.waypoints[0].waitTimeMs,
        bubbleContainer,
        bubbleBg,
        bubbleText,
        bubbleTimerMs: 0,
        nameTag,
        baseDeskPos: config.deskPos,
      };

      this.npcs.set(id, agent);
    });
  }

  public update(delta: number, playerX: number, playerY: number, isModalOpen: boolean): void {
    const game = useGameStore.getState();
    const davidSupervising = game.davidSupervising;
    const ieClimate = game.getIEClimate();

    this.barkCycleTimerMs -= delta;
    if (this.barkCycleTimerMs <= 0) {
      this.triggerRandomAmbientBark(ieClimate, playerX, playerY);
      this.barkCycleTimerMs = 7500 + Math.random() * 5000;
    }

    this.npcs.forEach((agent) => {
      agent.sprite.setDepth(agent.sprite.y);
      agent.nameTag.setPosition(agent.sprite.x, agent.sprite.y - 22);
      agent.nameTag.setDepth(agent.sprite.y + 5);

      if (agent.bubbleContainer.visible) {
        agent.bubbleContainer.setPosition(agent.sprite.x, agent.sprite.y - 44);
        agent.bubbleTimerMs -= delta;
        if (agent.bubbleTimerMs <= 0) {
          agent.bubbleContainer.setVisible(false);
        }
      }

      const distToPlayer = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        agent.sprite.x,
        agent.sprite.y
      );

      // Consecuencia Strike 2: David supervisando tu mesa
      if (agent.id === 'david_po' && davidSupervising) {
        agent.state = 'DAVID_MICROMANAGING';
        const targetX = 250;
        const targetY = 240;
        const distToSpot = Phaser.Math.Distance.Between(
          agent.sprite.x,
          agent.sprite.y,
          targetX,
          targetY
        );

        if (distToSpot > 12) {
          this.moveTowards(agent, targetX, targetY, 70);
        } else {
          agent.sprite.setVelocity(0, 0);
          this.faceTarget(agent, playerX, playerY);
          if (!agent.statusBadge) {
            agent.statusBadge = this.scene.add.text(
              agent.sprite.x,
              agent.sprite.y - 36,
              '⚠️ Supervisión Directa',
              {
                fontFamily: 'Inter, sans-serif',
                fontSize: '9px',
                fontStyle: 'bold',
                color: '#FFFFFF',
                backgroundColor: '#DC2626',
                padding: { x: 5, y: 2 },
              }
            );
            agent.statusBadge.setOrigin(0.5);
            agent.statusBadge.setDepth(9999);
          } else {
            agent.statusBadge.setPosition(agent.sprite.x, agent.sprite.y - 36);
          }
        }
        return;
      }

      if (isModalOpen || distToPlayer < 60) {
        agent.sprite.setVelocity(0, 0);
        this.faceTarget(agent, playerX, playerY);
        return;
      }

      const wp = agent.waypoints[agent.currentWaypointIndex];
      if (agent.state === 'PATROL_WALK') {
        const distToWp = Phaser.Math.Distance.Between(
          agent.sprite.x,
          agent.sprite.y,
          wp.x,
          wp.y
        );

        if (distToWp > 10) {
          this.moveTowards(agent, wp.x, wp.y, 48);
        } else {
          agent.sprite.setVelocity(0, 0);
          agent.state = wp.state;
          agent.stateTimerMs = wp.waitTimeMs;
          if (wp.facing) {
            agent.sprite.play(`${agent.id}-idle-${wp.facing}`, true);
          }
        }
      } else {
        agent.stateTimerMs -= delta;
        if (agent.stateTimerMs <= 0) {
          agent.currentWaypointIndex = (agent.currentWaypointIndex + 1) % agent.waypoints.length;
          agent.state = 'PATROL_WALK';
        }
      }
    });
  }

  private moveTowards(agent: NPCAgent, targetX: number, targetY: number, speed: number): void {
    const dx = targetX - agent.sprite.x;
    const dy = targetY - agent.sprite.y;
    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    agent.sprite.setVelocity(vx, vy);

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) agent.sprite.play(`${agent.id}-walk-right`, true);
      else agent.sprite.play(`${agent.id}-walk-left`, true);
    } else {
      if (dy > 0) agent.sprite.play(`${agent.id}-walk-down`, true);
      else agent.sprite.play(`${agent.id}-walk-up`, true);
    }
  }

  private faceTarget(agent: NPCAgent, targetX: number, targetY: number): void {
    const dx = targetX - agent.sprite.x;
    const dy = targetY - agent.sprite.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) agent.sprite.play(`${agent.id}-idle-right`, true);
      else agent.sprite.play(`${agent.id}-idle-left`, true);
    } else {
      if (dy > 0) agent.sprite.play(`${agent.id}-idle-down`, true);
      else agent.sprite.play(`${agent.id}-idle-up`, true);
    }
  }

  public showSpeechBubble(npcId: string, text: string, durationMs = 4000): void {
    const agent = this.npcs.get(npcId);
    if (!agent) return;

    agent.bubbleText.setText(text);
    const bounds = agent.bubbleText.getBounds();

    agent.bubbleBg.clear();
    // Caja de diálogo estilo Pokémon GBA (borde doble azulado/oscuro y fondo crema limpio)
    agent.bubbleBg.fillStyle(0xFFFFFF, 0.98);
    agent.bubbleBg.lineStyle(2, 0x1E293B, 1.0);
    agent.bubbleBg.fillRoundedRect(
      -bounds.width / 2 - 9,
      -bounds.height / 2 - 6,
      bounds.width + 18,
      bounds.height + 12,
      6
    );
    agent.bubbleBg.strokeRoundedRect(
      -bounds.width / 2 - 9,
      -bounds.height / 2 - 6,
      bounds.width + 18,
      bounds.height + 12,
      6
    );

    agent.bubbleBg.fillTriangle(
      -4, bounds.height / 2 + 6,
      4, bounds.height / 2 + 6,
      0, bounds.height / 2 + 11
    );

    agent.bubbleContainer.setPosition(agent.sprite.x, agent.sprite.y - 44);
    agent.bubbleContainer.setVisible(true);
    agent.bubbleTimerMs = durationMs;
  }

  private triggerRandomAmbientBark(
    ieClimate: IEClimateTier,
    playerX: number,
    playerY: number
  ): void {
    const agentsArray = Array.from(this.npcs.values());
    const nearby = agentsArray.filter(
      (a) => Phaser.Math.Distance.Between(a.sprite.x, a.sprite.y, playerX, playerY) < 420
    );
    const pool = nearby.length > 0 ? nearby : agentsArray;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    const profile = NPCS[chosen.id];
    if (!profile) return;

    const barks = profile.ambientBarks[ieClimate];
    if (barks && barks.length > 0) {
      const line = barks[Math.floor(Math.random() * barks.length)];
      this.showSpeechBubble(chosen.id, line);
    }
  }

  public getNPCSprites(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] {
    return Array.from(this.npcs.values()).map((a) => a.sprite);
  }

  public getNearestNPC(
    x: number,
    y: number,
    maxDist = 65
  ): { id: string; name: string; dialogueNodeId: string; x: number; y: number } | null {
    let closest: NPCAgent | null = null;
    let minDist = maxDist;

    this.npcs.forEach((agent) => {
      const dist = Phaser.Math.Distance.Between(x, y, agent.sprite.x, agent.sprite.y);
      if (dist < minDist) {
        minDist = dist;
        closest = agent;
      }
    });

    if (!closest) return null;
    const a = closest as NPCAgent;
    return {
      id: a.id,
      name: a.name,
      dialogueNodeId: a.dialogueNodeId,
      x: a.sprite.x,
      y: a.sprite.y,
    };
  }
}