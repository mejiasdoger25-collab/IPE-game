/**
 * src/data/npcs.ts
 * Detailed psychological profiles, soft-skill affinities, and IE-dependent ambient barks
 * for the five office colleagues in NovaSoft Solutions.
 */

import type { IEClimateTier, FiveCKey } from '../types/game';

export interface NPCProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarSprite: string;
  themeColor: string;
  primaryAffinity: FiveCKey;
  secondaryAffinity: FiveCKey;
  personalitySummary: string;
  conflictTrigger: string;
  growthOpportunity: string;
  ambientBarks: Record<IEClimateTier, string[]>;
}

export const NPCS: Record<string, NPCProfile> = {
  elena_scrum: {
    id: 'elena_scrum',
    name: 'Elena',
    role: 'Scrum Master & Facilitadora',
    department: 'Agile & Delivery',
    avatarSprite: 'npc_elena',
    themeColor: '#EC4899',
    primaryAffinity: 'coordinacion',
    secondaryAffinity: 'comunicacion',
    personalitySummary:
      'Organizada, observadora y defensora acérrima de Scrum. Valora la transparencia en las Dailies, la puntualidad y el bienestar colectivo.',
    conflictTrigger: 'Ocultar impedimentos, rechazar trabajar en equipo o llegar tarde a las reuniones.',
    growthOpportunity: 'Enseña a gestionar bloqueos temprano y premia la colaboración activa.',
    ambientBarks: {
      EMPATHIC_SYNERGY: [
        '¡Qué gusto ver al equipo tan sincronizado hoy!',
        'Avisé a David de que el ritmo es óptimo, buen trabajo.',
        'Si necesitas un descanso de 5 minutos, tómalo con calma.',
      ],
      PROFESSIONAL_CLIMATE: [
        'Recuerda actualizar el estado de tus tickets en la pizarra.',
        'La Daily empieza a las 09:30 en punto.',
        '¿Tienes algún bloqueo técnico que debamos escalar?',
      ],
      HOSTILE_ENVIRONMENT: [
        'Por favor, no te saltes los acuerdos del equipo.',
        'Elena anota en su libreta con expresión de preocupación.',
        'El Sprint Goal está en peligro si no nos coordinamos.',
      ],
    },
  },

  david_po: {
    id: 'david_po',
    name: 'David',
    role: 'Product Owner & Director Comercial',
    department: 'Negocio & Clientes',
    avatarSprite: 'npc_david',
    themeColor: '#F59E0B',
    primaryAffinity: 'compromiso',
    secondaryAffinity: 'comunicacion',
    personalitySummary:
      'El puente entre el cliente bancario y el equipo. Vive bajo constante presión comercial, promete plazos imposibles y empuja Scope Creep.',
    conflictTrigger: 'Respuestas agresivas sin alternativas o prometer cosas sin cumplirlas (Strikes).',
    growthOpportunity: 'Respeta la asertividad y las soluciones 80/20 respaldadas con Eisenhower y Pareto.',
    ambientBarks: {
      EMPATHIC_SYNERGY: [
        '¡El cliente bancario está encantado con los avances!',
        'Aprecio que me des soluciones viables en lugar de quejas.',
        'Buen trabajo manteniendo la calma con las entregas.',
      ],
      PROFESSIONAL_CLIMATE: [
        '¿Llegamos a la demo del viernes con todo el alcance?',
        'Tengo otra llamada con el director de cuenta en 10 minutos.',
        'Prioricemos lo que aporte impacto visual para el cliente.',
      ],
      HOSTILE_ENVIRONMENT: [
        '¡No tolero retrasos en FinTrack 2.0!',
        'David te mira desde el cristal de su despacho con el ceño fruncido.',
        'Si no llegas a tiempo, tendré que hablar con Recursos Humanos.',
      ],
    },
  },

  marcos_senior: {
    id: 'marcos_senior',
    name: 'Marcos',
    role: 'Senior Backend Developer ("El Lobo Solitario")',
    department: 'Arquitectura & Core Backend',
    avatarSprite: 'npc_marcos',
    themeColor: '#EF4444',
    primaryAffinity: 'complementariedad',
    secondaryAffinity: 'coordinacion',
    personalitySummary:
      'Lleva 6 años en la empresa. Genio en optimización SQL y arquitecturas de alto rendimiento, pero impaciente y cortante en revisiones de código.',
    conflictTrigger: 'Código desordenado, consultas lentas sin índices y falta de rigor técnico.',
    growthOpportunity: 'Baja la guardia ante la escucha activa y comparte trucos avanzados de arquitectura.',
    ambientBarks: {
      EMPATHIC_SYNERGY: [
        'Tu última Pull Request estaba impecable. Buen uso del índice.',
        'Si tienes dudas con la paginación SQL, ven y lo vemos en 5 min.',
        'Buen trabajo protegiendo el tiempo de respuesta del servidor.',
      ],
      PROFESSIONAL_CLIMATE: [
        'Sube la rama a GitHub y cuando tenga un hueco la miro.',
        'No metas dependencias innecesarias en el package.json.',
        'Esa consulta va a ir lenta si no optimizas el JOIN.',
      ],
      HOSTILE_ENVIRONMENT: [
        'Este código es ineficiente. Rehacer.',
        'Marcos ni siquiera levanta la vista de su monitor curvo.',
        'Trabajar en equipo aquí es perder el tiempo.',
      ],
    },
  },

  sofia_ux: {
    id: 'sofia_ux',
    name: 'Sofía',
    role: 'UX/UI Designer & Frontend Engineer',
    department: 'Experiencia de Usuario',
    avatarSprite: 'npc_sofia',
    themeColor: '#8B5CF6',
    primaryAffinity: 'confianza',
    secondaryAffinity: 'complementariedad',
    personalitySummary:
      'Creativa, detallista y muy empática. Diseña interfaces visualmente impresionantes pero sufre de ansiedad si hay gritos o tensiones en el equipo.',
    conflictTrigger: 'Cambios sorpresa en la API de backend sin avisarle que rompen sus pantallas.',
    growthOpportunity: 'Brilla cuando se le da seguridad psicológica y se coordina con el Diagrama de Gantt.',
    ambientBarks: {
      EMPATHIC_SYNERGY: [
        '¡Me encanta cómo ha quedado la animación de carga!',
        'Gracias por avisarme del cambio de contrato de la API.',
        'Me siento muy cómoda diseñando para este equipo.',
      ],
      PROFESSIONAL_CLIMATE: [
        'Estoy terminando los mockups de Figma para el panel de gastos.',
        '¿El endpoint devuelve los datos paginados o en un array plano?',
        'Necesito confirmar la paleta de colores antes del mediodía.',
      ],
      HOSTILE_ENVIRONMENT: [
        'Nadie me avisa de nada en este proyecto...',
        'Sofía suspira frente a una pantalla de error en blanco.',
        'Siento que mi trabajo aquí no se valora.',
      ],
    },
  },

  lucas_junior: {
    id: 'lucas_junior',
    name: 'Lucas',
    role: 'Junior Developer en Prácticas',
    department: 'Desarrollo Fullstack',
    avatarSprite: 'npc_lucas',
    themeColor: '#10B981',
    primaryAffinity: 'confianza',
    secondaryAffinity: 'compromiso',
    personalitySummary:
      'Entusiasta y con muchas ganas de aprender, pero inseguro. Tiene pánico a preguntar por miedo a parecer incompetente frente a Marcos.',
    conflictTrigger: 'Humillación pública o que le quiten sus tareas de forma paternalista.',
    growthOpportunity: 'Con Pair Programming y empatía, aprende rápido y automatiza las pruebas unitarias.',
    ambientBarks: {
      EMPATHIC_SYNERGY: [
        '¡Gracias a tu explicación de ayer ya entendí los tokens JWT!',
        'He automatizado tus tests unitarios para devolverte el favor.',
        '¡Me alegra muchísimo tenerte como compañero!',
      ],
      PROFESSIONAL_CLIMATE: [
        'Estoy leyendo la documentación de la librería de autenticación.',
        '¿Crees que voy muy lento con mi ticket de registro?',
        'Voy a intentar resolver esto por mi cuenta antes de molestar.',
      ],
      HOSTILE_ENVIRONMENT: [
        'Lucas mira al suelo nervioso y oculta su consola llena de errores.',
        'Seguro que Marcos piensa que soy un inútil...',
        'Tengo miedo de subir este commit y romper la base de datos.',
      ],
    },
  },
};
