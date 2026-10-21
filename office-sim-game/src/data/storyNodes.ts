/**
 * src/data/storyNodes.ts
 * Guion Estructurado Completo de "NovaSoft Solutions: FinTrack 2.0"
 */

import type { FiveCMetrics, TimeTool, NPCAffinities } from '../types/game';

export type CommunicationStyle =
  | 'Asertiva / Profesional'
  | 'Agresiva / Arrogante'
  | 'Pasiva / Insegura'
  | 'Mentoría + Confianza'
  | 'Gestión de Conflictos'
  | 'Escucha Activa'
  | 'Asertividad + Negociación'
  | 'Coordinación Agile (WIP)'
  | 'Priorización + Coordinación'
  | 'Mediación Empática'
  | 'Defensa de Calidad'
  | 'Seguridad Psicológica'
  | 'Comunicación Efectiva'
  | 'Enfoque / Gestión del Tiempo'
  | 'Liderazgo Motivador'
  | 'Individualista / Rechazo'
  | 'Paternalismo Agresivo'
  | 'Escucha Activa + Las 5 C'
  | 'Agresiva'
  | 'Pasiva / Sumisa'
  | 'Asertiva + Complementariedad'
  | 'Negociación Integrativa (Pareto + Eisenhower)'
  | 'Evitación / Huida'
  | 'Tomar Partido / Culpar'
  | 'Mediación + Reformulación + Gantt'
  | 'Chivo Expiatorio / Traición'
  | 'Liderazgo + Responsabilidad Compartida';

export interface DialogueOption {
  id: string;
  label: string;
  styleTag: CommunicationStyle;
  timeCostMinutes: number;
  ieDelta: number;
  fiveCDelta: Partial<FiveCMetrics>;
  affinityDelta?: Partial<NPCAffinities>;
  stressDelta?: number;
  timeManagementDelta?: number;
  unlocksTool?: TimeTool;
  setsFlag?: string;
  causesStrike?: number;
  triggersEndingEvaluation?: boolean;
  consequenceText: string;
  nextNodeId?: string | null;
}

export interface StoryNode {
  id: string;
  act: 1 | 2 | 3;
  title: string;
  speaker: string;
  speakerRole: string;
  isInterruption?: boolean;
  returnModal?: 'WORKSTATION' | 'NONE';
  dialogueByIE: {
    high: string;
    normal: string;
    low: string;
  };
  internalThought: string;
  options: DialogueOption[];
}

export const ACT_INTERRUPTIONS: Record<1 | 2 | 3, string[]> = {
  1: [
    'act1_int1_lucas',
    'act1_int2_marcos',
    'act1_int3_sofia',
    'act1_int4_david',
    'act1_int5_elena',
  ],
  2: [
    'act2_int1_conflict',
    'act2_int2_david',
    'act2_int3_lucas',
    'act2_int4_marcos',
    'act2_int5_spam',
  ],
  3: [
    'act3_int1_bug',
    'act3_int2_marcos',
    'act3_int3_sofia',
    'act3_int4_lucas',
    'act3_int5_david',
  ],
};

