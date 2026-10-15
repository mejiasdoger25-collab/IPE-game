// src/data/storyNodes.ts
import type { FiveCMetrics, TimeTool } from '../state/useGameStore';

export type CommunicationStyle =
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
  dialogueByIE: {
    high: string;   // IE >= 60
    normal: string; // IE 40 - 59
    low: string;    // IE < 40
  };
  internalThought: string;
  options: DialogueOption[];
}

export const STORY_NODES: Record<string, StoryNode> = {
  // ACTO 1 - ESCENA 1.1
  scene_1_1_daily: {
    id: 'scene_1_1_daily',
    act: 1,
    title: 'Acto 1 · Escena 1.1: La Daily Stand-up y la Petición de Ayuda',
    speaker: 'Elena & Lucas',
    speakerRole: 'Scrum Master & Junior Dev',
    dialogueByIE: {
      high: 'Elena: "¡Buenos días, equipo! Tenemos 5 días para cerrar el módulo de acceso. Lucas lleva atascado desde el viernes con la validación de tokens. Como conecta con tu pasarela, ¿cómo quieres enfocarlo hoy?"',
      normal: 'Elena: "Buenos días. Lucas sigue bloqueado con la validación de tokens del registro. Tú tienes asignada la pasarela de datos que conecta con lo suyo. ¿Cómo procedemos?"',
      low: 'Elena (seria): "Vamos al grano. Lucas está bloqueado con los tokens y Marcos dice que no piensa hacer de niñera. Tu código depende de esto. ¿Qué vas a hacer?"',
    },
    internalThought:
      'Si me siento con Lucas a hacer Pair Programming perderé tiempo de mi mañana y mi reloj irá más justo (Inconveniente). Pero si lo dejo solo, su código y el mío no encajarán mañana y el ambiente se volverá tenso (Ventaja de colaborar vs Riesgo individual).',
    options: [
      {
        id: 'opt_1_1_a',
        label: '"Cada uno tiene sus tickets asignados, Elena. Yo voy a encerrarme con mi parte para terminarla rápido; cuando Lucas acabe la suya como pueda, ya veremos cómo lo unimos."',
        styleTag: 'Individualista / Rechazo',
        timeCostMinutes: 20,
        ieDelta: -10,
        fiveCDelta: { compromiso: -20, confianza: -15 },
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
        setsFlag: 'humiliated_lucas_act1',
        consequenceText:
          'Humillas a Lucas frente al equipo. El problema técnico sale hoy, pero Lucas dejará de hablarte y no te avisará de futuros fallos.',
      },
      {
        id: 'opt_1_1_c',
        label: '"Entiendo que te hayas bloqueado, Lucas; esa librería de tokens es confusa al principio. Como mi tarea depende de la tuya, dediquemos 45 minutos ahora a revisarlo juntos y definimos el contrato de datos."',
        styleTag: 'Escucha Activa + Las 5 C',
        timeCostMinutes: 45,
        ieDelta: 15,
        fiveCDelta: { confianza: 20, coordinacion: 20, comunicacion: 15 },
        unlocksTool: 'pomodoro',
        setsFlag: 'helped_lucas_act1',
        consequenceText:
          'Elena sonríe. Lucas aprende el patrón y te devuelve el favor automatizando tus pruebas unitarias. ¡Has desbloqueado la Técnica Pomodoro en tu mesa!',
      },
    ],
  },

  // ACTO 1 - ESCENA 1.2
  scene_1_2_marcos_pr: {
    id: 'scene_1_2_marcos_pr',
    act: 1,
    title: 'Acto 1 · Escena 1.2: El Choque de Complementariedad (Code Review)',
    speaker: 'Marcos',
    speakerRole: 'Senior Backend Developer ("El Lobo Solitario")',
    dialogueByIE: {
      high: 'Marcos: "Hola. He visto tu subida. Funciona, pero esa consulta SQL va a ir lenta cuando tengamos diez mil usuarios."',
      normal: 'Marcos: "Te dejé un comentario en la Pull Request: \'Este código es ineficiente. Rehacer\'. Así no sube."',
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
        unlocksTool: 'eisenhower',
        consequenceText:
          'Marcos baja la guardia y te enseña un truco avanzado de optimización. ¡Desbloqueas la Matriz de Eisenhower y el Escáner de Pareto 80/20 en tu ordenador!',
      },
    ],
  },

  // ACTO 2 - ESCENA 2.1
  scene_2_1_david_scope: {
    id: 'scene_2_1_david_scope',
    act: 2,
    title: 'Acto 2 · Escena 2.1: Intrusión del Jefe ("Scope Creep")',
    speaker: 'David',
    speakerRole: 'Product Owner / Director de Cuenta',
    dialogueByIE: {
      high: 'David: "¡Escucha! El Director del Banco quiere que para la demo del viernes incluyamos exportación a PDF con gráficos animados, marketing pide cambiar las fuentes de la web interna y necesito 20 diapositivas de arquitectura. ¡Contamos contigo!"',
      normal: 'David: "Acabo de salir de llamada con el Banco. Quieren PDF con gráficos animados para el viernes, cambiar fuentes internas y 20 diapositivas técnicas. ¡Todo es prioridad máxima!"',
      low: 'David (cortante): "Más vale que saques esto para el viernes: PDF animado para el cliente, cambio de fuentes internas y presentación de 20 diapositivas. No quiero excusas."',
    },
    internalThought:
      'Mi Sprint está al 70% de capacidad. Si digo que sí a todo sin negociar, es matemáticamente imposible terminar a tiempo y recibiré Strikes graves. Puedo usar mi Matriz de Eisenhower y la Ley de Pareto (80/20).',
    options: [
      {
        id: 'opt_2_1_a',
        label: '"Claro, David, no te preocupes. Yo me encargo de las tres cosas además de mis tareas actuales. Ya veré cómo saco tiempo."',
        styleTag: 'Pasiva / Sumisa',
        timeCostMinutes: 180,
        ieDelta: -10,
        fiveCDelta: { compromiso: 5, coordinacion: -20 },
        causesStrike: 2,
        setsFlag: 'accepted_all_scope_creep',
        consequenceText:
          'Tu barra de tareas se desborda un +180%. Fallas dos entregas críticas al final del día y recibes +2 Strikes.',
      },
      {
        id: 'opt_2_1_b',
        label: '"Imposible, David. El Sprint está cerrado según las reglas de Scrum. No voy a tocar ni una línea de código extra porque tú le hayas prometido humos al cliente."',
        styleTag: 'Agresiva',
        timeCostMinutes: 15,
        ieDelta: -20,
        fiveCDelta: { compromiso: -20 },
        consequenceText:
          'David se siente atacado y la relación con dirección queda muy dañada.',
      },
      {
        id: 'opt_2_1_c',
        label: '"Entiendo que impresionar al banco el viernes es clave, David. Para no arriesgar la estabilidad de la demo te propongo: 1) Exportación en CSV + resumen visual (Pareto 80/20), 2) Posponer fuentes internas al Sprint 3 (Eisenhower), y 3) Que Elena nos ayude con las diapositivas."',
        styleTag: 'Negociación Integrativa (Pareto + Eisenhower)',
        timeCostMinutes: 35,
        ieDelta: 25,
        fiveCDelta: { comunicacion: 25, coordinacion: 20, compromiso: 15 },
        unlocksTool: 'gantt',
        setsFlag: 'firm_negotiator_with_david',
        consequenceText:
          'David queda impresionado: "Así se habla. Me das una solución comercial sin romper el calendario. Trato hecho". ¡Desbloqueas el Diagrama de Gantt Interactivo!',
      },
    ],
  },

  // ACTO 2 - ESCENA 2.2
  scene_2_2_meeting_war: {
    id: 'scene_2_2_meeting_war',
    act: 2,
    title: 'Acto 2 · Escena 2.2: Guerra Civil en la Sala de Reuniones (UX vs Backend)',
    speaker: 'Sofía & Marcos',
    speakerRole: 'UX/UI Designer & Senior Backend',
    dialogueByIE: {
      high: 'Sofía (frustrada): "¡Marcos ha cambiado la estructura de datos sin avisarme y mi pantalla de gastos da error en blanco!" Marcos: "¡Tu diseño pedía cargar 50 gráficos a la vez y colapsaba el servidor!" (Ambos se callan al verte entrar y esperan tu mediación).',
      normal: 'Sofía: "¡Marcos ha roto toda mi maquetación cambiando la API sin avisar!" Marcos: "¡Tu diseño de 50 gráficos simultáneos era una locura para la base de datos!"',
      low: 'Ambos te miran con hostilidad al entrar: "¿Y tú qué miras? ¡Esto también es culpa tuya por no coordinar el contrato de la API!"',
    },
    internalThought:
      'Si huyo, Sofía pedirá la baja por estrés; si tomo partido por uno, destruiré la Confianza y Complementariedad del otro. Debo reformular el conflicto con Escucha Activa y sincronizarlos con el Diagrama de Gantt.',
    options: [
      {
        id: 'opt_2_2_a',
        label: '"Uy, perdón, solo venía a por un rotulador. Arregladlo entre vosotros, que yo tengo prisa con mi código."',
        styleTag: 'Evitación / Huida',
        timeCostMinutes: 10,
        ieDelta: -15,
        fiveCDelta: { compromiso: -25, coordinacion: -30 },
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
        consequenceText:
          'Rompes la seguridad psicológica de Sofía y el equipo queda partido en dos bandos irreconciliables.',
      },
      {
        id: 'opt_2_2_c',
        label: '"Paremos un segundo. Ambos buscáis que la app sea excelente: Sofía quiere una experiencia visual increíble y Marcos que el servidor vuele. El fallo ha sido de Comunicación y Coordinación. Miremos el Gantt: si Marcos añade paginación en 1h y Sofía carga 5 gráficos progresivos, ganamos todos."',
        styleTag: 'Mediación + Reformulación + Gantt',
        timeCostMinutes: 45,
        ieDelta: 25,
        fiveCDelta: {
          confianza: 25,
          coordinacion: 25,
          comunicacion: 25,
          complementariedad: 25,
        },
        consequenceText:
          'Sofía y Marcos se piden disculpas mutuamente y trabajan codo con codo contigo. ¡El equipo alcanza el estado de Alto Rendimiento para el Acto 3!',
      },
    ],
  },

  // ACTO 3 - ESCENA 3.1 (CLÍMAX COMPLETO)
  scene_3_1_black_friday: {
    id: 'scene_3_1_black_friday',
    act: 3,
    title: 'Acto 3 · Escena 3.1: La Crisis del "Viernes Negro" en Producción',
    speaker: 'David & Todo el Equipo',
    speakerRole: 'Viernes 16:00 PM — Quedan 90 min para la Demo con el Banco',
    dialogueByIE: {
      high: 'David (en pánico): "¡El cliente entra en 90 minutos y el servidor de pre-producción se ha caído! ¿¡Qué ha pasado!?" (Miras Git: fue un commit de Lucas mezclado con una configuración tuya no documentada. Todo el equipo confía en tu liderazgo).',
      normal: 'David: "¡El sistema no carga a 90 minutos de la demo final! ¿¡Quién ha subido el último cambio que ha roto la base de datos!?"',
      low: 'David (gritando): "¡El servidor está caído a hora y media del cliente! ¡Como no esté resuelto hoy mismo, rodarán cabezas!"',
    },
    internalThought:
      'Es el momento definitivo. Si culpo a Lucas para salvarme yo, destruiré las 5 C y nadie me ayudará. Si asumo la responsabilidad compartida y coordino a Marcos, Sofía, Lucas y Elena con un bloque Pomodoro, salvaremos FinTrack 2.0.',
    options: [
      {
        id: 'opt_3_1_a',
        label: '"Ha sido el código que subió Lucas hace diez minutos, David. Está en el registro de Git. Yo mi parte la dejé bien."',
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
        triggersEndingEvaluation: true,
        consequenceText:
          'Destruyes la Confianza y el Compromiso del equipo. Elena y Sofía te miran con decepción profunda. Nadie te ayuda y tienes que parchear el servidor en solitario al borde del colapso.',
      },
      {
        id: 'opt_3_1_b',
        label: '"David, buscar culpables nos quita tiempo. El fallo ocurrió al integrar el módulo de Lucas con mi configuración; es responsabilidad del equipo y mía. Plan de 60 min: Marcos revierte migración BBDD, Sofía y Lucas verifican UI, yo aplico parche con Pomodoro y Elena comunica a David cada 15 min. ¡Vamos!"',
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
        unlocksTool: 'pareto',
        triggersEndingEvaluation: true,
        consequenceText:
          '¡Despliegue salvado en tiempo récord! Todo el equipo ejecuta el plan con precisión quirúrgica y FinTrack 2.0 brilla ante el banco. Ha llegado la hora de tu Evaluación Final de Contrato.',
      },
    ],
  },
};