/**
 * src/ui/tools/PomodoroTimer.tsx
 * Level 1 Unlock: Pomodoro Technique (The Tomato Clock).
 * Features:
 * - 25-minute deep focus work interval + 5-minute break
 * - +30% coding velocity boost & office distraction blocking
 * - Grants +25 Temporal Mastery Points upon cycle completion
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../state/useGameStore';

export const PomodoroTimer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    pomodoroActive,
    startPomodoro,
    stopPomodoro,
    addTemporalMasteryPoints,
    advanceTime,
  } = useGameStore();

  const [mode, setMode] = useState<'WORK' | 'BREAK'>('WORK');
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(pomodoroActive);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleCycleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  const handleCycleComplete = () => {
    setIsRunning(false);
    stopPomodoro();
    if (mode === 'WORK') {
      addTemporalMasteryPoints(25);
      advanceTime(25);
      alert('¡Ciclo de Enfoque Pomodoro completado! +25 Puntos de Maestría Temporal.');
      setMode('BREAK');
      setSecondsLeft(5 * 60);
    } else {
      alert('Pausa completada. ¿Listo para el siguiente bloque de enfoque?');
      setMode('WORK');
      setSecondsLeft(25 * 60);
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      stopPomodoro();
    } else {
      setIsRunning(true);
      startPomodoro();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    stopPomodoro();
    setSecondsLeft(mode === 'WORK' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const totalSeconds = mode === 'WORK' ? 25 * 60 : 5 * 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-rose-400 flex items-center space-x-1.5">
            <span>🍅 Técnica Pomodoro (Nivel 1)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Enfoque profundo: +30% velocidad de código y bloqueo de distracciones.
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">
          ✕
        </button>
      </div>

      {/* Timer Circle View */}
      <div className="flex flex-col items-center justify-center py-4 space-y-4">
        <div className="relative w-44 h-44 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-inner">
          <div
            className="absolute inset-0 rounded-full border-4 border-rose-500 transition-all duration-1000"
            style={{
              clipPath: `polygon(50% 50%, 50% 0%, ${progressPercent > 25 ? '100% 0%' : '50% 0%'}, ${
                progressPercent > 50 ? '100% 100%' : '100% 0%'
              }, ${progressPercent > 75 ? '0% 100%' : '100% 100%'}, ${
                progressPercent >= 100 ? '0% 0%' : '0% 100%'
              })`,
            }}
          />
          <div className="text-center z-10">
            <span className="text-3xl font-mono font-extrabold text-white tracking-wider">
              {timeDisplay}
            </span>
            <span className="text-xs font-mono text-rose-300 block mt-1">
              {mode === 'WORK' ? '💻 Bloque de Trabajo' : '☕ Pausa Breve'}
            </span>
          </div>
        </div>

        {/* Buff Banner */}
        <div className="w-full p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-center text-xs text-rose-200">
          {isRunning ? (
            <span className="animate-pulse font-semibold">
              ⚡ Modo Hiperfoco activo: Las tentaciones del móvil y café quedan bloqueadas.
            </span>
          ) : (
            <span className="text-slate-400">Pulsa iniciar para arrancar el temporizador de concentración.</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTimer}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            {isRunning ? '⏸ Pausar' : '▶ Iniciar Enfoque'}
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
};
