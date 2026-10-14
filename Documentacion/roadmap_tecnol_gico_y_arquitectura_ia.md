# Roadmap Tecnológico: Simulador 2D de Oficina ("DevLife RPG")
**Enfoque:** Desarrollo 100% asistido por IA | Plataforma: Navegador Web | Estilo: Top-Down 2D Pixel Art

---

## 1. Filosofía de Arquitectura "AI-First"

Para programar un videojuego completo exclusivamente mediante prompts de Inteligencia Artificial, la arquitectura debe cumplir tres reglas de oro:
1. **Separación estricta entre Lógica, Vista y Datos:** La IA comete errores cuando mezcla el renderizado gráfico del lienzo (*Canvas*) con árboles de diálogos complejos o temporizadores de interfaz. Por ello, usaremos un motor 2D solo para el mundo físico (movimiento, mapa, colisiones) y un framework declarativo web para toda la interfaz de usuario (diálogos, medidores emocionales, matriz de Eisenhower, cronómetros).
2. **Diseño Orientado a Datos (Data-Driven Design):** Toda la historia, las misiones, los modificadores de las **5 C**, las skins y los mapas deben vivir en archivos `.json` o `.ts` tipados. Así, la IA puede generar cientos de líneas de historia sin tocar el motor del juego.
3. **Tecnologías con máxima representación en los LLMs:** Elegimos herramientas con millones de ejemplos públicos para que la IA escriba código libre de *bugs* a la primera.

---

## 2. Stack Tecnológico Recomendado

### A. Core y Motor del Juego
* **Lenguaje:** **TypeScript** (Fundamental al programar con IA: el tipado estático evita que la IA invente variables inexistentes en las ramificaciones de la historia o en el estado del jugador).
* **Empaquetador (Bundler):** **Vite** (Arranque instantáneo en navegador y recarga en caliente).
* **Motor 2D:** **Phaser 3** (Versión $3.80+$).
  * *¿Por qué Phaser 3?* Es el motor 2D de navegador más documentado del mundo. Cualquier IA conoce al detalle su sistema de cámaras, físicas Arcade (`Arcade Physics`), animaciones por *spritesheets* y carga de mapas de **Tiled**.

### B. Interfaz de Usuario (UI) y Herramientas de Gestión
* **Framework UI:** **React 18+ con Tailwind CSS** (Superpuesto sobre el `<canvas>` de Phaser mediante posicionamiento absoluto HTML/CSS).
  * *¿Por qué híbrido Phaser + React?* Crear un Diagrama de Gantt interactivo, una Matriz de Eisenhower arrastrable (*drag & drop*), un reloj Pomodoro o una ventana de chat tipo Slack dentro del *Canvas* de un motor de juegos es tedioso. En React + Tailwind, la IA puede generar interfaces empresariales limpias, reactivas y animadas en segundos.
* **Iconografía y Gráficos de Métricas:** **Lucide React** (iconos) y **Recharts** (para mostrar al final de cada *Sprint* gráficas de rendimiento de las 5 C e Inteligencia Emocional).

### C. Puente de Estado y Narrativa Dinámica
* **Gestor de Estado Global:** **Zustand**.
  * Actúa como el "cerebro compartido" entre Phaser (el mundo 2D) y React (la interfaz). Cuando el jugador camina hacia un compañero en Phaser, Phaser actualiza Zustand y React abre automáticamente el diálogo con las opciones correspondientes al nivel actual de **Inteligencia Emocional ($IE$)**.
* **Motor de Diálogos y Ramificaciones:** **JSON Schema propio** o **Ink (`inkjs`)**.
  * Recomendamos una estructura de **Grafo de Nodos en JSON/TypeScript** generada por IA, donde cada nodo tiene condiciones de visibilidad (ej. $IE \ge 60$) y efectos directos sobre las variables del juego.

