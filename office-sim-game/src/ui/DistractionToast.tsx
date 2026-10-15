/**
 * src/ui/DistractionToast.tsx
 * Procrastination Traps & Smartphone Temptation Toasts for DevLife RPG.
 * - Randomly triggers tempting mobile notifications during the workday
 * - Automatically blocked / shielded when Pomodoro timer is active
 * - Falling for the trap costs 30 simulated minutes
 * - Resisting grants +5 Temporal Mastery Points
 * - Harmonized with warm light brown & stone editorial aesthetic
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/useGameStore';
import { AudioManager } from '../core/AudioManager';

interface DistractionItem {
  id: string;
  app: string;
  title: string;
  message: string;
}

const DISTRACTION_POOL: DistractionItem[] = [
  {
    id: 'dist_twitter',
    app: 'Twitter / X',
    title: '🔥 Hilo viral de debate tech',
    message: '"¿Por qué TypeScript está sobrevalorado y deberíamos volver a jQuery?" (3.2k respuestas)',
  },
  {
    id: 'dist_meme',
    app: 'Reddit r/programmerhumor',
    title: '😂 Meme de producción en viernes',
    message: '"Cuando haces git push --force a main a las 17:55 y apagas el portátil."',
  },
  {
    id: 'dist_whatsapp',
    app: 'Grupo de WhatsApp "Colegas Devs"',
    title: '💬 Audio de 4 minutos',
    message: '"Tío, no te vas a creer lo que ha liado el nuevo CTO en mi empresa..."',
  },
  {
    id: 'dist_youtube',
    app: 'YouTube',
    title: '🎬 Nuevo vídeo recomendado',
    message: '"Construí un sistema operativo en 24 horas usando solo CSS puro".',
  },
];

export const DistractionToast: React.FC = () => {
  const {
    pomodoroActive,
    advanceTime,
    addTemporalMasteryPoints,
    isPaused,
    activeModal,
    flags,
    setFlag,
  } = useGameStore();

  const [activeToast, setActiveToast] = useState<DistractionItem | null>(null);

  // Periodic random trigger (every 60-120 seconds of real gameplay)
  useEffect(() => {
    if (isPaused || activeModal !== 'NONE') return;

    // Distraction interval: 70 seconds
    const interval = setInterval(() => {
      // If Pomodoro is active, hyperfocus shields against distraction!
      if (useGameStore.getState().pomodoroActive) return;

      if (!activeToast && Math.random() < 0.75) {
        const item = DISTRACTION_POOL[Math.floor(Math.random() * DISTRACTION_POOL.length)];
        setActiveToast(item);
        AudioManager.playNotificationPing();
      }
    }, 70000);

    return () => clearInterval(interval);
  }, [isPaused, activeModal, activeToast]);

  // Auto-dismiss after 14 seconds if untouched
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 14000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast || pomodoroActive) return null;

  const handleGiveIn = () => {
    AudioManager.playNotificationPing();
    advanceTime(30);
    const count = Number(flags['phone_distractions_count'] || 0) + 1;
    setFlag('phone_distractions_count', count);
    setActiveToast(null);
  };

  const handleResist = () => {
    AudioManager.playKeyClack();
    addTemporalMasteryPoints(5);
    const count = Number(flags['distractions_resisted_count'] || 0) + 1;
    setFlag('distractions_resisted_count', count);
    setActiveToast(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-short font-sans select-none">
      <div className="bg-[#FDFBF7] border-2 border-[#C2B299] rounded-2xl p-4 shadow-2xl text-stone-950 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#EBE7DF] pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-base">📱</span>
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {activeToast.app}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#C2410C] font-semibold bg-[#FBE5E1] px-1.5 py-0.5 rounded border border-[#EBB3A9]">
            Tentación
          </span>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-stone-950 leading-snug">
            {activeToast.title}
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            {activeToast.message}
          </p>
        </div>

        {/* Action Choices */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bold">
          <button
            onClick={handleGiveIn}
            className="py-2 px-3 rounded-xl bg-[#F2E8D5] hover:bg-[#E5D7BF] text-[#7C5117] border border-[#D8C2A0] shadow-xs cursor-pointer text-center"
          >
            Mirar móvil (-30 min)
          </button>
          <button
            onClick={handleResist}
            className="py-2 px-3 rounded-xl bg-[#D5E2D2] hover:bg-[#C2D6BE] text-[#2F5233] border border-[#AEC9A9] shadow-xs cursor-pointer text-center"
          >
            Ignorar (+5 pts)
          </button>
        </div>
      </div>
    </div>
  );
};
