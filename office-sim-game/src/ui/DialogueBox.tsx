/**
 * src/ui/DialogueBox.tsx
 * Sistema de Diálogo Retro 16-Bit con:
 * 1. Retrato en vivo de la Skin del NPC arriba + Bocadillo de cómic pixel-art
 * 2. Selector de decisiones tipo "Rosco / Pasapalabra" controlado con Flechas (Izquierda/Derecha)
 * 3. Cero spoilers de estadísticas ni etiquetas de respuesta
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import { DialogueRunner, type ChoiceExecutionResult } from '../core/DialogueRunner';
import { STORY_NODES, type StoryNode, type DialogueOption } from '../data/storyNodes';
import { SkinBuilder } from '../core/SkinBuilder';
import { AudioManager } from '../core/AudioManager';
import { SaveManager } from '../core/SaveManager';
import type { SkinConfig } from '../types/game';

/**
 * Resuelve la SkinConfig del personaje que habla según el nombre en el nodo
 */
function resolveSpeakerSkin(speakerName: string, playerSkin: SkinConfig): SkinConfig {
  const lower = speakerName.toLowerCase();
  if (lower.includes('elena')) return SkinBuilder.NPC_SKINS.elena_scrum;
  if (lower.includes('david')) return SkinBuilder.NPC_SKINS.david_po;
  if (lower.includes('marcos')) return SkinBuilder.NPC_SKINS.marcos_senior;
  if (lower.includes('sof')) return SkinBuilder.NPC_SKINS.sofia_ux;
  if (lower.includes('lucas')) return SkinBuilder.NPC_SKINS.lucas_junior;
  return playerSkin;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const DialogueBox: React.FC = () => {
  const { activeModal, closeModal, updateIE, skinConfig } = useGameStore();
  const { activeStoryNodeId, setActiveStoryNode } = useQuestStore();

  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<ChoiceExecutionResult | null>(null);

  // Estado de animación para el retrato pixel-art del hablante
  const [portraitFrame, setPortraitFrame] = useState<number>(0);
  const portraitCanvasRef = useRef<HTMLCanvasElement>(null);
  const playerPreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Estado de autorregulación emocional (Respiración Cuadrada en escenas tensas)
  const [needsSelfRegulation, setNeedsSelfRegulation] = useState<boolean>(false);
  const [regulationPhase, setRegulationPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'done'>('idle');
  const [regulationSeconds, setRegulationSeconds] = useState<number>(4);

  const fullTextRef = useRef<string>('');
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animación del sprite en el retrato (hablando mientras el texto avanza)
  useEffect(() => {
    const timer = setInterval(() => {
      setPortraitFrame((prev) => (prev + 1) % 4);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Pintar el retrato del NPC hablante y del jugador en sus canvas
  useEffect(() => {
    if (!currentNode) return;
    const speakerSkin = resolveSpeakerSkin(currentNode.speaker, skinConfig);
    if (portraitCanvasRef.current) {
      const col = isTyping ? portraitFrame : 0;
      SkinBuilder.renderPreviewFrame(portraitCanvasRef.current, speakerSkin, 2, col, 3);
    }
    if (playerPreviewCanvasRef.current) {
      SkinBuilder.renderPreviewFrame(playerPreviewCanvasRef.current, skinConfig, 2, 0, 2);
    }
  }, [currentNode, portraitFrame, isTyping, skinConfig, showOptions]);

  // Cargar nodo de historia activo
  useEffect(() => {
    if (activeModal !== 'DIALOGUE') return;
    const nodeId = activeStoryNodeId || 'scene_1_1_daily';
    const node = STORY_NODES[nodeId] || null;
    if (node) {
      setCurrentNode(node);
      setShowOptions(false);
      setSelectedIndex(0);
      setFeedback(null);

      const req = DialogueRunner.isSelfRegulationRequired(node);
      setNeedsSelfRegulation(req);
      setRegulationPhase('idle');

      const resolvedLine = DialogueRunner.getSpeakerLine(node);
      fullTextRef.current = resolvedLine;
      startTypewriter(resolvedLine);
    }
  }, [activeModal, activeStoryNodeId]);

  const startTypewriter = (text: string) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setDisplayedText('');
    setIsTyping(true);
    let idx = 0;

    typingTimerRef.current = setInterval(() => {
      idx++;
      setDisplayedText(text.slice(0, idx));
      if (idx % 3 === 0) {
        AudioManager.playKeyClack();
      }
      if (idx >= text.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
        setShowOptions(true);
      }
    }, 18);
  };

  const skipTypewriter = useCallback(() => {
    if (isTyping) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(fullTextRef.current);
      setIsTyping(false);
      setShowOptions(true);
    }
  }, [isTyping]);

  const handleStartRegulation = () => {
    AudioManager.playKeyClack();
    setRegulationPhase('inhale');
    setRegulationSeconds(4);

    const timer = setInterval(() => {
      setRegulationSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRegulationPhase('hold');
          setRegulationSeconds(4);
          const holdTimer = setInterval(() => {
            setRegulationSeconds((hPrev) => {
              if (hPrev <= 1) {
                clearInterval(holdTimer);
                setRegulationPhase('exhale');
                setRegulationSeconds(4);
                const exhaleTimer = setInterval(() => {
                  setRegulationSeconds((ePrev) => {
                    if (ePrev <= 1) {
                      clearInterval(exhaleTimer);
                      setRegulationPhase('done');
                      updateIE(10);
                      AudioManager.playNotificationPing();
                      setNeedsSelfRegulation(false);
                      return 0;
                    }
                    return ePrev - 1;
                  });
                }, 1000);
                return 0;
              }
              return hPrev - 1;
            });
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelectOption = useCallback(
    (option: DialogueOption) => {
      if (!currentNode) return;
      AudioManager.playNotificationPing();
      const result = DialogueRunner.executeOption(currentNode.id, option);
      setFeedback(result);
      setShowOptions(false);
      SaveManager.autoSave();
    },
    [currentNode]
  );

  const handleAdvanceConsequence = useCallback(() => {
    AudioManager.playKeyClack();
    if (!feedback) return;
    if (feedback.nextNodeId) {
      setActiveStoryNode(feedback.nextNodeId);
    } else {
      closeModal();
      setActiveStoryNode(null);
    }
  }, [feedback, setActiveStoryNode, closeModal]);

  // Navegación por teclado estilo Pasapalabra / Arcade (Flechas Izq/Der/Arr/Aba + Enter/Espacio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== 'DIALOGUE' || !currentNode) return;

      if (e.key === 'Escape') {
        closeModal();
        return;
      }

      if (isTyping && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        skipTypewriter();
        return;
      }

      if (feedback && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        handleAdvanceConsequence();
        return;
      }

      if (showOptions && !feedback && !needsSelfRegulation) {
        const total = currentNode.options.length;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'd' || e.key === 's') {
          e.preventDefault();
          AudioManager.playKeyClack();
          setSelectedIndex((prev) => (prev + 1) % total);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'a' || e.key === 'w') {
          e.preventDefault();
          AudioManager.playKeyClack();
          setSelectedIndex((prev) => (prev - 1 + total) % total);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelectOption(currentNode.options[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeModal,
    currentNode,
    isTyping,
    showOptions,
    feedback,
    needsSelfRegulation,
    selectedIndex,
    skipTypewriter,
    handleSelectOption,
    handleAdvanceConsequence,
    closeModal,
  ]);

  if (activeModal !== 'DIALOGUE' || !currentNode) return null;

  const activeOption = currentNode.options[selectedIndex] || currentNode.options[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-4 md:p-6 bg-slate-950/75 select-none overflow-y-auto">
      {/* PARTE 1 (ARRIBA): RETRATO CON SKIN DEL NPC + BOCADILLO DE DIÁLOGO */}
      <div className="max-w-3xl w-full mx-auto mt-2 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative rpg-box-dark p-1.5 bg-[#262b44]">
            <canvas
              ref={portraitCanvasRef}
              className="w-20 h-20 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            {isTyping && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-black animate-bounce" />
            )}
          </div>

          <div className="rpg-box-dark px-4 py-2">
            <span className="font-arcade text-xs md:text-sm text-amber-300 block">
              {currentNode.speaker}
            </span>
            <span className="font-dialogue text-base text-slate-300 block">
              {currentNode.speakerRole}
            </span>
          </div>
        </div>

        <div
          onClick={skipTypewriter}
          className="relative w-full rpg-box-cream p-5 md:p-6 cursor-pointer"
        >
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: '12px solid #2b2118',
            }}
          />
          <div
            className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '9px solid #f4eed7',
            }}
          />

          <p className="font-dialogue text-2xl md:text-3xl text-stone-950 leading-snug min-h-[72px]">
            {displayedText}
            {isTyping && <span className="inline-block w-3 h-6 bg-stone-900 ml-1 animate-pulse" />}
          </p>

          {!isTyping && currentNode.internalThought && !feedback && (
            <div className="mt-3 pt-2.5 border-t-2 border-dashed border-[#b8ab8e] flex items-center gap-2 text-stone-700">
              <span className="font-arcade text-[9px] bg-[#2b2118] text-[#f4eed7] px-2 py-0.5 shrink-0">
                INTUICIÓN
              </span>
              <p className="font-dialogue text-lg italic leading-tight">
                "{currentNode.internalThought}"
              </p>
            </div>
          )}

          {isTyping && (
            <div className="text-right mt-2">
              <span className="font-arcade text-[8px] text-stone-600 animate-pulse">
                [ESPACIO] SALTAR ANIMACIÓN ▶▶
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PARTE 2 (ABAJO): ROSCO / RULETA RETRO "PASAPALABRA" CON FLECHAS */}
      <div className="max-w-3xl w-full mx-auto mb-2 mt-4">
        {needsSelfRegulation && !isTyping && (
          <div className="rpg-box-dark p-5 text-center space-y-3 border-rose-500">
            <div className="font-arcade text-xs text-rose-400">
              ⚠️ ¡PULSO ACELERADO! AUTORREGULACIÓN EMOCIONAL REQUERIDA
            </div>
            <p className="font-dialogue text-xl text-slate-200 max-w-lg mx-auto">
              La tensión en la sala es máxima. Respira hondo antes de contestar para no perder los papeles.
            </p>
            {regulationPhase === 'idle' && (
              <button
                onClick={handleStartRegulation}
                className="rpg-btn px-5 py-2.5 font-arcade text-[10px] cursor-pointer"
              >
                RESPIRACIÓN CUADRADA (12S)
              </button>
            )}
            {regulationPhase === 'inhale' && (
              <div className="font-arcade text-sm text-sky-300 animate-pulse">
                🌬️ INHALA... {regulationSeconds}S
              </div>
            )}
            {regulationPhase === 'hold' && (
              <div className="font-arcade text-sm text-amber-300 animate-pulse">
                ⏸️ MANTÉN EL AIRE... {regulationSeconds}S
              </div>
            )}
            {regulationPhase === 'exhale' && (
              <div className="font-arcade text-sm text-emerald-300 animate-pulse">
                🍃 EXHALA DESPACIO... {regulationSeconds}S
              </div>
            )}
          </div>
        )}

        {showOptions && !feedback && !needsSelfRegulation && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <button
                onClick={() => {
                  AudioManager.playKeyClack();
                  setSelectedIndex((prev) => (prev - 1 + currentNode.options.length) % currentNode.options.length);
                }}
                className="rpg-btn px-3 py-2 font-arcade text-xs cursor-pointer"
                title="Opción anterior (Flecha Izquierda)"
              >
                ◀
              </button>

              <div className="flex items-center gap-4">
                {currentNode.options.map((opt, idx) => {
                  const isSelected = idx === selectedIndex;
                  const letter = OPTION_LETTERS[idx] || String(idx + 1);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        AudioManager.playKeyClack();
                        setSelectedIndex(idx);
                      }}
                      className={`relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-arcade text-sm md:text-base transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 border-white -translate-y-2 shadow-[0_6px_0_0_#000000] scale-110'
                          : 'bg-[#1e293b] text-slate-400 border-slate-500 hover:text-white shadow-[0_3px_0_0_#000000]'
                      }`}
                    >
                      {letter}
                      {isSelected && (
                        <span className="absolute -top-4 font-arcade text-[9px] text-amber-300 animate-bounce">
                          ▼
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  AudioManager.playKeyClack();
                  setSelectedIndex((prev) => (prev + 1) % currentNode.options.length);
                }}
                className="rpg-btn px-3 py-2 font-arcade text-xs cursor-pointer"
                title="Siguiente opción (Flecha Derecha)"
              >
                ▶
              </button>
            </div>

            <div className="rpg-box-dark p-5 md:p-6 relative">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex flex-col items-center shrink-0 bg-slate-900 border-2 border-slate-600 p-2">
                  <canvas
                    ref={playerPreviewCanvasRef}
                    className="w-12 h-12 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="font-arcade text-[8px] text-emerald-400 mt-1">TÚ</span>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-arcade text-[10px] text-amber-400">
                      OPCIÓN [{OPTION_LETTERS[selectedIndex]}] — TU RESPUESTA:
                    </span>
                    <span className="font-arcade text-[8px] text-slate-400">
                      {selectedIndex + 1} DE {currentNode.options.length}
                    </span>
                  </div>

                  <p className="font-dialogue text-2xl md:text-3xl text-white leading-snug min-h-[64px]">
                    {activeOption.label}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <span className="font-arcade text-[8px] md:text-[9px] text-slate-400">
                  🕹️ USA [⬅️ / ➡️] PARA GIRAR EL ROSCO
                </span>

                <button
                  onClick={() => handleSelectOption(activeOption)}
                  className="rpg-btn px-5 py-2 font-arcade text-[10px] bg-emerald-400 hover:bg-emerald-300 text-stone-950 cursor-pointer"
                >
                  [ENTER / ESPACIO] RESPONDER ▶
                </button>
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div className="rpg-box-dark p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b-2 border-slate-700 pb-2">
              <span className="font-arcade text-xs text-amber-400">
                ⚡ REACCIÓN EN LA OFICINA
              </span>
            </div>

            <p className="font-dialogue text-2xl md:text-3xl text-slate-100 leading-snug">
              {feedback.consequenceText}
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleAdvanceConsequence}
                className="rpg-btn px-6 py-2.5 font-arcade text-[10px] bg-amber-300 hover:bg-amber-200 cursor-pointer"
              >
                {feedback.nextNodeId ? '[ESPACIO] CONTINUAR ▶' : '[ESPACIO] VOLVER A LA OFICINA ▶'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};