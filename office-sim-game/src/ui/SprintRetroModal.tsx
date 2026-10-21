/**
 * src/ui/SprintRetroModal.tsx
 * Sprint Review & Retrospective con Radar de las 5 C, estado de Afinidades de los 5 NPCs,
 * desglose de Interrupciones y transición automática a la Daily del siguiente Sprint.
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
import { formatRadarData } from '../core/EndingEvaluator';
import { AudioManager } from '../core/AudioManager';
import { SaveManager } from '../core/SaveManager';
import type { SprintNumber } from '../types/game';

export const SprintRetroModal: React.FC = () => {
  const {
    currentSprint,
    setSprint,
     setActiveModal,
    closeModal,
    fiveCs,
    affinities,
    teamStress,
    timeManagement,
    interruptionHistory,
    getICE,
    getTeamVelocity,
    triggerEnding,
    evaluateCurrentEnding,
  } = useGameStore();

  const { setActiveStoryNode } = useQuestStore();

  const radarData = formatRadarData(fiveCs);
  const ice = getICE();
  const velocity = getTeamVelocity();
  const sprintInterruptions = interruptionHistory.filter((i) => i.act === currentSprint);

  const handleNextSprint = () => {
    AudioManager.playKeyClack();
    if (currentSprint < 3) {
      const nextSprint = (currentSprint + 1) as SprintNumber;
      setSprint(nextSprint);
      SaveManager.autoSave();
      const nextDaily = nextSprint === 2 ? 'act2_daily' : 'act3_daily';
      setActiveStoryNode(nextDaily);
      setActiveModal('DIALOGUE');
    } else {
      const ending = evaluateCurrentEnding();
      SaveManager.autoSave();
      triggerEnding(ending);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-xs pt-36 pb-4 px-4 overflow-y-auto font-sans select-none text-stone-950">
      <div className="bg-[#FDFBF7] border-2 border-[#C2B299] rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-5 my-auto">
        <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
          <div>
            <span className="text-xs font-mono font-bold text-[#6F5643] uppercase tracking-wider block">
              Sprint Review & Retrospective · Acto {currentSprint}
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-stone-950">
              Evaluación de Fin de Sprint {currentSprint}
            </h2>
          </div>
          <button
            onClick={() => {
              AudioManager.playKeyClack();
              closeModal();
            }}
            className="text-stone-500 hover:text-stone-950 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5 h-56 bg-[#F4F1EA] rounded-2xl border border-[#D6CFC2] p-2 flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono font-bold text-stone-700 mb-1">
              Radar de Soft Skills (Sprint {currentSprint})
            </span>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#D6CFC2" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4A3B32', fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#7C6F64', fontSize: 9 }} />
                <Radar
                  name="Métricas"
                  dataKey="score"
                  stroke="#6F5643"
                  fill="#C2B299"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="md:col-span-7 space-y-3 text-xs">
            <div className="grid grid-cols-4 gap-2 font-mono">
              <div className="p-2 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC]">
                <span className="text-[9px] text-stone-600 block font-bold">Cohesión ICE:</span>
                <span className="text-sm font-black text-[#2F5233]">{ice}/100</span>
              </div>
              <div className="p-2 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC]">
                <span className="text-[9px] text-stone-600 block font-bold">Gestión Tiempo:</span>
                <span className="text-sm font-black text-[#2C4A6F]">{timeManagement}/100</span>
              </div>
              <div className="p-2 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC]">
                <span className="text-[9px] text-stone-600 block font-bold">Estrés Equipo:</span>
                <span className="text-sm font-black text-[#8C2D19]">{teamStress}/100</span>
              </div>
              <div className="p-2 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC]">
                <span className="text-[9px] text-stone-600 block font-bold">Velocidad:</span>
                <span className="text-sm font-black text-[#4A3B32]">{velocity}x</span>
              </div>
            </div>

            {/* Feedback de los 5 Personajes */}
            <div className="p-3 bg-[#F4EFE6] rounded-2xl border border-[#C2B299] space-y-1.5">
              <div className="text-[11px] font-bold text-[#832B66]">
                Elena ({affinities.elena}%):{' '}
                <span className="font-normal text-stone-800">
                  {affinities.elena >= 55
                    ? '"Excelente control del WIP y transparencia en la Daily."'
                    : '"Debemos cuidar la coordinación y no trabajar aislados."'}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#7C5117]">
                David ({affinities.david}%):{' '}
                <span className="font-normal text-stone-800">
                  {affinities.david >= 55
                    ? '"Valoro tu asertividad para negociar el alcance sin romper las entregas."'
                    : '"El cliente bancario exige resultados y mayor firmeza."'}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#8C2D19]">
                Marcos ({affinities.marcos}%):{' '}
                <span className="font-normal text-stone-800">
                  {affinities.marcos >= 55
                    ? '"Buen criterio técnico y buena actitud en los Pull Requests."'
                    : '"El código necesita más rigor y menos excusas."'}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#5B21B6]">
                Sofía ({affinities.sofia}%):{' '}
                <span className="font-normal text-stone-800">
                  {affinities.sofia >= 55
                    ? '"Gracias por escuchar a UX y mediar con tanta empatía."'
                    : '"Me siento desbordada cuando nadie respeta el diseño."'}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#065F46]">
                Lucas ({affinities.lucas}%):{' '}
                <span className="font-normal text-stone-800">
                  {affinities.lucas >= 55
                    ? '"¡Gracias por tu mentoría! Contigo aprendo sin miedo a preguntar."'
                    : '"Todavía me da pánico tocar el repositorio por si me bronqueáis."'}
                </span>
              </div>
            </div>

            {sprintInterruptions.length > 0 && (
              <div className="p-2.5 bg-[#EBE7DF] rounded-xl border border-[#D1C9BC]">
                <span className="text-[10px] font-bold text-stone-700 block mb-1">
                  Interrupciones Gestionadas en este Sprint ({sprintInterruptions.length}/5):
                </span>
                <div className="flex flex-wrap gap-1">
                  {sprintInterruptions.map((item) => (
                    <span
                      key={item.nodeId}
                      className="text-[10px] bg-[#FDFBF7] px-2 py-0.5 rounded border border-[#C2B299]"
                    >
                      {item.speaker}: -{item.timeLostMinutes}m ({item.optionChosen})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#D6CFC2]">
          <button
            onClick={handleNextSprint}
            className="px-7 py-2.5 rounded-2xl bg-[#6F5643] hover:bg-[#5C4736] text-white font-bold text-sm shadow-md cursor-pointer"
          >
            {currentSprint < 3
              ? `Iniciar Sprint ${currentSprint + 1} (Ir a la Daily Stand-up) ▶`
              : 'Ver Sprint Review & Evaluación Final ▶'}
          </button>
        </div>
      </div>
    </div>
  );
};