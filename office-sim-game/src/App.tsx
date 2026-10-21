/**
 * src/App.tsx
 * Master Application Shell con HUD siempre visible en la parte superior
 * y el área de Phaser + Modales encajada debajo sin solapamientos.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { SkinBuilder } from './core/SkinBuilder';
import { SaveManager } from './core/SaveManager';
import { DialogueRunner } from './core/DialogueRunner';
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
    updateAffinities,
    updateStress,
    strikes,
    addStrike,
    getTeamVelocity,
    tasks,
    skinConfig,
    resetGame,
  } = useGameStore();

  const { setActiveStoryNode, resetQuests } = useQuestStore();

  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [menuIndex, setMenuIndex] = useState<number>(0);
  const [showControlsGuide, setShowControlsGuide] = useState<boolean>(false);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);
  const [debugPanelOpen, setDebugPanelOpen] = useState<boolean>(false);
  const [walkFrame, setWalkFrame] = useState<number>(0);

  const castCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    const id = 'retro-pixel-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap';
      document.head.appendChild(link);
    }
    const slots = SaveManager.getSlotsMetadata();
    setHasSavedGame(slots.some((s) => !s.isEmpty));
  }, [hasStarted]);

  useEffect(() => {
    if (hasStarted) return;
    const timer = setInterval(() => {
      setWalkFrame((prev) => (prev + 1) % 4);
    }, 220);
    return () => clearInterval(timer);
  }, [hasStarted]);

  useEffect(() => {
    if (hasStarted) return;
    const showcaseCast = [
      { key: 'player', config: skinConfig },
      { key: 'elena', config: SkinBuilder.NPC_SKINS.elena_scrum },
      { key: 'marcos', config: SkinBuilder.NPC_SKINS.marcos_senior },
      { key: 'sofia', config: SkinBuilder.NPC_SKINS.sofia_ux },
      { key: 'lucas', config: SkinBuilder.NPC_SKINS.lucas_junior },
      { key: 'david', config: SkinBuilder.NPC_SKINS.david_po },
    ];

    showcaseCast.forEach(({ key, config }) => {
      const canvas = castCanvasRefs.current[key];
      if (canvas && config) {
        SkinBuilder.renderPreviewFrame(canvas, config, 2, walkFrame, 3);
      }
    });
  }, [hasStarted, walkFrame, skinConfig]);

  const handleSceneReady = useCallback((scene: OfficeScene) => {
    FeedbackManager.registerCameraHook((intensity, duration) => {
      scene.triggerCameraShake(intensity, duration);
    });
  }, []);

  useEffect(() => {
    if (!hasStarted || isPaused || activeModal !== 'NONE') return;
    const interval = setInterval(() => {
      const velocity = getTeamVelocity();
      advanceTime(Math.max(1, Math.round(1 * velocity)));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, activeModal, advanceTime, getTeamVelocity]);

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
          `⏰ ¡Fin de jornada a las 18:00! Tu ticket crítico "${task.title}" no fue completado a tiempo. Has recibido +1 Strike de David.`
        );
      } else {
        AudioManager.playNotificationPing();
        FeedbackManager.triggerImpact('small');
      }

      state.setActiveModal('SPRINT_RETRO');
    }
  }, [dayTimeMinutes, hasStarted, activeModal, currentSprint, tasks]);

  const handleStartNewGame = useCallback(() => {
    AudioManager.playNotificationPing();
    DialogueRunner.resetTransitions();
    resetGame();
    resetQuests();
    setHasStarted(true);
    setActiveStoryNode('act1_daily');
    setActiveModal('DIALOGUE');
  }, [resetGame, resetQuests, setActiveStoryNode, setActiveModal]);

  const handleContinueGame = useCallback(() => {
    AudioManager.playNotificationPing();
    const loaded =
      SaveManager.loadGame('autosave') ||
      SaveManager.loadGame('slot_1') ||
      SaveManager.loadGame('slot_2') ||
      SaveManager.loadGame('slot_3');
    if (loaded) {
      setHasStarted(true);
    } else {
      handleStartNewGame();
    }
  }, [handleStartNewGame]);

  const handleOpenSkinStudio = useCallback(() => {
    AudioManager.playKeyClack();
    setHasStarted(true);
    setActiveModal('SKIN_CUSTOMIZER');
  }, [setActiveModal]);

  const menuActions = [
    {
      id: 'new_game',
      label: 'INICIAR JORNADA (NUEVA PARTIDA)',
      badge: 'SPRINT 1',
      action: handleStartNewGame,
    },
    ...(hasSavedGame
      ? [
          {
            id: 'continue',
            label: 'CONTINUAR PARTIDA GUARDADA',
            badge: 'AUTOSAVE',
            action: handleContinueGame,
          },
        ]
      : []),
    {
      id: 'skin_studio',
      label: 'ESTUDIO DE SKINS & MAPA 2D',
      badge: 'CHIBI 16-BIT',
      action: handleOpenSkinStudio,
    },
    {
      id: 'controls',
      label: showControlsGuide ? 'OCULTAR MANUAL DEL EMPLEADO' : 'MANUAL DE CONTROLES & REGLAS',
      badge: 'INFO',
      action: () => {
        AudioManager.playKeyClack();
        setShowControlsGuide((prev) => !prev);
      },
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      AudioManager.init();

      if (e.key === 'F2') {
        e.preventDefault();
        setDebugPanelOpen((prev) => !prev);
        return;
      }

      if (!hasStarted) {
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          AudioManager.playKeyClack();
          setMenuIndex((prev) => (prev + 1) % menuActions.length);
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          AudioManager.playKeyClack();
          setMenuIndex((prev) => (prev - 1 + menuActions.length) % menuActions.length);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const chosen = menuActions[menuIndex];
          if (chosen) chosen.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, menuIndex, menuActions]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0e17] flex flex-col select-none text-slate-100">
      {!hasStarted ? (
        <div className="relative flex-1 w-full h-full retro-grid-bg flex flex-col items-center justify-between p-4 md:p-8 overflow-y-auto">
          <div className="absolute inset-0 crt-scanlines pointer-events-none z-10" />

          <div className="relative z-20 w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 animate-ping" />
              <span className="font-arcade text-[9px] text-emerald-400 tracking-wider">
                NOVASOFT ENTERTAINMENT SYSTEM · ROM V2.0
              </span>
            </div>
            <span className="font-arcade text-[9px] text-amber-300">
              INSERT COIN · 1UP READY
            </span>
          </div>

          <div className="relative z-20 max-w-3xl w-full my-auto space-y-6 py-4">
            <div className="text-center space-y-3">
              <div className="inline-block rpg-box-dark px-4 py-1.5 bg-[#1e293b] border-amber-400">
                <span className="font-arcade text-[9px] md:text-[10px] text-amber-300 uppercase">
                  ★ RPG DE OFICINA, CÓDIGO & SUPERVIVENCIA EN EQUIPO ★
                </span>
              </div>
              <h1 className="font-arcade text-4xl sm:text-5xl md:text-6xl text-amber-400 arcade-title-shadow tracking-tight leading-none pt-2">
                SPRINT CERO
              </h1>
              <div className="inline-block bg-rose-600 border-2 border-white px-4 py-1 shadow-[4px_4px_0_0_#000]">
                <span className="font-arcade text-xs md:text-sm text-white tracking-widest">
                  DEVLIFE RPG · EDICIÓN FINTRACK 2.0
                </span>
              </div>
            </div>

            <div className="rpg-box-dark p-4 bg-[#111625]">
              <div className="flex justify-between items-center mb-3 border-b-2 border-slate-800 pb-1.5">
                <span className="font-arcade text-[8px] text-sky-300">
                  EL EQUIPO DE NOVASOFT SOLUTIONS (SPRITES 16-BIT EN VIVO)
                </span>
                <span className="font-arcade text-[8px] text-slate-400">
                  3 SPRINTS · 15 INTERRUPCIONES · 6 FINALES
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[
                  { key: 'player', name: 'TÚ', role: 'Fullstack', color: 'text-emerald-400', border: 'border-emerald-500/60' },
                  { key: 'elena', name: 'ELENA', role: 'Scrum Master', color: 'text-pink-400', border: 'border-slate-700' },
                  { key: 'marcos', name: 'MARCOS', role: 'Sr. Backend', color: 'text-rose-400', border: 'border-slate-700' },
                  { key: 'sofia', name: 'SOFÍA', role: 'UX / UI', color: 'text-purple-400', border: 'border-slate-700' },
                  { key: 'lucas', name: 'LUCAS', role: 'Junior Dev', color: 'text-teal-400', border: 'border-slate-700' },
                  { key: 'david', name: 'DAVID', role: 'Product Owner', color: 'text-amber-400', border: 'border-slate-700' },
                ].map((char) => (
                  <div
                    key={char.key}
                    className={`bg-[#181e31] border-2 ${char.border} p-2 flex flex-col items-center justify-center`}
                  >
                    <canvas
                      ref={(el) => {
                        castCanvasRefs.current[char.key] = el;
                      }}
                      className="w-14 h-14 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span className={`font-arcade text-[8px] mt-1.5 ${char.color}`}>
                      {char.name}
                    </span>
                    <span className="font-dialogue text-sm text-slate-400 leading-none">
                      {char.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpg-box-cream p-5 space-y-2.5">
              <div className="flex justify-between items-center border-b-2 border-[#b8ab8e] pb-1.5 mb-2">
                <span className="font-arcade text-[9px] text-stone-800">
                  SELECCIONA MODO DE JUEGO:
                </span>
                <span className="font-arcade text-[8px] text-stone-600">
                  [▲▼] MOVER · [ENTER] ACEPTAR
                </span>
              </div>

              <div className="space-y-2">
                {menuActions.map((item, idx) => {
                  const isSelected = idx === menuIndex;
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => {
                        if (menuIndex !== idx) {
                          AudioManager.playKeyClack();
                          setMenuIndex(idx);
                        }
                      }}
                      onClick={item.action}
                      className={`w-full p-3 text-left flex items-center justify-between border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2b2118] text-[#f4eed7] border-black shadow-[0_4px_0_0_#92400e] -translate-y-0.5'
                          : 'bg-[#e5dcc5] text-stone-900 border-[#2b2118] hover:bg-[#efe7d3]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-arcade text-xs ${
                            isSelected ? 'text-amber-400 animate-bounce' : 'text-transparent'
                          }`}
                        >
                          ▶
                        </span>
                        <span className="font-arcade text-[10px] sm:text-xs">
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`font-arcade text-[8px] px-2 py-1 border ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 border-black'
                            : 'bg-[#d5c8a8] text-stone-800 border-[#2b2118]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {showControlsGuide && (
              <div className="rpg-box-dark p-5 space-y-3 animate-fade-in">
                <div className="font-arcade text-[10px] text-amber-300 border-b-2 border-slate-700 pb-2">
                  📖 MANUAL DE SUPERVIVENCIA EN NOVASOFT SOLUTIONS
                </div>
                <p className="font-dialogue text-xl text-slate-200 leading-snug">
                  Acabas de entrar como Fullstack Developer para construir <strong>FinTrack 2.0</strong>.
                  Gestiona las <strong>Daily Stand-ups</strong>, el <strong>Kanban</strong> y las <strong>5 Interrupciones de cada Sprint</strong> equilibrando las <strong>5 C</strong>, la <strong>Afinidad</strong> con el equipo y el <strong>Estrés</strong>.
                </p>
              </div>
            )}
          </div>

          <div className="relative z-20 w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 border-t-2 border-slate-800 pt-3 font-arcade text-[8px] text-slate-500">
            <span>© 2026 NOVASOFT CORP · MOTOR PHASER 3 + REACT PIXEL UI</span>
            <span>PULSA [F2] EN JUEGO PARA MODO DEBUG</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full overflow-hidden">
          {/* 1. HUD DE ESTADÍSTICAS FIJO EN CABECERA SUPERIOR */}
          <HUD />

          {/* 2. ESCENARIO 2D Y MODALES DEBAJO DEL HUD (SIN SOLAPARSE) */}
          <div className="relative flex-1 min-h-0 w-full overflow-hidden">
            <PhaserGame onSceneReady={handleSceneReady} />
            <DistractionToast />

            {activeModal === 'DIALOGUE' && <DialogueBox />}
            {activeModal === 'WORKSTATION' && <WorkstationModal />}
            {(activeModal === 'SCRUM_BOARD' || activeModal === 'SPRINT_RETRO') && <SprintRetroModal />}
            {activeModal === 'SKIN_CUSTOMIZER' && <SkinCustomizer />}
            {activeModal === 'SETTINGS' && <SettingsModal />}
            {activeModal === 'ENDING' && <EndingScreen />}
          </div>

          {debugPanelOpen && (
            <div className="fixed bottom-4 left-4 z-[90] p-4 rpg-box-dark text-xs max-w-sm w-full space-y-3">
              <div className="flex justify-between items-center border-b-2 border-slate-700 pb-2">
                <span className="font-arcade text-[10px] text-amber-400">🛠️ F2 DEBUG TERMINAL</span>
                <button
                  onClick={() => setDebugPanelOpen(false)}
                  className="font-arcade text-[10px] text-slate-400 hover:text-white cursor-pointer"
                >
                  [X]
                </button>
              </div>

              <div>
                <span className="font-arcade text-[8px] text-slate-400 block mb-1.5">
                  SALTAR A DAILY STAND-UP DEL GUIÓN:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setSprint(1);
                      setActiveStoryNode('act1_daily');
                      setActiveModal('DIALOGUE');
                    }}
                    className="rpg-btn p-1.5 font-arcade text-[8px] cursor-pointer"
                  >
                    ACTO 1
                  </button>
                  <button
                    onClick={() => {
                      setSprint(2);
                      setActiveStoryNode('act2_daily');
                      setActiveModal('DIALOGUE');
                    }}
                    className="rpg-btn p-1.5 font-arcade text-[8px] cursor-pointer"
                  >
                    ACTO 2
                  </button>
                  <button
                    onClick={() => {
                      setSprint(3);
                      setActiveStoryNode('act3_daily');
                      setActiveModal('DIALOGUE');
                    }}
                    className="rpg-btn p-1.5 font-arcade text-[8px] cursor-pointer"
                  >
                    ACTO 3
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1 font-arcade text-[9px]">
                <div className="flex justify-between items-center">
                  <span>PROBAR HUD EN VIVO:</span>
                  <div className="space-x-1">
                    <button
                      onClick={() => {
                        updateIE(10);
                        updateStress(-10);
                        updateAffinities({ elena: 10, marcos: 10 });
                      }}
                      className="px-2 py-1 bg-emerald-700 text-white border border-black cursor-pointer"
                    >
                      +STATS
                    </button>
                    <button
                      onClick={() => {
                        updateIE(-10);
                        updateStress(15);
                        updateAffinities({ david: -10, sofia: -10 });
                      }}
                      className="px-2 py-1 bg-rose-700 text-white border border-black cursor-pointer"
                    >
                      -STATS
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>STRIKES ({strikes}/3):</span>
                  <button
                    onClick={() => addStrike()}
                    className="px-2 py-1 bg-rose-700 text-white border border-black cursor-pointer"
                  >
                    +1 STRIKE
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <span>BOOST 5 C ({emotionalIntelligence}%):</span>
                  <button
                    onClick={() =>
                      updateFiveC({
                        compromiso: 15,
                        confianza: 15,
                        coordinacion: 15,
                        comunicacion: 15,
                        complementariedad: 15,
                      })
                    }
                    className="px-2 py-1 bg-amber-500 text-stone-950 border border-black cursor-pointer"
                  >
                    +15 TODAS
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-slate-700 flex justify-between items-center">
                <button
                  onClick={() => {
                    DialogueRunner.resetTransitions();
                    resetGame();
                    resetQuests();
                    setHasStarted(false);
                  }}
                  className="rpg-btn w-full py-1.5 font-arcade text-[8px] bg-amber-300 text-stone-950 cursor-pointer"
                >
                  VOLVER AL MENÚ DE TÍTULO
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;