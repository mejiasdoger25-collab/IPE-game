/**
 * src/core/OfficeScene.ts
 * Escena 2D Top-Down estilo Pokémon GBA / Silph Co. Lab.
 * Incluye generador de tileset pixel-art detallado, estaciones de trabajo iluminadas,
 * alfombras por departamento, plantas decorativas, racks de servidores y colisiones precisas.
 */

import Phaser from 'phaser';
import { useGameStore } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import { SkinBuilder } from './SkinBuilder';
import { NPCController } from './NPCController';
import { AudioManager } from './AudioManager';
import { FeedbackManager } from './FeedbackManager';
import type { InteractableType, ActiveInteractable } from '../types/game';

interface SceneInteractable {
  x: number;
  y: number;
  width: number;
  height: number;
  type: InteractableType;
  id: string;
  label: string;
  dialogueNodeId?: string;
}

export class OfficeScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;

  private interactables: SceneInteractable[] = [];
  private currentNearInteractable: SceneInteractable | null = null;
  private promptText!: Phaser.GameObjects.Text;
  private promptBg!: Phaser.GameObjects.Graphics;
  private promptContainer!: Phaser.GameObjects.Container;
  private currentMapKey = 'startup';

  private npcController!: NPCController;
  private lastFacingDirection: 'up' | 'down' | 'left' | 'right' = 'down';
  private unsubscribeStore?: () => void;

  constructor() {
    super({ key: 'OfficeScene' });
  }

  public init(): void {
    this.interactables = [];
    this.currentNearInteractable = null;
    this.currentMapKey = useGameStore.getState().currentMapKey || 'startup';
    this.npcController = new NPCController(this);
  }

  public preload(): void {
    this.npcController.preload();
    this.generatePokemonStyleTileset();
  }

  public create(): void {
    const mapWidth = 960;
    const mapHeight = 640;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // 1. Construir el mapa estilo Laboratorio Pokémon 2D
    this.buildPokemonStyleOffice();

    // 2. Registrar Skin del Jugador
    SkinBuilder.registerInPhaser(this, useGameStore.getState().skinConfig, 'player_custom_skin');

    // 3. Crear Jugador
    this.createPlayer();

    // 4. Crear los 5 NPCs con sus skins propias
    this.npcController.create(this.wallsGroup);

    const npcs = this.npcController.getNPCSprites();
    npcs.forEach((npcSprite) => {
      this.physics.add.collider(this.player, npcSprite);
    });

    // 5. Controles, Cámara y UI flotante
    this.setupInput();
    this.setupCamera();
    this.setupFloatingPrompt();

    // 6. Suscripción reactiva para cambios de Skin o Mapa en vivo
    this.unsubscribeStore = useGameStore.subscribe((state, prevState) => {
      if (state.currentMapKey !== prevState.currentMapKey) {
        this.currentMapKey = state.currentMapKey;
        this.scene.restart();
      }
      if (state.skinConfig !== prevState.skinConfig && this.player) {
        SkinBuilder.registerInPhaser(this, state.skinConfig, 'player_custom_skin');
        this.player.setTexture('player_custom_skin');
        this.playPlayerIdle();
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.unsubscribeStore) this.unsubscribeStore();
    });
  }

  public update(_time: number, delta: number): void {
    if (!this.player || !this.player.body) return;

    const gameStore = useGameStore.getState();
    const isModalOpen = gameStore.activeModal !== 'NONE';

    if (isModalOpen) {
      this.player.setVelocity(0, 0);
      this.promptContainer.setVisible(false);
      this.playPlayerIdle();
      this.npcController.update(delta, this.player.x, this.player.y, true);
      return;
    }

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;

    const speed = 165 * gameStore.getTeamVelocity();

    if (vx !== 0 && vy !== 0) {
      const invSqrt2 = 0.70710678;
      this.player.setVelocity(vx * speed * invSqrt2, vy * speed * invSqrt2);
    } else {
      this.player.setVelocity(vx * speed, vy * speed);
    }

    if (vx < 0) {
      this.player.play('player-walk-left', true);
      this.lastFacingDirection = 'left';
    } else if (vx > 0) {
      this.player.play('player-walk-right', true);
      this.lastFacingDirection = 'right';
    } else if (vy < 0) {
      this.player.play('player-walk-up', true);
      this.lastFacingDirection = 'up';
    } else if (vy > 0) {
      this.player.play('player-walk-down', true);
      this.lastFacingDirection = 'down';
    } else {
      this.playPlayerIdle();
    }

    this.player.setDepth(this.player.y);
    this.npcController.update(delta, this.player.x, this.player.y, isModalOpen);
    this.updateProximityDetection();

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.handleInteractAction();
    }
  }

  private playPlayerIdle(): void {
    if (!this.player) return;
    switch (this.lastFacingDirection) {
      case 'left':
        this.player.play('player-idle-left', true);
        break;
      case 'right':
        this.player.play('player-idle-right', true);
        break;
      case 'up':
        this.player.play('player-idle-up', true);
        break;
      case 'down':
      default:
        this.player.play('player-idle-down', true);
        break;
    }
  }

  /**
   * Genera un tileset 2D estilo Pokémon GBA (16 tiles de 32x32)
   * 0: Suelo madera cálida, 1: Baldosa laboratorio, 2: Alfombra azul, 3: Alfombra roja
   * 4: Pared superior con zócalo, 5: Muro perimetral oscuro, 6: Cristal divisorio
   * 7: Escritorio Dev con doble monitor, 8: Silla gaming/oficina, 9: Planta maceta Pokémon
   * 10: Rack de Servidores LED, 11: Pizarra Scrum Kanban, 12: Cafetera Espresso, 13: Mesa Reuniones, 14: Ping-Pong
   */
  private generatePokemonStyleTileset(): void {
    const key = 'pokemon_office_tiles';
    if (this.textures.exists(key)) this.textures.remove(key);

    const tileSize = 32;
    const cols = 16;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize * cols;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Tile 0: Suelo Parqué Madera Cálida (Estilo Pueblo Paleta / Laboratorio)
    ctx.fillStyle = '#E6CCA9';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#D4B48C';
    ctx.fillRect(0, 15, 32, 2);
    ctx.fillRect(0, 31, 32, 1);
    ctx.fillRect(15, 0, 2, 16);
    ctx.fillRect(30, 16, 2, 16);
    ctx.fillStyle = '#F2DEC2';
    ctx.fillRect(2, 2, 10, 1);
    ctx.fillRect(18, 18, 10, 1);

    // Tile 1: Baldosa Limpia Silph Co. (Modo Corporativo)
    const ox1 = 32;
    ctx.fillStyle = '#DCE4EC';
    ctx.fillRect(ox1, 0, 32, 32);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(ox1, 30, 32, 2);
    ctx.fillRect(ox1 + 30, 0, 2, 32);
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(ox1 + 2, 2, 26, 2);

    // Tile 2: Alfombra Azul Zona Reuniones
    const ox2 = 64;
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(ox2, 0, 32, 32);
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(ox2 + 2, 2, 28, 28);
    ctx.fillStyle = '#93C5FD';
    ctx.strokeRect(ox2 + 3, 3, 26, 26);

    // Tile 3: Alfombra Terracota / Sala de Café
    const ox3 = 96;
    ctx.fillStyle = '#D97706';
    ctx.fillRect(ox3, 0, 32, 32);
    ctx.fillStyle = '#B45309';
    ctx.fillRect(ox3 + 2, 2, 28, 28);
    ctx.fillStyle = '#FDE68A';
    ctx.strokeRect(ox3 + 3, 3, 26, 26);

    // Tile 4: Pared Interior con Zócalo Pokémon
    const ox4 = 128;
    ctx.fillStyle = '#64748B';
    ctx.fillRect(ox4, 0, 32, 32);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(ox4, 4, 32, 20);
    ctx.fillStyle = '#334155'; // Zócalo inferior
    ctx.fillRect(ox4, 24, 32, 8);
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(ox4, 30, 32, 2);

    // Tile 5: Muro Perimetral Sólido
    const ox5 = 160;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(ox5, 0, 32, 32);
    ctx.fillStyle = '#334155';
    ctx.fillRect(ox5 + 2, 2, 28, 28);
    ctx.fillStyle = '#475569';
    ctx.fillRect(ox5 + 4, 4, 24, 4);

    // Tile 6: Panel de Cristal Despacho PO
    const ox6 = 192;
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(ox6, 12, 32, 8);
    ctx.fillStyle = '#BAE6FD';
    ctx.fillRect(ox6 + 2, 13, 28, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ox6 + 6, 14, 6, 2);

    // Tile 7: Estación de Trabajo Dev (Mesa Roble + Doble Monitor con Código)
    const ox7 = 224;
    ctx.fillStyle = '#14141F';
    ctx.fillRect(ox7 + 1, 4, 30, 24);
    ctx.fillStyle = '#A16207'; // Madera escritorio
    ctx.fillRect(ox7 + 2, 5, 28, 20);
    ctx.fillStyle = '#CA8A04';
    ctx.fillRect(ox7 + 3, 6, 26, 14);
    // Monitor Izquierdo y Derecho
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(ox7 + 4, 3, 11, 10);
    ctx.fillRect(ox7 + 17, 3, 11, 10);
    ctx.fillStyle = '#0284C7'; // Pantalla encendida
    ctx.fillRect(ox7 + 5, 4, 9, 7);
    ctx.fillRect(ox7 + 18, 4, 9, 7);
    // Líneas de código verdes/amarillas
    ctx.fillStyle = '#4ADE80';
    ctx.fillRect(ox7 + 6, 5, 5, 1);
    ctx.fillRect(ox7 + 6, 7, 7, 1);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(ox7 + 19, 5, 6, 1);
    ctx.fillRect(ox7 + 19, 8, 4, 1);
    // Teclado mecánico
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(ox7 + 11, 15, 10, 4);

    // Tile 8: Silla Ergonómica
    const ox8 = 256;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(ox8 + 9, 8, 14, 16);
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(ox8 + 10, 9, 12, 12);

    // Tile 9: Planta en Maceta Clásica Pokémon (Árbol interior)
    const ox9 = 288;
    ctx.fillStyle = '#14141F';
    ctx.fillRect(ox9 + 8, 18, 16, 12);
    ctx.fillStyle = '#B45309'; // Maceta terracota
    ctx.fillRect(ox9 + 9, 19, 14, 10);
    // Hojas frondosas verdes con contorno
    ctx.fillStyle = '#064E3B';
    ctx.fillRect(ox9 + 5, 3, 22, 17);
    ctx.fillStyle = '#10B981';
    ctx.fillRect(ox9 + 7, 4, 18, 14);
    ctx.fillStyle = '#34D399';
    ctx.fillRect(ox9 + 9, 5, 10, 6);

    // Tile 10: Rack de Servidores (Con LEDs verdes y rojos)
    const ox10 = 320;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(ox10 + 3, 1, 26, 30);
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(ox10 + 5, 3, 22, 26);
    for (let ry = 5; ry < 26; ry += 6) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(ox10 + 6, ry, 20, 4);
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(ox10 + 8, ry + 1, 2, 2);
      ctx.fillRect(ox10 + 12, ry + 1, 2, 2);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(ox10 + 22, ry + 1, 2, 2);
    }

    // Tile 11: Pizarra Scrum Kanban con Post-its
    const ox11 = 352;
    ctx.fillStyle = '#78350F';
    ctx.fillRect(ox11 + 1, 3, 30, 24);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(ox11 + 3, 5, 26, 20);
    // Columnas y notas adhesivas
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(ox11 + 11, 5, 1, 20);
    ctx.fillRect(ox11 + 20, 5, 1, 20);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(ox11 + 5, 7, 4, 4);
    ctx.fillRect(ox11 + 5, 13, 4, 4);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(ox11 + 13, 8, 5, 4);
    ctx.fillStyle = '#4ADE80';
    ctx.fillRect(ox11 + 22, 7, 5, 4);
    ctx.fillRect(ox11 + 22, 14, 5, 4);

    // Tile 12: Estación de Café Espresso
    const ox12 = 384;
    ctx.fillStyle = '#475569';
    ctx.fillRect(ox12 + 3, 4, 26, 24);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(ox12 + 5, 6, 22, 18);
    ctx.fillStyle = '#DC2626'; // Cafetera roja
    ctx.fillRect(ox12 + 8, 7, 10, 12);
    ctx.fillStyle = '#FFFFFF'; // Tazas
    ctx.fillRect(ox12 + 20, 12, 4, 5);

    // Tile 13: Mesa de Juntas (Sala de Reuniones)
    const ox13 = 416;
    ctx.fillStyle = '#451A03';
    ctx.fillRect(ox13 + 1, 3, 30, 26);
    ctx.fillStyle = '#92400E';
    ctx.fillRect(ox13 + 3, 5, 26, 22);
    ctx.fillStyle = '#B45309';
    ctx.fillRect(ox13 + 5, 7, 22, 18);

    // Tile 14: Mesa de Ping-Pong Recreativa
    const ox14 = 448;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ox14 + 1, 3, 30, 26);
    ctx.fillStyle = '#15803D';
    ctx.fillRect(ox14 + 3, 5, 26, 22);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ox14 + 15, 5, 2, 22); // Red central
    ctx.fillRect(ox14 + 3, 15, 26, 2);

    this.textures.addSpriteSheet(key, canvas as unknown as HTMLImageElement, {
      frameWidth: tileSize,
      frameHeight: tileSize,
    });
    this.textures.get(key).setFilter(0);
  }

  /**
   * Construye el mapa completo de la oficina al estilo Pokémon 2D
   */
  private buildPokemonStyleOffice(): void {
    this.wallsGroup = this.physics.add.staticGroup();
    const sheetKey = 'pokemon_office_tiles';
    const tileSize = 32;
    const cols = 30; // 960px
    const rows = 20; // 640px
    const isCorp = this.currentMapKey === 'corporate';

    // 1. CAPA DE SUELO Y ALFOMBRAS DE DEPARTAMENTO
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const posX = x * tileSize + 16;
        const posY = y * tileSize + 16;

        let floorFrame = isCorp ? 1 : 0;

        // Alfombra Azul en Sala de Reuniones (Abajo Centro)
        if (x >= 14 && x <= 21 && y >= 13 && y <= 17) {
          floorFrame = 2;
        }
        // Alfombra Cálida en Zona de Café y Ping-Pong (Abajo Izquierda)
        if (x >= 2 && x <= 8 && y >= 12 && y <= 17) {
          floorFrame = 3;
        }
        // Alfombra en Despacho de David (Arriba Derecha)
        if (x >= 22 && x <= 27 && y >= 2 && y <= 6) {
          floorFrame = 2;
        }

        const tile = this.add.image(posX, posY, sheetKey, floorFrame);
        tile.setDepth(-20);
      }
    }

    const placeObstacle = (gridX: number, gridY: number, frame: number) => {
      const posX = gridX * tileSize + 16;
      const posY = gridY * tileSize + 16;
      const sprite = this.add.image(posX, posY, sheetKey, frame);
      sprite.setDepth(posY);
      this.physics.add.existing(sprite, true);
      this.wallsGroup.add(sprite);
      return sprite;
    };

    const placeDecor = (gridX: number, gridY: number, frame: number) => {
      const posX = gridX * tileSize + 16;
      const posY = gridY * tileSize + 16;
      const sprite = this.add.image(posX, posY, sheetKey, frame);
      sprite.setDepth(-10);
      return sprite;
    };

    // 2. MUROS PERIMETRALES Y PARED SUPERIOR
    for (let x = 0; x < cols; x++) {
      placeObstacle(x, 0, 5);
      placeObstacle(x, 1, 4); // Pared con zócalo estilo Pokémon
      placeObstacle(x, rows - 1, 5);
    }
    for (let y = 1; y < rows - 1; y++) {
      placeObstacle(0, y, 5);
      placeObstacle(cols - 1, y, 5);
    }

    // 3. PLANTAS DECORATIVAS ESTILO LABORATORIO POKÉMON
    [2, 10, 19, 27].forEach((gx) => placeObstacle(gx, 2, 9));
    placeObstacle(2, 18, 9);
    placeObstacle(27, 18, 9);
    placeObstacle(13, 18, 9);
    placeObstacle(22, 18, 9);

    // 4. RACKS DE SERVIDORES (Arriba Izquierda - Zona Backend/DevOps)
    placeObstacle(3, 2, 10);
    placeObstacle(4, 2, 10);
    placeObstacle(5, 2, 10);
    this.addZoneLabel(144, 52, '⚡ SERVER RACK', '#38BDF8');

    // 5. PIZARRA SCRUM KANBAN (Arriba Centro - Zona Elena)
    placeObstacle(14, 2, 11);
    placeObstacle(15, 2, 11);
    this.addZoneLabel(480, 52, '📋 PIZARRA SCRUM', '#F472B6');

    // 6. DESPACHO DE CRISTAL DE DAVID (Arriba Derecha)
    for (let gx = 21; gx <= 28; gx++) {
      if (gx !== 24 && gx !== 25) {
        placeObstacle(gx, 7, 6); // Cristaleras con puerta abierta
      }
    }
    placeObstacle(25, 3, 7); // Mesa de David
    placeDecor(25, 4, 8);
    this.addZoneLabel(800, 52, '💼 DESPACHO PO (DAVID)', '#FBBF24');

    // 7. ISLAS DE TRABAJO DE DESARROLLO (Tu Mesa, Lucas, Marcos y Sofía)
    // Tu Estación de Trabajo (Izquierda Centro)
    placeObstacle(6, 6, 7);
    placeObstacle(7, 6, 7);
    placeDecor(6, 7, 8);
    this.addZoneLabel(224, 172, '💻 TU MESA (KANBAN)', '#4ADE80');

    // Mesa de Lucas (Centro Izquierda)
    placeObstacle(11, 6, 7);
    placeObstacle(12, 6, 7);
    placeDecor(12, 7, 8);

    // Mesa de Marcos (Centro Derecha)
    placeObstacle(20, 6, 7);
    placeObstacle(21, 6, 7);
    placeDecor(21, 7, 8);

    // Estudio UX/UI de Sofía (Centro)
    placeObstacle(16, 10, 7);
    placeObstacle(17, 10, 7);
    placeDecor(16, 11, 8);

    // 8. SALA DE DESCANSO: CAFETERA Y MESA DE PING-PONG (Abajo Izquierda)
    placeObstacle(3, 13, 12);
    placeObstacle(4, 13, 12);
    this.addZoneLabel(128, 395, '☕ CAFETERÍA', '#F59E0B');

    placeObstacle(5, 16, 14);
    placeObstacle(6, 16, 14);
    this.addZoneLabel(192, 490, '🏓 PING-PONG', '#34D399');

    // 9. SALA DE REUNIONES (Abajo Centro)
    placeObstacle(16, 15, 13);
    placeObstacle(17, 15, 13);
    placeObstacle(18, 15, 13);
    placeDecor(16, 14, 8);
    placeDecor(18, 14, 8);
    placeDecor(17, 16, 8);
    this.addZoneLabel(560, 435, '🤝 SALA DE JUNTAS', '#93C5FD');

    // 10. REGISTRAR PUNTOS INTERACTIVOS
    this.interactables = [
      {
        x: 224,
        y: 224,
        width: 64,
        height: 48,
        type: 'WORKSTATION',
        id: 'player_workstation',
        label: 'Tu Estación de Trabajo (Kanban & Herramientas)',
      },
      {
        x: 480,
        y: 105,
        width: 64,
        height: 48,
        type: 'SCRUM_BOARD',
        id: 'scrum_board_main',
        label: 'Pizarra Scrum & Retrospectiva',
      },
      {
        x: 128,
        y: 440,
        width: 64,
        height: 48,
        type: 'COFFEE_MACHINE',
        id: 'coffee_machine',
        label: 'Máquina de Café Espresso (+45m)',
      },
      {
        x: 192,
        y: 530,
        width: 64,
        height: 48,
        type: 'COFFEE_MACHINE',
        id: 'ping_pong_table',
        label: 'Mesa de Ping-Pong (+30m)',
      },
      {
        x: 144,
        y: 105,
        width: 96,
        height: 48,
        type: 'MEETING_ROOM',
        id: 'server_rack_crisis',
        label: 'Rack de Servidores de Pre-Producción',
        dialogueNodeId: 'scene_3_1_black_friday',
      },
      {
        x: 560,
        y: 495,
        width: 96,
        height: 64,
        type: 'MEETING_ROOM',
        id: 'meeting_room_table',
        label: 'Sala de Reuniones (Mediar Conflicto)',
        dialogueNodeId: 'scene_2_2_meeting_war',
      },
    ];
  }

  private addZoneLabel(x: number, y: number, text: string, colorHex: string): void {
    const label = this.add.text(x, y, text, {
      fontFamily: 'Inter, monospace, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: colorHex,
      backgroundColor: '#0F172ACC',
      padding: { x: 5, y: 2 },
    });
    label.setOrigin(0.5);
    label.setDepth(y + 40);
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(224, 265, 'player_custom_skin');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 18);
    this.player.body.setOffset(6, 12);
    this.physics.add.collider(this.player, this.wallsGroup);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, 960, 640);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(64, 64);
  }

  private setupFloatingPrompt(): void {
    this.promptContainer = this.add.container(0, 0);
    this.promptContainer.setDepth(9999);
    this.promptContainer.setVisible(false);

    this.promptBg = this.add.graphics();
    this.promptText = this.add.text(0, 0, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      align: 'center',
    });
    this.promptText.setOrigin(0.5);
    this.promptContainer.add([this.promptBg, this.promptText]);
  }

  private updateProximityDetection(): void {
    const px = this.player.x;
    const py = this.player.y;
    const interactionRadius = 64;

    let closest: SceneInteractable | null = null;
    let minDist = interactionRadius;

    for (const item of this.interactables) {
      const dist = Phaser.Math.Distance.Between(px, py, item.x, item.y);
      if (dist < minDist) {
        minDist = dist;
        closest = item;
      }
    }

    const nearestNpc = this.npcController.getNearestNPC(px, py, interactionRadius);
    if (nearestNpc) {
      const dist = Phaser.Math.Distance.Between(px, py, nearestNpc.x, nearestNpc.y);
      if (dist < minDist) {
        closest = {
          x: nearestNpc.x,
          y: nearestNpc.y,
          width: 32,
          height: 32,
          type: 'NPC_SPAWN',
          id: nearestNpc.id,
          label: `Hablar con ${nearestNpc.name}`,
          dialogueNodeId: nearestNpc.dialogueNodeId,
        };
      }
    }

    if (closest !== this.currentNearInteractable) {
      this.currentNearInteractable = closest;
      const gameStore = useGameStore.getState();

      if (closest) {
        const active: ActiveInteractable = {
          type: closest.type,
          id: closest.id,
          label: closest.label,
          dialogueNodeId: closest.dialogueNodeId,
        };
        gameStore.setActiveInteractable(active);

        const promptStr = `[E] ${closest.label.split('(')[0].trim()}`;
        this.promptText.setText(promptStr);
        const bounds = this.promptText.getBounds();

        this.promptBg.clear();
        this.promptBg.fillStyle(0x1E293B, 0.95);
        this.promptBg.lineStyle(2, 0xFACC15, 1.0);
        this.promptBg.fillRoundedRect(
          -bounds.width / 2 - 10,
          -bounds.height / 2 - 5,
          bounds.width + 20,
          bounds.height + 10,
          8
        );
        this.promptBg.strokeRoundedRect(
          -bounds.width / 2 - 10,
          -bounds.height / 2 - 5,
          bounds.width + 20,
          bounds.height + 10,
          8
        );

        this.promptContainer.setPosition(closest.x, closest.y - 40);
        this.promptContainer.setVisible(true);
      } else {
        gameStore.setActiveInteractable(null);
        this.promptContainer.setVisible(false);
      }
    }
  }

  private handleInteractAction(): void {
    if (!this.currentNearInteractable) return;

    const game = useGameStore.getState();
    const quests = useQuestStore.getState();
    const item = this.currentNearInteractable;

    if (item.dialogueNodeId) {
      AudioManager.playNotificationPing();
      quests.setActiveStoryNode(item.dialogueNodeId);
      game.setActiveModal('DIALOGUE');
      return;
    }

    switch (item.type) {
      case 'WORKSTATION':
        AudioManager.playKeyClack();
        game.setActiveModal('WORKSTATION');
        break;
      case 'SCRUM_BOARD':
        AudioManager.playNotificationPing();
        game.setActiveModal('SCRUM_BOARD');
        break;
      case 'COFFEE_MACHINE':
        if (item.id === 'ping_pong_table') {
          AudioManager.playKeyClack();
          game.advanceTime(30);
          game.setFlag('ping_pong_distractions_count', Number(game.flags['ping_pong_distractions_count'] || 0) + 1);
          FeedbackManager.triggerImpact('small');
          alert('🏓 Has jugado una partida de Ping-Pong con Lucas (+30 min consumidos). ¡Desconexión breve!');
        } else {
          AudioManager.playKeyClack();
          game.advanceTime(45);
          game.setFlag('coffee_distractions_count', Number(game.flags['coffee_distractions_count'] || 0) + 1);
          FeedbackManager.triggerImpact('small');
          alert('☕ Has disfrutado de un buen café en la sala de descanso (+45 min consumidos).');
        }
        break;
      case 'MEETING_ROOM':
        game.setActiveModal('DIALOGUE');
        break;
    }
  }

  public triggerCameraShake(intensity = 0.02, duration = 400): void {
    this.cameras.main.shake(duration, intensity);
  }
}