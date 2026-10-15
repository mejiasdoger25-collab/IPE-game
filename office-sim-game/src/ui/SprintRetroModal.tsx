/**
 * src/ui/SprintRetroModal.tsx
 * Sprint Retrospective & Analytics Modal for DevLife RPG.
 * Visualizes the team's 5 Cs evolution and provides narrative feedback from Elena, Marcos, and David.
 * Harmonized with warm light brown, stone cream, and taupe editorial aesthetic with Inter black typography.
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
import { formatRadarData } from '../core/EndingEvaluator';
import { AudioManager } from '../core/AudioManager';
import { SaveManager } from '../core/SaveManager';
import type { SprintNumber } from '../types/game';

export const SprintRetroModal: React.FC = () => {
  const {
    currentSprint,
    setSprint,
    closeModal,
    fiveCs,
    emotionalIntelligence,
    strikes,
    getICE,
    getTeamVelocity,
    triggerEnding,
    evaluateCurrentEnding,
  } = useGameStore();

  const radarData = formatRadarData(fiveCs);
  const ice = getICE();
  const velocity = getTeamVelocity();

  const handleNextSprint = () => {
    AudioManager.playKeyClack();
    if (currentSprint < 3) {
      setSprint((currentSprint + 1) as SprintNumber);
      SaveManager.autoSave();
      closeModal();
    } else {
      // Act 3 completed: Evaluate final ending!
      const ending = evaluateCurrentEnding();
      SaveManager.autoSave();
      triggerEnding(ending);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans select-none text-stone-950">
      <div className="bg-[#FDFBF7] border-2 border-[#C2B299] rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-[#6F5643] uppercase tracking-wider block">
              Sprint Retrospective · Ceremonia Ágil
            </span>
            <h2 className="text-2xl font-extrabold text-stone-950">
              Cierre del Sprint {currentSprint}: Evaluación de Equipo
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

        {/* Radar & Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Radar Chart */}
          <div className="md:col-span-6 h-64 bg-[#F4F1EA] rounded-2xl border border-[#D6CFC2] p-2 flex flex-col items-center justify-center shadow-xs">
            <span className="text-[11px] font-mono font-bold text-stone-700 mb-1">
              Equilibrio de las 5 C en el Sprint {currentSprint}
            </span>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#D6CFC2" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4A3B32', fontSize: 11, fontWeight: 'bold' }} />
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

          {/* Feedback Points */}
          <div className="md:col-span-6 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] shadow-xs">
                <span className="text-[10px] text-stone-600 block font-bold">Cohesión Global (ICE):</span>
                <span className="text-base font-black text-[#2F5233]">{ice} / 100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] shadow-xs">
                <span className="text-[10px] text-stone-600 block font-bold">Velocidad Multiplier:</span>
                <span className="text-base font-black text-[#4A3B32]">{velocity}x</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] shadow-xs">
                <span className="text-[10px] text-stone-600 block font-bold">Inteligencia Emocional:</span>
                <span className="text-base font-black text-[#2C4A6F]">{emotionalIntelligence}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] shadow-xs">
                <span className="text-[10px] text-stone-600 block font-bold">Faltas (Strikes):</span>
                <span className="text-base font-black text-[#8C2D19]">{strikes} / 3</span>
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="p-3 bg-[#F4EFE6] rounded-2xl border border-[#C2B299] space-y-2 shadow-xs">
              <div className="text-[11px] font-bold text-[#832B66]">
                Elena (Scrum Master):
                <span className="font-normal text-stone-800 ml-1.5 leading-relaxed">
                  {ice >= 60
                    ? '"El equipo ha demostrado gran madurez para coordinarse y apoyarse en los bloqueos."'
                    : '"Necesitamos mejorar la comunicación y la puntualidad antes de la siguiente entrega."'}
                </span>
              </div>

              <div className="text-[11px] font-bold text-[#7C5117]">
                David (Product Owner):
                <span className="font-normal text-stone-800 ml-1.5 leading-relaxed">
                  {strikes === 0
                    ? '"Los plazos pactados se han respetado. Buen trabajo protegiendo el producto."'
                    : '"Los retrasos generan incertidumbre con el cliente bancario. Hay que apretar el paso."'}
                </span>
              </div>

              <div className="text-[11px] font-bold text-[#8C2D19]">
                Marcos (Senior Backend):
                <span className="font-normal text-stone-800 ml-1.5 leading-relaxed">
                  {fiveCs.complementariedad >= 60
                    ? '"Las Pull Requests han mejorado mucho. Se nota que revisas antes de subir."'
                    : '"Sigo viendo falta de atención a los índices y al rendimiento. No bajes la guardia."'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-[#D6CFC2]">
          <button
            onClick={handleNextSprint}
            className="px-8 py-3 rounded-2xl bg-[#6F5643] hover:bg-[#5C4736] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            {currentSprint < 3 ? `Avanzar al Sprint ${currentSprint + 1} ➔` : 'Evaluar Calificación Final ➔'}
          </button>
        </div>
      </div>
    </div>
  );
};