### D. Asistentes de IA para el Desarrollo
* **Generación de Código:** Cursor IDE / Windsurf / Claude / Gemini (usando contexto modular por archivos).
* **Generación de Assets Gráficos:** PixelLab (IA especializada en Pixel Art con direcciones de personaje), Midjourney + Aseprite, o generadores modulares abiertos.

---

## 3. Arquitectura de Skins Personalizadas (Custom Skins)

Para permitir que el jugador personalice su personaje al inicio o desbloquee vestimenta (ej. *Sudadera de Junior*, *Blazer de Tech Lead*, *Auriculares de Hiperfoco*), implementaremos el sistema **Paper-Doll (Capas Sincronizadas)** o **Composición de Spritesheet en Runtime**.

### Cómo funciona técnicamente:
1. **Estándar Universal LPC (Liberated Pixel Cup):** Todos los *spritesheets* siguen una cuadrícula idéntica (por ejemplo, celdas de $32 \times 32$ o $64 \times 64$ píxeles) con las mismas filas de animación:
   * Fila 0-3: Caminar (Arriba, Izquierda, Abajo, Derecha).
   * Fila 4-7: Sentarse / Teclear en el ordenador.
   * Fila 8-11: Gestos emocionales (Estrés, Celebración, Café).
2. **Composición Dinámica en Canvas (`DynamicTexture`):**
   * En lugar de cargar una imagen fija por personaje, el juego tiene capas transparentes separadas: `base_body.png`, `eyes.png`, `hair_style_01.png`, `shirt_hoodie.png`, `pants_jeans.png`, `accessories_glasses.png`.
   * Cuando el jugador elige su aspecto en un menú React, una función en segundo plano fusiona esas capas en un único `HTMLCanvasElement` temporal y lo registra en Phaser como la textura `"player_custom_skin"`.
3. **Aplicación de Tintes Hexadecimales:**
   * Las prendas y el pelo se guardan en escala de grises claros. Mediante la propiedad `setTint(0xHEXCODE)` o manipulación de píxeles en el Canvas, el jugador puede elegir cualquier color de pelo, piel o ropa con un selector de color (*color picker*).

### Estructura JSON de una Skin (Ejemplo para pedir a la IA):
```json
{
  "skinId": "tech_lead_outfit",
  "name": "Atuendo de Tech Lead",
  "unlockCondition": { "metric": "complementariedad", "min": 80 },
  "layers": {
    "body": "assets/skins/body_light.png",
    "hair": { "sprite": "assets/skins/hair_messy.png", "tint": "#4A2E1B" },
    "top": { "sprite": "assets/skins/shirt_blazer.png", "tint": "#1E3A8A" },
    "bottom": { "sprite": "assets/skins/pants_chinos.png", "tint": "#374151" },
    "accessory": "assets/skins/glasses_blueblock.png"
  }
}
```

---

## 4. Arquitectura de Mapas Personalizados (Custom Maps)

La oficina debe ser un entorno vivo y modificable (ej. cambiar de una *Startup en un garaje* a una *Oficina Corporativa Moderna*, o permitir que el usuario cargue su propio diseño de oficina).

### Flujo de Trabajo con Tiled Map Editor + JSON:
1. **Estándar Tiled (`.tmj` / `.json`):** Utilizaremos **Tiled** (editor gratuito estándar en 2D) o un editor *in-game* basado en cuadrícula que exporte exactamente al mismo esquema JSON.
2. **Capas Obligatorias del Mapa:**
   * `Floor` (Suelo: moqueta, madera, baldosas de sala de servidores).
   * `Walls_And_Furniture_Base` (Paredes, mesas, pizarras — con propiedad `collides: true`).
   * `Furniture_Top` (Bordes superiores de monitores, plantas altas — se renderizan *por encima* del jugador para dar profundidad 2.5D).
   * `Interactables` (Capa de Objetos `Object Layer`): Define zonas interactivas mediante coordenadas y propiedades personalizadas.

