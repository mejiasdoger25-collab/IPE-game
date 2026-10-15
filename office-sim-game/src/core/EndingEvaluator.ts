/**
 * src/core/EndingEvaluator.ts
 * Detailed narrative resolution, statistical summaries, and Radar chart transformers
 * for the 6 cinematic endings from Section 5 of the Bible.
 */

import type { EndingType, FiveCMetrics } from '../types/game';

export interface EndingDetail {
  id: EndingType;
  title: string;
  badge: string;
  tagline: string;
  narrativeScene: string;
  careerImpact: string;
  themeColor: string;
}

export const ENDING_DETAILS: Record<EndingType, EndingDetail> = {
  FIRED_GAME_OVER: {
    id: 'FIRED_GAME_OVER',
    title: 'Despido por Incompetencia y Procrastinación',
    badge: '❌ GAME OVER PREMATURO',
    tagline: 'Incumplimiento reiterado de plazos y falta de autogestión.',
    narrativeScene:
      'David y la directora de Recursos Humanos te convocan a la sala de cristal. Sobre la mesa hay una caja de cartón para que recojas tus pertenencias. "Tienes talento técnico, pero en una fábrica de software no podemos depender de alguien que incumple sistemáticamente los plazos, se distrae en el café y bloquea las entregas del equipo."',
    careerImpact: 'Despido disciplinario en periodo de prueba sin recomendación laboral.',
    themeColor: '#EF4444',
  },

  BURNOUT_SOLITARY_WOLF: {
    id: 'BURNOUT_SOLITARY_WOLF',
    title: 'El "Lobo Solitario" Quemado',
    badge: '🥀 FINAL 2: BURNOUT & AISLAMIENTO',
    tagline: 'Entregaste el código a tiempo, pero destruiste el ambiente de equipo.',
    narrativeScene:
      'FinTrack 2.0 sale a producción el viernes porque trabajaste el doble en solitario ignorando a todos. Sin embargo, nadie en NovaSoft quiere volver a estar en tu equipo. Elena y Lucas celebran el éxito en la cafetería sin invitarte. Son las 21:30 y estás solo frente a la pantalla, agotado física y mentalmente, abriendo LinkedIn porque la hostilidad en la oficina es insoportable.',
    careerImpact: 'Agotamiento severo (Burnout), aislamiento social y nula proyección de liderazgo.',
    themeColor: '#F43F5E',
  },

  EXPLOITED_PEOPLE_PLEASER: {
    id: 'EXPLOITED_PEOPLE_PLEASER',
    title: 'El Complaciente Explotado',
    badge: '😰 FINAL 3: SÍNDROME DEL IMPOSTOR',
    tagline: 'Dijiste "sí a todo" sin negociar; ahora el trabajo de todos recae sobre ti.',
    narrativeScene:
      'Todo el mundo coincide en que eres "muy buena persona", pero David se ha acostumbrado a cargarte con el trabajo de última hora de marketing y clientes. En la reunión semestral no te ascienden porque "careces del carácter y la asertividad para liderar". Pasas tus fines de semana apagando fuegos ajenos sin compensación.',
    careerImpact: 'Estancamiento profesional, sobrecarga laboral crónica y falta de respeto jerárquico.',
    themeColor: '#EAB308',
  },

  SOLID_DEVELOPER: {
    id: 'SOLID_DEVELOPER',
    title: 'Desarrollador Sólido (El Superviviente Equilibrado)',
    badge: '🤝 FINAL 4: EQUILIBRIO PROFESIONAL',
    tagline: 'Buen profesional en crecimiento, relación cordial y entregas estables.',
    narrativeScene:
      'Superas la evaluación semestral con notable alto. El módulo de pagos de FinTrack 2.0 es estable, mantienes una relación cordial con Marcos, Sofía y Lucas, y recibes un aumento salarial estándar del 8%. Has aprendido a balancear tus tiempos y colaborar cuando es necesario.',
    careerImpact: 'Consolidación como Desarrollador Fullstack Mid-Level con proyección estable.',
    themeColor: '#38BDF8',
  },

  TECH_LEAD_EXCELLENCE: {
    id: 'TECH_LEAD_EXCELLENCE',
    title: 'Ascenso a Tech Lead / Líder de Ingeniería',
    badge: '🏆 FINAL 5: FINAL VERDADERO DE EXCELENCIA',
    tagline: 'Uniste al equipo, dominaste las 5 C y salvaste el proyecto con maestría ágil.',
    narrativeScene:
      'La demo bancaria del viernes es un triunfo absoluto. En la Sprint Retrospective, tanto Marcos (que antes no respetaba a nadie) como Sofía, Lucas y Elena destacan ante la directiva que tu empatía, escucha activa, asertividad y dominio de herramientas salvaron el proyecto. David te anuncia la creación de una nueva célula de desarrollo y tu ascenso inmediato a Tech Lead.',
    careerImpact: 'Ascenso a Tech Lead con autonomía total para diseñar la cultura de tu equipo.',
    themeColor: '#10B981',
  },

  STARTUP_COFOUNDERS: {
    id: 'STARTUP_COFOUNDERS',
    title: 'La Chispa Emprendedora ("Co-Fundadores")',
    badge: '🚀 FINAL 6: FINAL SECRETO',
    tagline: 'Cohesión legendaria: fundáis vuestra propia Startup de software.',
    narrativeScene:
      'La sinergia entre tú, Marcos (cerebro de backend), Sofía (visionaria de UX) y Lucas (ya convertido en un programador brillante gracias a tu mentoría) es tan extraordinaria que os dais cuenta de que juntos sois imparables. Tras entregar con honor en NovaSoft y plantar cara con elegancia a las malas prácticas comerciales de David, os reunís fuera de la oficina: habéis cerrado financiación semilla para fundar vuestra propia empresa tecnológica.',
    careerImpact: 'Co-Fundador y CTO de una Startup tecnológica con cultura de alta confianza.',
    themeColor: '#A855F7',
  },
};

/**
 * Transforms FiveCMetrics into Recharts radar format
 */
export function formatRadarData(fiveCs: FiveCMetrics) {
  return [
    { subject: 'Compromiso (C1)', score: fiveCs.compromiso, baseline: 50 },
    { subject: 'Confianza (C2)', score: fiveCs.confianza, baseline: 50 },
    { subject: 'Coordinación (C3)', score: fiveCs.coordinacion, baseline: 50 },
    { subject: 'Comunicación (C4)', score: fiveCs.comunicacion, baseline: 50 },
    { subject: 'Complementariedad (C5)', score: fiveCs.complementariedad, baseline: 50 },
  ];
}
