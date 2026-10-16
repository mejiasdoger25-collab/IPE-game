/**
 * src/ui/HUD.tsx
 * HUD Nativo 16-Bit estilo RPG / GBA para Sprint Cero: DevLife RPG.
 * - Esquina Superior Izquierda: Reloj LCD de Jornada + Cartucho de Sprint + Strikes
 * - Esquina Superior Derecha: Barras segmentadas de IE y Cohesión (ICE) + Desplegable 5C
 * - Barra de Acciones Arcade compacta
 */
import React, { useState } from 'react';
import { useGameStore } from '../state/useGameStore';
import { AudioManager } from '../core/AudioManager';

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

  // Reloj de jornada: 540 -> 09:00, 1080 -> 18:00
  const hours = Math.floor(dayTimeMinutes / 60);
  const minutes = dayTimeMinutes % 60;
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const isLateDay = dayTimeMinutes >= 960; // A partir de las 16:00 parpadea en ámbar/rojo

  const ice = Math.round(getICE());
  const velocity = getTeamVelocity();
  const ieClimate = getIEClimate();

  const climateConfig = {
    EMPATHIC_SYNERGY: { label: 'SINERGIA', color: 'text-emerald-400', dot: 'bg-emerald-400' },
    PROFESSIONAL_CLIMATE: { label: 'ESTABLE', color: 'text-sky-400', dot: 'bg-sky-400' },
    HOSTILE_ENVIRONMENT: { label: 'TENSIÓN', color: 'text-rose-400', dot: 'bg-rose-500 animate-ping' },
  }[ieClimate];

  return (
    <div className="absolute inset-x-0 top-0 z-40 p-3 pointer-events-none select-none">
      <div className="max-w-[960px] mx-auto flex flex-wrap items-start justify-between gap-2">
        
        {/* MÓDULO IZQUIERDO: CARTUCHO DE SPRINT, RELOJ LCD & STRIKES */}
        <div className="flex items-stretch gap-2 pointer-events-auto">
          {/* Badge de Sprint */}
          <div className="rpg-box-dark px-3 py-2 flex flex-col justify-center items-center">
            <span className="font-arcade text-[8px] text-amber-400 uppercase tracking-wider">SPRINT</span>
            <span className="font-arcade text-sm text-white mt-1">{currentSprint}/3</span>
          </div>

          {/* Reloj Digital de Jornada */}
          <div className="rpg-box-dark px-3.5 py-2 flex items-center gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span className="font-arcade text-[8px] text-slate-400 uppercase">
                  {isPaused ? 'PAUSA' : 'RELOJ OFICINA'}
                </span>
              </div>
              <div className={`font-arcade text-base mt-1 tracking-widest ${isLateDay ? 'text-rose-400 animate-pulse' : 'text-emerald-300'}`}>
                {timeFormatted}
              </div>
            </div>

            {/* Indicador de Strikes (Faltas) */}
            <div className="border-l-2 border-slate-700 pl-3 flex flex-col items-center justify-center">
              <span className="font-arcade text-[7px] text-slate-400 uppercase mb-1">STRIKES</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-3.5 h-3.5 border border-black flex items-center justify-center font-arcade text-[8px] ${
                      strikes >= num
                        ? 'bg-rose-600 text-white animate-bounce'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    !
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Estado Pomodoro si está activo */}
          {pomodoroActive && (
            <div className="rpg-box-dark px-3 py-2 bg-rose-950 border-rose-400 flex items-center gap-2 animate-pulse">
              <span className="text-base">🍅</span>
              <div>
                <span className="font-arcade text-[8px] text-rose-300 block">HIPERFOCO</span>
                <span className="font-arcade text-xs text-white">{pomodoroMinutesRemaining}M</span>
              </div>
            </div>
          )}
        </div>

        {/* MÓDULO CENTRAL: BARRAS DE ESTADO RPG (IE & COHESIÓN) */}
        <div className="rpg-box-dark px-3.5 py-2 pointer-events-auto flex items-center gap-4">
          {/* Barra de Inteligencia Emocional */}
          <div className="w-32">
            <div className="flex justify-between items-center mb-1">
              <span className="font-arcade text-[8px] text-sky-300">IE (EMPATÍA)</span>
              <span className="font-arcade text-[9px] text-white">{emotionalIntelligence}%</span>
            </div>
            <div className="w-full h-3 bg-slate-950 border-2 border-slate-600 p-0.5 relative">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${emotionalIntelligence}%` }}
              />
              <div className="absolute inset-0 stat-bar-segmented pointer-events-none" />
            </div>
          </div>

          {/* Barra de Cohesión de Equipo (ICE) + Botón 5C */}
          <button
            onClick={() => {
              AudioManager.playKeyClack();
              setExpanded5C(!expanded5C);
            }}
            className="text-left group cursor-pointer flex items-center gap-2.5 border-l-2 border-slate-700 pl-3"
            title="Ver desglose de las 5 C del Trabajo en Equipo"
          >
            <div className="w-28">
              <div className="flex justify-between items-center mb-1">
                <span className="font-arcade text-[8px] text-amber-300 group-hover:underline">5C EQUIPO</span>
                <span className="font-arcade text-[9px] text-emerald-300">{velocity}x</span>
              </div>
              <div className="w-full h-3 bg-slate-950 border-2 border-slate-600 p-0.5 relative">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${ice}%` }}
                />
                <div className="absolute inset-0 stat-bar-segmented pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className={`font-arcade text-[7px] ${climateConfig.color}`}>{climateConfig.label}</span>
              <span className="font-arcade text-[9px] text-slate-300 mt-0.5">{expanded5C ? '▲' : '▼'}</span>
            </div>
          </button>
        </div>

        {/* MÓDULO DERECHO: BOTONERA DE ACCIONES FÍSICAS */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {unlockedTools.length > 0 && (
            <div className="rpg-box-dark px-2 py-1.5 flex items-center gap-1 mr-1" title="Herramientas desbloqueadas">
              {unlockedTools.map((t) => (
                <span key={t} className="text-sm">
                  {t === 'POMODORO' ? '🍅' : t === 'EISENHOWER' ? '📐' : t === 'PARETO' ? '🔍' : '📊'}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              AudioManager.playKeyClack();
              setActiveModal('WORKSTATION');
            }}
            className="rpg-btn px-2.5 py-2 font-arcade text-[9px] cursor-pointer flex items-center gap-1"
          >
            <span>💻</span>
            <span className="hidden sm:inline">MESA</span>
          </button>

          <button
            onClick={() => {
              AudioManager.playKeyClack();
              setActiveModal('SCRUM_BOARD');
            }}
            className="rpg-btn px-2.5 py-2 font-arcade text-[9px] cursor-pointer flex items-center gap-1"
          >
            <span>📋</span>
            <span className="hidden sm:inline">SCRUM</span>
          </button>

          <button
            onClick={() => {
              AudioManager.playKeyClack();
              setActiveModal('SKIN_CUSTOMIZER');
            }}
            className="rpg-btn px-2.5 py-2 font-arcade text-[9px] cursor-pointer flex items-center gap-1"
          >
            <span>👕</span>
            <span className="hidden sm:inline">SKIN</span>
          </button>

          <button
            onClick={() => {
              AudioManager.playKeyClack();
              setActiveModal('SETTINGS');
            }}
            className="rpg-btn px-2.5 py-2 font-arcade text-[9px] cursor-pointer"
            title="Ajustes y Guardado"
          >
            ⚙️
          </button>

          <button
            onClick={() => {
              AudioManager.playKeyClack();
              togglePause();
            }}
            className="rpg-btn px-2.5 py-2 font-arcade text-[9px] cursor-pointer"
            title={isPaused ? 'Reanudar' : 'Pausar'}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
        </div>
      </div>

      {/* PANEL DESPLEGABLE DE LAS 5 C (ESTILO FICHA DE STATS RPG) */}
      {expanded5C && (
        <div className="max-w-xl mx-auto mt-2 rpg-box-dark p-3 pointer-events-auto animate-fade-in">
          <div className="flex justify-between items-center border-b-2 border-slate-700 pb-1.5 mb-2">
            <span className="font-arcade text-[9px] text-amber-300">
              ESTADÍSTICAS DE LAS 5 C DEL TRABAJO EN EQUIPO (MEDIA ICE: {ice}%)
            </span>
            <button
              onClick={() => setExpanded5C(false)}
              className="font-arcade text-[9px] text-slate-400 hover:text-white cursor-pointer"
            >
              [X]
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(fiveCs).map(([k, v]) => (
              <div key={k} className="bg-slate-900 border-2 border-slate-700 p-2 text-center">
                <span className="font-arcade text-[7px] text-slate-400 block uppercase truncate">
                  {k.slice(0, 6)}
                </span>
                <span className="font-arcade text-xs text-white block my-1">{v}%</span>
                <div className="w-full h-1.5 bg-slate-950 border border-slate-700">
                  <div className="h-full bg-emerald-400" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};