// Reemplaza el array definitions dentro de create() en src/core/OfficeScene.ts:
    const definitions: Array<{
      x: number;
      y: number;
      tex: string;
      type: InteractableType;
      id: string;
      label: string;
      dialogueNodeId?: string;
    }> = [
      {
        x: 450,
        y: 95,
        tex: 'scrum_board_tex',
        type: 'SCRUM_BOARD',
        id: 'scrum_board_1',
        label: '1. Pizarra Scrum (Acto 1: Daily con Elena y Lucas)',
        dialogueNodeId: 'scene_1_1_daily',
      },
      {
        x: 190,
        y: 230,
        tex: 'workstation_tex',
        type: 'WORKSTATION',
        id: 'my_desk',
        label: 'Mi Estación de Trabajo (Pomodoro / Eisenhower / Gantt)',
      },
      {
        x: 700,
        y: 230,
        tex: 'npc_marcos',
        type: 'NPC_SPAWN',
        id: 'marcos_senior',
        label: '2. Mesa de Marcos (Acto 1: Code Review)',
        dialogueNodeId: 'scene_1_2_marcos_pr',
      },
      {
        x: 700,
        y: 410,
        tex: 'npc_david',
        type: 'MEETING_ROOM',
        id: 'david_po',
        label: '3. Despacho de David (Acto 2: Negociar Scope Creep)',
        dialogueNodeId: 'scene_2_1_david_scope',
      },
      {
        x: 450,
        y: 490,
        tex: 'npc_elena',
        type: 'MEETING_ROOM',
        id: 'meeting_room_conflict',
        label: '4. Sala de Reuniones (Acto 2: Mediación Sofía vs Marcos)',
        dialogueNodeId: 'scene_2_2_meeting_war',
      },
      {
        x: 450,
        y: 250,
        tex: 'workstation_tex',
        type: 'WORKSTATION',
        id: 'server_rack_crisis',
        label: '5. Servidor Pre-Producción (Acto 3: Crisis Viernes Negro)',
        dialogueNodeId: 'scene_3_1_black_friday',
      },
      {
        x: 190,
        y: 440,
        tex: 'coffee_tex',
        type: 'COFFEE_MACHINE',
        id: 'coffee_machine',
        label: 'Máquina de Café (Tentación: +45 min)',
      },
    ];