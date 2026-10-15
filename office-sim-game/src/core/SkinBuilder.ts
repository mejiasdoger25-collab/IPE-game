/**
 * src/core/SkinBuilder.ts
 * Motor Pixel-Art estilo Pokémon GBA (Chibi 16-bit con outlines negros, sombreado y capas).
 * Genera spritesheets completos tanto para el Jugador como para los 5 NPCs de la oficina.
 */

import type Phaser from 'phaser';
import type { SkinConfig } from '../types/game';

export class SkinBuilder {
  public static readonly FRAME_WIDTH = 32;
  public static readonly FRAME_HEIGHT = 32;
  public static readonly ROWS = 12;
  public static readonly COLS = 4;

  /**
   * Skins desbloqueables y seleccionables para el Jugador
   */
  public static readonly PRESET_SKINS: SkinConfig[] = [
    {
      skinId: 'default_junior',
      name: 'Entrenador Fullstack (Hoodie Pro)',
      layers: {
        body: 'skin_light',
        hair: { sprite: 'hair_spiky', tint: '#3B2314' },
        top: { sprite: 'shirt_hoodie', tint: '#2563EB' },
        bottom: { sprite: 'pants_jeans', tint: '#1E293B' },
        accessory: 'none',
      },
    },
    {
      skinId: 'cyber_architect',
      name: 'Cyber Arquitecto (Chaqueta Neón)',
      layers: {
        body: 'skin_light',
        hair: { sprite: 'hair_messy', tint: '#0F172A' },
        top: { sprite: 'shirt_jacket', tint: '#7C3AED' },
        bottom: { sprite: 'pants_cargo', tint: '#0F172A' },
        accessory: 'headphones_pro',
      },
    },
    {
      skinId: 'tech_lead_blazer',
      name: 'Blazer Ejecutivo de Tech Lead',
      unlockCondition: { metric: 'complementariedad', min: 75 },
      layers: {
        body: 'skin_warm',
        hair: { sprite: 'hair_short', tint: '#1E293B' },
        top: { sprite: 'shirt_blazer', tint: '#1E3A8A' },
        bottom: { sprite: 'pants_chinos', tint: '#475569' },
        accessory: 'glasses_blueblock',
      },
    },
    {
      skinId: 'hyperfocus_headphones',
      name: 'Maestro del Pomodoro (Hiperfoco)',
      unlockCondition: { metric: 'temporalMasteryPoints', min: 100 },
      layers: {
        body: 'skin_light',
        hair: { sprite: 'hair_curly', tint: '#92400E' },
        top: { sprite: 'shirt_hoodie', tint: '#10B981' },
        bottom: { sprite: 'pants_jeans', tint: '#1E293B' },
        accessory: 'headphones_pro',
      },
    },
    {
      skinId: 'scrum_champion',
      name: 'Líder Agile & Scrum Champion',
      unlockCondition: { metric: 'coordinacion', min: 80 },
      layers: {
        body: 'skin_warm',
        hair: { sprite: 'hair_ponytail', tint: '#B45309' },
        top: { sprite: 'shirt_blazer', tint: '#EC4899' },
        bottom: { sprite: 'pants_chinos', tint: '#334155' },
        accessory: 'badge_scrum',
      },
    },
    {
      skinId: 'startup_founder',
      name: 'Leyenda Co-Founder (Visor Pro)',
      unlockCondition: { metric: 'confianza', min: 85 },
      layers: {
        body: 'skin_tan',
        hair: { sprite: 'hair_spiky', tint: '#F59E0B' },
        top: { sprite: 'shirt_jacket', tint: '#DC2626' },
        bottom: { sprite: 'pants_jeans', tint: '#111827' },
        accessory: 'visor_matrix',
      },
    },
  ];

