/**
 * src/ui/WorkstationModal.tsx
 * Interactive Workstation & Kanban Ticket execution view for DevLife RPG.
 * Implements:
 * - 4-column Kanban lifecycle: To-Do -> In Progress -> Code Review -> Done
 * - Persistent store state (useGameStore.tasks) preserved across modal toggles
 * - Progressive tool gating: POMODORO, EISENHOWER, PARETO, GANTT locked until unlocked via narrative or 50 Temporal Mastery Points
 * - Harmonized warm light brown, stone cream, and taupe editorial aesthetic with Inter black typography
 * - Key clack audio feedback on programming & state advancement
 */

import React, { useState } from 'react';
import { useGameStore } from '../state/useGameStore';
import type { KanbanStatus, CanonicalTimeTool } from '../types/game';
import { PomodoroTimer } from './tools/PomodoroTimer';
import { EisenhowerMatrix } from './tools/EisenhowerMatrix';
import { ParetoAnalyzer } from './tools/ParetoAnalyzer';
import { GanttChart } from './tools/GanttChart';
import { AudioManager } from '../core/AudioManager';

export const WorkstationModal: React.FC = () => {
  const {
    currentSprint,
    closeModal,
    tasks,
    advanceTask,
    unlockedTools,
    temporalMasteryPoints,
    unlockToolWithPoints,
  } = useGameStore();

  const [activeSubTool, setActiveSubTool] = useState<
    'NONE' | 'POMODORO' | 'EISENHOWER' | 'PARETO' | 'GANTT'
  >('NONE');

  const currentSprintTasks = tasks.filter((t) => t.act === currentSprint);

  const handleToolClick = (tool: CanonicalTimeTool, displayName: string) => {
    AudioManager.playKeyClack();
    if (unlockedTools.includes(tool)) {
      setActiveSubTool(tool);
    } else {
      // Allow unlocking with temporalMasteryPoints (50 pts)
      if (temporalMasteryPoints >= 50) {
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
          `🔒 ${displayName} está bloqueada.\nRequiere desbloquearse en la historia (ej. ayudando a compañeros o en la Daily) o con 50 Puntos de Maestría Temporal (actual: ${temporalMasteryPoints} pts).`
        );
      }
    }
  };

  const handleAdvanceTask = (taskId: string) => {
    AudioManager.playKeyClack();
    advanceTask(taskId);
  };

  const columns: Array<{ id: KanbanStatus; label: string; color: string; badgeColor: string }> = [
    { id: 'TODO', label: 'Por Hacer (To-Do)', color: 'text-stone-700', badgeColor: 'bg-stone-200 text-stone-800' },
    { id: 'IN_PROGRESS', label: 'En Progreso (Coding)', color: 'text-[#2C4A6F]', badgeColor: 'bg-[#E3E8EC] text-[#2C4A6F]' },
    { id: 'CODE_REVIEW', label: 'Code Review (PR)', color: 'text-[#8C5E19]', badgeColor: 'bg-[#F5EED8] text-[#8C5E19]' },
    { id: 'DONE', label: 'Completado (Done)', color: 'text-[#2F5233]', badgeColor: 'bg-[#E2EBD8] text-[#2F5233]' },
  ];

  const toolButtons: Array<{ id: CanonicalTimeTool; label: string; icon: string }> = [
    { id: 'POMODORO', label: 'Pomodoro', icon: '🍅' },
    { id: 'EISENHOWER', label: 'Eisenhower 2x2', icon: '📊' },
    { id: 'PARETO', label: 'Pareto 80/20', icon: '⚖️' },
    { id: 'GANTT', label: 'Gantt', icon: '📅' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 font-sans select-none">
      {/* Sub-tool overlay modals */}
      {activeSubTool === 'POMODORO' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70">
          <PomodoroTimer onClose={() => setActiveSubTool('NONE')} />
        </div>
      )}
      {activeSubTool === 'EISENHOWER' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70">
          <EisenhowerMatrix onClose={() => setActiveSubTool('NONE')} />
        </div>
      )}
      {activeSubTool === 'PARETO' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70">
          <ParetoAnalyzer onClose={() => setActiveSubTool('NONE')} />
        </div>
      )}
      {activeSubTool === 'GANTT' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70">
          <GanttChart onClose={() => setActiveSubTool('NONE')} />
        </div>
      )}

      {/* Main Workstation Container */}
      <div className="bg-[#F4F1EA] border border-[#D6CFC2] rounded-3xl p-6 max-w-5xl w-full text-stone-950 shadow-2xl space-y-5 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center border-b border-[#D6CFC2] pb-3 gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-stone-950 flex items-center space-x-2">
              <span>💻 Estación de Trabajo — Tablero Kanban FinTrack 2.0 (Sprint {currentSprint})</span>
            </h2>
            <p className="text-xs text-stone-600">
              Desarrolla tickets, sube Pull Requests y utiliza herramientas de gestión temporal.
            </p>
          </div>

          {/* Productivity Tools Launch Bar with Progressive Gating */}
          <div className="flex items-center space-x-2">
            {toolButtons.map((tb) => {
              const isUnlocked = unlockedTools.includes(tb.id);
              return (
                <button
                  key={tb.id}
                  onClick={() => handleToolClick(tb.id, tb.label)}
                  title={
                    isUnlocked
                      ? `Abrir ${tb.label}`
                      : `Bloqueado. Desbloquear con 50 pts de Maestría Temporal (Tienes: ${temporalMasteryPoints} pts)`
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1 border ${
                    isUnlocked
                      ? 'bg-[#E6DEC8] hover:bg-[#D8CCB0] active:bg-[#CBBBA0] text-stone-950 border-[#C2B299]'
                      : 'bg-stone-200/80 text-stone-500 border-stone-300 hover:bg-stone-300/80'
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
              className="text-stone-500 hover:text-stone-950 text-lg font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 4-Column Kanban Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1 overflow-y-auto">
          {columns.map((col) => {
            const colTasks = currentSprintTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] p-3 flex flex-col space-y-3 shadow-xs"
              >
                <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-2">
                  <span className={`text-xs font-extrabold ${col.color}`}>{col.label}</span>
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded shadow-xs ${col.badgeColor}`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-[#FDFBF7] border border-[#D6CFC2] hover:border-[#B5A585] text-xs space-y-2 shadow-xs transition-all"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-stone-950 leading-snug">{t.title}</span>
                        {t.urgency === 'CRITICAL' && (
                          <span className="text-[9px] font-mono font-black text-[#C2410C] bg-[#FBE5E1] px-1 py-0.5 rounded border border-[#EBB3A9]">
                            CRÍTICO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">{t.description}</p>

                      {/* Progress bar */}
                      {t.status === 'IN_PROGRESS' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono font-semibold text-stone-600">
                            <span>Progreso:</span>
                            <span>{t.progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#4C7C59] transition-all duration-300"
                              style={{ width: `${t.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {t.status !== 'DONE' && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceTask(t.id)}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                            t.status === 'TODO'
                              ? 'bg-[#E6DEC8] hover:bg-[#D8CCB0] text-stone-950 border border-[#C2B299]'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-[#D5E2D2] hover:bg-[#C2D6BE] text-[#2F5233] border border-[#AEC9A9]'
                              : 'bg-[#F2E8D5] hover:bg-[#E5D7BF] text-[#7C5117] border border-[#D8C2A0]'
                          }`}
                        >
                          {t.status === 'TODO'
                            ? '▶ Empezar Desarrollo'
                            : t.status === 'IN_PROGRESS'
                            ? '💻 Programar (+Progreso / 20m)'
                            : '🔍 Solicitar Code Review'}
                        </button>
                      )}

                      {t.status === 'DONE' && (
                        <span className="inline-block text-[10px] font-mono font-bold text-[#2F5233] bg-[#E2EBD8] px-2 py-0.5 rounded border border-[#B3C99C] shadow-xs">
                          ✓ Completado y Fusionado
                        </span>
                      )}
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-stone-500 italic">
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
