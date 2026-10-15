/**
 * src/App.tsx
 * Master Application Shell connecting Phaser 3 Canvas, React HUD, Modals,
 * Real-time Workday Clock, 18:00 End-of-Day Strike Check, Distraction Toasts,
 * and F2 Debug Inspector Panel.
 * Redesigned with warm light browns, stone cream, taupe, and crisp black Inter typography.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from './state/useGameStore';
import { useQuestStore } from './state/useQuestStore';
import { PhaserGame } from './ui/PhaserGame';
import { HUD } from './ui/HUD';
import { DialogueBox } from './ui/DialogueBox';
import { WorkstationModal } from './ui/WorkstationModal';
import { SprintRetroModal } from './ui/SprintRetroModal';
import { SkinCustomizer } from './ui/SkinCustomizer';
import { SettingsModal } from './ui/SettingsModal';
import { EndingScreen } from './ui/EndingScreen';
import { DistractionToast } from './ui/DistractionToast';
import { FeedbackManager } from './core/FeedbackManager';
import { AudioManager } from './core/AudioManager';
import type { OfficeScene } from './core/OfficeScene';

export const App: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    isPaused,
    advanceTime,
    setSprint,
    dayTimeMinutes,
    currentSprint,
    emotionalIntelligence,
    updateIE,
    updateFiveC,
    strikes,
    addStrike,
    triggerEnding,
    getTeamVelocity,
    tasks,
  } = useGameStore();

  const { setActiveStoryNode } = useQuestStore();

  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [debugPanelOpen, setDebugPanelOpen] = useState<boolean>(false);

  // Connect Phaser Scene Camera Shake with FeedbackManager
  const handleSceneReady = useCallback((scene: OfficeScene) => {
    FeedbackManager.registerCameraHook((intensity, duration) => {
      scene.triggerCameraShake(intensity, duration);
    });
  }, []);

  // Real-time workday ticker (8 real minutes = 8 workday hours = 480 workday minutes)
  // 1 real second = 1 workday minute (scaled by Team Velocity)
  useEffect(() => {
    if (!hasStarted || isPaused || activeModal !== 'NONE') return;

    const interval = setInterval(() => {
      const velocity = getTeamVelocity();
      advanceTime(Math.max(1, Math.round(1 * velocity)));
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, isPaused, activeModal, advanceTime, getTeamVelocity]);

  // 18:00 End-of-Workday Evaluation & Deadline Check (1080 simulated minutes)
  useEffect(() => {
    if (dayTimeMinutes >= 1080 && hasStarted && activeModal === 'NONE') {
      const state = useGameStore.getState();
      state.togglePause(true);

      const criticalTaskMap: Record<number, string> = {
        1: 't1_auth_endpoint',
        2: 't2_payment_gateway',
        3: 't3_preprod_db_recovery',
      };

      const criticalTaskId = criticalTaskMap[currentSprint];
      const task = tasks.find((t) => t.id === criticalTaskId);

      if (task && task.status !== 'DONE') {
        state.addStrike();
        AudioManager.playStrikeAlarm();
        FeedbackManager.triggerImpact('large');
        alert(
          `⚠️ ¡Fin de jornada a las 18:00! Tu ticket crítico "${task.title}" no fue completado a tiempo. Has recibido +1 Strike de David.`
        );
      } else {
        AudioManager.playNotificationPing();
        FeedbackManager.triggerImpact('small');
      }

      state.setActiveModal('SPRINT_RETRO');
    }
  }, [dayTimeMinutes, hasStarted, activeModal, currentSprint, tasks]);

  // Global F2 Debug Inspector & Audio init listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setDebugPanelOpen((prev) => !prev);
      }
      // Initialize Web Audio on user gesture
      AudioManager.init();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F5F3EF] flex flex-col font-sans select-none text-stone-950">
      {/* Title / Intro Screen */}
      {!hasStarted ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#F4F1EA] p-6 text-stone-950">
          <div className="max-w-xl w-full text-center space-y-6 p-8 rounded-3xl bg-[#FDFBF7] border-2 border-[#C2B299] shadow-2xl backdrop-blur-md">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-[#6F5643] uppercase bg-[#E6DEC8] px-3.5 py-1.5 rounded-full border border-[#C2B299] shadow-xs inline-block">
                Simulador 2D de Oficina · Gestión de Habilidades Blandas
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-stone-950">
                Sprint Cero: <span className="text-[#6F5643]">DevLife RPG</span>
              </h1>
              <p className="text-xs text-stone-700 leading-relaxed max-w-md mx-auto font-medium">
                Acabas de incorporarte a <strong>NovaSoft Solutions</strong> para desarrollar FinTrack 2.0.
                Tus conocimientos técnicos importan, pero tu supervivencia dependerá de tu{' '}
                <strong>Inteligencia Emocional</strong>, las <strong>5 C del Trabajo en Equipo</strong> y tu habilidad
                para evitar la <strong>procrastinación</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] text-left text-xs space-y-2 shadow-xs">
              <div className="font-bold text-stone-950">🎮 Controles de Juego:</div>
              <div className="grid grid-cols-2 gap-2 text-stone-800 font-mono text-[11px]">
                <div>• Movimiento: WASD o Flechas</div>
                <div>• Interactuar: Tecla [E] o Espacio</div>
                <div>• Diálogos: Teclas [1-4]</div>
                <div>• Debug Panel: Tecla [F2]</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  AudioManager.playKeyClack();
                  setHasStarted(true);
                }}
                className="px-8 py-3 rounded-2xl bg-[#6F5643] hover:bg-[#5C4736] active:bg-[#4A3B32] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                🚀 Entrar a la Oficina
              </button>
              <button
                onClick={() => {
                  AudioManager.playKeyClack();
                  setHasStarted(true);
                  setActiveModal('SKIN_CUSTOMIZER');
                }}
                className="px-6 py-3 rounded-2xl bg-[#E6DEC8] hover:bg-[#D8CCB0] active:bg-[#CBBBA0] text-stone-950 font-bold text-xs border border-[#C2B299] transition-all cursor-pointer shadow-xs"
              >
                🎨 Personalizar Avatar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main 2D Game Canvas */}
          <div className="w-full h-full relative">
            <PhaserGame onSceneReady={handleSceneReady} />

            {/* React Top HUD Overlay */}
            <HUD />

            {/* Distraction Toasts (Smartphone Popups) */}
            <DistractionToast />
          </div>

          {/* Active Modals */}
          {activeModal === 'DIALOGUE' && <DialogueBox />}
          {activeModal === 'WORKSTATION' && <WorkstationModal />}
          {activeModal === 'SCRUM_BOARD' && <SprintRetroModal />}
          {activeModal === 'SKIN_CUSTOMIZER' && <SkinCustomizer />}
          {activeModal === 'SETTINGS' && <SettingsModal />}
          {activeModal === 'ENDING' && <EndingScreen />}

          {/* F2 Debug / Coach Inspector Panel */}
          {debugPanelOpen && (
            <div className="fixed bottom-4 left-4 z-50 p-4 bg-[#FDFBF7]/95 border-2 border-[#C2B299] rounded-2xl shadow-2xl text-xs text-stone-950 max-w-sm w-full space-y-3 font-mono">
              <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-2">
                <span className="font-extrabold text-[#6F5643]">🛠 F2 Debug Inspector</span>
                <button
                  onClick={() => setDebugPanelOpen(false)}
                  className="text-stone-500 hover:text-stone-950 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Quick Jump Act 1, 2, 3 */}
              <div>
                <span className="text-[10px] text-stone-600 block mb-1 font-bold">Saltar a Acto / Escena:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setSprint(1);
                      setActiveStoryNode('scene_1_1_daily');
                      setActiveModal('DIALOGUE');
                    }}
                    className="p-1 rounded bg-[#E6DEC8] hover:bg-[#D8CCB0] text-[10px] font-bold text-stone-950 border border-[#C2B299] cursor-pointer"
                  >
                    Acto 1 (Daily)
                  </button>
                  <button
                    onClick={() => {
                      setSprint(2);
                      setActiveStoryNode('scene_2_1_david_scope');
                      setActiveModal('DIALOGUE');
                    }}
                    className="p-1 rounded bg-[#E6DEC8] hover:bg-[#D8CCB0] text-[10px] font-bold text-stone-950 border border-[#C2B299] cursor-pointer"
                  >
                    Acto 2 (Scope)
                  </button>
                  <button
                    onClick={() => {
                      setSprint(3);
                      setActiveStoryNode('scene_3_1_black_friday');
                      setActiveModal('DIALOGUE');
                    }}
                    className="p-1 rounded bg-[#E6DEC8] hover:bg-[#D8CCB0] text-[10px] font-bold text-stone-950 border border-[#C2B299] cursor-pointer"
                  >
                    Acto 3 (Crisis)
                  </button>
                </div>
              </div>

              {/* Metric Tweaks */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span>IE ({emotionalIntelligence}%):</span>
                  <div className="space-x-1">
                    <button
                      onClick={() => updateIE(-10)}
                      className="px-1.5 py-0.5 rounded bg-[#FBE5E1] text-[#8C2D19] border border-[#EBB3A9] font-bold cursor-pointer"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => updateIE(10)}
                      className="px-1.5 py-0.5 rounded bg-[#E2EBD8] text-[#2F5233] border border-[#B3C99C] font-bold cursor-pointer"
                    >
                      +10
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>Strikes ({strikes}/3):</span>
                  <div className="space-x-1">
                    <button
                      onClick={() => addStrike()}
                      className="px-1.5 py-0.5 rounded bg-[#FBE5E1] text-[#8C2D19] border border-[#EBB3A9] font-bold cursor-pointer"
                    >
                      +1 Strike
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>5 Cs Boost:</span>
                  <button
                    onClick={() =>
                      updateFiveC({
                        compromiso: 20,
                        confianza: 20,
                        coordinacion: 20,
                        comunicacion: 20,
                        complementariedad: 20,
                      })
                    }
                    className="px-1.5 py-0.5 rounded bg-[#E6DEC8] text-stone-950 border border-[#C2B299] font-bold cursor-pointer"
                  >
                    +20 All
                  </button>
                </div>
              </div>

              {/* Direct Ending Triggers */}
              <div className="pt-2 border-t border-[#D6CFC2]">
                <span className="text-[10px] text-stone-600 block mb-1 font-bold">Evaluar Final:</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <button
                    onClick={() => triggerEnding('FIRED_GAME_OVER')}
                    className="p-1 rounded bg-[#FBE5E1] text-[#8C2D19] border border-[#EBB3A9] font-bold cursor-pointer"
                  >
                    1. Despido
                  </button>
                  <button
                    onClick={() => triggerEnding('BURNOUT_SOLITARY_WOLF')}
                    className="p-1 rounded bg-[#FBE5E1] text-[#8C2D19] border border-[#EBB3A9] font-bold cursor-pointer"
                  >
                    2. Lobo Quemado
                  </button>
                  <button
                    onClick={() => triggerEnding('EXPLOITED_PEOPLE_PLEASER')}
                    className="p-1 rounded bg-[#F5EED8] text-[#7C5117] border border-[#D8C2A0] font-bold cursor-pointer"
                  >
                    3. Complaciente
                  </button>
                  <button
                    onClick={() => triggerEnding('SOLID_DEVELOPER')}
                    className="p-1 rounded bg-[#E3E8EC] text-[#2C4A6F] border border-[#BAC7D5] font-bold cursor-pointer"
                  >
                    4. Sólido
                  </button>
                  <button
                    onClick={() => triggerEnding('TECH_LEAD_EXCELLENCE')}
                    className="p-1 rounded bg-[#E2EBD8] text-[#2F5233] border border-[#B3C99C] font-bold cursor-pointer"
                  >
                    5. Tech Lead
                  </button>
                  <button
                    onClick={() => triggerEnding('STARTUP_COFOUNDERS')}
                    className="p-1 rounded bg-[#EDE8F5] text-[#552E7A] border border-[#D1C2E6] font-bold cursor-pointer"
                  >
                    6. Co-Founders
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
