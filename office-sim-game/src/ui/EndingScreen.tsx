/**
 * src/ui/EndingScreen.tsx
 * Cinematic Ending Screen with Recharts Radar Chart visualization of the 5 Cs,
 * final soft-skill evaluations, and replay triggers.
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
import { useQuestStore } from '../state/useQuestStore';
import { ENDING_DETAILS, formatRadarData } from '../core/EndingEvaluator';
import { AudioManager } from '../core/AudioManager';

export const EndingScreen: React.FC = () => {
  const { ending, fiveCs, emotionalIntelligence, strikes, unlockedTools, resetGame, getICE, getTeamVelocity } =
    useGameStore();
  const { resetQuests } = useQuestStore();

  const currentEnding = ending || 'SOLID_DEVELOPER';
  const details = ENDING_DETAILS[currentEnding];
  const radarData = formatRadarData(fiveCs);
  const ice = getICE();
  const velocity = getTeamVelocity();

  const handleRestart = () => {
    AudioManager.playKeyClack();
    resetGame();
    resetQuests();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4 overflow-y-auto font-sans select-none text-stone-950">
      <div className="bg-[#FDFBF7] border-2 border-[#C2B299] rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-auto">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-[#D6CFC2] pb-4">
          <span
            className="inline-block px-3.5 py-1.5 rounded-full text-xs font-mono font-black tracking-wider uppercase border shadow-xs"
            style={{
              backgroundColor: `${details.themeColor}22`,
              color: details.themeColor,
              borderColor: `${details.themeColor}66`,
            }}
          >
            {details.badge}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-950 tracking-tight">
            {details.title}
          </h1>
          <p className="text-xs md:text-sm text-stone-700 max-w-xl mx-auto italic font-medium">
            "{details.tagline}"
          </p>
        </div>

        {/* Narrative Scene Description */}
        <div className="p-4 md:p-5 bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] text-xs md:text-sm leading-relaxed text-stone-900 shadow-xs font-medium">
          <p>{details.narrativeScene}</p>
        </div>

        {/* Grid: Radar Chart + Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Radar Chart */}
          <div className="md:col-span-6 h-64 w-full bg-[#F4F1EA] rounded-2xl border border-[#D6CFC2] p-2 flex flex-col items-center justify-center shadow-xs">
            <span className="text-[11px] font-mono font-bold text-stone-700 mb-1">
              Perfil Final de las 5 C de Trabajo en Equipo
            </span>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#D6CFC2" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4A3B32', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#7C6F64', fontSize: 9 }} />
                <Radar
                  name="Tu Desempeño"
                  dataKey="score"
                  stroke={details.themeColor}
                  fill={details.themeColor}
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics & Impact Panel */}
          <div className="md:col-span-6 space-y-3 text-xs">
            <div className="p-3 bg-[#EBE7DF] rounded-xl border border-[#D1C9BC] space-y-1 shadow-xs">
              <span className="text-[10px] text-stone-600 uppercase tracking-wider font-bold">
                Impacto en tu Carrera:
              </span>
              <p className="font-bold text-stone-950">{details.careerImpact}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] shadow-xs">
                <span className="text-[10px] text-stone-600 block font-bold">Inteligencia Emocional:</span>
                <span className="text-base font-black text-[#2C4A6F]">{emotionalIntelligence} / 100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] shadow-xs">
                <span className="text-[10px] text-stone-600 block font-bold">Cohesión Final (ICE):</span>
                <span className="text-base font-black text-[#2F5233]">{ice} / 100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] shadow-xs">
                <span className="text-[10px] text-stone-600 block font-bold">Velocidad de Equipo:</span>
                <span className="text-base font-black text-[#4A3B32]">{velocity}x</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] shadow-xs">
                <span className="text-[10px] text-stone-600 block font-bold">Faltas Acumuladas:</span>
                <span className="text-base font-black text-[#8C2D19]">{strikes} / 3</span>
              </div>
            </div>

            {/* Unlocked Tools */}
            <div className="p-3 bg-[#EBE7DF] rounded-xl border border-[#D1C9BC] space-y-1 shadow-xs">
              <span className="text-[10px] text-stone-600 uppercase tracking-wider font-bold">
                Herramientas Temporales Dominadas ({unlockedTools.length}/4):
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {unlockedTools.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono font-bold text-stone-950 bg-[#DDD2BE] px-2 py-0.5 rounded border border-[#B8A68E] shadow-xs"
                  >
                    ✓ {t}
                  </span>
                ))}
                {unlockedTools.length === 0 && (
                  <span className="text-stone-500 italic text-[11px]">Ninguna herramienta desbloqueada.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Replay */}
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