export const STORY_NODES: Record<string, StoryNode> = {
  // ============================================================================
  // ACTO 1: SPRINT 1 - "CONOCIENDO EL TERRENO"
  // ============================================================================

  act1_daily: {
    id: 'act1_daily',
    act: 1,
    title: 'Acto 1 · La Daily Stand-up: "Conociendo el Terreno"',
    speaker: 'Elena',
    speakerRole: 'Scrum Master & Facilitadora',
    dialogueByIE: {
      high: 'Elena reúne al equipo frente a la pizarra Kanban: "¡Bienvenidos al Sprint 1 de FinTrack 2.0! Os presento a vuestro nuevo compañero Fullstack. Aquí trabajamos con David (Negocio), Marcos (Arquitectura Backend), Sofía (Diseño UX/UI) y Lucas (Junior Dev). ¿Cómo quieres presentarte al equipo?"',
      normal: 'Elena reúne al equipo frente a la pizarra: "Buenos días. Arrancamos el Sprint 1 de FinTrack 2.0. Tenemos a David como Product Owner, Marcos en Backend, Sofía en UX/UI y Lucas en prácticas. Adelante, preséntate al equipo."',
      low: 'Elena mira el reloj frente a la pizarra: "Vamos justos de tiempo. Este es el equipo de FinTrack 2.0: David, Marcos, Sofía y Lucas. Preséntate brevemente antes de abrir el tablero."',
    },
    internalThought:
      'Primera impresión frente a todo el equipo de NovaSoft Solutions. Mi tono definirá la confianza inicial, el estrés grupal y la afinidad con mis compañeros.',
    options: [
      {
        id: 'act1_daily_opt1',
        label: '"Hola a todos. Vengo con ganas de aportar en FinTrack 2.0 y aprender de la experiencia de este equipo. Contad conmigo para lo que necesitéis."',
        styleTag: 'Asertiva / Profesional',
        timeCostMinutes: 15,
        ieDelta: 10,
        fiveCDelta: { confianza: 15, comunicacion: 10, compromiso: 10 },
        affinityDelta: { elena: 15, sofia: 10, lucas: 10, marcos: 5, david: 10 },
        stressDelta: -10,
        timeManagementDelta: 5,
        consequenceText:
          'Elena asiente con una sonrisa: "Esa es la actitud Agile que buscamos". El equipo te recibe con confianza y buen clima laboral.',
      },
      {
        id: 'act1_daily_opt2',
        label: '"Hola. He visto el código legacy que tenéis y hay mucho que mejorar, pero tranquilo Marcos, yo lo optimizaré rápido."',
        styleTag: 'Agresiva / Arrogante',
        timeCostMinutes: 15,
        ieDelta: -15,
        fiveCDelta: { confianza: -15, comunicacion: -15, complementariedad: -10 },
        affinityDelta: { marcos: -20, sofia: -15, elena: -10 },
        stressDelta: 20,
        timeManagementDelta: -5,
        setsFlag: 'OPEN_CONFLICT_BACKEND',
        consequenceText:
          'Marcos frunce el ceño con frialdad y Sofía aparta la mirada incómoda. La tensión en la sala sube de golpe (+20 Estrés).',
      },
      {
        id: 'act1_daily_opt3',
        label: '"Eh... hola. Soy el nuevo. Intentaré no molestar mucho y hacer mis tareas."',
        styleTag: 'Pasiva / Insegura',
        timeCostMinutes: 15,
        ieDelta: -5,
        fiveCDelta: { comunicacion: -10, compromiso: -5 },
        affinityDelta: { lucas: 15, david: -15, elena: -10 },
        stressDelta: 5,
        timeManagementDelta: -5,
        consequenceText:
          'Lucas simpatiza con tus nervios, pero David suspira dudando de tu liderazgo y Elena anota que necesitarás seguimiento.',
      },
    ],
  },

  act1_int1_lucas: {
    id: 'act1_int1_lucas',
    act: 1,
    title: 'Acto 1 · Interrupción 1/5: Pánico con Git',
    speaker: 'Lucas',
    speakerRole: 'Junior Developer (Mentoría / Confianza)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Lucas se acerca temblando a tu mesa: "Perdona que te moleste... me ha salido un error de Git haciendo rebase y me da miedo borrar la base de datos de producción si hago Push. ¿Me echas un cable?"',
      normal: 'Lucas: "Perdona que te moleste... me ha salido un error de Git y me da miedo borrar la base de datos de producción si hago Push."',
      low: 'Lucas (muy nervioso): "Siento interrumpirte... tengo la terminal llena de conflictos de Git y temo cargarme producción si hago Push."',
    },
    internalThought:
      'Pausa en el Kanban. Lucas necesita seguridad psicológica y mentoría. Si lo guío ahora, ganaremos velocidad y confianza.',
    options: [
      {
        id: 'act1_int1_opt1',
        label: '"Tranquilo Lucas, a todos nos ha pasado. Las ramas están protegidas: revisemos juntos tu git status en 10 minutos y te enseño a resolver el conflicto sin peligro."',
        styleTag: 'Mentoría + Confianza',
        timeCostMinutes: 20,
        ieDelta: 12,
        fiveCDelta: { confianza: 15, complementariedad: 15, coordinacion: 10 },
        affinityDelta: { lucas: 20, elena: 10 },
        stressDelta: -10,
        timeManagementDelta: 5,
        unlocksTool: 'pomodoro',
        setsFlag: 'helped_lucas_act1',
        consequenceText:
          'Lucas respira aliviado, aprende el flujo seguro de ramas y automatiza tus tests locales en agradecimiento. ¡Desbloqueas Pomodoro!',
      },
      {
        id: 'act1_int1_opt2',
        label: '"Apártate del teclado, Lucas. Haz un git reset --hard y déjame subirlo a mí antes de que rompas algo importante."',
        styleTag: 'Paternalismo Agresivo',
        timeCostMinutes: 15,
        ieDelta: -12,
        fiveCDelta: { confianza: -20, complementariedad: -15 },
        affinityDelta: { lucas: -25, sofia: -10 },
        stressDelta: 15,
        timeManagementDelta: -5,
        setsFlag: 'humiliated_lucas_act1',
        consequenceText:
          'Sales del paso rápido, pero Lucas se siente humillado y tendrá miedo de avisarte cuando descubra errores en el futuro.',
      },
      {
        id: 'act1_int1_opt3',
        label: '"Ahora mismo estoy a tope con mi Kanban, Lucas. Busca el error en StackOverflow y apáñatelas."',
        styleTag: 'Individualista / Rechazo',
        timeCostMinutes: 10,
        ieDelta: -10,
        fiveCDelta: { compromiso: -15, confianza: -15, coordinacion: -10 },
        affinityDelta: { lucas: -15, elena: -15 },
        stressDelta: 12,
        timeManagementDelta: -10,
        setsFlag: 'rejected_lucas_act1',
        consequenceText:
          'Lucas se bloquea toda la mañana y su rama desincronizada retrasa la integración del equipo.',
      },
    ],
  },

  act1_int2_marcos: {
    id: 'act1_int2_marcos',
    act: 1,
    title: 'Acto 1 · Interrupción 2/5: Comentario Hiriente en el PR',
    speaker: 'Marcos',
    speakerRole: 'Senior Backend ("El Lobo Solitario")',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Salta una alerta en GitHub. Marcos te ha dejado un comentario duro en tu primer Pull Request: "Este código parece escrito por un becario. Bórralo y hazlo bien". Aunque te mira esperando ver cómo reaccionas.',
      normal: 'Marcos te deja un comentario hiriente en tu primer Pull Request: "Este código parece escrito por un becario. Bórralo y hazlo bien".',
      low: 'Marcos cierra tu Pull Request sin mirarte: "Este código parece escrito por un becario. Bórralo y hazlo bien. No pienso aprobar basura".',
    },
    internalThought:
      'El comentario es destructivo en las formas, pero Marcos domina la arquitectura SQL. Debo gestionar el conflicto separando el ego del problema técnico.',
    options: [
      {
        id: 'act1_int2_opt1',
        label: '"Marcos, quiero que el código cumpla los estándares de rendimiento, pero ese comentario no me indica qué mejorar. ¿Vemos en 5 minutos qué índice o consulta cambiarías?"',
        styleTag: 'Gestión de Conflictos',
        timeCostMinutes: 20,
        ieDelta: 15,
        fiveCDelta: { comunicacion: 20, complementariedad: 20, confianza: 10 },
        affinityDelta: { marcos: 20, elena: 10 },
        stressDelta: -12,
        timeManagementDelta: 10,
        unlocksTool: 'eisenhower',
        consequenceText:
          'Marcos se sorprende por tu templanza, reconoce que fue brusco y te enseña a optimizar el JOIN en 5 minutos. ¡Desbloqueas la Matriz de Eisenhower!',
      },
      {
        id: 'act1_int2_opt2',
        label: '"¡Pues para llevar 6 años aquí tu código legacy tampoco tiene un solo comentario! ¡Deja de bloquear mis tickets por ego!"',
        styleTag: 'Agresiva',
        timeCostMinutes: 30,
        ieDelta: -20,
        fiveCDelta: { comunicacion: -20, complementariedad: -25, coordinacion: -15 },
        affinityDelta: { marcos: -25, elena: -10, sofia: -10 },
        stressDelta: 25,
        timeManagementDelta: -15,
        setsFlag: 'OPEN_CONFLICT_BACKEND',
        consequenceText:
          'Estalla una discusión tensa en mitad de la oficina. Marcos rechazará sistemáticamente tus revisiones.',
      },
      {
        id: 'act1_int2_opt3',
        label: 'Callarte, tragar saliva y borrar toda tu rama para reescribirla desde cero a ciegas durante horas.',
        styleTag: 'Pasiva / Sumisa',
        timeCostMinutes: 60,
        ieDelta: -8,
        fiveCDelta: { comunicacion: -15, confianza: -10 },
        affinityDelta: { marcos: -5 },
        stressDelta: 18,
        timeManagementDelta: -20,
        consequenceText:
          'Pierdes una hora entera adivinando qué quería Marcos mientras tu barra de estrés se dispara.',
      },
    ],
  },

  act1_int3_sofia: {
    id: 'act1_int3_sofia',
    act: 1,
    title: 'Acto 1 · Interrupción 3/5: El Padding de los Botones',
    speaker: 'Sofía',
    speakerRole: 'UX/UI Designer (Escucha Activa)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Sofía se acerca a tu escritorio con su tablet agobiada: "Oye, he revisado el entorno de desarrollo y los botones que has programado no respetan el padding ni los tokens del diseño original en Figma..."',
      normal: 'Sofía viene agobiada porque los botones que has programado no respetan el padding del diseño original en Figma.',
      low: 'Sofía suspira frustrada frente a tu mesa: "Los botones que has subido han destrozado la maqueta original. Nadie respeta UX en esta empresa..."',
    },
    internalThought:
      'Para Sofía la consistencia visual es clave para el banco. Si practico la escucha activa en vez de minimizar su trabajo, alinearemos Frontend y Diseño.',
    options: [
      {
        id: 'act1_int3_opt1',
        label: '"Tienes toda la razón, Sofía. Entiendo que desajusta la jerarquía visual que diseñaste. Pásame las variables exactas de Figma y dejamos creado el componente base ahora mismo."',
        styleTag: 'Escucha Activa',
        timeCostMinutes: 15,
        ieDelta: 15,
        fiveCDelta: { complementariedad: 15, comunicacion: 15, confianza: 15 },
        affinityDelta: { sofia: 25, elena: 5 },
        stressDelta: -10,
        timeManagementDelta: 5,
        consequenceText:
          'Sofía sonríe aliviada: "¡Gracias por escucharme!". Te deja preparado un sistema de clases CSS que te ahorra tiempo en todo el Sprint.',
      },
      {
        id: 'act1_int3_opt2',
        label: '"Sofía, son solo 4 píxeles de diferencia. Al banco le importa que el botón funcione, no que quede bonito."',
        styleTag: 'Agresiva / Arrogante',
        timeCostMinutes: 10,
        ieDelta: -15,
        fiveCDelta: { confianza: -20, complementariedad: -20 },
        affinityDelta: { sofia: -25 },
        stressDelta: 15,
        timeManagementDelta: -5,
        consequenceText:
          'Sofía se marcha cabizbaja sintiendo que su trabajo no vale nada. La cohesión entre UX y Desarrollo cae en picado.',
      },
      {
        id: 'act1_int3_opt3',
        label: '"Vale, déjame una nota por Slack y si me sobra tiempo al final del día lo miro..."',
        styleTag: 'Evitación / Huida',
        timeCostMinutes: 10,
        ieDelta: -5,
        fiveCDelta: { compromiso: -10, coordinacion: -10 },
        affinityDelta: { sofia: -10 },
        stressDelta: 8,
        consequenceText:
          'Pospones el ajuste y el desajuste visual se acumula como deuda técnica en la interfaz.',
      },
    ],
  },

  act1_int4_david: {
    id: 'act1_int4_david',
    act: 1,
    title: 'Acto 1 · Interrupción 4/5: El Módulo de Criptomonedas',
    speaker: 'David',
    speakerRole: 'Product Owner (Asertividad / Negociación)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'David apoya el café en tu mesa con una sonrisa comercial: "Oye, acabo de hablar con el cliente y quiere meter un módulo de criptomonedas para mañana. Hazle un hueco rápido en el Sprint, ¿vale?"',
      normal: 'David pasa por tu mesa: "Oye, el cliente quiere meter un módulo de criptomonedas para mañana. Hazle un hueco, ¿vale?"',
      low: 'David te da unos golpecitos en la mesa: "El cliente exige un módulo de criptomonedas para mañana mismo. Mételo como sea."',
    },
    internalThought:
      'Meter un módulo de criptomonedas en mitad del Sprint 1 sin análisis romperá el entregable de autenticación. Necesito Asertividad y Negociación.',
    options: [
      {
        id: 'act1_int4_opt1',
        label: '"Entiendo el interés del cliente, David. Pero si metemos cripto hoy, no llegaremos con el login JWT. Aseguremos la entrega actual y llevemos una demo visual de cripto al backlog del próximo Sprint."',
        styleTag: 'Asertividad + Negociación',
        timeCostMinutes: 15,
        ieDelta: 15,
        fiveCDelta: { comunicacion: 20, coordinacion: 15, compromiso: 10 },
        affinityDelta: { david: 15, elena: 15, marcos: 10 },
        stressDelta: -10,
        timeManagementDelta: 15,
        unlocksTool: 'pareto',
        setsFlag: 'stood_firm_against_david',
        consequenceText:
          'David reflexiona: "Buen punto, le venderé el prototipo para la siguiente fase sin arriesgar el login". ¡Proteges el tiempo del equipo!',
      },
      {
        id: 'act1_int4_opt2',
        label: '"¡Sí, claro David! Ahora mismo paro todo lo demás y me pongo a programar el módulo de criptomonedas."',
        styleTag: 'Pasiva / Sumisa',
        timeCostMinutes: 75,
        ieDelta: -10,
        fiveCDelta: { coordinacion: -20, comunicacion: -15 },
        affinityDelta: { david: 5, elena: -20, marcos: -15 },
        stressDelta: 25,
        timeManagementDelta: -25,
        setsFlag: 'accepted_all_scope_creep',
        consequenceText:
          'Te cargas de trabajo imposible a última hora. Pierdes más de una hora de jornada y el equipo sufre el descontrol.',
      },
      {
        id: 'act1_int4_opt3',
        label: '"¿Estás loco, David? No tienes ni idea de lo que cuesta programar blockchain. Dile a tu cliente que no."',
        styleTag: 'Agresiva',
        timeCostMinutes: 15,
        ieDelta: -15,
        fiveCDelta: { comunicacion: -20, compromiso: -10 },
        affinityDelta: { david: -25 },
        stressDelta: 15,
        timeManagementDelta: -5,
        consequenceText:
          'Frenas la tarea, pero dejas en evidencia a David y creas hostilidad directa con Dirección Comercial.',
      },
    ],
  },

  act1_int5_elena: {
    id: 'act1_int5_elena',
    act: 1,
    title: 'Acto 1 · Interrupción 5/5: Alerta de WIP (Work In Progress)',
    speaker: 'Elena',
    speakerRole: 'Scrum Master (Coordinación)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Elena se acerca con su tablet mostrando las métricas del flujo: "He visto que has empezado tres tareas en el tablero pero no has terminado ninguna. Cuidado con el WIP (Work In Progress), ¿lo reordenamos?"',
      normal: 'Elena: "He visto que has empezado tres tareas en el tablero pero no has terminado ninguna. Cuidado con el WIP (Work In Progress)."',
      low: 'Elena señala el Kanban con seriedad: "Tienes demasiadas tareas abiertas en paralelo y cero cerradas. Estás creando un cuello de botella en el WIP."',
    },
    internalThought:
      'El síndrome de multitarea reduce la Gestión del Tiempo. Elena busca ayudarme a enfocar y cerrar tickets de uno en uno ("Stop starting, start finishing").',
    options: [
      {
        id: 'act1_int5_opt1',
        label: '"Gracias por el aviso, Elena. Tienes razón: voy a limitar mi WIP a una tarea activa, cerrar el endpoint crítico con Marcos y luego pasar a la siguiente."',
        styleTag: 'Coordinación Agile (WIP)',
        timeCostMinutes: 10,
        ieDelta: 10,
        fiveCDelta: { coordinacion: 20, compromiso: 15, comunicacion: 10 },
        affinityDelta: { elena: 20, marcos: 10 },
        stressDelta: -15,
        timeManagementDelta: 15,
        consequenceText:
          'Elena sonríe satisfecha. Al focalizar el flujo Kanban, tu velocidad de cierre aumenta y el estrés del Sprint 1 disminuye.',
      },
      {
        id: 'act1_int5_opt2',
        label: '"Elena, cada programador se organiza como quiere. Déjame picar código a mi manera sin tanta burocracia Scrum."',
        styleTag: 'Individualista / Rechazo',
        timeCostMinutes: 15,
        ieDelta: -15,
        fiveCDelta: { coordinacion: -20, confianza: -10 },
        affinityDelta: { elena: -25 },
        stressDelta: 15,
        timeManagementDelta: -15,
        consequenceText:
          'Elena toma nota decepcionada. El cambio de contexto constante entre tres ramas te hace perder eficiencia.',
      },
    ],
  },

  // ============================================================================
  // ACTO 2: SPRINT 2 - "PRESIÓN EN EL SISTEMA"
  // ============================================================================

  act2_daily: {
    id: 'act2_daily',
    act: 2,
    title: 'Acto 2 · La Daily Stand-up: "Presión en el Sistema"',
    speaker: 'David & Elena',
    speakerRole: 'Product Owner & Scrum Master',
    dialogueByIE: {
      high: 'David entra acelerado a la Daily: "Atención equipo: el banco ha adelantado la fecha de entrega de FinTrack 2.0". La tensión es palpable; Marcos se cruza de brazos y Sofía suspira nerviosa. Elena te mira: "¿Cómo enfocarás tu trabajo hoy ante este cambio?"',
      normal: 'David anuncia que el cliente ha adelantado la fecha de entrega. La tensión es palpable: Marcos se cruza de brazos y Sofía suspira nerviosa. Debes exponer tu plan de hoy.',
      low: 'David golpea la pizarra: "¡El cliente ha adelantado la entrega y no acepto excusas!". Marcos bufa con sarcasmo y Sofía parece al borde del colapso. Te toca hablar.',
    },
    internalThought:
      'El reloj en el Sprint 2 irá más rápido y la presión comercial aprieta. Cómo responda ahora marcará la Coordinación o el Burnout del equipo.',
    options: [
      {
        id: 'act2_daily_opt1',
        label: '"Revisaré mis tareas y priorizaré lo que aporte valor hoy. Necesitaré ayuda de Marcos para sincronizar la API."',
        styleTag: 'Priorización + Coordinación',
        timeCostMinutes: 15,
        ieDelta: 15,
        fiveCDelta: { coordinacion: 20, complementariedad: 15, comunicacion: 15 },
        affinityDelta: { elena: 15, marcos: 15, sofia: 10, david: 10 },
        stressDelta: -10,
        timeManagementDelta: 15,
        unlocksTool: 'gantt',
        consequenceText:
          'Marcos descruza los brazos y asiente: "Cuenta conmigo para la API". El equipo recupera el foco (+20 Coordinación). ¡Desbloqueas el Diagrama de Gantt!',
      },
      {
        id: 'act2_daily_opt2',
        label: '"Yo haré lo mío, pero si el cliente cambia las fechas a mitad de partido no es mi problema."',
        styleTag: 'Individualista / Rechazo',
        timeCostMinutes: 15,
        ieDelta: -15,
        fiveCDelta: { coordinacion: -20, compromiso: -20, confianza: -10 },
        affinityDelta: { david: -20, elena: -15, sofia: -10 },
        stressDelta: 25,
        timeManagementDelta: -10,
        consequenceText:
          'El ambiente se congela en la sala. La desconexión en el equipo dispara la barra de estrés (+25 Estrés, -20 Coordinación).',
      },
      {
        id: 'act2_daily_opt3',
        label: '"Puedo hacer horas extras esta noche y terminar el módulo entero yo solo para que lleguemos."',
        styleTag: 'Pasiva / Sumisa',
        timeCostMinutes: 45,
        ieDelta: -10,
        fiveCDelta: { coordinacion: -15, complementariedad: -15 },
        affinityDelta: { david: 15, elena: -10 },
        stressDelta: 20,
        timeManagementDelta: -25,
        setsFlag: 'accepted_all_scope_creep',
        consequenceText:
          'A David le encanta oírlo (+15 Afinidad David), pero te echas encima una sobrecarga insostenible (-25 Gestión del Tiempo, +20 Estrés).',
      },
    ],
  },

  act2_int1_conflict: {
    id: 'act2_int1_conflict',
    act: 2,
    title: 'Acto 2 · Interrupción 1/5: Conflicto Cruzado UX vs Backend',
    speaker: 'Sofía & Marcos',
    speakerRole: 'UX/UI Designer & Senior Backend (Mediación)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Sofía y Marcos discuten a gritos junto a la sala de reuniones porque la API no manda los datos como necesita el Frontend. Sofía está a punto de llorar y ambos acuden a ti para que medies.',
      normal: 'Conflicto cruzado: Sofía y Marcos discuten a gritos porque la API no manda los datos como necesita el Frontend. Sofía está a punto de llorar.',
      low: 'Gritos en la oficina: "¡Tu API rompe mis pantallas!" "¡Tu diseño colapsa el servidor!". Sofía tiene lágrimas en los ojos y Marcos está furioso.',
    },
    internalThought:
      'Si tomo partido por uno, destruiré al otro. Necesito Mediación Empática: validar a ambos y proponer una solución técnica intermedia.',
    options: [
      {
        id: 'act2_int1_opt1',
        label: '"Respiremos un segundo. Sofía busca que la interfaz sea clara y Marcos proteger el servidor; ambos tenéis razón. Pactemos un endpoint paginado de 10 elementos que no sature la BD y mantenga el diseño de Sofía."',
        styleTag: 'Mediación Empática',
        timeCostMinutes: 25,
        ieDelta: 20,
        fiveCDelta: { confianza: 20, coordinacion: 25, comunicacion: 20, complementariedad: 20 },
        affinityDelta: { sofia: 25, marcos: 20, elena: 15 },
        stressDelta: -20,
        timeManagementDelta: 10,
        consequenceText:
          'Sofía se seca las lágrimas y Marcos acepta implementar la paginación. Ambos se piden disculpas y la sinergia del equipo se dispara.',
      },
      {
        id: 'act2_int1_opt2',
        label: '"Marcos tiene razón, Sofía. El rendimiento del servidor manda, así que borra tus gráficos y pon una tabla de texto simple."',
        styleTag: 'Tomar Partido / Culpar',
        timeCostMinutes: 20,
        ieDelta: -20,
        fiveCDelta: { confianza: -25, complementariedad: -25 },
        affinityDelta: { sofia: -30, marcos: 5, elena: -15 },
        stressDelta: 25,
        consequenceText:
          'Sofía se encierra abatida y la relación entre Diseño y Backend queda completamente rota.',
      },
      {
        id: 'act2_int1_opt3',
        label: 'Ponerte los auriculares con cancelación de ruido y fingir que no oyes los gritos para seguir con tu código.',
        styleTag: 'Evitación / Huida',
        timeCostMinutes: 30,
        ieDelta: -15,
        fiveCDelta: { compromiso: -20, coordinacion: -25 },
        affinityDelta: { sofia: -20, marcos: -15, elena: -20 },
        stressDelta: 20,
        timeManagementDelta: -15,
        consequenceText:
          'El bloqueo entre API y Frontend dura horas sin resolverse, frenando todo el Sprint 2.',
      },
    ],
  },

  act2_int2_david: {
    id: 'act2_int2_david',
    act: 2,
    title: 'Acto 2 · Interrupción 2/5: Presión contra la Calidad',
    speaker: 'David',
    speakerRole: 'Product Owner (Asertividad y Defensa de la Calidad)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'David irrumpe en tu zona mirando su reloj: "No me importan las pruebas unitarias, sube el código de pagos a producción ya mismo o perdemos al cliente bancario".',
      normal: 'David: "No me importan las pruebas unitarias, sube el código a producción ya o perdemos al cliente."',
      low: 'David grita desde su despacho: "¡Salta los tests unitarios y haz deploy a producción ahora mismo! ¡Es una orden!"',
    },
    internalThought:
      'Subir una pasarela de pagos bancaria sin tests unitarios es garantía de desastre en el Acto 3. Debo defender la calidad con asertividad.',
    options: [
      {
        id: 'act2_int2_opt1',
        label: '"David, si subimos pagos sin tests y falla un cobro en vivo, sí que perderemos al banco para siempre. Dame 15 minutos para correr la suite crítica con Lucas y te garantizo una subida segura."',
        styleTag: 'Defensa de Calidad',
        timeCostMinutes: 20,
        ieDelta: 15,
        fiveCDelta: { comunicacion: 20, compromiso: 20, confianza: 15 },
        affinityDelta: { david: 10, marcos: 20, elena: 15, lucas: 10 },
        stressDelta: -10,
        timeManagementDelta: 10,
        setsFlag: 'stood_firm_against_david',
        consequenceText:
          'David resopla pero comprende el riesgo financiero. Los tests detectan un bug de redondeo a tiempo y Marcos aplaude tu firmeza.',
      },
      {
        id: 'act2_int2_opt2',
        label: '"Vale David, paso la bandera --no-verify y subo el código a producción sin probar ahora mismo."',
        styleTag: 'Pasiva / Sumisa',
        timeCostMinutes: 10,
        ieDelta: -15,
        fiveCDelta: { compromiso: -20, coordinacion: -15 },
        affinityDelta: { david: 5, marcos: -25, elena: -20 },
        stressDelta: 25,
        timeManagementDelta: -15,
        causesStrike: 1,
        consequenceText:
          'El despliegue sin tests introduce deuda técnica severa y provoca un fallo en pre-producción (+1 Strike).',
      },
    ],
  },

  act2_int3_lucas: {
    id: 'act2_int3_lucas',
    act: 2,
    title: 'Acto 2 · Interrupción 3/5: Staging Caído y Miedo Escénico',
    speaker: 'Lucas',
    speakerRole: 'Junior Dev (Empatía / Seguridad Psicológica)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Salta la alarma de Staging caído. Lucas ha ejecutado un script de limpieza por error y se ha escondido en el baño muerto de miedo pensando que lo van a despedir.',
      normal: 'Lucas ha roto el entorno de pruebas (Staging) y se esconde en el baño. Tienes que convencerlo de salir y arreglarlo juntos.',
      low: 'El entorno de Staging ha muerto. Te enteras de que Lucas lo ha roto y se ha encerrado en el baño por pánico a las represalias.',
    },
    internalThought:
      'En una cultura sin seguridad psicológica la gente esconde los errores. Necesito empatía para que Lucas salga y restauremos el snapshot juntos.',
    options: [
      {
        id: 'act2_int3_opt1',
        label: 'Acercarte con calma: "Lucas, para eso existe el entorno de Staging: para romper cosas aquí y no en producción. Sal, que nadie te va a culpar; restauramos el backup juntos en 10 minutos."',
        styleTag: 'Seguridad Psicológica',
        timeCostMinutes: 20,
        ieDelta: 20,
        fiveCDelta: { confianza: 25, compromiso: 15, complementariedad: 15 },
        affinityDelta: { lucas: 30, elena: 15, sofia: 15 },
        stressDelta: -15,
        timeManagementDelta: 10,
        consequenceText:
          'Lucas sale agradecido, te muestra exactamente qué comando falló y restauráis Staging en tiempo récord. Su lealtad hacia ti es total.',
      },
      {
        id: 'act2_int3_opt2',
        label: 'Gritar desde la puerta y avisar a David de que Lucas ha tirado el servidor de pruebas por incompetente.',
        styleTag: 'Chivo Expiatorio / Traición',
        timeCostMinutes: 40,
        ieDelta: -25,
        fiveCDelta: { confianza: -30, compromiso: -20 },
        affinityDelta: { lucas: -35, elena: -20, sofia: -20 },
        stressDelta: 30,
        timeManagementDelta: -15,
        consequenceText:
          'Hundes a Lucas y tardas el doble en averiguar por tu cuenta qué tabla de Staging se había borrado.',
      },
    ],
  },

  act2_int4_marcos: {
    id: 'act2_int4_marcos',
    act: 2,
    title: 'Acto 2 · Interrupción 4/5: La Query Criptográfica de Marcos',
    speaker: 'Marcos',
    speakerRole: 'Senior Backend (Comunicación Efectiva)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Marcos ha optimizado una query crítica de transacciones que vuela en milisegundos, pero tiene 80 líneas sin documentar y nadie del equipo entiende cómo conectarla.',
      normal: 'Marcos ha optimizado una query, pero no la ha documentado y nadie del equipo la entiende.',
      low: 'Marcos ha subido una consulta SQL críptica sin un solo comentario. Cuando Lucas pregunta, Marcos responde: "El código se documenta solo".',
    },
    internalThought:
      'El conocimiento en silos ("bus factor = 1") es peligroso. Debo usar Comunicación Efectiva reconociendo su logro técnico para que lo comparta.',
    options: [
      {
        id: 'act2_int4_opt1',
        label: '"Marcos, la optimización que has hecho en la query ha bajado la latencia un 70%, es brillante. ¿Hacemos una nota rápida de 5 líneas en el README para que el resto no metamos la pata al llamarla?"',
        styleTag: 'Comunicación Efectiva',
        timeCostMinutes: 15,
        ieDelta: 15,
        fiveCDelta: { comunicacion: 25, complementariedad: 20, coordinacion: 15 },
        affinityDelta: { marcos: 20, lucas: 10, elena: 10 },
        stressDelta: -10,
        timeManagementDelta: 15,
        consequenceText:
          'A Marcos se le ilumina la cara al ver valorado su ingenio técnico y documenta los parámetros con ejemplos claros para todo el equipo.',
      },
      {
        id: 'act2_int4_opt2',
        label: '"Marcos, tu código es ilegible. O lo documentas ahora mismo o me quejo a Elena en la Retrospectiva."',
        styleTag: 'Agresiva',
        timeCostMinutes: 25,
        ieDelta: -15,
        fiveCDelta: { comunicacion: -20, confianza: -15 },
        affinityDelta: { marcos: -20 },
        stressDelta: 15,
        timeManagementDelta: -10,
        consequenceText:
          'Marcos se cierra en banda y pone una línea sarcástica de comentario que no ayuda a nadie.',
      },
    ],
  },

  act2_int5_spam: {
    id: 'act2_int5_spam',
    act: 2,
    title: 'Acto 2 · Interrupción 5/5: Tormenta de Spam en Jira',
    speaker: 'Notificaciones del Sistema',
    speakerRole: 'Prueba de Foco y Gestión del Tiempo',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: '¡Ping! ¡Ping! ¡Ping! Saltan 14 notificaciones seguidas de Jira sobre hilos de otros departamentos, encuestas de cafetería y tickets antiguos mientras estás en mitad de tu bloque crítico.',
      normal: 'Spam del Sistema: Múltiples notificaciones de Jira irrelevantes. (Prueba de foco: debes ignorarlas y volver al Kanban para no perder tiempo).',
      low: 'Tu pantalla se llena de pop-ups de Jira y correos en cadena con copia a toda la empresa en el peor momento del Sprint.',
    },
    internalThought:
      'Es una trampa clásica de urgencia falsa (Cuadrante 4 de Eisenhower). Si abro los hilos perderé el estado de flujo.',
    options: [
      {
        id: 'act2_int5_opt1',
        label: 'Silenciar las notificaciones no críticas (Modo Enfoque / Pomodoro) y volver inmediatamente al tablero Kanban.',
        styleTag: 'Enfoque / Gestión del Tiempo',
        timeCostMinutes: 5,
        ieDelta: 10,
        fiveCDelta: { compromiso: 15, coordinacion: 10 },
        affinityDelta: { elena: 10 },
        stressDelta: -10,
        timeManagementDelta: 20,
        consequenceText:
          '¡Foco impecable! Ignoras el ruido irrelevante, mantienes tu concentración intacta y ganas +20 en Gestión del Tiempo.',
      },
      {
        id: 'act2_int5_opt2',
        label: 'Abrir uno por uno los 14 tickets de Jira y ponerte a responder en los hilos de discusión.',
        styleTag: 'Pasiva / Insegura',
        timeCostMinutes: 55,
        ieDelta: -5,
        fiveCDelta: { coordinacion: -15 },
        stressDelta: 15,
        timeManagementDelta: -25,
        consequenceText:
          'Caes en la trampa de la multitarea: pierdes casi una hora de reloj en correos que no aportaban nada a FinTrack 2.0.',
      },
    ],
  },

  // ============================================================================
  // ACTO 3: SPRINT 3 - "EL LANZAMIENTO (RELEASE)"
  // ============================================================================

  act3_daily: {
    id: 'act3_daily',
    act: 3,
    title: 'Acto 3 · La Daily Stand-up Final: "El Lanzamiento (Release)"',
    speaker: 'Elena & Todo el Equipo',
    speakerRole: 'Último Día · Subida a Producción a las 17:00h',
    dialogueByIE: {
      high: 'Es el último día: FinTrack 2.0 debe subirse a producción hoy antes del cierre. Gracias a tu gestión en los Sprints 1 y 2, el equipo te mira unido y motivado. Elena dice: "Antes del sprint final hacia la Release, ¿unas palabras para el equipo?"',
      normal: 'Es el último día. FinTrack 2.0 debe subirse a producción hoy. Elena reúne a Marcos, David, Sofía y Lucas frente a la pizarra y te pide unas palabras de motivación antes del sprint final.',
      low: 'Es el último día de entrega y el equipo está al borde del colapso por la tensión acumulada. Elena intenta calmar los ánimos: "Necesitamos alinear a todos antes del despliegue final. Di algo al equipo".',
    },
    internalThought:
      'Debo elegir el mensaje que mejor balancee la exigencia técnica de Marcos, la visión de negocio de David y la sensibilidad de diseño de Sofía y Lucas.',
    options: [
      {
        id: 'act3_daily_opt1',
        label: '"Equipo, estamos a un paso de lograrlo: la solidez del backend de Marcos, la experiencia visual de Sofía, el empuje de Lucas, la guía de Elena y el enfoque comercial de David hacen de FinTrack 2.0 un gran producto. ¡Coordinémonos en las revisiones finales y hagamos brillar la Release!"',
        styleTag: 'Liderazgo Motivador',
        timeCostMinutes: 15,
        ieDelta: 20,
        fiveCDelta: { compromiso: 20, confianza: 20, coordinacion: 20, comunicacion: 20, complementariedad: 20 },
        affinityDelta: { elena: 20, david: 15, marcos: 15, sofia: 20, lucas: 20 },
        stressDelta: -20,
        timeManagementDelta: 15,
        consequenceText:
          'Un aplauso espontáneo recorre la sala. Marcos asiente con respeto, Sofía sonríe motivada y David confía plenamente en tu liderazgo.',
      },
      {
        id: 'act3_daily_opt2',
        label: '"Hoy solo importa no fallar al cliente bancario de David. Olvidaos de detalles estéticos y picaos el código sin parar hasta las 17:00h."',
        styleTag: 'Agresiva',
        timeCostMinutes: 15,
        ieDelta: -15,
        fiveCDelta: { confianza: -15, complementariedad: -15 },
        affinityDelta: { david: 10, sofia: -20, lucas: -15, elena: -10 },
        stressDelta: 20,
        consequenceText:
          'David asiente, pero Sofía y Lucas sienten que desprecias su trabajo y la presión en la oficina se dispara.',
      },
      {
        id: 'act3_daily_opt3',
        label: '"Bueno... esperemos tener suerte y que no se rompa el servidor hoy. Que cada uno revise lo suyo como pueda."',
        styleTag: 'Pasiva / Insegura',
        timeCostMinutes: 15,
        ieDelta: -10,
        fiveCDelta: { compromiso: -15, coordinacion: -15 },
        affinityDelta: { david: -15, marcos: -15, elena: -10 },
        stressDelta: 15,
        consequenceText:
          'Tus palabras transmiten inseguridad en el momento más crítico del lanzamiento.',
      },
    ],
  },

  act3_int1_bug: {
    id: 'act3_int1_bug',
    act: 3,
    title: 'Acto 3 · Interrupción 1/5: Bug Crítico de Seguridad a 2 Horas',
    speaker: 'Elena',
    speakerRole: 'Scrum Master (Asignación y Comunicación en Crisis)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Elena llega rápido a tu puesto: "Acaba de saltar el escáner pre-release: hay una vulnerabilidad grave de inyección en el token de sesión a falta de 2 horas. ¿A quién asignamos la tarea y cómo lo coordinamos?"',
      normal: 'Bug Crítico: Elena detecta un fallo de seguridad grave a falta de 2 horas. ¿A quién asignas la tarea y cómo lo comunicas?',
      low: '¡Alarma roja! Elena avisa de un fallo de seguridad crítico a falta de 2 horas para la subida. El pánico amenaza con paralizar la oficina.',
    },
    internalThought:
      'Necesito aprovechar la Complementariedad del equipo sin generar pánico: Marcos y yo en el parche del token, Lucas en los tests de regresión.',
    options: [
      {
        id: 'act3_int1_opt1',
        label: '"Sin pánico, estamos a tiempo. Marcos y yo blindamos la validación del token en pair programming durante 20 min, mientras Lucas prepara el test de regresión y Elena actualiza el tablero."',
        styleTag: 'Liderazgo + Responsabilidad Compartida',
        timeCostMinutes: 20,
        ieDelta: 15,
        fiveCDelta: { coordinacion: 25, complementariedad: 25, comunicacion: 20 },
        affinityDelta: { elena: 20, marcos: 15, lucas: 15 },
        stressDelta: -15,
        timeManagementDelta: 15,
        consequenceText:
          'La asignación por fortalezas funciona como un reloj suizo: la vulnerabilidad queda sellada en 20 minutos.',
      },
      {
        id: 'act3_int1_opt2',
        label: '"¡Tíraselo a Lucas para que lo arregle él solo mientras yo termino mis tickets del Kanban!"',
        styleTag: 'Tomar Partido / Culpar',
        timeCostMinutes: 45,
        ieDelta: -20,
        fiveCDelta: { coordinacion: -25, confianza: -20, complementariedad: -20 },
        affinityDelta: { lucas: -25, elena: -25, marcos: -15 },
        stressDelta: 25,
        timeManagementDelta: -20,
        consequenceText:
          'Dejar un bug crítico de seguridad únicamente sobre los hombros del Junior retrasa la solución y dispara el estrés.',
      },
    ],
  },

  act3_int2_marcos: {
    id: 'act3_int2_marcos',
    act: 3,
    title: 'Acto 3 · Interrupción 2/5: El Bloqueo Sutil del "Lobo Solitario"',
    speaker: 'Marcos',
    speakerRole: 'Senior Backend (Ayudar sin Herir su Orgullo)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Marcos se acerca a tu mesa con su portátil, algo que nunca había hecho: "Oye... el pool de conexiones asíncronas está dando un falso positivo extraño. Dos pares de ojos ven más que uno, ¿le echas un vistazo conmigo?"',
      normal: 'Bloqueo de Marcos: El "Lobo Solitario" no encuentra el error y, por primera vez, pide ayuda de forma sutil. Tienes que ayudarle sin herir su orgullo.',
      low: 'Marcos lleva media hora atascado resoplando frente a su monitor. Se acerca de mala gana: "El compilador está loco en este módulo asíncrono... míralo un segundo".',
    },
    internalThought:
      'Es un hito enorme: el "Lobo Solitario" está abriéndose al trabajo en equipo. Si lo trato con respeto y empatía, sellaremos una alianza definitiva.',
    options: [
      {
        id: 'act3_int2_opt1',
        label: '"Claro Marcos, esa concurrencia asíncrona es traicionera. Mira, creo que el await dentro del bucle bloquea el pool; si lo pasamos a Promise.all con tu arquitectura SQL, volará."',
        styleTag: 'Asertiva + Complementariedad',
        timeCostMinutes: 15,
        ieDelta: 20,
        fiveCDelta: { complementariedad: 25, confianza: 25, compromiso: 15 },
        affinityDelta: { marcos: 30, elena: 10 },
        stressDelta: -15,
        timeManagementDelta: 15,
        consequenceText:
          'Marcos sonríe con genuina admiración: "Bien visto. Haces buen equipo". El Lobo Solitario pasa a ser tu mayor aliado técnico.',
      },
      {
        id: 'act3_int2_opt2',
        label: '"¿Vaya, así que el gran Senior Backend no sabe usar un async/await? Parece escrito por un becario, ¿eh?"',
        styleTag: 'Agresiva / Arrogante',
        timeCostMinutes: 30,
        ieDelta: -25,
        fiveCDelta: { confianza: -30, comunicacion: -25, complementariedad: -20 },
        affinityDelta: { marcos: -35 },
        stressDelta: 25,
        consequenceText:
          'Humillas a Marcos cuando por fin había pedido ayuda. Se levanta furioso y no vuelve a dirigirte la palabra.',
      },
    ],
  },

  act3_int3_sofia: {
    id: 'act3_int3_sofia',
    act: 3,
    title: 'Acto 3 · Interrupción 3/5: Ataque de Pánico por Safari',
    speaker: 'Sofía',
    speakerRole: 'UX/UI Designer (Calmar y Priorizar)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Sofía llega pálida con el MacBook en la mano: "¡Los colores en los gráficos financieros están invertidos en Safari! ¡Las ganancias salen en rojo y el cliente nos matará!"',
      normal: 'Ataque de pánico de Sofía: "Los colores en los gráficos financieros están invertidos en Safari, el cliente nos matará". (Requiere calmarla y priorizar).',
      low: 'Sofía entra en pánico: "¡Todo el gráfico financiero se ve al revés en Safari! ¡Va a ser un desastre total en la demo!"',
    },
    internalThought:
      'Sofía está hiperventilando. Primero debo regular la emoción (Empatía) y luego aplicar una solución rápida 80/20 en el CSS.',
    options: [
      {
        id: 'act3_int3_opt1',
        label: '"Respira tranquila, Sofía, menos mal que lo has detectado antes de las 17:00h. Es solo el filtro de color WebKit: fijemos las variables hexadecimales directas en el SVG ahora mismo y quedará perfecto."',
        styleTag: 'Escucha Activa',
        timeCostMinutes: 15,
        ieDelta: 20,
        fiveCDelta: { confianza: 20, coordinacion: 20, comunicacion: 15 },
        affinityDelta: { sofia: 25, elena: 10 },
        stressDelta: -20,
        timeManagementDelta: 10,
        consequenceText:
          'Sofía recupera la calma al instante. En 10 minutos corregís el CSS de Safari y los gráficos lucen impecables.',
      },
      {
        id: 'act3_int3_opt2',
        label: '"¡Pero cómo no probaste Safari ayer, Sofía! ¡No me vengas con histerias a una hora del lanzamiento!"',
        styleTag: 'Agresiva',
        timeCostMinutes: 35,
        ieDelta: -20,
        fiveCDelta: { confianza: -25, comunicacion: -20 },
        affinityDelta: { sofia: -30 },
        stressDelta: 30,
        timeManagementDelta: -15,
        consequenceText:
          'Tus gritos bloquean aún más a Sofía y tardáis el doble en encontrar el fallo entre nervios y reproches.',
      },
    ],
  },

  act3_int4_lucas: {
    id: 'act3_int4_lucas',
    act: 3,
    title: 'Acto 3 · Interrupción 4/5: La Confesión de Lucas',
    speaker: 'Lucas',
    speakerRole: 'Junior Dev (Momento Clave de Confianza)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Lucas se acerca en voz baja: "Oye... tengo que confesarte algo. Yo vi el bug de los colores de Safari esta mañana, pero me dio miedo decirlo en la Daily por no retrasar al equipo. Lo siento mucho".',
      normal: 'La Confesión de Lucas: Lucas descubrió el error de los colores antes, pero le dio miedo decirlo en la Daily. (Momento clave de Confianza).',
      low: 'Lucas mira al suelo culpable: "Yo sabía lo del fallo en Safari desde las 10:00, pero callé en la Daily por miedo a vuestra reacción..."',
    },
    internalThought:
      'Momento definitivo de Confianza (C2). Si agradezco su honestidad y refuerzo la transparencia, nunca más ocultará un riesgo.',
    options: [
      {
        id: 'act3_int4_opt1',
        label: '"Gracias por ser honesto conmigo, Lucas. En este equipo ningún aviso temprano es una molestia: detectar un bug a las 10:00 nos salva a las 17:00. La próxima vez dilo sin miedo, yo te respaldo."',
        styleTag: 'Mentoría + Confianza',
        timeCostMinutes: 10,
        ieDelta: 20,
        fiveCDelta: { confianza: 25, comunicacion: 20, compromiso: 20 },
        affinityDelta: { lucas: 25, elena: 20, sofia: 10 },
        stressDelta: -15,
        timeManagementDelta: 10,
        consequenceText:
          'Lucas levanta la cabeza con orgullo profesional. La Seguridad Psicológica del equipo alcanza su punto máximo.',
      },
      {
        id: 'act3_int4_opt2',
        label: '"¡Increíble, Lucas! Por callarte en la Daily casi nos cuesta el proyecto. No quiero volver a verte tocar producción."',
        styleTag: 'Paternalismo Agresivo',
        timeCostMinutes: 15,
        ieDelta: -20,
        fiveCDelta: { confianza: -30, comunicacion: -20 },
        affinityDelta: { lucas: -30, elena: -15 },
        stressDelta: 20,
        consequenceText:
          'Confirmas el peor temor de Lucas: que decir la verdad en este equipo se castiga.',
      },
    ],
  },

  act3_int5_david: {
    id: 'act3_int5_david',
    act: 3,
    title: 'Acto 3 · Interrupción 5/5: El Ultimátum Telefónico de David',
    speaker: 'David',
    speakerRole: 'Product Owner (Prueba Final de Asertividad)',
    isInterruption: true,
    returnModal: 'WORKSTATION',
    dialogueByIE: {
      high: 'Son las 16:45h. Llama el Director del Banco. David entra sudando con el móvil en la mano: "Quieren saber por qué la subida final tarda 15 minutos más por el chequeo de seguridad. Toma el teléfono y da tú la cara por el retraso".',
      normal: 'El Ultimátum de David: Llama el cliente. David quiere ponerte al teléfono para que tú des la cara por el retraso de 15 minutos en la subida. (Prueba final de Asertividad).',
      low: 'David te tiende el teléfono temblando: "¡El cliente está furioso por los 15 minutos de espera! ¡Habla tú con él y carga con la culpa!"',
    },
    internalThought:
      'Es la prueba final del juego. Puedo demostrar Liderazgo y Asertividad ante el cliente y ante David sin traicionar al equipo ni hundirme.',
    options: [
      {
        id: 'act3_int5_opt1',
        label: 'Poner el manos libres junto a David: "Buenas tardes. Soy el responsable técnico de FinTrack 2.0: esos 15 minutos corresponden al doble blindaje de seguridad y verificación en Safari que hemos aplicado para garantizar cero fallos hoy. A las 17:00h en punto tienen la versión lista."',
        styleTag: 'Asertividad + Negociación',
        timeCostMinutes: 15,
        ieDelta: 25,
        fiveCDelta: {
          compromiso: 25,
          confianza: 25,
          coordinacion: 25,
          comunicacion: 25,
          complementariedad: 25,
        },
        affinityDelta: { david: 25, elena: 20, marcos: 20, sofia: 20, lucas: 20 },
        stressDelta: -25,
        timeManagementDelta: 15,
        setsFlag: 'stood_firm_against_david',
        consequenceText:
          'El Director del Banco responde impresionado: "Excelente rigor profesional, así da gusto trabajar". David te estrecha la mano con respeto absoluto y todo el equipo celebra.',
      },
      {
        id: 'act3_int5_opt2',
        label: 'Coger el teléfono y culpar a Lucas, Sofía y al propio David del retraso para intentar salvarte tú.',
        styleTag: 'Chivo Expiatorio / Traición',
        timeCostMinutes: 25,
        ieDelta: -30,
        fiveCDelta: {
          compromiso: -40,
          confianza: -40,
          coordinacion: -30,
          comunicacion: -30,
          complementariedad: -30,
        },
        affinityDelta: { david: -30, elena: -30, marcos: -30, sofia: -30, lucas: -30 },
        stressDelta: 40,
        consequenceText:
          'El cliente percibe el caos interno de la empresa y todo tu equipo te mira con profunda decepción por haberlos vendido.',
      },
      {
        id: 'act3_int5_opt3',
        label: '"¡Es tu cliente y tu sueldo de Product Owner, David! ¡Yo no hablo con nadie, apáñatelas tú!"',
        styleTag: 'Agresiva',
        timeCostMinutes: 20,
        ieDelta: -15,
        fiveCDelta: { compromiso: -20, comunicacion: -20 },
        affinityDelta: { david: -25, elena: -10 },
        stressDelta: 20,
        consequenceText:
          'Dejas a David balbuceando excusas técnicas sin fundamento ante el banco, enturbiando el cierre del proyecto.',
      },
    ],
  },

  // ============================================================================
  // NODOS DE INTERACCIÓN CON EL MAPA Y COMPATIBILIDAD
  // ============================================================================

  scene_1_1_daily: {
    id: 'scene_1_1_daily',
    act: 1,
    title: 'Acto 1 · Escena 1.1: La Daily Stand-up y la Petición de Ayuda',
    speaker: 'Elena & Lucas',
    speakerRole: 'Scrum Master & Junior Dev',
    dialogueByIE: {
      high: 'Elena: "¡Buenos días, equipo! Tenemos 5 días para cerrar el módulo de acceso. Lucas lleva atascado con la validación de tokens y queremos presentarnos bien en este Sprint 1. ¿Cómo quieres enfocarlo hoy?"',
      normal: 'Elena: "Buenos días. Arrancamos la Daily del Sprint 1. Lucas sigue bloqueado con la validación de tokens y tú conectas con su pasarela. ¿Cómo procedemos?"',
      low: 'Elena (seria): "Vamos al grano. Lucas está bloqueado con los tokens y Marcos dice que no piensa hacer de niñera. Tu código depende de esto. ¿Qué vas a hacer?"',
    },
    internalThought:
      'Si me presento con espíritu colaborativo y ayudo a Lucas a desbloquearse, sumaremos Confianza, Coordinación y Afinidad con el equipo.',
    options: [
      {
        id: 'opt_1_1_a',
        label: '"Cada uno tiene sus tickets asignados, Elena. Yo voy a encerrarme con mi parte para terminarla rápido; cuando Lucas acabe la suya como pueda, ya veremos cómo lo unimos."',
        styleTag: 'Individualista / Rechazo',
        timeCostMinutes: 20,
        ieDelta: -10,
        fiveCDelta: { compromiso: -20, confianza: -15 },
        affinityDelta: { elena: -15, lucas: -15 },
        stressDelta: 15,
        setsFlag: 'rejected_lucas_act1',
        consequenceText:
          'Elena frunce el ceño: "En Scrum el éxito se mide por el equipo, no por tickets aislados". Al final del día, Lucas entrega un código incompatible con el tuyo.',
      },
      {
        id: 'opt_1_1_b',
        label: '"Quita, Lucas, pásame tu rama de código que lo programo yo en media hora para que no nos retrases a todos."',
        styleTag: 'Paternalismo Agresivo',
        timeCostMinutes: 35,
        ieDelta: -15,
        fiveCDelta: { confianza: -25, complementariedad: -20 },
        affinityDelta: { lucas: -25, sofia: -10 },
        stressDelta: 20,
        setsFlag: 'humiliated_lucas_act1',
        consequenceText:
          'Humillas a Lucas frente al equipo. El problema técnico sale hoy, pero Lucas dejará de hablarte y no te avisará de futuros fallos.',
      },
      {
        id: 'opt_1_1_c',
        label: '"Hola a todos, contad conmigo en FinTrack 2.0. Entiendo tu bloqueo, Lucas; dediquemos 45 minutos ahora a revisarlo juntos y definimos el contrato de datos."',
        styleTag: 'Escucha Activa + Las 5 C',
        timeCostMinutes: 45,
        ieDelta: 15,
        fiveCDelta: { confianza: 20, coordinacion: 20, comunicacion: 15 },
        affinityDelta: { elena: 15, lucas: 20, sofia: 10 },
        stressDelta: -10,
        timeManagementDelta: 10,
        unlocksTool: 'pomodoro',
        setsFlag: 'helped_lucas_act1',
        consequenceText:
          'Elena sonríe. Lucas aprende el patrón y te devuelve el favor automatizando tus pruebas unitarias. ¡Has desbloqueado la Técnica Pomodoro en tu mesa!',
      },
    ],
  },

  scene_1_2_marcos_pr: {
    id: 'scene_1_2_marcos_pr',
    act: 1,
    title: 'Acto 1 · Escena 1.2: El Choque de Complementariedad (Code Review)',
    speaker: 'Marcos',
    speakerRole: 'Senior Backend Developer ("El Lobo Solitario")',
    dialogueByIE: {
      high: 'Marcos: "Hola. He visto tu subida. Funciona, pero esa consulta SQL va a ir lenta cuando tengamos diez mil usuarios."',
      normal: 'Marcos: "Te dejé un comentario en la Pull Request: \'Este código parece escrito por un becario. Bórralo y hazlo bien\'. Así no sube."',
      low: 'Marcos (sin mirar): "¿Qué quieres? Ya te puse en el comentario que está mal. Resuélvelo tú."',
    },
    internalThought:
      'Marcos es un genio en bases de datos, pero su comentario escueto bloquea mi entrega. Necesito apoyarme en su Complementariedad con Asertividad sin entrar al choque de egos.',
    options: [
      {
        id: 'opt_1_2_a',
        label: '"¡Mi código pasa todos los tests! Tú siempre rechazas todo porque quieres que se haga a tu manera. ¡Deja de bloquear mis entregas!"',
        styleTag: 'Agresiva',
        timeCostMinutes: 30,
        ieDelta: -20,
        fiveCDelta: { comunicacion: -20, complementariedad: -25 },
        affinityDelta: { marcos: -25 },
        stressDelta: 20,
        setsFlag: 'open_conflict_marcos',
        consequenceText:
          'Se genera el estado "Conflicto Abierto con Backend". Marcos bloqueará tus futuros PRs al mínimo detalle.',
      },
      {
        id: 'opt_1_2_b',
        label: '"Vale, perdón... Ahora mismo borro todo y trato de adivinar cómo quieres que lo ponga, aunque me quede hasta las diez de la noche."',
        styleTag: 'Pasiva / Sumisa',
        timeCostMinutes: 120,
        ieDelta: -5,
        fiveCDelta: { comunicacion: -10 },
        affinityDelta: { marcos: -5 },
        stressDelta: 15,
        timeManagementDelta: -20,
        causesStrike: 1,
        consequenceText:
          'Pierdes toda la tarde intentando adivinar qué quería Marcos. Tu entrega vence el reloj y recibes +1 Strike de retraso.',
      },
      {
        id: 'opt_1_2_c',
        label: '"Marcos, valoro tu experiencia en bases de datos porque sé que ves cuellos de botella que a mí se me escapan. Sin embargo, un comentario que solo dice \'Rehacer\' no me da contexto. ¿Me muestras en 5 minutos qué índice cambiarías?"',
        styleTag: 'Asertiva + Complementariedad',
        timeCostMinutes: 20,
        ieDelta: 20,
        fiveCDelta: { complementariedad: 25, comunicacion: 20, confianza: 15 },
        affinityDelta: { marcos: 20, elena: 10 },
        stressDelta: -10,
        timeManagementDelta: 10,
        unlocksTool: 'eisenhower',
        consequenceText:
          'Marcos baja la guardia y te enseña un truco avanzado de optimización. ¡Desbloqueas la Matriz de Eisenhower y el Escáner de Pareto 80/20 en tu ordenador!',
      },
    ],
  },

  scene_2_1_david_scope: {
    id: 'scene_2_1_david_scope',
    act: 2,
    title: 'Acto 2 · Escena 2.1: Intrusión del Jefe ("Scope Creep")',
    speaker: 'David',
    speakerRole: 'Product Owner / Director de Cuenta',
    dialogueByIE: {
      high: 'David: "¡Escucha! El Director del Banco ha adelantado la fecha y quiere exportación a PDF con gráficos animados, cambio de fuentes internas y 20 diapositivas de arquitectura. ¡Contamos contigo!"',
      normal: 'David: "Acabo de salir de llamada con el Banco. Quieren adelantar la entrega con PDF animado, cambiar fuentes internas y 20 diapositivas técnicas. ¡Todo es prioridad máxima!"',
      low: 'David (cortante): "Más vale que saques esto ya: PDF animado para el cliente, cambio de fuentes internas y presentación de 20 diapositivas. No quiero excusas."',
    },
    internalThought:
      'Mi Sprint está al 70% de capacidad. Si digo que sí a todo sin negociar, es matemáticamente imposible terminar a tiempo y recibiré Strikes graves.',
    options: [
      {
        id: 'opt_2_1_a',
        label: '"Claro, David, no te preocupes. Yo me encargo de las tres cosas haciendo horas extras yo solo."',
        styleTag: 'Pasiva / Sumisa',
        timeCostMinutes: 180,
        ieDelta: -10,
        fiveCDelta: { compromiso: 5, coordinacion: -20 },
        affinityDelta: { david: 10, elena: -15 },
        stressDelta: 25,
        timeManagementDelta: -25,
        causesStrike: 2,
        setsFlag: 'accepted_all_scope_creep',
        consequenceText:
          'Tu barra de tareas se desborda un +180%. Fallas dos entregas críticas al final del día y recibes +2 Strikes.',
      },
      {
        id: 'opt_2_1_b',
        label: '"Imposible, David. Si el cliente cambia las fechas no es mi problema. No voy a tocar ni una línea extra."',
        styleTag: 'Agresiva',
        timeCostMinutes: 15,
        ieDelta: -20,
        fiveCDelta: { compromiso: -20 },
        affinityDelta: { david: -25 },
        stressDelta: 20,
        consequenceText:
          'David se siente atacado y la relación con dirección queda muy dañada.',
      },
      {
        id: 'opt_2_1_c',
        label: '"Entiendo que impresionar al banco es clave, David. Para no arriesgar la estabilidad te propongo: 1) Exportación en CSV + resumen visual (Pareto 80/20), 2) Posponer fuentes internas al Sprint 3 (Eisenhower), y 3) Que Elena nos apoye con las diapositivas."',
        styleTag: 'Negociación Integrativa (Pareto + Eisenhower)',
        timeCostMinutes: 35,
        ieDelta: 25,
        fiveCDelta: { comunicacion: 25, coordinacion: 20, compromiso: 15 },
        affinityDelta: { david: 20, elena: 15, marcos: 10 },
        stressDelta: -15,
        timeManagementDelta: 15,
        unlocksTool: 'gantt',
        setsFlag: 'stood_firm_against_david',
        consequenceText:
          'David queda impresionado: "Así se habla. Me das una solución comercial sin romper el calendario. Trato hecho". ¡Desbloqueas el Diagrama de Gantt Interactivo!',
      },
    ],
  },

  scene_2_2_meeting_war: {
    id: 'scene_2_2_meeting_war',
    act: 2,
    title: 'Acto 2 · Escena 2.2: Guerra Civil en la Sala de Reuniones (UX vs Backend)',
    speaker: 'Sofía & Marcos',
    speakerRole: 'UX/UI Designer & Senior Backend',
    dialogueByIE: {
      high: 'Sofía (a punto de llorar): "¡Marcos ha cambiado la estructura de la API sin avisarme y mi pantalla da error en blanco!" Marcos: "¡Tu diseño pedía cargar 50 gráficos a la vez y colapsaba el servidor!" (Ambos esperan tu mediación).',
      normal: 'Sofía y Marcos discuten a gritos porque la API no manda los datos como necesita el Frontend. Sofía está a punto de llorar.',
      low: 'Ambos te miran con hostilidad al entrar: "¿Qué miras? ¡Esto también es culpa tuya por no coordinar el contrato de la API!"',
    },
    internalThought:
      'Si huyo, Sofía pedirá la baja por estrés; si tomo partido por uno, destruiré la Confianza y Complementariedad del otro. Debo mediar con Escucha Activa.',
    options: [
      {
        id: 'opt_2_2_a',
        label: '"Uy, perdón, solo venía a por un rotulador. Arregladlo entre vosotros, que yo tengo prisa con mi código."',
        styleTag: 'Evitación / Huida',
        timeCostMinutes: 10,
        ieDelta: -15,
        fiveCDelta: { compromiso: -25, coordinacion: -30 },
        affinityDelta: { sofia: -20, marcos: -15 },
        stressDelta: 25,
        consequenceText:
          'El conflicto se enquista: Sofía pide la baja por estrés el jueves y el proyecto pierde el diseño frontal.',
      },
      {
        id: 'opt_2_2_b',
        label: '"Marcos tiene razón, Sofía, no tienes ni idea de servidores; rehagan todo el diseño desde cero ahora mismo."',
        styleTag: 'Tomar Partido / Culpar',
        timeCostMinutes: 40,
        ieDelta: -20,
        fiveCDelta: { confianza: -30, complementariedad: -30 },
        affinityDelta: { sofia: -30, marcos: 5 },
        stressDelta: 25,
        consequenceText:
          'Rompes la seguridad psicológica de Sofía y el equipo queda partido en dos bandos irreconciliables.',
      },
      {
        id: 'opt_2_2_c',
        label: '"Paremos un segundo. Ambos buscáis que FinTrack 2.0 sea excelente: Sofía quiere una experiencia visual increíble y Marcos que el servidor vuele. Miremos el Gantt: si Marcos añade paginación en 1h y Sofía carga 5 gráficos progresivos, ganamos todos."',
        styleTag: 'Mediación + Reformulación + Gantt',
        timeCostMinutes: 45,
        ieDelta: 25,
        fiveCDelta: {
          confianza: 25,
          coordinacion: 25,
          comunicacion: 25,
          complementariedad: 25,
        },
        affinityDelta: { sofia: 25, marcos: 25, elena: 15 },
        stressDelta: -20,
        timeManagementDelta: 15,
        consequenceText:
          'Sofía y Marcos se piden disculpas mutuamente y trabajan codo con codo contigo. ¡El equipo alcanza el estado de Alto Rendimiento para el Acto 3!',
      },
    ],
  },

  scene_3_1_black_friday: {
    id: 'scene_3_1_black_friday',
    act: 3,
    title: 'Acto 3 · Escena 3.1: El Lanzamiento (Release a las 17:00h)',
    speaker: 'David & Todo el Equipo',
    speakerRole: 'Último Día · Faltan minutos para la Subida a Producción',
    dialogueByIE: {
      high: 'David (en pánico): "¡El cliente llama en 15 minutos y hay un fallo crítico de última hora en pre-producción! ¿¡Qué hacemos!?" Todo el equipo confía en tu liderazgo para coordinar el despliegue final y responder al cliente.',
      normal: 'David: "¡El sistema reporta un fallo crítico antes de la subida de las 17:00h y el cliente está al teléfono! ¿¡Quién da la cara y cómo lo resolvemos!?"',
      low: 'David (gritando): "¡El servidor está caído antes de las 17:00h y el cliente exige explicaciones al teléfono! ¡Como no esté resuelto hoy mismo, rodarán cabezas!"',
    },
    internalThought:
      'Es el clímax del Acto 3. Si culpo a Lucas o huyo del teléfono de David, destruiré al equipo. Si lidero con responsabilidad compartida y asertividad, triunfaremos.',
    options: [
      {
        id: 'opt_3_1_a',
        label: '"Ha sido culpa del código de Lucas y de los colores en Safari de Sofía, David. Díselo al cliente, yo mi parte la dejé bien."',
        styleTag: 'Chivo Expiatorio / Traición',
        timeCostMinutes: 120,
        ieDelta: -30,
        fiveCDelta: {
          compromiso: -50,
          confianza: -50,
          coordinacion: -30,
          comunicacion: -20,
          complementariedad: -30,
        },
        affinityDelta: { elena: -30, david: -20, marcos: -30, sofia: -30, lucas: -35 },
        stressDelta: 40,
        triggersEndingEvaluation: true,
        consequenceText:
          'Destruyes la Confianza y el Compromiso del equipo. Elena y Sofía te miran con decepción profunda. Nadie te ayuda y tienes que parchear el servidor en solitario al borde del colapso.',
      },
      {
        id: 'opt_3_1_b',
        label: '"David, pon al cliente en manos libres: le explicaré con asertividad que estamos aplicando el doble blindaje de seguridad. Mientras tanto: Marcos revierte migración BBDD, Sofía y Lucas verifican Safari, yo aplico el parche con Pomodoro y Elena coordina la Release. ¡Vamos!"',
        styleTag: 'Liderazgo + Responsabilidad Compartida',
        timeCostMinutes: 60,
        ieDelta: 25,
        fiveCDelta: {
          compromiso: 25,
          confianza: 25,
          coordinacion: 25,
          comunicacion: 25,
          complementariedad: 25,
        },
        affinityDelta: { elena: 25, david: 25, marcos: 25, sofia: 25, lucas: 25 },
        stressDelta: -25,
        timeManagementDelta: 20,
        unlocksTool: 'pareto',
        setsFlag: 'stood_firm_against_david',
        triggersEndingEvaluation: true,
        consequenceText:
          '¡Despliegue salvado a las 17:00h en punto! Todo el equipo ejecuta el plan con precisión quirúrgica y FinTrack 2.0 brilla ante el banco. Ha llegado la hora del Sprint Review & Retrospective.',
      },
    ],
  },
};