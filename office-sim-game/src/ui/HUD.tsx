/**
 * src/ui/HUD.tsx
 * Barra Superior de Estadísticas en Tiempo Real con estética 16-Bit (rpg-box-dark / rpg-box-cream).
 * Al estar integrada en la cabecera del layout (no flotando sobre el centro),
 * jamás tapa los sprites ni los retratos de diálogo.
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import { ACT_INTERRUPTIONS } from '../data/storyNodes';
import { AudioManager } from '../core/AudioManager';
import type { FiveCKey, NPCKey } from '../types/game';

export const HUD: React.FC = () => {
  const {
    currentSprint,
    dayTimeMinutes,
    emotionalIntelligence,
    fiveCs,
    affinities,
    teamStress,
    timeManagement,
    recentStatChanges,
    triggeredInterruptions,
    strikes,
    unlockedTools,
    pomodoroActive,
    pomodoroMinutesRemaining,
    isPaused,
    togglePause,
    activeModal,
    setActiveModal,
    triggerNextSprintInterruption,
    getICE,
    getTeamVelocity,
    getIEClimate,
  } = useGameStore();

  const { setActiveStoryNode, completedStoryNodeIds } = useQuestStore();
  const [showDetailedRow, setShowDetailedRow] = useState<boolean>(true);
  const [nowTick, setNowTick] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 450);
    return () => clearInterval(interval);
  }, []);

  if (activeModal === 'ENDING') return null;

  const hours = Math.floor(dayTimeMinutes / 60);
  const minutes = dayTimeMinutes % 60;
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const isLateDay = dayTimeMinutes >= 960;

  const ice = Math.round(getICE());
  const velocity = getTeamVelocity();
  const ieClimate = getIEClimate();

  const sprintInterruptions = ACT_INTERRUPTIONS[currentSprint] || [];
  const completedInterruptions = sprintInterruptions.filter(
    (id) => triggeredInterruptions.includes(id) || completedStoryNodeIds.includes(id)
  ).length;

  const climateConfig = {
    EMPATHIC_SYNERGY: { label: 'SINERGIA', color: 'text-emerald-400' },
    PROFESSIONAL_CLIMATE: { label: 'ESTABLE', color: 'text-sky-400' },
    HOSTILE_ENVIRONMENT: { label: 'TENSIÓN', color: 'text-rose-400' },
  }[ieClimate];

  const getRecentChangeFor = (statKey: string) =>
    recentStatChanges.find((c) => c.statKey === statKey && nowTick - c.timestamp < 4500);

  const activeFloatingToasts = recentStatChanges.filter((c) => nowTick - c.timestamp < 3800);

  const fiveCConfig: Array<{ key: FiveCKey; short: string; barColor: string }> = [
    { key: 'compromiso', short: 'COMPROM.', barColor: 'bg-emerald-400' },
    { key: 'confianza', short: 'CONFIANZA', barColor: 'bg-sky-400' },
    { key: 'coordinacion', short: 'COORDIN.', barColor: 'bg-amber-400' },
    { key: 'comunicacion', short: 'COMUNIC.', barColor: 'bg-purple-400' },
    { key: 'complementariedad', short: 'COMPLEM.', barColor: 'bg-pink-400' },
  ];

  const npcAffinityConfig: Array<{ key: NPCKey; name: string; role: string; barColor: string }> = [
    { key: 'elena', name: 'ELENA', role: 'Agile', barColor: 'bg-pink-400' },
    { key: 'david', name: 'DAVID', role: 'PO', barColor: 'bg-amber-400' },
    { key: 'marcos', name: 'MARCOS', role: 'Backend', barColor: 'bg-rose-400' },
    { key: 'sofia', name: 'SOFÍA', role: 'UX/UI', barColor: 'bg-purple-400' },
    { key: 'lucas', name: 'LUCAS', role: 'Junior', barColor: 'bg-teal-400' },
  ];

  const handleOpenDaily = () => {
    AudioManager.playNotificationPing();
    const dailyNodeMap: Record<number, string> = {
      1: 'act1_daily',
      2: 'act2_daily',
      3: 'act3_daily',
    };
    setActiveStoryNode(dailyNodeMap[currentSprint] || 'act1_daily');
    setActiveModal('DIALOGUE');
  };

  const ieRecent = getRecentChangeFor('ie');
  const timeRecent = getRecentChangeFor('time_mgmt');
  const stressRecent = getRecentChangeFor('stress');

  return (
    <header className="relative z-50 w-full bg-[#0b0e17] border-b-3 border-[#313244] px-2.5 py-2 select-none shrink-0">
      <div className="max-w-[1240px] mx-auto space-y-1.5">
        {/* FILA SUPERIOR COMPACTA: RELOJ + MÉTRICAS GLOBALES + BOTONES */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Izquierda: Sprint, Reloj, Eventos, Strikes */}
          <div className="flex items-stretch gap-1.5">
            <div className="rpg-box-dark px-2.5 py-1 flex flex-col justify-center items-center bg-[#181e31]">
              <span className="font-arcade text-[7px] text-amber-400">SPRINT</span>
              <span className="font-arcade text-xs text-white">{currentSprint}/3</span>
            </div>

            <div className="rpg-box-dark px-2.5 py-1 flex items-center gap-2.5 bg-[#181e31]">
              <div>
                <div className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 ${
                      isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  <span className="font-arcade text-[6px] text-slate-400">
                    {isPaused ? 'PAUSA' : 'RELOJ'}
                  </span>
                </div>
                <div
                  className={`font-arcade text-xs mt-0.5 ${
                    isLateDay ? 'text-rose-400 animate-pulse' : 'text-emerald-300'
                  }`}
                >
                  {timeFormatted}
                </div>
              </div>

              <div className="border-l-2 border-slate-700 pl-2 flex flex-col items-center">
                <span className="font-arcade text-[6px] text-sky-300">EVENTOS</span>
                <span className="font-arcade text-[9px] text-white mt-0.5">
                  {completedInterruptions}/5
                </span>
              </div>

              <div className="border-l-2 border-slate-700 pl-2 flex flex-col items-center">
                <span className="font-arcade text-[6px] text-slate-400 mb-0.5">STRIKES</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className={`w-3 h-3 border border-black flex items-center justify-center font-arcade text-[7px] ${
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

            {pomodoroActive && (
              <div className="rpg-box-dark px-2 py-1 bg-rose-950 border-rose-400 flex items-center">
                <span className="font-arcade text-[8px] text-rose-200 animate-pulse">
                  🍅 {pomodoroMinutesRemaining}M
                </span>
              </div>
            )}
          </div>

          {/* Centro: IE, Gestión del Tiempo, Estrés y Sinergia ICE */}
          <div className="rpg-box-dark px-3 py-1 bg-[#181e31] flex flex-wrap items-center gap-3">
            {/* IE */}
            <div className="w-24">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-arcade text-[6px] text-sky-300">EMPATÍA (IE)</span>
                <span className="font-arcade text-[8px] text-white">
                  {emotionalIntelligence}%
                  {ieRecent && (
                    <span className={ieRecent.isBeneficial ? 'text-emerald-300 ml-0.5' : 'text-rose-400 ml-0.5'}>
                      {ieRecent.delta > 0 ? `+${ieRecent.delta}` : ieRecent.delta}
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 border border-slate-600 p-0.5 relative">
                <div
                  className="h-full bg-sky-400 transition-all duration-300"
                  style={{ width: `${emotionalIntelligence}%` }}
                />
                <div className="absolute inset-0 stat-bar-segmented pointer-events-none" />
              </div>
            </div>

            {/* Tiempo */}
            <div className="w-24 border-l border-slate-700 pl-2">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-arcade text-[6px] text-amber-300">TIEMPO</span>
                <span className="font-arcade text-[8px] text-white">
                  {timeManagement}%
                  {timeRecent && (
                    <span className={timeRecent.isBeneficial ? 'text-emerald-300 ml-0.5' : 'text-rose-400 ml-0.5'}>
                      {timeRecent.delta > 0 ? `+${timeRecent.delta}` : timeRecent.delta}
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 border border-slate-600 p-0.5 relative">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${timeManagement}%` }}
                />
                <div className="absolute inset-0 stat-bar-segmented pointer-events-none" />
              </div>
            </div>

            {/* Estrés */}
            <div className="w-24 border-l border-slate-700 pl-2">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-arcade text-[6px] text-rose-300">ESTRÉS</span>
                <span className="font-arcade text-[8px] text-white">
                  {teamStress}%
                  {stressRecent && (
                    <span className={stressRecent.isBeneficial ? 'text-emerald-300 ml-0.5' : 'text-rose-400 ml-0.5'}>
                      {stressRecent.delta > 0 ? `+${stressRecent.delta}` : stressRecent.delta}
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 border border-slate-600 p-0.5 relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    teamStress >= 70 ? 'bg-rose-500' : teamStress >= 45 ? 'bg-amber-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${teamStress}%` }}
                />
                <div className="absolute inset-0 stat-bar-segmented pointer-events-none" />
              </div>
            </div>

            {/* Botón Plegar/Desplegar Monitor 5C + Afinidades */}
            <button
              onClick={() => {
                AudioManager.playKeyClack();
                setShowDetailedRow(!showDetailedRow);
              }}
              className="border-l border-slate-700 pl-2 text-left cursor-pointer"
              title="Mostrar u ocultar fila de Las 5 C y Afinidades"
            >
              <span className={`font-arcade text-[6px] block ${climateConfig.color}`}>
                {climateConfig.label} ({velocity}x)
              </span>
              <span className="font-arcade text-[8px] text-amber-300">
                STATS {ice}% {showDetailedRow ? '▲' : '▼'}
              </span>
            </button>
          </div>

          {/* Derecha: Botonera Arcade */}
          <div className="flex items-center gap-1">
            {unlockedTools.length > 0 && (
              <div className="rpg-box-dark px-1.5 py-1 flex items-center gap-1 bg-[#181e31]">
                {unlockedTools.map((t) => (
                  <span key={t} className="text-xs">
                    {t === 'POMODORO' ? '🍅' : t === 'EISENHOWER' ? '🧭' : t === 'PARETO' ? '🎯' : '📊'}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={handleOpenDaily}
              className="rpg-btn px-2 py-1 font-arcade text-[8px] cursor-pointer"
            >
              🗣️ DAILY
            </button>

            {completedInterruptions < 5 && (
              <button
                onClick={() => {
                  AudioManager.playNotificationPing();
                  triggerNextSprintInterruption();
                }}
                className="rpg-btn px-2 py-1 font-arcade text-[8px] bg-amber-300 text-stone-950 cursor-pointer"
              >
                ⚡ EVENTO ({completedInterruptions}/5)
              </button>
            )}

            <button
              onClick={() => {
                AudioManager.playKeyClack();
                setActiveModal(activeModal === 'WORKSTATION' ? 'NONE' : 'WORKSTATION');
              }}
              className="rpg-btn px-2 py-1 font-arcade text-[8px] cursor-pointer"
            >
              💻 KANBAN
            </button>

            <button
              onClick={() => {
                AudioManager.playKeyClack();
                setActiveModal(activeModal === 'SCRUM_BOARD' ? 'NONE' : 'SCRUM_BOARD');
              }}
              className="rpg-btn px-2 py-1 font-arcade text-[8px] cursor-pointer"
            >
              📋 RETRO
            </button>

            <button
              onClick={() => {
                AudioManager.playKeyClack();
                setActiveModal(activeModal === 'SKIN_CUSTOMIZER' ? 'NONE' : 'SKIN_CUSTOMIZER');
              }}
              className="rpg-btn px-2 py-1 font-arcade text-[8px] cursor-pointer"
              title="Skins"
            >
              👕
            </button>

            <button
              onClick={() => {
                AudioManager.playKeyClack();
                setActiveModal(activeModal === 'SETTINGS' ? 'NONE' : 'SETTINGS');
              }}
              className="rpg-btn px-2 py-1 font-arcade text-[8px] cursor-pointer"
              title="Ajustes"
            >
              ⚙️
            </button>

            <button
              onClick={() => {
                AudioManager.playKeyClack();
                togglePause();
              }}
              className="rpg-btn px-2 py-1 font-arcade text-[8px] cursor-pointer"
            >
              {isPaused ? '▶' : '⏸'}
            </button>
          </div>
        </div>

        {/* FILA 2: MONITOR RETRO 16-BIT DE LAS 5 C Y AFINIDADES DE LOS 5 PERSONAJES */}
        {showDetailedRow && (
          <div className="rpg-box-dark px-2.5 py-1.5 bg-[#111625] grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* 5 C del Trabajo en Equipo */}
            <div className="grid grid-cols-5 gap-1.5">
              {fiveCConfig.map(({ key, short, barColor }) => {
                const val = fiveCs[key];
                const change = getRecentChangeFor(`5c_${key}`);
                return (
                  <div
                    key={key}
                    className={`bg-[#181e31] border-2 px-1.5 py-1 transition-all ${
                      change
                        ? change.isBeneficial
                          ? 'border-emerald-400 bg-emerald-950/60'
                          : 'border-rose-500 bg-rose-950/60'
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-arcade text-[6px] text-amber-300 truncate">{short}</span>
                      <span className="font-arcade text-[8px] text-white">{val}%</span>
                    </div>
                    {change && (
                      <div
                        className={`font-arcade text-[6px] ${
                          change.isBeneficial ? 'text-emerald-300' : 'text-rose-400'
                        }`}
                      >
                        {change.delta > 0 ? `▲+${change.delta}` : `▼${change.delta}`}
                      </div>
                    )}
                    <div className="w-full h-1.5 bg-slate-950 border border-slate-700 mt-0.5 relative">
                      <div
                        className={`h-full ${barColor} transition-all duration-500`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Afinidades de los 5 Compañeros */}
            <div className="grid grid-cols-5 gap-1.5 lg:border-l-2 lg:border-slate-800 lg:pl-2">
              {npcAffinityConfig.map(({ key, name, role, barColor }) => {
                const val = affinities[key];
                const change = getRecentChangeFor(`aff_${key}`);
                return (
                  <div
                    key={key}
                    className={`bg-[#181e31] border-2 px-1.5 py-1 transition-all ${
                      change
                        ? change.isBeneficial
                          ? 'border-emerald-400 bg-emerald-950/60'
                          : 'border-rose-500 bg-rose-950/60'
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-arcade text-[6px] text-sky-300 truncate">{name}</span>
                      <span className="font-arcade text-[8px] text-white">{val}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-dialogue text-xs text-slate-400 leading-none">{role}</span>
                      {change && (
                        <span
                          className={`font-arcade text-[6px] ${
                            change.isBeneficial ? 'text-emerald-300' : 'text-rose-400'
                          }`}
                        >
                          {change.delta > 0 ? `+${change.delta}` : change.delta}
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 border border-slate-700 mt-0.5 relative">
                      <div
                        className={`h-full ${barColor} transition-all duration-500`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TOASTS FLOTANTES EN ESQUINA INFERIOR DERECHA DEL HUD */}
        {activeFloatingToasts.length > 0 && (
          <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-1.5 pointer-events-none">
            {activeFloatingToasts.slice(0, 5).map((toast) => (
              <div
                key={toast.id}
                className={`rpg-box-dark px-3 py-1.5 font-arcade text-[8px] flex items-center gap-2 ${
                  toast.isBeneficial
                    ? 'border-emerald-400 text-emerald-300 bg-[#0f291e]'
                    : 'border-rose-500 text-rose-300 bg-[#2d1219]'
                }`}
              >
                <span>{toast.isBeneficial ? '▲' : '▼'}</span>
                <span>{toast.label}:</span>
                <span className="text-white">
                  {toast.delta > 0 ? `+${toast.delta}` : toast.delta} ({toast.newValue}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};