  /**
   * Skins exclusivas para los 5 NPCs de NovaSoft Solutions
   */
  public static readonly NPC_SKINS: Record<string, SkinConfig> = {
    elena_scrum: {
      skinId: 'npc_elena',
      name: 'Elena (Scrum Master)',
      layers: {
        body: 'skin_warm',
        hair: { sprite: 'hair_ponytail', tint: '#581C87' },
        top: { sprite: 'shirt_blazer', tint: '#EC4899' },
        bottom: { sprite: 'pants_chinos', tint: '#1E293B' },
        accessory: 'badge_scrum',
      },
    },
    david_po: {
      skinId: 'npc_david',
      name: 'David (Product Owner)',
      layers: {
        body: 'skin_tan',
        hair: { sprite: 'hair_short', tint: '#78350F' },
        top: { sprite: 'shirt_blazer', tint: '#D97706' },
        bottom: { sprite: 'pants_chinos', tint: '#1E293B' },
        accessory: 'glasses_blueblock',
      },
    },
    marcos_senior: {
      skinId: 'npc_marcos',
      name: 'Marcos (Senior Backend)',
      layers: {
        body: 'skin_light',
        hair: { sprite: 'hair_spiky', tint: '#111827' },
        top: { sprite: 'shirt_jacket', tint: '#DC2626' },
        bottom: { sprite: 'pants_jeans', tint: '#0F172A' },
        accessory: 'headphones_pro',
      },
    },
    sofia_ux: {
      skinId: 'npc_sofia',
      name: 'Sofía (UX/UI Designer)',
      layers: {
        body: 'skin_light',
        hair: { sprite: 'hair_long', tint: '#6D28D9' },
        top: { sprite: 'shirt_hoodie', tint: '#8B5CF6' },
        bottom: { sprite: 'pants_jeans', tint: '#334155' },
        accessory: 'glasses_blueblock',
      },
    },
    lucas_junior: {
      skinId: 'npc_lucas',
      name: 'Lucas (Junior Dev)',
      layers: {
        body: 'skin_warm',
        hair: { sprite: 'hair_curly', tint: '#713F12' },
        top: { sprite: 'shirt_hoodie', tint: '#10B981' },
        bottom: { sprite: 'pants_cargo', tint: '#374151' },
        accessory: 'cap_ backwards',
      },
    },
  };

  public static hexToRgb(hex: string): { r: number; g: number; b: number } {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const num = parseInt(cleanHex, 16) || 0;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  private static shadeColor(hex: string, percent: number): string {
    const { r, g, b } = this.hexToRgb(hex);
    const f = 1 + percent / 100;
    const nr = Math.min(255, Math.max(0, Math.round(r * f)));
    const ng = Math.min(255, Math.max(0, Math.round(g * f)));
    const nb = Math.min(255, Math.max(0, Math.round(b * f)));
    return `rgb(${nr},${ng},${nb})`;
  }

  private static getSkinPalette(bodyKey: string): { base: string; shadow: string } {
    switch (bodyKey) {
      case 'skin_tan':
        return { base: '#E0A96D', shadow: '#C68B59' };
      case 'skin_dark':
        return { base: '#8D5524', shadow: '#6B3E17' };
      case 'skin_warm':
        return { base: '#F7C59F', shadow: '#DFA073' };
      case 'skin_light':
      default:
        return { base: '#FFE0BD', shadow: '#EABF92' };
    }
  }

  /**
   * Construye el spritesheet de 12 filas x 4 columnas con estética Pokémon Chibi RPG
   */
  public static buildSpritesheetCanvas(config: SkinConfig): HTMLCanvasElement {
    const width = this.FRAME_WIDTH * this.COLS;
    const height = this.FRAME_HEIGHT * this.ROWS;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        this.drawCharacterFrame(ctx, config, r, c);
      }
    }

