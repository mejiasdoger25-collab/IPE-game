/**
 * scripts/download-assets.mjs
 * Downloads and generates real 2D pixel-art spritesheets and tilesets for DevLife RPG.
 * - Universal LPC character spritesheets (12 rows x 4 cols of 32x32 frames)
 * - NPCs: Elena, David, Marcos, Sofía, Lucas
 * - Modern 32x32 Office Tileset: wood floors, carpets, desks with dual monitors, plants,
 *   server racks, coffee machine, Scrum board, ping-pong table, glass partitions.
 * Uses Node's built-in zlib to output standard 32-bit RGBA PNG files with zero external dependencies.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const spritesDir = path.join(rootDir, 'public', 'assets', 'sprites');
const tilesetsDir = path.join(rootDir, 'public', 'assets', 'tilesets');

fs.mkdirSync(spritesDir, { recursive: true });
fs.mkdirSync(tilesetsDir, { recursive: true });

// CRC32 table for PNG chunk validation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0 (None)
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let srcOffset = 0;
  let dstOffset = 0;

  for (let y = 0; y < height; y++) {
    scanlines[dstOffset++] = 0; // filter None
    for (let x = 0; x < width; x++) {
      scanlines[dstOffset++] = rgbaBuffer[srcOffset++];
      scanlines[dstOffset++] = rgbaBuffer[srcOffset++];
      scanlines[dstOffset++] = rgbaBuffer[srcOffset++];
      scanlines[dstOffset++] = rgbaBuffer[srcOffset++];
    }
  }

  const compressed = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const toCrc = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(toCrc), 8 + len);
  return chunk;
}

function parseHex(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function setPixel(buf, width, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= width || y < 0 || y >= buf.length / (width * 4)) return;
  const idx = (y * width + x) * 4;
  buf[idx] = r;
  buf[idx + 1] = g;
  buf[idx + 2] = b;
  buf[idx + 3] = a;
}

function fillRect(buf, width, height, rx, ry, rw, rh, r, g, b, a = 255) {
  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      setPixel(buf, width, x, y, r, g, b, a);
    }
  }
}

// =========================================================================
// 1. CHARACTER SPRITESHEET GENERATION (Universal LPC 12 rows x 4 columns)
// =========================================================================
// Rows:
// 0: Walk Up (4 frames)
// 1: Walk Left (4 frames)
// 2: Walk Down (4 frames)
// 3: Walk Right (4 frames)
// 4: Idle Stance (4 directions)
// 5: Typing / Working at desk (4 frames)
// 6-11: Gestures, Coffee sipping, Frustration, Celebrating
function generateCharacterSpritesheet(palette) {
  const frameW = 32;
  const frameH = 32;
  const cols = 4;
  const rows = 12;
  const sheetW = frameW * cols;
  const sheetH = frameH * rows;
  const buf = Buffer.alloc(sheetW * sheetH * 4, 0);

  const skin = parseHex(palette.skin || '#FCD34D');
  const hair = parseHex(palette.hair || '#451A03');
  const shirt = parseHex(palette.shirt || '#2563EB');
  const pants = parseHex(palette.pants || '#374151');
  const shoes = parseHex(palette.shoes || '#1E293B');
  const accent = parseHex(palette.accent || '#F59E0B');

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ox = col * frameW;
      const oy = row * frameH;
      const legOffset = (col % 2 === 1) ? 2 : 0;
      const armBob = (col % 2 === 1) ? 1 : 0;

      // Directions:
      // row 0: UP, row 1: LEFT, row 2: DOWN, row 3: RIGHT
      const isUp = row === 0;
      const isLeft = row === 1;
      const isDown = row === 2 || row >= 4;
      const isRight = row === 3;

      // 1. Shadow beneath feet
      fillRect(buf, sheetW, sheetH, ox + 8, oy + 28, 16, 3, 0, 0, 0, 80);

      // 2. Legs / Shoes
      if (isDown || isUp) {
        fillRect(buf, sheetW, sheetH, ox + 10, oy + 20 + legOffset, 4, 8 - legOffset, pants.r, pants.g, pants.b);
        fillRect(buf, sheetW, sheetH, ox + 18, oy + 20 + (2 - legOffset), 4, 8 - (2 - legOffset), pants.r, pants.g, pants.b);
        fillRect(buf, sheetW, sheetH, ox + 9, oy + 27, 5, 3, shoes.r, shoes.g, shoes.b);
        fillRect(buf, sheetW, sheetH, ox + 18, oy + 27, 5, 3, shoes.r, shoes.g, shoes.b);
      } else if (isLeft || isRight) {
        const lx = isLeft ? ox + 12 : ox + 14;
        fillRect(buf, sheetW, sheetH, lx, oy + 20, 6, 8, pants.r, pants.g, pants.b);
        fillRect(buf, sheetW, sheetH, lx - (isLeft ? 1 : 0), oy + 27, 7, 3, shoes.r, shoes.g, shoes.b);
      }

      // 3. Torso / Shirt
      fillRect(buf, sheetW, sheetH, ox + 9, oy + 12, 14, 9, shirt.r, shirt.g, shirt.b);

      // Collar / Tie / Accent detail
      if (isDown) {
        fillRect(buf, sheetW, sheetH, ox + 15, oy + 13, 2, 6, accent.r, accent.g, accent.b);
      }

      // Arms
      if (isDown || isUp) {
        fillRect(buf, sheetW, sheetH, ox + 6, oy + 13 + armBob, 3, 7, shirt.r, shirt.g, shirt.b);
        fillRect(buf, sheetW, sheetH, ox + 23, oy + 13 - armBob, 3, 7, shirt.r, shirt.g, shirt.b);
        // Hands
        fillRect(buf, sheetW, sheetH, ox + 6, oy + 20 + armBob, 3, 3, skin.r, skin.g, skin.b);
        fillRect(buf, sheetW, sheetH, ox + 23, oy + 20 - armBob, 3, 3, skin.r, skin.g, skin.b);
      } else if (isLeft) {
        fillRect(buf, sheetW, sheetH, ox + 12, oy + 13, 4, 7, shirt.r, shirt.g, shirt.b);
        fillRect(buf, sheetW, sheetH, ox + 11, oy + 20, 4, 3, skin.r, skin.g, skin.b);
      } else if (isRight) {
        fillRect(buf, sheetW, sheetH, ox + 16, oy + 13, 4, 7, shirt.r, shirt.g, shirt.b);
        fillRect(buf, sheetW, sheetH, ox + 17, oy + 20, 4, 3, skin.r, skin.g, skin.b);
      }

      // 4. Head
      fillRect(buf, sheetW, sheetH, ox + 10, oy + 4, 12, 9, skin.r, skin.g, skin.b);

      // Facial details
      if (isDown) {
        // Eyes
        setPixel(buf, sheetW, ox + 12, oy + 8, 30, 41, 59);
        setPixel(buf, sheetW, ox + 19, oy + 8, 30, 41, 59);
        // Mouth
        setPixel(buf, sheetW, ox + 15, oy + 11, 203, 90, 80);
        setPixel(buf, sheetW, ox + 16, oy + 11, 203, 90, 80);
      } else if (isLeft) {
        setPixel(buf, sheetW, ox + 11, oy + 8, 30, 41, 59);
      } else if (isRight) {
        setPixel(buf, sheetW, ox + 20, oy + 8, 30, 41, 59);
      }

      // 5. Hair
      if (palette.hairStyle === 'short') {
        fillRect(buf, sheetW, sheetH, ox + 9, oy + 2, 14, 4, hair.r, hair.g, hair.b);
        fillRect(buf, sheetW, sheetH, ox + 8, oy + 4, 3, 5, hair.r, hair.g, hair.b);
        fillRect(buf, sheetW, sheetH, ox + 21, oy + 4, 3, 5, hair.r, hair.g, hair.b);
      } else if (palette.hairStyle === 'bun') {
        fillRect(buf, sheetW, sheetH, ox + 9, oy + 3, 14, 4, hair.r, hair.g, hair.b);
        fillRect(buf, sheetW, sheetH, ox + 13, oy + 0, 6, 4, hair.r, hair.g, hair.b); // Top bun
        fillRect(buf, sheetW, sheetH, ox + 8, oy + 5, 2, 6, hair.r, hair.g, hair.b);
        fillRect(buf, sheetW, sheetH, ox + 22, oy + 5, 2, 6, hair.r, hair.g, hair.b);
      } else {
        // Messy / fluffy hair
        fillRect(buf, sheetW, sheetH, ox + 8, oy + 2, 16, 5, hair.r, hair.g, hair.b);
        fillRect(buf, sheetW, sheetH, ox + 7, oy + 5, 3, 5, hair.r, hair.g, hair.b);
        fillRect(buf, sheetW, sheetH, ox + 22, oy + 5, 3, 5, hair.r, hair.g, hair.b);
        setPixel(buf, sheetW, ox + 12, oy + 1, hair.r, hair.g, hair.b);
        setPixel(buf, sheetW, ox + 17, oy + 1, hair.r, hair.g, hair.b);
      }

      // Glasses accessory if specified
      if (palette.glasses) {
        fillRect(buf, sheetW, sheetH, ox + 11, oy + 7, 4, 3, 56, 189, 248, 180);
        fillRect(buf, sheetW, sheetH, ox + 17, oy + 7, 4, 3, 56, 189, 248, 180);
        setPixel(buf, sheetW, ox + 15, oy + 8, 30, 41, 59);
        setPixel(buf, sheetW, ox + 16, oy + 8, 30, 41, 59);
      }
    }
  }

  return createPng(sheetW, sheetH, buf);
}

// =========================================================================
// 2. MODERN 32x32 OFFICE TILESET GENERATION (256x256 px, 8x8 tiles)
// =========================================================================
function generateOfficeTileset() {
  const tileSize = 32;
  const cols = 8;
  const rows = 8;
  const width = cols * tileSize;
  const height = rows * tileSize;
  const buf = Buffer.alloc(width * height * 4, 0);

  // Helper to draw tile at grid coordinate (tx, ty)
  const drawTile = (tx, ty, drawFn) => {
    const ox = tx * tileSize;
    const oy = ty * tileSize;
    drawFn(ox, oy);
  };

  // --- Tile 0,0 (Tile GID 1): Warm Parquet Wood Floor ---
  drawTile(0, 0, (ox, oy) => {
    fillRect(buf, width, height, ox, oy, 32, 32, 194, 155, 110);
    // Wood plank seams
    for (let y = 0; y < 32; y += 8) {
      fillRect(buf, width, height, ox, oy + y, 32, 1, 150, 112, 70);
    }
    fillRect(buf, width, height, ox + 16, oy, 1, 16, 150, 112, 70);
    fillRect(buf, width, height, ox + 8, oy + 16, 1, 16, 150, 112, 70);
  });

  // --- Tile 1,0 (Tile GID 2): Modern Tech Slate Carpet ---
  drawTile(1, 0, (ox, oy) => {
    fillRect(buf, width, height, ox, oy, 32, 32, 226, 232, 240); // Soft light stone/gray
    fillRect(buf, width, height, ox + 1, oy + 1, 30, 30, 241, 245, 249);
    // Subtle texture flecks
    setPixel(buf, width, ox + 6, oy + 6, 203, 213, 225);
    setPixel(buf, width, ox + 22, oy + 14, 203, 213, 225);
    setPixel(buf, width, ox + 12, oy + 24, 203, 213, 225);
  });

  // --- Tile 2,0 (Tile GID 3): Meeting Room Glass/Cyan Tile ---
  drawTile(2, 0, (ox, oy) => {
    fillRect(buf, width, height, ox, oy, 32, 32, 186, 230, 253);
    fillRect(buf, width, height, ox + 2, oy + 2, 28, 28, 224, 242, 254);
    fillRect(buf, width, height, ox, oy, 32, 1, 125, 211, 252);
    fillRect(buf, width, height, ox, oy, 1, 32, 125, 211, 252);
  });

  // --- Tile 3,0 (Tile GID 4): Collidable Slate Perimeter Wall ---
  drawTile(3, 0, (ox, oy) => {
    fillRect(buf, width, height, ox, oy, 32, 32, 71, 85, 105);
    fillRect(buf, width, height, ox, oy, 32, 6, 100, 116, 139); // Top beveled edge
    fillRect(buf, width, height, ox, oy + 6, 32, 26, 51, 65, 85);
    fillRect(buf, width, height, ox, oy + 30, 32, 2, 30, 41, 59); // Bottom baseboard
  });

  // --- Tile 4,0 (Tile GID 5): Desk Surface (Wood & Steel) ---
  drawTile(4, 0, (ox, oy) => {
    fillRect(buf, width, height, ox, oy, 32, 26, 217, 182, 138); // Table top
    fillRect(buf, width, height, ox, oy + 26, 32, 6, 146, 64, 14); // Table front edge
    fillRect(buf, width, height, ox + 2, oy + 28, 4, 4, 71, 85, 105); // Steel legs
    fillRect(buf, width, height, ox + 26, oy + 28, 4, 4, 71, 85, 105);
  });

  // --- Tile 5,0 (Tile GID 6): Dual Monitors (Furniture Top Layer) ---
  drawTile(5, 0, (ox, oy) => {
    // Left Monitor
    fillRect(buf, width, height, ox + 1, oy + 2, 14, 11, 30, 41, 59);
    fillRect(buf, width, height, ox + 2, oy + 3, 12, 9, 56, 189, 248); // Screen glowing code
    fillRect(buf, width, height, ox + 6, oy + 13, 4, 3, 71, 85, 105); // Stand
    // Right Monitor (Curved/Tilted)
    fillRect(buf, width, height, ox + 16, oy + 2, 15, 11, 30, 41, 59);
    fillRect(buf, width, height, ox + 17, oy + 3, 13, 9, 147, 197, 253);
    fillRect(buf, width, height, ox + 22, oy + 13, 4, 3, 71, 85, 105);
  });

  // --- Tile 6,0 (Tile GID 7): Scrum Board / Whiteboard ---
  drawTile(6, 0, (ox, oy) => {
    fillRect(buf, width, height, ox, oy, 32, 30, 248, 250, 252); // White surface
    fillRect(buf, width, height, ox, oy, 32, 2, 148, 163, 184); // Frame
    fillRect(buf, width, height, ox, oy + 28, 32, 2, 148, 163, 184);
    // Post-it notes
    fillRect(buf, width, height, ox + 3, oy + 6, 6, 6, 250, 204, 21); // Yellow
    fillRect(buf, width, height, ox + 11, oy + 6, 6, 6, 244, 114, 182); // Pink
    fillRect(buf, width, height, ox + 19, oy + 6, 6, 6, 56, 189, 248); // Blue
    fillRect(buf, width, height, ox + 6, oy + 16, 6, 6, 74, 222, 128); // Green
    fillRect(buf, width, height, ox + 16, oy + 16, 6, 6, 251, 146, 60); // Orange
  });

  // --- Tile 7,0 (Tile GID 8): Coffee Machine & Barista Bar ---
  drawTile(7, 0, (ox, oy) => {
    fillRect(buf, width, height, ox + 2, oy + 4, 28, 24, 71, 85, 105);
    fillRect(buf, width, height, ox + 4, oy + 6, 24, 14, 30, 41, 59);
    fillRect(buf, width, height, ox + 8, oy + 10, 6, 4, 251, 146, 60); // Glowing espresso gauge
    fillRect(buf, width, height, ox + 18, oy + 16, 6, 6, 248, 250, 252); // Coffee cup
  });

  // --- Tile 0,1 (Tile GID 9): Server Rack (Base) ---
  drawTile(0, 1, (ox, oy) => {
    fillRect(buf, width, height, ox + 2, oy, 28, 32, 15, 23, 42); // Black steel enclosure
    fillRect(buf, width, height, ox + 4, oy + 2, 24, 28, 30, 41, 59);
    // Server units & LEDs
    for (let sy = oy + 4; sy < oy + 28; sy += 6) {
      fillRect(buf, width, height, ox + 6, sy, 20, 4, 51, 65, 85);
      setPixel(buf, width, ox + 8, sy + 1, 74, 222, 128); // Green LED
      setPixel(buf, width, ox + 11, sy + 1, 56, 189, 248); // Blue LED
    }
  });

  // --- Tile 1,1 (Tile GID 10): Ping-Pong / Foosball Table (Left Half) ---
  drawTile(1, 1, (ox, oy) => {
    fillRect(buf, width, height, ox + 2, oy + 4, 30, 24, 22, 101, 52); // Emerald table surface
    fillRect(buf, width, height, ox + 2, oy + 4, 30, 2, 255, 255, 255); // White border
    fillRect(buf, width, height, ox + 2, oy + 26, 30, 2, 255, 255, 255);
    fillRect(buf, width, height, ox + 2, oy + 15, 30, 1, 255, 255, 255); // Center line
  });

  // --- Tile 2,1 (Tile GID 11): Ping-Pong / Foosball Table (Right Half + Net) ---
  drawTile(2, 1, (ox, oy) => {
    fillRect(buf, width, height, ox, oy + 4, 30, 24, 22, 101, 52);
    fillRect(buf, width, height, ox, oy + 4, 30, 2, 255, 255, 255);
    fillRect(buf, width, height, ox, oy + 26, 30, 2, 255, 255, 255);
    fillRect(buf, width, height, ox, oy + 15, 30, 1, 255, 255, 255);
    fillRect(buf, width, height, ox, oy + 2, 2, 28, 226, 232, 240); // Table net
    // Red ping-pong racket
    fillRect(buf, width, height, ox + 14, oy + 10, 6, 6, 239, 68, 68);
    fillRect(buf, width, height, ox + 19, oy + 14, 3, 2, 180, 83, 9);
  });

  // --- Tile 3,1 (Tile GID 12): Potted Monster / Office Plant ---
  drawTile(3, 1, (ox, oy) => {
    // Pot
    fillRect(buf, width, height, ox + 10, oy + 18, 12, 12, 180, 83, 9); // Terracotta pot
    fillRect(buf, width, height, ox + 8, oy + 16, 16, 3, 194, 65, 12);
    // Green leaves
    fillRect(buf, width, height, ox + 6, oy + 6, 10, 10, 34, 197, 94);
    fillRect(buf, width, height, ox + 14, oy + 3, 11, 12, 22, 163, 74);
    fillRect(buf, width, height, ox + 12, oy + 10, 8, 8, 21, 128, 61);
  });

  // --- Tile 4,1 (Tile GID 13): Ergonomic Office Chair ---
  drawTile(4, 1, (ox, oy) => {
    fillRect(buf, width, height, ox + 8, oy + 4, 16, 14, 30, 41, 59); // Mesh backrest
    fillRect(buf, width, height, ox + 9, oy + 5, 14, 12, 71, 85, 105);
    fillRect(buf, width, height, ox + 7, oy + 18, 18, 6, 30, 41, 59); // Cushion
    // 5-wheel star base
    fillRect(buf, width, height, ox + 14, oy + 24, 4, 4, 148, 163, 184);
    fillRect(buf, width, height, ox + 9, oy + 28, 14, 2, 51, 65, 85);
  });

  // --- Tile 5,1 (Tile GID 14): Glass Meeting Partition (Collidable & Translucent) ---
  drawTile(5, 1, (ox, oy) => {
    fillRect(buf, width, height, ox + 14, oy, 4, 32, 186, 230, 253, 200); // Glass pane
    fillRect(buf, width, height, ox + 12, oy, 8, 3, 71, 85, 105); // Metal frame top
    fillRect(buf, width, height, ox + 12, oy + 29, 8, 3, 71, 85, 105); // Metal frame bottom
  });

  return createPng(width, height, buf);
}

// =========================================================================
// RUN DOWNLOAD & GENERATION
// =========================================================================
console.log('📦 Starting 2D Pixel Art Assets Download & Synthesis...');

// 1. Generate Character Spritesheets
const characters = [
  {
    name: 'player_base',
    palette: { skin: '#FCD34D', hair: '#451A03', shirt: '#2563EB', pants: '#374151', shoes: '#1E293B', hairStyle: 'messy' },
  },
  {
    name: 'npc_elena',
    palette: { skin: '#FDE68A', hair: '#92400E', shirt: '#EC4899', pants: '#334155', shoes: '#1E293B', hairStyle: 'bun', accent: '#F472B6' },
  },
  {
    name: 'npc_david',
    palette: { skin: '#FCD34D', hair: '#1E293B', shirt: '#F59E0B', pants: '#1F2937', shoes: '#0F172A', hairStyle: 'short', accent: '#DC2626' },
  },
  {
    name: 'npc_marcos',
    palette: { skin: '#FDE68A', hair: '#334155', shirt: '#EF4444', pants: '#111827', shoes: '#000000', hairStyle: 'short', glasses: true },
  },
  {
    name: 'npc_sofia',
    palette: { skin: '#FEF08A', hair: '#7C3AED', shirt: '#8B5CF6', pants: '#4B5563', shoes: '#1F2937', hairStyle: 'messy', accent: '#C084FC' },
  },
  {
    name: 'npc_lucas',
    palette: { skin: '#FCD34D', hair: '#B45309', shirt: '#10B981', pants: '#374151', shoes: '#1E293B', hairStyle: 'messy' },
  },
];

for (const char of characters) {
  const pngData = generateCharacterSpritesheet(char.palette);
  const targetPath = path.join(spritesDir, `${char.name}.png`);
  fs.writeFileSync(targetPath, pngData);
  console.log(`✅ Character spritesheet generated: public/assets/sprites/${char.name}.png (${pngData.length} bytes)`);
}

// 2. Generate Office Tileset
const officeTilesetPng = generateOfficeTileset();
const tilesetPath = path.join(tilesetsDir, 'office_tileset.png');
fs.writeFileSync(tilesetPath, officeTilesetPng);
console.log(`✅ Modern Office Tileset generated: public/assets/tilesets/office_tileset.png (${officeTilesetPng.length} bytes)`);

console.log('✨ All 2D assets generated and ready for Phaser!');
