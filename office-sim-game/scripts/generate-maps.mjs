/**
 * scripts/generate-maps.mjs
 * Generates two rich 30x20 Tiled JSON office maps for DevLife RPG:
 * - startup.json (Cozy startup garage with open plan, ping-pong, coffee bar, scrum board)
 * - corporate.json (Formal corporate floor with executive desks, glass boardroom, data center)
 * Layers:
 * 1. Floor (depth -20)
 * 2. Walls_And_Furniture_Base (collidable, depth y)
 * 3. Furniture_Top (dual monitor tops, plant canopies, depth y + 32)
 * 4. Interactables (Object layer with all zones & NPC spawns)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const mapsDir = path.join(rootDir, 'public', 'assets', 'maps');

fs.mkdirSync(mapsDir, { recursive: true });

function createEmptyGrid(w, h, fillVal = 0) {
  return Array(w * h).fill(fillVal);
}

function setTile(grid, w, x, y, gid) {
  if (x >= 0 && x < w && y >= 0 && y < grid.length / w) {
    grid[y * w + x] = gid;
  }
}

function fillBox(grid, w, rx, ry, rw, rh, gid) {
  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      setTile(grid, w, x, y, gid);
    }
  }
}

// -------------------------------------------------------------
// 1. STARTUP OFFICE (startup.json)
// -------------------------------------------------------------
function buildStartupMap() {
  const w = 30;
  const h = 20;

  // Layer 1: Floor
  // GID 1: Parquet Wood Floor, GID 2: Slate Carpet, GID 3: Cyan Meeting Floor
  const floor = createEmptyGrid(w, h, 1); // Main floor is cozy oak parquet
  // Breakout area with carpet
  fillBox(floor, w, 1, 12, 10, 7, 2);
  // Meeting room with cyan tile
  fillBox(floor, w, 13, 14, 16, 5, 3);

  // Layer 2: Walls_And_Furniture_Base
  // GID 4: Wall, 5: Desk, 7: Scrum Board, 8: Coffee, 9: Server, 10: Pingpong L, 11: Pingpong R, 12: Plant base, 13: Chair, 14: Glass
  const base = createEmptyGrid(w, h, 0);

  // Perimeter walls
  fillBox(base, w, 0, 0, w, 1, 4); // Top
  fillBox(base, w, 0, h - 1, w, 1, 4); // Bottom
  fillBox(base, w, 0, 0, 1, h, 4); // Left
  fillBox(base, w, w - 1, 0, 1, h, 4); // Right

  // Meeting Room Glass Partitions
  fillBox(base, w, 13, 14, 1, 5, 14); // Left glass wall
  fillBox(base, w, 13, 14, 16, 1, 14); // Top glass wall
  setTile(base, w, 20, 14, 0); // Open entrance door

  // Desks & Chairs
  // Player Workstation
  setTile(base, w, 6, 7, 5);
  setTile(base, w, 7, 7, 5);
  setTile(base, w, 6, 8, 13); // Player chair

  // Lucas desk
  setTile(base, w, 11, 7, 5);
  setTile(base, w, 12, 7, 5);
  setTile(base, w, 11, 8, 13);

  // Marcos desk
  setTile(base, w, 22, 7, 5);
  setTile(base, w, 23, 7, 5);
  setTile(base, w, 22, 8, 13);

  // Sofía desk
  setTile(base, w, 16, 11, 5);
  setTile(base, w, 17, 11, 5);
  setTile(base, w, 16, 12, 13);

  // David Executive Desk
  setTile(base, w, 24, 3, 5);
  setTile(base, w, 25, 3, 5);
  setTile(base, w, 24, 2, 13);

  // Meeting Table (long desk in glass room)
  fillBox(base, w, 17, 16, 6, 2, 5);

  // Scrum Board (Top wall center)
  setTile(base, w, 14, 1, 7);
  setTile(base, w, 15, 1, 7);

  // Coffee Machine Bar (Breakout area)
  setTile(base, w, 2, 13, 8);
  setTile(base, w, 3, 13, 8);

  // Ping-Pong Table (Breakout area)
  setTile(base, w, 5, 15, 10);
  setTile(base, w, 6, 15, 11);

  // Server Rack Crisis (Top-left server corner)
  setTile(base, w, 2, 2, 9);
  setTile(base, w, 3, 2, 9);
  setTile(base, w, 2, 3, 9);
  setTile(base, w, 3, 3, 9);

  // Decorative Plants
  setTile(base, w, 1, 1, 12);
  setTile(base, w, w - 2, 1, 12);
  setTile(base, w, 12, 13, 12);
  setTile(base, w, 1, h - 2, 12);

  // Layer 3: Furniture_Top (Dual monitors & upper canopy layers)
  // GID 6: Dual monitors
  const top = createEmptyGrid(w, h, 0);
  setTile(top, w, 6, 7, 6); // Over player desk
  setTile(top, w, 11, 7, 6); // Over Lucas desk
  setTile(top, w, 22, 7, 6); // Over Marcos desk
  setTile(top, w, 16, 11, 6); // Over Sofía desk
  setTile(top, w, 24, 3, 6); // Over David desk

  // Layer 4: Interactables
  const interactables = [
    {
      id: 1,
      name: 'Pizarra Scrum',
      type: 'SCRUM_BOARD',
      x: 14 * 32,
      y: 1 * 32,
      width: 64,
      height: 32,
      properties: [
        { name: 'id', type: 'string', value: 'agile_board' },
        { name: 'label', type: 'string', value: 'Pizarra Scrum (Daily Stand-up)' },
        { name: 'dialogueNodeId', type: 'string', value: 'scene_1_1_daily' },
      ],
    },
    {
      id: 2,
      name: 'Mi Estación de Trabajo',
      type: 'WORKSTATION',
      x: 6 * 32,
      y: 7 * 32,
      width: 64,
      height: 32,
      properties: [
        { name: 'id', type: 'string', value: 'player_desk' },
        { name: 'label', type: 'string', value: 'Mi Estación de Trabajo (Kanban / Pomodoro / Gantt)' },
      ],
    },
    {
      id: 3,
      name: 'Elena Scrum Master',
      type: 'NPC_SPAWN',
      x: 14 * 32,
      y: 4 * 32,
      width: 32,
      height: 32,
      properties: [
        { name: 'id', type: 'string', value: 'elena_scrum' },
        { name: 'npcId', type: 'string', value: 'elena_scrum' },
        { name: 'label', type: 'string', value: 'Elena (Scrum Master)' },
        { name: 'dialogueNodeId', type: 'string', value: 'scene_1_1_daily' },
      ],
    },
    {
      id: 4,
      name: 'Lucas Junior Dev',
      type: 'NPC_SPAWN',
      x: 11 * 32,
      y: 7 * 32,
      width: 32,
      height: 32,
      properties: [
        { name: 'id', type: 'string', value: 'lucas_junior' },
        { name: 'npcId', type: 'string', value: 'lucas_junior' },
        { name: 'label', type: 'string', value: 'Lucas (Junior Dev)' },
        { name: 'dialogueNodeId', type: 'string', value: 'scene_1_1_daily' },
      ],
    },
    {
      id: 5,
      name: 'Mesa de Marcos',
      type: 'NPC_SPAWN',
      x: 22 * 32,
      y: 7 * 32,
      width: 32,
      height: 32,
      properties: [
        { name: 'id', type: 'string', value: 'marcos_senior' },
        { name: 'npcId', type: 'string', value: 'marcos_senior' },
        { name: 'label', type: 'string', value: 'Mesa de Marcos (Code Review)' },
        { name: 'dialogueNodeId', type: 'string', value: 'scene_1_2_marcos_pr' },
      ],
    },
    {
      id: 6,
      name: 'Despacho de David',
      type: 'MEETING_ROOM',
      x: 24 * 32,
      y: 3 * 32,
      width: 64,
      height: 32,
      properties: [
        { name: 'id', type: 'string', value: 'david_po' },
        { name: 'npcId', type: 'string', value: 'david_po' },
        { name: 'label', type: 'string', value: 'Despacho de David (Product Owner)' },
        { name: 'dialogueNodeId', type: 'string', value: 'scene_2_1_david_scope' },
      ],
    },
    {
      id: 7,
      name: 'Sala de Reuniones',
      type: 'MEETING_ROOM',
      x: 17 * 32,
      y: 16 * 32,
      width: 96,
      height: 48,
      properties: [
        { name: 'id', type: 'string', value: 'glass_room' },
        { name: 'label', type: 'string', value: 'Sala de Reuniones (Mediación Sofía vs Marcos)' },
        { name: 'dialogueNodeId', type: 'string', value: 'scene_2_2_meeting_war' },
      ],
    },
    {
      id: 8,
      name: 'Mesa de Sofía',
      type: 'NPC_SPAWN',
      x: 16 * 32,
      y: 11 * 32,
      width: 32,
      height: 32,
      properties: [
        { name: 'id', type: 'string', value: 'sofia_ux' },
        { name: 'npcId', type: 'string', value: 'sofia_ux' },
        { name: 'label', type: 'string', value: 'Sofía (UX/UI Designer)' },
        { name: 'dialogueNodeId', type: 'string', value: 'scene_2_2_meeting_war' },
      ],
    },
    {
      id: 9,
      name: 'Rack de Servidores',
      type: 'WORKSTATION',
      x: 2 * 32,
      y: 2 * 32,
      width: 64,
      height: 64,
      properties: [
        { name: 'id', type: 'string', value: 'server_rack_crisis' },
        { name: 'label', type: 'string', value: 'Rack de Servidores (Crisis Viernes Negro)' },
        { name: 'dialogueNodeId', type: 'string', value: 'scene_3_1_black_friday' },
      ],
    },
    {
      id: 10,
      name: 'Máquina de Café',
      type: 'COFFEE_MACHINE',
      x: 2 * 32,
      y: 13 * 32,
      width: 64,
      height: 32,
      properties: [
        { name: 'id', type: 'string', value: 'office_coffee' },
        { name: 'label', type: 'string', value: 'Máquina de Café (+45 min / Distracción)' },
      ],
    },
    {
      id: 11,
      name: 'Mesa de Ping-Pong',
      type: 'COFFEE_MACHINE', // distraction interaction
      x: 5 * 32,
      y: 15 * 32,
      width: 64,
      height: 32,
      properties: [
        { name: 'id', type: 'string', value: 'ping_pong_table' },
        { name: 'label', type: 'string', value: 'Mesa de Ping-Pong (+30 min / Distracción)' },
      ],
    },
  ];

  return {
    compressionlevel: -1,
    height: h,
    width: w,
    infinite: false,
    tileheight: 32,
    tilewidth: 32,
    type: 'map',
    version: '1.10',
    tiledversion: '1.10.0',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tilesets: [
      {
        columns: 8,
        firstgid: 1,
        image: 'tileset_office',
        imageheight: 256,
        imagewidth: 256,
        margin: 0,
        name: 'tileset_office',
        spacing: 0,
        tilecount: 64,
        tileheight: 32,
        tilewidth: 32,
      },
    ],
    layers: [
      {
        id: 1,
        name: 'Floor',
        type: 'tilelayer',
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: w,
        height: h,
        data: floor,
      },
      {
        id: 2,
        name: 'Walls_And_Furniture_Base',
        type: 'tilelayer',
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: w,
        height: h,
        properties: [{ name: 'collides', type: 'bool', value: true }],
        data: base,
      },
      {
        id: 3,
        name: 'Furniture_Top',
        type: 'tilelayer',
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: w,
        height: h,
        data: top,
      },
      {
        id: 4,
        name: 'Interactables',
        type: 'objectgroup',
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        draworder: 'topdown',
        objects: interactables,
      },
    ],
    nextlayerid: 5,
    nextobjectid: 12,
  };
}

// -------------------------------------------------------------
// 2. CORPORATE FLOOR (corporate.json)
// -------------------------------------------------------------
function buildCorporateMap() {
  const map = buildStartupMap();
  // Corporate floor uses slate stone carpet (GID 2) as base floor
  map.layers[0].data = createEmptyGrid(30, 20, 2);
  // Executive boardroom has warm oak parquet
  fillBox(map.layers[0].data, 30, 13, 14, 16, 5, 1);
  return map;
}

const startupData = buildStartupMap();
fs.writeFileSync(path.join(mapsDir, 'startup.json'), JSON.stringify(startupData, null, 2));
console.log('✅ Generated public/assets/maps/startup.json');

const corporateData = buildCorporateMap();
fs.writeFileSync(path.join(mapsDir, 'corporate.json'), JSON.stringify(corporateData, null, 2));
console.log('✅ Generated public/assets/maps/corporate.json');
