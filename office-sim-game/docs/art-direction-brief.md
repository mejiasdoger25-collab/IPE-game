# Art Direction Brief: Sprint Cero (DevLife RPG)

## 1. Vision & Visual Identity
- **Genre:** Top-Down 2D Workplace RPG / Soft Skills Simulation.
- **Visual Style:** Modern 2.5D Corporate Pixel Art with expressive character sprites and tech-office environments.
- **Grid Standard:** 32x32 px grid units, with character sprites fitting a 32x32 bounding box across 12 rows of 4 columns (128x384 px spritesheet).
- **Color Palette Philosophy:**
  - Base Office / Environment: Slate darks (`#0F172A`, `#1E293B`, `#334155`), warm natural oak/parquet wood (`#C29B6E`, `#92400E`), and emerald server glow (`#065F46`, `#10B981`).
  - Character Silhouettes: High-contrast clothing to ensure immediate readability against office carpeting.
  - NPC Signature Colors:
    - **Elena (Scrum Master):** Vibrant Rose / Magenta (`#EC4899`) — Empathy, facilitation, agile coordination.
    - **David (Product Owner):** Amber / Commercial Gold (`#F59E0B`) — Pressure, deadlines, and business drive.
    - **Marcos (Senior Backend):** Crimson Red (`#EF4444`) — Rigor, technical architecture, and pull-request scrutiny.
    - **Sofía (UX/UI Frontend):** Violet / Purple (`#8B5CF6`) — Design, intuition, and user empathy.
    - **Lucas (Junior Dev):** Mint / Emerald Green (`#10B981`) — Growth, eagerness, and junior vulnerability.

## 2. Universal LPC Spritesheet Specifications
- **Dimensions:** 32x32 pixels per frame, 4 frames per animation row (Sheet width: 128px, height: 384px).
- **Animation Rows:**
  - `Row 0`: Walk cycle Up (`walk-up`, 4 frames).
  - `Row 1`: Walk cycle Left (`walk-left`, 4 frames).
  - `Row 2`: Walk cycle Down (`walk-down`, 4 frames).
  - `Row 3`: Walk cycle Right (`walk-right`, 4 frames).
  - `Row 4`: Idle Stance (4 directions).
  - `Rows 5-7`: Sitting and typing at desk / workstation computer.
  - `Rows 8-11`: Emotional gestures:
    - Row 8: Stress / Overwhelm (head in hands).
    - Row 9: Celebration / Success (arms raised).
    - Row 10: Sipping Coffee / Procrastination.
    - Row 11: Assertive Presentation / Speaking at board.

## 3. Paper-Doll Layer Hierarchy & Tinting
All character sprites are composed of transparent layers merged from bottom to top:
1. `body`: Base humanoid silhouette in grayscale / skin tones.
2. `eyes`: Expressive pixel eyes.
3. `bottom`: Jeans, chinos, or work trousers.
4. `top`: Hoodie, t-shirt, or executive blazer.
5. `hair`: Modular hairstyles (messy, short, ponytail, buzzcut).
6. `accessory`: Eyeglasses, blue-light blockers, headphones.

**Luminance Multiplication Tinting:**
Greyscale asset layers are dynamically tinted with hex codes (`#RRGGBB`) by calculating the relative luminance of each non-zero pixel:
$$C_{\text{out}} = \frac{C_{\text{base}}}{255} \times C_{\text{tint}}$$
Preserving highlights and shadows while enabling 16.7 million custom colors.

## 4. Modern Office Tileset Specification (`public/assets/tilesets/office_tileset.png`)
- **Grid:** 8 columns x 8 rows of 32x32 px tiles (256x256 px total).
- **Tile GID Mapping:**
  - GID 1 (0,0): Parquet Oak Floor.
  - GID 2 (1,0): Modern Stone/Carpet Floor.
  - GID 3 (2,0): Meeting Room Cyan Glass Floor.
  - GID 4 (3,0): Slate Perimeter Wall (collidable, depth = y).
  - GID 5 (4,0): Desk Workstation Base (collidable).
  - GID 6 (5,0): Dual Monitors & Keyboard (Furniture_Top, depth = y + 32).
  - GID 7 (6,0): Scrum Board / Agile Post-Its Wall.
  - GID 8 (7,0): Espresso Coffee Bar.
  - GID 9 (0,1): Server Rack Pre-Production Base (with blinking green/blue LEDs).
  - GID 10-11 (1,1 & 2,1): Office Ping-Pong / Foosball Distraction Table.
  - GID 12 (3,1): Potted Monstera / Office Plant Canopy.
  - GID 13 (4,1): Ergonomic Mesh Swivel Chair.
  - GID 14 (5,1): Glass Meeting Room Partition.

## 5. UI & Typography Guidelines
- **Typography:** Google Font `'Inter'` (`400`, `500`, `600`, `700`, `800`) with high-contrast text (`#111827`, `text-stone-950`).
- **HUD Surfaces:** Warm light browns, sand, taupe, and soft stone grays (`#F4F1EA`, `#E6DEC8`, `#D6CFC2`, `#C2B299`).