### Conexión de Objetos del Mapa con las Mecánicas del Juego:
En la capa `Interactables` del JSON del mapa, cada objeto tiene un `type` y un `id` que Phaser detecta cuando el jugador se acerca y pulsa la tecla `E`:
* `type: "WORKSTATION"` $\rightarrow$ Abre el minijuego de programación / gestión de tareas y temporizadores.
* `type: "SCRUM_BOARD"` $\rightarrow$ Abre la interfaz React del **Diagrama de Gantt** o la **Matriz de Eisenhower**.
* `type: "NPC_SPAWN"` (con propiedad `npcId: "marcos_senior"`) $\rightarrow$ Instancia al compañero en esa posición.
* `type: "COFFEE_MACHINE"` $\rightarrow$ Zona de eventos casuales, recuperación de energía o riesgo de procrastinación si se abusa.
* `type: "MEETING_ROOM"` $\rightarrow$ Punto de inicio de las *Daily Stand-ups*, *Sprint Reviews* y negociaciones con el jefe.

---

## 5. Estructura de Carpetas del Proyecto (Lista para IA)

Cuando inicialices el proyecto con la IA, pídele que respete exactamente este árbol de directorios para mantener el contexto limpio:

```text
/office-sim-game
├── /public
│   ├── /assets
│   │   ├── /maps          # Archivos JSON de mapas (startup.json, corporate.json) y tilesets
│   │   ├── /skins         # Capas modulares PNG de personajes (cuerpo, pelo, ropa)
│   │   └── /audio         # Sonidos de teclado, murmullo de oficina, alertas de Slack
├── /src
│   ├── /core              # Configuración de Phaser, carga de assets y escenas 2D
│   │   ├── OfficeScene.ts # Escena principal: movimiento, colisiones, triggers de objetos
│   │   └── SkinBuilder.ts # Generador dinámico de spritesheets personalizados
│   ├── /state             # Estado global con Zustand
│   │   ├── useGameStore.ts    # Métricas: IE, Las 5 C, Tiempo, Strikes de Procrastinación
│   │   └── useQuestStore.ts   # Estado actual del árbol narrativo y misiones activas
│   ├── /data              # Contenido narrativo puro (Generado con IA)
│   │   ├── storyNodes.ts      # Todos los diálogos, pensamientos internos y consecuencias
│   │   ├── npcs.ts            # Perfiles psicológicos y umbrales de relación de cada NPC
│   │   └── tasks.ts           # Tareas técnicas del Sprint con sus tiempos y prioridades
│   ├── /ui                # Componentes en React + Tailwind superpuestos al juego
│   │   ├── DialogueBox.tsx    # Ventana de conversación con indicadores de técnica (Empatía, Asertividad)
│   │   ├── HUD.tsx            # Barras de Inteligencia Emocional, Reloj del Sprint y 5 C
│   │   ├── /tools             # Herramientas desbloqueables de Gestión del Tiempo
│   │   │   ├── PomodoroTimer.tsx
│   │   │   ├── EisenhowerMatrix.tsx
│   │   │   ├── ParetoAnalyzer.tsx
│   │   │   └── GanttChart.tsx
│   │   └── SkinCustomizer.tsx # Creador de personajes y cargador de mapas JSON
│   └── App.tsx            # Contenedor principal que une Phaser y React
└── package.json
```

---

## 6. Roadmap de Implementación (Fases por Prompts para IA)

Para no saturar la ventana de contexto de la IA al programar, sigue este orden de construcción iterativo:

### Fase 1: Esqueleto Híbrido y Mapa Base (Semanas 1-2)
* **Objetivo:** Tener un personaje moviéndose por una oficina 2D con una barra superior en React.
* **Qué pedirle a la IA:**
  1. *"Crea un proyecto en Vite con React, TypeScript, Tailwind CSS, Phaser 3 y Zustand."*
  2. *"Crea un componente `PhaserGame.tsx` que inicialice una escena `OfficeScene` con vista top-down, cargue un mapa JSON de una oficina con paredes colisionables y objetos interactivos (Mi Mesa, Pizarra Scrum, Cafetera, Mesa del Jefe)."*
  3. *"Añade un sistema donde al acercarme a un objeto o NPC y pulsar 'E', se actualice el estado en Zustand indicando con qué estoy interactuando."*

