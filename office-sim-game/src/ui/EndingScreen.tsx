/**
 * src/ui/EndingScreen.tsx
 * Cierre y Evaluación Final ("Sprint Review & Retrospective") según el guion:
 * 1. Evaluación de Tiempo e Interrupciones que consumieron más minutos
 * 2. Clasificación del Estado del Equipo (Equipo de Alto Rendimiento / Fábrica de Estrés / Fracaso Ágil)
 * 3. Feedback personalizado de los 5 NPCs (Elena, David, Marcos, Sofía, Lucas)
 */

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { useGameStore } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import { ENDING_DETAILS, formatRadarData } from '../core/EndingEvaluator';
import { AudioManager } from '../core/AudioManager';

export const EndingScreen: React.FC = () => {
  const {
    ending,
    fiveCs,
    affinities,
    teamStress,
    timeManagement,
    interruptionHistory,
    tasks,
    emotionalIntelligence,
    strikes,
    resetGame,
    getICE,
  } = useGameStore();
  const { resetQuests } = useQuestStore();

  const currentEnding = ending || 'SOLID_DEVELOPER';
  const details = ENDING_DETAILS[currentEnding];
  const radarData = formatRadarData(fiveCs);
  const ice = getICE();

  const pendingTasks = tasks.filter((t) => t.status !== 'DONE').length;

  // Clasificación oficial del Guion (Sección "Cierre y Evaluación Final")
  const scriptTeamTier =
    strikes >= 3 || (ice < 45 && pendingTasks > 4)
      ? {
          title: 'FRACASO ÁGIL (Final Malo)',
          desc: 'Ni se completó el alcance con calidad ni se construyó un equipo cohesionado.',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        }
      : teamStress >= 65 || ice < 55
      ? {
          title: 'FÁBRICA DE ESTRÉS (Final Neutro / Agridulce)',
          desc: 'Se sacó el trabajo adelante, pero a costa de quemar las relaciones y disparar el estrés.',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        }
      : {
          title: 'EQUIPO DE ALTO RENDIMIENTO (Final Bueno)',
          desc: 'Alta Confianza, Coordinación impecable, baja fricción y entrega exitosa de FinTrack 2.0.',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };

  const handleRestart = () => {
    AudioManager.playKeyClack();
    resetGame();
    resetQuests();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/75 backdrop-blur-xs p-4 overflow-y-auto font-sans select-none text-stone-950">
      <div className="bg-[#FDFBF7] border-2 border-[#C2B299] rounded-3xl p-6 md:p-8 max-w-5xl w-full shadow-2xl space-y-5 my-auto">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-[#D6CFC2] pb-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className="inline-block px-3.5 py-1 rounded-full text-xs font-mono font-black uppercase border"
              style={{
                backgroundColor: `${details.themeColor}22`,
                color: details.themeColor,
                borderColor: `${details.themeColor}66`,
              }}
            >
              {details.badge}
            </span>
            <span
              className={`inline-block px-3.5 py-1 rounded-full text-xs font-mono font-black uppercase border ${scriptTeamTier.badgeClass}`}
            >
              {scriptTeamTier.title}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-950">
            {details.title}
          </h1>
          <p className="text-xs md:text-sm text-stone-700 max-w-2xl mx-auto italic">
            "{scriptTeamTier.desc}"
          </p>
        </div>

        {/* Narrative Scene */}
        <div className="p-4 bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] text-xs md:text-sm leading-relaxed text-stone-900 font-medium">
          <p>{details.narrativeScene}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Radar + Métricas Globales */}
          <div className="md:col-span-5 space-y-3">
            <div className="h-56 w-full bg-[#F4F1EA] rounded-2xl border border-[#D6CFC2] p-2 flex flex-col items-center justify-center">
              <span className="text-[11px] font-mono font-bold text-stone-700 mb-1">
                Radar Final de Soft Skills (Las 5 C)
              </span>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#D6CFC2" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4A3B32', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#7C6F64', fontSize: 9 }} />
                  <Radar
                    name="Tu Desempeño"
                    dataKey="score"
                    stroke={details.themeColor}
                    fill={details.themeColor}
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC]">
                <span className="text-[10px] text-stone-600 block font-bold">Gestión del Tiempo:</span>
                <span className="text-base font-black text-[#2C4A6F]">{timeManagement} / 100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC]">
                <span className="text-[10px] text-stone-600 block font-bold">Estrés Final Equipo:</span>
                <span className="text-base font-black text-[#8C2D19]">{teamStress} / 100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC]">
                <span className="text-[10px] text-stone-600 block font-bold">Empatía (IE):</span>
                <span className="text-base font-black text-[#2C4A6F]">{emotionalIntelligence} / 100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC]">
                <span className="text-[10px] text-stone-600 block font-bold">Cohesión (ICE):</span>
                <span className="text-base font-black text-[#2F5233]">{ice} / 100</span>
              </div>
            </div>
          </div>

          {/* Feedback Final de los 5 Personajes + Interrupciones */}
          <div className="md:col-span-7 space-y-3 text-xs">
            <div className="p-4 bg-[#F4EFE6] rounded-2xl border border-[#C2B299] space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#6F5643]">
                3. Feedback Final de tus Compañeros (3 Sprints)
              </h3>
              <p>
                <strong className="text-[#832B66]">Elena (Scrum Master · Afinidad {affinities.elena}%):</strong>{' '}
                {affinities.elena >= 65
                  ? '"Has sido el pegamento ágil del equipo: cuidaste el WIP, fomentaste la transparencia y desbloqueaste cada impedimento."'
                  : '"El talento técnico sin coordinación ágil genera cuellos de botella. Necesitas escuchar más en las ceremonias."'}
              </p>
              <p>
                <strong className="text-[#7C5117]">David (Product Owner · Afinidad {affinities.david}%):</strong>{' '}
                {affinities.david >= 65
                  ? '"Sabes defender la calidad del producto con argumentos de negocio y dar la cara ante el banco con total asertividad."'
                  : '"Necesito desarrolladores que propongan soluciones viables en lugar de decir que sí a todo o chocar frontalmente."'}
              </p>
              <p>
                <strong className="text-[#8C2D19]">Marcos (Senior Backend · Afinidad {affinities.marcos}%):</strong>{' '}
                {affinities.marcos >= 65
                  ? '"Al principio pensé que serías uno más, pero me ganaste con lógica, humildad técnica y compañerismo en el código."'
                  : '"Demasiado ego y poca atención a la arquitectura. Nunca llegamos a entendernos en los Pull Requests."'}
              </p>
              <p>
                <strong className="text-[#5B21B6]">Sofía (UX/UI Designer · Afinidad {affinities.sofia}%):</strong>{' '}
                {affinities.sofia >= 65
                  ? '"Trabajar contigo ha sido un refugio de paz. Respetaste cada detalle visual y me calmaste cuando Safari falló."'
                  : '"Me sentí sola y poco valorada cada vez que las prisas pisoteaban la experiencia de usuario."'}
              </p>
              <p>
                <strong className="text-[#065F46]">Lucas (Junior Dev · Afinidad {affinities.lucas}%):</strong>{' '}
                {affinities.lucas >= 65
                  ? '"Gracias a tu mentoría perdí el miedo a Git y a confesar errores a tiempo. ¡Eres el referente al que quiero parecerme!"'
                  : '"Pasé los tres Sprints con miedo a preguntar por temor a quedar en ridículo."'}
              </p>
            </div>

            <div className="p-3.5 bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] space-y-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-800">
                1. Evaluación de Tiempo e Interrupciones ({interruptionHistory.length} registradas)
              </h4>
              {interruptionHistory.length > 0 ? (
                <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                  {interruptionHistory
                    .slice()
                    .sort((a, b) => b.timeLostMinutes - a.timeLostMinutes)
                    .map((rec, idx) => (
                      <div
                        key={`${rec.nodeId}_${idx}`}
                        className="flex justify-between items-center bg-[#FDFBF7] px-2.5 py-1 rounded border border-[#D6CFC2]"
                      >
                        <span className="font-semibold text-stone-800 truncate">
                          Sprint {rec.act} · {rec.speaker}: {rec.optionChosen}
                        </span>
                        <span className="font-mono font-bold text-[#8C2D19] shrink-0 ml-2">
                          -{rec.timeLostMinutes} min
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-stone-600 italic">
                  Completaste la partida sin interrupciones registradas en el historial.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-3 border-t border-[#D6CFC2]">
          <button
            onClick={handleRestart}
            className="px-8 py-3 rounded-2xl bg-[#6F5643] hover:bg-[#5C4736] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            🔄 Jugar Nuevamente (Nuevo Intento)
          </button>
        </div>
      </div>
    </div>
  );
};