    return canvas;
  }

  private static drawCharacterFrame(
    ctx: CanvasRenderingContext2D,
    config: SkinConfig,
    row: number,
    col: number
  ): void {
    const ox = col * this.FRAME_WIDTH;
    const oy = row * this.FRAME_HEIGHT;

    // Determinar dirección según la fila LPC
    // 0: Up, 1: Left, 2: Down, 3: Right, >=4: Down/Action
    const dir: 'up' | 'left' | 'down' | 'right' =
      row === 0 ? 'up' : row === 1 ? 'left' : row === 3 ? 'right' : 'down';

    // Ciclo de caminata estilo Pokémon (0: neutral, 1: paso izq, 2: neutral, 3: paso der)
    const isStepping = col === 1 || col === 3;
    const bobY = isStepping ? -1 : 0;
    const leftLegOffset = col === 1 ? -2 : col === 3 ? 1 : 0;
    const rightLegOffset = col === 3 ? -2 : col === 1 ? 1 : 0;
    const leftArmSwing = col === 1 ? 1 : col === 3 ? -1 : 0;
    const rightArmSwing = col === 3 ? 1 : col === 1 ? -1 : 0;

    const skin = this.getSkinPalette(config.layers.body);
    const topTint = config.layers.top?.tint || '#2563EB';
    const topDark = this.shadeColor(topTint, -22);
    const topLight = this.shadeColor(topTint, 18);
    const topStyle = config.layers.top?.sprite || 'shirt_hoodie';

    const botTint = config.layers.bottom?.tint || '#1E293B';
    const botDark = this.shadeColor(botTint, -25);

    const hairTint = config.layers.hair?.tint || '#3B2314';
    const hairDark = this.shadeColor(hairTint, -25);
    const hairLight = this.shadeColor(hairTint, 22);
    const hairStyle = config.layers.hair?.sprite || 'hair_spiky';

    const outline = '#14141F';

    // 1. SOMBRA PROYECTADA EN EL SUELO (Estilo Pokémon GBA)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.fillRect(ox + 9, oy + 28, 14, 3);
    ctx.fillRect(ox + 11, oy + 27, 10, 5);

    // 2. PIERNAS Y ZAPATILLAS
    // Pierna Izquierda
    const llY = oy + 22 + leftLegOffset;
    ctx.fillStyle = outline;
    ctx.fillRect(ox + 9, llY, 6, 8);
    ctx.fillStyle = botTint;
    ctx.fillRect(ox + 10, llY, 4, 5);
    ctx.fillStyle = botDark;
    ctx.fillRect(ox + 10, llY + 3, 4, 2);
    // Zapatilla Izquierda (Roja/Blanca estilo Trainer)
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(ox + 10, llY + 5, 4, 2);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(ox + 10, llY + 5, 4, 1);

    // Pierna Derecha
    const rlY = oy + 22 + rightLegOffset;
    ctx.fillStyle = outline;
    ctx.fillRect(ox + 17, rlY, 6, 8);
    ctx.fillStyle = botTint;
    ctx.fillRect(ox + 18, rlY, 4, 5);
    ctx.fillStyle = botDark;
    ctx.fillRect(ox + 18, rlY + 3, 4, 2);
    // Zapatilla Derecha
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(ox + 18, rlY + 5, 4, 2);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(ox + 18, rlY + 5, 4, 1);

    // 3. TORSO Y ROPA SUPERIOR
    const ty = oy + 14 + bobY;
    ctx.fillStyle = outline;
    ctx.fillRect(ox + 8, ty, 16, 10);

    ctx.fillStyle = topTint;
    ctx.fillRect(ox + 9, ty + 1, 14, 8);
    ctx.fillStyle = topDark;
    ctx.fillRect(ox + 9, ty + 7, 14, 2);

    // Detalles según estilo de prenda
    if (topStyle.includes('blazer') && dir !== 'up') {
      // Camisa interior blanca y corbata/solapa
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(ox + 14, ty + 1, 4, 6);
      ctx.fillStyle = '#EF4444'; // Corbata / lanyard
      ctx.fillRect(ox + 15, ty + 2, 2, 4);
    } else if (topStyle.includes('jacket') && dir !== 'up') {
      // Chaqueta abierta con camiseta oscura y franjas neón
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(ox + 13, ty + 1, 6, 8);
      ctx.fillStyle = topLight;
      ctx.fillRect(ox + 11, ty + 1, 1, 7);
      ctx.fillRect(ox + 20, ty + 1, 1, 7);
    } else if (topStyle.includes('hoodie') && dir !== 'up') {
      // Bolsillo canguro y cordones de sudadera
      ctx.fillStyle = topDark;
      ctx.fillRect(ox + 11, ty + 5, 10, 3);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(ox + 13, ty + 1, 1, 3);
      ctx.fillRect(ox + 18, ty + 1, 1, 3);
    }

    // 4. BRAZOS Y MANOS
    const isCelebrating = row === 8 || row === 9;
    const isCoffee = row === 10;

    if (isCelebrating) {
      // Brazos levantados celebrando
      ctx.fillStyle = outline;
      ctx.fillRect(ox + 5, ty - 5, 4, 9);
      ctx.fillRect(ox + 23, ty - 5, 4, 9);
      ctx.fillStyle = topTint;
      ctx.fillRect(ox + 6, ty - 3, 2, 6);
      ctx.fillRect(ox + 24, ty - 3, 2, 6);
      ctx.fillStyle = skin.base;
      ctx.fillRect(ox + 6, ty - 5, 2, 2);
      ctx.fillRect(ox + 24, ty - 5, 2, 2);
    } else {
      // Brazo Izquierdo
      const laY = ty + 1 + leftArmSwing;
      ctx.fillStyle = outline;
      ctx.fillRect(ox + 5, laY, 4, 8);
      ctx.fillStyle = topTint;
      ctx.fillRect(ox + 6, laY + 1, 2, 5);
      ctx.fillStyle = skin.base;
      ctx.fillRect(ox + 6, laY + 6, 2, 2);

      // Brazo Derecho
      const raY = ty + 1 + rightArmSwing;
      ctx.fillStyle = outline;
      ctx.fillRect(ox + 23, raY, 4, 8);
      ctx.fillStyle = topTint;
      ctx.fillRect(ox + 24, raY + 1, 2, 5);
      ctx.fillStyle = skin.base;
      ctx.fillRect(ox + 24, raY + 6, 2, 2);

      // Si está tomando café (fila 10), dibujar taza en la mano
      if (isCoffee) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(ox + 22, raY + 3, 4, 4);
        ctx.fillStyle = '#78350F';
        ctx.fillRect(ox + 23, raY + 3, 2, 1);
      }
    }

    // 5. CABEZA CHIBI (Proporción Pokémon 16x13)
    const hy = oy + 2 + bobY;
    ctx.fillStyle = outline;
    ctx.fillRect(ox + 8, hy + 1, 16, 12);
    ctx.fillRect(ox + 9, hy, 14, 14);

    // Rostro / Piel
    ctx.fillStyle = skin.base;
    ctx.fillRect(ox + 9, hy + 2, 14, 11);
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(ox + 9, hy + 11, 14, 2);

    // Orejas
    ctx.fillStyle = outline;
    ctx.fillRect(ox + 7, hy + 6, 2, 4);
    ctx.fillRect(ox + 23, hy + 6, 2, 4);
    ctx.fillStyle = skin.base;
    ctx.fillRect(ox + 8, hy + 7, 1, 2);
    ctx.fillRect(ox + 23, hy + 7, 1, 2);

    // 6. OJOS EXPRESIVOS ESTILO ANIME / POKÉMON
    if (dir === 'down') {
      // Ojos grandes con pupila y brillo blanco
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(ox + 11, hy + 7, 2, 4);
      ctx.fillRect(ox + 19, hy + 7, 2, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 11, hy + 7, 1, 2);
      ctx.fillRect(ox + 19, hy + 7, 1, 2);
      // Cejas
      ctx.fillStyle = hairDark;
      ctx.fillRect(ox + 10, hy + 6, 3, 1);
      ctx.fillRect(ox + 19, hy + 6, 3, 1);
      // Sonrisa sutil o boca
      ctx.fillStyle = '#C2785C';
      ctx.fillRect(ox + 15, hy + 11, 2, 1);
    } else if (dir === 'left') {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(ox + 10, hy + 7, 2, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 10, hy + 7, 1, 2);
    } else if (dir === 'right') {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(ox + 20, hy + 7, 2, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 21, hy + 7, 1, 2);
    }

    // 7. CABELLO CON VOLUMEN Y TEXTURA
    ctx.fillStyle = outline;
    ctx.fillRect(ox + 7, hy - 1, 18, 5);

    ctx.fillStyle = hairTint;
    ctx.fillRect(ox + 8, hy, 16, 4);
    // Brillo superior del pelo
    ctx.fillStyle = hairLight;
    ctx.fillRect(ox + 11, hy + 1, 10, 1);

    if (dir === 'up') {
      // Parte trasera de la cabeza cubierta de pelo
      ctx.fillStyle = hairTint;
      ctx.fillRect(ox + 8, hy + 2, 16, 10);
      ctx.fillStyle = hairDark;
      ctx.fillRect(ox + 9, hy + 9, 14, 3);
      if (hairStyle.includes('ponytail')) {
        ctx.fillStyle = outline;
        ctx.fillRect(ox + 13, hy + 6, 6, 8);
        ctx.fillStyle = hairLight;
        ctx.fillRect(ox + 14, hy + 7, 4, 6);
      }
    } else {
      // Flequillo y mechones laterales según estilo
      ctx.fillStyle = hairTint;
      ctx.fillRect(ox + 8, hy + 3, 3, 4);
      ctx.fillRect(ox + 21, hy + 3, 3, 4);

      if (hairStyle.includes('spiky') || hairStyle.includes('messy')) {
        // Puntas estilo protagonista de anime/Pokémon
        ctx.fillStyle = outline;
        ctx.fillRect(ox + 6, hy + 1, 2, 3);
        ctx.fillRect(ox + 24, hy + 1, 2, 3);
        ctx.fillRect(ox + 11, hy - 2, 3, 2);
        ctx.fillRect(ox + 18, hy - 2, 3, 2);
        ctx.fillStyle = hairTint;
        ctx.fillRect(ox + 12, hy + 3, 3, 3);
        ctx.fillRect(ox + 17, hy + 3, 2, 2);
      } else if (hairStyle.includes('long')) {
        // Melena larga cayendo sobre los hombros
        ctx.fillStyle = outline;
        ctx.fillRect(ox + 6, hy + 3, 3, 12);
        ctx.fillRect(ox + 23, hy + 3, 3, 12);
        ctx.fillStyle = hairTint;
        ctx.fillRect(ox + 7, hy + 3, 2, 11);
        ctx.fillRect(ox + 23, hy + 3, 2, 11);
      } else if (hairStyle.includes('ponytail')) {
        ctx.fillStyle = hairTint;
        ctx.fillRect(ox + 11, hy + 3, 10, 2);
        if (dir === 'left' || dir === 'right') {
          const px = dir === 'left' ? ox + 23 : ox + 5;
          ctx.fillStyle = outline;
          ctx.fillRect(px, hy + 3, 4, 6);
          ctx.fillStyle = hairTint;
          ctx.fillRect(px + 1, hy + 4, 2, 4);
        }
      } else if (hairStyle.includes('curly')) {
        ctx.fillStyle = hairTint;
        ctx.fillRect(ox + 10, hy + 3, 12, 3);
        ctx.fillStyle = hairDark;
        ctx.fillRect(ox + 9, hy + 2, 2, 3);
        ctx.fillRect(ox + 15, hy + 3, 2, 2);
        ctx.fillRect(ox + 21, hy + 2, 2, 3);
      }
    }

    // 8. ACCESORIOS PRO (Gafas, Cascos Gaming, Visor, Insignia)
    const acc = config.layers.accessory || 'none';
    if (acc.includes('glasses') && dir !== 'up') {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(ox + 10, hy + 6, 5, 4);
      ctx.fillRect(ox + 17, hy + 6, 5, 4);
      ctx.fillRect(ox + 15, hy + 7, 2, 1);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(ox + 11, hy + 7, 3, 2);
      ctx.fillRect(ox + 18, hy + 7, 3, 2);
    } else if (acc.includes('visor') && dir !== 'up') {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(ox + 9, hy + 6, 14, 4);
      ctx.fillStyle = '#22D3EE';
      ctx.fillRect(ox + 10, hy + 7, 12, 2);
    } else if (acc.includes('headphones')) {
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(ox + 8, hy - 1, 16, 2);
      ctx.fillRect(ox + 6, hy + 4, 3, 6);
      ctx.fillRect(ox + 23, hy + 4, 3, 6);
      ctx.fillStyle = '#FDA4AF';
      ctx.fillRect(ox + 7, hy + 5, 1, 4);
      ctx.fillRect(ox + 24, hy + 5, 1, 4);
    } else if (acc.includes('badge') && dir !== 'up') {
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(ox + 18, ty + 2, 3, 3);
    } else if (acc.includes('cap')) {
      // Gorra de entrenador Pokémon
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(ox + 8, hy - 1, 16, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 12, hy, 8, 2);
    }
  }

  /**
   * Registra cualquier SkinConfig en Phaser y crea sus animaciones con el prefijo indicado
   */
  public static registerCharacterInPhaser(
    scene: Phaser.Scene,
    config: SkinConfig,
    textureKey: string,
    animPrefix: string
  ): string {
    const canvas = this.buildSpritesheetCanvas(config);

    if (scene.textures.exists(textureKey)) {
      scene.textures.remove(textureKey);
    }

    scene.textures.addSpriteSheet(textureKey, canvas as unknown as HTMLImageElement, {
      frameWidth: this.FRAME_WIDTH,
      frameHeight: this.FRAME_HEIGHT,
    });

    const texture = scene.textures.get(textureKey);
    if (texture) {
      texture.setFilter(0); // NEAREST para nitidez pixel-art
    }

    const anims = scene.anims;
    const animDefinitions = [
      { key: `${animPrefix}-walk-up`, start: 0, end: 3, frameRate: 8, repeat: -1 },
      { key: `${animPrefix}-walk-left`, start: 4, end: 7, frameRate: 8, repeat: -1 },
      { key: `${animPrefix}-walk-down`, start: 8, end: 11, frameRate: 8, repeat: -1 },
      { key: `${animPrefix}-walk-right`, start: 12, end: 15, frameRate: 8, repeat: -1 },
      { key: `${animPrefix}-idle-up`, frames: [0], frameRate: 1, repeat: 0 },
      { key: `${animPrefix}-idle-left`, frames: [4], frameRate: 1, repeat: 0 },
      { key: `${animPrefix}-idle-down`, frames: [8], frameRate: 1, repeat: 0 },
      { key: `${animPrefix}-idle-right`, frames: [12], frameRate: 1, repeat: 0 },
      { key: `${animPrefix}-typing`, start: 20, end: 23, frameRate: 6, repeat: -1 },
      { key: `${animPrefix}-celebrate`, start: 36, end: 39, frameRate: 6, repeat: -1 },
    ];

    animDefinitions.forEach((def) => {
      if (anims.exists(def.key)) {
        anims.remove(def.key);
      }
      if ('frames' in def && def.frames) {
        anims.create({
          key: def.key,
          frames: def.frames.map((frame) => ({ key: textureKey, frame })),
          frameRate: def.frameRate,
          repeat: def.repeat,
        });
      } else {
        anims.create({
          key: def.key,
          frames: anims.generateFrameNumbers(textureKey, { start: def.start!, end: def.end! }),
          frameRate: def.frameRate,
          repeat: def.repeat,
        });
      }
    });

    return textureKey;
  }

  /**
   * Mantiene compatibilidad directa con el registro del jugador en OfficeScene
   */
  public static registerInPhaser(
    scene: Phaser.Scene,
    config: SkinConfig,
    key = 'player_custom_skin'
  ): string {
    return this.registerCharacterInPhaser(scene, config, key, 'player');
  }

  /**
   * Registra los 5 NPCs con sus propias skins exclusivas
   */
  public static registerAllNPCsInPhaser(scene: Phaser.Scene): void {
    Object.entries(this.NPC_SKINS).forEach(([npcId, skinConfig]) => {
      this.registerCharacterInPhaser(scene, skinConfig, npcId, npcId);
    });
  }

  /**
   * Renderiza un frame en el canvas de previsualización del modal SkinCustomizer
   */
  public static renderPreviewFrame(
    targetCanvas: HTMLCanvasElement,
    config: SkinConfig,
    frameRow = 2,
    frameCol = 0,
    zoom = 4
  ): void {
    const fullSpritesheet = this.buildSpritesheetCanvas(config);
    targetCanvas.width = this.FRAME_WIDTH * zoom;
    targetCanvas.height = this.FRAME_HEIGHT * zoom;
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

    ctx.drawImage(
      fullSpritesheet,
      frameCol * this.FRAME_WIDTH,
      frameRow * this.FRAME_HEIGHT,
      this.FRAME_WIDTH,
      this.FRAME_HEIGHT,
      0,
      0,
      this.FRAME_WIDTH * zoom,
      this.FRAME_HEIGHT * zoom
    );
  }
}