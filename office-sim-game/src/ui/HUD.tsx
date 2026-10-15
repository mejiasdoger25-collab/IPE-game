/**
 * src/ui/HUD.tsx
 * Redesigned Top HUD Overlay for DevLife RPG:
 * - Crisp black / deep charcoal 'Inter' typography (#111827 / text-stone-950)
 * - Warm light browns, sand, taupe, and soft stone grays aesthetic
 * - Workday clock (09:00 to 18:00) with visual time progress
 * - Emotional Intelligence (IE) gauge with active climate tier badge
 * - Expandable 5 Cs breakdown ($C_1 \dots C_5$) and Global Cohesion Index ($ICE$)
 * - Procrastination Strikes indicator (0 to 3)
 * - Pomodoro status and quick-launch tools bar (Mesa, Scrum, Skin, Ajustes, Pausa)
 */

import React, { useState } from 'react';
import { useGameStore } from '../state/useGameStore';

export const HUD: React.FC = () => {
  const {
    currentSprint,
    dayTimeMinutes,
    emotionalIntelligence,
    fiveCs,
    strikes,
    unlockedTools,
    pomodoroActive,
    pomodoroMinutesRemaining,
    isPaused,
    togglePause,
    setActiveModal,
    getICE,
    getTeamVelocity,
    getIEClimate,
  } = useGameStore();

  const [expanded5C, setExpanded5C] = useState<boolean>(false);

  // Format workday clock: 540 -> 09:00, 1080 -> 18:00
  const hours = Math.floor(dayTimeMinutes / 60);
  const minutes = dayTimeMinutes % 60;
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const dayProgressPercent = Math.min(Math.max(((dayTimeMinutes - 540) / (1080 - 540)) * 100, 0), 100);

  const ice = getICE();
  const velocity = getTeamVelocity();
  const ieClimate = getIEClimate();

  return (
    <div className="absolute top-0 inset-x-0 z-40 p-3 pointer-events-none font-sans">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 bg-[#F4F1EA]/95 backdrop-blur-md border border-[#D6CFC2] rounded-2xl p-3 shadow-md pointer-events-auto text-stone-950">
        {/* Left: Sprint & Workday Clock */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#DDD2BE] border border-[#B8A68E] px-3 py-1.5 rounded-xl text-center shadow-xs">
            <span className="text-[10px] uppercase font-mono text-stone-700 block font-bold leading-none">
              Sprint
            </span>
            <span className="text-base font-extrabold text-stone-950">{currentSprint} / 3</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono font-bold tracking-wider text-stone-950">
                🕒 {timeFormatted}
              </span>
              <span className="text-[10px] text-stone-600 font-medium">Jornada 09:00-18:00</span>
              {pomodoroActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E87A5D]/20 text-[#9C3820] border border-[#E87A5D]/50 animate-pulse">
                  🍅 Pomodoro: {pomodoroMinutesRemaining}m (+30% vel)
                </span>
              )}
            </div>
            {/* Workday Progress bar */}
            <div className="w-36 h-1.5 bg-stone-300 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  dayProgressPercent > 80 ? 'bg-[#C25E4A]' : 'bg-[#6F5643]'
                }`}
                style={{ width: `${dayProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Emotional Intelligence & 5 Cs Summary */}
        <div className="flex items-center space-x-4">
          {/* IE Gauge */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-stone-950">
              <span className="text-stone-800">Inteligencia Emocional (IE):</span>
              <span className="font-mono text-stone-950 ml-1.5 font-bold">{emotionalIntelligence}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-28 h-2 bg-stone-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C25E4A] via-[#B88746] to-[#4C7C59] transition-all duration-300"
                  style={{ width: `${emotionalIntelligence}%` }}
                />
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shadow-xs ${
                  ieClimate === 'EMPATHIC_SYNERGY'
                    ? 'bg-[#E2EBD8] text-[#2F5233] border border-[#B3C99C]'
                    : ieClimate === 'PROFESSIONAL_CLIMATE'
                    ? 'bg-[#E3E8EC] text-[#2C4A6F] border border-[#BAC7D5]'
                    : 'bg-[#FBE5E1] text-[#8C2D19] border border-[#EBB3A9]'
                }`}
              >
                {ieClimate === 'EMPATHIC_SYNERGY' ? 'Sinergia' : ieClimate === 'PROFESSIONAL_CLIMATE' ? 'Profesional' : 'Hostil'}
              </span>
            </div>
          </div>

          {/* 5 Cs & ICE Button */}
          <button
            onClick={() => setExpanded5C(!expanded5C)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#E6DEC8] hover:bg-[#D8CCB0] active:bg-[#CBBBA0] border border-[#C2B299] text-xs transition-all shadow-xs cursor-pointer"
          >
            <div>
              <span className="text-[10px] text-stone-700 block text-left font-medium">Cohesión (ICE)</span>
              <span className="font-mono font-bold text-stone-950">{ice} / 100</span>
            </div>
            <span className="text-[10px] text-[#4A3B32] font-mono font-bold bg-[#D4C6AA] px-1.5 py-0.5 rounded border border-[#B5A585]">
              {velocity}x Vel
            </span>
            <span className="text-stone-700 text-xs font-bold">{expanded5C ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Right: Strikes Indicator & Quick Launch Tools */}
        <div className="flex items-center space-x-3">
          {/* Strikes (0 to 3) */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] shadow-xs">
            <span className="text-[10px] text-stone-700 font-bold mr-1">FALTAS:</span>
            {[1, 2, 3].map((num) => (
              <span
                key={num}
                className={`text-sm font-black ${
                  strikes >= num
                    ? 'text-[#C2410C] animate-pulse drop-shadow-xs'
                    : 'text-stone-300'
                }`}
              >
                ✕
              </span>
            ))}
          </div>

          {/* Quick Tool Launchers */}
          <div className="flex items-center space-x-1.5">
            {unlockedTools.map((t) => (
              <span
                key={t}
                title={`Herramienta Desbloqueada: ${t}`}
                className="text-[10px] font-mono font-bold text-stone-950 bg-[#E6DEC8] px-1.5 py-0.5 rounded border border-[#C2B299] shadow-xs"
              >
                {t === 'POMODORO' ? '🍅' : t === 'EISENHOWER' ? '📊' : t === 'PARETO' ? '⚖️' : '📅'}
              </span>
            ))}
            <button
              onClick={() => setActiveModal('WORKSTATION')}
              title="Abrir Estación de Trabajo / Kanban"
              className="px-2.5 py-1.5 rounded-xl bg-[#E6DEC8] hover:bg-[#D8CCB0] active:bg-[#CBBBA0] text-stone-950 border border-[#C2B299] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              💻 Mesa
            </button>
            <button
              onClick={() => setActiveModal('SCRUM_BOARD')}
              title="Abrir Pizarra Scrum / Retrospectiva"
              className="px-2.5 py-1.5 rounded-xl bg-[#E6DEC8] hover:bg-[#D8CCB0] active:bg-[#CBBBA0] text-stone-950 border border-[#C2B299] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              📋 Scrum
            </button>
            <button
              onClick={() => setActiveModal('SKIN_CUSTOMIZER')}
              title="Personalizar Skin o Cambiar Mapa"
              className="px-2.5 py-1.5 rounded-xl bg-[#E6DEC8] hover:bg-[#D8CCB0] active:bg-[#CBBBA0] text-stone-950 border border-[#C2B299] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              🎨 Skin
            </button>
            <button
              onClick={() => setActiveModal('SETTINGS')}
              title="Ajustes de Sonido y Guardado"
              className="px-2.5 py-1.5 rounded-xl bg-[#E5E5E0] hover:bg-[#D6D6CF] active:bg-[#C8C8BE] text-stone-950 border border-stone-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              ⚙️
            </button>
            <button
              onClick={() => togglePause()}
              title={isPaused ? 'Reanudar' : 'Pausar'}
              className="px-2.5 py-1.5 rounded-xl bg-[#E5E5E0] hover:bg-[#D6D6CF] active:bg-[#C8C8BE] text-stone-950 border border-stone-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {isPaused ? '▶' : '⏸'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded 5 Cs Drawer Panel */}
      {expanded5C && (
        <div className="max-w-xl mx-auto mt-2 p-3 bg-[#F4F1EA]/95 backdrop-blur-md border border-[#D6CFC2] rounded-xl shadow-lg pointer-events-auto text-xs grid grid-cols-5 gap-2 text-stone-950">
          {Object.entries(fiveCs).map(([k, v]) => (
            <div key={k} className="p-2 rounded-lg bg-[#EBE7DF] border border-[#D1C9BC] text-center space-y-1">
              <span className="text-[10px] text-stone-700 block uppercase font-mono font-bold truncate">
                {k.slice(0, 4)}
              </span>
              <span className="font-mono font-bold text-stone-950">{v}%</span>
              <div className="w-full h-1 bg-stone-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6F5643] transition-all duration-300"
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