### Fase 2: Sistema de Skins y Mapas Personalizados (Semana 3)
* **Objetivo:** Permitir personalizar al protagonista y cambiar la distribución de la oficina.
* **Qué pedirle a la IA:**
  1. *"Crea la clase `SkinBuilder.ts` que reciba una configuración JSON de capas (cuerpo, pelo, camisa, pantalón y colores hexadecimales), las dibuje en un Canvas oculto y genere el spritesheet animado del jugador."*
  2. *"Crea un modal en React (`SkinCustomizer.tsx`) para elegir la apariencia antes de empezar a jugar y un selector/editor simple para cargar distintos archivos JSON de mapas de oficina."*

### Fase 3: El Motor Psicológico (IE, Las 5 C y Técnicas de Comunicación) (Semanas 4-5)
* **Objetivo:** Implementar el motor de decisiones, los pensamientos internos y la reacción dinámica del entorno.
* **Qué pedirle a la IA:**
  1. *"En `useGameStore.ts`, implementa el estado de Inteligencia Emocional ($0$ a $100$), las 5 C del trabajo en equipo (Compromiso, Confianza, Coordinación, Comunicación, Complementariedad) y el nivel de Procrastinación."*
  2. *"Crea el componente `DialogueBox.tsx` que soporte: (a) Pensamientos internos del protagonista en cursiva antes de decidir, (b) Opciones de respuesta etiquetadas internamente por técnica (Asertiva, Pasiva, Agresiva, Escucha Activa, Empática), y (c) Variación del texto que dicen los NPCs según si mi Inteligencia Emocional está en umbral Bajo ($<35$), Medio ($35-74$) o Alto ($\ge 75$)."*

### Fase 4: Gestión del Tiempo, Procrastinación y Herramientas Desbloqueables (Semanas 6-7)
* **Objetivo:** Convertir el tiempo en un recurso crítico y programar las 4 metodologías de productividad.
* **Qué pedirle a la IA:**
  1. *"Implementa un reloj de jornada laboral (9:00 a 18:00) y temporizadores de entrega por tarea. Si una tarea vence sin completarse por usar objetos de distracción o mala planificación, suma +1 Strike de Procrastinación. Al llegar a 3 Strikes, dispara la pantalla de Despido."*
  2. *"Programa un árbol de desbloqueo donde al entregar $X$ tareas a tiempo se activen en la interfaz de la mesa de trabajo cuatro módulos interactivos: 1) Reloj Pomodoro (da un buff de velocidad $+25\%$ y bloquea distracciones), 2) Matriz de Eisenhower (permite clasificar tareas en 4 cuadrantes para delegar o descartar), 3) Escáner de Pareto $80/20$ (resalta la subtarea clave que completa el $80\%$ del progreso), y 4) Diagrama de Gantt (muestra dependencias con compañeros para evitar bloqueos)."*

### Fase 5: Inyección de la Historia, Conflictos y Múltiples Finales (Semana 8)
* **Objetivo:** Volcar el guion completo del documento narrativo en `storyNodes.ts` y conectar el evaluador de finales.
* **Qué pedirle a la IA:**
  1. *"Convierte los Actos 1, 2 y 3 del archivo de historia en estructuras de nodos JSON tipados en `storyNodes.ts`, incluyendo el escalado de dificultad en las negociaciones según el historial previo del jugador."*
  2. *"Crea la pantalla de Evaluación Final de Contrato que calcule cuál de los 6 finales obtiene el jugador según sus métricas acumuladas."*