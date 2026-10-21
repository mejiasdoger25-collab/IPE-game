/**
 * src/ui/WorkstationModal.tsx
 * Estación de Trabajo Kanban FinTrack 2.0 rediseñada con la estética Retro 16-Bit
 * del juego (rpg-box-dark, rpg-box-cream, rpg-btn, font-arcade y font-dialogue).
 */

import React, { useState } from 'react';
import { useGameStore } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import type { KanbanStatus, CanonicalTimeTool } from '../types/game';
import { ACT_INTERRUPTIONS, STORY_NODES } from '../data/storyNodes';
import { PomodoroTimer } from './tools/PomodoroTimer';
import { EisenhowerMatrix } from './tools/EisenhowerMatrix';
import { ParetoAnalyzer } from './tools/ParetoAnalyzer';
import { GanttChart } from './tools/GanttChart';
import { AudioManager } from '../core/AudioManager';

export const WorkstationModal: React.FC = () => {
  const {
    currentSprint,
    closeModal,
    setActiveModal,
    tasks,
    advanceTask,
    unlockedTools,
    temporalMasteryPoints,
    unlockToolWithPoints,
    triggeredInterruptions,
  } = useGameStore();

  const { setActiveStoryNode, completedStoryNodeIds } = useQuestStore();

  const [activeSubTool, setActiveSubTool] = useState<
    'NONE' | 'POMODORO' | 'EISENHOWER' | 'PARETO' | 'GANTT'
  >('NONE');

  const currentSprintTasks = tasks.filter((t) => t.act === currentSprint);
  const sprintInterruptionIds = ACT_INTERRUPTIONS[currentSprint] || [];

  const handleTriggerSpecificInterruption = (nodeId: string) => {
    AudioManager.playNotificationPing();
    setActiveStoryNode(nodeId);
    setActiveModal('DIALOGUE');
  };

  const handleToolClick = (tool: CanonicalTimeTool, displayName: string) => {
    AudioManager.playKeyClack();
    if (unlockedTools.includes(tool)) {
      setActiveSubTool(tool);
    } else if (temporalMasteryPoints >= 50) {
      const confirmUnlock = window.confirm(
        `🔒 ${displayName} está bloqueada.\n¿Deseas desbloquearla ahora usando 50 Puntos de Maestría Temporal? (Tienes: ${temporalMasteryPoints} pts)`
      );
      if (confirmUnlock) {
        const success = unlockToolWithPoints(tool, 50);
        if (success) {
          AudioManager.playNotificationPing();
          setActiveSubTool(tool);
        }
      }
    } else {
      alert(
        `🔒 ${displayName} está bloqueada.\nDesbloquéala tomando buenas decisiones en los diálogos o reuniendo 50 Puntos de Maestría Temporal (actual: ${temporalMasteryPoints} pts).`
      );
    }
  };

  const handleAdvanceTask = (taskId: string) => {
    AudioManager.playKeyClack();
    advanceTask(taskId);
  };

  const columns: Array<{ id: KanbanStatus; label: string; headerColor: string }> = [
    { id: 'TODO', label: '1. POR HACER (TO-DO)', headerColor: 'text-slate-300 border-slate-600' },
    { id: 'IN_PROGRESS', label: '2. EN PROGRESO (WIP)', headerColor: 'text-sky-300 border-sky-500' },
    { id: 'CODE_REVIEW', label: '3. CODE REVIEW (PR)', headerColor: 'text-amber-300 border-amber-500' },
    { id: 'DONE', label: '4. COMPLETADO (DONE)', headerColor: 'text-emerald-300 border-emerald-500' },
  ];

  const toolButtons: Array<{ id: CanonicalTimeTool; label: string; icon: string }> = [
    { id: 'POMODORO', label: 'POMODORO', icon: '🍅' },
    { id: 'EISENHOWER', label: 'EISENHOWER', icon: '🧭' },
    { id: 'PARETO', label: 'PARETO 80/20', icon: '🎯' },
    { id: 'GANTT', label: 'GANTT', icon: '📊' },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-3 md:p-5 select-none overflow-y-auto">
      {activeSubTool === 'POMODORO' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80">
          <PomodoroTimer onClose={() => setActiveSubTool('NONE')} />
        </div>
      )}
      {activeSubTool === 'EISENHOWER' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80">
          <EisenhowerMatrix onClose={() => setActiveSubTool('NONE')} />
        </div>
      )}
      {activeSubTool === 'PARETO' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80">
          <ParetoAnalyzer onClose={() => setActiveSubTool('NONE')} />
        </div>
      )}
      {activeSubTool === 'GANTT' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80">
          <GanttChart onClose={() => setActiveSubTool('NONE')} />
        </div>
      )}

      {/* Contenedor Principal del Kanban en estética Pixel-Art RPG */}
      <div className="rpg-box-dark bg-[#111625] p-4 md:p-5 max-w-6xl w-full space-y-3 flex flex-col max-h-full overflow-hidden">
        {/* Cabecera del Kanban */}
        <div className="flex flex-wrap justify-between items-center border-b-2 border-slate-700 pb-3 gap-2">
          <div>
            <span className="font-arcade text-[8px] text-amber-400 uppercase block">
              NOVASOFT WORKSTATION OS · SPRINT {currentSprint}
            </span>
            <h2 className="font-arcade text-xs md:text-sm text-white mt-1">
              💻 TABLERO KANBAN · FINTRACK 2.0
            </h2>
          </div>

          {/* Barra de Herramientas Desbloqueables */}
          <div className="flex flex-wrap items-center gap-1.5">
            {toolButtons.map((tb) => {
              const isUnlocked = unlockedTools.includes(tb.id);
              return (
                <button
                  key={tb.id}
                  onClick={() => handleToolClick(tb.id, tb.label)}
                  className={`rpg-btn px-2.5 py-1.5 font-arcade text-[8px] cursor-pointer flex items-center gap-1 ${
                    isUnlocked ? 'bg-amber-300 text-stone-950' : 'opacity-75'
                  }`}
                >
                  <span>{isUnlocked ? tb.icon : '🔒'}</span>
                  <span>{tb.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                AudioManager.playKeyClack();
                closeModal();
              }}
              className="rpg-btn px-3 py-1.5 font-arcade text-[9px] bg-rose-600 text-white cursor-pointer ml-1"
            >
              [X] CERRAR
            </button>
          </div>
        </div>

        {/* Barra de las 5 Interrupciones del Sprint */}
        <div className="rpg-box-cream px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-arcade text-[8px] text-stone-900">
            ⚡ EVENTOS E INTERRUPCIONES DEL SPRINT {currentSprint}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sprintInterruptionIds.map((nodeId, idx) => {
              const node = STORY_NODES[nodeId];
              const isDone =
                triggeredInterruptions.includes(nodeId) || completedStoryNodeIds.includes(nodeId);
              return (
                <button
                  key={nodeId}
                  onClick={() => handleTriggerSpecificInterruption(nodeId)}
                  className={`px-2.5 py-1 border-2 font-arcade text-[7px] cursor-pointer transition-all ${
                    isDone
                      ? 'bg-[#2b2118] text-emerald-300 border-black'
                      : 'bg-[#e5dcc5] hover:bg-amber-300 text-stone-900 border-[#2b2118]'
                  }`}
                >
                  {isDone ? '✓ ' : `${idx + 1}. `}
                  {node?.speaker.split(' ')[0] || `EVENTO ${idx + 1}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rejilla de 4 Columnas Estilo Retro */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1 overflow-y-auto pr-1">
          {columns.map((col) => {
            const colTasks = currentSprintTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-[#181e31] border-2 border-slate-700 p-2.5 flex flex-col space-y-2.5"
              >
                <div className={`flex justify-between items-center border-b-2 pb-1.5 ${col.headerColor}`}>
                  <span className="font-arcade text-[8px]">{col.label}</span>
                  <span className="font-arcade text-[8px] bg-slate-900 px-1.5 py-0.5 text-white border border-slate-600">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="rpg-box-cream p-3 space-y-2"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-arcade text-[8px] text-stone-950 leading-snug">
                          {t.title}
                        </span>
                        {t.urgency === 'CRITICAL' && (
                          <span className="font-arcade text-[6px] bg-rose-600 text-white px-1.5 py-0.5 border border-black shrink-0">
                            CRÍTICO
                          </span>
                        )}
                      </div>

                      <p className="font-dialogue text-lg text-stone-800 leading-tight">
                        {t.description}
                      </p>

                      {t.assignedNpc && (
                        <div className="font-arcade text-[7px] text-stone-600">
                          RESP: {t.assignedNpc.toUpperCase()}
                        </div>
                      )}

                      {t.status === 'IN_PROGRESS' && (
                        <div className="space-y-1">
                          <div className="flex justify-between font-arcade text-[7px] text-stone-800">
                            <span>PROGRESO:</span>
                            <span>{t.progressPercent}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-stone-900 border border-black p-0.5 relative">
                            <div
                              className="h-full bg-emerald-400 transition-all duration-300"
                              style={{ width: `${t.progressPercent}%` }}
                            />
                            <div className="absolute inset-0 stat-bar-segmented pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {t.status !== 'DONE' ? (
                        <button
                          type="button"
                          onClick={() => handleAdvanceTask(t.id)}
                          className={`rpg-btn w-full py-1.5 font-arcade text-[8px] cursor-pointer ${
                            t.status === 'TODO'
                              ? 'bg-[#e5dcc5] text-stone-950'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-emerald-400 text-stone-950'
                              : 'bg-amber-300 text-stone-950'
                          }`}
                        >
                          {t.status === 'TODO'
                            ? '▶ EMPEZAR TAREA'
                            : t.status === 'IN_PROGRESS'
                            ? '⌨️ PROGRAMAR (+WIP)'
                            : '🔍 SUBIR PULL REQUEST'}
                        </button>
                      ) : (
                        <div className="bg-[#2b2118] text-emerald-300 font-arcade text-[7px] px-2 py-1 text-center border border-black">
                          ✓ FUSIONADO EN MAIN
                        </div>
                      )}
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-center py-6 font-dialogue text-lg text-slate-500">
                      Sin tickets en esta columna
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};